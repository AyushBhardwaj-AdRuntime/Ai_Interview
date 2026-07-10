const mongoose = require("mongoose");

const interviewSchema = new mongoose.Schema({

   candidateProfile: {
   interviewSummary: String ,
    name: {
        type: String,
        required: true,
        default: ""
    },

    email: {
        type: String,
        default: ""
    },

    phone: {
        type: String,
        default: ""
    },

    skills: {
        type: [String],
        default: []
    },

    projects: {
        type: [
            {
                name: {
                    type: String,
                    default: ""
                },

                techStack: {
                    type: [String],
                    default: []
                },

                description: {
                    type: String,
                    default: ""
                }
            }
        ],
        default: []
    },

    education: {
        type: [
            {
                institution: {
                    type: String,
                    default: ""
                },

                degree: {
                    type: String,
                    default: ""
                },

                duration: {
                    type: String,
                    default: ""
                },

                cgpa: {
                    type: String,
                    default: ""
                },

                percentage: {
                    type: String,
                    default: ""
                },

                location: {
                    type: String,
                    default: ""
                }
            }
        ],
        default: []
    },

    experience: {
        type: [
            {
                designation: {
                    type: String,
                    default: ""
                },

                company: {
                    type: String,
                    default: ""
                },

                duration: {
                    type: String,
                    default: ""
                },

                location: {
                    type: String,
                    default: ""
                },

                description: {
                    type: String,
                    default: ""
                }
            }
        ],
        default: []
    }
},
     
    interview: {

        status: {
            type: String,
            enum: ["pending", "running", "completed"],
            default: "pending"
        },

        currentQuestion: {
            type: Number,
            default: 0
        },

        questions: [
            {
                question: String,

                topic: String,

                answer: String,

                score: Number,

                feedback: String,

                askedAt: Date,

                answeredAt: Date
            }
        ],

        finalScore: {
            type: Number,
            default: 0
        },

   

    }

}, {
    timestamps: true
});
    const     interviewModel =     mongoose.model("Interview", interviewSchema); 
module.exports =interviewModel