/**
 * services/evidenceEngine.js
 *
 * THE CORE — Deterministic evidence classification.
 *
 * Takes resume claims + GitHub inspection results and classifies
 * each claim into one of five evidence statuses:
 *
 *   SUPPORTED     → Strong evidence from GitHub (package.json dep, confirmed language, etc.)
 *   PARTIALLY     → Some evidence exists but not conclusive
 *   CLAIMED       → Only in the resume, no GitHub available or not searched yet
 *   UNVERIFIED    → GitHub was available and searched, no evidence found
 *   CONTRADICTED  → Available evidence actively contradicts the claim
 *
 * WHY DETERMINISTIC (not LLM)?
 *   - Evidence classification must be consistent, auditable, and explainable
 *   - The LLM can misclassify due to hallucination or context window issues
 *   - A claim is SUPPORTED if and only if specific verifiable evidence was found
 *   - This is the ground truth that the readiness score is built on
 *   - The LLM does reasoning about WHICH repos to inspect; this engine classifies WHAT was found
 *
 * INPUT:
 *   claims[]         — from resume parser: [{ claim, skill, category }]
 *   githubInspections[] — array of inspectRepository() results (may be empty if no GitHub)
 *   githubAvailable  — boolean (was GitHub URL provided and accessible?)
 *
 * OUTPUT:
 *   EvidenceClaim[] — each claim enriched with status, confidence, sources[], evidenceStrength
 */

// ── Skill normalization map ───────────────────────────────────────────────────
// Maps common aliases to canonical names for matching.
// This prevents "NodeJS" and "Node.js" from being treated as different skills.
const SKILL_ALIASES = {
  "node":         "Node.js",
  "nodejs":       "Node.js",
  "node.js":      "Node.js",
  "react":        "React",
  "reactjs":      "React",
  "react.js":     "React",
  "vue":          "Vue.js",
  "vuejs":        "Vue.js",
  "angular":      "Angular",
  "angularjs":    "Angular",
  "next":         "Next.js",
  "nextjs":       "Next.js",
  "next.js":      "Next.js",
  "express":      "Express",
  "expressjs":    "Express",
  "mongo":        "MongoDB",
  "mongodb":      "MongoDB",
  "postgres":     "PostgreSQL",
  "postgresql":   "PostgreSQL",
  "pg":           "PostgreSQL",
  "mysql":        "MySQL",
  "redis":        "Redis",
  "typescript":   "TypeScript",
  "ts":           "TypeScript",
  "javascript":   "JavaScript",
  "js":           "JavaScript",
  "python":       "Python",
  "django":       "Django",
  "flask":        "Flask",
  "fastapi":      "FastAPI",
  "docker":       "Docker",
  "kubernetes":   "Kubernetes",
  "k8s":          "Kubernetes",
  "aws":          "AWS",
  "gcp":          "GCP",
  "azure":        "Azure",
  "graphql":      "GraphQL",
  "prisma":       "Prisma",
  "tailwind":     "Tailwind CSS",
  "tailwindcss":  "Tailwind CSS",
  "socket.io":    "Socket.io",
  "socketio":     "Socket.io",
  "jest":         "Jest",
  "mocha":        "Mocha",
  "webpack":      "Webpack",
  "vite":         "Vite",
  "git":          "Git",
  "github":       "GitHub",
  "gitlab":       "GitLab",
  "tensorflow":   "TensorFlow",
  "pytorch":      "PyTorch",
  "langchain":    "LangChain",
  "openai":       "OpenAI",
};

/**
 * Normalize a skill name to its canonical form.
 * @param {string} skill
 * @returns {string}
 */
function normalizeSkill(skill) {
  if (!skill) return "";
  const lower = skill.toLowerCase().trim().replace(/\s+/g, "");
  return SKILL_ALIASES[lower] || skill.trim();
}

