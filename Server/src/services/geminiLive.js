const { GoogleGenAI, Modality } = require("@google/genai");

class GeminiLive {
  constructor() {
    this.ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    this.session = null;
    this.onMessage = null;
    this.onOpen = null;
    this.onClose = null;
  }

  async connect(systemPrompt) {
    this.session = await this.ai.live.connect({
      model: "gemini-3.1-flash-live-preview",

      config: {
        responseModalities: [Modality.AUDIO],
        inputAudioTranscription: {},
        outputAudioTranscription: {},
        realtimeInputConfig: {
          automaticActivityDetection: {
            disabled: false,
            startOfSpeechSensitivity: "START_SENSITIVITY_HIGH",
            endOfSpeechSensitivity: "END_SENSITIVITY_HIGH",
            prefixPaddingMs: 100,
            silenceDurationMs: 500,
          },
        },
        systemInstruction: {
          parts: [
            {
              text: systemPrompt || `
You are a professional AI interviewer.
Ask one question at a time.
Speak naturally.
Never answer your own questions.
Wait for the candidate after every question.
              `
            }
          ]
        }
      },

      callbacks: {
        onopen: () => {

          this.onOpen?.();
        },

        onmessage: (message) => {
          // The message is an object with serverContent, etc.
          // Add detailed logs

          
          if (message.serverContent) {
             const content = message.serverContent;
             if (content.modelTurn) {

             }
             if (content.outputTranscription?.text) {
                console.log("[GEMINI] outputTranscription (Model Text):", content.outputTranscription.text);
             }
             if (content.inputTranscription?.text) {
                console.log("[GEMINI] inputTranscription (User Text):", content.inputTranscription.text);
             }
             if (content.turnComplete) {

             }
          }
          
          this.onMessage?.(message);
        },

        onclose: (event) => {

          this.onClose?.(event);
        },

        onerror: (error) => {
          console.error("[GEMINI] Error:", error);
        },
      },
    });
  }

sendAudio(base64) {

  if (!this.session) return;

  const pcm = Buffer.from(base64, "base64");

  let max = 0;
  let min = 32767;

  for (let i = 0; i + 1 < pcm.length; i += 2) {
    const sample = pcm.readInt16LE(i);

    max = Math.max(max, Math.abs(sample));
    min = Math.min(min, sample);
  }



  this.session.sendRealtimeInput({
    audio: {
      data: base64,
      mimeType: "audio/pcm;rate=16000",
    },
  });
}
  sendText(text) {

    this.session.sendClientContent({
      turns: [
        {
          role: "user",
          parts: [{ text }],
        },
      ],
      turnComplete: true,
    });
  }

  disconnect() {
    this.session?.close();
  }
}
module.exports = { GeminiLive };