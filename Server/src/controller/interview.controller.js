const interviewModel = require("../model/user.model");
  const WebSocket = require("ws")
           
          
          

async function getInterview(req, res) {
    try {
                    
                  
        const { id } = req.params;

        const interview = await interviewModel.findByIdAndUpdate(
             id , 
              {
    "interview.status": "running",
  },
        );
        
         
        if (!interview) {
            return res.status(404).json({
                message: "Interview not found"
            });
        }

        return res.status(200).json(interview);

    } catch (err) {

        console.error(err);

        return res.status(500).json({
            message: "Internal Server Error" ,
            id
        });

    }
}

module.exports = getInterview;