// ── GitHub evidence matchers ──────────────────────────────────────────────────
// These check a single repository inspection result for evidence of a skill.
// Each matcher returns { found: boolean, strength: number (0–1), detail: string }

/**
 * Check package.json dependencies for a skill match.
 * This is the STRONGEST evidence (you can't fake a dependency).
 * Strength: 0.95
 */
function matchPackageJson(skill, inspection) {
  if (!inspection.packageJson) return { found: false, strength: 0, detail: "" };

  const allDeps = [
    ...inspection.packageJson.dependencies,
    ...inspection.packageJson.devDependencies,
  ].map((d) => d.toLowerCase());

  const normalized = skill.toLowerCase();

  // Direct match or common package name variants
  const packageVariants = [
    normalized,
    normalized.replace(".", ""),       // "socket.io" → "socketio"
    normalized.replace(/\s+/g, "-"),   // "tailwind css" → "tailwind-css"
    normalized.replace(/\s+/g, ""),    // "tailwind css" → "tailwindcss"
    "@" + normalized,                  // scoped packages like "@redis/client"
  ];

  // Also check specific package names for frameworks
  const skillPackageMap = {
    "redis":      ["redis", "ioredis", "@redis/client", "redis-client"],
    "mongodb":    ["mongoose", "mongodb", "@mongodb/client"],
    "postgresql": ["pg", "postgres", "sequelize", "prisma"],
    "mysql":      ["mysql", "mysql2", "sequelize"],
    "docker":     [],  // docker isn't a npm dep, checked via Dockerfile
    "aws":        ["aws-sdk", "@aws-sdk"],
    "graphql":    ["graphql", "apollo-server", "apollo-client", "@apollo"],
    "socket.io":  ["socket.io", "socket.io-client"],
    "tensorflow": ["@tensorflow/tfjs", "tensorflow"],
    "react":      ["react", "react-dom", "next", "gatsby"],
    "vue.js":     ["vue", "@vue/core", "nuxt"],
    "angular":    ["@angular/core"],
    "next.js":    ["next"],
    "jest":       ["jest", "@jest/core"],
    "tailwind css": ["tailwindcss"],
    "prisma":     ["@prisma/client", "prisma"],
  };

  const extraVariants = skillPackageMap[normalized] || [];
  const allVariants = [...packageVariants, ...extraVariants];

  const matched = allDeps.find((dep) =>
    allVariants.some((v) => dep === v || dep.startsWith(v + "/") || dep.startsWith(v + "-"))
  );

  if (matched) {
    return {
      found: true,
      strength: 0.95,
      detail: `package.json dependency: "${matched}" in ${inspection.name}`,
    };
  }

  return { found: false, strength: 0, detail: "" };
}

/**
 * Check requirements.txt for a skill match (Python projects).
 * Strength: 0.95
 */
function matchRequirementsTxt(skill, inspection) {
  if (!inspection.requirementsTxt) return { found: false, strength: 0, detail: "" };

  const normalized = skill.toLowerCase();
  const pythonPackageMap = {
    "django":    ["django"],
    "flask":     ["flask"],
    "fastapi":   ["fastapi"],
    "redis":     ["redis", "redis-py"],
    "postgresql": ["psycopg2", "psycopg2-binary", "asyncpg", "sqlalchemy"],
    "mongodb":   ["pymongo", "motor"],
    "tensorflow": ["tensorflow", "tensorflow-cpu", "tensorflow-gpu"],
    "pytorch":   ["torch", "pytorch"],
    "langchain": ["langchain", "langchain-core"],
    "openai":    ["openai"],
    "python":    [], // being in requirements.txt at all implies Python
  };

  const variants = [
    normalized,
    ...(pythonPackageMap[normalized] || []),
  ];

  const packages = inspection.requirementsTxt.map((p) => p.toLowerCase());
  const matched = packages.find((p) => variants.some((v) => p === v || p.startsWith(v)));

  if (matched) {
    return {
      found: true,
      strength: 0.95,
      detail: `requirements.txt package: "${matched}" in ${inspection.name}`,
    };
  }

  return { found: false, strength: 0, detail: "" };
}

