"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import PasswordInput from "@/components/ui/passwordinput";
import Dropdown from "@/components/ui/dropdown";
import google from "@/components/assets/google.svg";
import telegram from "@/components/assets/telegram.svg";
import lightTelegram from "@/components/assets/lighttelegram.svg";
import AuthShell from "@/components/auth-shell";
import { useTheme } from "@/components/theme-provider";
import Snackbar from "@/components/ui/Snackbar";
import {
  consumeForceLogoutMessage,
  getAccessToken,
  persistAuthTokens,
} from "@/lib/auth";
import apiClient, {
  getApiErrorPayload,
  getStoredAccessToken,
} from "@/lib/axiosInterceptor";
import { normalizeEmail } from "@/lib/normalize-email";
import { BASIC_EMAIL_PATTERN } from "@/lib/email-validation";

const EMAIL_PATTERN = BASIC_EMAIL_PATTERN;
const OTP_PATTERN = /^\d{6}$/;
const DASHBOARD_PATH = "/User/dashboard";
const ACCOUNT_TYPE_OPTIONS = [
  { label: "Individual", value: "individual" },
  { label: "Business", value: "business" },
];
const DEFAULT_ACCOUNT_TYPE = "individual";

function validateCredentials({ email, password, accountType }) {
  const errors = {};

  if (!accountType) {
    errors.accountType = "Select an account type.";
  } else if (
    !ACCOUNT_TYPE_OPTIONS.some((option) => option.value === accountType)
  ) {
    errors.accountType = "Select a valid account type.";
  }

  if (!email.trim()) {
    errors.email = "Email address is required.";
  } else if (!EMAIL_PATTERN.test(email.trim())) {
    errors.email = "Enter a valid email address.";
  }

  if (!password) {
    errors.password = "Password is required.";
  } else if (password.length < 8) {
    errors.password = "Password must be at least 8 characters.";
  }

  return errors;
}

function validateCredentialFieldOnInput(field, values) {
  if (field === "accountType") {
    if (!values.accountType) return "";
    if (!ACCOUNT_TYPE_OPTIONS.some((option) => option.value === values.accountType)) {
      return "Select a valid account type.";
    }
  }

  if (field === "email") {
    const value = values.email.trim();
    if (!value) return "";
    if (!EMAIL_PATTERN.test(value)) return "Enter a valid email address.";
  }

  if (field === "password") {
    if (!values.password) return "";
    if (values.password.length < 8)
      return "Password must be at least 8 characters.";
  }

  return "";
}

function validateTwoFactorTokenOnInput(twoFactorToken) {
  if (!twoFactorToken) return "";
  if (!OTP_PATTERN.test(twoFactorToken)) {
    return "Enter the six-digit verification code.";
  }

  return "";
}
function validateTwoFactorToken(twoFactorToken) {
  const errors = {};

  if (!twoFactorToken) {
    errors.twoFactorToken = "Verification code is required.";
  } else if (!OTP_PATTERN.test(twoFactorToken)) {
    errors.twoFactorToken = "Enter the six-digit verification code.";
  }

  return errors;
}

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

function getPayloadContainers(payload) {
  return [
    payload,
    payload?.data,
    payload?.result,
    payload?.user,
    payload?.data?.user,
    payload?.result?.user,
    payload?.meta,
    payload?.data?.meta,
    payload?.result?.meta,
  ].filter(Boolean);
}

function normalizeBoolean(value) {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (
      ["true", "enabled", "active", "required", "1", "yes"].includes(normalized)
    ) {
      return true;
    }
    if (["false", "disabled", "inactive", "0", "no"].includes(normalized)) {
      return false;
    }
  }

  return null;
}

function getBooleanFlag(payload, keys) {
  const containers = getPayloadContainers(payload);

  for (const container of containers) {
    for (const key of keys) {
      const value = normalizeBoolean(container?.[key]);
      if (value !== null) return value;
    }
  }

  return null;
}

function getTwoFactorRequired(payload) {
  const required = getBooleanFlag(payload, [
    "otpRequired",
    "otp_required",
    "requiresOtp",
    "requires_otp",
    "requiresOTP",
    "twoFactorRequired",
    "two_factor_required",
    "requiresTwoFactor",
    "requires_two_factor",
    "mfaRequired",
    "mfa_required",
  ]);

  if (required !== null) return required;

  const twoFactorTextPattern =
    /((otp|2fa|two[-_\s]?factor|mfa).*(required|enabled|verify|verification))|((required|enabled|verify|verification).*(otp|2fa|two[-_\s]?factor|mfa))/i;

  for (const container of getPayloadContainers(payload)) {
    const textCandidates = [
      container?.code,
      container?.status,
      container?.reason,
      container?.type,
      container?.message,
      container?.error,
    ];

    if (
      textCandidates.some(
        (candidate) =>
          typeof candidate === "string" && twoFactorTextPattern.test(candidate),
      )
    ) {
      return true;
    }
  }

  return (
    getBooleanFlag(payload, [
      "twoFactorEnabled",
      "twoFactorAuthEnabled",
      "isTwoFactorEnabled",
      "two_factor_enabled",
      "two_factor_auth_enabled",
      "is_two_factor_enabled",
      "twoFaEnabled",
      "twoFAEnabled",
      "is2faEnabled",
      "is_2fa_enabled",
      "2faEnabled",
      "mfaEnabled",
    ]) ?? false
  );
}

