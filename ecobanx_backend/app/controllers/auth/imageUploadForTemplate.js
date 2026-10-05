const fs = require("fs").promises;
const path = require("path");
const crypto = require("crypto");

/**
 * Update item function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
const imageUploadForTemplate = async (req, reply) => {
    try {

        const userId = req.user._id;

        // ✅ Collect multipart form-data fields & files
        const parts = req.parts();

        const updateData = {};
        const allowedFields = ["firstname", "lastname", "dob", "gender", "country"];

        const allowedMimeTypes = [
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/gif",
            "image/webp",
            "image/svg+xml",
        ];

        const uploadDir = path.join(process.cwd(), "img");

        // Ensure upload directory exists
        await fs.mkdir(uploadDir, { recursive: true });

        for await (const part of parts) {
            if (part.file) {
                // Determine which image field this file belongs to
                const fieldName = part.fieldname; // e.g. 'profile_picture' or 'background_picture'

                if (!["image"].includes(fieldName)) {
                    continue;
                }

                if (!allowedMimeTypes.includes(part.mimetype)) {
                    return reply.code(400).send({
                        success: false,
                        message: `Invalid file type for ${fieldName}. Allowed: ${allowedMimeTypes.join(", ")}`,
                    });
                }

                const ext = path.extname(part.filename);
                const fileName = path.basename(part.filename);
                const uniqueFilename = `${fileName}`;
                const filePath = path.join(uploadDir, uniqueFilename);

                const buffer = await part.toBuffer();
                await fs.writeFile(filePath, buffer);

                const fileUrl = `${process.env.IMAGE_URL}/img/${uniqueFilename}`;
                updateData[fieldName] = fileUrl;

            } else {
                return reply.code(400).send({
                    success: false,
                    message: "Files not detected",
                });
            }
        }

        // ✅ Nothing to update
        if (Object.keys(updateData).length === 0) {
            return reply.code(400).send({
                success: false,
                message: "No valid fields to update",
            });
        }

        return reply.code(200).send({
            success: true,
            message: "Image uploaded successfully",
            result: updateData,
        });

    } catch (error) {
        console.log(error)
        reply.code(500).send({
            success: false,
            result: null,
            message: 'SOMETHING WENT WRONG'
        })
    }
}

module.exports = { imageUploadForTemplate }