const path = require("path");
const fs = require("fs");
const {
  generateUniqueFilename,
  deleteImageFile,
  discardFileStream,
} = require("../utils/imageUpload");
const { validateImageFile } = require("../utils/imageFileValidation");

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const KYB_UPLOAD_RELATIVE_DIR = "uploads/kyb";
const KYB_UPLOAD_DIR = path.join(__dirname, "../../public", KYB_UPLOAD_RELATIVE_DIR);

function ensureKybUploadDir() {
  if (!fs.existsSync(KYB_UPLOAD_DIR)) {
    fs.mkdirSync(KYB_UPLOAD_DIR, { recursive: true });
  }
}

function convertNumericKeysToArrays(obj) {
  if (typeof obj !== "object" || obj === null) return obj;
  if (Array.isArray(obj)) return obj.map(convertNumericKeysToArrays);

  const keys = Object.keys(obj);
  const allNumeric = keys.length > 0 && keys.every((k) => /^\d+$/.test(k));
  if (allNumeric) {
    const arr = [];
    keys.sort((a, b) => Number(a) - Number(b));
    for (const k of keys) {
      arr.push(convertNumericKeysToArrays(obj[k]));
    }
    return arr;
  }

  const result = {};
  for (const [k, v] of Object.entries(obj)) {
    result[k] = convertNumericKeysToArrays(v);
  }
  return result;
}

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

async function uploadKybDocuments(req, reply) {
  if (!req.isMultipart()) {
    req.kybFiles = {};
    req.body = {};
    return;
  }

  const flatFields = {};
  const kybFiles = {};
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

        const fileCheck = validateImageFile({
          fieldname: part.fieldname,
          filename: part.filename,
          mimetype: part.mimetype,
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

        ensureKybUploadDir();
        const ext = path.extname(part.filename) || ".jpg";
        const filename = generateUniqueFilename(`file${ext}`);
        const filePath = path.join(KYB_UPLOAD_DIR, filename);
        fs.writeFileSync(filePath, buffer);

        const relative = `${KYB_UPLOAD_RELATIVE_DIR}/${filename}`;
        kybFiles[part.fieldname] = relative;
        savedFiles.push(relative);
      } else {
        flatFields[part.fieldname] = part.value;
      }
    }

    const nested = nestFlatKeys(flatFields);
    req.body = convertNumericKeysToArrays(nested);
    req.kybFiles = kybFiles;
  } catch (err) {
    for (const f of savedFiles) deleteImageFile(f);

    if (err && err.code === "FST_REQ_FILE_TOO_LARGE") {
      const fieldname = (err.part && err.part.fieldname) || "file";
      return reply.code(400).send({
        success: false,
        message: `File size for ${fieldname} cannot exceed 5 MB.`,
        data: null,
      });
    }

    throw err;
  }

  if (validationMessage) {
    for (const f of savedFiles) deleteImageFile(f);
    return reply.code(400).send({
      success: false,
      message: validationMessage,
      data: null,
    });
  }
}

module.exports = { uploadKybDocuments };
