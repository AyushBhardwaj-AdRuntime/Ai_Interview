/**
 * model/assessment.model.js
 *
 * MongoDB schema for a single agent assessment run.
 *
 * RELATIONSHIPS:
 *   Assessment → Resume    (resumeId)    one-to-one: which resume was assessed
 *   Assessment → Interview (interviewId) one-to-one: the existing interview this assessment triggered
 *   Assessment → User      (userId)      many-to-one: a user can have many assessments
 *
 * DESIGN:
 *   - agentState (Mixed) = in-progress snapshot for resumability — evolves freely
 *   - evidenceClaims (structured) = core engine output — queryable, not Mixed
 *   - candidateReport / hiringReport (Mixed) = final frontend read surface
 *   - interviewId is the single link to the entire existing interview system
 *     Q&A lives in Interview.interview.questions[], not duplicated here
 */

const mongoose = require("mongoose");

// ── Evidence Claim sub-schema ─────────────────────────────────────────────────
// Output of evidenceEngine.js — stored structured so we can filter by status.
const evidenceClaimSchema = new mongoose.Schema(
  {
    claim:    { type: String, required: true },
    skill:    { type: String, default: "" },
    category: { type: String, default: "" },

    sources: [
      {
        type: {
          type: String,
          enum: ["resume", "github", "interview"],
          required: true,
        },
        found:     { type: Boolean, default: false },
        detail:    { type: String,  default: "" },   // e.g. "repo: express-api — package.json has 'redis'"
        relevance: { type: Number,  default: 0 },    // 0.0–1.0
      },
    ],

    // Core classification — output of evidenceEngine.js (deterministic, not LLM)
    status: {
      type: String,
      enum: ["CLAIMED", "SUPPORTED", "PARTIALLY", "UNVERIFIED", "CONTRADICTED"],
      default: "CLAIMED",
    },

    confidence:      { type: Number, default: 0 }, // 0.0–1.0
    evidenceStrength: { type: Number, default: 0 }, // 0.0–1.0 weighted across sources
  },
  { _id: false }
);

// ── Main Assessment schema ────────────────────────────────────────────────────
const assessmentSchema = new mongoose.Schema(
  {
    // ── Ownership ──────────────────────────────────────────────────────────────
    userId: {
      type: String,
      required: true,
      index: true,
    },

    // ── Links to existing models ───────────────────────────────────────────────
    // Resume parsed for this assessment (can be shared with interview system)
    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resume",
      default: null,
    },

    // THE integration link to the existing interview system.
    // Q&A is stored in Interview.interview.questions[] — NOT duplicated here.
    // The agent reads Q&A from Interview after the interview completes.
    interviewId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Interview",
      default: null,
    },

    // ── Raw inputs (for auditability and re-runs) ──────────────────────────────
    jobRawText:  { type: String, default: "" },
    githubUrl:   { type: String, default: null },
    jobTitle:    { type: String, default: "" },

    // ── Agent run lifecycle ────────────────────────────────────────────────────
    status: {
      type: String,
      enum: [
        "initialized",        // Assessment created, prerequisites not yet run
        "prerequisites_done", // Resume + JD + GitHub discovery complete
        "investigating",      // LLM-driven evidence investigation in progress
        "awaiting_interview", // verificationContext set, waiting for interview to finish
        "evaluating",         // Interview complete, running batch evaluation
        "completed",          // Both reports ready
        "error",              // Unrecoverable failure
        "max_steps_reached",  // Agent hit step limit before completing
      ],
      default: "initialized",
    },

    stepsUsed:   { type: Number, default: 0 },
    startedAt:   { type: Date,   default: null },
    completedAt: { type: Date,   default: null },
    errorMessage: { type: String, default: null }, // populated on status="error"

    // ── Denormalized key metrics (for fast dashboard queries) ──────────────────
    // Extracted from candidateReport so the dashboard doesn't parse full JSON.
    readinessScore:          { type: Number, default: null },
    evidenceCoveragePercent: { type: Number, default: null },

    // ── Core engine output: evidence classification ────────────────────────────
    // Structured (not Mixed) so we can aggregate/filter by status across users.
    evidenceClaims: {
      type: [evidenceClaimSchema],
      default: [],
    },

    // ── Verification context — written to Interview before interview starts ─────
    // This is what the existing buildSystemPrompt() will pick up via interviewDoc.
    // Shape: { targetClaims[], criticalGaps[], verifiedStrengths[], evidenceSummary }
    verificationContext: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    // ── Full agent state snapshot (in-progress) ────────────────────────────────
    // Saved at checkpoints. Allows resuming after crash.
    // Schema is in agent/state.js, not enforced here (Mixed is intentional).
    agentState: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    // ── Final reports (primary frontend read surface) ──────────────────────────
    candidateReport: { type: mongoose.Schema.Types.Mixed, default: null },
    hiringReport:    { type: mongoose.Schema.Types.Mixed, default: null },
  },
  {
    timestamps: true, // createdAt + updatedAt
  }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
// Compound: "get all assessments for this user, sorted newest first"
assessmentSchema.index({ userId: 1, status: 1, createdAt: -1 });

// ── Model ─────────────────────────────────────────────────────────────────────
const Assessment = mongoose.model("Assessment", assessmentSchema);

module.exports = Assessment;
