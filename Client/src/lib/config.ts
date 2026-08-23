
// ✅ Fixed: use env vars so local dev and production both work without code changes
export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";
export const WS_URL = import.meta.env.VITE_WS_URL || (import.meta.env.PROD ? "wss://ai-interview-379c.onrender.com" : "ws://localhost:8080");