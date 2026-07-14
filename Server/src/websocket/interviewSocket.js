
const  {InterviewState  , PHASE} = require("../websocket/interviewState")
const interviewModel = require("../model/user.model");
const {GeminiLive} = require("../services/geminiLive")
 
 function setupInterviewSocket (wss){
const PHASE = {
    ASKING: "ASKING",
    WAITING_FOR_ANSWER: "WAITING_FOR_ANSWER",
    ANSWERING: "ANSWERING",
};
 wss.on("connection", async (client , req) => {
 const url= new URL(req.url , "http://localhost")
 const id = url.searchParams.get("id")
//  console.log(id)
//  console.log("Frontend Connected");
const  interview = await interviewModel.findById(
    id ,
     "candidateProfile.interviewSummary"
)
  const interviewSummary = interview?.candidateProfile?.interviewSummary || "";
    const gemini = new GeminiLive();

    await gemini.connect();

    console.log("Connected to Gemini");
const state = new InterviewState (id);
    gemini.onMessage = async (message) => {

     //    console.log(message);

        const content = message.serverContent;

        if (!content) return;
     
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
        client.send(JSON.stringify(message));
    };

    // Register this ONCE
    client.on("message", (message) => {

        const data = JSON.parse(message);

        if (data.type === "audio") {
          //   console.log("Sending audio to Gemini");
            gemini.sendAudio(data.data);
        }

    });

    client.on("close", () => {

    gemini.disconnect();

    // console.log("Frontend disconnected");

});
  gemini.sendText(`
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
`);

});   

      

 }

 module.exports = setupInterviewSocket