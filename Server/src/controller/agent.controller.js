const Interview = require("../model/interview.model");
const Assessment = require("../model/assessment.model");
const Resume = require("../model/resume.model");
const extractResumeText = require("../services/resume");
const { parseResume } = require("../services/ai_service");
const { normalizeCandidateProfile } = require("../services/profile.service");
const { runAssessment } = require("../agent/orchestrator");


/**
 * Handle marking the assessment's linked interview as complete.
 * 
 * POST /api/v1/agent/assess/:assessmentId/interview-complete
 */
async function completeInterview(req, res) {
  try {
    const { assessmentId } = req.params;
    const { interviewId } = req.body;
    
    const isInternal = req.headers['x-internal-call'] === 'true';
    const userId = req.auth?.userId || req.userId;
    if (!userId && !isInternal) return res.status(401).json({ success: false, message: "Unauthorized" });

    // For internal calls, find the assessment first to get the userId
    const assessment = await Assessment.findOne({ _id: assessmentId });
    if (!assessment) return res.status(404).json({ success: false, message: "Assessment not found" });

    const effectiveUserId = userId || assessment.userId;

    // Verify interview belongs to user (skip for internal calls)
    const interview = await Interview.findOne({ _id: interviewId, ...(isInternal ? {} : { userId: effectiveUserId }) });
    if (!interview) return res.status(404).json({ success: false, message: "Interview not found or unauthorized" });

    // Verify it is linked to this assessment
    if (assessment.interviewId?.toString() !== interviewId) {
      return res.status(400).json({ success: false, message: "Interview ID does not match Assessment's linked interview" });
    }

    // Verify the interview is actually complete, or mark it complete now
    if (interview.interview?.status !== "completed") {
      interview.interview = interview.interview || {};
      interview.interview.status = "completed";
      await interview.save();
    }

    // Update assessment status so post-interview phase can begin
    // If duplicate call, status is already updated. It's safe.
    if (assessment.status === "awaiting_interview") {
      assessment.status = "evaluating"; 
      await assessment.save();
      
      // Kick off Phase 4 evaluation in the background (fire and forget)
      const { resumeAssessment } = require("../agent/orchestrator");
      resumeAssessment(assessmentId).catch(err => {
         console.error("Background evaluation failed:", err);
      });
    }
    
    return res.status(200).json({ success: true, message: "Assessment updated successfully" });
  } catch (error) {
    console.error("completeInterview error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

async function startAssessment(req, res) {
  try {
    const userId = req.auth?.userId || req.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // 1. Get JD Text
    let jdText = req.body?.jdText || "";
    const jdFile = req.files?.jdFile?.[0];
    if (!jdText && jdFile) jdText = await extractResumeText(jdFile);
    if (!jdText) {
      return res.status(400).json({ success: false, message: "Job Description is required." });
    }

    // 2. Get / Save Resume
    let resumeDoc;
    let resumeName = "";
    const resumeFile = req.files?.resume?.[0];

    if (resumeFile) {
      resumeName = resumeFile.originalname || "Uploaded Resume";
      const rawText = await extractResumeText(resumeFile);
      const parsed = await parseResume(rawText);
      const resumeData = normalizeCandidateProfile(parsed);

      resumeDoc = await Resume.findOneAndUpdate(
        { userId },
        { $set: { userId, candidateProfile: resumeData, originalFile: { name: resumeName } } },
        { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
      );
    } else {
      resumeDoc = await Resume.findOne({ userId }).sort({ createdAt: -1 });
      if (!resumeDoc) {
        return res.status(404).json({ success: false, message: "No resume found. Please upload your resume." });
      }
    }

    // 3. GitHub
    const githubUrl = req.body?.githubUrl || null;

    // 4. Create Assessment
    // --- Disabled for MVP to allow multiple assessments ---
    // const existingActive = await Assessment.findOne({ userId, status: { $nin: ["completed", "error"] } });
    // if (existingActive) {
    //   return res.status(400).json({ 
    //     success: false, 
    //     code: "ACTIVE_ASSESSMENT",
    //     message: "You already have an active assessment. Please complete or cancel it first.",
    //     assessmentId: existingActive._id.toString(),
    //     status: existingActive.status,
    //     interviewId: existingActive.interviewId?.toString()
    //   });
    // }

    const assessment = await Assessment.create({
      userId,
      resumeId: resumeDoc._id,
      jobRawText: jdText,
      githubUrl,
      status: "initialized",
    });

    // 5. Start Orchestrator in background
    runAssessment({
      assessmentId: assessment._id.toString(),
      userId,
      resumeId: resumeDoc._id.toString(),
      jobRawText: jdText,
      githubUrl,
    }).catch(err => {
      console.error(`Assessment ${assessment._id} failed in background:`, err);
    });

    return res.status(200).json({ success: true, assessmentId: assessment._id.toString() });
  } catch (error) {
    console.error("startAssessment error:", error);
    return res.status(500).json({ success: false, message: error.message || "Internal server error" });
  }
}

async function getAssessment(req, res) {
  try {
    const userId = req.auth?.userId || req.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { assessmentId } = req.params;
    const assessment = await Assessment.findOne({ _id: assessmentId, userId });

    if (!assessment) {
      return res.status(404).json({ success: false, message: "Assessment not found" });
    }

    return res.status(200).json({ success: true, assessment });
  } catch (error) {
    console.error("getAssessment error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

async function listAssessments(req, res) {
  try {
    const userId = req.auth?.userId || req.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const assessments = await Assessment.find({ userId }).sort({ createdAt: -1 });
    return res.status(200).json(assessments);
  } catch (error) {
    console.error("listAssessments error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

module.exports = { completeInterview, startAssessment, getAssessment, listAssessments };