export default function Login() {
  const [remember, setRemember] = useState(false);
  const [accountType, setAccountType] = useState(DEFAULT_ACCOUNT_TYPE);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [twoFactorToken, setTwoFactorToken] = useState("");
  const [twoFactorRequired, setTwoFactorRequired] = useState(false);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState({
    open: false,
    message: "",
    tone: "success",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isDark } = useTheme();
  const router = useRouter();

  const telegramIcon = isDark ? lightTelegram : telegram;
  const showToast = (message, tone = "error") =>
    setToast({ open: true, message, tone });

  const completeLogin = (
    token,
    payload,
    message = "Signed in successfully.",
  ) => {
    persistAuthTokens(payload, token);
    setTwoFactorToken("");
    setTwoFactorRequired(false);
    showToast(message, "success");
    window.setTimeout(() => router.replace(DASHBOARD_PATH), 700);
  };

  useEffect(() => {
    if (getStoredAccessToken()) {
      router.replace(DASHBOARD_PATH);
    }
  }, [router]);

  useEffect(() => {
    const blockedMessage = consumeForceLogoutMessage();

    if (blockedMessage) {
      const handle = window.setTimeout(() => {
        setToast({ open: true, message: blockedMessage, tone: "error" });
      }, 0);

      return () => window.clearTimeout(handle);
    }

    return undefined;
  }, []);

  const handleFieldChange = (field, value) => {
    const nextAccountType =
      field === "accountType" ? value : accountType;
    const nextEmail = field === "email" ? normalizeEmail(value) : email;
    const nextPassword = field === "password" ? value : password;
    const nextTwoFactorToken =
      field === "twoFactorToken"
        ? value.replace(/\D/g, "").slice(0, 6)
        : twoFactorToken;

    if (field === "accountType") setAccountType(nextAccountType);
    if (field === "email") setEmail(nextEmail);
    if (field === "password") setPassword(nextPassword);
    if (field === "twoFactorToken") setTwoFactorToken(nextTwoFactorToken);

    if (field === "accountType" || field === "email" || field === "password") {
      setTwoFactorToken("");
      setTwoFactorRequired(false);
    }

    setErrors((current) => ({
      ...current,
      [field]:
        field === "twoFactorToken"
          ? validateTwoFactorTokenOnInput(nextTwoFactorToken)
          : validateCredentialFieldOnInput(field, {
              accountType: nextAccountType,
              email: nextEmail,
              password: nextPassword,
            }),
      ...(field === "accountType" || field === "email" || field === "password"
        ? { twoFactorToken: "" }
        : {}),
    }));
  };

  const handleFieldBlur = (field) => {
    const fieldErrors =
      field === "twoFactorToken"
        ? validateTwoFactorToken(twoFactorToken)
        : validateCredentials({ accountType, email, password });
    setErrors((current) => ({ ...current, [field]: fieldErrors[field] ?? "" }));
  };

  const handleCredentialsSubmit = async () => {
    const nextErrors = {
      ...validateCredentials({ accountType, email, password }),
      ...(twoFactorRequired ? validateTwoFactorToken(twoFactorToken) : {}),
    };

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return false;
    }

    setIsSubmitting(true);
    let redirecting = false;

    try {
      const normalizedEmail = normalizeEmail(email);
      const requestPayload = {
        accountType,
        email: normalizedEmail,
        password,
        ...(twoFactorRequired ? { otp: twoFactorToken } : {}),
      };
      let payload = null;
      let responseOk = false;
      try {
        const response = await apiClient.post("/login", requestPayload);
        payload = response.data;
        responseOk = true;
      } catch (requestError) {
        payload = getApiErrorPayload(requestError);
      }

      const token = getAccessToken(payload);
      const requiresTwoFactor = getTwoFactorRequired(payload);

      if (
        twoFactorRequired &&
        token &&
        responseOk &&
        payload?.success !== false
      ) {
        redirecting = true;
        completeLogin(
          token,
          payload,
          getResponseMessage(payload) || "Signed in successfully.",
        );
        return true;
      }

      if (requiresTwoFactor) {
        setTwoFactorRequired(true);
        if (!twoFactorRequired) setTwoFactorToken("");
        setErrors({});
        showToast(
          getResponseMessage(payload) || "Enter your authenticator code.",
          "info",
        );
        return false;
      }

      if (!responseOk || payload?.success === false) {
  const responseMessage = getResponseMessage(payload);

  if (responseMessage) {
    showToast(responseMessage);

    if (responseMessage === "verify the Email first") {
      setTimeout(() => {
        router.replace("/Auth/resend-verification");
      }, 1000);
    }

    if (responseMessage === "User not found. Please register.") {
      setTimeout(() => {
        router.replace("/Auth/signup");
      }, 1000);
    }
  }

  return false;
}

      if (!token) {
        const responseMessage = getResponseMessage(payload);
        showToast(responseMessage || "No login token was returned.");
        return false;
      }

      redirecting = true;
      completeLogin(token, payload, "Signed in successfully.");
      return true;
    } catch (error) {
      if (error instanceof Error && error.message) showToast(error.message);
      return false;
    } finally {
      if (!redirecting) setIsSubmitting(false);
    }
  };

  const handleLoginSubmit = async (event) => {
    event.preventDefault();

    await handleCredentialsSubmit();
  };

  const formErrors = {
    ...validateCredentials({ accountType, email, password }),
    ...(twoFactorRequired ? validateTwoFactorToken(twoFactorToken) : {}),
  };
  const hasVisibleErrors = Object.values(errors).some(Boolean);
  const canSubmit = !Object.keys(formErrors).length && !hasVisibleErrors;

  return (
    <AuthShell
      title="Login to your account"
      subtitle="Welcome back! Please enter your details."
      maxWidth="max-w-2xl "
    >
      <form noValidate onSubmit={handleLoginSubmit}>
        {/* <div className="grid gap-4 md:grid-cols-2">
            <Button
              value="Continue with Google"
              className="border border-border text-text hover:bg-secondary-bg"
              icon={google}
            />

            <Button
              value="Telegram"
              className="border border-border text-text hover:bg-secondary-bg"
              icon={telegramIcon}
            />
          </div>

          <div className="relative my-7">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>

            <div className="relative flex justify-center">
              <span className="bg-primary-bg px-4 text-xs text-secondary-text">
                or fill in your details
              </span>
            </div>
          </div> */}

        <div className="space-y-2">
      
          <Input
            placeholder="Email Address"
            type="email"
            name="email"
            value={email}
            onChange={(event) => handleFieldChange("email", event.target.value)}
            onBlur={() => handleFieldBlur("email")}
            autoComplete="email"
            inputMode="email"
            rounded="rounded-xl"
            required
            error={errors.email}
          />

          <PasswordInput
            placeholder="Password"
            type="password"
            name="password"
            value={password}
            onChange={(event) =>
              handleFieldChange("password", event.target.value)
            }
            onBlur={() => handleFieldBlur("password")}
            autoComplete="current-password"
            required
            error={errors.password}
          />

          {twoFactorRequired ? (
            <Input
              placeholder="Enter 2FA code"
              type="text"
              name="twoFactorToken"
              value={twoFactorToken}
              onChange={(event) =>
                handleFieldChange("twoFactorToken", event.target.value)
              }
              onBlur={() => handleFieldBlur("twoFactorToken")}
              autoComplete="one-time-code"
              inputMode="numeric"
              maxLength={6}
              rounded="rounded-xl"
              required
              error={errors.twoFactorToken}
            />
          ) : null}
        </div>

        <div className="mt-1 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          {/* <label className="flex cursor-pointer items-center gap-2 text-sm text-secondary-text hover:text-theme-text">
              <input
                type="checkbox"
                checked={remember}
                onChange={() => setRemember(!remember)}
                className="h-4 w-4 accent-primary"
              />
              Remember Me
            </label> */}

          <Link
            href="/Auth/forgot-password"
            className="text-sm font-medium text-primary-text hover:underline"
          >
            Forgot Password?
          </Link>
        </div>
        <Button
          type="submit"
          value={
            isSubmitting
              ? twoFactorRequired
                ? "Verifying..."
                : "Logging in..."
              : twoFactorRequired
                ? "Verify 2FA"
                : "Login"
          }
          disabled={isSubmitting || !canSubmit}
          loading={isSubmitting}
          className="mt-6 w-full py-3 text-white hover:bg-hover-button"
          variant="primary"
        />

        <div className="mt-6 text-center">
          <p className="text-sm text-secondary-text">
            Create have an account?{" "}
            <Link
              href="/Auth/signup"
              className="font-semibold text-primary-text hover:underline"
            >
              Signup
            </Link>
          </p>

          <p className="mt-4 text-sm text-secondary-text">
            Resend Verification Email{" "}
            <Link
              href="/Auth/resend-verification"
              className="font-semibold text-primary-text hover:underline"
            >
              Verify
            </Link>
          </p>
        </div>
      </form>
      <Snackbar
        open={toast.open}
        message={toast.message}
        tone={toast.tone}
        onClose={() => setToast((current) => ({ ...current, open: false }))}
      />
    </AuthShell>
  );
}
