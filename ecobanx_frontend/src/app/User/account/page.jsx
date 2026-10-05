"use client";

import { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { PhoneInput, defaultCountries } from "react-international-phone";
import "react-international-phone/style.css";
import { motion } from "framer-motion";
import { AlertTriangle, CalendarDays, Camera, Check, Trash2 } from "lucide-react";
import Button from "@/components/ui/button";
import Dropdown from "@/components/ui/dropdown";
import Input from "@/components/ui/input";
import Modal from "@/components/ui/Modal";
import PageTopBanner from "@/components/ui/PageTopBanner";
import Snackbar from "@/components/ui/Snackbar";
import Toggle from "@/components/ui/Toggle";
import Skeleton from "@/components/ui/skeleton";
import { getAccountBaseRoute } from "@/utils/accountRoutes";
import apiClient, {
  getApiErrorPayload,
  getStoredAccessToken,
} from "@/lib/axiosInterceptor";
import { normalizeEmail } from "@/lib/normalize-email";
import {
  emitUserProfileChange,
  resolveBackendMediaUrl,
} from "@/lib/user-profile";
import { COUNTRY_OPTIONS, INDIA } from "@/lib/country-options";
import { NOTIFICATION_SETTINGS, TABS, USER_PROFILE } from "./_data";

function getMatchedCountryOption(country) {
  const normalizedCountry = normalizeProfileString(country).toLowerCase();
  if (!normalizedCountry) return null;

  return COUNTRY_OPTIONS.find(
    (option) =>
      option.label.toLowerCase() === normalizedCountry ||
      option.value.toLowerCase() === normalizedCountry ||
      option.dialCode === country,
  );
}

function getCountryOption(country) {
  const matchedCountry = getMatchedCountryOption(country);
  if (matchedCountry) return matchedCountry;

  return normalizeProfileString(country)
    ? { label: country, value: country }
    : null;
}

const DEFAULT_PHONE_COUNTRY = INDIA || COUNTRY_OPTIONS[0] || null;

function getNationalPhoneNumber(phone, phoneCountryCode = "") {
  const phoneDigits = String(phone || "").replace(/\D/g, "");
  const countryCodeDigits = String(phoneCountryCode || "").replace(/\D/g, "");

  return countryCodeDigits && phoneDigits.startsWith(countryCodeDigits)
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

function getPhoneCountryFromProfile(profile) {
  const phoneCountry =
    COUNTRY_OPTIONS.find((country) =>
      String(profile?.phone || "").trim().startsWith(country.dialCode),
    ) ||
    getCountryOption(profile?.country) ||
    DEFAULT_PHONE_COUNTRY;

  return phoneCountry;
}

function validateProfilePhoneCountry({ profile, phoneCountry }) {
  const selectedCountry = getMatchedCountryOption(profile.country);
  if (selectedCountry?.value && phoneCountry?.value !== selectedCountry.value) {
    return "Phone country must match Country.";
  }

  if (!profile.phone) return "";

  const nationalPhone = getNationalPhoneNumber(profile.phone, phoneCountry?.dialCode);
  if (!nationalPhone) return "";

  const allowedLengths = getCountryPhoneDigitLengths(phoneCountry);
  if (allowedLengths.length && !allowedLengths.includes(nationalPhone.length)) {
    return `Phone number should have ${formatPhoneDigitLengths(allowedLengths)} for ${phoneCountry?.label || "selected country"}.`;
  }

  return "";
}

function parseProfileDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value || ""))) return null;

  const [year, month, day] = value.split("-").map(Number);
  const parsed = new Date(year, month - 1, day);

  return parsed.getFullYear() === year &&
    parsed.getMonth() === month - 1 &&
    parsed.getDate() === day
    ? parsed
    : null;
}

function getTodayInputDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function validateProfileDob(value, { allowEmpty = false } = {}) {
  const dob = normalizeProfileString(value);
  if (!dob) return allowEmpty ? "" : "Date of birth is required.";

  const parsed = parseProfileDate(dob);
  if (!parsed) return "Enter a valid date of birth.";
  if (dob > getTodayInputDate()) return "Date of birth cannot be in the future.";

  const today = new Date();
  let age = today.getFullYear() - parsed.getFullYear();
  const monthDiff = today.getMonth() - parsed.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < parsed.getDate())
  ) {
    age -= 1;
  }

  return age < 18 ? "You must be at least 18 years old." : "";
}

function validateProfileCountry(value, { allowEmpty = false } = {}) {
  const country = normalizeProfileString(value);
  if (!country) return allowEmpty ? "" : "Country is required.";

  return getMatchedCountryOption(country) ? "" : "Select a valid country.";
}

function splitFullName(fullName) {
  const parts =
    typeof fullName === "string" ? fullName.trim().split(/\s+/) : [];

  return {
    firstName: parts[0] || "",
    lastName: parts.slice(1).join(" "),
  };
}

const INITIAL_PROFILE_NAME = splitFullName(USER_PROFILE.fullName);
const INITIAL_PROFILE = {
  firstName: INITIAL_PROFILE_NAME.firstName,
  lastName: INITIAL_PROFILE_NAME.lastName,
  email: USER_PROFILE.email ?? "",
  businessName: USER_PROFILE.businessName ?? "",
  phone: USER_PROFILE.phone ?? "",
  dob: USER_PROFILE.dob ?? "",
  country: USER_PROFILE.country ?? "",
};

function normalizeProfileString(value) {
  return typeof value === "string" && value.trim() ? value.trim() : "";
}

const PROFILE_FIRST_NAME_PATTERN = /^[A-Za-z][A-Za-z ]*$/;

function sanitizeProfileFirstName(value = "") {
  return String(value).replace(/[^A-Za-z ]/g, "");
}

function validateProfileFirstName(value) {
  const firstName = normalizeProfileString(value);
  if (!firstName) return "First name is required.";
  if (!PROFILE_FIRST_NAME_PATTERN.test(firstName)) {
    return "First name can contain letters and spaces only.";
  }

  return "";
}

function getProfileDisplayName(profile) {
  const fullName = [profile.firstName, profile.lastName]
    .map((part) => (typeof part === "string" ? part.trim() : ""))
    .filter(Boolean)
    .join(" ");

  return fullName || "Account user";
}

