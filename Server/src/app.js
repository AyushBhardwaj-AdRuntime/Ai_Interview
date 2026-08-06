const express = require("express")

const axios = require("axios")
const app = express()
const  connectDb = require("../src/db/db")
const cors = require("cors")
const  InterviewRoute = require("./routes/interview.routes")
app.use(cors({
    origin: [
        "http://localhost:5173",
        "https://mockhire.me",
        "https://www.mockhire.me"
    ]
}));
app.use(express.json())
connectDb()
app.use("/api/v1" , InterviewRoute)
module.exports = app 

