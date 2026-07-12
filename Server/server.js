const http = require("http");
const WebSocket = require("ws");
const app = require("./src/app");
const setupInterviewSocket = require("./src/websocket/interviewSocket")
 

const dotenv = require("dotenv");
dotenv.config();

const port = process.env.PORT || 5000;


const server = http.createServer(app);

const wss = new WebSocket.Server({
    server
});
setupInterviewSocket(wss)


server.listen(port, () => {
    console.log(`Server running on ${port}`);
});

module.exports = wss