function normalizeDateInput(value) {
  if (typeof value !== "string" || !value.trim()) return "";
  if (/^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10);

  const displayMatch = value.trim().match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
  if (displayMatch) {
    const [, day, month, year] = displayMatch;
    return `${year}-${String(Number(month)).padStart(2, "0")}-${String(Number(day)).padStart(2, "0")}`;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
}

function formatDateForDisplay(value) {
  const stringValue = String(value || "").trim();
  const normalizedDate = stringValue.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (!normalizedDate) return stringValue;

  const [, year, month, day] = normalizedDate;
  return `${day}-${month}-${year}`;
}

function normalizeProfileDateInput(value) {
  const digits = String(value || "")
    .replace(/\D/g, "")
    .slice(0, 8);
  const displayValue = [
    digits.slice(0, 2),
    digits.slice(2, 4),
    digits.slice(4, 8),
  ]
    .filter(Boolean)
    .join("-");

  const fullDate = displayValue.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (!fullDate) return displayValue;

  const [, day, month, year] = fullDate;
  return `${year}-${month}-${day}`;
}

function openNativeDatePicker(input) {
  if (!input) return;

  if (typeof input.showPicker === "function") {
    input.showPicker();
    return;
  }

  input.click();
}

function getProfileFields(profileData, fallbackProfile) {
  const splitName = splitFullName(profileData?.fullName);

  return {
    firstName:
      normalizeProfileString(profileData?.firstname) ||
      normalizeProfileString(profileData?.firstName) ||
      splitName.firstName ||
      fallbackProfile.firstName ||
      "",
    lastName:
      normalizeProfileString(profileData?.lastname) ||
      normalizeProfileString(profileData?.lastName) ||
      splitName.lastName ||
      fallbackProfile.lastName ||
      "",
    email: normalizeEmail(profileData?.email) || fallbackProfile.email || "",
    businessName:
      profileData?.businessName ??
      profileData?.companyName ??
      fallbackProfile.businessName ??
      "",
    phone: profileData?.phone ?? fallbackProfile.phone ?? "",
    dob: normalizeDateInput(profileData?.dob) || fallbackProfile.dob || "",
    country: profileData?.country ?? fallbackProfile.country ?? "",
  };
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

const TabButton = forwardRef(function TabButton(
  { tab, active, onClick, onKeyDown },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      role="tab"
      aria-selected={active}
      tabIndex={active ? 0 : -1}
      onClick={onClick}
      onKeyDown={onKeyDown}
      className={`relative z-10 flex w-full items-center rounded-[10px] px-3 py-2.5 text-left text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/25 ${
        active
          ? "text-primary-text"
          : "text-secondary-text hover:bg-secondary-bg hover:text-text"
      }`}
    >
      {active ? (
        <>
          <motion.div
            layoutId="accountTabBg"
            className="absolute inset-0 -z-10 rounded-[10px] bg-primary/10"
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
          />
          <motion.span
            layoutId="accountTabIndicator"
            className="absolute bottom-2 left-0 top-2 w-0.5 rounded-r-full bg-primary-text -z-10"
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
          />
        </>
      ) : null}
      {tab.label}
    </button>
  );
});

function SectionCard({ children, className = "" }) {
  return (
    <section
      className={`rounded-[18px] bg-primary-bg border border-input-border p-4 sm:p-6 ${className}`}
      style={{ background: "var(--card-bg)" }}
    >
      {children}
    </section>
  );
}

function NotificationRow({ label, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border-light py-4 last:border-b-0 last:pb-0">
      <div>
        <p className="text-md font-semibold text-theme-text">{label}</p>
        <p className="mt-1 text-sm text-secondary-text">{description}</p>
      </div>
      <Toggle
        checked={checked}
        onChange={onChange}
        ariaLabel={label}
        size="sm"
      />
    </div>
  );
}

function ProfileAvatar({ src, name, onPick }) {
  const initials = useMemo(() => {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    return (
      parts
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase() || "A"
    );
  }, [name]);

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border border-input-border bg-secondary-bg text-lg font-semibold text-primary-text">
        <span>{initials}</span>
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element -- Supports blob previews and backend upload URLs without image config.
          <img
            key={src}
            src={src}
            alt={name}
            className="absolute inset-0 h-full w-full object-cover"
            onError={(event) => {
              event.currentTarget.hidden = true;
            }}
          />
        ) : null}
      </div>
      <div className="flex flex-col items-left">
        <Button
          value="Upload new photo"
          onClick={onPick}
          rightIcon={<Camera size={15} />}
          className="h-10 w-fit border-input-border bg-input-bg px-4 text-sm font-semibold text-theme-text hover:border-primary hover:text-primary"
        />
        <span className="text-xs text-gray-400 ml-3 ">
          Supported format: PNG, JPEG, JPG, WEBP.
        </span>
      </div>
    </div>
  );
}

