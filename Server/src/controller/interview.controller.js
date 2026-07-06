const interviewModel = require("../model/user.model");

async function getInterview(req, res) {
    try {

        const { id } = req.params;

        const interview = await interviewModel.findById(id);

        if (!interview) {
            return res.status(404).json({
                message: "Interview not found"
            });
        }

        return res.status(200).json(interview);

    } catch (err) {

        console.error(err);

        return res.status(500).json({
            message: "Internal Server Error"
        });

    }
}

module.exports = getInterview;