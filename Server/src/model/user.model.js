const mongoose = require("mongoose");

const interviewSchema = new mongoose.Schema({

    candidateProfile: {

        name: {
            type: String,
            required: true
        },

        email: String,

        phone: String,

        skills: [String],

        projects: [
            {
                name: String,

                techStack: [String],

                description: String
            }
        ],

        education: [
            {
                institution: String,

                degree: String,

                duration: String,

                cgpa: String,

                percentage: String,

                location: String
            }
        ],

        experience: [
            {
                designation: String,

                company: String,

                duration: String,

                location: String,

                description: String
            }
        ]
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

        summary: String

    }

}, {
    timestamps: true
});
    const     interviewModel =     mongoose.model("Interview", interviewSchema); 
module.exports =interviewModel