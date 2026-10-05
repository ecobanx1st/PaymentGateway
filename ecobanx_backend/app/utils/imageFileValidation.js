const path = require("path");

const ALLOWED_IMAGE_MIME_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const ALLOWED_IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];

const EXTENSION_TO_MIME_TYPES = {
  ".jpg": ["image/jpeg", "image/jpg"],
  ".jpeg": ["image/jpeg", "image/jpg"],
  ".png": ["image/png"],
  ".webp": ["image/webp"],
};

function validateImageFile(file, options = {}) {
  const fieldname = file && file.fieldname !== undefined ? String(file.fieldname) : "file";
  const filename = file && file.filename !== undefined ? String(file.filename) : "";
  const mimetype = file && file.mimetype !== undefined ? String(file.mimetype) : "";

  const fieldLabel =
    options && typeof options.fieldLabel === "string" && options.fieldLabel.trim()
      ? options.fieldLabel.trim()
      : "";

  const invalid = {
    valid: false,
    message: fieldLabel
      ? `${fieldLabel} must be a PNG, JPG, or WEBP image.`
      : `Invalid file type for ${fieldname}. Only JPG, JPEG, PNG, and WEBP files are allowed.`,
  };

  if (!ALLOWED_IMAGE_MIME_TYPES.includes(mimetype)) {
    return invalid;
  }

  const ext = path.extname(filename).toLowerCase();

  if (!ALLOWED_IMAGE_EXTENSIONS.includes(ext)) {
    return invalid;
  }

  const allowedMimeForExt = EXTENSION_TO_MIME_TYPES[ext] || [];

  if (!allowedMimeForExt.includes(mimetype)) {
    return invalid;
  }

  return { valid: true };
}

module.exports = {
  validateImageFile,
  ALLOWED_IMAGE_MIME_TYPES,
  ALLOWED_IMAGE_EXTENSIONS,
};