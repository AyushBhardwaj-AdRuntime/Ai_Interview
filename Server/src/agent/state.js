/**
 * agent/state.js
 *
 * Runtime state management for the agent orchestrator.
 *
 * ─────────────────────────────────────────────────────────────────────
 * WHAT THIS FILE DOES
 * ─────────────────────────────────────────────────────────────────────
 * Three jobs:
 *   1. CREATE     — build a fresh state object at the start of a run
 *   2. UPDATE     — apply a tool result to the state (the ONLY place this happens)
 *   3. SUMMARIZE  — produce a lean snapshot to send to the LLM each step
 *
 * ─────────────────────────────────────────────────────────────────────
 * WHY RUNTIME STATE IS SEPARATE FROM MONGODB
 * ─────────────────────────────────────────────────────────────────────
 * The orchestrator works with a plain JS object in memory — fast, no await.
 * MongoDB is only hit at checkpoints (after evidence, after interview, after reports).
 * This file handles the in-memory object. The orchestrator handles MongoDB saves.
 *
 * ─────────────────────────────────────────────────────────────────────
 * THE MOST IMPORTANT RULE
 * ─────────────────────────────────────────────────────────────────────
 * The LLM never mutates state.
 * The LLM returns a decision (tool_call or final).
 * The orchestrator calls applyToolResult() — the only mutation point.
 *
 * This keeps state predictable and debuggable.
 * ─────────────────────────────────────────────────────────────────────
 */

// ── State Factory ─────────────────────────────────────────────────────────────

/**
 * Creates the initial in-memory state for a new assessment run.
 *
 * @param {object} options
 * @param {string} options.assessmentId  - MongoDB Assessment._id (created before agent starts)
 * @param {string} options.userId        - Clerk userId
 * @param {string} options.jobRawText    - Raw job description text
 * @param {string} [options.githubUrl]   - Optional GitHub URL
 * @param {string} [options.resumeId]    - If resume already exists in DB, pass its _id
 * @param {number} [options.maxSteps=12] - Safety limit on agent loop iterations
 *
 * @returns {object} Initial agent state
 */
function createInitialState({
  assessmentId,
  userId,
  jobRawText,
  githubUrl = null,
  resumeId = null,
  maxSteps = 12,
}) {
  return {
    // ── Identity ─────────────────────────────────────────────────────────
    assessmentId, // MongoDB _id — used when saving checkpoints
    userId,

    // ── Resume ───────────────────────────────────────────────────────────
    // If resumeId is provided, the parse_resume tool can skip PDF parsing
    // and load directly from MongoDB. Otherwise it will parse from text/file.
    resume: {
      resumeId: resumeId || null, // existing MongoDB Resume._id if available
      parsed: !!resumeId,          // if we already have it, mark as parsed
      profile: null,               // populated by parse_resume tool
      // profile shape (after parsing):
      // {
      //   name, email, phone, skills[], experience[], projects[],
      //   claims: [{ claim, skill, category }]
      // }
    },

    // ── Job ──────────────────────────────────────────────────────────────
    job: {
      rawText: jobRawText,
      parsed: false,
      profile: null,
      // profile shape (after parsing):
      // {
      //   title, seniority, requiredSkills[], preferredSkills[],
      //   responsibilities[], requirements[]
      // }
    },

    // ── GitHub ───────────────────────────────────────────────────────────
    github: {
      available: !!githubUrl,      // we know immediately if URL was provided
      url: githubUrl,
      analyzed: false,
      repositories: [],            // raw repo list from GitHub API
      techEvidence: [],
      // techEvidence shape (after analysis):
      // [{ skill, found: bool, repoName, description, relevance: 0.0-1.0 }]
    },

    // ── Evidence Classification ───────────────────────────────────────────
    // This is the OUTPUT of the evidence engine — the core of the product.
    // Every claim from the resume gets classified here.
    evidence: {
      classified: false,
      claims: [],
      // claims shape (after classify_evidence):
      // [{
      //   claim, skill, category,
      //   sources: [{ type: "resume"|"github"|"interview", found, detail, relevance }],
      //   status: "CLAIMED"|"SUPPORTED"|"PARTIALLY"|"UNVERIFIED"|"CONTRADICTED",
      //   confidence: 0.0-1.0,
      //   evidenceStrength: 0.0-1.0
      // }]
      coveragePercent: null, // percentage of claims that are SUPPORTED or PARTIALLY
    },

    // ── Gap Analysis ──────────────────────────────────────────────────────
    // Cross-reference: job requirements vs candidate evidence.
    gaps: {
      identified: false,
      matchedSkills: [],     // required skills with SUPPORTED or PARTIALLY evidence
      skillGaps: [],         // required skills with no/weak evidence in candidate profile
      criticalGaps: [],      // required skills that are completely absent (CLAIMED or UNVERIFIED)
      unverifiedClaims: [],  // candidate claims that are UNVERIFIED or CLAIMED only
      // unverifiedClaims items: { claim, skill, status, priority }
    },

    // ── Interview ─────────────────────────────────────────────────────────
    // Questions are generated FROM unverified claims — not from a generic bank.
    interview: {
      started: false,
      completed: false,
      questions: [],
      // question shape: { id, skill, claim, question, type: "gap"|"unverified_claim" }
      answers: [],
      // answer shape: { questionId, answer, submittedAt }
      evaluations: [],
      // evaluation shape: { questionId, score, technicalCorrectness, depth, strengths[], weaknesses[], explanation }
    },

    // ── Final Reports ─────────────────────────────────────────────────────
    reports: {
      generated: false,
      candidateReport: null, // see architecture.md section 10 for shape
      hiringReport: null,    // see architecture.md section 11 for shape
    },

    // ── Agent Control ─────────────────────────────────────────────────────
    status: "initialized", // matches assessment.model.js status enum
    error: null,

    agent: {
      stepCount: 0,
      maxSteps,
      // toolCallHistory is for observability only — NOT sent to LLM.
      // It's too large to put in the LLM context. The LLM gets getStateSummary() instead.
      toolCallHistory: [],
      // [{ step, tool, args (sanitized), success, resultSummary, timestamp }]
    },
  };
}

