"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/button";
import AuthShell from "@/components/auth-shell";
import Snackbar from "@/components/ui/Snackbar";
import { persistAuthTokens } from "@/lib/auth";
import apiClient, { getApiErrorPayload } from "@/lib/axiosInterceptor";
import { normalizeEmail } from "@/lib/normalize-email";
import { BASIC_EMAIL_PATTERN } from "@/lib/email-validation";

const EMAIL_PATTERN = BASIC_EMAIL_PATTERN;
const OTP_LENGTH = 6;
const DASHBOARD_PATH = "/User/dashboard";

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

function getResendCooldownSeconds(payload) {
  const value =
    payload?.resendCooldownSeconds ??
    payload?.data?.resendCooldownSeconds ??
    payload?.result?.resendCooldownSeconds ??
    payload?.retryAfter ??
    payload?.data?.retryAfter ??
    payload?.result?.retryAfter;
  const seconds = Number(value);

  return Number.isFinite(seconds) && seconds > 0 ? Math.ceil(seconds) : 0;
}

function getAccessToken(payload) {
  const candidates = [
    payload?.token,
    payload?.accessToken,
    payload?.access_token,
    payload?.data?.token,
    payload?.data?.accessToken,
    payload?.data?.access_token,
    payload?.result?.token,
    payload?.result?.accessToken,
    payload?.result?.access_token,
  ];

  return candidates.find(
    (candidate) => typeof candidate === "string" && candidate.trim(),
  )?.trim() ?? "";
}

function validateOtp(otp) {
  const errors = {};

  if (!otp) {
    errors.otp = "Verification code is required.";
  } else if (!new RegExp(`^\\d{${OTP_LENGTH}}$`).test(otp)) {
    errors.otp = "Enter the six-digit verification code.";
  }

  return errors;
}

function validateOtpOnInput(otp) {
  if (!otp) return "";
  if (!new RegExp(`^\\d{${OTP_LENGTH}}$`).test(otp)) {
    return "Enter the six-digit verification code.";
  }

  return "";
}

function getStoredVerificationEmail() {
  if (typeof window === "undefined") return "";

  const storedEmail = normalizeEmail(
    window.localStorage.getItem("pendingVerificationEmail"),
  );
  return storedEmail && EMAIL_PATTERN.test(storedEmail) ? storedEmail : "";
}

function subscribeToVerificationEmail(onStoreChange) {
  window.addEventListener("storage", onStoreChange);
  return () => window.removeEventListener("storage", onStoreChange);
}

