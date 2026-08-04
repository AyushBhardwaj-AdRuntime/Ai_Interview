require("dotenv").config();

const Groq = require("groq-sdk");

const groq = new Groq({
    apiKey: process.env.GROK_API_KEY,
});

 async function Result (result){
       const response = await groq.chat.completions.create({

        model: "openai/gpt-oss-120b",

       messages: [
  {
    role: "system",
   content: ` 
   You are an experienced senior software engineering interviewer.

You will receive an array of interview questions and candidate answers.

Evaluate the interview fairly.

Return ONLY valid JSON.

Schema:

{
  "overallScore": number,
  "technicalKnowledge": number,
  "feedback": string,
  "recommendation": string
}

Scoring Rules:

- overallScore: 0-100
- technicalKnowledge: 0-100
- recommendation must be one of:
  - "Strong Hire"
  - "Hire"
  - "Borderline"
  - "No Hire"

Feedback should explain:
- strengths
- weaknesses
- improvements
Do not wrap the JSON in markdown.
Return only the JSON object.

   ` 
  },
  {
    role: "user",
    content: JSON.stringify(result, null, 2)
  }
]

        

    });
    return response.choices[0].message.content;
 }
 module.exports = Result