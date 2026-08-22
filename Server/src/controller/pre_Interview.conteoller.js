const extractResumeText = require("../services/resume")
const extractGitHubRepo = require("../services/github")
const { parseResume } = require("../services/ai_service");
const normalizeCandidateProfile = require("../services/profile.service")
const resumeModel = require("../model/resume.model")
const interviewModel = require("../model/interview.model")

async function preInterview(req, res) {
    try {
        let resume;

        if (req.file) {
            const resumeText = await extractResumeText(req.file);
            const profile = await parseResume(resumeText);
            const candidateProfile = normalizeCandidateProfile(profile);

            console.log("[PreInterview] parsed profile for:", candidateProfile.name);

            // ✅ Upsert — one resume per user, replaces on new upload
            resume = await resumeModel.findOneAndUpdate(
                { userId: req.auth.userId },          // find by authenticated clerk user
                {
                    $set: {
                        userId: req.auth.userId,
                        candidateProfile,
                        originalFile: { name: req.file.originalname },
                    }
                },
                {
                    upsert: true,     // create if doesn't exist
                    new: true,        // return the updated doc
                    setDefaultsOnInsert: true,
                }
            );
        } else {
            // Check if user already has a saved resume (e.g. from ATS)
            resume = await resumeModel.findOne({ userId: req.auth.userId }).sort({ createdAt: -1 });
            
            if (!resume) {
                return res.status(400).json({ message: "Resume file is required. No saved resume found." });
            }
            console.log("[PreInterview] using existing profile for:", resume.candidateProfile?.name);
        }

        // ── Form Data ────────────────────────────────────────────────────────
        const jobTitle = req.body.jobTitle || "";
        const company = req.body.company || "";
        const jobDescription = req.body.jobDescription || "";
        const interviewType = req.body.interviewType || "Technical";
        const difficulty = req.body.difficulty || "Medium";
        const experience = req.body.experience || "1-3 years";

        const interview = await interviewModel.create({
            resumeId: resume._id,
            userId: req.auth.userId,
            jobTitle,
            company,
            jobDescription,
            interviewType,
            difficulty,
            experience
        });

        return res.json({ interview, id: interview._id });

    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: err.message });
    }
}

module.exports = preInterview;