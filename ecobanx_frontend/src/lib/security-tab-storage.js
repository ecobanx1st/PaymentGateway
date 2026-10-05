"use client";

export const SECURITY_ACTIVE_TAB_STORAGE_KEY = "ecobanx-security-active-tab";
export const SECURITY_PAGE_HREF = "/User/security";
export const SECURITY_TAB_PASSWORD = "password";
export const SECURITY_TAB_TWO_FACTOR = "twoFactor";
export const SECURITY_TAB_VERIFICATION = "verification";

const SECURITY_TAB_KEYS = new Set([
  SECURITY_TAB_PASSWORD,
  SECURITY_TAB_TWO_FACTOR,
  SECURITY_TAB_VERIFICATION,
]);

export function isSecurityTabKey(tabKey) {
  return SECURITY_TAB_KEYS.has(tabKey);
}

export function readStoredSecurityActiveTab(fallback = SECURITY_TAB_PASSWORD) {
  if (typeof window === "undefined") return fallback;

  const savedTab = window.localStorage.getItem(SECURITY_ACTIVE_TAB_STORAGE_KEY);
  return isSecurityTabKey(savedTab) ? savedTab : fallback;
}

export function saveStoredSecurityActiveTab(tabKey) {
  if (typeof window === "undefined" || !isSecurityTabKey(tabKey)) return;
  window.localStorage.setItem(SECURITY_ACTIVE_TAB_STORAGE_KEY, tabKey);
}
