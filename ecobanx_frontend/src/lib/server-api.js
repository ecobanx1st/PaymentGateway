import axios from "axios";

export function getBackendUrl() {
  const backendUrl =
    process.env.REACT_APP_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;
  return typeof backendUrl === "string" ? backendUrl.replace(/\/+$/, "") : "";
}

export function hasBackendUrl() {
  return Boolean(getBackendUrl());
}

export async function backendRequest(path, options = {}) {
  const backendUrl = getBackendUrl();

  if (!backendUrl) {
    throw new Error("Backend URL is not configured.");
  }

  return axios({
    url: `${backendUrl}${path}`,
    timeout: 30000,
    validateStatus: () => true,
    ...options,
  });
}

function normalizeBackendPayload(payload) {
  if (payload === undefined || payload === null || payload === "") {
    return {};
  }

  return typeof payload === "string" ? { message: payload } : payload;
}

export function backendJsonResponse(response) {
  const status = response.status || 200;
  const headers = { "Cache-Control": "no-store" };

  if (status === 204 || status === 205) {
    return new Response(null, {
      status,
      statusText: response.statusText,
      headers,
    });
  }

  return Response.json(normalizeBackendPayload(response.data), {
    status,
    statusText: response.statusText,
    headers,
  });
}
