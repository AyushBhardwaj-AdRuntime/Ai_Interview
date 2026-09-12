Inspect the entire relevant codebase.

Then produce an architecture review.

Your response MUST contain:

1. Existing architecture

Explain:

frontend
backend
database
authentication
LLM integration
resume pipeline
GitHub pipeline
interview pipeline
assessment pipeline

Only describe what actually exists.

2. Existing reusable components

List what we should reuse.

For each:

file/path
purpose
how it can be reused
3. Missing components

Identify what is actually missing for the MVP.

4. Orchestrator recommendation

Compare:

A. deterministic workflow

B. stage-based orchestrator + LLM decisions

C. highly autonomous agent

Then recommend ONE.

Explain why it fits this existing project and the 24-hour constraint.

5. Proposed flow

Show the proposed architecture as a simple diagram.

Example:

Frontend
   ↓
Assessment API
   ↓
Orchestrator
   ↓
Stage
   ↓
LLM decision
   ↓
Tool
   ↓
State
   ↓
Checkpoint

Adapt this to your recommendation.

6. State ownership

Clearly explain:

Runtime state
Assessment.agentState
Assessment.evidenceClaims
Assessment.readinessScore
Interview
Reports

and identify the source of truth for each.

7. LLM boundaries

Give a table:

Responsibility	LLM	Deterministic code	Orchestrator
Resume parsing			
Job parsing			
Evidence reasoning			
Tool selection			
Workflow progression			
Interview evaluation			
Readiness score			
Report generation			

Fill this based on your recommendation.

8. Risks

Only identify MVP-relevant architectural risks.

Use:

🔴 MVP blocker
🟡 MVP risk
🟢 Defer

Do not create a huge production risk list.

9. Recommended implementation order

Give the exact implementation order after architecture is approved.

FINAL RULE

DO NOT MODIFY CODE.

DO NOT IMPLEMENT.

DO NOT CREATE THE FINAL MVP.

DO NOT INSTALL DEPENDENCIES.

Only inspect the codebase and give the architecture review.

After the architecture review, STOP.

We will review your recommendation before giving you the implementation prompt.