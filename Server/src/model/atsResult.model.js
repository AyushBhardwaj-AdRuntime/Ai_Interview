const mongoose = require("mongoose");

const atsResultSchema = new mongoose.Schema(
  {
    // Who did the check (anonymous session)
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // The resume name that was analyzed (for display in history)
    resumeName: {
      type: String,
      default: "",
    },

    // Short snippet of the job description (first 300 chars) for reference
    jdSnippet: {
      type: String,
      default: "",
    },

    // ── ATS Analysis Result ───────────────────────────────────────────────
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },

    matchStatus: {
      type: String,
      enum: ["High", "Medium", "Low"],
      required: true,
    },

    matchingKeywords: {
      type: [String],
      default: [],
    },

    missingKeywords: {
      type: [String],
      default: [],
    },

    feedback: {
      type: String,
      default: "",
    },

    suggestions: {
      type: [String],
      default: [],
    },

    // ── Free-tier hook data ───────────────────────────────────────────────
    // The single most impactful gap shown for free to create urgency
    criticalRedFlag: {
      skill: { type: String, default: "" },
      reason: { type: String, default: "" },
      potentialScoreGain: { type: String, default: "" },
    },

    // 2 personalized questions shown free — answers analyzed to show "weakness"
    teaserQuestions: {
      type: [String],
      default: [],
    },
  },

  {
    timestamps: true, // createdAt = when the check was done
  }
);

const AtsResult = mongoose.model("AtsResult", atsResultSchema);
module.exports = AtsResult;
