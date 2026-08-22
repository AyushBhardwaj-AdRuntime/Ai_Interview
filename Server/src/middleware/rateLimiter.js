const rateLimit = require("express-rate-limit");
const { getAuth } = require("@clerk/express");

// General API Rate Limiter: 100 requests per 15 minutes
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, code: "RATE_LIMIT_EXCEEDED", message: "Too many requests from this IP, please try again after 15 minutes" },
});

// Pre-Interview Limiter: 5 requests per hour (heavy AI cost)
const preInterviewLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        let auth;
        try { auth = getAuth(req); } catch(e) {}
        const userId = auth?.userId || req.auth?.userId || req.userId;
        return userId || req.ip;
    },
    message: { success: false, code: "RATE_LIMIT_EXCEEDED", message: "You have reached the limit of 5 interviews per hour. Please try again later." },
});

// ATS Limiter: 20 requests per hour for authenticated, 5 for guests/IP
const atsLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: (req, res) => {
        let auth;
        try { auth = getAuth(req); } catch(e) {}
        const userId = auth?.userId || req.auth?.userId || req.userId;
        if (userId && !userId.startsWith("anonymous_")) return 20;
        return 5;
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        let auth;
        try { auth = getAuth(req); } catch(e) {}
        const userId = auth?.userId || req.auth?.userId || req.userId;
        return userId || req.ip;
    },
    message: { success: false, code: "RATE_LIMIT_EXCEEDED", message: "You have reached your ATS analysis limit for this hour." },
});

module.exports = {
    generalLimiter,
    preInterviewLimiter,
    atsLimiter
};
