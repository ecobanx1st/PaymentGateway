"use client";

import { Button, Input, Toast } from "@/components/ReusableUi";
import { withBasePath } from "@/config/basePath";
import { postApi } from "@/lib/apiHelper";
import { notifyAuthStorageChange } from "@/lib/axiosInterceptor";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";


function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getLoginErrorMessage(error) {
  const data = error.response?.data;

  return (
    data?.message ||
    "Login failed. Please check your credentials and try again."
  );
}

function getLoginResult(response) {
  return response?.result || response?.data?.result || response?.data || response || {};
}

function getLoginMessage(response, fallbackMessage) {
  const result = getLoginResult(response);

  return (
    response?.message ||
    response?.msg ||
    response?.error ||
    result?.message ||
    result?.msg ||
    result?.error ||
    fallbackMessage
  );
}

function isTwoFactorChallenge(response) {
  const result = getLoginResult(response);

  return Boolean(
    response?.twoFactorRequired ||
      response?.requiresTwoFactor ||
      result?.twoFactorRequired ||
      result?.requiresTwoFactor,
  );
}

function isFailureResponse(response) {
  const result = getLoginResult(response);

  return response?.success === false || result?.success === false;
}

function saveLoginResponse(response) {
  const data = getLoginResult(response);
  const token = data?.token || data?.accessToken || data?.authToken;
  const user = data?.user || data?.admin;

  if (!token) {
    return null;
  }

  localStorage.setItem("accessToken", token);

  if (user) {
    localStorage.setItem("authUser", JSON.stringify(user));
  }

  notifyAuthStorageChange();

  return token;
}

// function LogoHeader() {
//   return (
    
//   );
// }

export default function LoginPage() {
  const router = useRouter();
  const otpInputRef = useRef(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [twoFactorRequired, setTwoFactorRequired] = useState(false);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const searchParams = new URLSearchParams(window.location.search);

      if (searchParams.get("logout") === "success") {
        setToast({ id: Date.now(), content: "Logged out successfully", color: "success" });
        // window.history.replaceState(null, "", "/auth/login");
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  function resetTwoFactorChallenge() {
    if (!twoFactorRequired) {
      return;
    }

    setTwoFactorRequired(false);
    setOtp("");
  }

  function handleOtpChange(event) {
    setOtp(event.target.value.replace(/\D/g, "").slice(0, 6));
    setErrors((current) => ({ ...current, otp: "" }));
  }

  function showTwoFactorChallenge(response) {
    setTwoFactorRequired(true);
    setOtp("");
    setErrors((current) => ({ ...current, otp: "" }));
    setToast({
      id: Date.now(),
      content: getLoginMessage(response, "Enter 2FA code"),
      color: "warning",
    });

    window.setTimeout(() => otpInputRef.current?.focus(), 0);
  }

  async function handleLoginSubmit(event) {
    event.preventDefault();

    const nextErrors = {};
    const payload = {
      email: email.trim(),
      password,
    };
    const trimmedOtp = otp.trim();

    if (!payload.email) {
      nextErrors.email = "Email is required.";
    } else if (!validateEmail(payload.email)) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!payload.password) {
      nextErrors.password = "Password is required.";
    } else if (payload.password.length < 6) {
      nextErrors.password = "Password must be at least 6 characters.";
    }

    if (twoFactorRequired) {
      if (!trimmedOtp) {
        nextErrors.otp = "OTP is required.";
      } else if (!/^\d{6}$/.test(trimmedOtp)) {
        nextErrors.otp = "Enter a valid 6 digit OTP.";
      } else {
        payload.twoFactorCode = trimmedOtp;
      }
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await postApi("/admin-login", payload);

      if (isTwoFactorChallenge(response)) {
        showTwoFactorChallenge(response);
        return;
      }

      if (isFailureResponse(response)) {
        setToast({
          id: Date.now(),
          content: getLoginMessage(
            response,
            "Login failed. Please check your credentials and try again.",
          ),
          color: "error",
        });
        return;
      }

      const token = saveLoginResponse(response);

      if (!token) {
        setToast({ id: Date.now(), content: "Token not found in login response", color: "error" });
        return;
      }
      setToast({ id: Date.now(), content: "Login successful", color: "success" });
      // router.push("/dashboard");
      router.push("/merchants");
    } catch (error) {
      const data = error.response?.data;

      if (isTwoFactorChallenge(data)) {
        showTwoFactorChallenge(data);
        return;
      }

      setToast({ id: Date.now(), content: getLoginErrorMessage(error), color: "error" });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-bg-secondary px-4 py-8 text-theme-text">
      {toast && (
        <div className="fixed right-4 top-4 z-[80] w-[calc(100vw-2rem)] max-w-md sm:right-6 sm:top-6">
          <Toast
            key={toast.id}
            content={toast.content}
            color={toast.color}
            duration={2500}
          />
        </div>
      )}
      <section className="w-full max-w-md rounded-rounded border border-input-border/40 bg-card-bg p-6 shadow-2xl shadow-black/30 sm:p-8">
        <div className="mb-8 flex justify-center">
          <Image
            src={withBasePath("/Loginlogo.png")}
            alt="Eco Banx logo"
            width={496}
            height={105}
            priority
            className="h-auto w-[220px] object-contain"
          />
        </div>

        <form onSubmit={handleLoginSubmit} className="space-y-5" noValidate>
          <div>
            <Input
              id="email"
              label="Email"
              type="email"
              value={email}
              placeholder="Enter email address"
              disabled={isSubmitting}
              onChange={(event) => {
                setEmail(event.target.value);
                resetTwoFactorChallenge();
              }}
              aria-invalid={Boolean(errors.email)}
            />
            {errors.email && <p className="mt-2 text-small text-red-400">{errors.email}</p>}
          </div>

          <div>
            <Input
              id="password"
              label="Password"
              type="password"
              value={password}
              placeholder="Enter password"
              disabled={isSubmitting}
              onChange={(event) => {
                setPassword(event.target.value);
                resetTwoFactorChallenge();
              }}
              aria-invalid={Boolean(errors.password)}
            />
            {errors.password && <p className="mt-2 text-small text-red-400">{errors.password}</p>}
          </div>

          {twoFactorRequired && (
            <div>
              <Input
                ref={otpInputRef}
                id="otp"
                label="OTP"
                type="text"
                value={otp}
                placeholder="Enter 6 digit OTP"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                disabled={isSubmitting}
                onChange={handleOtpChange}
                aria-invalid={Boolean(errors.otp)}
              />
              {errors.otp && <p className="mt-2 text-small text-red-400">{errors.otp}</p>}
            </div>
          )}

          <Button type="submit" variant="primary" className="w-full" disabled={isSubmitting}>
            {isSubmitting
              ? twoFactorRequired
                ? "Verifying..."
                : "Logging in..."
              : twoFactorRequired
                ? "Verify & Login"
                : "Login"}
          </Button>
        </form>
      </section>
    </main>
  );
}

