require("dotenv").config();

const Groq = require("groq-sdk");

const groq = new Groq({
    apiKey: process.env.GROK_API_KEY,
});

async function parseResume(resumeText) {

    const response = await groq.chat.completions.create({

        model: "meta-llama/llama-4-scout-17b-16e-instruct",

        messages: [

            {
                role: "system",
                content: `
You are an expert ATS Resume Parser.

Extract information from the resume.

Return ONLY valid JSON.

Schema:

{
    "name":"",
    "email":"",
    "phone":"",
    "skills":[],
    "projects":[],
    "education":[],
    "experience":[]
}
`
            },

            {
                role: "user",
                content: resumeText
            }
, 
        
        ]

        

    });

    const content = response.choices[0].message.content
  .replace(/```json/g, "")
  .replace(/```/g, "")
  .trim();

return JSON.parse(content);

}

module.exports = parseResume;