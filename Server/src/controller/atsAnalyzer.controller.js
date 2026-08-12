const extractResumeText = require("../services/resume")
const parseResume = require("../services/ai_service")


async function atsAnalyzer(req, res) {
  try {
    const resume = req.files?.resume?.[0];
    const jdFile = req.files?.jdFile?.[0];

    if (!resume) {
      return res.status(400).json({ message: "Resume is required" });
    }
    if (!jdFile && !req.body.jdText) {
      return res.status(400).json({ message: "JD file or text is required" });
    }

    const resumeText = await extractResumeText(resume);
    const profile = await parseResume(resumeText);

    return res.status(200).json({ profile });
  } catch (err) {
    console.error("atsAnalyzer error:", err);
    return res.status(500).json({ message: err.message });
  }
}