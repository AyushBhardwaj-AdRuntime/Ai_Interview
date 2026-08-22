const mongoose = require("mongoose");

const interviewSchema = new mongoose.Schema({
 
    userId: {
        type: String,
        required: true
    },
    resumeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Resume",
    required: true
},
    jobTitle: { type: String, default: "" },
    company: { type: String, default: "" },
    jobDescription: { type: String, default: "" },
    interviewType: { type: String, default: "Technical" },
    difficulty: { type: String, default: "Medium" },
    experience: { type: String, default: "1-3 years" },
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
            type: mongoose.Schema.Types.Mixed,
            default: {}
        },

   

    }

}, {
    timestamps: true
});
    const     interviewModel =     mongoose.model("Interview", interviewSchema); 
module.exports =interviewModel