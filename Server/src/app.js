const express = require("express")

const axios = require("axios")
const app = express()
const  connectDb = require("../src/db/db")
const cors = require("cors")
const  InterviewRoute = require("./routes/interview.routes")
const atsRoute = require("./routes/atsRoute");
const cookieParser = require("cookie-parser");
const anonymousMiddleware = require("./middleware/anonymous.middleware");

app.use(cors({
    origin: [
        "http://localhost:5173",
        "https://mockhire.me",
        "https://www.mockhire.me"
    ],
    credentials: true
}));
app.use(cookieParser());
app.use(express.json())
connectDb()
// app.use("/api/v1", anonymousMiddleware, atsRoute);
app.use("/api/v1", anonymousMiddleware, InterviewRoute);
module.exports = app 
