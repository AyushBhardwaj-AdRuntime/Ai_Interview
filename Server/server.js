const http = require("http");
const WebSocket = require("ws");
const {GeminiLive} = require("./src/services/geminiLive")
const app = require("./src/app");

const dotenv = require("dotenv");
dotenv.config();

const port = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// Attach WebSocket to the HTTP server
const wss = new WebSocket.Server({
    server
});

wss.on("connection", async (client) => {

    console.log("Frontend Connected");

    const gemini = new GeminiLive();

    await gemini.connect();

    console.log("Connected to Gemini");

    gemini.onMessage = (message) => {

     //    console.log(message);

        const content = message.serverContent;

        if (!content) return;

        if (content.inputTranscription?.text) {
            console.log("User:", content.inputTranscription.text);
        }

        if (content.outputTranscription?.text) {
            console.log("Gemini:", content.outputTranscription.text);
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

    gemini.sendText(`
You are an experienced HR interviewer.

Never behave like a normal chatbot.

Never answer casual conversation.

Your only job is to conduct a structured interview.

Rules:

- Introduce yourself once.
- Explain the interview.
- Ask exactly six questions.
- Wait for the candidate after every question.
- If the candidate says something unrelated,
  politely redirect them back to the interview.
- Never change the topic.
- Never become a general assistant.
- Never answer questions outside the interview.
- Use the candidate summary provided.
- Ask follow-up questions based on previous answers.
- Finish after question six.
`);

});   

      



// Start BOTH Express and WebSocket
server.listen(port, () => {
    console.log(`Server running on ${port}`);
});