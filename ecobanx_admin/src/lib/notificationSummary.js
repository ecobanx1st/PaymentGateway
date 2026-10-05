import { getWithTokenApi, patchWithTokenApi } from "./apiHelper";

export const NOTIFICATION_ENDPOINT = "/get-all-notification";
export const NOTIFICATION_PAGE_SIZE = 10;
export const NOTIFICATION_TOTAL_STORAGE_KEY = "notificationTotalDocs";
export const NOTIFICATION_TOTAL_CHANGE_EVENT = "notification-total-change";

function normalizeCount(value) {
  const count = Number(value);

  return Number.isFinite(count) && count >= 0 ? count : 0;
}

export function getNotificationItems(response) {
  if (Array.isArray(response?.notifications)) {
    return response.notifications;
  }

  if (Array.isArray(response?.data?.notifications)) {
    return response.data.notifications;
  }

  return [];
}

export function getNotificationPagination(response) {
  return response?.pagination || response?.data?.pagination || null;
}

export function getNotificationTotalDocs(response) {
  const pagination = getNotificationPagination(response);

  if (pagination?.totalDocs !== undefined) {
    return normalizeCount(pagination.totalDocs);
  }

  return getNotificationItems(response).length;
}

export function getStoredNotificationTotal() {
  if (typeof window === "undefined") {
    return 0;
  }

  return normalizeCount(localStorage.getItem(NOTIFICATION_TOTAL_STORAGE_KEY));
}

export function storeNotificationTotal(totalDocs) {
  if (typeof window === "undefined") {
    return;
  }

  const nextTotalDocs = normalizeCount(totalDocs);

  localStorage.setItem(NOTIFICATION_TOTAL_STORAGE_KEY, String(nextTotalDocs));
  window.dispatchEvent(
    new CustomEvent(NOTIFICATION_TOTAL_CHANGE_EVENT, {
      detail: { totalDocs: nextTotalDocs },
    }),
  );
}

export function subscribeToNotificationTotal(onChange) {
  if (typeof window === "undefined") {
    return () => { };
  }

  function handleChange(event) {
    onChange(
      normalizeCount(
        event.detail?.totalDocs ?? localStorage.getItem(NOTIFICATION_TOTAL_STORAGE_KEY),
      ),
    );
  }

  function handleStorage(event) {
    if (event.key === NOTIFICATION_TOTAL_STORAGE_KEY) {
      onChange(normalizeCount(event.newValue));
    }
  }

  window.addEventListener(NOTIFICATION_TOTAL_CHANGE_EVENT, handleChange);
  window.addEventListener("storage", handleStorage);

  return () => {
    window.removeEventListener(NOTIFICATION_TOTAL_CHANGE_EVENT, handleChange);
    window.removeEventListener("storage", handleStorage);
  };
}

export function fetchNotificationPage(
  token,
  optionsOrPage = 1,
  fallbackLimit = NOTIFICATION_PAGE_SIZE,
) {
  const options = typeof optionsOrPage === "object"
    ? optionsOrPage
    : { page: optionsOrPage, limit: fallbackLimit };
  const payload = {
    page: options.page ?? 1,
    limit: options.limit ?? fallbackLimit,
  };

  if (options.category) {
    payload.category = options.category;
  }
  if (options.type) {
    payload.type = options.type;
  }
  if (options.isRead !== undefined && options.isRead !== null && options.isRead !== "") {
    payload.isRead = options.isRead;
  }

  return getWithTokenApi(token, NOTIFICATION_ENDPOINT, payload);
}

export function markNotificationAsRead(token, notificationId) {
  return patchWithTokenApi(token, `/notifications/${notificationId}/read`);
}

export async function refreshNotificationSummary(token) {
  const response = await fetchNotificationPage(token, 1, NOTIFICATION_PAGE_SIZE);
  const totalDocs = getNotificationTotalDocs(response);

  storeNotificationTotal(totalDocs);

  return { response, totalDocs };
}