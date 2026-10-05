"use client";

import { useEffect, useState } from "react";

export const USER_VERIFICATION_STORAGE_KEY = "ecobanx-user-verification-kind";
export const USER_VERIFICATION_APPROVED_STORAGE_KEY =
  "ecobanx-user-verification-approved";
export const USER_VERIFICATION_CHANGE_EVENT = "ecobanx";

function getKindFromAccountType(accountType) {
  const value = String(accountType || "").trim().toLowerCase();
  return /business|company|corporate|merchant|kyb/.test(value) ? "kyb" : "kyc";
}

function normalizeVerificationKind(kind) {
  return kind === "kyc" || kind === "kyb" ? kind : "";
}

function normalizeStatus(value) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function getStatusState(item, fallbackKind = "") {
  const statusEntries = [
    ["kyc", item?.kycStatus],
    ["kyb", item?.kybStatus],
    ["", item?.verificationStatus],
    ["", item?.status],
  ];

  for (const [statusKind, statusValue] of statusEntries) {
    const status = normalizeStatus(statusValue);

    if (!status) continue;

    const kind =
      normalizeVerificationKind(statusKind) ||
      normalizeVerificationKind(fallbackKind) ||
      getKindFromAccountType(item?.accountType);

    return { kind, approved: status === "approved" };
  }

  return null;
}

function getVerificationState(payload, fallbackKind = "") {
  const candidates = [
    payload,
    payload?.result,
    payload?.data,
    payload?.user,
    payload?.data?.user,
    payload?.data?.result,
    payload?.result?.data,
  ].filter(Boolean);

  const normalizedFallbackKind = normalizeVerificationKind(fallbackKind);
  let fallback = null;

  for (const item of candidates) {
    const accountKind = getKindFromAccountType(item?.accountType);
    const hasKyc = typeof item?.kyc === "boolean";
    const hasKyb = typeof item?.kyb === "boolean";
    const verifyStatus =
      typeof item?.verifyStatus === "boolean"
        ? item.verifyStatus
        : typeof item?.isVerified === "boolean"
          ? item.isVerified
          : typeof item?.verified === "boolean"
            ? item.verified
            : null;
    const statusState = getStatusState(item, normalizedFallbackKind);

    if (hasKyc && hasKyb) {
      const kind = accountKind === "kyb" ? "kyb" : "kyc";
      return { kind, approved: kind === "kyb" ? item.kyb : item.kyc };
    }

    if (hasKyc) {
      return { kind: "kyc", approved: item.kyc };
    }

    if (hasKyb) {
      return { kind: "kyb", approved: item.kyb };
    }

    if (verifyStatus !== null) {
      fallback = {
        kind: normalizedFallbackKind || accountKind,
        approved: verifyStatus,
      };
    }

    if (statusState) {
      fallback = statusState;
    }
  }

  return fallback;
}

function toVerificationValue(kind, approved = false, loading = false) {
  const normalizedKind = kind === "kyc" || kind === "kyb" ? kind : "";
  const isApproved = Boolean(approved);

  return {
    loading,
    kind: normalizedKind,
    success: isApproved,
    approved: isApproved,
    blocked: loading ? false : !isApproved,
    label: normalizedKind === "kyb" ? "KYB" : "KYC",
    message: "",
  };
}

export function readStoredUserVerification() {
  if (typeof window === "undefined") return toVerificationValue("", false, true);

  const kind = window.localStorage.getItem(USER_VERIFICATION_STORAGE_KEY);
  const approvedValue = window.localStorage.getItem(
    USER_VERIFICATION_APPROVED_STORAGE_KEY,
  );
  const approved =
    approvedValue === null ? Boolean(kind) : approvedValue === "true";

  return toVerificationValue(kind, approved);
}

export function writeStoredUserVerification(payload, fallbackKind = "") {
  if (typeof window === "undefined") return "";

  const verification = getVerificationState(payload, fallbackKind);

  if (!verification) {
    return window.localStorage.getItem(USER_VERIFICATION_STORAGE_KEY) || "";
  }

  const { kind, approved } = verification;

  if (kind) {
    window.localStorage.setItem(USER_VERIFICATION_STORAGE_KEY, kind);
    window.localStorage.setItem(
      USER_VERIFICATION_APPROVED_STORAGE_KEY,
      approved ? "true" : "false",
    );
  } else {
    window.localStorage.removeItem(USER_VERIFICATION_STORAGE_KEY);
    window.localStorage.removeItem(USER_VERIFICATION_APPROVED_STORAGE_KEY);
  }

  window.dispatchEvent(
    new CustomEvent(USER_VERIFICATION_CHANGE_EVENT, {
      detail: toVerificationValue(kind, approved),
    }),
  );

  return kind;
}

export function clearStoredUserVerification() {
  if (typeof window === "undefined") return;

  window.localStorage.removeItem(USER_VERIFICATION_STORAGE_KEY);
  window.localStorage.removeItem(USER_VERIFICATION_APPROVED_STORAGE_KEY);
  window.dispatchEvent(
    new CustomEvent(USER_VERIFICATION_CHANGE_EVENT, {
      detail: toVerificationValue(""),
    }),
  );
}

export function useStoredUserVerification() {
  const [verification, setVerification] = useState(() =>
    toVerificationValue("", false, true),
  );

  useEffect(() => {
    let cancelled = false;

    const syncVerification = (event) => {
      if (cancelled) return;
      setVerification(event?.detail || readStoredUserVerification());
    };

    queueMicrotask(() => {
      if (cancelled) return;
      setVerification(readStoredUserVerification());
    });
    window.addEventListener(USER_VERIFICATION_CHANGE_EVENT, syncVerification);
    window.addEventListener("storage", syncVerification);

    return () => {
      cancelled = true;
      window.removeEventListener(USER_VERIFICATION_CHANGE_EVENT, syncVerification);
      window.removeEventListener("storage", syncVerification);
    };
  }, []);

  return verification;
}
