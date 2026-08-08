const crypto = require("crypto");
const User = require("../model/user.model");

async function anonymousUser(req, res, next) {
    try {
        let sessionId = req.cookies.anonymousId;
        let user;

        if (sessionId) {
            user = await User.findOne({ sessionId });
        }

        if (!user) {
            sessionId = crypto.randomUUID();
            user = await User.create({ sessionId });
            
            // Set secure cookie
            res.cookie("anonymousId", sessionId, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production" || true, // enforce true as requested
                sameSite: "none",
                maxAge: 365 * 24 * 60 * 60 * 1000 // 1 year
            });
        }

        req.userId = user._id;
        next();
    } catch (error) {
        console.error("Anonymous auth middleware error:", error);
        res.status(500).json({ message: "Internal server error during authentication" });
    }
}

module.exports = anonymousUser;
