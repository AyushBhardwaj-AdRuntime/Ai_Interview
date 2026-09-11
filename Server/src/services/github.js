/**
 * services/github.js
 *
 * GitHub API service — repository discovery and targeted inspection.
 *
 * EXISTING FUNCTION (unchanged behavior):
 *   extractGitHubRepo(url) — returns basic repo list for pre-interview flow
 *   Original behavior preserved: returns [{ name, full_name, description }]
 *
 * NEW ADDITIONS:
 *   discoverRepositories(url) — enhanced repo list with language + topics (for evidence engine)
 *   inspectRepository(owner, repoName) — targeted deep inspection for evidence investigation
 */

const axios = require("axios");

// Build auth header if GITHUB_TOKEN is set (avoids 60 req/hr anonymous limit)
function githubHeaders() {
  const token = process.env.GITHUB_TOKEN;
  return token
    ? { Authorization: `token ${token}`, "User-Agent": "MockHire-Agent/1.0" }
    : { "User-Agent": "MockHire-Agent/1.0" };
}

/**
 * EXISTING FUNCTION — unchanged.
 * Used by the pre-interview flow. Returns minimal repo data.
 *
 * @param {string} github - GitHub profile URL
 * @returns {Promise<Array<{ name, full_name, description }>>}
 */
async function extractGitHubRepo(github) {
  const githubUrl = github.endsWith("/") ? github.slice(0, -1) : github;
  const githubUrlUsername = githubUrl.split("/").pop();

  const userRepo = await axios.get(
    `https://api.github.com/users/${githubUrlUsername}/repos`,
    { headers: githubHeaders() }
  );

  const filterRepo = userRepo.data.map((x) => ({
    name: x.name,
    full_name: x.full_name,
    description: x.description,
  }));

  return filterRepo;
}

/**
 * NEW — Enhanced repository discovery for the assessment agent.
 * Called once in the PREREQUISITE stage to build the investigation context.
 *
 * Returns richer repo data: language, topics, size, updated_at.
 * The LLM uses this to decide which repos are worth inspecting deeply.
 *
 * @param {string} githubUrl - GitHub profile URL (e.g. https://github.com/username)
 * @returns {Promise<{ username: string, repositories: Array }>}
 *
 * Repository shape:
 *   { name, full_name, description, language, topics[], size, updatedAt, isForked }
 */
async function discoverRepositories(githubUrl) {
  const url = githubUrl.endsWith("/") ? githubUrl.slice(0, -1) : githubUrl;
  const username = url.split("/").pop();

  if (!username) throw new Error("[GitHub] Could not parse username from URL: " + githubUrl);

  console.log(`[GitHub] Discovering repos for: ${username}`);

  let reposData;
  try {
    const response = await axios.get(
      `https://api.github.com/users/${username}/repos?per_page=30&sort=updated`,
      { headers: githubHeaders() }
    );
    reposData = response.data;
  } catch (err) {
    if (err.response?.status === 404) {
      throw new Error(`[GitHub] User not found: ${username}`);
    }
    if (err.response?.status === 403) {
      throw new Error("[GitHub] API rate limit hit. Set GITHUB_TOKEN env var.");
    }
    throw err;
  }

  const repositories = reposData.map((repo) => ({
    name:        repo.name,
    full_name:   repo.full_name,
    description: repo.description || "",
    language:    repo.language || null,      // primary language GitHub detected
    topics:      repo.topics || [],          // repo topics/tags set by owner
    size:        repo.size,                  // KB — rough proxy for project size
    updatedAt:   repo.updated_at,
    isForked:    repo.fork,                  // forked repos are usually weaker evidence
    stars:       repo.stargazers_count,
  }));

  console.log(`[GitHub] Discovered ${repositories.length} repos for ${username}`);

  return { username, repositories };
}

/**
 * NEW — Targeted deep inspection of a single repository.
 * Called by the LLM agent in the INVESTIGATE stage for repos it deems relevant.
 *
 * Runs in sequential steps — each step only runs if the previous indicates it's needed.
 * Does NOT download the entire repository.
 *
 * @param {string} owner    - GitHub username
 * @param {string} repoName - Repository name
 * @returns {Promise<object>} Inspection result
 *
 * Return shape:
 * {
 *   name, owner, description, primaryLanguage,
 *   languages: { JavaScript: 12400, CSS: 200 },  // all languages with byte counts
 *   topics: [],
 *   rootFiles: [],          // filenames in root directory
 *   packageJson: null | { dependencies, devDependencies, scripts },
 *   readmeSummary: null | string,  // first 1500 chars of README
 *   notableFiles: [],       // interesting files found (Dockerfile, docker-compose, etc.)
 *   inspectionNotes: [],    // what we found / didn't find (for LLM context)
 * }
 */
