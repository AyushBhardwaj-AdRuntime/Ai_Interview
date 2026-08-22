const mongoose = require("mongoose")
const resumeSchema = new mongoose.Schema({
  userId : {
    type : String,
    required : true,
    unique: true,   // ✅ one resume per user — enforced at DB level
  },

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
} ,
 originalFile: {
      name: {
        type: String,
        default: "",
      },
      url: {
        type: String,
        default: "",
      },
    },
  },
  {
    timestamps: true,
  }



);
const Resume = mongoose.model("Resume" , resumeSchema)
module.exports = Resume