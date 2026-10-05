// formatZodErrors.js

function formatZodErrors(error) {
    if (!error) {
        return "Something went wrong";
    }

    const issues = error.issues || [];

    if (issues.length === 0) {
        return "Validation failed";
    }

    return issues[0].message;
}

module.exports = {
    formatZodErrors,
};