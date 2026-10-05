// zodValidate.js

const { formatZodErrors } = require("./formatZodErrors");

async function zodValidate(req, reply, schema) {
    try {

        const result = schema.safeParse(
            req.body ?? {}
        );

        if (!result.success) {
            console.log(
                "Zod validation errors:",
                result.error.issues
            );

            return reply.code(400).send({
                success: false,
                message: formatZodErrors(
                    result.error
                ),
                errors: result.error.issues.map(
                    (issue) => ({
                        field: issue.path.join("."),
                        message: issue.message,
                    })
                ),
                result: null,
            });
        }

        return {
            success: true,
            data: result.data,
        };
    } catch (error) {
        console.error(
            "zodValidate error:",
            error
        );

        return reply.code(400).send({
            success: false,
            message: "Invalid request data.",
            result: null,
        });
    }
}

module.exports = {
    zodValidate,
};