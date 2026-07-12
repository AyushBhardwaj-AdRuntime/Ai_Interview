const http = require("http");
const WebSocket = require("ws");
const app = require("./src/app");
const setupInterviewSocket = require("./src/websocket/interviewSocket")
 

const dotenv = require("dotenv");
dotenv.config();

const port = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// Attach WebSocket to the HTTP server
const wss = new WebSocket.Server({
    server
});
setupInterviewSocket(wss)


// Start BOTH Express and WebSocket
server.listen(port, () => {
    console.log(`Server running on ${port}`);
});

module.exports = wss