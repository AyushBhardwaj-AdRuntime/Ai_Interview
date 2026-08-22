const Result = require("../services/result.service");
const interviewModel = require("../model/interview.model");

async function getResult(req, res) {
  try {
    const id = req.params.id;
    console.log("[Result] fetching interview:", id);

    const userId = req.auth?.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const interview = await interviewModel.findOne({ _id: id, userId }, "interview.questions interview.result");

    if (!interview) {
      return res.status(404).json({ message: "Interview not found or unauthorized" });
    }

    // If result already exists, return it to avoid re-evaluating
    if (interview.interview?.result && interview.interview.result.overallScore) {
      return res.status(200).json(interview.interview.result);
    }

    const questions = interview.interview.questions;

    if (!questions || questions.length === 0) {
      return res.status(400).json({ message: "No questions recorded for this interview." });
    }

    // Call GPT-120B to evaluate the Q&A transcript
    const rawEvaluation = await Result(questions);

    // ✅ Fix: parse the JSON string so we store structured data, not a raw string
    let parsed;
    try {
      const cleaned = rawEvaluation.replace(/```json/g, "").replace(/```/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch (parseErr) {
      console.error("[Result] Failed to parse GPT evaluation JSON:", parseErr.message);
      return res.status(500).json({ message: "AI returned malformed evaluation. Please try again." });
    }

    // Persist the structured result into MongoDB
    await interviewModel.findByIdAndUpdate(id, {
      $set: {
        "interview.result": parsed,
        "interview.status": "completed",
      },
    });

    // ✅ Return parsed object (not raw string) so frontend gets correct JSON
    return res.status(200).json(parsed);

  } catch (err) {
    console.error("[Result] Error:", err);
    return res.status(500).json({ message: err.message || "Internal server error" });
  }
}

module.exports = getResult;