export default function Page() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState("profile");
  const [profile, setProfile] = useState(INITIAL_PROFILE);
  const [phoneCountry, setPhoneCountry] = useState(() =>
    getPhoneCountryFromProfile(INITIAL_PROFILE),
  );
  const [profileImage, setProfileImage] = useState("");
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profileErrors, setProfileErrors] = useState({});
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [originalProfile, setOriginalProfile] = useState(INITIAL_PROFILE);
  const [notificationSettings, setNotificationSettings] = useState(() =>
    Object.fromEntries(
      NOTIFICATION_SETTINGS.map((item) => [item.key, item.defaultChecked]),
    ),
  );
  const [snackbar, setSnackbar] = useState({ open: false, message: "", tone: "success" });
  const [dangerOpen, setDangerOpen] = useState(false);
  const fileInputRef = useRef(null);
  const dobPickerRef = useRef(null);
  const imageUrlRef = useRef("");
  const tabsRef = useRef([]);
  const hasMountedNotifications = useRef(false);

  const baseRoute = getAccountBaseRoute();

  useEffect(() => {
    let cancelled = false;

    const loadProfile = async () => {
      const token = getStoredAccessToken();

      if (!token) {
        if (!cancelled) setLoading(false);
        return;
      }

      try {
        let payload = null;
        let responseOk = false;

        try {
          

          if (!baseRoute) return;

          const response = await apiClient.post(`${baseRoute}/profile`);
          payload = response.data;
          responseOk = true;
        } catch (requestError) {
          payload = getApiErrorPayload(requestError);
        }

        if (!responseOk || payload?.success === false) {
          const responseMessage = getResponseMessage(payload);
          if (!cancelled && responseMessage) {
            setSnackbar({ open: true, message: responseMessage, tone: "error" });
          }
          return;
        }

        const profileData = payload?.result;
        if (!profileData || cancelled) return;
const nextProfile = getProfileFields(profileData, INITIAL_PROFILE);

setProfile(nextProfile);
setOriginalProfile(nextProfile);       
        setPhoneCountry(getPhoneCountryFromProfile(nextProfile));
 setProfileImage(resolveBackendMediaUrl(profileData.profile_picture));
        setProfileImageFile(null);
        emitUserProfileChange(profileData);
      } catch (error) {
        if (!cancelled && error instanceof Error && error.message) {
          setSnackbar({ open: true, message: error.message, tone: "error" });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const syncTabFromLocation = () => {
      const params = new URLSearchParams(window.location.search);
      const nextTab = params.get("tab");
      const validTab = TABS.some((tab) => tab.key === nextTab)
        ? nextTab
        : "profile";
      setActiveTab(validTab);
    };

    syncTabFromLocation();
    window.addEventListener("popstate", syncTabFromLocation);

    return () => window.removeEventListener("popstate", syncTabFromLocation);
  }, []);

  useEffect(() => {
    return () => {
      if (imageUrlRef.current) {
        URL.revokeObjectURL(imageUrlRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!hasMountedNotifications.current) {
      hasMountedNotifications.current = true;
      return;
    }
  }, [notificationSettings]);

  if (loading) {
    return <Skeleton pageName="account" />;
  }

  const handleTabKeyDown = (event, index) => {
    let nextIndex = null;

    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      nextIndex = (index + 1) % TABS.length;
    }

    if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      nextIndex = (index - 1 + TABS.length) % TABS.length;
    }

    if (event.key === "Home") {
      nextIndex = 0;
    }

    if (event.key === "End") {
      nextIndex = TABS.length - 1;
    }

    if (nextIndex === null) return;

    event.preventDefault();
    const nextTab = TABS[nextIndex].key;
    setActiveTab(nextTab);
    router.push(`${pathname}?tab=${nextTab}`, { scroll: false });
    tabsRef.current[nextIndex]?.focus();
  };

  const pickImage = () => fileInputRef.current?.click();

  const handleImageChange = (event) => {
    const file = event.target.files?.[0] ?? null;
    if (!file) return;

    if (imageUrlRef.current) {
      URL.revokeObjectURL(imageUrlRef.current);
    }

    const nextUrl = URL.createObjectURL(file);
    imageUrlRef.current = nextUrl;
    setProfileImage(nextUrl);
    setProfileImageFile(file);
  };

  const validateProfileFieldsOnInput = ({
    nextProfile = profile,
    nextPhoneCountry = phoneCountry,
    fields,
  }) => {
    const nextErrors = {};

    for (const field of fields) {
      if (field === "firstName") {
        nextErrors.firstName = validateProfileFirstName(
          nextProfile.firstName,
        );
      }

      if (field === "dob") {
        nextErrors.dob = validateProfileDob(nextProfile.dob, {
          allowEmpty: true,
        });
      }

      if (field === "country") {
        nextErrors.country = validateProfileCountry(nextProfile.country, {
          allowEmpty: true,
        });
      }

      if (field === "phone" || field === "country") {
        nextErrors.phone = validateProfilePhoneCountry({
          profile: nextProfile,
          phoneCountry: nextPhoneCountry,
        });
      }
    }

    setProfileErrors((current) => ({ ...current, ...nextErrors }));
  };

  const validateProfile = () => {
    const nextErrors = {};

    const firstNameError = validateProfileFirstName(profile.firstName);
    if (firstNameError) nextErrors.firstName = firstNameError;
    const dobError = validateProfileDob(profile.dob);
    if (dobError) nextErrors.dob = dobError;
    const countryError = validateProfileCountry(profile.country);
    if (countryError) nextErrors.country = countryError;
    const phoneError = validateProfilePhoneCountry({
      profile,
      phoneCountry,
    });
    if (phoneError) nextErrors.phone = phoneError;

    setProfileErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

const handleProfileSubmit = async (event) => {
    event.preventDefault();

    if (!validateProfile()) return;

    const updatedProfile = {
        firstName: profile.firstName.trim(),
        lastName: profile.lastName.trim(),
        dob: profile.dob.trim(),
        country: profile.country.trim(),
    };

    console.log("Updated Profile:11111", updatedProfile);

    const original = {
        firstName: originalProfile.firstName.trim(),
        lastName: originalProfile.lastName.trim(),
        dob: originalProfile.dob.trim(),
        country: originalProfile.country.trim(),
    };

    // Check profile field changes
    const profileChanged =
        updatedProfile.firstName !== original.firstName ||
        updatedProfile.lastName !== original.lastName ||
        updatedProfile.dob !== original.dob ||
        updatedProfile.country !== original.country;

    // Check image change
    const imageChanged = Boolean(profileImageFile);

    // Nothing changed
    if (!profileChanged && !imageChanged) {
        setSnackbar({
            open: true,
            message:
                "No changes detected. Please update at least one field.",
            tone: "error",
        });

        return;
    }

    const formData = new FormData();

    formData.append("firstname", updatedProfile.firstName);
    formData.append("lastname", updatedProfile.lastName);
    formData.append("dob", updatedProfile.dob);
    formData.append("country", updatedProfile.country);

    if (profileImageFile) {
        formData.append(
            "profile_picture",
            profileImageFile
        );
    }

    setIsSavingProfile(true);

    try {
        const response = await apiClient.post(
            `${baseRoute}/update-profile`,
            formData
        );

        const payload = response.data;
        const responseMessage = getResponseMessage(payload);

        if (payload?.success === false) {
            setSnackbar({
                open: true,
                message:
                    responseMessage ||
                    "Could not save profile.",
                tone: "error",
            });

            return;
        }

        const profileData = payload?.result;

        if (profileData) {
            const nextProfile = getProfileFields(
                profileData,
                originalProfile
            );

            setProfile(nextProfile);
            setOriginalProfile(nextProfile);

            emitUserProfileChange(profileData);

            if (profileData.profile_picture) {
                if (imageUrlRef.current) {
                    URL.revokeObjectURL(
                        imageUrlRef.current
                    );

                    imageUrlRef.current = "";
                }

                setProfileImage(
                    resolveBackendMediaUrl(
                        profileData.profile_picture
                    )
                );
            }
        }

        setProfileImageFile(null);

        setSnackbar({
            open: true,
            message:
                responseMessage ||
                "Profile saved successfully.",
            tone: "success",
        });
    } catch (error) {
        const payload = getApiErrorPayload(error);

        setSnackbar({
            open: true,
            message:
                getResponseMessage(payload) ||
                "Could not save profile.",
            tone: "error",
        });
    } finally {
        setIsSavingProfile(false);
    }
};

  const renderProfile = () => (
    <SectionCard>
      <form onSubmit={handleProfileSubmit} className="space-y-5">
        <div className="space-y-1">
          <p className="text-lg font-bold tracking-tight text-theme-text">
            Personal profile
          </p>
        </div>
        <ProfileAvatar
          src={profileImage}
          name={getProfileDisplayName(profile)}
          onPick={pickImage}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="First name"
            value={profile.firstName}
            onChange={(event) => {
              const nextFirstName = sanitizeProfileFirstName(
                event.target.value,
              );
              const nextProfile = {
                ...profile,
                firstName: nextFirstName,
              };

              setProfile((current) => ({
                ...current,
                firstName: nextFirstName,
              }));
              validateProfileFieldsOnInput({
                nextProfile,
                fields: ["firstName"],
              });
            }}
            placeholder="First name"
            error={profileErrors.firstName || ""}
            rounded="rounded-full"
          />

          {/* <Input
            label="Last name"
            value={profile.lastName}
            onChange={(event) =>
              setProfile((current) => ({
                ...current,
                lastName: event.target.value,
              }))
            }
            placeholder="Last name"
            rounded="rounded-full"
          /> */}

          {profile.businessName && (
            <Input
              label="Business name"
              value={profile.businessName}
              placeholder="Business name"
              rounded="rounded-full"
              readOnly
              inputClassName="cursor-not-allowed opacity-70"
            />
          )}

          <Input
            label="Email address"
            value={profile.email}
            placeholder="email@business.com"
            rounded="rounded-full"
            readOnly
            inputClassName="cursor-not-allowed opacity-70"
          />

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-secondary-text">
              Phone number
            </label>
            <PhoneInput
              key={`account-phone-${phoneCountry?.value || "in"}`}
              defaultCountry={phoneCountry?.value || "in"}
              preferredCountries={["in", "us", "gb", "ae", "sg", "au"]}
              value={profile.phone}
              onChange={(nextPhone, meta) => {
                const nextPhoneCountry = {
                  label: meta.country.name,
                  value: meta.country.iso2,
                  dialCode: `+${meta.country.dialCode}`,
                };
                const nextProfile = {
                  ...profile,
                  phone: nextPhone,
                  country: nextPhoneCountry.label,
                };

                setPhoneCountry(nextPhoneCountry);
                setProfile((current) => ({
                  ...current,
                  phone: nextPhone,
                  country: nextPhoneCountry.label,
                }));
                validateProfileFieldsOnInput({
                  nextProfile,
                  nextPhoneCountry,
                  fields: ["phone", "country"],
                });
              }}
              disableDialCodeAndPrefix
              name="phone"
              placeholder="Mobile number"
              inputProps={{
                "aria-label": "Phone number",
                autoComplete: "tel",
                inputMode: "tel",
                readOnly: true,
              }}
              className="signup-phone-input w-full"
              style={{
                "--react-international-phone-height": "44px",
                "--react-international-phone-border-radius": "9999px",
                "--react-international-phone-border-color": "var(--inputborder)",
                "--react-international-phone-background-color": "var(--inputbg)",
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
            {profileErrors.phone ? (
              <span className="text-xs font-medium text-red-400">
                {profileErrors.phone}
              </span>
            ) : (
              <span className="text-xs leading-5 text-secondary-text">
                Phone country must match your selected country.
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <Input
              label="Date of birth"
              type="text"
              value={formatDateForDisplay(profile.dob)}
              placeholder="dd-mm-yyyy"
              inputMode="numeric"
              maxLength={10}
              onChange={(event) => {
                const nextDob = normalizeProfileDateInput(event.target.value);
                const nextProfile = {
                  ...profile,
                  dob: nextDob,
                };

                setProfile((current) => ({
                  ...current,
                  dob: nextDob,
                }));
                validateProfileFieldsOnInput({
                  nextProfile,
                  fields: ["dob"],
                });
              }}
              rightElement={
                <>
                  <button
                    type="button"
                    aria-label="Open date picker"
                    onClick={() => openNativeDatePicker(dobPickerRef.current)}
                    className="flex h-10 w-10 items-center justify-center rounded-full text-secondary-text transition hover:text-primary-text"
                  >
                    <CalendarDays size={17} />
                  </button>
                  <input
                    ref={dobPickerRef}
                    type="date"
                    value={parseProfileDate(profile.dob) ? profile.dob : ""}
                    max={getTodayInputDate()}
                    tabIndex={-1}
                    aria-hidden="true"
                    onChange={(event) => {
                      const nextDob = event.target.value;
                      const nextProfile = { ...profile, dob: nextDob };

                      setProfile((current) => ({
                        ...current,
                        dob: nextDob,
                      }));
                      validateProfileFieldsOnInput({
                        nextProfile,
                        fields: ["dob"],
                      });
                    }}
                    className="pointer-events-none absolute h-px w-px opacity-0"
                  />
                </>
              }
              rightElementClassName="absolute right-1 top-1/2 -translate-y-1/2"
              error={profileErrors.dob || ""}
              rounded="rounded-full"
            />
            {!profileErrors.dob ? (
              <span className="text-xs leading-5 text-secondary-text">
                Must be at least 18 years old.
              </span>
            ) : null}
          </div>
          <Dropdown
            label="Country"
            placeholder="Select country"
            options={COUNTRY_OPTIONS}
            value={getCountryOption(profile.country)}
            onChange={(option) => {
              const nextPhoneCountry = option || DEFAULT_PHONE_COUNTRY;
              const nextCountry = nextPhoneCountry?.label || "";
              const nextProfile = {
                ...profile,
                country: nextCountry,
              };

              setPhoneCountry(nextPhoneCountry);
              setProfile((current) => ({
                ...current,
                country: nextCountry,
              }));
              validateProfileFieldsOnInput({
                nextProfile,
                nextPhoneCountry,
                fields: ["country", "phone"],
              });
            }}
            error={profileErrors.country || ""}
            clearable
          />

        </div>

        <div className="flex justify-end pt-1">
          <Button
            type="submit"
            value={isSavingProfile ? "Saving..." : "Save changes"}
            variant="primary"
            disabled={isSavingProfile}
            className="h-10 border-0 px-5 text-sm font-semibold text-white shadow-none"
          />
        </div>
      </form>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageChange}
      />
    </SectionCard>
  );

  const renderNotifications = () => (
    <SectionCard>
      <div className="space-y-5">
        <div className="space-y-1">
          <p className="text-lg font-bold tracking-tight text-theme-text">
            Notification preferences
          </p>
          <p className="text-sm text-secondary-text">
            Choose how you receive alerts
          </p>
        </div>

        <div>
          {NOTIFICATION_SETTINGS.map((setting) => (
            <NotificationRow
              key={setting.key}
              label={setting.label}
              description={setting.description}
              checked={notificationSettings[setting.key]}
              onChange={(nextValue) =>
                setNotificationSettings((current) => ({
                  ...current,
                  [setting.key]: nextValue,
                }))
              }
            />
          ))}
        </div>

        <div className="rounded-[10px] bg-primary-text/20 px-4 py-4 text-sm text-success">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-primary-text">
              <Check size={13} />
            </span>
            <span className="text-theme-text font-semibold">
              Slack connected.
              <p className="text-xs text-secondary-text font-normal leading-6 sm:text-sm">
                Events are being pushed to #payments-alerts in your workspace.
              </p>
            </span>
          </div>
        </div>
      </div>
    </SectionCard>
  );

  const renderDangerZone = () => (
    <SectionCard>
      <div className="space-y-6">
        <div className="space-y-1">
          <p className="text-lg font-bold tracking-tight text-theme-text">
            Danger zone
          </p>
          <p className="text-md text-secondary-text">
            Irreversible account actions
          </p>
        </div>

        <div className="flex flex-col gap-4 rounded-[15px] border border-input-border bg-secondary-bg p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-md font-semibold text-theme-text">
              Close account
            </p>
            <p className="mt-1 max-w-2xl text-xs leading-6 text-secondary-text">
              Permanently delete your Eco Banx account and all associated data.
            </p>
          </div>

          <Button
            value="Close account"
            onClick={() => setDangerOpen(true)}
            rightIcon={<Trash2 size={15} />}
            style="danger"
            className="border-red-400 bg-red-200 text-red-400 px-4 text-sm font-semibold"
          />
        </div>
      </div>
    </SectionCard>
  );

  const renderPanel = () => {
    if (activeTab === "profile") return renderProfile();
    if (activeTab === "notifications") return renderNotifications();
    return renderDangerZone();
  };

  const confirmDangerAction = () => {
    setDangerOpen(false);
    setSnackbar({
      open: true,
      message: "Account closed successfully.",
      tone: "success",
    });
  };

  return (
    <div className="space-y-6 pb-8">
      <PageTopBanner
        title="Account Settings"
        description="Personal profile and notifications"
      />

      <section className="grid gap-5 md:grid-cols-[minmax(14rem,0.3fr)_1fr] xl:grid-cols-[minmax(17rem,0.25fr)_1fr] md:items-start">
        <aside className="space-y-4 md:sticky md:top-0 md:self-start">
          <section
            role="tablist"
            aria-label="Account settings tabs"
            aria-orientation="vertical"
            className="rounded-[18px] border border-input-border/80 p-3 shadow-[0_18px_42px_rgba(8,19,12,0.08)] sm:p-4"
            style={{ background: "var(--card-bg)" }}
          >
            <div className="space-y-1">
              {TABS.map((tab, index) => {
                const active = tab.key === activeTab;

                return (
                  <TabButton
                    key={tab.key}
                    tab={tab}
                    active={active}
                    onClick={() => {
                      router.push(`${pathname}?tab=${tab.key}`, {
                        scroll: false,
                      });
                      setActiveTab(tab.key);
                    }}
                    onKeyDown={(event) => handleTabKeyDown(event, index)}
                    ref={(node) => {
                      tabsRef.current[index] = node;
                    }}
                  />
                );
              })}
            </div>
          </section>
        </aside>

        <div className="min-w-0">{renderPanel()}</div>
      </section>

      <Modal
        open={dangerOpen}
        onClose={() => setDangerOpen(false)}
        title="Close account"
        description="This action cannot be undone and will remove all account data."
        className="max-w-md"
      >
        <div className="space-y-5">
          <div className="flex items-start gap-3 rounded-[18px] border border-warning/20 bg-warning/10 p-4 text-warning">
            <span className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-warning/15">
              <AlertTriangle size={18} />
            </span>
            <div>
              <p className="text-sm font-semibold text-theme-text">
                Confirm account closure
              </p>
              <p className="mt-1 text-sm leading-6 text-secondary-text">
                Are you sure you want to permanently close this account? This
                will sign you out and remove access.
              </p>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              value="Cancel"
              onClick={() => setDangerOpen(false)}
              className="h-10 border-input-border bg-input-bg px-5 text-sm font-semibold text-theme-text hover:border-primary hover:text-primary"
            />
            <Button
              value="Confirm delete"
              onClick={confirmDangerAction}
              variant="danger"
              className="h-10 border-danger/20 bg-danger/10 px-5 text-sm font-semibold text-danger hover:border-danger hover:text-danger"
            />
          </div>
        </div>
      </Modal>

      <Snackbar
        open={snackbar.open}
        message={snackbar.message}
        tone={snackbar.tone}
        onClose={() => setSnackbar({ open: false, message: "", tone: "success" })}
      />
    </div>
  );
}
