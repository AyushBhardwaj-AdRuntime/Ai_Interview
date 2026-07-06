const groq = require("./src/services/ai_service")
 const {githubRepo , resumeText} = require("./src/controller/pre_Interview.conteoller")
async function test (){
       
     
     const response = await groq.chat.completions.create({
 messages: [
        {
            role: "system",
            content: `
You are an expert resume parser.

Extract the resume into JSON.

Return ONLY valid JSON.

If a field is missing, use null.
`
        },

        {
            role: "user",
            content: resumeText
        }
    ]
}); }
 test()



//    const { linkedin, github  } = req.body
//     const githubUrl = github.endsWith("/") ? github.slice(0, -1) : github
//     const linkdinUrl = linkedin.endsWith("/") ? linkedin.slice(0, -1) : linkedin
//     const githubUrlUsername = githubUrl.split("/").pop();
//     const linkdinUrlUsername = linkdinUrl.split("/").pop()

//     const userRepo = await axios.get(`https://api.github.com/users/${githubUrlUsername}/repos`)
//     const filterRepo = userRepo.data.map((x) => ({
//         name: x.name,
//         full_name: x.full_name,
//         description: x.description
//     }))
//     //  console.log(filterRepo)
//      res.send(filterRepo)




// curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent" \
//   -H 'Content-Type: application/json' \
//   -H 'X-goog-api-key: AQ.Ab8RN6L-SYR6YlRySuMYmwNiCgJdDEUu8f0ZRVM58-jEtA3kPA' \
//   -X POST \
//   -d '{
//     "contents": [
//       {
//         "parts": [
//           {
//             "text": "Explain how AI works in a few words"
//           }
//         ]
//       }
//     ]
//   }'