const extractResumeText = require("../services/resume")
const parseResume = require("../services/ai_service")


async function atsAnalyzer ( req , res){
        const resume = req.files.resume[0];
        const jdFile = req.files.jdFile[0];
     if(!resume ){
         return res.status(400).json({
            message : "Resume is required"
         })
     }
     if(!jdFile || req.body.jdText ){
         return res.status(400).json({
            message : " JD file or text is required "
         })
     }

     const resumeText = extractResumeText(resume);
        const profile = await parseResume(resumeText);
        

     
}