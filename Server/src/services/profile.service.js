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

function normalizeAtsResult(full) {
    let score = typeof full.score === 'number' ? full.score : 0;
    score = Math.max(0, Math.min(100, score));

    let matchStatus = full.matchStatus || "Low";
    if (!["High", "Medium", "Low"].includes(matchStatus)) {
        if (score >= 75) matchStatus = "High";
        else if (score >= 50) matchStatus = "Medium";
        else matchStatus = "Low";
    }

    return {
        score,
        matchStatus,
        matchingKeywords: Array.isArray(full.matchingKeywords) ? full.matchingKeywords : [],
        missingKeywords: Array.isArray(full.missingKeywords) ? full.missingKeywords : [],
        feedback: typeof full.feedback === "string" ? full.feedback : "",
        suggestions: Array.isArray(full.suggestions) ? full.suggestions : [],
        criticalRedFlag: full.criticalRedFlag && typeof full.criticalRedFlag === "object" ? full.criticalRedFlag : null,
        teaserQuestions: Array.isArray(full.teaserQuestions) ? full.teaserQuestions : [],
    };
}

module.exports = {
    normalizeCandidateProfile,
    normalizeAtsResult
};