const { InterviewState, PHASE } = require("../websocket/interviewState")
const interviewModel = require("../model/interview.model");
const { GeminiLive } = require("../services/geminiLive")

function setupInterviewSocket(wss) {
  wss.on("connection", async (client, req) => {
    const url = new URL(req.url, "http://localhost")
    const id = url.searchParams.get("id")

    const interviewDoc = await interviewModel
      .findById(id)
      .populate("resumeId", "candidateProfile.interviewSummary");

    const interviewSummary = interviewDoc?.resumeId?.candidateProfile?.interviewSummary || "";
    console.log("[WS] interviewSummary loaded:", interviewSummary ? interviewSummary.slice(0, 80) + "..." : "⚠️  EMPTY — resume may not have parsed correctly");

    const gemini = new GeminiLive();

    await gemini.connect(buildSystemPrompt(interviewSummary));

    const state = new InterviewState(id);
    gemini.onMessage = async (message) => {
      try {
        const content = message.serverContent;

        if (!content) {

          return;
        }

        // DEBUG: Log what fields are present
        const fields = Object.keys(content);


        if (
          state.phase === PHASE.ANSWERING &&
          content.outputTranscription?.text
        ) {
          // Previous answer is complete
          await state.saveQuestionAnswer();

          state.currentQuestion = "";
          state.currentAnswer = "";

          state.phase = PHASE.ASKING;
        }

        if (content.outputTranscription?.text) {
          state.addQuestion(content.outputTranscription.text);

          console.log("Gemini:", content.outputTranscription.text);
        }


        if (content.turnComplete) {

          state.phase = PHASE.WAITING_FOR_ANSWER;
        }

        if (content.inputTranscription?.text) {

          state.phase = PHASE.ANSWERING;

          state.addAnswer(content.inputTranscription.text);

          console.log("User:", content.inputTranscription.text);
        }

        if (client.readyState === 1) {
          client.send(JSON.stringify(message));
        }
      } catch (err) {
        console.error("Error in gemini.onMessage:", err);
      }
    };

    // Track audio message count
    let audioCount = 0;

    // Register this ONCE
    client.on("message", (message) => {
      try {
        const data = JSON.parse(message);

        if (data.type === "audio") {
          audioCount++;
          if (audioCount <= 3 || audioCount % 100 === 0) {

          }
          gemini.sendAudio(data.data);
        }
      } catch (err) {
        console.error("Error sending audio to Gemini:", err);
      }
    });

    client.on("close", () => {
      gemini.disconnect();

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
function buildSystemPrompt(interviewSummary) {
  return [
    "You are an experienced HR interviewer conducting a real mock interview.",
    "Your job is ONLY to conduct the interview.",
    "",
    "Candidate Summary:",
    interviewSummary
      ? interviewSummary
      : "No resume data provided. Ask general software engineering interview questions.",
    "",
    "Interview Instructions:",
    "- Introduce yourself briefly as the MockHire AI Interviewer.",
    "- This interview contains exactly 6 questions.",
    "- Ask only ONE question at a time.",
    "- Wait until the candidate finishes speaking before asking the next question.",
    "- Base every question on the Candidate Summary above.",
    "- Start with: Tell me about yourself.",
    "- Gradually increase difficulty.",
    "- Cover: background, skills, experience, projects, tech stack, problem-solving.",
    "- Ask follow-up questions when an answer is vague or interesting.",
    "- Never reveal answers. Never become a general chatbot.",
    "- If the candidate says something unrelated, politely redirect them.",
    "- Conduct the interview in English only.",
    "- Maintain a professional but friendly tone.",
    "- After the sixth question, thank the candidate and say the interview has ended.",
    "- Do NOT generate a score or feedback during the interview.",
  ].join("\n");
}