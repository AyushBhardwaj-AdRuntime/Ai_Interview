/**
 * services/readinessScore.js
 *
 * Deterministic readiness scoring formula.
 *
 * The ONLY place in the codebase that calculates a readiness score.
 * The LLM never touches this number.
 *
 * FORMULA:
 *   Readiness = (
 *     skillCoverage       × 0.35   // What % of required skills are evidenced?
 *     + evidenceStrength  × 0.30   // How strong is the evidence on average?
 *     + interviewScore    × 0.25   // How well did they perform in the interview?
 *     + criticalCoverage  × 0.10   // Are the most important skills covered?
 *   )
 *
 * WHY THESE WEIGHTS?
 *   - Skill coverage (35%) is the most important signal. If you can't do the job's
 *     required skills, no amount of interview polish saves you.
 *   - Evidence strength (30%) rewards candidates who can back up claims with code.
 *     This is the differentiating factor vs. a simple ATS score.
 *   - Interview performance (25%) validates claims through real conversation.
 *   - Critical skill coverage (10%) is a bonus modifier that ensures must-have
 *     skills are never buried in the average.
 *
 * BEFORE INTERVIEW:
 *   Call calculate() with interviewEvaluations = null.
 *   The formula uses only skill + evidence dimensions (scaled to 60%).
 *   This is shown on the "preliminary" candidate report.
 *
 * AFTER INTERVIEW:
 *   Call calculate() with interviewEvaluations populated.
 *   Full 4-dimension score.
 */

/**
 * Calculate the readiness score.
 *
 * @param {object} params
 * @param {object} params.gapResult         - Output of gapAnalysis.analyzeGaps()
 * @param {Array}  params.evidenceClaims    - Output of evidenceEngine.classifyEvidence().claims
 * @param {object|null} params.interviewEvaluations - Output of batch LLM evaluation, or null if pre-interview
 *
 * @returns {object} {
 *   total:      number (0–100),
 *   preliminary: boolean,  // true if calculated before interview
 *   dimensions: {
 *     skillCoverage:      number (0–100),
 *     evidenceStrength:   number (0–100),
 *     interviewScore:     number (0–100) | null,
 *     criticalCoverage:   number (0–100),
 *   },
 *   explanation: {
 *     skillCoverage:    string,
 *     evidenceStrength: string,
 *     interviewScore:   string | null,
 *     criticalCoverage: string,
 *   }
 * }
 */
