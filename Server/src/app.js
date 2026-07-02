const express = require("express")
const axios = require("axios")
const app = express()
const multer = require("multer")
const cors = require("cors")
app.use(cors())
app.use(express.json())
//  app.use("api/v1" , )
app.post("/api/v1/pre-interview", async (req, res) => {
    const upload = multer({
    dest:"uploads/"
});
    const { linkdin, github , resume } = req.body
    const githubUrl = github.endsWith("/") ? github.slice(0, -1) : github
    const linkdinUrl = linkdin.endsWith("/") ? linkdin.slice(0, -1) : linkdin
    const githubUrlUsername = githubUrl.split("/").pop();
    const linkdinUrlUsername = linkdinUrl.split("/").pop()

    const userRepo = await axios.get(`https://api.github.com/users/${githubUrlUsername}/repos`)
    const filterRepo = userRepo.data.map((x) => ({
        name: x.name,
        full_name: x.full_name,
        description: x.description
    }))
     console.log(filterRepo)
     res.send(filterRepo)
})



module.exports = app
