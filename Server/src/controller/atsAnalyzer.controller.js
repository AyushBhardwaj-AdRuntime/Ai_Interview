const extractResumeText = require("../services/resume");
const { analyzeATS, parseResume } = require("../services/ai_service");
const Resume = require("../model/resume.model");
const AtsResult = require("../model/atsResult.model");
const normalizeCandidateProfile = require("../services/profile.service");

async function atsAnalyzer(req, res) {
  try {
    const userId = req.userId;

    // ── 1. Get JD Text ────────────────────────────────────────────────────
    let jdText = req.body?.jdText || "";
    const jdFile = req.files?.jdFile?.[0];
    if (!jdText && jdFile) jdText = await extractResumeText(jdFile);
    if (!jdText) {
      return res.status(400).json({ message: "Job Description is required." });
    }

    // ── 2. Get / Save Resume ──────────────────────────────────────────────
    let resumeData;
    let resumeName = "";
    const resumeFile = req.files?.resume?.[0];

    if (resumeFile) {
      resumeName = resumeFile.originalname || "Uploaded Resume";
      const rawText = await extractResumeText(resumeFile);
      const parsed = await parseResume(rawText);
      resumeData = normalizeCandidateProfile(parsed);

      // Upsert — one resume per user
      await Resume.findOneAndUpdate(
        { userId },
        { $set: { userId, candidateProfile: resumeData, originalFile: { name: resumeName } } },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    } else {
      const existing = await Resume.findOne({ userId }).sort({ createdAt: -1 });
      if (!existing) {
        return res.status(404).json({ message: "No resume found. Please upload your resume." });
      }
      resumeData = existing.candidateProfile;
      resumeName = existing.originalFile?.name || "Saved Resume";
    }

    // ── 3. Run ATS Analysis (full — includes criticalRedFlag + teaserQuestions) ──
    const full = await analyzeATS(resumeData, jdText);

    // ── 4. Save FULL result to MongoDB ────────────────────────────────────
    const saved = await AtsResult.create({
      userId,
      resumeName,
      jdSnippet: jdText.slice(0, 300).trim(),
      score: full.score,
      matchStatus: full.matchStatus,
      matchingKeywords: full.matchingKeywords || [],
      missingKeywords: full.missingKeywords || [],
      feedback: full.feedback || "",
      suggestions: full.suggestions || [],
      criticalRedFlag: full.criticalRedFlag || {},
      teaserQuestions: full.teaserQuestions || [],
    });

    console.log("[ATS] Saved result id:", saved._id, "| score:", saved.score);

    // ── 5. Return FULL response to frontend for MVP ───────────────────────
    // For B2C MVP, we return the entire report without paywall.
    return res.status(200).json({
      success: true,
      resultId: saved._id,          // needed to fetch full report after payment
      candidateName: resumeData.name || "",

      // ── FREE tier MVP ───────────────────────────────────────────────────
      score: full.score,
      matchStatus: full.matchStatus,
      criticalRedFlag: full.criticalRedFlag || null,
      teaserQuestions: full.teaserQuestions || [],
      feedback: full.feedback || "",
      suggestions: full.suggestions || [],
      matchingKeywords: full.matchingKeywords || [],
      missingKeywords: full.missingKeywords || [],
    });

  } catch (err) {
    console.error("atsAnalyzer error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
}
async function getAtsHistory(req, res) {
  try {
    const { getAuth } = require("@clerk/express");
    const auth = getAuth(req);
    const userId = auth?.userId || req.auth?.userId || req.userId;
    if (!userId || userId.startsWith("anonymous_")) {
      // Guests don't get history unless we want to track them by anonymous ID, but usually dashboard is logged in.
      return res.status(401).json({ message: "Must be logged in to view ATS history." });
    }

    const history = await AtsResult.find({ userId }).sort({ createdAt: -1 });
    return res.status(200).json(history);
  } catch (err) {
    console.error("getAtsHistory error:", err);
    return res.status(500).json({ message: err.message });
  }
}

module.exports = { atsAnalyzer, getAtsHistory };