// ── State Updater ─────────────────────────────────────────────────────────────

/**
 * Applies a tool result to the state.
 *
 * This is the ONLY place state is mutated from tool results.
 * Every new tool you add must have a case here.
 *
 * WHY A SWITCH STATEMENT?
 *   It makes data flow explicit. You can read this function and know
 *   exactly what each tool changes in the state. No magic, no guessing.
 *
 * @param {object} state     - Current state (mutated in-place)
 * @param {string} toolName  - Which tool just ran
 * @param {object} args      - The arguments the tool was called with
 * @param {object} result    - The structured output from the tool
 * @returns {object}         - The same state object (mutated)
 */
function applyToolResult(state, toolName, args, result) {
  // Always record the call in history (for debugging and observability logs)
  state.agent.toolCallHistory.push({
    step: state.agent.stepCount,
    tool: toolName,
    args: sanitizeArgs(args),         // strip any sensitive data before logging
    success: !result.error,
    resultSummary: summarizeResult(toolName, result),
    timestamp: new Date().toISOString(),
  });

  // If the tool returned an error, log but don't crash — orchestrator handles recovery
  if (result.error) {
    console.warn(`[STATE] Tool "${toolName}" returned error: ${result.error}`);
    return state;
  }

  switch (toolName) {

    // ── parse_resume ──────────────────────────────────────────────────────
    // Tool extracts structured profile + claims from resume text
    // result.profile shape: { name, email, skills[], projects[], experience[], claims[] }
    case "parse_resume":
      state.resume.parsed = true;
      state.resume.profile = result.profile;
      // If the tool also saved to MongoDB and returned a resumeId, record it
      if (result.resumeId) {
        state.resume.resumeId = result.resumeId;
      }
      break;

    // ── parse_job ─────────────────────────────────────────────────────────
    // Tool extracts structured requirements from JD text
    case "parse_job":
      state.job.parsed = true;
      state.job.profile = result.profile;
      break;

    // ── discover_github ───────────────────────────────────────────────────
    // PREREQUISITE stage: get repo list + language breakdown
    // result shape: { username, repositories: [{ name, language, topics, ... }] }
    case "discover_github":
      state.github.username = result.username || null;
      state.github.repositories = result.repositories || [];
      // If GitHub was unavailable (private/not found), mark it clearly
      if (result.unavailable) {
        state.github.available = false;
      }
      break;

    // ── inspect_github_repo ───────────────────────────────────────────────
    // INVESTIGATE stage: LLM calls this for repos it deems relevant
    // Accumulate inspections — one call per repo, multiple calls total
    case "inspect_github_repo":
      if (!state.github.inspections) state.github.inspections = [];
      state.github.inspections.push(result.inspection);
      break;

    // ── analyze_evidence ─────────────────────────────────────────────────
    // Called after investigation is complete — classifies all claims
    // result shape: { claims: EvidenceClaim[], coveragePercent, summary }
    case "analyze_evidence":
      state.evidence.classified = true;
      state.evidence.claims = result.claims || [];
      state.evidence.coveragePercent = result.coveragePercent || 0;
      state.evidence.summary = result.summary || {};
      break;

    // ── identify_gaps ─────────────────────────────────────────────────────
    // result shape: output of gapAnalysis.analyzeGaps()
    case "identify_gaps":
      state.gaps.identified = true;
      state.gaps.matchedSkills    = result.matchedSkills    || [];
      state.gaps.skillGaps        = result.skillGaps        || [];
      state.gaps.criticalGaps     = result.criticalGaps     || [];
      state.gaps.unverifiedClaims = result.unverifiedClaims || [];
      state.gaps.preferredMissing = result.preferredMissing || [];
      state.gaps.coverageSummary  = result.coverageSummary  || {};
      break;

    // ── synthesize_verification_context ──────────────────────────────────
    // LLM synthesizes what to target in the interview
    // result shape: { targetClaims[], criticalGaps[], verifiedStrengths[], evidenceSummary }
    case "synthesize_verification_context":
      state.verificationContext = result.verificationContext;
      break;

    // ── interview_linked ─────────────────────────────────────────────────
    // Orchestrator records that an Interview doc was created and linked
    // result shape: { interviewId }
    case "interview_linked":
      state.interview.interviewId = result.interviewId;
      state.interview.started = true;
      state.status = "awaiting_interview";
      break;

    // ── interview_completed ───────────────────────────────────────────────
    // Triggered when the existing interview system finishes
    // result shape: { questions: [{ question, answer }] }
    case "interview_completed":
      state.interview.completed = true;
      state.interview.qaTranscript = result.questions || [];
      state.status = "evaluating";
      break;

    // ── batch_evaluation ──────────────────────────────────────────────────
    // ONE batch LLM call result after interview completion
    // result shape: { claimVerifications[], interviewPerformance{} }
    case "batch_evaluation":
      state.interview.evaluations = result.claimVerifications || [];
      state.interview.interviewPerformance = result.interviewPerformance || {};
      break;

    // ── generate_reports ──────────────────────────────────────────────────
    // Tool produces both final reports from the full state
    case "generate_reports":
      state.reports.generated = true;
      state.reports.candidateReport = result.candidateReport;
      state.reports.hiringReport = result.hiringReport;
      state.status = "completed";
      break;

    default:
      // Unknown tool — log clearly but don't crash
      console.warn(`[STATE] applyToolResult: unknown tool "${toolName}" — no state update applied`);
  }

  return state;
}

