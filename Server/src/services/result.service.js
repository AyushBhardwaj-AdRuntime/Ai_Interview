require("dotenv").config();

const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.RESULT_GROK_API_KEY || process.env.GROK_API_KEY || process.env.GROQ_API_KEY || "dummy_key",
});

async function Result(result) {
  try {
    console.log("[Result] Service request starting with llama-3.3-70b-versatile");
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" },
      max_completion_tokens: 4096,
      temperature: 0.3,
      messages: [
        {
          role: "system",
          content: `You are an experienced senior software engineering interviewer coaching a candidate.

You will receive an array of interview questions and candidate answers.

Evaluate the interview fairly and provide deep, actionable feedback.

Return ONLY a valid JSON object matching the exact schema below.

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

Rules:
- For candidateAnswer in questionsAnalysis, summarize or excerpt the candidate's core response in 1-2 sentences. Do not reproduce huge transcripts verbatim.
- Provide clear, constructive critique in strengths, weaknesses, and a concrete betterAnswer for each question.
- All numbers must be integers between 0 and 100.
- Do not wrap the JSON in markdown code blocks. Return only valid JSON.`,
        },
        {
          role: "user",
          content: JSON.stringify(result, null, 2),
        },
      ],
    });

    const content = response?.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("Llama result evaluation returned no content");
    }

    console.log("[Result] Service response content received, length:", content.length);
    return content;
  } catch (error) {
    console.error("[Result] Service error:", error);
    throw error;
  }
}

module.exports = Result;