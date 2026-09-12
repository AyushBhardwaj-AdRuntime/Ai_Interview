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
    this.onError = null;
  }

  async connect(systemPrompt) {
    console.log("[GEMINI] connecting");
    this.session = await this.ai.live.connect({
      model: "gemini-3.1-flash-live-preview",

      config: {
        responseModalities: [Modality.AUDIO],
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
          console.log("[GEMINI] connected");
          this.onOpen?.();
        },

        onmessage: (message) => {
          // The message is an object with serverContent, etc.
          // Add detailed logs

          
          if (message.serverContent) {
             const content = message.serverContent;
             if (content.modelTurn?.parts) {
                let inlineDataCount = 0;
                let inlineDataLength = 0;
                for (const part of content.modelTurn.parts) {
                   if (part.text) {
                      console.log("[GEMINI TEXT]", part.text);
                   }
                   if (part.inlineData?.data) {
                      inlineDataCount++;
                      inlineDataLength += part.inlineData.data.length;
                      console.log(`[GEMINI][AUDIO] received | bytes=${part.inlineData.data.length}`);
                   }
                }
                if (inlineDataCount > 0) {
                   console.log(`[GEMINI][AUDIO_SUMMARY] parts=${inlineDataCount} | total_bytes=${inlineDataLength}`);
                }
             }
             if (content.outputTranscription?.text) {
                console.log(`[GEMINI][OUTPUT] ${content.outputTranscription.text}`);
             }
             if (content.inputTranscription?.text) {
                console.log(`[GEMINI][INPUT] ${content.inputTranscription.text}`);
             }
          }
          
          this.onMessage?.(message);
        },

        onclose: (event) => {
          console.log("[GEMINI][CLOSE]");
          console.log(`code=${event?.code} reason=${event?.reason} wasClean=${event?.wasClean}`);
          console.log("[GEMINI] closed");
          this.onClose?.(event);
        },

        onerror: (error) => {
          console.log(`[GEMINI][ERROR] ${error?.message || error}`);
          if (error?.stack) console.log(error.stack);
          this.onError?.(error);
        },
      },
    });
  }

  sendAudio(base64) {
    if (!this.session) return;
    this.session.sendRealtimeInput({
      media: [{
        mimeType: "audio/pcm;rate=16000",
        data: base64,
      }]
    });
  }

  sendText(text) {
    if (!this.session) return;
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
    console.log("[GEMINI][DISCONNECT_REQUEST]");
    console.trace();
    this.session?.close();
  }
}
module.exports = { GeminiLive };