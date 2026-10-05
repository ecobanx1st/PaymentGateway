const path = require("path");
const fs = require("fs");
const {
  generateUniqueFilename,
  deleteImageFile,
} = require("../utils/imageUpload");

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ASSET_UPLOAD_RELATIVE_DIR = "uploads/assets";
const ASSET_UPLOAD_DIR = path.join(__dirname, "../../public", ASSET_UPLOAD_RELATIVE_DIR);

function ensureAssetUploadDir() {
  if (!fs.existsSync(ASSET_UPLOAD_DIR)) {
    fs.mkdirSync(ASSET_UPLOAD_DIR, { recursive: true });
  }
}

async function uploadAssetImage(req, reply) {
  if (!req.isMultipart()) {
    req.assetImage = null;
    return;
  }

  const flatFields = {};
  let assetImage = null;
  const savedFiles = [];

  try {
    const parts = req.parts();
    for await (const part of parts) {
      if (part.file) {
        if (!ALLOWED_MIME_TYPES.includes(part.mimetype)) {
          for (const f of savedFiles) deleteImageFile(f);
          return reply.code(400).send({
            success: false,
            message: `Invalid file type for ${part.fieldname}. Allowed: JPEG, PNG, WEBP`,
            data: null,
          });
        }

        const buffer = await part.toBuffer();
        if (buffer.length > MAX_FILE_SIZE) {
          for (const f of savedFiles) deleteImageFile(f);
          return reply.code(400).send({
            success: false,
            message: `File ${part.fieldname} exceeds 5 MB limit`,
            data: null,
          });
        }

        ensureAssetUploadDir();
        const ext = path.extname(part.filename) || ".jpg";
        const filename = generateUniqueFilename(`file${ext}`);
        const filePath = path.join(ASSET_UPLOAD_DIR, filename);
        fs.writeFileSync(filePath, buffer);

        const relative = `${ASSET_UPLOAD_RELATIVE_DIR}/${filename}`;

        if (part.fieldname === "image") {
          assetImage = relative;
        }

        savedFiles.push(relative);
      } else {
        const networkField = part.fieldname.match(/^networks\.(\d+)\.(\w+)$/);

        if (networkField) {
          const index = Number(networkField[1]);
          const field = networkField[2];

          if (!Array.isArray(flatFields.networks)) {
            flatFields.networks = [];
          }

          if (!flatFields.networks[index]) {
            flatFields.networks[index] = {};
          }

          flatFields.networks[index][field] = part.value;
        } else {
          flatFields[part.fieldname] = part.value;
        }
      }
    }

    if (Array.isArray(flatFields.networks)) {
      flatFields.networks = flatFields.networks
        .map((config) => {
          const next = { ...config };

          if (next.withdrawFee !== undefined) {
            next.withdrawFee = Number(next.withdrawFee);
          }

          if (next.minWithdrawAmount !== undefined) {
            next.minWithdrawAmount = Number(next.minWithdrawAmount);
          }

          if (next.decimal !== undefined) {
            next.decimal = Number(next.decimal);
          }

          return next;
        })
        .filter((config) => config.networkId);
    }

    if (flatFields.depositStatus !== undefined) {
      flatFields.depositStatus = flatFields.depositStatus === "true";
    }

    if (flatFields.withdrawStatus !== undefined) {
      flatFields.withdrawStatus = flatFields.withdrawStatus === "true";
    }

    if (flatFields.status !== undefined) {
      flatFields.status = flatFields.status === "true";
    }


    req.body = flatFields;
    req.assetImage = assetImage;
  } catch (err) {
    for (const f of savedFiles) deleteImageFile(f);
    throw err;
  }
}

module.exports = { uploadAssetImage };
