"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import AuthShell from "@/components/auth-shell";
import Snackbar from "@/components/ui/Snackbar";
import apiClient, { getApiErrorPayload } from "@/lib/axiosInterceptor";
import { normalizeEmail } from "@/lib/normalize-email";
import { BASIC_EMAIL_PATTERN } from "@/lib/email-validation";

const EMAIL_PATTERN = BASIC_EMAIL_PATTERN;

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

function isAlreadyVerifiedResponse(payload) {
  const message = getResponseMessage(payload).toLowerCase();
  const code = String(payload?.code || payload?.data?.code || "").toLowerCase();
  const status = String(payload?.status || payload?.data?.status || "").toLowerCase();

  return [message, code, status].some(
    (value) => value.includes("already") && value.includes("verified"),
  );
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

function validateEmailOnInput(value) {
  const normalizedValue = normalizeEmail(value);

  if (!normalizedValue) return "";
  if (!EMAIL_PATTERN.test(normalizedValue))
    return "Enter a valid email address.";
  return "";
}

export default function ResendVerification() {
  const storedEmail = useSyncExternalStore(
    subscribeToVerificationEmail,
    getStoredVerificationEmail,
    () => "",
  );
  const [emailOverride, setEmailOverride] = useState(null);
  const [error, setError] = useState("");
  const [toast, setToast] = useState({
    open: false,
    message: "",
    tone: "success",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const email = emailOverride ?? storedEmail;

  const showToast = (message, tone = "error") =>
    setToast({ open: true, message, tone });

  const validateEmail = () => {
    if (!email.trim()) return "Email address is required.";
    if (!EMAIL_PATTERN.test(email.trim()))
      return "Enter a valid email address.";
    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const nextError = validateEmail();
    if (nextError) {
      setError(nextError);
      return;
    }

    setIsSubmitting(true);
    let redirecting = false;

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

      const responseMessage = getResponseMessage(payload);

      if (isAlreadyVerifiedResponse(payload)) {
        window.localStorage.removeItem("pendingVerificationEmail");
        window.localStorage.removeItem("pendingVerificationResendCooldownSeconds");
        redirecting = true;
        showToast(responseMessage || "Account already verified. Please login.", "info");
        window.setTimeout(() => router.push("/Auth/login"), 2000);
        return;
      }

      if (!responseOk || payload?.success === false) {
        if (responseMessage) showToast(responseMessage);
        return;
      }

      const resendCooldownSeconds = getResendCooldownSeconds(payload);

      window.localStorage.setItem("pendingVerificationEmail", normalizedEmail);
      if (resendCooldownSeconds) {
        window.localStorage.setItem(
          "pendingVerificationResendCooldownSeconds",
          String(resendCooldownSeconds),
        );
      } else {
        window.localStorage.removeItem("pendingVerificationResendCooldownSeconds");
      }
      redirecting = true;
      if (responseMessage) showToast(responseMessage, "success");
      window.setTimeout(() => router.push("/Auth/otp-verification"), 700);
    } catch (requestError) {
      if (requestError instanceof Error && requestError.message) {
        showToast(requestError.message);
      }
    } finally {
      if (!redirecting) setIsSubmitting(false);
    }
  };

  const canSubmit = !validateEmail() && !error;

  return (
    <AuthShell
      title="Resend Verification"
      subtitle="Request a new verification code for your account."
      maxWidth="max-w-xl"
    >
      <form noValidate onSubmit={handleSubmit} className="space-y-5">
        <Input
          name="email"
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(event) => {
            const nextEmail = normalizeEmail(event.target.value);
            setEmailOverride(nextEmail);
            setError(validateEmailOnInput(nextEmail));
          }}
          onBlur={() => setError(validateEmail())}
          autoComplete="email"
          inputMode="email"
          required
          rounded="rounded-xl"
          error={error}
        />

        <Button
          type="submit"
          value={isSubmitting ? "Sending..." : "Send Verification"}
          disabled={isSubmitting || !canSubmit}
          loading={isSubmitting}
          className="w-full py-3 text-white"
          variant="primary"
        />
      </form>

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