/**
 * Check primary language and language breakdown for a match.
 * Strength: 0.80 (confirmed language), 0.40 (secondary language)
 */
function matchLanguages(skill, inspection) {
  const normalized = skill.toLowerCase();
  const languageMap = {
    "javascript": ["javascript"],
    "typescript": ["typescript"],
    "python":     ["python"],
    "java":       ["java"],
    "go":         ["go"],
    "rust":       ["rust"],
    "c++":        ["c++"],
    "c#":         ["c#"],
    "ruby":       ["ruby"],
    "php":        ["php"],
    "swift":      ["swift"],
    "kotlin":     ["kotlin"],
  };

  const langVariants = languageMap[normalized] || [normalized];
  const primary = (inspection.primaryLanguage || "").toLowerCase();
  const allLangs = Object.keys(inspection.languages || {}).map((l) => l.toLowerCase());

  if (langVariants.some((v) => primary === v)) {
    return {
      found: true,
      strength: 0.80,
      detail: `Primary language in repo ${inspection.name}: ${inspection.primaryLanguage}`,
    };
  }

  if (langVariants.some((v) => allLangs.includes(v))) {
    return {
      found: true,
      strength: 0.40,
      detail: `Secondary language in repo ${inspection.name}: ${skill}`,
    };
  }

  return { found: false, strength: 0, detail: "" };
}

/**
 * Check repo topics for a match.
 * Strength: 0.60 (topics are self-reported by the owner)
 */
function matchTopics(skill, inspection) {
  const normalized = normalizeSkill(skill).toLowerCase();
  const topics = (inspection.topics || []).map((t) => t.toLowerCase());

  const topicVariants = [
    normalized,
    normalized.replace(/\s+/g, "-"),
    normalized.replace(/\s+/g, ""),
    normalized.replace(".", ""),
  ];

  const matched = topics.find((t) => topicVariants.some((v) => t === v || t.includes(v)));
  if (matched) {
    return {
      found: true,
      strength: 0.60,
      detail: `GitHub topic "${matched}" in repo ${inspection.name}`,
    };
  }

  return { found: false, strength: 0, detail: "" };
}

/**
 * Check notable files for infrastructure evidence.
 * E.g. Dockerfile → Docker knowledge, redis.conf → Redis
 * Strength: 0.70
 */
function matchNotableFiles(skill, inspection) {
  const normalized = skill.toLowerCase();
  const files = (inspection.notableFiles || []).map((f) => f.toLowerCase());
  const rootFiles = (inspection.rootFiles || []).map((f) => f.toLowerCase());
  const allFiles = [...new Set([...files, ...rootFiles])];

  const fileEvidence = {
    "docker":      ["dockerfile", "docker-compose.yml", "docker-compose.yaml", ".dockerignore"],
    "kubernetes":  ["k8s", "kubernetes.yml", "kubernetes.yaml", "helm"],
    "redis":       ["redis.conf", "redis.yaml"],
    "nginx":       ["nginx.conf", "nginx"],
    "terraform":   ["terraform", ".tf", "main.tf"],
    "aws":         [".aws", "serverless.yml", "cloudformation"],
  };

  const variants = fileEvidence[normalized] || [];
  const matched = allFiles.find((f) => variants.some((v) => f.includes(v)));

  if (matched) {
    return {
      found: true,
      strength: 0.70,
      detail: `Infrastructure file "${matched}" found in repo ${inspection.name}`,
    };
  }

  return { found: false, strength: 0, detail: "" };
}

/**
 * Check README text for skill mention.
 * Strength: 0.35 (README is self-reported, weaker than code)
 */