async function inspectRepository(owner, repoName) {
  const base = `https://api.github.com/repos/${owner}/${repoName}`;
  const headers = githubHeaders();
  const result = {
    name:            repoName,
    owner,
    description:     "",
    primaryLanguage: null,
    languages:       {},
    topics:          [],
    rootFiles:       [],
    packageJson:     null,
    requirementsTxt: null,
    readmeSummary:   null,
    notableFiles:    [],
    inspectionNotes: [],
  };

  console.log(`[GitHub] Inspecting: ${owner}/${repoName}`);

  // ── Step 1: Repo metadata ───────────────────────────────────────────────────
  try {
    const meta = await axios.get(base, { headers });
    result.description     = meta.data.description || "";
    result.primaryLanguage = meta.data.language;
    result.topics          = meta.data.topics || [];
    result.inspectionNotes.push(`Primary language: ${result.primaryLanguage || "unknown"}`);
  } catch (err) {
    result.inspectionNotes.push(`Could not fetch repo metadata: ${err.message}`);
    return result; // can't proceed without basic repo info
  }

  // ── Step 2: Language breakdown ──────────────────────────────────────────────
  try {
    const langRes = await axios.get(`${base}/languages`, { headers });
    result.languages = langRes.data; // { JavaScript: 12400, CSS: 200, ... }
    const topLangs = Object.entries(result.languages)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([lang]) => lang);
    result.inspectionNotes.push(`Languages: ${topLangs.join(", ")}`);
  } catch (err) {
    result.inspectionNotes.push(`Could not fetch language breakdown: ${err.message}`);
  }

  // ── Step 3: Root file tree ──────────────────────────────────────────────────
  try {
    const contentsRes = await axios.get(`${base}/contents`, { headers });
    if (Array.isArray(contentsRes.data)) {
      result.rootFiles = contentsRes.data.map((f) => f.name);

      // Flag notable infrastructure files
      const notable = [
        "Dockerfile", "docker-compose.yml", "docker-compose.yaml",
        ".env.example", "k8s", "terraform",
        "nginx.conf", "redis.conf",
      ];
      result.notableFiles = result.rootFiles.filter((f) =>
        notable.some((n) => f.toLowerCase().includes(n.toLowerCase()))
      );

      if (result.notableFiles.length > 0) {
        result.inspectionNotes.push(`Notable files: ${result.notableFiles.join(", ")}`);
      }
    }
  } catch (err) {
    result.inspectionNotes.push(`Could not fetch root file tree: ${err.message}`);
  }

  // ── Step 4: package.json (Node.js projects) ─────────────────────────────────
  const hasPackageJson = result.rootFiles.includes("package.json");
  if (hasPackageJson) {
    try {
      const pkgRes = await axios.get(`${base}/contents/package.json`, { headers });
      const decoded = Buffer.from(pkgRes.data.content, "base64").toString("utf8");
      const pkg = JSON.parse(decoded);

      result.packageJson = {
        dependencies:    Object.keys(pkg.dependencies    || {}),
        devDependencies: Object.keys(pkg.devDependencies || {}),
        scripts:         Object.keys(pkg.scripts         || {}),
      };

      const allDeps = [...result.packageJson.dependencies, ...result.packageJson.devDependencies];
      result.inspectionNotes.push(
        `package.json found — ${allDeps.length} total dependencies: ${allDeps.slice(0, 15).join(", ")}${allDeps.length > 15 ? "..." : ""}`
      );
    } catch (err) {
      result.inspectionNotes.push(`package.json present but could not read: ${err.message}`);
    }
  }

  // ── Step 5: requirements.txt (Python projects) ──────────────────────────────
  const hasRequirements = result.rootFiles.includes("requirements.txt");
  if (hasRequirements) {
    try {
      const reqRes = await axios.get(`${base}/contents/requirements.txt`, { headers });
      const decoded = Buffer.from(reqRes.data.content, "base64").toString("utf8");
      const packages = decoded
        .split("\n")
        .map((l) => l.split("==")[0].split(">=")[0].trim())
        .filter((l) => l && !l.startsWith("#"));

      result.requirementsTxt = packages;
      result.inspectionNotes.push(
        `requirements.txt found — ${packages.length} packages: ${packages.slice(0, 10).join(", ")}${packages.length > 10 ? "..." : ""}`
      );
    } catch (err) {
      result.inspectionNotes.push(`requirements.txt present but could not read: ${err.message}`);
    }
  }

  // ── Step 6: README (first 1500 chars for context) ───────────────────────────
  const readmeFile = result.rootFiles.find((f) =>
    f.toLowerCase().startsWith("readme")
  );
  if (readmeFile) {
    try {
      const readmeRes = await axios.get(`${base}/contents/${readmeFile}`, { headers });
      const decoded = Buffer.from(readmeRes.data.content, "base64").toString("utf8");
      result.readmeSummary = decoded.slice(0, 1500).trim();
      result.inspectionNotes.push(`README found (${decoded.length} chars)`);
    } catch (err) {
      result.inspectionNotes.push(`README present but could not read: ${err.message}`);
    }
  }

  console.log(`[GitHub] Inspection complete for ${owner}/${repoName}:`, result.inspectionNotes);
  return result;
}

module.exports = {
  extractGitHubRepo,      // existing — unchanged
  discoverRepositories,   // new — enhanced discovery for assessment
  inspectRepository,      // new — targeted deep inspection
};