const express = require("express")
const axios = require("axios")
const app = express()

const cors = require("cors")

const  InterviewRoute = require("./routes/interview.routes")
app.use(cors())
app.use(express.json())
app.use("/api/v1" , InterviewRoute)
module.exports = app 

