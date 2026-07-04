const express = require("express");
const router = express.Router();
const multer = require("multer")
const preInterview = require("../controller/pre_Interview.conteoller")
const getInterview = require("../controller/interview.controller")
 const upload = multer({
  dest: "uploads/"
});

router.post(
    "/pre-interview",
    upload.single("resume"),
    preInterview
);
 router.get("/interview" ,getInterview )

module.exports = router;