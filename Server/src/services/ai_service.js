require("dotenv").config();

const Groq = require("groq-sdk");

const groq = new Groq({
    apiKey: process.env.GROK_API_KEY,
});

async function parseResume(resumeText) {
  try {
    console.log("parseResume request starting");
    const response = await groq.chat.completions.create({
      model: "openai/gpt-oss-120b",
      messages: [
        {
          role: "system",
          content: `You are an expert ATS Resume Parser.

Your task is to extract information from a resume into the JSON schema below.

Rules:
1. Return ONLY valid JSON. No markdown, no explanation.
2. Every field in the schema must exist.
3. Missing strings => ""
4. Missing arrays => []
5. Never hallucinate. Preserve original wording.

interviewSummary Rules:
- Maximum 120 words.
- Summarize the candidate's profile in third person.
- Mention important skills, experience, and notable projects.
- Mention likely interview topics.
- Use ONLY information from the resume.

Return exactly this JSON (no other text):

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
      "description": []
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
      "description": []
    }
  ]
}`
        },
        {
          role: "user",
          content: resumeText
        }
      ]
    });

    const content = response?.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("GPT 120B returned no content");
    }

    // ✅ Fix: strip markdown fences and any leading/trailing whitespace
    const cleaned = content
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();

    console.log("parseResume response (first 300 chars):", cleaned.slice(0, 300));

    return JSON.parse(cleaned);
  } catch (error) {
    console.error("parseResume error:", error);
    throw error;
  }
}

async function analyzeATS(resumeData, jdText) {
  try {
    console.log("analyzeATS request starting");
    const resumeText = typeof resumeData === "string" ? resumeData : JSON.stringify(resumeData);

    const response = await groq.chat.completions.create({
      model: "openai/gpt-oss-120b",
      messages: [
        {
          role: "system",
          content: `You are an expert ATS (Applicant Tracking System) Analyzer and Interview Coach.
Evaluate the candidate's Resume against the Job Description.

Return ONLY valid JSON matching this exact schema (no markdown, no explanation):

{
  "score": <number 0-100>,
  "matchStatus": <"High" | "Medium" | "Low">,
  "matchingKeywords": [<string>],
  "missingKeywords": [<string>],
  "feedback": <string>,
  "suggestions": [<string>],
  "criticalRedFlag": {
    "skill": <the single most important missing skill or gap>,
    "reason": <one sentence: why this gap will hurt the candidate in screening>,
    "potentialScoreGain": <e.g. "+8-12 points">
  },
  "teaserQuestions": [
    <personalized interview question 1 based on a gap or weak area from the resume vs JD>,
    <personalized interview question 2 based on another gap or weak area>
  ]
}

Rules:
- criticalRedFlag must be the SINGLE most impactful gap — not a list
- teaserQuestions must be specific to THIS candidate and THIS job — not generic
- teaserQuestions should expose areas where the candidate is likely to struggle
- All fields are required`,
        },
        {
          role: "user",
          content: `### Job Description:\n${jdText}\n\n### Candidate Resume:\n${resumeText}`,
        },
      ],
    });

    const content = response?.choices?.[0]?.message?.content;
    if (!content) throw new Error("LLM returned no content for ATS analysis");

    const cleaned = content
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();

    return JSON.parse(cleaned);
  } catch (error) {
    console.error("analyzeATS error:", error);
    throw error;
  }
}


module.exports = { parseResume, analyzeATS };