const extractResumeText = require("../services/resume")
const extractGitHubRepo = require("../services/github")
const parseResume = require("../services/ai_service")
const normalizeCandidateProfile = require("../services/profile.service")
const  resumeModel = require("../model/resume.model")
const axios = require("axios")
 const interviewModel = require("../model/interview.model")

async function preInterview(req, res) {

    try {

        if (!req.file) {
            return res.status(400).json({
                message: "Resume file is required."
            });
        }

        const resumeText = await extractResumeText(req.file);

        // const githubRepo = await extractGitHubRepo(req.body.github);

        const profile = await parseResume(resumeText);
        
          

         const candidateProfile = normalizeCandidateProfile(profile);

          console.log(candidateProfile)
           const resume = await resumeModel.create({
             userId: req.userId,
             candidateProfile ,
             originalFile: {
                name : req.file.originalname
             }
           })
         const interview = await interviewModel.create({
resumeId: resume._id
               
         });
        return res.json({

            interview,
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

module.exports = preInterview ;