function matchReadme(skill, inspection) {
  if (!inspection.readmeSummary) return { found: false, strength: 0, detail: "" };

  const normalized = normalizeSkill(skill);
  const readme = inspection.readmeSummary.toLowerCase();
  const skillLower = normalized.toLowerCase();

  // Also check common aliases in README
  const variants = [skillLower, ...Object.entries(SKILL_ALIASES)
    .filter(([, v]) => v.toLowerCase() === skillLower)
    .map(([alias]) => alias)
  ];

  const matched = variants.some((v) => readme.includes(v));
  if (matched) {
    return {
      found: true,
      strength: 0.35,
      detail: `Mentioned in README of repo ${inspection.name}`,
    };
  }

  return { found: false, strength: 0, detail: "" };
}

// ── Determine status from evidence strength ───────────────────────────────────

/**
 * Convert a numeric evidence strength to an evidence status label.
 *
 * Thresholds (tuned for demo quality):
 *   >= 0.80 → SUPPORTED    (package.json match, primary language)
 *   >= 0.50 → PARTIALLY    (topic match, secondary language, infra file)
 *   == 0    + github searched → UNVERIFIED
 *   == 0    + github not searched → CLAIMED
 *   < 0     → CONTRADICTED (negative signal — rare)
 *
 * @param {number} strength
 * @param {boolean} githubSearched - Was GitHub actually available and inspected?
 * @param {boolean} isContradicted
 * @returns {string}
 */
function strengthToStatus(strength, githubSearched, isContradicted = false) {
  if (isContradicted) return "CONTRADICTED";
  if (strength >= 0.80) return "SUPPORTED";
  if (strength >= 0.50) return "PARTIALLY";
  if (strength > 0)     return "PARTIALLY";
  if (githubSearched)   return "UNVERIFIED";
  return "CLAIMED";
}

// ── Main classification function ──────────────────────────────────────────────

/**
 * Classify all resume claims against available GitHub evidence.
 *
 * @param {Array}  claims       - [{ claim, skill, category }] from resume parser
 * @param {Array}  inspections  - Array of inspectRepository() results (may be [])
 * @param {boolean} githubAvailable - Was a GitHub URL provided and accessible?
 *
 * @returns {object} {
 *   claims: EvidenceClaim[],
 *   coveragePercent: number,  // % of claims that are SUPPORTED or PARTIALLY
 *   summary: { SUPPORTED, PARTIALLY, CLAIMED, UNVERIFIED, CONTRADICTED }
 * }
 */
function classifyEvidence(claims, inspections = [], githubAvailable = false) {
  const githubSearched = githubAvailable && inspections.length > 0;

  const classified = claims.map((rawClaim) => {
    const skill = normalizeSkill(rawClaim.skill || "");
    const sources = [
      // Resume is always a source (claim came from resume)
      { type: "resume", found: true, detail: "Stated in resume", relevance: 0.3 },
    ];

    let bestStrength = 0;
    let bestDetail = "";
    let isContradicted = false;

    // Run each inspection through all matchers
    for (const inspection of inspections) {
      if (inspection.isForked) continue; // skip forks — not original work

      const matchers = [
        matchPackageJson(skill, inspection),
        matchRequirementsTxt(skill, inspection),
        matchLanguages(skill, inspection),
        matchTopics(skill, inspection),
        matchNotableFiles(skill, inspection),
        matchReadme(skill, inspection),
      ];

      for (const match of matchers) {
        if (match.found && match.strength > bestStrength) {
          bestStrength = match.strength;
          bestDetail = match.detail;
        }
      }
    }

    // Add GitHub source if we searched
    if (githubSearched) {
      sources.push({
        type: "github",
        found: bestStrength > 0,
        detail: bestDetail || `No GitHub evidence found for "${skill}"`,
        relevance: bestStrength,
      });
    }

    const status = strengthToStatus(bestStrength, githubSearched, isContradicted);

    // Confidence is higher when we have more inspections to check against
    // and lower when GitHub was available but we only did minimal inspection
    const confidence = githubSearched
      ? Math.min(0.90, 0.50 + inspections.length * 0.05 + bestStrength * 0.40)
      : 0.30; // low confidence if we only have resume

    return {
      claim:           rawClaim.claim,
      skill,
      category:        rawClaim.category || "",
      sources,
      status,
      confidence:      Math.round(confidence * 100) / 100,
      evidenceStrength: Math.round(bestStrength * 100) / 100,
    };
  });

  // ── Summary statistics ──────────────────────────────────────────────────────
  const summary = {
    SUPPORTED:    0,
    PARTIALLY:    0,
    CLAIMED:      0,
    UNVERIFIED:   0,
    CONTRADICTED: 0,
  };

  for (const c of classified) {
    summary[c.status] = (summary[c.status] || 0) + 1;
  }

  const evidenced = summary.SUPPORTED + summary.PARTIALLY;
  const coveragePercent =
    classified.length > 0
      ? Math.round((evidenced / classified.length) * 100)
      : 0;

  console.log(
    `[EvidenceEngine] Classified ${classified.length} claims — coverage: ${coveragePercent}%`,
    summary
  );

  return { claims: classified, coveragePercent, summary };
}

