require("dotenv").config();

const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.RESULT_GROK_API_KEY || process.env.GROK_API_KEY,
});

async function Result(result) {
  try {
    console.log("Result service request starting");
    const response = await groq.chat.completions.create({
      model: "openai/gpt-oss-20b",
      messages: [
        {
          role: "system",
          content: ` 
You are an experienced senior software engineering interviewer coaching a candidate.

You will receive an array of interview questions and candidate answers.

Evaluate the interview fairly and provide deep, actionable feedback.

Return ONLY valid JSON.

Schema:
{
  "overallScore": number (0-100),
  "technical": number (0-100),
  "communication": number (0-100),
  "problemSolving": number (0-100),
  "recommendation": string ("Strong Hire" | "Hire" | "Borderline" | "No Hire"),
  "strengths": [string, string, string],
  "weaknesses": [string, string, string],
  "nextSteps": [string, string, string],
  "questionsAnalysis": [
    {
      "questionText": string,
      "candidateAnswer": string,
      "score": number (0-100),
      "strengths": string,
      "weaknesses": string,
      "betterAnswer": string
    }
  ],
  "practicePlan": {
    "focusAreas": [
      {
        "topic": string,
        "practiceItems": [string, string, string]
      }
    ],
    "nextRecommendedInterview": string
  }
}

Do not wrap the JSON in markdown. Return only the JSON object.
   `,
        },
        {
          role: "user",
          content: JSON.stringify(result, null, 2),
        },
      ],
    });

    const content = response?.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("GPT result evaluation returned no content");
    }

    console.log("Result service response content:", content.slice(0, 800));
    return content;
  } catch (error) {
    console.error("Result service error:", error);
    throw error;
  }
}
 module.exports = Result