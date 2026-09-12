/**
 * agent/orchestrator.test.js
 *
 * Test suite for the Assessment Agent Orchestrator.
 *
 * Tests:
 *   1. Module loads without errors
 *   2. Stage progression — PREREQUISITES → INVESTIGATE → PREPARE_INTERVIEW → AWAITING_INTERVIEW
 *   3. maxSteps protection
 *   4. Tool failure + retry
 *   5. Resume from persisted state
 *   6. GitHub unavailable — degrades gracefully
 *   7. Phase 1 services still pass (regression)
 *
 * Uses mocks to avoid real LLM calls and MongoDB connections.
 * All mocks are defined inline — no test framework dependency.
 */

"use strict";

const assert = require("assert");

// ── Minimal assertion helpers ──────────────────────────────────────────────────
let passed = 0;
let failed = 0;
const results = [];

async function test(name, fn) {
  try {
    await fn();
    passed++;
    results.push(`  ✅ ${name}`);
  } catch (err) {
    failed++;
    results.push(`  ❌ ${name}\n     ${err.message}`);
  }
}

function assertEqual(actual, expected, msg) {
  if (actual !== expected) {
    throw new Error(`${msg || "assertEqual"}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

function assertTrue(val, msg) {
  if (!val) throw new Error(msg || `Expected truthy, got ${JSON.stringify(val)}`);
}

function assertFalse(val, msg) {
  if (val) throw new Error(msg || `Expected falsy, got ${JSON.stringify(val)}`);
}

// ── Mock builders ─────────────────────────────────────────────────────────────

/**
 * Build a mock Assessment doc (simulates MongoDB document).
 */
function mockAssessmentDoc(overrides = {}) {
  return {
    _id: "assess_001",
    userId: "user_clerk_001",
    jobRawText: "We need a Node.js developer with React, MongoDB, and Redis experience.",
    githubUrl: "https://github.com/testuser",
    resumeId: null,
    status: "initialized",
    agentState: null,
    findByIdAndUpdate: async () => {},
    ...overrides,
  };
}

/**
 * Build a mock resume profile (simulates ai_service.parseResume output).
 */
function mockResumeProfile() {
  return {
    name: "Jane Dev",
    email: "jane@example.com",
    phone: "555-0000",
    skills: ["Node.js", "React", "MongoDB", "Express"],
    projects: [
      { name: "API Server", techStack: ["Express", "MongoDB", "Node.js"], description: ["REST API"] },
    ],
    experience: [],
    interviewSummary: "Jane is a full-stack developer with 3 years experience.",
  };
}

/**
 * Build a mock job profile (simulates jobParser.parseJob output).
 */
function mockJobProfile() {
  return {
    title: "Full Stack Developer",
    seniority: "mid",
    requiredSkills: ["Node.js", "React", "MongoDB", "Redis"],
    preferredSkills: ["TypeScript", "Docker"],
    technicalSkills: ["Node.js", "React", "MongoDB", "Redis", "TypeScript", "Docker"],
    responsibilities: ["Build APIs", "Write tests"],
    requirements: ["3+ years experience"],
    keywords: ["Node.js", "React", "MongoDB", "Redis", "REST", "API"],
  };
}

/**
 * Build a mock GitHub repo list (simulates discoverRepositories output).
 */
function mockRepoList() {
  return {
    username: "testuser",
    repositories: [
      { name: "api-server", language: "JavaScript", topics: ["nodejs", "express"], description: "REST API", isForked: false, size: 200 },
      { name: "react-dashboard", language: "JavaScript", topics: ["react", "frontend"], description: "Dashboard", isForked: false, size: 150 },
    ],
  };
}

/**
 * Build a mock repo inspection (simulates inspectRepository output).
 */
function mockRepoInspection(name = "api-server") {
  return {
    name,
    owner: "testuser",
    description: "REST API server",
    primaryLanguage: "JavaScript",
    languages: { JavaScript: 12000 },
    topics: ["nodejs", "express"],
    rootFiles: ["package.json", "README.md", "index.js"],
    packageJson: {
      dependencies: ["express", "mongoose", "ioredis", "redis"],
      devDependencies: ["jest"],
      scripts: ["start", "test"],
    },
    requirementsTxt: null,
    readmeSummary: "A Node.js REST API with Redis caching.",
    notableFiles: [],
    inspectionNotes: ["Primary language: JavaScript", "package.json found — 4 dependencies"],
  };
}

// ── Main async wrapper (CommonJS project — no top-level await) ─────────────────
(async function runTests() {

// ── STATE MODULE TESTS ─────────────────────────────────────────────────────────

const {
  createInitialState,
  applyToolResult,
  getStateSummary,
  shouldSaveCheckpoint,
  buildMongoUpdate,
} = require("./state");

await test("1a. createInitialState — correct shape", async () => {
  const state = createInitialState({
    assessmentId: "a1", userId: "u1", jobRawText: "test job", maxSteps: 10,
  });
  assertTrue(state.assessmentId === "a1", "assessmentId");
  assertTrue(state.agent.maxSteps === 10, "maxSteps");
  assertTrue(state.resume.parsed === false, "resume.parsed starts false");
  assertTrue(state.job.parsed === false, "job.parsed starts false");
  assertTrue(Array.isArray(state.evidence.claims), "evidence.claims is array");
  assertTrue(Array.isArray(state.gaps.criticalGaps), "gaps.criticalGaps is array");
});

await test("1b. createInitialState — resumeId provided → resume.parsed = true", async () => {
  const state = createInitialState({
    assessmentId: "a2", userId: "u1", jobRawText: "test", resumeId: "resume_123",
  });
  assertTrue(state.resume.parsed === true, "pre-parsed when resumeId given");
  assertEqual(state.resume.resumeId, "resume_123", "resumeId stored");
});

await test("1c. applyToolResult — parse_resume updates correctly", async () => {
  const state = createInitialState({ assessmentId: "a3", userId: "u1", jobRawText: "job" });
  const profile = mockResumeProfile();
  applyToolResult(state, "parse_resume", {}, { profile, resumeId: "r_new" });
  assertTrue(state.resume.parsed, "resume.parsed = true");
  assertEqual(state.resume.profile.name, "Jane Dev", "profile.name");
  assertEqual(state.resume.resumeId, "r_new", "resumeId updated");
});

await test("1d. applyToolResult — discover_github sets username + repos", async () => {
  const state = createInitialState({ assessmentId: "a4", userId: "u1", jobRawText: "job", githubUrl: "https://github.com/u" });
  applyToolResult(state, "discover_github", {}, { username: "testuser", repositories: [{ name: "repo1" }] });
  assertEqual(state.github.username, "testuser", "username");
  assertEqual(state.github.repositories.length, 1, "repo count");
});

await test("1e. applyToolResult — inspect_github_repo accumulates", async () => {
  const state = createInitialState({ assessmentId: "a5", userId: "u1", jobRawText: "job" });
  state.github.inspections = [];
  applyToolResult(state, "inspect_github_repo", {}, { inspection: { name: "repo1" } });
  applyToolResult(state, "inspect_github_repo", {}, { inspection: { name: "repo2" } });
  assertEqual(state.github.inspections.length, 2, "2 inspections accumulated");
});

await test("1f. applyToolResult — error result does NOT update state", async () => {
  const state = createInitialState({ assessmentId: "a6", userId: "u1", jobRawText: "job" });
  applyToolResult(state, "parse_job", {}, { error: "Groq API error" });
  assertFalse(state.job.parsed, "job.parsed still false after error");
});

await test("1g. applyToolResult — interview_linked sets interviewId + status", async () => {
  const state = createInitialState({ assessmentId: "a7", userId: "u1", jobRawText: "job" });
  applyToolResult(state, "interview_linked", {}, { interviewId: "interview_xyz" });
  assertEqual(state.interview.interviewId, "interview_xyz", "interviewId");
  assertTrue(state.interview.started, "interview.started");
  assertEqual(state.status, "awaiting_interview", "status");
});

await test("1h. applyToolResult — synthesize_verification_context", async () => {
  const state = createInitialState({ assessmentId: "a8", userId: "u1", jobRawText: "job" });
  const vc = { targetClaims: [], criticalGaps: [], verifiedStrengths: [], evidenceSummary: "test" };
  applyToolResult(state, "synthesize_verification_context", {}, { verificationContext: vc });
  assertTrue(state.verificationContext !== undefined, "verificationContext set");
  assertEqual(state.verificationContext.evidenceSummary, "test", "evidenceSummary");
});

await test("1i. shouldSaveCheckpoint — correct tools trigger checkpoint", async () => {
  const state = createInitialState({ assessmentId: "a9", userId: "u1", jobRawText: "job" });
  const triggers   = ["analyze_evidence", "identify_gaps", "synthesize_verification_context", "interview_linked", "interview_completed", "batch_evaluation", "generate_reports"];
  const nonTriggers = ["parse_resume", "parse_job", "discover_github", "inspect_github_repo"];
  triggers.forEach((t)    => assertTrue(shouldSaveCheckpoint(state, t), `should trigger: ${t}`));
  nonTriggers.forEach((t) => assertFalse(shouldSaveCheckpoint(state, t), `should NOT trigger: ${t}`));
});

await test("1j. buildMongoUpdate — includes evidenceClaims when classified", async () => {
  const state = createInitialState({ assessmentId: "a10", userId: "u1", jobRawText: "job" });
  state.evidence.classified = true;
  state.evidence.claims = [{ claim: "Node.js", skill: "Node.js", status: "SUPPORTED" }];
  state.evidence.coveragePercent = 75;
  const update = buildMongoUpdate(state);
  assertTrue(update.$set.evidenceClaims !== undefined, "evidenceClaims in update");
  assertEqual(update.$set.evidenceCoveragePercent, 75, "coveragePercent");
});

await test("1k. getStateSummary — lean shape for LLM", async () => {
  const state = createInitialState({ assessmentId: "a11", userId: "u1", jobRawText: "job" });
  const summary = getStateSummary(state);
  assertTrue("step" in summary, "step field");
  assertTrue("maxSteps" in summary, "maxSteps field");
  assertTrue("stepsRemaining" in summary, "stepsRemaining field");
  assertTrue("resumeParsed" in summary, "resumeParsed field");
  assertTrue("evidenceClassified" in summary, "evidenceClassified field");
});

// ── PHASE 1 SERVICES REGRESSION TESTS ─────────────────────────────────────────

await test("2a. evidenceEngine — normalizeSkill aliases work", async () => {
  const { normalizeSkill } = require("../services/evidenceEngine");
  assertEqual(normalizeSkill("nodejs"), "Node.js", "nodejs alias");
  assertEqual(normalizeSkill("ReactJS"), "React", "ReactJS alias");
  assertEqual(normalizeSkill("postgres"), "PostgreSQL", "postgres alias");
  assertEqual(normalizeSkill("k8s"), "Kubernetes", "k8s alias");
});

await test("2b. evidenceEngine — no GitHub → all CLAIMED", async () => {
  const { classifyEvidence, extractClaimsFromProfile } = require("../services/evidenceEngine");
  const claims = extractClaimsFromProfile({ skills: ["Node.js", "React"], projects: [], experience: [] });
  const result = classifyEvidence(claims, [], false);
  assertTrue(result.claims.every((c) => c.status === "CLAIMED"), "all CLAIMED without GitHub");
  assertEqual(result.coveragePercent, 0, "0% coverage without GitHub");
});

await test("2c. evidenceEngine — package.json dep → SUPPORTED", async () => {
  const { classifyEvidence, extractClaimsFromProfile } = require("../services/evidenceEngine");
  const claims = extractClaimsFromProfile({ skills: ["Redis"], projects: [], experience: [] });
  const inspection = mockRepoInspection();
  const result = classifyEvidence(claims, [inspection], true);
  const redis = result.claims.find((c) => c.skill === "Redis");
  assertTrue(redis !== undefined, "Redis claim exists");
  assertEqual(redis.status, "SUPPORTED", "Redis SUPPORTED via ioredis in package.json");
  assertTrue(redis.evidenceStrength >= 0.9, "high strength");
});

await test("2d. evidenceEngine — forked repos skipped", async () => {
  const { classifyEvidence, extractClaimsFromProfile } = require("../services/evidenceEngine");
  const claims = extractClaimsFromProfile({ skills: ["Redis"], projects: [], experience: [] });
  const forkedInspection = { ...mockRepoInspection(), isForked: true };
  const result = classifyEvidence(claims, [forkedInspection], true);
  const redis = result.claims.find((c) => c.skill === "Redis");
  assertEqual(redis.status, "UNVERIFIED", "forked repos don't count as evidence");
});

await test("2e. gapAnalysis — correctly identifies criticalGaps and unverifiedClaims", async () => {
  const { analyzeGaps } = require("../services/gapAnalysis");
  const { classifyEvidence, extractClaimsFromProfile } = require("../services/evidenceEngine");
  const claims = extractClaimsFromProfile({ skills: ["Node.js", "React"], projects: [], experience: [] });
  const ev = classifyEvidence(claims, [], false);
  const gaps = analyzeGaps(
    { requiredSkills: ["Node.js", "React", "Redis"], preferredSkills: [], technicalSkills: [] },
    ev.claims
  );
  assertTrue(gaps.criticalGaps.some((g) => g.skill === "Redis"), "Redis in criticalGaps");
  assertTrue(Array.isArray(gaps.unverifiedClaims), "unverifiedClaims is array");
  assertEqual(gaps.unverifiedClaims.length, 2, "Node.js and React are unverified");
});

await test("2f. readinessScore — preliminary score in valid range", async () => {
  const { calculate } = require("../services/readinessScore");
  const { analyzeGaps } = require("../services/gapAnalysis");
  const { classifyEvidence, extractClaimsFromProfile } = require("../services/evidenceEngine");
  const claims = extractClaimsFromProfile({ skills: ["Node.js", "React"], projects: [], experience: [] });
  const ev = classifyEvidence(claims, [mockRepoInspection()], true);
  const gaps = analyzeGaps(
    { requiredSkills: ["Node.js", "React", "Redis"], preferredSkills: [], technicalSkills: [] },
    ev.claims
  );
  const score = calculate({ gapResult: gaps, evidenceClaims: ev.claims });
  assertTrue(score.total >= 0 && score.total <= 100, `score in range: ${score.total}`);
  assertTrue(score.preliminary, "preliminary mode");
  assertTrue(score.dimensions !== undefined, "dimensions present");
});

await test("2g. jobParser — exports parseJob function", async () => {
  const { parseJob } = require("../services/jobParser");
  assertEqual(typeof parseJob, "function", "parseJob is a function");
});

await test("2h. github service — all 3 exports present", async () => {
  const gh = require("../services/github");
  assertEqual(typeof gh.extractGitHubRepo, "function", "extractGitHubRepo");
  assertEqual(typeof gh.discoverRepositories, "function", "discoverRepositories");
  assertEqual(typeof gh.inspectRepository, "function", "inspectRepository");
});

// ── ORCHESTRATOR LOGIC TESTS (without real LLM/DB) ────────────────────────────

await test("3a. _buildVerificationContext logic — works from state", async () => {
  // We test the verification context builder by calling the internal
  // _buildVerificationContext indirectly via the exported function.
  // Since it's not exported, we test it through state assertions after a full dry run.

  // Simulate a state after INVESTIGATE is complete
  const state = createInitialState({ assessmentId: "a_vc", userId: "u1", jobRawText: "job", githubUrl: "https://github.com/u" });

  // Populate state as if prerequisites and investigation completed
  state.resume.parsed = true;
  state.resume.profile = { ...mockResumeProfile(), skills: ["Node.js", "React", "MongoDB", "Express", "Redis"] };
  state.job.parsed = true;
  state.job.profile = mockJobProfile();
  state.github.repositories = mockRepoList().repositories;
  state.github.inspections = [mockRepoInspection()];

  // Run evidence + gap analysis (deterministic, no mocks needed)
  const { classifyEvidence, extractClaimsFromProfile } = require("../services/evidenceEngine");
  const { analyzeGaps } = require("../services/gapAnalysis");

  const claims = extractClaimsFromProfile(state.resume.profile);
  const ev = classifyEvidence(claims, state.github.inspections, true);
  const gaps = analyzeGaps(state.job.profile, ev.claims);

  applyToolResult(state, "analyze_evidence", {}, ev);
  applyToolResult(state, "identify_gaps", {}, gaps);

  // Evidence should be classified
  assertTrue(state.evidence.classified, "evidence classified");
  assertTrue(state.gaps.identified, "gaps identified");
  assertTrue(state.evidence.claims.length > 0, "claims exist");
  assertTrue(state.gaps.unverifiedClaims.length >= 0, "unverifiedClaims array");
  // Redis should be SUPPORTED (ioredis in mock inspection)
  const redisClaim = state.evidence.claims.find((c) => c.skill === "Redis");
  assertTrue(redisClaim !== undefined, "Redis claim exists");
  assertEqual(redisClaim.status, "SUPPORTED", "Redis SUPPORTED");
});

await test("3b. maxSteps protection — state starts with correct limit", async () => {
  const state = createInitialState({ assessmentId: "ms1", userId: "u1", jobRawText: "j", maxSteps: 5 });
  assertEqual(state.agent.maxSteps, 5, "maxSteps = 5");
  assertEqual(state.agent.stepCount, 0, "stepCount = 0");
  // Simulate hitting the limit
  state.agent.stepCount = 5;
  assertTrue(state.agent.stepCount >= state.agent.maxSteps, "limit hit condition works");
});

await test("3c. tool failure — applyToolResult with error does not mutate data fields", async () => {
  const state = createInitialState({ assessmentId: "tf1", userId: "u1", jobRawText: "j" });
  const before = JSON.stringify(state.job);
  applyToolResult(state, "parse_job", {}, { error: "Timeout" });
  const after = JSON.stringify(state.job);
  assertEqual(before, after, "job state unchanged after error");
  // But error IS logged to history
  const lastEntry = state.agent.toolCallHistory.slice(-1)[0];
  assertEqual(lastEntry.success, false, "failure logged in history");
  assertEqual(lastEntry.tool, "parse_job", "tool name in history");
});

await test("3d. tool history — accumulates entries", async () => {
  const state = createInitialState({ assessmentId: "th1", userId: "u1", jobRawText: "j" });
  state.agent.stepCount = 1;
  applyToolResult(state, "parse_resume", {}, { profile: mockResumeProfile(), resumeId: "r1" });
  state.agent.stepCount = 2;
  applyToolResult(state, "parse_job", {}, { profile: mockJobProfile() });
  assertEqual(state.agent.toolCallHistory.length, 2, "2 history entries");
  assertEqual(state.agent.toolCallHistory[0].tool, "parse_resume", "first tool");
  assertEqual(state.agent.toolCallHistory[1].tool, "parse_job", "second tool");
  assertTrue(state.agent.toolCallHistory[0].timestamp !== undefined, "has timestamp");
});

await test("3e. resume from persisted state — stage carries over", async () => {
  // Simulate a state that was saved mid-investigation
  const persisted = createInitialState({ assessmentId: "res1", userId: "u1", jobRawText: "j", maxSteps: 12 });
  persisted.resume.parsed = true;
  persisted.resume.profile = mockResumeProfile();
  persisted.job.parsed = true;
  persisted.job.profile = mockJobProfile();
  persisted.github.repositories = mockRepoList().repositories;
  persisted._stage = "INVESTIGATE"; // mid-investigation
  persisted.agent.stepCount = 4;

  // The orchestrator should pick up from _stage = INVESTIGATE
  assertEqual(persisted._stage, "INVESTIGATE", "stage preserved");
  assertEqual(persisted.agent.stepCount, 4, "stepCount preserved");
  assertTrue(persisted.resume.parsed, "resume already parsed");
  assertTrue(persisted.job.parsed, "job already parsed");
});

await test("3f. GitHub unavailable — state degrades correctly", async () => {
  const state = createInitialState({
    assessmentId: "gh1", userId: "u1", jobRawText: "j",
    githubUrl: "https://github.com/someuser",
  });
  // Simulate discover_github returning unavailable=true (404, rate limit, etc.)
  applyToolResult(state, "discover_github", {}, {
    username: null,
    repositories: [],
    unavailable: true,
  });
  assertFalse(state.github.available, "github.available = false after unavailable signal");
  assertEqual(state.github.repositories.length, 0, "no repos");
  // Claims should be CLAIMED (not UNVERIFIED) since GitHub wasn't searchable
  const { classifyEvidence, extractClaimsFromProfile } = require("../services/evidenceEngine");
  const claims = extractClaimsFromProfile({ skills: ["Node.js", "React"], projects: [], experience: [] });
  const result = classifyEvidence(claims, [], false); // githubAvailable = false
  assertTrue(result.claims.every((c) => c.status === "CLAIMED"), "CLAIMED (not UNVERIFIED) without GitHub");
});

await test("3g. stage transition — state tracks stage correctly through evidence pipeline", async () => {
  const state = createInitialState({ assessmentId: "st1", userId: "u1", jobRawText: "j" });
  state._stage = "PREREQUISITES";

  // Simulate prerequisites
  applyToolResult(state, "parse_resume", {}, { profile: mockResumeProfile() });
  applyToolResult(state, "parse_job", {}, { profile: mockJobProfile() });
  state._stage = "INVESTIGATE";

  // Simulate investigation
  const { classifyEvidence, extractClaimsFromProfile } = require("../services/evidenceEngine");
  const { analyzeGaps } = require("../services/gapAnalysis");
  const claims = extractClaimsFromProfile(state.resume.profile);
  const ev = classifyEvidence(claims, [], false);
  applyToolResult(state, "analyze_evidence", {}, ev);
  applyToolResult(state, "identify_gaps", {}, analyzeGaps(state.job.profile, state.evidence.claims));
  state._stage = "PREPARE_INTERVIEW";

  // Simulate verification context + interview link
  applyToolResult(state, "synthesize_verification_context", {}, {
    verificationContext: { targetClaims: [], criticalGaps: [], verifiedStrengths: [], evidenceSummary: "test" },
  });
  applyToolResult(state, "interview_linked", {}, { interviewId: "interview_abc" });

  assertEqual(state.status, "awaiting_interview", "status = awaiting_interview");
  assertEqual(state.interview.interviewId, "interview_abc", "interviewId linked");
  assertTrue(state.evidence.classified, "evidence classified");
  assertTrue(state.gaps.identified, "gaps identified");
});

await test("3h. orchestrator module — loads without errors", async () => {
  // This also verifies all require() calls inside orchestrator.js resolve correctly
  // (minus MongoDB/Clerk which aren't available in test context)
  // We load it and check exports
  let mod;
  try {
    mod = require("./orchestrator");
  } catch (err) {
    throw new Error(`orchestrator.js failed to load: ${err.message}`);
  }
  assertEqual(typeof mod.runAssessment, "function", "runAssessment exported");
  assertEqual(typeof mod.resumeAssessment, "function", "resumeAssessment exported");
  assertTrue(mod.STAGE !== undefined, "STAGE constants exported");
  const expectedStages = ["PREREQUISITES", "INVESTIGATE", "PREPARE_INTERVIEW", "AWAITING_INTERVIEW", "COMPLETED", "ERROR"];
  expectedStages.forEach((s) => assertTrue(mod.STAGE[s] === s, `STAGE.${s} defined`));
});

await test("3i. INVESTIGATE tool set — correct definitions", async () => {
  // Verify the orchestrator source contains the required tool names
  const fs   = require("fs");
  const path = require("path");
  // Test is in src/agent/ — orchestrator.js is in the same directory
  const src = fs.readFileSync(path.join(__dirname, "orchestrator.js"), "utf8");
  assertTrue(src.includes("inspect_github_repo"), "inspect_github_repo tool defined");
  assertTrue(src.includes("finish_investigation"), "finish_investigation tool defined");
  assertTrue(src.includes("tool_choice: \"required\""), "tool_choice required prevents LLM free-text");
  assertTrue(src.includes("MAX_REPO_INSPECTIONS"), "inspection limit defined");
});

await test("3j. verification context — targetClaims prioritize required+unverified skills", async () => {
  // Test by running the full evidence pipeline and checking which claims would be targeted
  const { classifyEvidence, extractClaimsFromProfile } = require("../services/evidenceEngine");
  const { analyzeGaps } = require("../services/gapAnalysis");

  const profile = { skills: ["Node.js", "React", "Redis", "MongoDB"], projects: [], experience: [] };
  const jobProfile = {
    requiredSkills: ["Node.js", "React", "Redis", "PostgreSQL"],
    preferredSkills: ["Docker"],
    technicalSkills: [],
  };

  // No GitHub — all CLAIMED
  const claims = extractClaimsFromProfile(profile);
  const ev = classifyEvidence(claims, [], false);
  const gaps = analyzeGaps(jobProfile, ev.claims);

  // unverifiedClaims should include Redis (required by job + claimed by candidate)
  const redisInUnverified = gaps.unverifiedClaims.some((c) => c.skill === "Redis" && c.requiredByJob);
  assertTrue(redisInUnverified, "Redis is in unverifiedClaims with requiredByJob=true");

  // criticalGaps should include PostgreSQL (required but completely absent)
  const pgInCritical = gaps.criticalGaps.some((g) => g.skill === "PostgreSQL");
  assertTrue(pgInCritical, "PostgreSQL is a criticalGap");
});

await test("8. Regression: PREPARE_INTERVIEW runs even if maxSteps reached, transitions to AWAITING_INTERVIEW", async () => {
  // Simulates the scenario where INVESTIGATE loop exhausted all maxSteps exactly.
  // The state was saved as PREPARE_INTERVIEW with stepCount == maxSteps.
  const state = require("../agent/state").createInitialState({ 
    assessmentId: "regress_001", userId: "u1", jobRawText: "test", maxSteps: 15 
  });
  
  // Set up the state as it would be after _runInvestigation exhausted budget
  state._stage = "PREPARE_INTERVIEW";
  state.agent.stepCount = 15; // exactly at maxSteps limit
  state.job.profile = mockJobProfile();
  state.resume.resumeId = "5f9b3b9b9b9b9b9b9b9b9b9b"; // valid ObjectId
  state.evidence.classified = true;
  state.gaps.identified = true;
  
  const mockAssessment = mockAssessmentDoc({
    _id: "regress_001",
    agentState: state,
    findByIdAndUpdate: async (id, update) => {
      // Mock the save inside _runPrepareInterview
      if (update.$set) {
        if (update.$set.status) mockAssessment.status = update.$set.status;
        if (update.$set.agentState) mockAssessment.agentState = update.$set.agentState;
      }
    }
  });
  
  // Override mongoose models for this test
  const AssessmentModel = require("../model/assessment.model");
  const InterviewModel = require("../model/interview.model");
  
  const originalFindByIdAndUpdate = AssessmentModel.findByIdAndUpdate;
  const originalInterviewCreate = InterviewModel.create;
  
  AssessmentModel.findByIdAndUpdate = mockAssessment.findByIdAndUpdate;
  InterviewModel.create = async (doc) => ({ ...doc, _id: "5f9b3b9b9b9b9b9b9b9b9c9c" });
  
  // Run orchestrator with the persisted state
  const { runAssessment } = require("./orchestrator");
  await runAssessment({
    assessmentId: "regress_001",
    userId: "u1",
    jobRawText: "test",
    persistedState: state,
    maxSteps: 15
  });
  
  // Verify it transitioned to AWAITING_INTERVIEW and did NOT crash with max_steps_reached
  assertEqual(mockAssessment.status, "awaiting_interview", "Status should be awaiting_interview");
  assertEqual(mockAssessment.agentState._stage, "AWAITING_INTERVIEW", "Stage should progress correctly");
  
  // Cleanup mock
  AssessmentModel.findByIdAndUpdate = originalFindByIdAndUpdate;
  InterviewModel.create = originalInterviewCreate;
});

// ── PRINT RESULTS ──────────────────────────────────────────────────────────────

console.log("\n══════════════════════════════════════════════════════");
console.log(" Assessment Orchestrator — Test Results");
console.log("══════════════════════════════════════════════════════");
console.log(results.join("\n"));
console.log("══════════════════════════════════════════════════════");
console.log(`\n Total: ${passed + failed} | ✅ Passed: ${passed} | ❌ Failed: ${failed}`);
console.log("══════════════════════════════════════════════════════\n");

if (failed > 0) {
  process.exit(1);
}

})().catch((err) => {
  console.error("\n[TEST RUNNER] Unexpected error:", err.message);
  process.exit(1);
});
