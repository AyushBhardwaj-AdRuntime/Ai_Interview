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

Your task is to extract information from a resume into the JSON schema below.

Rules:

1. Return ONLY valid JSON.
2. Do NOT return markdown.
3. Do NOT explain anything.
4. Do NOT add fields not present in the schema.
5. Do NOT rename fields.
6. Every field in the schema must exist.
7. Missing strings => ""
8. Missing arrays => []
9. Never hallucinate information.
10. Preserve the original wording whenever possible.

interviewSummary Rules:

- Maximum 120 words.
- Summarize the candidate's profile.
- Mention important skills.
- Mention relevant experience.
- Mention notable projects.
- Mention likely interview topics.
- Use ONLY information from the resume.
- Do NOT invent anything.
- Do NOT evaluate the candidate.
- Write in third person.

Return exactly this JSON:

{
 "interviewSummary": "",
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