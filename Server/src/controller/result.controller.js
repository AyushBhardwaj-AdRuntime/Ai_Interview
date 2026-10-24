const Result = require("../services/result.service");
const interviewModel = require("../model/interview.model");

async function getResult(req, res) {
  try {
    const id = req.params.id;
    console.log("[Result] fetching interview:", id);

    const mongoose = require("mongoose");
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, code: "INVALID_ID", message: "Invalid interview ID" });
    }

    const userId = req.auth?.userId || req.userId;
    if (!userId) return res.status(401).json({ success: false, code: "UNAUTHORIZED", message: "Unauthorized" });

    const interview = await interviewModel.findOne(
      { _id: id, userId },
      "interview.questions interview.result interview.status jobTitle company interviewType difficulty experience"
    );

    if (!interview) {
      return res.status(404).json({ success: false, code: "NOT_FOUND", message: "Interview not found or unauthorized" });
    }

    // If result already exists, return it to avoid re-evaluating
    if (interview.interview?.result && interview.interview.result.overallScore) {
      return res.status(200).json({ success: true, data: interview.interview.result });
    }

    const questions = interview.interview?.questions;

    if (!questions || questions.length === 0) {
      return res.status(400).json({ success: false, code: "BAD_REQUEST", message: "No questions recorded for this interview." });
    }

    // Filter out turns with empty questions or empty answers or generic end greetings
    const sanitizedQuestions = questions
      .filter((q) => q.question && q.question.trim().length > 0 && q.answer && q.answer.trim().length > 0)
      .map((q) => ({
        question: q.question.trim(),
        answer: q.answer.trim(),
      }));

    const questionsToEvaluate = sanitizedQuestions.length > 0
      ? sanitizedQuestions
      : questions.map((q) => ({
          question: q.question || "Question",
          answer: q.answer || "No response provided",
        }));

    // Call Groq Llama-3.3-70B to evaluate the Q&A transcript
    const rawEvaluation = await Result(questionsToEvaluate);

    // Parse the JSON response safely
    let parsed;
    try {
      const cleaned = rawEvaluation
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/```\s*$/i, "")
        .trim();
      parsed = JSON.parse(cleaned);
    } catch (parseErr) {
      console.error("[Result] Primary JSON parse failed:", parseErr.message);
      // Attempt recovery: extract JSON between first { and last }
      try {
        const firstBrace = rawEvaluation.indexOf("{");
        const lastBrace = rawEvaluation.lastIndexOf("}");
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
          parsed = JSON.parse(rawEvaluation.slice(firstBrace, lastBrace + 1));
        } else {
          throw parseErr;
        }
      } catch (recoveryErr) {
        console.error("[Result] Recovery JSON parse also failed:", recoveryErr.message);
        return res.status(500).json({
          success: false,
          code: "SERVER_ERROR",
          message: "AI returned malformed evaluation. Please try again.",
        });
      }
    }

    // Persist the structured result into MongoDB
    await interviewModel.findByIdAndUpdate(id, {
      $set: {
        "interview.result": parsed,
        "interview.status": "completed",
      },
    });

    // Return parsed object so frontend gets correct JSON
    return res.status(200).json({ success: true, data: parsed });

  } catch (err) {
    console.error("[Result] Error:", err);
    return res.status(500).json({ success: false, code: "SERVER_ERROR", message: err.message || "Internal server error" });
  }
}

module.exports = getResult;
