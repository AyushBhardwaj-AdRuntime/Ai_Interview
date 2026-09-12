const { InterviewState, PHASE } = require("../websocket/interviewState")
const interviewModel = require("../model/interview.model");
const { GeminiLive } = require("../services/geminiLive")
const axios = require("axios");

const MAX_VERIFICATION_QUESTIONS = 3;

function setupInterviewSocket(wss) {
  wss.on("connection", async (client, req) => {
    console.log("[WS] connected");
    const url = new URL(req.url, "http://localhost")
    const id = url.searchParams.get("id");
    const assessmentId = url.searchParams.get("assessmentId") || null;
    const isVerification = !!assessmentId;

    const interviewDoc = await interviewModel
      .findById(id)
      .populate("resumeId", "candidateProfile.interviewSummary");

    if (!interviewDoc) {
      console.warn(`[WS] Interview not found: ${id}`);
      client.send(JSON.stringify({ type: "error", message: "Interview not found" }));
      console.log("[GEMINI][CLOSE_REQUEST] reason=Interview not found");
      return client.close();
    }

    const interviewSummary = interviewDoc?.resumeId?.candidateProfile?.interviewSummary || "";
    console.log("[WS] interviewSummary loaded:", interviewSummary ? interviewSummary.slice(0, 80) + "..." : "⚠️  EMPTY — resume may not have parsed correctly");

    const jobConfig = {
      jobTitle: interviewDoc?.jobTitle || "",
      company: interviewDoc?.company || "",
      interviewType: interviewDoc?.interviewType || "Technical",
      difficulty: interviewDoc?.difficulty || "Medium",
      experience: interviewDoc?.experience || "1-3 years"
    };

    const verificationContext = interviewDoc?.verificationContext || null;

    const gemini = new GeminiLive();

    try {
      await gemini.connect(buildSystemPrompt(interviewSummary, jobConfig, verificationContext));
    } catch (err) {
      console.error("[WS] Gemini connect failed:", err);
      client.send(JSON.stringify({ type: "error", message: "Failed to connect to AI service" }));
      console.log("[GEMINI][CLOSE_REQUEST] reason=Gemini connect failed");
      return client.close();
    }

    const state = new InterviewState(id);

    // ── Deterministic 3-question auto-complete for verification interviews ──
    let intentionalClose = false;
    async function checkVerificationComplete() {
      if (!isVerification) return;
      if (state.questionCount >= MAX_VERIFICATION_QUESTIONS) {
        console.log(`[INTERVIEW][COMPLETE] reason=MAX_QUESTIONS | count=${state.questionCount}`);
        // Close Gemini + mic cleanly
        intentionalClose = true;
        gemini.disconnect();
        if (client.readyState === 1) {
          client.send(JSON.stringify({ type: "interview_auto_complete", message: "Interview complete" }));
          client.close();
        }
        // Trigger orchestrator to resume
        try {
          const port = process.env.PORT || 8080;
          await axios.post(
            `http://localhost:${port}/api/v1/agent/assess/${assessmentId}/interview-complete`,
            { interviewId: id },
            { headers: { "x-internal-call": "true" } }
          );
          console.log(`[INTERVIEW] Auto-complete sent to orchestrator | assessmentId=${assessmentId}`);
        } catch (err) {
          console.error("[INTERVIEW] Failed to auto-complete assessment:", err.message);
        }
      }
    // Explicitly tracks which turn the incoming transcriptions belong to.
    // This decouples the AI's question state from the user's answer state.
    let activeUserTurnId = 0;

    // Async queue to serialize Gemini events and prevent concurrent state mutations
    let messageQueue = Promise.resolve();

    gemini.onMessage = (message) => {
      messageQueue = messageQueue.then(async () => {
        try {
          const content = message.serverContent;

          if (!content) {
            return;
          }

          // Send raw message to client first so audio/text isn't dropped if DB fails
          if (client.readyState === 1) {
            const type = message.serverContent ? 'serverContent' : (message.setupComplete ? 'setupComplete' : 'other');
            if (type !== 'serverContent') {
              client.send(JSON.stringify(message));
            } else {
              client.send(JSON.stringify({ serverContent: message.serverContent }));
            }
          } else {
            console.log(`[WS][OUT] Dropped message | type=${message.serverContent ? 'serverContent' : (message.setupComplete ? 'setupComplete' : 'other')} | client.readyState=${client.readyState}`);
          }

          // 1. Handle Turn Complete & Interruption FIRST
          if (content.turnComplete || content.interrupted) {
            state.phase = PHASE.WAITING_FOR_ANSWER;
            
            // The AI is done speaking (or was interrupted).
            // Any transcription arriving from this point forward definitively belongs to the NEXT answer.
            activeUserTurnId = state.questionCount;
            
            if (content.interrupted) console.log("[INTERVIEW] AI interrupted by user");
          }

          // 2. Safely handle input transcription SECOND using Explicit Turn Ownership
          if (content.inputTranscription?.text) {
            if (activeUserTurnId < state.questionCount) {
              // LATE TRANSCRIPTION: This chunk belongs to a turn that was already saved.
              // activeUserTurnId hasn't incremented yet because the AI is still speaking Q(n+1).
              const doc = await interviewModel.findById(state.interviewId);
              if (doc && doc.interview.questions[activeUserTurnId]) {
                 doc.interview.questions[activeUserTurnId].answer += " " + content.inputTranscription.text;
                 await doc.save();
              }
              console.log(`[USER][LATE_TURN_${activeUserTurnId}]:`, content.inputTranscription.text);
            } else {
              // ACTIVE TRANSCRIPTION: This chunk belongs to the current memory buffer.
              state.phase = PHASE.ANSWERING;
              state.addAnswer(content.inputTranscription.text);
              console.log(`[USER][TURN_${activeUserTurnId}]:`, content.inputTranscription.text);
            }
          }

          // 3. Check if AI is speaking (signifies end of user turn) THIRD
          // If in the same message as transcription, transcription was already appended above!
          const isAiSpeaking = content.modelTurn?.parts?.some(p => p.text || p.inlineData?.data);

          if (
            state.phase === PHASE.ANSWERING &&
            (content.outputTranscription?.text || isAiSpeaking)
          ) {
            // Previous answer is complete — save Q&A pair
            await state.saveQuestionAnswer();
            if (isVerification) {
              console.log(`[INTERVIEW][QUESTION] number=${state.questionCount}/${MAX_VERIFICATION_QUESTIONS}`);
            }

            state.currentQuestion = "";
            state.currentAnswer = "";
            state.phase = PHASE.ASKING;

            // DETERMINISTIC: check if max questions reached
            await checkVerificationComplete();
            if (intentionalClose) return; // skip further processing if closing
          }

          // 4. Process Output Transcription
          if (content.outputTranscription?.text) {
            state.addQuestion(content.outputTranscription.text);
            console.log(`[GEMINI][TURN_${state.questionCount}]:`, content.outputTranscription.text);
          }

          // 5. Process Model Turn Parts (Text/Audio)

        if (content.modelTurn?.parts) {
          for (const part of content.modelTurn.parts) {
            if (part.text) {
              state.addQuestion(part.text);
              console.log("Gemini [Text Part]:", part.text);
            }
            if (part.inlineData?.data) {
              if (typeof part.inlineData.data !== "string") {
                part.inlineData.data = Buffer.from(part.inlineData.data).toString("base64");
              }
            }
          }
        } catch (err) {
          console.error("Error in gemini.onMessage:", err);
        }
      }).catch(err => console.error("Error in messageQueue:", err));
    };

    gemini.onClose = () => {
      console.log("[WS] Gemini session closed unexpectedly");
      if (client.readyState === 1) {
        client.send(JSON.stringify({ type: "error", message: "AI session disconnected" }));
        console.log("[GEMINI][CLOSE_REQUEST] reason=Gemini session closed unexpectedly");
        client.close();
      }
    };

    gemini.onError = (error) => {
      console.error("[WS] Gemini session error:", error);
      if (client.readyState === 1) {
        client.send(JSON.stringify({ type: "error", message: "AI session error occurred" }));
        console.log("[GEMINI][CLOSE_REQUEST] reason=Gemini session error");
        client.close();
      }
    };

    // Track audio message count
    let audioCount = 0;

    client.on("message", (message) => {
      try {
        const data = JSON.parse(message);

        if (data.type === "audio") {
          audioCount++;
          if (audioCount <= 3 || audioCount % 100 === 0) {
              console.log(`[WS][IN] audio | bytes=${data.data.length}`);
          }
          if (state.phase === PHASE.WAITING_FOR_ANSWER) {
             state.phase = PHASE.ANSWERING;
          }
          gemini.sendAudio(data.data);
        }
      } catch (err) {
        console.error("Error sending audio to Gemini:", err);
      }
    });

    client.on("error", (err) => {
      console.error(`[WS][ERROR] ${err.message || err}`);
    });

    client.on("close", async () => {
      console.log("[WS][CLOSE]");
      console.log("[WS] closed");
      // If intentionalClose (auto-complete or user pause), Gemini already disconnected
      if (!intentionalClose) {
        console.log("[GEMINI][CLOSE_REQUEST] reason=WS closed");
        gemini.disconnect();
      }
      if (!intentionalClose && (state.currentQuestion || state.currentAnswer)) {
        try {
          await state.saveQuestionAnswer();
        } catch (err) {
          console.error("Error saving final question on close:", err);
        }
      }
    });

    // ✅ Kick off the interview — sendText starts the first AI turn
    gemini.sendText("Begin the interview now. Greet the candidate and ask the first question.");

  });

}

module.exports = setupInterviewSocket;

// ── Helper ────────────────────────────────────────────────────────────
// Builds the full system prompt that is injected into Gemini Live
// via the systemInstruction config field (NOT as a chat message).
// This is the correct way to give Gemini its role and context.
// Builds the full system prompt that is injected into Gemini Live
// via the systemInstruction config field (NOT as a chat message).
// This is the correct way to give Gemini its role and context.
function buildSystemPrompt(interviewSummary, jobConfig, verificationContext) {
  const companyContext = jobConfig.company ? ` at ${jobConfig.company}` : "";
  const roleContext = jobConfig.jobTitle ? `for the role of ${jobConfig.jobTitle}${companyContext}` : "for a software engineering position";

  return [
    `You are an experienced HR and Technical interviewer conducting a realistic mock interview ${roleContext}.`,
    "Your job is ONLY to conduct the interview.",
    "",
    "Job & Interview Context:",
    `- Interview Type: ${jobConfig.interviewType}`,
    `- Difficulty Level: ${jobConfig.difficulty}`,
    `- Candidate Experience Level: ${jobConfig.experience}`,
    "",
    "Candidate Summary (from their resume):",
    interviewSummary
      ? interviewSummary
      : "No resume data provided. Ask general software engineering interview questions.",
    "",
    ...(verificationContext ? [
      "Targeted Verification Context (CRITICAL FOR THIS INTERVIEW):",
      verificationContext.evidenceSummary || "",
      verificationContext.verifiedStrengths?.length > 0 ? `Verified Strengths to briefly acknowledge: ${verificationContext.verifiedStrengths.map(s => s.skill).join(", ")}` : "",
      verificationContext.criticalGaps?.length > 0 ? `Critical Gaps to probe: ${verificationContext.criticalGaps.map(g => g.skill).join(", ")}` : "",
      ...(verificationContext.targetClaims?.length > 0 ? [
        "Specific Claims to Probe:",
        ...verificationContext.targetClaims.map(c => `- ${c.skill}: ${c.suggestedProbe}`)
      ] : []),
      ""
    ] : []),
    "Interview Instructions:",
    "- Introduce yourself briefly as the MockHire AI Interviewer.",
    verificationContext 
      ? "- This is a short verification interview. Ask exactly 2 to 3 targeted technical questions based on the Verification Context above."
      : "- This interview contains exactly 6 questions.",
    "- Ask only ONE question at a time.",
    "- Wait until the candidate finishes speaking before asking the next question.",
    "- Base every question on the Candidate Summary and the Job & Interview Context provided.",
    "- Start with: Tell me about yourself.",
    "- Gradually increase difficulty up to the specified Difficulty Level.",
    "- Ask follow-up questions when an answer is vague or interesting.",
    "- Never reveal answers. Never become a general chatbot.",
    "- If the candidate says something unrelated, politely redirect them.",
    "- Conduct the interview in English only.",
    "- Maintain a professional but friendly tone.",
    verificationContext
      ? "- After the final verification question, thank the candidate and say the interview has ended."
      : "- After the sixth question, thank the candidate and say the interview has ended.",
    "- Do NOT generate a score or feedback during the interview.",
  ].filter(line => line !== "").join("\n");
}