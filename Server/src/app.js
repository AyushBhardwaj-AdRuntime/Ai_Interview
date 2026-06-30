const express = require("express")
const axios = require("axios")
const app = express()
 const cors = require("cors")
app.use(cors())
 app.use(express.json())

 app.post("/api/v1/pre-interview"  ,  async (req, res)=>{
     const {linkdin , github} = req.body
   const githubUrl = github.endsWith("/") ? github.slice(0 , -1) : github
   const linkdinUrl = linkdin.endsWith("/") ? linkdin.slice(0 , -1) : linkdin
       const githubUrlUsername = githubUrl.split("/").pop();
       const linkdinUrlUsername= linkdinUrl.split("/").pop()
 
        const userRepo = await axios.get(`https://api.github.com/users/${githubUrlUsername}/repos`)
         console.log(userRepo)
         const filterRepo  = userRepo.data.map((x)=>({
            name :x.name, 
            full_name : x.full_name ,
            description : x.description
         }))
         
 }  )
 

 
module.exports = app