export default function OTPVerification() {
  const otpInputRefs = useRef([]);
  const storedEmail = useSyncExternalStore(
    subscribeToVerificationEmail,
    getStoredVerificationEmail,
    () => "",
  );
  const [otpDigits, setOtpDigits] = useState(() =>
    Array.from({ length: OTP_LENGTH }, () => ""),
  );
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState({
    open: false,
    message: "",
    tone: "success",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(null);
  const [otpExpiresIn, setOtpExpiresIn] = useState(null);
  const [otpExpired, setOtpExpired] = useState(false);
  const router = useRouter();
  const email = storedEmail;
  const otp = otpDigits.join("");

  const showToast = useCallback(
    (message, tone = "error") => setToast({ open: true, message, tone }),
    [],
  );

  const isResendCountdownActive = resendSeconds !== null && resendSeconds > 0;
  const isOtpCountdownActive = otpExpiresIn !== null && otpExpiresIn > 0;
  const isStatusLoading = Boolean(email) && resendSeconds === null;
  const effectiveResendSeconds = isStatusLoading ? null : resendSeconds ?? 0;

  useEffect(() => {
    if (!isResendCountdownActive && !isOtpCountdownActive) return undefined;

    const intervalId = window.setInterval(() => {
      setResendSeconds((seconds) =>
        seconds === null || seconds <= 0 ? seconds : seconds - 1,
      );
      setOtpExpiresIn((seconds) =>
        seconds === null || seconds <= 0 ? seconds : seconds - 1,
      );
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [isResendCountdownActive, isOtpCountdownActive]);

  useEffect(() => {
    if (!email) return undefined;

    let cancelled = false;
    const normalizedEmail = normalizeEmail(email);

    (async () => {
      let payload = null;
      let responseOk = false;

      try {
        const response = await apiClient.post("/get-otp-status", {
          email: normalizedEmail,
        });
        payload = response.data;
        responseOk = true;
      } catch (requestError) {
        payload = getApiErrorPayload(requestError);
      }

      if (cancelled) return;

      if (!responseOk || payload?.success === false) {
        const responseMessage = getResponseMessage(payload);
        if (responseMessage) showToast(responseMessage);
        setResendSeconds(0);
        return;
      }

      const retryAfter = Number(payload?.retryAfter);
      setResendSeconds(
        Number.isFinite(retryAfter) && retryAfter > 0
          ? Math.ceil(retryAfter)
          : 0,
      );

      const expiresIn = Number(payload?.otpExpiresIn);
      setOtpExpiresIn(
        Number.isFinite(expiresIn) && expiresIn > 0
          ? Math.ceil(expiresIn)
          : 0,
      );
      setOtpExpired(Boolean(payload?.otpExpired));
    })();

    return () => {
      cancelled = true;
    };
  }, [email, showToast]);

  const updateOtpDigits = (index, value) => {
    const digits = value.replace(/\D/g, "").slice(0, OTP_LENGTH - index);
    const nextDigits = [...otpDigits];

    if (!digits) {
      nextDigits[index] = "";
      setOtpDigits(nextDigits);
      setErrors((current) => ({
        ...current,
        otp: validateOtpOnInput(nextDigits.join("")),
      }));
      return;
    }

    digits.split("").forEach((digit, offset) => {
      nextDigits[index + offset] = digit;
    });
    setOtpDigits(nextDigits);
    setErrors((current) => ({
      ...current,
      otp: validateOtpOnInput(nextDigits.join("")),
    }));

    const nextIndex = index + digits.length;
    if (nextIndex < OTP_LENGTH) {
      otpInputRefs.current[nextIndex]?.focus();
    }
  };

  const handleOtpKeyDown = (index, event) => {
    if (event.key !== "Backspace" || otpDigits[index] || index === 0) return;

    event.preventDefault();
    const nextDigits = [...otpDigits];
    nextDigits[index - 1] = "";
    setOtpDigits(nextDigits);
    otpInputRefs.current[index - 1]?.focus();
  };

  const handleResendVerification = async () => {
    if (
      isStatusLoading ||
      (resendSeconds !== null && resendSeconds > 0) ||
      isResending
    )
      return;

    setIsResending(true);

    try {
      const normalizedEmail = normalizeEmail(email);
      let payload = null;
      let responseOk = false;

      try {
        const response = await apiClient.post("/resend-otp", {
          email: normalizedEmail,
        });
        payload = response.data;
        responseOk = true;
      } catch (requestError) {
        payload = getApiErrorPayload(requestError);
      }

      if (!responseOk || payload?.success === false) {
        const retryAfter = getResendCooldownSeconds(payload);
        const responseMessage = getResponseMessage(payload);

        if (retryAfter) setResendSeconds(retryAfter);
        if (responseMessage) showToast(responseMessage);
        return;
      }

      setResendSeconds(getResendCooldownSeconds(payload));
      setOtpExpired(false);
      const expiresInMinutes = Number(payload?.otpExpiresInMinutes);
      setOtpExpiresIn(
        expiresInMinutes > 0 ? Math.ceil(expiresInMinutes * 60) : null,
      );
      const responseMessage = getResponseMessage(payload);
      showToast(responseMessage || "Verification email sent.", "success");
    } catch (error) {
      if (error instanceof Error && error.message) showToast(error.message);
    } finally {
      setIsResending(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const nextErrors = validateOtp(otp);

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);
    let redirecting = false;

    try {
      const normalizedEmail = normalizeEmail(email);
      let payload = null;
      let responseOk = false;
      try {
        const response = await apiClient.post("/verify-otp", {
          email: normalizedEmail,
          otp,
        });
        payload = response.data;
        responseOk = true;
      } catch (requestError) {
        payload = getApiErrorPayload(requestError);
      }

     if (!responseOk || payload?.success === false) {
  const responseMessage = getResponseMessage(payload);

  if (responseMessage) {
    showToast(responseMessage);

    if (responseMessage === "Email is required") {
      setTimeout(() => {
        router.replace("/Auth/signup");
      }, 1000); 
    }
  }

  return;
}

      const token = getAccessToken(payload);
      if (token) persistAuthTokens(payload, token);
      window.localStorage.removeItem("pendingVerificationEmail");
      window.localStorage.removeItem("pendingVerificationResendCooldownSeconds");

      redirecting = true;
      const responseMessage = getResponseMessage(payload);
      if (responseMessage) showToast(responseMessage, "success");
      window.setTimeout(
        () => router.replace(token ? DASHBOARD_PATH : "/Auth/login"),
        1500,
      );
    } catch (error) {
      if (error instanceof Error && error.message) showToast(error.message);
    } finally {
      if (!redirecting) setIsSubmitting(false);
    }
  };

  const validationErrors = validateOtp(otp);
  const hasVisibleErrors = Object.values(errors).some(Boolean);
  const canSubmit = !Object.keys(validationErrors).length && !hasVisibleErrors;
  const isOtpExpired =
    otpExpired || (otpExpiresIn !== null && otpExpiresIn <= 0);

  return (
    <AuthShell
      title="OTP Verification"
      subtitle="Enter the verification code sent to your email."
      maxWidth="max-w-xl"
    >
      <form noValidate onSubmit={handleSubmit} className="space-y-3">
        <div>
          <div className="grid grid-cols-6 gap-2 sm:gap-3">
            {otpDigits.map((digit, index) => (
              <input
                key={index}
                ref={(element) => {
                  otpInputRefs.current[index] = element;
                }}
                type="text"
                inputMode="numeric"
                autoComplete={index === 0 ? "one-time-code" : "off"}
                aria-label={`Verification code digit ${index + 1}`}
                value={digit}
                onChange={(event) => updateOtpDigits(index, event.target.value)}
                onKeyDown={(event) => handleOtpKeyDown(index, event)}
                onPaste={(event) => {
                  event.preventDefault();
                  updateOtpDigits(index, event.clipboardData.getData("text"));
                }}
                onFocus={(event) => event.currentTarget.select()}
                maxLength={1}
                className="h-12 min-w-0 rounded-xl border border-input-border bg-input-bg text-center text-xl font-semibold text-theme-text outline-none transition-all duration-200 focus:border-primary-text focus:ring-2 focus:ring-primary-text/20"
              />
            ))}
          </div>
          {errors.otp ? (
            <span className="mt-2 block text-xs text-red-400">{errors.otp}</span>
          ) : null}
          {/* {!isStatusLoading && otpExpiresIn !== null && otpExpiresIn > 0 ? (
            <p className="mt-2 text-xs text-secondary-text">
              Verification code expires in {otpExpiresIn}s
            </p>
          ) : null}
          {!isStatusLoading && isOtpExpired ? (
            <p className="mt-2 text-xs text-red-400">
              Your verification code has expired. Please resend a new code.
            </p>
          ) : null} */}
        </div>

        <Button
          type="submit"
          value={isSubmitting ? "Verifying..." : "Verify OTP"}
          disabled={isSubmitting || !canSubmit}
          loading={isSubmitting}
          className="mt-3 w-full py-3 text-white"
          variant="primary"
        />
      </form>

      <div className="mt-5 text-center">
        <p className="text-sm text-secondary-text">
          Didn&apos;t receive the email?{" "}
          {isStatusLoading ? (
            <span className="font-semibold text-secondary-text">
              Checking...
            </span>
          ) : effectiveResendSeconds > 0 ? (
            <span className="font-semibold text-red-400">
              Resend OTP in {effectiveResendSeconds}s
            </span>
          ) : (
            <button
              type="button"
              onClick={handleResendVerification}
              disabled={isResending}
              className="inline-flex cursor-pointer items-center gap-1 font-semibold text-primary-text transition hover:underline disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isResending ? (
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : null}
              {isResending ? "Sending..." : "Resend OTP"}
            </button>
          )}
        </p>
      </div>

      <div className="mt-6 text-center">
        <p className="text-sm text-secondary-text">
          Already verified?{" "}
          <Link
            href="/Auth/login"
            className="font-semibold text-primary-text hover:underline"
          >
            Login
          </Link>
        </p>
      </div>
      <Snackbar
        open={toast.open}
        message={toast.message}
        tone={toast.tone}
        onClose={() => setToast((current) => ({ ...current, open: false }))}
      />
    </AuthShell>
  );
}