// ── State Summary (sent to LLM each step) ────────────────────────────────────

/**
 * Returns a LEAN snapshot of the state for the LLM prompt.
 *
 * WHY NOT SEND THE FULL STATE?
 *   The full state can be large (GitHub repos, all evidence claims, etc.)
 *   LLMs have context window limits. Sending less = cheaper + more reliable.
 *   The LLM only needs to know WHAT HAS BEEN DONE and WHAT IS MISSING.
 *   It does NOT need the raw data — only the status flags.
 *
 * @param {object} state
 * @returns {object} Prompt-safe state summary
 */
function getStateSummary(state) {
  return {
    // ── What we know about the candidate ─────────────────────────────────
    candidateName: state.resume.profile?.name ?? null,
    resumeParsed: state.resume.parsed,
    candidateSkillCount: state.resume.profile?.skills?.length ?? 0,
    candidateClaimsCount: state.resume.profile?.claims?.length ?? 0,

    // ── What we know about the job ────────────────────────────────────────
    jobParsed: state.job.parsed,
    jobTitle: state.job.profile?.title ?? null,
    requiredSkillCount: state.job.profile?.requiredSkills?.length ?? 0,

    // ── GitHub investigation ───────────────────────────────────────────────
    githubAvailable: state.github.available,
    githubAnalyzed: state.github.analyzed,
    githubRepoCount: state.github.repositories?.length ?? 0,

    // ── Evidence classification ────────────────────────────────────────────
    evidenceClassified: state.evidence.classified,
    evidenceCoveragePercent: state.evidence.coveragePercent,
    // Give the LLM a count breakdown — enough to decide what to do next
    claimsByStatus: state.evidence.classified
      ? summarizeClaimsByStatus(state.evidence.claims)
      : null,

    // ── Gap analysis ───────────────────────────────────────────────────────
    gapsIdentified: state.gaps.identified,
    skillGapCount: state.gaps.skillGaps?.length ?? 0,
    criticalGapCount: state.gaps.criticalGaps?.length ?? 0,
    // Surface the unverified claims so the LLM can decide which to target
    unverifiedClaims: state.gaps.unverifiedClaims?.slice(0, 5) ?? [], // top 5 only

    // ── Interview progress ─────────────────────────────────────────────────
    interviewStarted: state.interview.started,
    interviewCompleted: state.interview.completed,
    questionsAsked: state.interview.questions.length,
    answersReceived: state.interview.answers.length,
    evaluationsCompleted: state.interview.evaluations.length,

    // ── Reports ────────────────────────────────────────────────────────────
    reportsGenerated: state.reports.generated,

    // ── Agent control ─────────────────────────────────────────────────────
    step: state.agent.stepCount,
    maxSteps: state.agent.maxSteps,
    stepsRemaining: state.agent.maxSteps - state.agent.stepCount,
    status: state.status,
  };
}

