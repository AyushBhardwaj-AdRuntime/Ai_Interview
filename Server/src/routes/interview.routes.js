const express = require("express");
const router = express.Router();
const multer = require("multer")
const preInterview = require("../controller/pre_Interview.conteoller")
const getInterview = require("../controller/interview.controller")
const getResult = require("../controller/result.controller")
 const upload = multer({
  dest: "uploads/"
});

router.post(
    "/pre-interview",
    upload.single("resume"),
    preInterview
);
 router.get("/interview/:id" ,getInterview )
  router.get("/result/:id" , getResult)

module.exports = router;