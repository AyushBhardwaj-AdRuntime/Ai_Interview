/**
 * services/gapAnalysis.js
 *
 * Deterministic gap analysis — compares job requirements against candidate evidence.
 *
 * INPUT:
 *   jobProfile     — output of jobParser.parseJob()
 *   evidenceClaims — output of evidenceEngine.classifyEvidence().claims
 *
 * OUTPUT:
 *   {
 *     matchedSkills:    [],  // job requires it AND candidate has SUPPORTED/PARTIALLY evidence
 *     skillGaps:        [],  // job requires it AND candidate has UNVERIFIED/CLAIMED/missing
 *     criticalGaps:     [],  // job REQUIRES (not just preferred) it AND completely missing
 *     unverifiedClaims: [],  // candidate claimed it, but status is CLAIMED or UNVERIFIED
 *     preferredMissing: [],  // preferred by job, not evidenced (lower priority)
 *     coverageSummary:  {}   // stats
 *   }
 *
 * WHY DETERMINISTIC?
 *   Gap analysis is a set-theory problem: required skills vs evidenced skills.
 *   An LLM should not decide what is a "gap" — that must be consistent and auditable.
 *   The LLM's job is to REASON about gaps (which to target in interview) not DETECT them.
 */

const { normalizeSkill } = require("./evidenceEngine");

/**
 * Run gap analysis.
 *
 * @param {object} jobProfile      - from jobParser.parseJob()
 * @param {Array}  evidenceClaims  - from evidenceEngine.classifyEvidence().claims
 * @returns {object} Gap analysis result
 */
function analyzeGaps(jobProfile, evidenceClaims) {
  if (!Array.isArray(evidenceClaims)) {
    throw new Error("[GapAnalysis] evidenceClaims must be an array.");
  }
  
  if (!jobProfile) {
    console.warn("[GapAnalysis] jobProfile is null or missing, returning empty gap analysis.");
    return {
      matchedSkills: [],
      skillGaps: [],
      criticalGaps: [],
      unverifiedClaims: evidenceClaims.map(c => ({ 
        claim: c.claim, skill: c.skill, status: c.status, 
        requiredByJob: false, preferredByJob: false 
      })),
      preferredMissing: [],
      preferredMatched: [],
      coverageSummary: {
        totalRequiredSkills: 0,
        matchedRequiredSkills: 0,
        skillGapCount: 0,
        criticalGapCount: 0,
        unverifiedClaimCount: evidenceClaims.length,
        preferredMissingCount: 0,
        requiredCoveragePercent: 100,
      }
    };
  }

  // Build a lookup: normalized skill → best evidence claim
  // If a skill appears multiple times (e.g. from skills[] and projects[]), keep the best status
  const STATUS_RANK = { SUPPORTED: 5, PARTIALLY: 4, CLAIMED: 3, UNVERIFIED: 2, CONTRADICTED: 1 };

  const claimBySkill = {};
  for (const claim of evidenceClaims) {
    const skill = normalizeSkill(claim.skill);
    if (!claimBySkill[skill]) {
      claimBySkill[skill] = claim;
    } else {
      // Keep the higher-ranked status
      const existing = STATUS_RANK[claimBySkill[skill].status] || 0;
      const incoming = STATUS_RANK[claim.status] || 0;
      if (incoming > existing) {
        claimBySkill[skill] = claim;
      }
    }
  }

  // ── Helper: check if a skill is evidenced above a threshold ────────────────
  function isEvidenced(skill) {
    const normalized = normalizeSkill(skill);
    const claim = claimBySkill[normalized];
    if (!claim) return false;
    return claim.status === "SUPPORTED" || claim.status === "PARTIALLY";
  }

  function getEvidence(skill) {
    const normalized = normalizeSkill(skill);
    return claimBySkill[normalized] || null;
  }

  // ── Required skills analysis ────────────────────────────────────────────────
  const matchedSkills = [];
  const skillGaps     = [];
  const criticalGaps  = [];

  for (const skill of jobProfile.requiredSkills || []) {
    const normalized = normalizeSkill(skill);
    const evidence   = getEvidence(normalized);

    if (isEvidenced(normalized)) {
      matchedSkills.push({
        skill:           normalized,
        required:        true,
        evidenceStatus:  evidence.status,
        evidenceStrength: evidence.evidenceStrength,
        detail:          evidence.sources?.find(s => s.found)?.detail || "",
      });
    } else {
      const gap = {
        skill:          normalized,
        required:       true,
        candidateStatus: evidence ? evidence.status : "MISSING",
        // MISSING = not even mentioned in resume; CLAIMED/UNVERIFIED = mentioned but unproven
        isMissing:      !evidence,
      };

      skillGaps.push(gap);

      // Critical gap = required by job AND completely missing from candidate profile
      if (!evidence) {
        criticalGaps.push(gap);
      }
    }
  }

  // ── Preferred skills analysis ───────────────────────────────────────────────
  const preferredMissing = [];
  const preferredMatched = [];

  for (const skill of jobProfile.preferredSkills || []) {
    const normalized = normalizeSkill(skill);
    if (isEvidenced(normalized)) {
      preferredMatched.push({ skill: normalized, evidenceStatus: getEvidence(normalized)?.status });
    } else {
      preferredMissing.push({ skill: normalized, isMissing: !getEvidence(normalized) });
    }
  }

  // ── Unverified claims (candidate mentioned, but not proven) ─────────────────
  // These are what the interview should target.
  const unverifiedClaims = evidenceClaims
    .filter((c) => c.status === "UNVERIFIED" || c.status === "CLAIMED")
    .map((c) => ({
      claim:  c.claim,
      skill:  c.skill,
      status: c.status,
      // Priority = is this skill required by the job?
      requiredByJob: (jobProfile.requiredSkills || [])
        .map((s) => normalizeSkill(s))
        .includes(normalizeSkill(c.skill)),
      preferredByJob: (jobProfile.preferredSkills || [])
        .map((s) => normalizeSkill(s))
        .includes(normalizeSkill(c.skill)),
    }))
    // Sort: required + unverified first, then preferred, then rest
    .sort((a, b) => {
      const aScore = (a.requiredByJob ? 2 : 0) + (a.preferredByJob ? 1 : 0);
      const bScore = (b.requiredByJob ? 2 : 0) + (b.preferredByJob ? 1 : 0);
      return bScore - aScore;
    });

  // ── Coverage summary ────────────────────────────────────────────────────────
  const totalRequired  = (jobProfile.requiredSkills || []).length;
  const totalMatched   = matchedSkills.length;
  const coveragePercent = totalRequired > 0
    ? Math.round((totalMatched / totalRequired) * 100)
    : 100; // if job has no required skills listed, assume full coverage

  const summary = {
    totalRequiredSkills:  totalRequired,
    matchedRequiredSkills: totalMatched,
    skillGapCount:        skillGaps.length,
    criticalGapCount:     criticalGaps.length,
    unverifiedClaimCount: unverifiedClaims.length,
    preferredMissingCount: preferredMissing.length,
    requiredCoveragePercent: coveragePercent,
  };

  return {
    matchedSkills,
    skillGaps,
    criticalGaps,
    unverifiedClaims,
    preferredMissing,
    preferredMatched,
    coverageSummary: summary,
  };
}

module.exports = { analyzeGaps };
