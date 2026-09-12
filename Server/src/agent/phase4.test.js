/**
 * agent/phase4.test.js
 *
 * Test suite for Phase 4: Post-Interview Evaluation + Reports
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

// ── Mocks ─────────────────────────────────────────────────────────────────────

// Mock DB objects
const mockInterview = {
  _id: "mock_int_1",
  interview: {
    questions: [
      { question: "What is Redis?", answer: "An in-memory data store" },
      { question: "How to scale Node?", answer: "Use cluster module" }
    ]
  }
};

const mockAssessment = {
  _id: "mock_ass_1",
  userId: "user_1",
  interviewId: "mock_int_1",
  status: "evaluating",
  agentState: {
    _stage: "AWAITING_INTERVIEW",
    assessmentId: "mock_ass_1",
    userId: "user_1",
    agent: { stepCount: 5, maxSteps: 15, toolCallHistory: [] },
    interview: { interviewId: "mock_int_1" },
    gaps: { criticalGaps: [], coverageSummary: { totalRequiredSkills: 1, matchedRequiredSkills: 1 } },
    evidence: { claims: [{ claim: "Know Node", skill: "Node", status: "SUPPORTED", evidenceStrength: 0.9 }] },
    resume: { profile: { name: "Alice" } },
    job: { profile: { requiredSkills: ["Node"] } },
    reports: {}
  }
};

// We will mock ai_service's evaluateInterview and generateReports directly on the required module.
// And we'll mock the Mongoose models required by orchestrator.

const ai_service_mock = {
  evaluateCallCount: 0,
  generateCallCount: 0,
  shouldFailEvaluate: 0, // number of times to fail before succeeding
  
  evaluateInterview: async (payload) => {
    ai_service_mock.evaluateCallCount++;
    if (ai_service_mock.shouldFailEvaluate > 0) {
      ai_service_mock.shouldFailEvaluate--;
      throw new Error("Mock LLM evaluation failure");
    }
    
    // Assert payload receives context (Test 2)
    assertTrue(payload.qna && payload.qna.length === 2, "Payload receives full interview Q&A");
    assertTrue(payload.claims && payload.claims.length > 0, "Payload receives claims");
    
    return {
      interviewPerformance: { technical: 90, communication: 85, depth: 80 },
      claimVerifications: [{ claim: "Know Node", score: 9, answerQuality: 8 }],
      strengths: ["Strong Node"],
      weaknesses: [],
      riskAreas: [],
      recommendedActions: [],
      summary: "Good.",
      claimVerificationDetails: []
    };
  },
  
  generateReports: async (payload) => {
    ai_service_mock.generateCallCount++;
    
    return {
      candidateReport: {
        candidate: { name: "Alice" },
        readinessScore: payload.readinessScore,
        summary: "Candidate report",
        strengths: ["Strong Node"],
        skillGaps: [],
        claimVerification: [],
        interviewSummary: "Passed.",
        recommendedActions: []
      },
      hiringReport: {
        candidate: { name: "Alice" },
        readinessScore: payload.readinessScore,
        summary: "Hiring report",
        claimVerification: [],
        verifiedSkills: ["Node"],
        unverifiedClaims: [],
        interviewSummary: "Passed.",
        riskAreas: [],
        recommendedVerificationQuestions: []
      }
    };
  }
};

// ── Tests ──────────────────────────────────────────────────────────────────────

(async function runTests() {
  // Setup mocks for require cache to intercept module loading
  const Module = require('module');
  const originalRequire = Module.prototype.require;
  
  Module.prototype.require = function(path) {
    if (path.includes("model/assessment.model")) {
      return {
        findById: async () => JSON.parse(JSON.stringify(mockAssessment)),
        findByIdAndUpdate: async (id, update) => {
          if (update.$set) Object.assign(mockAssessment, update.$set);
          return mockAssessment;
        }
      };
    }
    if (path.includes("model/interview.model")) {
      return {
        findById: async () => mockInterview
      };
    }
    if (path.includes("ai_service")) {
      return { ...originalRequire.call(this, path), ...ai_service_mock };
    }
    return originalRequire.call(this, path);
  };
  
  const orchestrator = require("./orchestrator");
  
  await test("1, 2, 3, 4, 5, 6, 7, 8: Complete successful evaluation flow", async () => {
    ai_service_mock.evaluateCallCount = 0;
    ai_service_mock.generateCallCount = 0;
    
    // Simulate picking up from evaluating status
    await orchestrator.resumeAssessment("mock_ass_1");
    
    // Assert exactly ONE evaluation call made (Test 3)
    assertEqual(ai_service_mock.evaluateCallCount, 1, "Exactly one LLM evaluation call is made");
    
    // Assert exactly ONE report generation call made
    assertEqual(ai_service_mock.generateCallCount, 1, "Exactly one LLM report generation call is made");
    
    // Assert status became COMPLETED (Test 8)
    assertEqual(mockAssessment.status, "completed", "Assessment becomes COMPLETED");
    
    // Assert Readiness score was calculated deterministically (Test 5)
    assertTrue(mockAssessment.readinessScore > 0 && mockAssessment.readinessScore <= 100, "Readiness score calculated");
    
    // Assert candidate & hiring reports generated (Tests 6 & 7)
    assertTrue(!!mockAssessment.candidateReport, "Candidate report generated");
    assertTrue(!!mockAssessment.hiringReport, "Hiring report generated");
    assertEqual(mockAssessment.candidateReport.readinessScore, mockAssessment.readinessScore, "Report scores match deterministic score");
  });
  
  await test("9. LLM failure retries once and recovers", async () => {
    // Reset state for test
    mockAssessment.status = "evaluating";
    mockAssessment.agentState._stage = "AWAITING_INTERVIEW";
    
    ai_service_mock.evaluateCallCount = 0;
    ai_service_mock.shouldFailEvaluate = 1; // fail once, then succeed
    
    await orchestrator.resumeAssessment("mock_ass_1");
    
    // It should have failed once, retried, and succeeded on the second attempt
    assertEqual(ai_service_mock.evaluateCallCount, 2, "LLM failed once and retried successfully");
    assertEqual(mockAssessment.status, "completed", "Recovered and completed");
  });
  
  await test("10. Second LLM failure transitions to ERROR (no fake results)", async () => {
    // Reset state
    mockAssessment.status = "evaluating";
    mockAssessment.agentState._stage = "AWAITING_INTERVIEW";
    mockAssessment.agentState.reports = { generated: false, candidateReport: null, hiringReport: null };
    mockAssessment.readinessScore = null;
    mockAssessment.candidateReport = null;
    
    ai_service_mock.evaluateCallCount = 0;
    ai_service_mock.shouldFailEvaluate = 3; // fail more times than retries allow (max 2 attempts)
    
    await orchestrator.resumeAssessment("mock_ass_1");
    
    // It should have tried exactly 2 times
    assertEqual(ai_service_mock.evaluateCallCount, 2, "Stopped after 2 attempts");
    
    // It should be ERROR
    assertEqual(mockAssessment.status, "error", "Status transitioned to ERROR");
    
    // State should be preserved without fake evaluations
    assertEqual(mockAssessment.readinessScore, null, "No fake readiness score");
    assertEqual(mockAssessment.candidateReport, null, "No fake report");
  });
  
  // Restore require
  Module.prototype.require = originalRequire;
  
  console.log("\n══════════════════════════════════════════════════════");
  console.log(" Phase 4 Post-Interview Evaluation — Test Results");
  console.log("══════════════════════════════════════════════════════");
  console.log(results.join("\n"));
  console.log("══════════════════════════════════════════════════════");
  console.log(`\n Total: ${passed + failed} | ✅ Passed: ${passed} | ❌ Failed: ${failed}`);
  console.log("══════════════════════════════════════════════════════\n");
  
  if (failed > 0) process.exit(1);
})().catch(err => {
  console.error("Test failed:", err);
  process.exit(1);
});
