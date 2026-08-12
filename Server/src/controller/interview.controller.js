const interviewModel = require("../model/interview.model");
const WebSocket = require("ws");

async function getInterview(req, res) {
  try {
    const { id } = req.params;

    const interview = await interviewModel
      .findByIdAndUpdate(
        id,
        {
          "interview.status": "running",
        },
        { new: true }
      )
      .populate("resumeId");

    if (!interview) {
      return res.status(404).json({
        message: "Interview not found",
      });
    }

    const response = {
      ...interview.toObject(),
      candidateProfile: interview.resumeId?.candidateProfile || null,
    };

    return res.status(200).json(response);
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Internal Server Error",
      id,
    });
  }
}

module.exports = getInterview;