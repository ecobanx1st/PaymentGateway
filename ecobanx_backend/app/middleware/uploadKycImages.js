const path = require("path");
const fs = require("fs");
const {
  ensureUploadDir,
  generateUniqueFilename,
  deleteImageFile,
  discardFileStream,
  UPLOAD_DIR,
  UPLOAD_RELATIVE_DIR,
} = require("../utils/imageUpload");
const { validateImageFile } = require("../utils/imageFileValidation");

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const KYC_IMAGE_FIELD_LABELS = {
  frontImage: "Document front",
  backImage: "Document back",
  selfieImage: "Selfie image",
};

function nestFlatKeys(flat) {
  const result = {};
  for (const [key, value] of Object.entries(flat)) {
    const parts = key.split(".");
    let current = result;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (i === parts.length - 1) {
        current[part] = value;
      } else {
        if (
          !Object.prototype.hasOwnProperty.call(current, part) ||
          typeof current[part] !== "object" ||
          current[part] === null ||
          Array.isArray(current[part])
        ) {
          current[part] = {};
        }
        current = current[part];
      }
    }
  }
  return result;
}

async function uploadKycImages(req, reply) {
  if (!req.isMultipart()) {
    req.kycImages = {};
    return;
  }

  const flatFields = {};
  const files = {};
  const savedFiles = [];
  let validationMessage = null;

  try {
    const parts = req.parts();
    for await (const part of parts) {
      if (part.file) {
        if (!part.filename) {
          await discardFileStream(part.file);
          continue;
        }

        const key = part.fieldname.startsWith("images.")
          ? part.fieldname.replace("images.", "")
          : part.fieldname;

        const fileCheck = validateImageFile({
          fieldname: part.fieldname,
          filename: part.filename,
          mimetype: part.mimetype,
        }, {
          fieldLabel: KYC_IMAGE_FIELD_LABELS[key],
        });

        if (!fileCheck.valid) {
          validationMessage = fileCheck.message;
          await discardFileStream(part.file);
          continue;
        }

        const buffer = await part.toBuffer();
        if (buffer.length > MAX_FILE_SIZE) {
          validationMessage = `File size for ${part.fieldname} cannot exceed 5 MB.`;
          continue;
        }

        ensureUploadDir();
        const filename = generateUniqueFilename(part.filename || "image.jpg");
        const filePath = path.join(UPLOAD_DIR, filename);
        fs.writeFileSync(filePath, buffer);

        const relative = `${UPLOAD_RELATIVE_DIR}/${filename}`;

        files[key] = relative;
        savedFiles.push(relative);
      } else {
        flatFields[part.fieldname] = part.value;
      }
    }

    req.body = nestFlatKeys(flatFields);
    req.kycImages = files;
  } catch (err) {
    for (const f of savedFiles) deleteImageFile(f);

    if (err && err.code === "FST_REQ_FILE_TOO_LARGE") {
      const fieldname = (err.part && err.part.fieldname) || "file";
      return reply.code(400).send({
        success: false,
        message: `File size for ${fieldname} cannot exceed 5 MB.`,
      });
    }

    throw err;
  }

  if (validationMessage) {
    for (const f of savedFiles) deleteImageFile(f);
    return reply.code(400).send({
      success: false,
      message: validationMessage,
    });
  }
}

module.exports = { uploadKycImages };
