const express = require("express")

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

