const { z } = require("zod");

const nameRegex = /^[A-Za-z]+(?:[ '-][A-Za-z]+)*$/;
const countryRegex = /^[A-Za-z]+(?:[ '-][A-Za-z]+)*$/;
const dobRegex = /^\d{4}-\d{2}-\d{2}$/;
const phoneRegex = /^[0-9]{7,15}$/;
const countryCodeRegex = /^\+[1-9][0-9]{0,3}$/;

const allowedFields = [
    "firstname",
    "lastname",
    "dob",
    "gender",
    "country",
    "email",
    "phone",
    "phoneCountryCode",
    "lockTimeoutMinutes",
];

const allowedFileFields = [
    "profile_picture",
    "background_picture",
];

const allowedMimeTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
];

const allowedLockTimeouts = [1, 5, 15, 30];

// -----------------------------------------
// Validate actual calendar date
// -----------------------------------------
const isValidDate = (date) => {
    if (!dobRegex.test(date)) {
        return false;
    }

    const [year, month, day] = date.split("-").map(Number);
    const parsedDate = new Date(Date.UTC(year, month - 1, day));

    return (
        parsedDate.getUTCFullYear() === year &&
        parsedDate.getUTCMonth() === month - 1 &&
        parsedDate.getUTCDate() === day
    );
};

const isFutureDate = (dob) => {
    if (!isValidDate(dob)) {
        return false;
    }

    const [year, month, day] = dob.split("-").map(Number);
    const today = new Date();
    const todayDate = Date.UTC(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
    );
    const dobDate = Date.UTC(year, month - 1, day);

    return dobDate > todayDate;
};

// -----------------------------------------
// Validate age >= 18
// -----------------------------------------
const isAtLeast18 = (dob) => {
    if (!isValidDate(dob) || isFutureDate(dob)) {
        return true;
    }

    const [year, month, day] = dob.split("-").map(Number);
    const today = new Date();

    let age = today.getFullYear() - year;

    const currentMonth = today.getMonth() + 1;
    const currentDay = today.getDate();

    if (
        currentMonth < month ||
        (currentMonth === month && currentDay < day)
    ) {
        age--;
    }

    return age >= 18;
};

const isAllowedLockTimeout = (value) => {
    if (typeof value === "number") {
        return (
            Number.isInteger(value) &&
            allowedLockTimeouts.includes(value)
        );
    }

    if (typeof value === "string") {
        return allowedLockTimeouts
            .map(String)
            .includes(value.trim());
    }

    return false;
};

const normalizeLockTimeout = (value) => {
    if (typeof value === "string") {
        return Number(value.trim());
    }

    return value;
};

const updateProfileSchema = z
    .object({
        firstname: z
            .string({
                error:
                    "First name can contain only letters, spaces, apostrophes and hyphens.",
            })
            .trim()
            .min(
                3,
                "First name must be at least 3 characters."
            )
            .max(
                50,
                "First name must not exceed 50 characters."
            )
            .regex(
                nameRegex,
                "First name can contain only letters, spaces, apostrophes and hyphens."
            )
            .optional(),

        lastname: z
            .string({
                error:
                    "Last name can contain only letters, spaces, apostrophes and hyphens.",
            })
            .trim()
            .min(
                1,
                "Last name must be at least 1 character."
            )
            .max(
                50,
                "Last name must not exceed 50 characters."
            )
            .regex(
                nameRegex,
                "Last name can contain only letters, spaces, apostrophes and hyphens."
            )
            .optional(),

        dob: z
            .string({
                error:
                    "Date of birth must be in YYYY-MM-DD format.",
            })
            .trim()
            .regex(
                dobRegex,
                "Date of birth must be in YYYY-MM-DD format."
            )
            .refine(
                isValidDate,
                {
                    message: "Invalid date of birth.",
                }
            )
            .refine(
                (value) => !isFutureDate(value),
                {
                    message: "Date of birth cannot be in the future.",
                }
            )
            .refine(
                isAtLeast18,
                {
                    message: "You must be at least 18 years old.",
                }
            )
            .optional(),

        gender: z
            .string({
                error: "Gender must be male, female or other.",
            })
            .trim()
            .transform((value) => value.toLowerCase())
            .refine(
                (value) =>
                    ["male", "female", "other"].includes(value),
                {
                    message: "Gender must be male, female or other.",
                }
            )
            .optional(),

        country: z
            .string({
                error:
                    "Country can contain only letters, spaces, apostrophes and hyphens.",
            })
            .trim()
            .min(
                3,
                "Country must be at least 3 characters."
            )
            .max(
                100,
                "Country must not exceed 100 characters."
            )
            .regex(
                countryRegex,
                "Country can contain only letters, spaces, apostrophes and hyphens."
            )
            .optional(),

        email: z
            .string({
                error: "Please enter a valid email address.",
            })
            .trim()
            .max(
                254,
                "Email address is too long."
            )
            .email("Please enter a valid email address.")
            .transform((value) => value.toLowerCase())
            .optional(),

        lockTimeoutMinutes: z
            .any()
            .refine(
                isAllowedLockTimeout,
                {
                    message:
                        "lockTimeoutMinutes must be one of 1, 5, 15 or 30.",
                }
            )
            .transform(normalizeLockTimeout)
            .optional(),

        phone: z
            .string({
                error: "Phone number must contain 7-15 digits.",
            })
            .trim()
            .regex(
                phoneRegex,
                "Phone number must contain 7-15 digits."
            )
            .optional(),

        phoneCountryCode: z
            .string({
                error: "Invalid country code.",
            })
            .trim()
            .regex(
                countryCodeRegex,
                "Invalid country code."
            )
            .optional(),
    })
    .strict()
    .superRefine((data, ctx) => {
        const hasPhone = data.phone !== undefined;
        const hasCode = data.phoneCountryCode !== undefined;

        if (hasPhone && !hasCode) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["phoneCountryCode"],
                message:
                    "Country code is required when updating phone number.",
            });
        }

        if (hasCode && !hasPhone) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["phone"],
                message:
                    "Phone number is required when updating country code.",
            });
        }
    });

