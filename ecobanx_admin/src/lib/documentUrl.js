const DOCUMENT_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

function getDocumentOrigin(baseUrl) {
  const value = String(baseUrl || "").trim();

  if (!value) {
    return "";
  }

  try {
    return new URL(value).origin;
  } catch (error) {
    return value.replace(/\/+$/, "");
  }
}

const DOCUMENT_ORIGIN = getDocumentOrigin(DOCUMENT_BASE_URL);

export function resolveDocumentUrl(path) {
  let value = String(path || "").trim().replace(/^(undefined|null)(?=\/)/i, "");

  if (!value) {
    return "";
  }

  if (/^(data:|blob:|https?:\/\/|\/\/)/i.test(value)) {
    return value;
  }

  value = value.replace(/^\/?public\/uploads\//i, "/uploads/");

  if (!DOCUMENT_ORIGIN) {
    return value;
  }

  return `${DOCUMENT_ORIGIN}/${value.replace(/^\/+/, "")}`;
}

export function getDocumentOriginForUrl(baseUrl) {
  return getDocumentOrigin(baseUrl);
}
