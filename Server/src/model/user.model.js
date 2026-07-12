const mongoose = require("mongoose");

const interviewSchema = new mongoose.Schema({

   candidateProfile: {
   interviewSummary: {
 type : String ,
 default : ""
     
   },
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
                    type: [String],
                    default: []
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
                    type: [String],
                    default: []
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