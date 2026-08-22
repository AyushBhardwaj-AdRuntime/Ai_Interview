const interviewModel = require("../model/interview.model");
const WebSocket = require("ws");
const { getAuth } = require("@clerk/express");

async function getInterview(req, res) {
  try {
    const { id } = req.params;
    const auth = getAuth(req);
    const userId = auth?.userId || req.auth?.userId || req.userId;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const interview = await interviewModel
      .findOneAndUpdate(
        { _id: id, userId },
        { "interview.status": "running" },
        { new: true }
      )
      .populate("resumeId");

    if (!interview) {
      return res.status(404).json({ message: "Interview not found or unauthorized" });
    }

    const response = {
      ...interview.toObject(),
      candidateProfile: interview.resumeId?.candidateProfile || null,
    };

    return res.status(200).json(response);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

async function getMyInterviews(req, res) {
  try {
    const auth = getAuth(req);
    const userId = auth?.userId || req.auth?.userId || req.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const interviews = await interviewModel
      .find({ userId })
      .sort({ createdAt: -1 });
      
    return res.status(200).json(interviews);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

module.exports = { getInterview, getMyInterviews };