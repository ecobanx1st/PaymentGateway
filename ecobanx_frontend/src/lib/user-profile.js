"use client";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.REACT_APP_BACKEND_URL ||
  "http://localhost:3700/ecobanxApi";

export const USER_PROFILE_CHANGE_EVENT = "ecobanx-user-profile-change";

function getBackendOrigin() {
  try {
    return new URL(API_BASE_URL).origin;
  } catch {
    return "http://localhost:3700";
  }
}

function normalizeMediaPath(value) {
  const raw = typeof value === "string" ? value.trim() : "";
  if (!raw) return "";

  return raw
    .replace(/^undefined(?=\/)/i, "")
    .replace(/^null(?=\/)/i, "")
    .replace(/^\/?public\/uploads\//i, "/uploads/");
}

export function resolveBackendMediaUrl(value) {
  const mediaPath = normalizeMediaPath(value);
  if (!mediaPath) return "";

  if (/^(blob:|data:)/i.test(mediaPath)) return mediaPath;
  if (/^(https?:\/\/|\/\/)/i.test(mediaPath)) return mediaPath;

  const path = mediaPath.startsWith("/") ? mediaPath : `/${mediaPath}`;
  return `${getBackendOrigin()}${path}`;
}

export function emitUserProfileChange(profile) {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent(USER_PROFILE_CHANGE_EVENT, {
      detail: profile || null,
    }),
  );
}