function calculate({ gapResult, evidenceClaims, interviewEvaluations = null }) {
  if (!gapResult || !Array.isArray(evidenceClaims)) {
    throw new Error("[ReadinessScore] gapResult and evidenceClaims are required.");
  }

  const preliminary = !interviewEvaluations;

  // ── Dimension 1: Skill Coverage ──────────────────────────────────────────────
  // What % of required skills are evidenced (SUPPORTED or PARTIALLY)?
  const {
    totalRequiredSkills,
    matchedRequiredSkills,
    criticalGapCount,
  } = gapResult.coverageSummary;

  const rawSkillCoverage =
    totalRequiredSkills > 0
      ? matchedRequiredSkills / totalRequiredSkills
      : 1.0; // if no required skills listed, full coverage by default

  const skillCoverage = Math.round(rawSkillCoverage * 100);

  const skillCoverageExplanation =
    totalRequiredSkills === 0
      ? "No specific required skills listed in job description."
      : `${matchedRequiredSkills} of ${totalRequiredSkills} required skills have evidence.`;

  // ── Dimension 2: Evidence Strength ───────────────────────────────────────────
  // Average evidence strength across ALL claims (not just required skills).
  // A candidate with strong GitHub evidence for many skills scores higher.
  const strengthValues = evidenceClaims
    .filter((c) => c.evidenceStrength > 0)
    .map((c) => c.evidenceStrength);

  const rawEvidenceStrength =
    strengthValues.length > 0
      ? strengthValues.reduce((sum, s) => sum + s, 0) / strengthValues.length
      : 0;

  // Scale: evidenceStrength of 0.95 (package.json) → 100, 0 → 0
  const evidenceStrength = Math.round(rawEvidenceStrength * 100);

  const evidencedCount = evidenceClaims.filter(
    (c) => c.status === "SUPPORTED" || c.status === "PARTIALLY"
  ).length;

  const evidenceStrengthExplanation =
    evidenceClaims.length === 0
      ? "No claims to evaluate."
      : `${evidencedCount} of ${evidenceClaims.length} claims have GitHub evidence. Average strength: ${evidenceStrength}%.`;

  // ── Dimension 3: Interview Performance ───────────────────────────────────────
  let interviewScore = null;
  let interviewExplanation = null;

  if (!preliminary && interviewEvaluations) {
    // interviewEvaluations shape:
    // { interviewPerformance: { technical: 0-100, communication: 0-100, depth: 0-100 },
    //   claimVerifications: [{ score: 0-10 }] }

    const perf = interviewEvaluations.interviewPerformance || {};
    const technical     = typeof perf.technical     === "number" ? perf.technical     : 50;
    const communication = typeof perf.communication === "number" ? perf.communication : 50;
    const depth         = typeof perf.depth         === "number" ? perf.depth         : 50;

    // Weighted: technical matters most for an engineering role
    interviewScore = Math.round(technical * 0.50 + communication * 0.25 + depth * 0.25);

    const verifications = interviewEvaluations.claimVerifications || [];
    const verified = verifications.filter((v) => v.answerQuality >= 6).length;

    interviewExplanation =
      `Interview score: ${interviewScore}/100. ` +
      `${verified} of ${verifications.length} targeted claims adequately demonstrated.`;
  }

  // ── Dimension 4: Critical Skill Coverage ─────────────────────────────────────
  // Are the most critical (required) skills evidenced?
  // This ensures a candidate with one critical gap doesn't get a misleadingly high score.
  const totalCritical = (gapResult.criticalGaps || []).length;
  const totalRequired = totalRequiredSkills;

  // Critical coverage = how many required skills are NOT in criticalGaps
  // (i.e., required skills that DO have at least some presence in the candidate profile)
  const criticalMissed = totalCritical;
  const criticalCovered = Math.max(0, totalRequired - criticalMissed);

  const rawCriticalCoverage =
    totalRequired > 0 ? criticalCovered / totalRequired : 1.0;

  const criticalCoverage = Math.round(rawCriticalCoverage * 100);

  const criticalCoverageExplanation =
    totalCritical === 0
      ? "No critical skill gaps identified."
      : `${totalCritical} required skill(s) completely absent from candidate profile: ` +
        gapResult.criticalGaps.slice(0, 3).map((g) => g.skill).join(", ") +
        (totalCritical > 3 ? ` +${totalCritical - 3} more` : "");

  // ── Final Score ───────────────────────────────────────────────────────────────
  let total;

  if (preliminary) {
    // Pre-interview: scale skill+evidence+critical to 0-100 without interview dimension
    // Weights normalized to sum to 1.0: 0.35 + 0.30 + 0.10 = 0.75 → normalize
    total = Math.round(
      (skillCoverage * 0.35 + evidenceStrength * 0.30 + criticalCoverage * 0.10) / 0.75
    );
  } else {
    total = Math.round(
      skillCoverage    * 0.35 +
      evidenceStrength * 0.30 +
      interviewScore   * 0.25 +
      criticalCoverage * 0.10
    );
  }

  // Clamp to 0–100
  total = Math.max(0, Math.min(100, total));

  const result = {
    total,
    preliminary,
    dimensions: {
      skillCoverage,
      evidenceStrength,
      interviewScore,
      criticalCoverage,
    },
    explanation: {
      skillCoverage:    skillCoverageExplanation,
      evidenceStrength: evidenceStrengthExplanation,
      interviewScore:   interviewExplanation,
      criticalCoverage: criticalCoverageExplanation,
    },
  };

  console.log(
    `[ReadinessScore] ${preliminary ? "Preliminary" : "Final"} score: ${total}`,
    result.dimensions
  );

  return result;
}

/**
 * Convert a numeric score to a confidence label.
 * Used in the candidate report.
 * @param {number} score
 * @returns {string}
 */
function scoreToConfidence(score) {
  if (score >= 80) return "Strong";
  if (score >= 65) return "Moderate";
  if (score >= 45) return "Limited";
  return "Needs Work";
}

/**
 * Convert a numeric score to a hiring recommendation.
 * Used in the hiring report.
 * @param {number} score
 * @param {number} criticalGapCount
 * @returns {string}
 */
function scoreToRecommendation(score, criticalGapCount = 0) {
  if (criticalGapCount > 2) return "Not Recommended";
  if (score >= 80 && criticalGapCount === 0) return "Strong Hire";
  if (score >= 70) return "Hire";
  if (score >= 55) return "Interview Recommended";
  if (score >= 40) return "Borderline";
  return "Not Recommended";
}

module.exports = { calculate, scoreToConfidence, scoreToRecommendation };
