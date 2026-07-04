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

Your task is to extract information from a resume into a fixed JSON schema.

IMPORTANT RULES:

1. Return ONLY valid JSON.
2. Do NOT return markdown.
3. Do NOT wrap the JSON inside json.
4. Do NOT explain anything.
5. Do NOT add extra fields.
6. Do NOT rename fields.
7. Every field in the schema MUST exist.
8. If information is missing:
   - String fields => ""
   - Array fields => []
9. Never hallucinate information.
10. If a value is uncertain, use an empty string.
11. Preserve the original wording whenever possible.

Return EXACTLY this JSON schema:

{
  "name": "",
  "email": "",
  "phone": "",
  "skills": [],
  "projects": [
    {
      "name": "",
      "techStack": [],
      "description": ""
    }
  ],
  "education": [
    {
      "institution": "",
      "degree": "",
      "duration": "",
      "cgpa": "",
      "percentage": "",
      "location": ""
    }
  ],
  "experience": [
    {
      "designation": "",
      "company": "",
      "duration": "",
      "location": "",
      "description": ""
    }
  ]
}  
`
  },
  {
    role: "user",
    content: resumeText
  }
]

        

    });

    const content = response.choices[0].message.content
  .replace(/```json/g, "")
  .replace(/```/g, "")
  .trim();

return JSON.parse(content);

}

module.exports = parseResume;