 



 const interviewModel = require("../model/user.model")
  
  async function getInterview( req , res){
     const {id} = req.params
     const profile = interviewModel.findById(
         id
     )
 res.json(profile);

  }
  module.exports = getInterview