function normalizeCandidateProfile(profile) {
    return {
        interviewSummary:
            typeof profile.interviewSummary === "string"
                ? profile.interviewSummary
                : "",

        name:
            typeof profile.name === "string"
                ? profile.name
                : "",

        email:
            typeof profile.email === "string"
                ? profile.email
                : "",

        phone:
            typeof profile.phone === "string"
                ? profile.phone
                : "",

        skills:
            Array.isArray(profile.skills)
                ? profile.skills
                : [],

        projects:
            Array.isArray(profile.projects)
                ? profile.projects
                : [],

        education:
            Array.isArray(profile.education)
                ? profile.education
                : [],

        experience:
            Array.isArray(profile.experience)
                ? profile.experience
                : []
    };
}

module.exports = normalizeCandidateProfile;