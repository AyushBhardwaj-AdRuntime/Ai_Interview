/**
 * services/jobParser.js
 *
 * JD raw text → structured job profile.
 *
 * WHY A SEPARATE SERVICE (not reusing analyzeATS)?
 *   analyzeATS() compares resume vs JD and returns an ATS score.
 *   This service does one thing: extract the job's requirements into structured data
 *   so the evidence engine and gap analysis can work with clean arrays — not free text.
 *
 * OUTPUT:
 *   {
 *     title: string,
 *     company: string,
 *     seniority: string,               // "junior" | "mid" | "senior" | "lead" | "unknown"
 *     requiredSkills: string[],        // must-have — "required", "must have", "essential"
 *     preferredSkills: string[],       // nice-to-have — "preferred", "plus", "bonus"
 *     technicalSkills: string[],       // all technical skills (union of above)
 *     responsibilities: string[],      // what the candidate will do
 *     requirements: string[],          // experience, education, certifications
 *     keywords: string[],              // all important terms for gap analysis
 *   }
 */

require("dotenv").config();
const Groq = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROK_API_KEY });

/**
 * Parse a raw job description into a structured profile.
 *
 * @param {string} jdText - Raw job description text (pasted or extracted)
 * @returns {Promise<object>} Structured job profile
 * @throws if LLM call fails or response cannot be parsed
 */
async function parseJob(jdText) {
  if (!jdText || jdText.trim().length < 30) {
    throw new Error("Job description is too short to parse (minimum 30 characters).");
  }

  console.log("[JobParser] Parsing JD — length:", jdText.length);

  const response = await groq.chat.completions.create({
    model: "openai/gpt-oss-120b",
    messages: [
      {
        role: "system",
        content: `You are an expert at parsing job descriptions into structured data.

Extract the job requirements into the JSON schema below.

Rules:
1. Return ONLY valid JSON. No markdown, no explanation.
2. Every field must exist. Missing arrays = []. Missing strings = "".
3. requiredSkills = only skills explicitly marked as "required", "must have", "essential", or listed under hard requirements.
4. preferredSkills = skills marked as "preferred", "nice to have", "bonus", "plus", or "desired".
5. technicalSkills = union of requiredSkills + preferredSkills + any other named technical skill (languages, frameworks, tools, platforms, databases).
6. keywords = all important terms: job-specific jargon, technologies, methodologies, domain terms. Used for ATS matching.
7. Preserve original skill names exactly (e.g., "Node.js" not "NodeJS", "PostgreSQL" not "postgres").
8. seniority: infer from title or years-of-experience requirements: "junior" (<2yr), "mid" (2-5yr), "senior" (5+yr), "lead" (management/architecture), "unknown".
9. responsibilities: extract as concise bullet strings (not sentences). Max 10.
10. requirements: formal requirements only (years experience, degree, certifications). Max 8.

Return exactly this JSON:

{
  "title": "",
  "company": "",
  "seniority": "",
  "requiredSkills": [],
  "preferredSkills": [],
  "technicalSkills": [],
  "responsibilities": [],
  "requirements": [],
  "keywords": []
}`,
      },
      {
        role: "user",
        content: jdText,
      },
    ],
  });

  const content = response?.choices?.[0]?.message?.content;
  if (!content) throw new Error("[JobParser] LLM returned no content");

  const cleaned = content
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

  let profile;
  try {
    profile = JSON.parse(cleaned);
  } catch (e) {
    throw new Error(`[JobParser] Failed to parse LLM JSON response: ${e.message}`);
  }

  // Normalize: ensure all arrays, no nulls
  profile.requiredSkills  = normalizeStringArray(profile.requiredSkills);
  profile.preferredSkills = normalizeStringArray(profile.preferredSkills);
  profile.technicalSkills = normalizeStringArray(profile.technicalSkills);
  profile.responsibilities = normalizeStringArray(profile.responsibilities);
  profile.requirements    = normalizeStringArray(profile.requirements);
  profile.keywords        = normalizeStringArray(profile.keywords);
  profile.title           = (profile.title || "").trim();
  profile.company         = (profile.company || "").trim();
  profile.seniority       = (profile.seniority || "unknown").toLowerCase();

  console.log(
    `[JobParser] Done — title: "${profile.title}", required: ${profile.requiredSkills.length}, preferred: ${profile.preferredSkills.length}, technical: ${profile.technicalSkills.length}`
  );

  return profile;
}

/**
 * Ensure a value is an array of non-empty trimmed strings.
 * @param {any} val
 * @returns {string[]}
 */
function normalizeStringArray(val) {
  if (!Array.isArray(val)) return [];
  return val
    .filter((s) => typeof s === "string" && s.trim().length > 0)
    .map((s) => s.trim());
}

module.exports = { parseJob };
