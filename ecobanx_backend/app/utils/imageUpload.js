const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

const UPLOAD_RELATIVE_DIR = "uploads/kyc";
const UPLOAD_DIR = path.join(__dirname, "../../public", UPLOAD_RELATIVE_DIR);

function ensureUploadDir() {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
}

function generateUniqueFilename(originalName) {
  const ext = path.extname(originalName) || ".jpg";
  const timestamp = Date.now();
  const uuid = uuidv4().slice(0, 8);
  return `${timestamp}-${uuid}${ext}`;
}

function deleteImageFile(relativePath) {
  if (!relativePath) return;
  const absolutePath = path.join(__dirname, "../../public", relativePath);
  try {
    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
    }
  } catch {
  }
}

function discardFileStream(stream) {
  if (!stream || typeof stream.on !== "function") return Promise.resolve();

  return new Promise((resolve) => {
    const settled = () => resolve();
    stream.on("data", () => {});
    stream.once("end", settled);
    stream.once("close", settled);
    stream.on("error", settled);
  });
}

module.exports = {
  ensureUploadDir,
  generateUniqueFilename,
  deleteImageFile,
  discardFileStream,
  UPLOAD_DIR,
  UPLOAD_RELATIVE_DIR,
};
