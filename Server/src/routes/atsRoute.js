const express = require("express");
const router = express.Router();
const multer = require("multer");
const { atsAnalyzer, getAtsHistory } = require("../controller/atsAnalyzer.controller");
const { requireAuth } = require('@clerk/express');

const upload = multer({ dest: "uploads/" });

const { atsLimiter } = require("../middleware/rateLimiter");

// Accept: resume (PDF/DOCX file) + jdFile (optional PDF JD) + jdText (body field)
router.post(
  "/analyze",
  atsLimiter,
  upload.fields([
    { name: "resume", maxCount: 1 },
    { name: "jdFile", maxCount: 1 },
  ]),
  atsAnalyzer
);

router.get("/me", requireAuth(), getAtsHistory);

module.exports = router;