"use client";

const ACCESS_TOKEN_KEYS = [
  "token",
  "accessToken",
  "access_token",
  "authToken",
  "auth_token",
];
const REFRESH_TOKEN_KEYS = ["refreshToken", "refresh_token"];
const REFRESH_TOKEN_EXPIRY_KEYS = [
  "refreshTokenExpiresAt",
  "refresh_token_expires_at",
];
const ACCOUNT_TYPE_KEYS = ["accountType", "account_type"];
const USER_ID_KEYS = ["merchantId", "merchant_id", "userId", "user_id", "id", "_id"];
const USER_UNIQUE_ID_KEYS = ["userUniqueId", "user_unique_id", "unique_id", "merchantUniqueId"];
const AUTH_STORAGE_KEYS = [
  ...ACCESS_TOKEN_KEYS,
  ...REFRESH_TOKEN_KEYS,
  ...REFRESH_TOKEN_EXPIRY_KEYS,
  ...ACCOUNT_TYPE_KEYS,
  "userId",
  "userUniqueId",
];

export const AUTH_CHANGE_EVENT = "ecobanx-auth-change";

const FORCE_LOGOUT_MESSAGE_KEY = "ecobanx-force-logout-message";

function hasStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

function normalizeString(value) {
  return typeof value === "string" && value.trim() ? value.trim() : "";
}

function emitAuthChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
  }
}

function getStoredValue(keys) {
  if (!hasStorage()) return "";

  for (const key of keys) {
    const value = normalizeString(window.localStorage.getItem(key));
    if (value) return value;
  }

  return "";
}

function getPayloadContainers(payload) {
  return [
    payload,
    payload?.data,
    payload?.result,
    payload?.user,
    payload?.data?.user,
    payload?.result?.user,
    payload?.meta,
    payload?.data?.meta,
    payload?.result?.meta,
  ].filter(Boolean);
}

function getStringFromPayload(payload, keys) {
  for (const container of getPayloadContainers(payload)) {
    for (const key of keys) {
      const value = normalizeString(container?.[key]);
      if (value) return value;
    }
  }

  return "";
}

export function getAccessToken(payload) {
  return getStringFromPayload(payload, ACCESS_TOKEN_KEYS);
}

export function getRefreshToken(payload) {
  return getStringFromPayload(payload, REFRESH_TOKEN_KEYS);
}

export function getRefreshTokenExpiresAt(payload) {
  return getStringFromPayload(payload, REFRESH_TOKEN_EXPIRY_KEYS);
}

export function getAccountType(payload) {
  return getStringFromPayload(payload, ACCOUNT_TYPE_KEYS);
}

export function getStoredAccessToken() {
  return getStoredValue(ACCESS_TOKEN_KEYS);
}

export function getStoredRefreshToken() {
  return getStoredValue(REFRESH_TOKEN_KEYS);
}

export function getStoredAccountType() {
  return getStoredValue(ACCOUNT_TYPE_KEYS);
}

export function getStoredUserId() {
  if (!hasStorage()) return "";
  return normalizeString(window.localStorage.getItem("userId"));
}

export function getStoredUserUniqueId() {
  if (!hasStorage()) return "";
  return normalizeString(window.localStorage.getItem("userUniqueId"));
}

export function getUserUniqueId(payload) {
  return getStringFromPayload(payload, USER_UNIQUE_ID_KEYS);
}

export function persistAuthTokens(payload, fallbackAccessToken = "") {
  if (!hasStorage()) {
    return {
      accessToken: "",
      refreshToken: "",
      refreshTokenExpiresAt: "",
      accountType: "",
      userUniqueId: "",
    };
  }

  const accessToken =
    getAccessToken(payload) || normalizeString(fallbackAccessToken);
  const refreshToken = getRefreshToken(payload);
  const refreshTokenExpiresAt = getRefreshTokenExpiresAt(payload);
  const accountType = getAccountType(payload);
  const userId = getStringFromPayload(payload, USER_ID_KEYS);
  const userUniqueId = getStringFromPayload(payload, USER_UNIQUE_ID_KEYS);

  if (accessToken) window.localStorage.setItem("token", accessToken);
  if (refreshToken) window.localStorage.setItem("refreshToken", refreshToken);
  if (refreshTokenExpiresAt) {
    window.localStorage.setItem("refreshTokenExpiresAt", refreshTokenExpiresAt);
  }
  if (accountType) window.localStorage.setItem("accountType", accountType);
  if (userId) window.localStorage.setItem("userId", userId);
  if (userUniqueId) window.localStorage.setItem("userUniqueId", userUniqueId);

  emitAuthChange();

  return { accessToken, refreshToken, refreshTokenExpiresAt, accountType, userId, userUniqueId };
}

export function clearAuthTokens() {
  if (!hasStorage()) return;

  AUTH_STORAGE_KEYS.forEach((key) => window.localStorage.removeItem(key));
  emitAuthChange();
}

export function setForceLogoutMessage(message) {
  if (typeof window === "undefined" || !message) return;

  window.sessionStorage.setItem(FORCE_LOGOUT_MESSAGE_KEY, message);
}

export function consumeForceLogoutMessage() {
  if (typeof window === "undefined") return "";

  const message = window.sessionStorage.getItem(FORCE_LOGOUT_MESSAGE_KEY) || "";
  window.sessionStorage.removeItem(FORCE_LOGOUT_MESSAGE_KEY);
  return message;
}
