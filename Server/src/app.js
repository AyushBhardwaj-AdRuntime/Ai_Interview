const express = require("express")
// import { GoogleGenAI, Modality } from '@google/genai';
// const ai = new GoogleGenAI({ apiKey: "YOUR_API_KEY"});
// const model = 'gemini-3.1-flash-live-preview';
// const config = { responseModalities: [Modality.AUDIO] };
const axios = require("axios")
const app = express()
const  connectDb = require("../src/db/db")
const cors = require("cors")
const  InterviewRoute = require("./routes/interview.routes")
app.use(cors())
app.use(express.json())
connectDb()
app.use("/api/v1" , InterviewRoute)
module.exports = app 

