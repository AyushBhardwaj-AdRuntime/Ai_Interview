  
 
const  Result = require("../services/result.service")
    const interviewModel  = require("../model/interview.model")
    
    async  function getResult (req , res){ 
         const id = req.params.id
         console.log(id)
           const result = await interviewModel.findById(id ,
              "interview.questions"
           )
          
   const evaluation =      await Result(result.interview.questions)
  
await interviewModel.findByIdAndUpdate(id, {
    $set: {
        "interview.result": evaluation,
        "interview.status": "completed"
    }
});

return res.status(200).json(evaluation);
               
     }

      module.exports = getResult