/**
 * Extract skill claims from the parsed resume profile.
 * The resume parser returns skills[] and projects[].
 * This converts them into the claim format the evidence engine needs.
 *
 * @param {object} resumeProfile - Output of ai_service.parseResume()
 * @returns {Array<{ claim, skill, category }>}
 */
function extractClaimsFromProfile(resumeProfile) {
  const claims = [];

  // Each skill is a direct claim
  for (const skill of resumeProfile.skills || []) {
    if (skill && skill.trim()) {
      claims.push({
        claim:    skill.trim(),
        skill:    normalizeSkill(skill.trim()),
        category: inferCategory(skill),
      });
    }
  }

  // Each project's tech stack items are claims
  for (const project of resumeProfile.projects || []) {
    for (const tech of project.techStack || []) {
      if (tech && tech.trim()) {
        const normalized = normalizeSkill(tech.trim());
        // Avoid duplicates
        if (!claims.some((c) => c.skill === normalized)) {
          claims.push({
            claim:    `Used ${tech.trim()} in project "${project.name || "unnamed"}"`,
            skill:    normalized,
            category: inferCategory(tech),
          });
        }
      }
    }
  }

  // Experience descriptions add implicit claims
  for (const exp of resumeProfile.experience || []) {
    // Don't add experience-based claims as skills — too vague.
    // The skills[] and projects[].techStack[] are sufficient.
  }

  return claims;
}

/**
 * Infer a broad category for a skill.
 * @param {string} skill
 * @returns {string}
 */
function inferCategory(skill) {
  const s = (skill || "").toLowerCase();

  if (["react", "vue", "angular", "next.js", "html", "css", "tailwind", "svelte"].some(k => s.includes(k))) return "frontend";
  if (["node", "express", "django", "flask", "fastapi", "spring", "rails", "laravel"].some(k => s.includes(k))) return "backend";
  if (["mongodb", "postgresql", "mysql", "redis", "sqlite", "cassandra", "dynamodb", "prisma", "mongoose"].some(k => s.includes(k))) return "database";
  if (["docker", "kubernetes", "aws", "gcp", "azure", "terraform", "nginx", "ci/cd", "jenkins"].some(k => s.includes(k))) return "devops";
  if (["tensorflow", "pytorch", "langchain", "openai", "machine learning", "ml", "nlp", "llm"].some(k => s.includes(k))) return "ai/ml";
  if (["typescript", "javascript", "python", "java", "go", "rust", "c++", "c#", "ruby"].some(k => s.includes(k))) return "language";
  if (["git", "github", "gitlab", "jira", "agile", "scrum"].some(k => s.includes(k))) return "tools";

  return "other";
}

module.exports = {
  classifyEvidence,
  extractClaimsFromProfile,
  normalizeSkill,
};
