const fs = require("fs");
const pdf = require("pdf-parse");
const path = require("path");
const mammoth = require("mammoth");

async function  extractResumeText(file) {

    if (!file || !file.originalname || !file.path) {
        throw new Error("Resume file is required.");
    }

    let resumeText = "";

    const ext =  await path.extname(file.originalname).toLowerCase();

    if (ext === ".pdf") {

        const buffer = fs.readFileSync(file.path);
        const data = await pdf(buffer);
        resumeText = data.text;

    } else if (ext === ".docx") {

        const result = await mammoth.extractRawText({
            path: file.path
        });

        resumeText = result.value;

    } else {

        throw new Error("Unsupported file type");

    }

    fs.unlink(file.path, err => {
        if (err) console.error(err);
    });

    return resumeText;
}

module.exports = extractResumeText;