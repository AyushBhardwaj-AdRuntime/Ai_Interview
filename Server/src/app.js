const express = require("express");
const app = express();
const cors = require("cors");
const InterviewRoute = require("./routes/interview.routes");
const atsRoute = require("./routes/atsRoute");
const agentRoute = require("./routes/agent.route");
const cookieParser = require("cookie-parser");
const { clerkMiddleware } = require('@clerk/express');
const { requireAuth } = require('./middleware/auth.middleware');

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
app.use(express.json());

const anonymousMiddleware = require("./middleware/anonymous.middleware");
const { generalLimiter } = require("./middleware/rateLimiter");

// Add Clerk middleware to parse the auth state for all routes
app.use(clerkMiddleware());

// General API Rate Limiter
app.use(generalLimiter);

// Health check
app.get("/", (req, res) => {
    res.status(200).json({ status: "ok", message: "AI Interview API is running" });
});

// Routes
// ATS route remains accessible for guests via anonymous session
app.use("/api/v1/ats", anonymousMiddleware, atsRoute);
app.use("/api/v1/agent", agentRoute);
app.use("/api/v1", requireAuth(), InterviewRoute);

module.exports = app;
