const express = require("express")

const axios = require("axios")
const app = express()
const  connectDb = require("../src/db/db")
const cors = require("cors")
const  InterviewRoute = require("./routes/interview.routes")
const atsRoute = require("./routes/atsRoute");
const cookieParser = require("cookie-parser");
const { clerkMiddleware, requireAuth } = require('@clerk/express');

app.use(cors({
    origin: function (origin, callback) {
        const allowedOrigins = [
            "http://localhost:5173",
            "http://localhost:5174",
            "https://mockhire.me",
            "https://www.mockhire.me"
        ];
        if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
app.use(cookieParser());
app.use(express.json())
connectDb()

const anonymousMiddleware = require("./middleware/anonymous.middleware");

const { generalLimiter } = require("./middleware/rateLimiter");

// Add Clerk middleware to parse the auth state for other routes
app.use(clerkMiddleware());

// General API Rate Limiter
app.use(generalLimiter);

// Secure the routes
// ATS route remains accessible for guests via anonymous session
app.use("/api/v1/ats", anonymousMiddleware, atsRoute);
app.use("/api/v1", requireAuth(), InterviewRoute);

module.exports = app 

