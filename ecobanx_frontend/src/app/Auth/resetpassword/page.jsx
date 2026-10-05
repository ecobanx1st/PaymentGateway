"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/button";
import PasswordInput from "@/components/ui/passwordinput";
import AuthShell from "@/components/auth-shell";
import Snackbar from "@/components/ui/Snackbar";
import apiClient, { getApiErrorPayload } from "@/lib/axiosInterceptor";
import { normalizeEmail } from "@/lib/normalize-email";
import { BASIC_EMAIL_PATTERN } from "@/lib/email-validation";

const EMAIL_PATTERN = BASIC_EMAIL_PATTERN;
const OTP_LENGTH = 6;
const STRONG_PASSWORD_PATTERN =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

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

function validateForm(otp, newPassword, confirmPassword) {
  const nextErrors = {};

  if (!/^\d{6}$/.test(otp)) {
    nextErrors.otp = "Enter the six-digit verification code.";
  }
  if (!newPassword) {
    nextErrors.newPassword = "New password is required.";
  } else if (newPassword.length < 8) {
    nextErrors.newPassword = "Password must be at least 8 characters.";
  } else if (!STRONG_PASSWORD_PATTERN.test(newPassword)) {
    nextErrors.newPassword = "Use uppercase, lowercase, number and special character.";
  }
  if (!confirmPassword) {
    nextErrors.confirmPassword = "Confirm your new password.";
  } else if (newPassword !== confirmPassword) {
    nextErrors.confirmPassword = "Passwords do not match.";
  }

  return nextErrors;
}

function validateOtpOnInput(otp) {
  if (!otp) return "";
  if (!new RegExp(`^\\d{${OTP_LENGTH}}$`).test(otp)) {
    return "Enter the six-digit verification code.";
  }

  return "";
}

function validatePasswordOnInput(field, nextPassword, nextConfirmPassword) {
  if (field === "newPassword") {
    if (!nextPassword) return "";
    if (nextPassword.length < 8) return "Password must be at least 8 characters.";
    if (!STRONG_PASSWORD_PATTERN.test(nextPassword)) {
      return "Use uppercase, lowercase, number and special character.";
    }
  }

  if (field === "confirmPassword") {
    if (!nextConfirmPassword) return "";
    if (nextConfirmPassword !== nextPassword) return "Passwords do not match.";
  }

  return "";
}

function getStoredResetEmail() {
  if (typeof window === "undefined") return "";

  const storedEmail = normalizeEmail(
    window.localStorage.getItem("pendingPasswordResetEmail"),
  );

  return storedEmail && EMAIL_PATTERN.test(storedEmail) ? storedEmail : "";
}

function subscribeToResetEmail(onStoreChange) {
  window.addEventListener("storage", onStoreChange);
  return () => window.removeEventListener("storage", onStoreChange);
}

export default function ResetPassword() {
  const otpInputRefs = useRef([]);
  const email = useSyncExternalStore(
    subscribeToResetEmail,
    getStoredResetEmail,
    () => "",
  );
  const [otpDigits, setOtpDigits] = useState(() =>
    Array.from({ length: OTP_LENGTH }, () => ""),
  );
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState({
    open: false,
    message: "",
    tone: "success",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const otp = otpDigits.join("");

  useEffect(() => {
    if (!email) {
      router.replace("/Auth/forgot-password");
    }
  }, [email, router]);

  const showToast = (message, tone = "error") =>
    setToast({ open: true, message, tone });

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

  const handleSubmit = async (event) => {
    event.preventDefault();

    const nextErrors = validateForm(otp, newPassword, confirmPassword);
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
        const response = await apiClient.post("/reset-password", {
          otp,
          email: normalizedEmail,
          newPassword,
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

      window.localStorage.removeItem("pendingPasswordResetEmail");
      redirecting = true;
      const responseMessage = getResponseMessage(payload);
      if (responseMessage) showToast(responseMessage, "success");
      window.setTimeout(() => router.push("/Auth/login"), 700);
    } catch (error) {
      if (error instanceof Error && error.message) showToast(error.message);
    } finally {
      if (!redirecting) setIsSubmitting(false);
    }
  };

  const validationErrors = validateForm(otp, newPassword, confirmPassword);
  const hasVisibleErrors = Object.values(errors).some(Boolean);
  const canSubmit = !Object.keys(validationErrors).length && !hasVisibleErrors;

  if (!email) return null;

  return (
    <AuthShell
      title="Reset Password"
      subtitle="Enter the verification code and create a new password."
      maxWidth="max-w-xl"
    >
      <form noValidate onSubmit={handleSubmit} className="space-y-4">
        <div>
          <p className="mb-2 text-sm font-medium text-secondary-text">
            Verification code
          </p>
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
        </div>

        <PasswordInput
          label="New Password"
          name="newPassword"
          value={newPassword}
          placeholder="Enter new password"
          onChange={(event) => {
            const nextPassword = event.target.value;
            setNewPassword(nextPassword);
            setErrors((current) => ({
              ...current,
              newPassword: validatePasswordOnInput(
                "newPassword",
                nextPassword,
                confirmPassword,
              ),
              ...(confirmPassword
                ? {
                    confirmPassword: validatePasswordOnInput(
                      "confirmPassword",
                      nextPassword,
                      confirmPassword,
                    ),
                  }
                : {}),
            }));
          }}
          autoComplete="new-password"
          required
          error={errors.newPassword}
        />

        <PasswordInput
          label="Confirm Password"
          name="confirmPassword"
          value={confirmPassword}
          placeholder="Confirm your password"
          onChange={(event) => {
            const nextConfirmPassword = event.target.value;
            setConfirmPassword(nextConfirmPassword);
            setErrors((current) => ({
              ...current,
              confirmPassword: validatePasswordOnInput(
                "confirmPassword",
                newPassword,
                nextConfirmPassword,
              ),
            }));
          }}
          autoComplete="new-password"
          required
          error={errors.confirmPassword}
        />

        <Button
          type="submit"
          value={isSubmitting ? "Updating..." : "Change Password"}
          disabled={isSubmitting || !canSubmit}
          loading={isSubmitting}
          className="w-full py-3 text-white"
          variant="primary"
        />
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-secondary-text">
          Remember your password?{" "}
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
