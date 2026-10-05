"use client";

import axios from "axios";
import {
  clearAuthTokens,
  getAccessToken,
  getStoredAccessToken,
  getStoredRefreshToken,
  persistAuthTokens,
  setForceLogoutMessage,
} from "@/lib/auth";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3700/ecobanxApi";
const LOGIN_PATH = "/Auth/login";

const KYB_APPROVAL_REQUIRED_MESSAGE = "KYB verification must be approved.";
export const KYB_SECURITY_REDIRECT_EVENT = "ecobanx-kyb-security-required";
const KYB_SECURITY_MESSAGE_KEY = "ecobanx-kyb-security-message";
const KYB_REDIRECT_COOLDOWN_MS = 5000;

let lastKybRedirectAt = 0;

function getResponseMessage(payload) {
  if (typeof payload === "string" && payload.trim()) return payload;
  if (typeof payload?.message === "string" && payload.message.trim()) {
    return payload.message;
  }
  if (typeof payload?.error === "string" && payload.error.trim()) {
    return payload.error;
  }
  if (typeof payload?.errors?.message === "string") {
    return payload.errors.message;
  }
  if (Array.isArray(payload?.errors)) {
    const firstMessage = payload.errors.find(
      (item) => typeof item === "string" || typeof item?.message === "string",
    );

    if (typeof firstMessage === "string") return firstMessage;
    if (typeof firstMessage?.message === "string") return firstMessage.message;
  }

  return "";
}

function isFormDataPayload(value) {
  return typeof FormData !== "undefined" && value instanceof FormData;
}

function setRequestHeader(headers, name, value) {
  if (typeof headers?.set === "function") {
    headers.set(name, value);
    return;
  }

  headers[name] = value;
}

function removeRequestHeader(headers, name) {
  if (typeof headers?.delete === "function") {
    headers.delete(name);
  }

  delete headers?.[name];
}

function shouldRefreshAccessToken(error) {
  if (error.response?.status !== 401) return false;

  const payload = error.response.data;
  const code =
    typeof payload?.code === "string" ? payload.code.trim().toUpperCase() : "";
  const message = getResponseMessage(payload).toLowerCase();

  return (
    code === "TOKEN_EXPIRED" ||
    message.includes("access token has expired") ||
    message.includes("use /auth/refresh-token") ||
    message.includes("use /refresh-token")
  );
}

function isAccountBlockedError(error) {
  if (error.response?.status !== 403) return false;

  const message = getResponseMessage(error.response.data).trim().toLowerCase();

  return message === "your account has been blocked.";
}

function setKybSecurityMessage(message) {
  if (typeof window === "undefined" || !message) return;

  window.sessionStorage.setItem(KYB_SECURITY_MESSAGE_KEY, message);
}

export function consumeKybSecurityMessage() {
  if (typeof window === "undefined") return "";

  const message =
    window.sessionStorage.getItem(KYB_SECURITY_MESSAGE_KEY) || "";
  window.sessionStorage.removeItem(KYB_SECURITY_MESSAGE_KEY);
  return message;
}

function isKybApprovalRequiredError(error) {
  const message = getResponseMessage(getApiErrorPayload(error)).trim();

  return message === KYB_APPROVAL_REQUIRED_MESSAGE;
}

function handleKybApprovalRequired() {
  if (typeof window === "undefined") return;

  const now = Date.now();
  if (now - lastKybRedirectAt < KYB_REDIRECT_COOLDOWN_MS) return;
  lastKybRedirectAt = now;

  setKybSecurityMessage(KYB_APPROVAL_REQUIRED_MESSAGE);
  window.dispatchEvent(new Event(KYB_SECURITY_REDIRECT_EVENT));
}

export function getApiErrorPayload(error) {
  const payload = error?.response?.data;

  if (payload !== undefined && payload !== null && payload !== "") {
    return typeof payload === "string" ? { message: payload } : payload;
  }

  if (error instanceof Error && error.message) {
    return { message: error.message };
  }

  return {};
}

export function getApiErrorStatus(error) {
  return error?.response?.status ?? 0;
}

function redirectToLogin() {
  if (typeof window === "undefined" || window.location.pathname === LOGIN_PATH) {
    return;
  }

  window.location.href = LOGIN_PATH;
}

async function refreshAccessToken(currentAccessToken = getStoredAccessToken()) {
  const refreshToken = getStoredRefreshToken();

  if (!refreshToken) {
    clearAuthTokens();
    throw new Error("Session expired. Please sign in again.");
  }

  const response = await axios.post(
    "/refresh-token",
    {
      refreshToken,
      ...(currentAccessToken ? { accessToken: currentAccessToken } : {}),
    },
    {
      baseURL: API_BASE_URL,
      headers: {
        "Content-Type": "application/json",
        ...(currentAccessToken
          ? { Authorization: `Bearer ${currentAccessToken}` }
          : {}),
      },
    },
  );
  const accessToken = getAccessToken(response.data);

  if (!accessToken) {
    throw new Error("No access token was returned.");
  }

  persistAuthTokens(response.data, accessToken);
  return accessToken;
}

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

apiClient.interceptors.request.use(
  (config) => {
    config.headers = config.headers || {};
    const token = getStoredAccessToken();

    if (token) {
      setRequestHeader(config.headers, "Authorization", `Bearer ${token}`);
    }

    if (isFormDataPayload(config.data)) {
      removeRequestHeader(config.headers, "Content-Type");
      removeRequestHeader(config.headers, "content-type");
    }

    return config;
  },
  (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (shouldRefreshAccessToken(error) && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const token = await refreshAccessToken();
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${token}`;

        return apiClient(originalRequest);
      } catch (refreshError) {
        clearAuthTokens();
        redirectToLogin();
        return Promise.reject(refreshError);
      }
    }

    if (isAccountBlockedError(error)) {
      setForceLogoutMessage(
        "Your account has been blocked by the administrator.",
      );
      clearAuthTokens();
      redirectToLogin();
    }

    if (error.response?.status === 401) {
      clearAuthTokens();
      redirectToLogin();
    }

    if (isKybApprovalRequiredError(error)) {
      handleKybApprovalRequired();
    }

    return Promise.reject(error);
  },
);

export { apiClient, clearAuthTokens, getStoredAccessToken };
export default apiClient;
