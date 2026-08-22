const express = require("express");
const router = express.Router();
const multer = require("multer")
const preInterview = require("../controller/pre_Interview.conteoller")
const { getInterview, getMyInterviews } = require("../controller/interview.controller")
const getResult = require("../controller/result.controller")
 const upload = multer({
  dest: "uploads/"
});

const { preInterviewLimiter } = require("../middleware/rateLimiter");
router.post(
    "/pre-interview",
    preInterviewLimiter,
    upload.single("resume"),
    preInterview
);
 router.get("/interviews/me", getMyInterviews);
 router.get("/interview/:id" , getInterview )
  router.get("/result/:id" , getResult)
 
module.exports = router;