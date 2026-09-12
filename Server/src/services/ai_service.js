require("dotenv").config();

const Groq = require("groq-sdk");

const groq = new Groq({
    apiKey: process.env.GROK_API_KEY,
});

async function parseResume(resumeText) {
  try {
    const start = Date.now();
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

    console.log(`[LLM] model=openai/gpt-oss-120b | action=parse_resume | duration=${Date.now() - start}ms`);

    try {
      return JSON.parse(cleaned);
    } catch (parseError) {
      console.error("parseResume JSON parse failed. Content:", cleaned.slice(0, 500));
      throw new Error(`Failed to parse AI response as JSON: ${parseError.message}`);
    }
  } catch (error) {
    console.error("parseResume error:", error);
    throw error;
  }
}

async function analyzeATS(resumeData, jdText) {
  try {
    const start = Date.now();
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

    console.log(`[LLM] model=openai/gpt-oss-120b | action=analyze_ats | duration=${Date.now() - start}ms`);

    try {
      return JSON.parse(cleaned);
    } catch (parseError) {
      console.error("analyzeATS JSON parse failed. Content:", cleaned.slice(0, 500));
      throw new Error(`Failed to parse AI response as JSON: ${parseError.message}`);
    }
  } catch (error) {
    console.error("analyzeATS error:", error);
    throw error;
  }
}

async function evaluateInterview(payload) {
  try {
    const start = Date.now();
    
    // Convert to JSON string for prompt
    const payloadStr = JSON.stringify(payload, null, 2);

    const response = await groq.chat.completions.create({
      model: "openai/gpt-oss-120b",
      messages: [
        {
          role: "system",
          content: `You are an expert technical interviewer evaluator.
Evaluate the candidate's interview performance based on the provided data.

Return ONLY valid JSON matching this exact schema (no markdown, no explanation):

{
  "interviewPerformance": {
    "technical": <number 0-100>,
    "communication": <number 0-100>,
    "depth": <number 0-100>
  },
  "claimVerifications": [
    {
      "claim": "<string>",
      "score": <number 0-10>,
      "answerQuality": <number 0-10>
    }
  ],
  "strengths": ["<string>"],
  "weaknesses": ["<string>"],
  "riskAreas": ["<string>"],
  "recommendedActions": ["<string>"],
  "summary": "<string>",
  "claimVerificationDetails": [
    {
      "claim": "<string>",
      "skill": "<string>",
      "status": "<SUPPORTED | PARTIALLY | UNVERIFIED | CONTRADICTED>",
      "explanation": "<string>"
    }
  ]
}

Rules:
- Be strict but fair in technical evaluation.
- All fields are required.
- Do NOT return markdown formatting like \`\`\`json. Return pure JSON text.`,
        },
        {
          role: "user",
          content: `Evaluate this interview data:\n\n${payloadStr}`,
        },
      ],
    });

    const content = response?.choices?.[0]?.message?.content;
    if (!content) throw new Error("LLM returned no content for interview evaluation");

    const cleaned = content
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();

    console.log(`[LLM] model=openai/gpt-oss-120b | action=evaluate_interview | duration=${Date.now() - start}ms`);

    return JSON.parse(cleaned);
  } catch (error) {
    console.error("evaluateInterview error:", error);
    throw error;
  }
}

async function generateReports(payload) {
    try {
        const start = Date.now();
        const payloadStr = JSON.stringify(payload, null, 2);
    
        const response = await groq.chat.completions.create({
          model: "openai/gpt-oss-120b",
          messages: [
            {
              role: "system",
              content: `You are an expert HR and technical hiring manager report generator.
    Based on the provided evaluation, readiness score, and candidate profile, generate a Candidate Report and a Hiring Report.
    
    Return ONLY valid JSON matching this exact schema (no markdown, no explanation):
    
    {
      "candidateReport": {
        "candidate": { "name": "<string>" },
        "readinessScore": <number>,
        "summary": "<string>",
        "strengths": ["<string>"],
        "skillGaps": [
          { "skill": "<string>", "severity": "<low | medium | high>", "reason": "<string>" }
        ],
        "claimVerification": [
          { "claim": "<string>", "skill": "<string>", "status": "<SUPPORTED | PARTIALLY | UNVERIFIED | CONTRADICTED>", "explanation": "<string>" }
        ],
        "interviewSummary": "<string>",
        "recommendedActions": ["<string>"]
      },
      "hiringReport": {
        "candidate": { "name": "<string>" },
        "readinessScore": <number>,
        "summary": "<string>",
        "claimVerification": [
          { "claim": "<string>", "status": "<string>", "explanation": "<string>" }
        ],
        "verifiedSkills": ["<string>"],
        "unverifiedClaims": ["<string>"],
        "interviewSummary": "<string>",
        "riskAreas": ["<string>"],
        "recommendedVerificationQuestions": ["<string>"]
      }
    }
    
    Rules:
    - readinessScore must be exactly the number provided in the input, do NOT invent a new score.
    - All fields are required.
    - Do NOT return markdown formatting like \`\`\`json. Return pure JSON text.`,
            },
            {
              role: "user",
              content: `Generate reports from this data:\n\n${payloadStr}`,
            },
          ],
        });
    
        const content = response?.choices?.[0]?.message?.content;
        if (!content) throw new Error("LLM returned no content for report generation");
    
        const cleaned = content
          .replace(/^```json\s*/i, "")
          .replace(/^```\s*/i, "")
          .replace(/```\s*$/i, "")
          .trim();
    
        console.log(`[LLM] model=openai/gpt-oss-120b | action=generate_reports | duration=${Date.now() - start}ms`);

        return JSON.parse(cleaned);
      } catch (error) {
        console.error("generateReports error:", error);
        throw error;
      }
}

module.exports = { parseResume, analyzeATS, evaluateInterview, generateReports };