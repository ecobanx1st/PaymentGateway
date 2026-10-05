const path = require("path");

const MIME_BY_EXTENSION = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".pdf": "application/pdf",
};

function normalizeUploadUrl(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";

  if (/^(data:|blob:|https?:\/\/|\/\/)/i.test(raw)) {
    return raw;
  }

  let normalized = raw.replace(/^(undefined|null)(?=\/)/i, "");

  normalized = normalized.replace(/^\/?public\/uploads\//i, "/uploads/");

  if (!normalized.startsWith("/")) {
    normalized = `/${normalized}`;
  }

  return normalized;
}

function getMimeType(value, fallback = "") {
  const clean = String(value || "").split("?")[0];
  const ext = path.extname(clean).toLowerCase();
  return MIME_BY_EXTENSION[ext] || fallback || (ext ? "application/octet-stream" : "");
}

function getFileName(value) {
  const clean = String(value || "").split("?")[0];
  const segments = clean.split("/").filter(Boolean);
  return segments.length > 0 ? decodeURIComponent(segments[segments.length - 1]) : "";
}

function buildDocumentFiles(entries = [], uploadedAt = null) {
  const files = [];

  for (const entry of entries) {
    const rawPath = entry && entry.path;
    if (!rawPath) continue;

    const url = normalizeUploadUrl(rawPath);
    const mimeType = entry.mimeType || getMimeType(url);

    files.push({
      name: entry.name || getFileName(url),
      url,
      mimeType,
      uploadedAt: uploadedAt ? new Date(uploadedAt).toISOString() : null,
    });
  }

  return files;
}

function buildKycDocumentFiles(kyc) {
  const identity = kyc.identity || {};

  return buildDocumentFiles(
    [
      { name: "Front image", path: identity.frontImage },
      { name: "Back image", path: identity.backImage },
      { name: "Selfie image", path: kyc.selfieImage },
    ],
    kyc.updatedAt || kyc.createdAt,
  );
}

function buildKybDocumentFiles(kyb) {
  const documents = kyb.documents || {};
  const entries = [
    { name: "Incorporation certificate", path: documents.incorporationCertificate },
    { name: "Tax certificate", path: documents.taxCertificate },
    { name: "Address proof", path: documents.addressProof },
  ];

  if (Array.isArray(kyb.beneficialOwners)) {
    kyb.beneficialOwners.forEach((owner, index) => {
      entries.push({
        name: `Beneficial owner ${index + 1} document`,
        path: owner && owner.beneficialOwnerDocumentImage,
      });
    });
  }

  return buildDocumentFiles(entries, kyb.updatedAt || kyb.createdAt);
}

module.exports = {
  buildDocumentFiles,
  buildKycDocumentFiles,
  buildKybDocumentFiles,
  getFileName,
  getMimeType,
  normalizeUploadUrl,
};
