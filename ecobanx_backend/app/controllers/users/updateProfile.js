const { Users } = require("../../models/usersModel");
const { isAtLeast18YearsOld } = require("../../utils/ageValidation");
const path = require("path");
const fs = require("fs").promises;
const crypto = require("crypto");

const allowedFields = [
    "firstname",

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

const hasOwn = (object, key) =>
    Object.prototype.hasOwnProperty.call(object, key);

const getNameParts = (fullName) => {
    const parts = String(fullName || "")
        .trim()
        .split(/\s+/)
        .filter(Boolean);

    return {
        firstname: parts[0] || "",
    };
};

const applyFullNameUpdate = (updateData, existingUser) => {
    const hasFirstName = hasOwn(updateData, "firstname");


    if (!hasFirstName) {
        return;
    }

    const currentName = getNameParts(existingUser.fullName);
    const firstname = hasFirstName
        ? updateData.firstname
        : currentName.firstname;

    // Users stores fullName, so keep the public firstname API mapped to it.
    updateData.fullName = [firstname]
        .filter(Boolean)
        .join(" ")
        .trim();

    delete updateData.firstname;

};

const updateProfile = async (req, reply) => {
    try {
        const userId = req.user._id;

        // Get existing user
        const existingUser = await Users.findById(userId).lean();

        if (!existingUser) {
            return reply.code(404).send({
                success: false,
                message: "User not found",
            });
        }

        const updateData = {};
        const validatedData = req.validatedData || req.body || {};

        for (const field of allowedFields) {
            if (hasOwn(validatedData, field)) {
                updateData[field] = validatedData[field];
            }
        }

        applyFullNameUpdate(updateData, existingUser);

        // -----------------------------
        // Phone Number (register format)
        // -----------------------------
        if (
            hasOwn(updateData, "phone") ||
            hasOwn(updateData, "phoneCountryCode")
        ) {
            if (
                !hasOwn(updateData, "phone") ||
                !hasOwn(updateData, "phoneCountryCode")
            ) {
                return reply.code(400).send({
                    success: false,
                    message:
                        "Both phone and phoneCountryCode are required to update the phone number.",
                });
            }

            updateData.phone = `${updateData.phoneCountryCode}${updateData.phone}`;
        }

        // -----------------------------
        // Handle Multipart Files
        // -----------------------------
        if (
            typeof req.isMultipart === "function" &&
            req.isMultipart() &&
            Array.isArray(req.updateProfileFiles)
        ) {
            const uploadDir = path.join(process.cwd(), "public", "uploads");

            await fs.mkdir(uploadDir, { recursive: true });

            for (const filePart of req.updateProfileFiles) {
                const fieldName = filePart.fieldname;

                if (!allowedFileFields.includes(fieldName)) {
                    return reply.code(400).send({
                        success: false,
                        message: "Invalid field provided.",
                    });
                }

                if (!allowedMimeTypes.includes(filePart.mimetype)) {
                    return reply.code(400).send({
                        success: false,
                        message: `Invalid file type for ${fieldName}`,
                    });
                }

                const ext = path.extname(filePart.filename || "");
                const uniqueFilename = `${userId}_${fieldName}_${crypto
                    .randomBytes(8)
                    .toString("hex")}${ext}`;
                const filePath = path.join(uploadDir, uniqueFilename);
                const buffer = Buffer.isBuffer(filePart.buffer)
                    ? filePart.buffer
                    : await filePart.toBuffer();

                await fs.writeFile(filePath, buffer);

                const backendUrl = process.env.BACKEND_URL || "";
                updateData[fieldName] =
                    `${backendUrl}/uploads/${uniqueFilename}`;

                // Delete old image
                if (existingUser[fieldName]) {
                    try {
                        const oldFilePath = path.join(
                            process.cwd(),
                            existingUser[fieldName]
                                .replace(backendUrl, "")
                                .replace(/^\//, "")
                        );

                        await fs.unlink(oldFilePath);
                    } catch (err) {
                        console.log(`Old ${fieldName} not found`);
                    }
                }
            }
        }

        // -----------------------------
        // No Data
        // -----------------------------
        if (!Object.keys(updateData).length) {
            return reply.code(400).send({
                success: false,
                message: "No valid fields to update.",
            });
        }

        // -----------------------------
        // Age Validation
        // -----------------------------
        if (updateData.dob && !isAtLeast18YearsOld(updateData.dob)) {
            return reply.code(400).send({
                success: false,
                message: "You must be at least 18 years old.",
            });
        }

        // -----------------------------
        // Duplicate Email Check
        // -----------------------------
        if (updateData.email) {
            const emailExists = await Users.findOne({
                email: updateData.email,
                _id: { $ne: userId },
            }).lean();

            if (emailExists) {
                return reply.code(400).send({
                    success: false,
                    message: "Email is already in use.",
                });
            }
        }

        // -----------------------------
        // Duplicate Phone Check
        // -----------------------------
        if (updateData.phone) {
            const phoneExists = await Users.findOne({
                phone: updateData.phone,
                _id: { $ne: userId },
            }).lean();

            if (phoneExists) {
                return reply.code(400).send({
                    success: false,
                    message: "Phone number is already in use.",
                });
            }
        }

        // -----------------------------
        // Update User
        // -----------------------------
        const updatedUser = await Users.findByIdAndUpdate(
            userId,
            {
                $set: updateData,
            },
            {
                new: true,
            }
        )
            .select(
                "fullName dob gender country email phone phoneCountryCode profile_picture background_picture lockTimeoutMinutes"
            )
            .lean();

        return reply.code(200).send({
            success: true,
            message: "Profile updated successfully.",
            result: updatedUser,
        });
    } catch (error) {
        console.error("Update Profile Error:", error);

        return reply.code(500).send({
            success: false,
            message: "Something Went Wrong",
        });
    }
};

module.exports = {
    updateProfile,
};
