"use client";

import { useState } from "react";
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

function validateEmailOnInput(value) {
  const normalizedValue = normalizeEmail(value);

  if (!normalizedValue) return "";
  if (!EMAIL_PATTERN.test(normalizedValue)) return "Enter a valid email address.";
  return "";
}

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [toast, setToast] = useState({
    open: false,
    message: "",
    tone: "success",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const showToast = (message, tone = "error") =>
    setToast({ open: true, message, tone });

  const validateEmail = () => {
    if (!email.trim()) return "Email address is required.";
    if (!EMAIL_PATTERN.test(email.trim())) return "Enter a valid email address.";
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
        const response = await apiClient.post("/forgot-password", {
          email: normalizedEmail,
        });
        payload = response.data;
        responseOk = true;
      } catch (requestError) {
        payload = getApiErrorPayload(requestError);
      }

      if (!responseOk || payload?.success === false) {
        const responseMessage = getResponseMessage(payload);
        if (responseMessage) showToast(responseMessage);
        return;
      }

      window.localStorage.setItem("pendingPasswordResetEmail", normalizedEmail);
      redirecting = true;
      const responseMessage = getResponseMessage(payload);
      if (responseMessage) showToast(responseMessage, "success");
      window.setTimeout(() => router.push("/Auth/resetpassword"), 700);
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
      title="Forgot Password"
      subtitle="Request a password reset link for your account."
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
            setEmail(nextEmail);
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
          value={isSubmitting ? "Sending..." : "Send OTP"}
          disabled={isSubmitting || !canSubmit}
          loading={isSubmitting}
          className="w-full py-3 text-white"
          variant="primary"
        />
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-secondary-text">
          Don't Have  an account?{" "}
          <Link
            href="/Auth/signup"
            className="font-semibold text-primary-text hover:underline"
          >
            Sign Up
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