const getValidationMessage = (error) => {
    const issue = error.issues[0];

    if (issue?.code === "unrecognized_keys") {
        return "Invalid field provided.";
    }

    return issue?.message || "Invalid request data.";
};

const drainFilePart = async (part) => {
    if (typeof part.toBuffer !== "function") {
        return;
    }

    try {
        await part.toBuffer();
    } catch (error) {
        // The response will already be a validation error; this just releases the stream.
    }
};

const collectMultipartData = async (req) => {
    const fields = {};
    const files = [];

    for await (const part of req.parts()) {
        const fieldName = part.fieldname;

        if (part.file) {
            if (!allowedFileFields.includes(fieldName)) {
                await drainFilePart(part);

                return {
                    error: "Invalid field provided.",
                };
            }

            if (!allowedMimeTypes.includes(part.mimetype)) {
                await drainFilePart(part);

                return {
                    error: `Invalid file type for ${fieldName}`,
                };
            }

            files.push({
                fieldname: fieldName,
                filename: part.filename,
                mimetype: part.mimetype,
                buffer: await part.toBuffer(),
            });

            continue;
        }

        if (!allowedFields.includes(fieldName)) {
            return {
                error: "Invalid field provided.",
            };
        }

        fields[fieldName] = part.value;
    }

    return {
        fields,
        files,
    };
};

const validateBody = (body) => {
    const result = updateProfileSchema.safeParse(body || {});

    if (!result.success) {
        return {
            success: false,
            message: getValidationMessage(result.error),
        };
    }

    return {
        success: true,
        data: result.data,
    };
};

// -----------------------------------------
// Update Profile Validator
// -----------------------------------------
const updateProfileValidator = async (req, reply) => {
    try {
        const isMultipart =
            typeof req.isMultipart === "function" && req.isMultipart();

        if (isMultipart) {
            const multipartData = await collectMultipartData(req);

            if (multipartData.error) {
                return reply.code(400).send({
                    success: false,
                    message: multipartData.error,
                });
            }

            const validation = validateBody(multipartData.fields);

            if (!validation.success) {
                return reply.code(400).send({
                    success: false,
                    message: validation.message,
                });
            }

            req.body = validation.data;
            req.validatedData = validation.data;
            req.updateProfileFiles = multipartData.files;

            return;
        }

        const validation = validateBody(req.body || {});

        if (!validation.success) {
            return reply.code(400).send({
                success: false,
                message: validation.message,
            });
        }

        req.body = validation.data;
        req.validatedData = validation.data;

        return;
    } catch (error) {
        console.error(
            "Update Profile Validator Error:",
            error
        );

        return reply.code(400).send({
            success: false,
            message: "Invalid request data.",
        });
    }
};

module.exports = {
    updateProfileValidator,
};
