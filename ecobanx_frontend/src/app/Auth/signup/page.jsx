"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PhoneInput, defaultCountries } from "react-international-phone";
import "react-international-phone/style.css";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import PasswordInput from "@/components/ui/passwordinput";
import google from "@/components/assets/google.svg";
import telegram from "@/components/assets/telegram.svg";
import lightTelegram from "@/components/assets/lighttelegram.svg";
import createaccount from "@/components/assets/signup.svg";
import AuthShell from "@/components/auth-shell";
import Dropdown from "@/components/ui/dropdown";
import Snackbar from "@/components/ui/Snackbar";
import { useTheme } from "@/components/theme-provider";
import apiClient, { getApiErrorPayload } from "@/lib/axiosInterceptor";
import { COUNTRY_OPTIONS, INDIA } from "@/lib/country-options";
import { normalizeEmail } from "@/lib/normalize-email";
import { BASIC_EMAIL_PATTERN } from "@/lib/email-validation";

const EMAIL_PATTERN = BASIC_EMAIL_PATTERN;
const PERSON_NAME_PATTERN = /^[A-Za-z][A-Za-z .'-]*$/;
const BUSINESS_NAME_PATTERN = /^[A-Za-z0-9][A-Za-z0-9 .,&'()-]*$/;
const STRONG_PASSWORD_PATTERN =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
const ACCOUNT_TYPE_OPTIONS = [
  { label: "Individual", value: "individual" },
  { label: "Business", value: "business" },
];

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

function getNationalPhoneNumber(phone, phoneCountryCode) {
  const phoneDigits = phone.replace(/\D/g, "");
  const countryCodeDigits = phoneCountryCode.replace(/\D/g, "");

  return phoneDigits.startsWith(countryCodeDigits)
    ? phoneDigits.slice(countryCodeDigits.length)
    : phoneDigits;
}

function getCountryPhoneFormat(country) {
  const countryRecord = defaultCountries.find(
    ([, iso2, dialCode]) =>
      iso2 === country?.value || `+${dialCode}` === country?.dialCode,
  );

  return countryRecord?.[3] ?? "";
}

function countFormatDigits(format) {
  if (typeof format !== "string") return 0;
  return Array.from(format).filter((char) => char === ".").length;
}

function getCountryPhoneDigitLengths(country) {
  const format = getCountryPhoneFormat(country);
  const lengths =
    format && typeof format === "object"
      ? Object.values(format).map(countFormatDigits)
      : [countFormatDigits(format)];

  return Array.from(new Set(lengths.filter((length) => length > 0))).sort(
    (first, second) => first - second,
  );
}

function formatPhoneDigitLengths(lengths) {
  if (lengths.length === 1) return `${lengths[0]} digits`;
  if (lengths.length === 2) return `${lengths[0]} or ${lengths[1]} digits`;

  return `${lengths.slice(0, -1).join(", ")} or ${lengths.at(-1)} digits`;
}

function validatePhoneNumber(phone, country, { allowEmpty = false } = {}) {
  const nationalPhone = getNationalPhoneNumber(phone, country?.dialCode ?? "");
  const countryLabel = country?.label || "selected country";

  if (!nationalPhone) {
    return allowEmpty ? "" : "Mobile number is required.";
  }

  const allowedLengths = getCountryPhoneDigitLengths(country);

  if (allowedLengths.length) {
    return allowedLengths.includes(nationalPhone.length)
      ? ""
      : `Enter a valid mobile number with ${formatPhoneDigitLengths(allowedLengths)} for ${countryLabel}.`;
  }

  return /^\d{7,15}$/.test(nationalPhone)
    ? ""
    : `Enter a valid mobile number for ${countryLabel}.`;
}

function normalizeWebsiteLink(websiteLink) {
  const trimmed = websiteLink.trim();

  if (!trimmed) return "";

  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function isValidWebsiteLink(websiteLink) {
  try {
    const url = new URL(normalizeWebsiteLink(websiteLink));

    return (
      ["http:", "https:"].includes(url.protocol) && url.hostname.includes(".")
    );
  } catch {
    return false;
  }
}

function validateRegistration({ form, phone, country, termsAccepted }) {
  const errors = {};
  const phoneError = validatePhoneNumber(phone, country);
  const isBusinessAccount = form.accountType === "business";

  if (!form.fullName.trim()) {
    errors.fullName = "Full name is required.";
  } else if (!PERSON_NAME_PATTERN.test(form.fullName.trim())) {
    errors.fullName =
      "Use letters, spaces, apostrophes, hyphens or periods only.";
  }
  if (!form.accountType) errors.accountType = "Select an account type.";

  if (isBusinessAccount) {
    if (!form.businessName.trim()) {
      errors.businessName = "Company name is required.";
    } else if (!BUSINESS_NAME_PATTERN.test(form.businessName.trim())) {
      errors.businessName =
        "Use letters, numbers and common company punctuation only.";
    }

    if (!form.websiteLink.trim()) {
      errors.websiteLink = "Website link is required.";
    } else if (!isValidWebsiteLink(form.websiteLink)) {
      errors.websiteLink = "Enter a valid website link.";
    }
  }

  if (!form.email.trim()) {
    errors.email = "Email address is required.";
  } else if (!EMAIL_PATTERN.test(form.email.trim())) {
    errors.email = "Enter a valid email address.";
  }

  if (phoneError) {
    errors.phone = phoneError;
  }

  if (!country?.label || !country?.dialCode) {
    errors.country = "Country is required.";
  }

  if (!form.password) {
    errors.password = "Password is required.";
  } else if (form.password.length < 8) {
    errors.password = "Password must be at least 8 characters.";
  } else if (!STRONG_PASSWORD_PATTERN.test(form.password)) {
    errors.password = "Use uppercase, lowercase, number and special character.";
  }

  if (!form.confirmPassword) {
    errors.confirmPassword = "Confirm your password.";
  } else if (form.confirmPassword !== form.password) {
    errors.confirmPassword = "Passwords do not match.";
  }

  if (!termsAccepted) {
    errors.terms = "Accept the terms to create your account.";
  }

  return errors;
}

function validateRegistrationFieldOnInput(field, { form, phone, country }) {
  const phoneError = validatePhoneNumber(phone, country, { allowEmpty: true });

  if (field === "fullName") {
    const value = form.fullName.trim();
    if (!value) return "";
    if (!PERSON_NAME_PATTERN.test(value)) {
      return "Use letters, spaces, apostrophes, hyphens or periods only.";
    }
  }

  if (field === "businessName") {
    const value = form.businessName.trim();
    if (!value) return "";
    if (!BUSINESS_NAME_PATTERN.test(value)) {
      return "Use letters, numbers and common company punctuation only.";
    }
  }

  if (field === "websiteLink") {
    const value = form.websiteLink.trim();
    if (!value) return "";
    if (!isValidWebsiteLink(value)) return "Enter a valid website link.";
  }

  if (field === "email") {
    const value = form.email.trim();
    if (!value) return "";
    if (!EMAIL_PATTERN.test(value)) return "Enter a valid email address.";
  }

  if (field === "phone") {
    return phoneError;
  }

  if (field === "password") {
    if (!form.password) return "";
    if (form.password.length < 8)
      return "Password must be at least 8 characters.";
    if (!STRONG_PASSWORD_PATTERN.test(form.password)) {
      return "Use uppercase, lowercase, number and special character.";
    }
  }

  if (field === "confirmPassword") {
    if (!form.confirmPassword) return "";
    if (form.confirmPassword !== form.password)
      return "Passwords do not match.";
  }

  return "";
}

export default function Signup() {
  const phoneInputRef = useRef(null);
  const [selectedCountry, setSelectedCountry] = useState(INDIA);
  const [phone, setPhone] = useState("");
  const [form, setForm] = useState({
    fullName: "",
    accountType: "",
    businessName: "",
    websiteLink: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [termsAccepted, setTermsAccepted] = useState(false);
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

  const handleFieldChange = (field, value) => {
    const nextValue = field === "email" ? normalizeEmail(value) : value;
    const nextForm = { ...form, [field]: nextValue };

    setForm(nextForm);
    setErrors((current) => {
      const nextErrors = {
        ...current,
        [field]: validateRegistrationFieldOnInput(field, {
          form: nextForm,
          phone,
          country: selectedCountry,
        }),
      };

      if (field === "password" && nextForm.confirmPassword) {
        nextErrors.confirmPassword = validateRegistrationFieldOnInput(
          "confirmPassword",
          { form: nextForm, phone, country: selectedCountry },
        );
      }

      if (field === "accountType" && value !== "business") {
        nextErrors.businessName = "";
        nextErrors.websiteLink = "";
      }

      return nextErrors;
    });
  };

  const handleFieldBlur = (field) => {
    const fieldErrors = validateRegistration({
      form,
      phone,
      country: selectedCountry,
      termsAccepted,
    });

    setErrors((current) => ({ ...current, [field]: fieldErrors[field] ?? "" }));
  };

  const handleBusinessCountryChange = (country) => {
    setSelectedCountry(country);
    setErrors((current) => ({
      ...current,
      country: "",
      phone: validateRegistrationFieldOnInput("phone", {
        form,
        phone,
        country,
      }),
    }));
    phoneInputRef.current?.setCountry(country.value, { focusOnInput: false });
  };

  const handleSignupSubmit = async (event) => {
    event.preventDefault();

    const nextErrors = validateRegistration({
      form,
      phone,
      country: selectedCountry,
      termsAccepted,
    });

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    const isBusinessAccount = form.accountType === "business";
    const payload = {
      fullName: form.fullName.trim(),
      accountType: form.accountType,
      email: normalizeEmail(form.email),
      phone: getNationalPhoneNumber(phone, selectedCountry.dialCode),
      phoneCountryCode: selectedCountry.dialCode,
      country: selectedCountry.label,
      password: form.password,
      confirmPassword: form.confirmPassword,
      ...(isBusinessAccount
        ? {
            companyName: form.businessName.trim(),
            companyWebsite: normalizeWebsiteLink(form.websiteLink),
            businessName: form.businessName.trim(),
          }
        : {}),
    };

    setIsSubmitting(true);
    let redirecting = false;

    try {
      let responsePayload = null;
      let responseOk = false;
      try {
        const response = await apiClient.post("/register", payload);
        responsePayload = response.data;
        responseOk = true;
      } catch (requestError) {
        responsePayload = getApiErrorPayload(requestError);
      }

      if (!responseOk || responsePayload?.success === false) {
        const responseMessage = getResponseMessage(responsePayload);
        if (responseMessage) showToast(responseMessage);
        return;
      }

      redirecting = true;
      const responseMessage = getResponseMessage(responsePayload);
      if (responseMessage) showToast(responseMessage, "success");
      window.localStorage.setItem("pendingVerificationEmail", payload.email);
      window.setTimeout(() => router.push("/Auth/otp-verification"), 2000);
    } catch (error) {
      if (error instanceof Error && error.message) showToast(error.message);
    } finally {
      if (!redirecting) setIsSubmitting(false);
    }
  };

  const validationErrors = validateRegistration({
    form,
    phone,
    country: selectedCountry,
    termsAccepted,
  });
  const hasVisibleErrors = Object.values(errors).some(Boolean);
  const canSubmit = !Object.keys(validationErrors).length && !hasVisibleErrors;

  return (
    <AuthShell
      title="Create your account"
      subtitle="Start accepting payments globally - free to try."
      maxWidth="max-w-2xl"
    >
      <form noValidate onSubmit={handleSignupSubmit}>
        {/* <div className="mb-6 grid gap-3 md:grid-cols-2">
          <Button
            value="Continue with Google"
            className="border border-border bg-card text-text hover:bg-secondary-bg"
            icon={google}
          />

          <Button
            value="Telegram"
            className="border border-border bg-card text-text hover:bg-secondary-bg"
            icon={telegramIcon}
          />
        </div> */}

        {/* <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>

          <div className="relative flex justify-center">
            <span className="bg-primary-bg px-3 text-xs text-secondary-text">
              or fill in your details
            </span>
          </div>
        </div> */}

        <div className="space-y-3">
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              name="fullName"
              placeholder="Full Name"
              value={form.fullName}
              onChange={(event) =>
                handleFieldChange("fullName", event.target.value)
              }
              onBlur={() => handleFieldBlur("fullName")}
              autoComplete="name"
              required
              error={errors.fullName}
              rounded="rounded-xl"
            />
            <Dropdown
              placeholder="Select account type"
              className="rounded-xl w-full !mt-0"
              triggerClassName="rounded-xl"
              options={ACCOUNT_TYPE_OPTIONS}
              value={
                ACCOUNT_TYPE_OPTIONS.find(
                  (option) => option.value === form.accountType,
                ) ?? null
              }
              onChange={(option) =>
                handleFieldChange("accountType", option.value)
              }
              searchable={false}
              required
              error={errors.accountType}
            />
          </div>

          {form.accountType === "business" ? (
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                name="businessName"
                placeholder="Company Name"
                value={form.businessName}
                onChange={(event) =>
                  handleFieldChange("businessName", event.target.value)
                }
                onBlur={() => handleFieldBlur("businessName")}
                autoComplete="organization"
                required
                error={errors.businessName}
                rounded="rounded-xl"
              />
              <Input
                name="websiteLink"
                type="url"
                placeholder="Website Link"
                value={form.websiteLink}
                onChange={(event) =>
                  handleFieldChange("websiteLink", event.target.value)
                }
                onBlur={() => handleFieldBlur("websiteLink")}
                autoComplete="url"
                inputMode="url"
                required
                error={errors.websiteLink}
                rounded="rounded-xl"
              />
            </div>
          ) : null}

          <Input
            name="email"
            type="email"
            placeholder="Email Address"
            value={form.email}
            onChange={(event) => handleFieldChange("email", event.target.value)}
            onBlur={() => handleFieldBlur("email")}
            autoComplete="email"
            inputMode="email"
            required
            error={errors.email}
            rounded="rounded-xl"
          />

          <div className="flex flex-col gap-1">
            <PhoneInput
              ref={phoneInputRef}
              defaultCountry="in"
              preferredCountries={["in", "us", "gb", "ae", "sg", "au"]}
              value={phone}
              onChange={(nextPhone, meta) => {
                const nextCountry = {
                  label: meta.country.name,
                  value: meta.country.iso2,
                  dialCode: `+${meta.country.dialCode}`,
                };

                setPhone(nextPhone);
                setSelectedCountry(nextCountry);
                setErrors((current) => ({
                  ...current,
                  phone: validateRegistrationFieldOnInput("phone", {
                    form,
                    phone: nextPhone,
                    country: nextCountry,
                  }),
                  country: "",
                }));
              }}
              onBlur={() => handleFieldBlur("phone")}
              disableDialCodeAndPrefix
              name="phone"
              required
              placeholder="Mobile number"
              inputProps={{
                "aria-label": "Mobile number",
                autoComplete: "tel",
                inputMode: "tel",
              }}
              className="signup-phone-input w-full"
              style={{
                "--react-international-phone-height": "44px",
                "--react-international-phone-border-radius": "0.75rem",
                "--react-international-phone-border-color":
                  "var(--inputborder)",
                "--react-international-phone-background-color":
                  "var(--inputbg)",
                "--react-international-phone-text-color": "var(--theme-text)",
                "--react-international-phone-dropdown-item-background-color":
                  "var(--secondarybg)",
                "--react-international-phone-dropdown-item-text-color":
                  "var(--theme-text)",
                "--react-international-phone-dropdown-item-dial-code-color":
                  "var(--secondary)",
                "--react-international-phone-selected-dropdown-item-background-color":
                  "var(--inputbg)",
              }}
              inputStyle={{ width: "100%" }}
              countrySelectorStyleProps={{
                dropdownStyleProps: {
                  style: { zIndex: 60, border: "1px solid var(--inputborder)" },
                },
              }}
            />
            {errors.phone ? (
              <span className="min-h-[18px] text-xs text-red-400">
                {errors.phone}
              </span>
            ) : null}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <PasswordInput
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={(event) =>
                handleFieldChange("password", event.target.value)
              }
              onBlur={() => handleFieldBlur("password")}
              autoComplete="new-password"
              required
              error={errors.password}
            />

            <PasswordInput
              name="confirmPassword"
              placeholder="Confirm Password"
              value={form.confirmPassword}
              onChange={(event) =>
                handleFieldChange("confirmPassword", event.target.value)
              }
              onBlur={() => handleFieldBlur("confirmPassword")}
              autoComplete="new-password"
              required
              error={errors.confirmPassword}
            />
          </div>

          <Dropdown
            placeholder="Country"
            className="rounded-xl w-full !mt-0"
            triggerClassName="rounded-xl"
            options={COUNTRY_OPTIONS}
            value={selectedCountry}
            onChange={handleBusinessCountryChange}
            error={errors.country}
          />
        </div>

        <div>
          <label className="mt-4 flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(event) => {
                setTermsAccepted(event.target.checked);
                setErrors((current) => ({ ...current, terms: "" }));
              }}
              onBlur={() => handleFieldBlur("terms")}
              className="mt-1 accent-primary"
            />

            <span className="text-sm leading-5 text-theme-text">
              I agree to{" "}
              <button
                type="button"
                onClick={(event) => {
                  event.preventDefault();
                  showToast("Terms and conditions will be added soon.", "info");
                }}
                className="text-primary-text hover:underline"
              >
                Eco Banx&apos;s Terms of Service
              </button>{" "}
              and{" "}
              <button
                type="button"
                onClick={(event) => {
                  event.preventDefault();
                  showToast("Privacy policy will be added soon.", "info");
                }}
                className="text-primary-text hover:underline"
              >
                Privacy Policy
              </button>
              , and confirm I&apos;m at least 18 years old.
            </span>
          </label>
          {errors.terms ? (
            <span className="mt-1 block text-xs text-red-400">
              {errors.terms}
            </span>
          ) : null}
        </div>

        <Button
          type="submit"
          value={isSubmitting ? "Creating account..." : "Create My Account"}
          icon={createaccount}
          disabled={isSubmitting || !canSubmit}
          loading={isSubmitting}
          className="mt-6 w-full bg-primary py-3 text-white hover:bg-primary-hover"
          variant="primary"
        />

        <div className="mt-6 text-center">
          <p className="text-sm text-secondary-text">
            Already have an account?{" "}
            <Link
              href="/Auth/login"
              className="font-semibold text-primary-text hover:underline"
            >
              Login
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