// ── Checkpoint Saver ──────────────────────────────────────────────────────────

/**
 * Determines if the current state should be saved to MongoDB.
 *
 * We save at KEY CHECKPOINTS — not every step.
 * This keeps MongoDB writes minimal without losing important progress.
 *
 * @param {object} state
 * @param {string} toolName - The tool that just ran
 * @returns {boolean}
 */
function shouldSaveCheckpoint(state, toolName) {
  const checkpointTools = [
    "analyze_evidence",            // evidence classification complete
    "identify_gaps",               // gap analysis complete
    "synthesize_verification_context", // verification context ready
    "interview_linked",            // interview created and linked
    "interview_completed",         // interview Q&A available
    "batch_evaluation",            // evaluation done — pre-report save
    "generate_reports",            // final reports done
  ];
  return checkpointTools.includes(toolName);
}

/**
 * Builds the MongoDB update payload from the current state.
 * Only fields that have changed (and are worth persisting) are included.
 *
 * @param {object} state
 * @returns {object} MongoDB $set payload
 */
function buildMongoUpdate(state) {
  const update = {
    status: state.status,
    stepsUsed: state.agent.stepCount,
    agentState: state, // full snapshot for resumability
  };

  // Only include specific fields if they've been populated
  if (state.evidence.classified) {
    update.evidenceClaims = state.evidence.claims;
    update.evidenceCoveragePercent = state.evidence.coveragePercent;
  }

  if (state.reports.generated) {
    update.candidateReport = state.reports.candidateReport;
    update.hiringReport = state.reports.hiringReport;
    update.readinessScore = state.reports.candidateReport?.readinessScore ?? null;
    update.evidenceCoveragePercent = state.evidence.coveragePercent;
    update.completedAt = new Date();
  }

  return { $set: update };
}

// ── Private Helpers ───────────────────────────────────────────────────────────

/**
 * Counts evidence claims by status — for the LLM summary.
 * @param {Array} claims
 * @returns {object} e.g. { SUPPORTED: 3, UNVERIFIED: 2, CLAIMED: 1 }
 */
function summarizeClaimsByStatus(claims) {
  return claims.reduce((acc, c) => {
    acc[c.status] = (acc[c.status] || 0) + 1;
    return acc;
  }, {});
}

/**
 * Produces a short human-readable summary of a tool result for the log.
 * @param {string} toolName
 * @param {object} result
 * @returns {string}
 */
function summarizeResult(toolName, result) {
  if (result.error) return `ERROR: ${result.error}`;
  switch (toolName) {
    case "parse_resume":     return `Parsed: ${result.profile?.name}, ${result.profile?.skills?.length} skills`;
    case "parse_job":        return `Parsed: ${result.profile?.title}, ${result.profile?.requiredSkills?.length} required, ${result.profile?.preferredSkills?.length} preferred`;
    case "discover_github":  return `Discovered ${result.repositories?.length ?? 0} repos for ${result.username}`;
    case "inspect_github_repo": return `Inspected: ${result.inspection?.name} — ${result.inspection?.inspectionNotes?.join(" | ").slice(0, 80)}`;
    case "analyze_evidence": return `Classified ${result.claims?.length ?? 0} claims — coverage ${result.coveragePercent}%`;
    case "identify_gaps":    return `${result.skillGaps?.length ?? 0} gaps, ${result.criticalGaps?.length ?? 0} critical, ${result.unverifiedClaims?.length ?? 0} unverified`;
    case "synthesize_verification_context": return `Verification context ready — ${result.verificationContext?.targetClaims?.length ?? 0} target claims`;
    case "interview_linked": return `Interview linked: ${result.interviewId}`;
    case "interview_completed": return `Interview complete — ${result.questions?.length ?? 0} Q&A pairs`;
    case "batch_evaluation": return `Evaluation complete — technical: ${result.interviewPerformance?.technical ?? "?"}%`;
    case "generate_reports": return `Both reports generated. Readiness: ${result.candidateReport?.readinessScore ?? "?"}`;
    default:                 return JSON.stringify(result).slice(0, 80);
  }
}

/**
 * Remove sensitive data from args before storing in logs.
 * @param {object} args
 * @returns {object}
 */
function sanitizeArgs(args) {
  const safe = { ...args };
  // Never log raw file contents or full resume text in history
  if (safe.resumeText) safe.resumeText = `[${safe.resumeText.length} chars]`;
  if (safe.jobText)    safe.jobText    = `[${safe.jobText.length} chars]`;
  return safe;
}

// ── Exports ───────────────────────────────────────────────────────────────────
module.exports = {
  createInitialState,
  applyToolResult,
  getStateSummary,
  shouldSaveCheckpoint,
  buildMongoUpdate,
};
