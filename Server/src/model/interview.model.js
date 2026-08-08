const mongoose = require("mongoose");

const interviewSchema = new mongoose.Schema({
 
     
     
    resumeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Resume",
    required: true
},
    interview: {

        status: {
            type: String,
            enum: ["pending", "running", "completed"],
            default: "pending"
        },
        questions: {
    type: [
        {
            question: {
                type: String,
                default: ""
            },
            answer: {
                type: String,
                default: ""
            },
            askedAt: Date,
            answeredAt: Date
        }
    ],
    default: []
},
        result: {
             overallScore: {
            type : Number ,
           default : 0 
                 
             },
              technicalKnowledge: {
            type : Number ,
           default : 0 
                 
             },
             feedback : {
            type : String,
           default : ""
                 
             },
          recommendation: {
            type : String,
                 default : ""
             },
              },

   

    }

}, {
    timestamps: true
});
    const     interviewModel =     mongoose.model("Interview", interviewSchema); 
module.exports =interviewModel