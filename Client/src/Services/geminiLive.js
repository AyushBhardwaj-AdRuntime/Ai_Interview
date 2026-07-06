import { GoogleGenAI, Modality } from "@google/genai";

export class GeminiLive {
  constructor() {
    this.ai = new GoogleGenAI({
      apiKey: import.meta.env.VITE_GEMINI_API_KEY,
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