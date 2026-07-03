  
  const axios = require("axios")
async function  extractGitHubRepo  (github){
  const githubUrl =   github.endsWith("/") ? github.slice(0, -1) : github
  const githubUrlUsername = githubUrl.split("/").pop();

  const userRepo = await axios.get(`https://api.github.com/users/${githubUrlUsername}/repos`)
    const filterRepo = userRepo.data.map((x) => ({
        name: x.name,
        full_name: x.full_name,
        description: x.description
    }))
    return filterRepo

}
  
  
  
//   const { linkedin, github  } = req.body
  
//     const linkdinUrl = linkedin.endsWith("/") ? linkedin.slice(0, -1) : linkedin
  
//     const linkdinUrlUsername = linkdinUrl.split("/").pop()

  


module.exports = extractGitHubRepo