const extractResumeText = require("../services/resume")
const extractGitHubRepo = require("../services/github")
const parseResume = require("../services/ai_service")
const axios = require("axios")
 const interviewModel = require("../model/user.model")
async function preInterview(req, res) {

    try {

        const resumeText = await extractResumeText(req.file);

        // const githubRepo = await extractGitHubRepo(req.body.github);

        const profile = await parseResume(resumeText);
        
         const interview = await interviewModel.create({
              candidateProfile :  profile
         });
        return res.json({

            profile,
          id :   interview._id
            // githubRepo

        });

    } catch (err) {

        console.log(err);

        return res.status(500).json({
            message: err.message
        });

    }

}

module.exports = preInterview;