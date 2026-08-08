
const { InterviewState, PHASE } = require("../websocket/interviewState")
const interviewModel = require("../model/interview.model");
const { GeminiLive } = require("../services/geminiLive")

function setupInterviewSocket(wss) {
  const PHASE = {
    ASKING: "ASKING",
    WAITING_FOR_ANSWER: "WAITING_FOR_ANSWER",
    ANSWERING: "ANSWERING",
  };
  wss.on("connection", async (client, req) => {
    const url = new URL(req.url, "http://localhost")
    const id = url.searchParams.get("id")

    const interview = await interviewModel.findById(
      id,
      "candidateProfile.interviewSummary"
    )
    const interviewSummary = interview?.candidateProfile?.interviewSummary || "";
    const gemini = new GeminiLive();

    // Pass the full interview prompt as systemInstruction to avoid
    // mixing sendClientContent with sendRealtimeInput (which breaks VAD)
    const systemPrompt = `
You are an experienced HR interviewer conducting a real mock interview.

Your job is ONLY to conduct the interview.

Candidate Summary:
${interviewSummary}

Interview Instructions:

- Introduce yourself briefly.
- Explain that this interview contains exactly 6 questions.
- Ask only ONE question at a time.
- Wait until the candidate finishes speaking before asking the next question.
- Base every question on the Candidate Summary.
- Start with a simple introduction question (for example, "Tell me about yourself.").
- Gradually increase the difficulty of the questions.
- Ask about:
  - Candidate's background
  - Skills
  - Experience (if any)
  - Projects
  - Technologies used
  - Problem-solving decisions
- Ask follow-up questions whenever an answer is vague or interesting.
- Never reveal answers.
- Never become a general chatbot.
- If the candidate says something unrelated, politely redirect them back to the interview.
- Conduct the interview only in English.
- Maintain a professional but friendly tone.
- After the sixth question, thank the candidate and inform them that the interview has ended.
- Do NOT generate a score or feedback during the interview.

Begin the interview now.
`;

    await gemini.connect(systemPrompt);


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

    // Kick off the interview — use sendRealtimeInput to stay in realtime mode
    gemini.session.sendRealtimeInput({
      text: "Begin the interview now.",
    });

  });

}

module.exports = setupInterviewSocket