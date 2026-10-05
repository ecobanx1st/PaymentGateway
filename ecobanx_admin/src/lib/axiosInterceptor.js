import axios from "axios";
import { withBasePath } from "@/config/basePath";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

function normalizeApiEndpoint(url = "") {
  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  return String(url).replace(/^\/+/, "");
}
const LOGIN_PATH = "/auth/login";
const TOKEN_STORAGE_KEYS = ["accessToken", "token", "authToken"];
const AUTH_STORAGE_KEYS = [
  ...TOKEN_STORAGE_KEYS,
  "refreshToken",
  "user",
  "authUser",
  "notificationTotalDocs",
];

function getBrowserStorageValue(key) {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem(key) || sessionStorage.getItem(key);
}

function getAuthToken() {
  for (const key of TOKEN_STORAGE_KEYS) {
    const token = getBrowserStorageValue(key);

    if (token) {
      return token;
    }
  }

  return null;
}

function notifyAuthStorageChange() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event("auth-storage-change"));
}

function clearAuthStorage() {
  if (typeof window === "undefined") {
    return;
  }

  AUTH_STORAGE_KEYS.forEach((key) => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });

  notifyAuthStorageChange();
}

function redirectToLogin() {
  if (typeof window === "undefined") {
    return;
  }

  const loginPath = withBasePath(LOGIN_PATH);
  const currentPath = window.location.pathname;

  if (currentPath === LOGIN_PATH || currentPath === loginPath) {
    return;
  }

  window.location.href = loginPath;
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
    if (!API_BASE_URL) {
      return Promise.reject(new Error("NEXT_PUBLIC_API_BASE_URL is not configured."));
    }

    config.url = normalizeApiEndpoint(config.url);

    if (typeof FormData !== "undefined" && config.data instanceof FormData) {
      if (typeof config.headers?.setContentType === "function") {
        config.headers.setContentType(false);
      }

      if (typeof config.headers?.delete === "function") {
        config.headers.delete("Content-Type");
        config.headers.delete("content-type");
      } else if (config.headers) {
        delete config.headers["Content-Type"];
        delete config.headers["content-type"];
      }
    }

    const token = getAuthToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAuthStorage();
      redirectToLogin();
    }

    return Promise.reject(error);
  },
);

export { apiClient, clearAuthStorage, getAuthToken, notifyAuthStorageChange };
export default apiClient;

