const dotenv = require("dotenv");
dotenv.config();

const http = require("http");
const WebSocket = require("ws");
const app = require("./src/app");
const setupInterviewSocket = require("./src/websocket/interviewSocket");
const connectDb = require("./src/db/db");
const port = process.env.PORT || 8080;

const server = http.createServer(app);

const wss = new WebSocket.Server({ server, path: '/ws' });
setupInterviewSocket(wss);

async function start() {
    try {
        await connectDb();
        server.listen(port, () => {
            console.log(`[SERVER] running on port ${port}`);
        });
    } catch (err) {
        console.error('[SERVER] Failed to start:', err);
        process.exit(1);
    }
}

start();

process.on('uncaughtException', (err) => {
    console.error('[PROCESS][UNCAUGHT_EXCEPTION]', err.message);
    // Always exit on uncaught exceptions — nodemon will restart us
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('[PROCESS][UNHANDLED_REJECTION]', reason);
});

const shutdown = () => {
    console.log('[SERVER][SHUTDOWN]');
    // Force close websockets so server can shut down cleanly
    if (wss && wss.clients) {
        wss.clients.forEach(client => client.terminate());
    }
    server.close(() => {
        process.exit(0);
    });
    // Force exit after 2 seconds if graceful close fails
    setTimeout(() => process.exit(0), 2000).unref();
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
process.on('SIGUSR2', shutdown);

module.exports = wss;