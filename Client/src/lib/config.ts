
// ✅ Fixed: use env vars so local dev and production both work without code changes
const rawBackendUrl = import.meta.env.VITE_BACKEND_URL || (import.meta.env.DEV ? "http://localhost:8080" : "https://ai-interview-379c.onrender.com");
export const BACKEND_URL = rawBackendUrl.replace("wss://", "https://").replace("ws://", "http://");
export const WS_URL = import.meta.env.VITE_WS_URL || (import.meta.env.DEV ? "ws://localhost:8080" : "wss://ai-interview-379c.onrender.com");