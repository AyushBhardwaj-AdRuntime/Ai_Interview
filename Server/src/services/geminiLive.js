const  { GoogleGenAI, Modality } =  require("@google/genai")

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

  async connect() {
    this.session = await this.ai.live.connect({
      model: "gemini-3.1-flash-live-preview",

      config: {
        responseModalities: [Modality.AUDIO],
         systemInstruction: {
      parts: [
        {
          text: `
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
          console.log("Connected");
          this.onOpen?.();
        },

        onmessage: (message) => {
          console.log(message);

          this.onMessage?.(message);
        },

        onclose: (event) => {
          console.log("Closed");
          this.onClose?.(event);
        },

        onerror: (error) => {
          console.error(error);
        },
      },
    });
  }

  sendAudio(base64) {
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