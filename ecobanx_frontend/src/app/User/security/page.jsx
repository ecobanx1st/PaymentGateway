"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { PhoneInput, defaultCountries } from "react-international-phone";
import "react-international-phone/style.css";
import {
  AlertTriangle,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  Camera,
  CheckCircle2,
  ClipboardCheck,
  ExternalLink,
  FileCheck2,
  FileText,
  Home,
  IdCard,
  KeyRound,
  Laptop,
  Monitor,
  Plus,
  Shield,
  Smartphone,
  Trash2,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Table from "@/components/ui/Table";
import Toggle from "@/components/ui/Toggle";
import Modal from "@/components/ui/Modal";
import PageTopBanner from "@/components/ui/PageTopBanner";
import Snackbar from "@/components/ui/Snackbar";
import CopyButton from "@/components/ui/CopyButton";
import PasswordInput from "@/components/ui/passwordinput";
import { Copy } from "lucide-react";
import Skeleton from "@/components/ui/skeleton";
import DocumentViewer from "@/components/ui/DocumentViewer";
import Dropdown from "@/components/ui/dropdown";
import apiClient, {
  consumeKybSecurityMessage,
  getApiErrorPayload,
  getApiErrorStatus,
  getStoredAccessToken,
} from "@/lib/axiosInterceptor";
import { COUNTRY_OPTIONS, INDIA } from "@/lib/country-options";
import { clearAuthTokens, setForceLogoutMessage } from "@/lib/auth";
import { clearStoredUserVerification } from "@/lib/user-verification-storage";
import { resolveBackendMediaUrl } from "@/lib/user-profile";
import { BASIC_EMAIL_PATTERN } from "@/lib/email-validation";
import { getAccountBaseRoute } from "@/utils/accountRoutes";
import {
  readStoredSecurityActiveTab,
  saveStoredSecurityActiveTab,
} from "@/lib/security-tab-storage";

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

const TWO_FACTOR_TOKEN_PATTERN = /^\d{6}$/;
const PASSWORD_CHANGE_LOGOUT_DELAY_MS = 2500;
const PHONE_COUNTRY_OPTIONS = COUNTRY_OPTIONS.map((country) => ({
  ...country,
  label: `${country.dialCode} ${country.label}`,
}));
const DEFAULT_PHONE_COUNTRY =
  PHONE_COUNTRY_OPTIONS.find(
    (country) => country.value === (INDIA?.value || "in"),
  ) ||
  PHONE_COUNTRY_OPTIONS[0] ||
  null;

function getCountryOption(value) {
  const normalized = String(value || "").trim().toLowerCase();
  if (!normalized) return null;

  return (
    COUNTRY_OPTIONS.find(
      (country) =>
        country.value.toLowerCase() === normalized ||
        country.label.toLowerCase() === normalized ||
        country.dialCode === value,
    ) || null
  );
}

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
const SECURITY_TABS = [
  { key: "password", label: "Change password", icon: KeyRound },
  // { key: "api", label: "API security", icon: Shield },
  { key: "twoFactor", label: "2FA", icon: Smartphone },
  { key: "verification", label: "Verification", icon: Building2 },
];

function getPayloadContainers(payload) {
  return [
    payload,
    payload?.result,
    payload?.data,
    payload?.result?.data,
    payload?.data?.result,
    payload?.user,
    payload?.result?.user,
    payload?.data?.user,
  ].filter((item) => item && typeof item === "object");
}

function pickString(containers, keys) {
  for (const container of containers) {
    for (const key of keys) {
      const value = container?.[key];
      if (typeof value === "string" && value.trim()) {
        return value.trim();
      }
    }
  }

  return "";
}

const REJECTION_REASON_KEYS = [
  "rejectionReason",
  "rejection_reason",
  "rejectReason",
  "reject_reason",
  "rejectedReason",
  "rejected_reason",
  "adminRejectionReason",
  "admin_rejection_reason",
  "reviewReason",
  "review_reason",
  "reason",
];

const ADMIN_NOTE_KEYS = [
  "adminNotes",
  "admin_notes",
  "adminNote",
  "admin_note",
  "reviewNotes",
  "review_notes",
  "notes",
  "remarks",
  "comment",
  "comments",
];

const REJECTED_FIELD_KEYS = [
  "rejectedFields",
  "rejected_fields",
  "rejectedDocuments",
  "rejected_documents",
  "failedFields",
  "failed_fields",
];

function getNestedValue(source, path) {
  if (!source || typeof source !== "object") return undefined;
  return path.split(".").reduce((value, key) => value?.[key], source);
}

function getVerificationDetailContainers(record) {
  return [
    record,
    record?.data,
    record?.result,
    record?.verification,
    record?.kyc,
    record?.kyb,
    record?.review,
    record?.reviewDetails,
    record?.admin,
    record?.adminReview,
  ].filter((item) => item && typeof item === "object");
}

function stringifyVerificationDetail(value) {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  if (!value || typeof value !== "object") return "";

  return pickString(
    [value],
    ["message", "reason", "label", "name", "field", "path", "note"],
  );
}

function pickVerificationText(containers, keys) {
  for (const container of containers) {
    for (const key of keys) {
      const value = getNestedValue(container, key);

      if (Array.isArray(value)) {
        const text = value
          .map(stringifyVerificationDetail)
          .filter(Boolean)
          .join(", ");
        if (text) return text;
      }

      const text = stringifyVerificationDetail(value);
      if (text) return text;
    }
  }

  return "";
}

function getRejectedFields(containers) {
  for (const container of containers) {
    for (const key of REJECTED_FIELD_KEYS) {
      const value = getNestedValue(container, key);
      const fields = (Array.isArray(value) ? value : [value])
        .map(stringifyVerificationDetail)
        .filter(Boolean);

      if (fields.length) return Array.from(new Set(fields));
    }
  }

  return [];
}

function getVerificationRejectionDetails(record) {
  const containers = getVerificationDetailContainers(record);

  return {
    reason: pickVerificationText(containers, REJECTION_REASON_KEYS),
    adminNotes: pickVerificationText(containers, ADMIN_NOTE_KEYS),
    rejectedFields: getRejectedFields(containers),
  };
}

function getVerificationRejectionFallback(kind = "kyb") {
  const label = kind === "kyc" ? "KYC" : "KYB";
  return `No ${label} rejection reason was provided by admin. Review the submitted details, update anything that looks incomplete, and resubmit.`;
}

function normalizeQrCodeUrl(value) {
  const qrCodeUrl = typeof value === "string" ? value.trim() : "";

  if (/^(https?:|data:image\/|blob:)/i.test(qrCodeUrl)) {
    return qrCodeUrl;
  }

  if (/^[A-Za-z0-9+/=]+$/.test(qrCodeUrl) && qrCodeUrl.length > 100) {
    return `data:image/png;base64,${qrCodeUrl}`;
  }

  return "";
}

function getGoogleAuthenticatorUrl(otpauthUrl) {
  const value = typeof otpauthUrl === "string" ? otpauthUrl.trim() : "";
  if (!value) return "";

  try {
    const url = new URL(value);
    if (!url.searchParams.get("issuer")) {
      url.searchParams.set("issuer", "Eco Banx");
    }

    return url.toString();
  } catch {
    return value;
  }
}

function getTwoFactorSetup(payload) {
  const containers = getPayloadContainers(payload);
  const secret = pickString(containers, [
    "secret",
    "setupKey",
    "setup_key",
    "manualEntryKey",
    "manual_entry_key",
    "base32",
    "base32Secret",
    "twoFactorSecret",
    "two_factor_secret",
  ]);
  const otpauthUrl = getGoogleAuthenticatorUrl(
    pickString(containers, [
      "otpauthUrl",
      "otpAuthUrl",
      "otpauth_url",
      "otp_auth_url",
      "provisioningUri",
      "provisioning_uri",
    ]),
  );
  const qrCodeUrl = normalizeQrCodeUrl(
    pickString(containers, [
      "qrCode",
      "qr_code",
      "qrCodeUrl",
      "qr_code_url",
      "qrUrl",
      "qr_url",
      "qrcode",
    ]),
  );

  return { secret, otpauthUrl, qrCodeUrl };
}

function normalizeBoolean(value) {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["true", "enabled", "active", "1"].includes(normalized)) return true;
    if (["false", "disabled", "inactive", "0"].includes(normalized))
      return false;
  }

  return null;
}

function getTwoFactorEnabled(payload) {
  const containers = getPayloadContainers(payload);
  const keys = [
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
  ];

  for (const container of containers) {
    for (const key of keys) {
      const value = normalizeBoolean(container?.[key]);
      if (value !== null) return value;
    }
  }

  return null;
}

const VERIFICATION_REQUIREMENTS = {
  kyc: {
    title: "Identity verification",
    shortLabel: "KYC",
    accountLabel: "Individual account",
    subtitle: "Verify the person who owns this account.",
    icon: IdCard,
    requirements: [
      {
        id: "personal",
        icon: UserRound,
        title: "Personal details",
        description: "Legal name, birth date, nationality and contact details.",
        fields: ["Name", "DOB", "Nationality", "Email", "Phone"],
        requiredPaths: [
          "firstName",
          "lastName",
          "dateOfBirth",
          "nationality",
          "countryOfResidence",
          "email",
          "phoneNumber",
        ],
      },
      {
        id: "address",
        icon: Home,
        title: "Residential address",
        description: "Full address used for regional compliance checks.",
        fields: ["Street", "City", "State", "Postal code", "Country"],
        requiredPaths: [
          "address.addressLine1",
          "address.city",
          "address.state",
          "address.postalCode",
          "address.country",
        ],
      },
      {
        id: "identity",
        icon: FileText,
        title: "Government ID",
        description: "Passport, national ID, or driving license details.",
        fields: ["Document type", "Document number", "Front image"],
        requiredPaths: [
          "identity.issueDate",
          "identity.expiryDate",
          "identity.documentType",
          "identity.documentNumber",
          "identity.frontImage",
        ],
      },
      {
        id: "selfie",
        icon: Camera,
        title: "Selfie check",
        description:
          "Selfie image used to match the submitted identity document.",
        fields: ["Selfie image"],
        requiredPaths: ["selfieImage"],
      },
    ],
  },
  kyb: {
    title: "Business verification",
    shortLabel: "KYB",
    accountLabel: "Business account",
    subtitle: "Verify the company, controller and ownership structure.",
    icon: Building2,
    requirements: [
      {
        id: "business",
        icon: BriefcaseBusiness,
        title: "Business profile",
        description: "Legal name, registration, tax and operating details.",
        fields: [
          "Legal name",
          "Registration no.",
          "Company type",
          "Industry",
          "Incorporation date",
        ],
        requiredPaths: [
          "businessName",
          "legalBusinessName",
          "registrationNumber",
          "companyType",
          "industry",
          "incorporationDate",
        ],
      },
      {
        id: "contact",
        icon: Home,
        title: "Business address",
        description: "Registered address, business email, phone and website.",
        fields: ["Address", "City", "State", "Postal code", "Email", "Phone"],
        requiredPaths: [
          "address.addressLine1",
          "address.city",
          "address.state",
          "address.postalCode",
          "address.country",
          "businessEmail",
          "businessPhone",
        ],
      },
      {
        id: "representative",
        icon: UserRound,
        title: "Authorized representative",
        description: "Person opening and controlling the merchant account.",
        fields: ["Name", "Email", "Phone", "Designation"],
        requiredPaths: [
          "representative.firstName",
          "representative.lastName",
          "representative.email",
          "representative.phone",
          "representative.designation",
        ],
      },
      {
        id: "owners",
        icon: UsersRound,
        title: "Beneficial owners",
        description:
          "Owners or controlling parties and their identity details.",
        fields: [
          "Owner name",
          "Date of birth",
          "Nationality",
          "Ownership %",
          "Document type",
          "Document image",
        ],
        requiredPaths: [
          "beneficialOwners.0.fullName",
          "beneficialOwners.0.dateOfBirth",
          "beneficialOwners.0.nationality",
          "beneficialOwners.0.ownershipPercentage",
          "beneficialOwners.0.documentType",
          "beneficialOwners.0.beneficialOwnerDocumentImage",
        ],
      },
      {
        id: "documents",
        icon: FileCheck2,
        title: "Company documents",
        description: "Formation, tax and registered address evidence.",
        fields: ["Incorporation", "Tax proof", "Address proof"],
        requiredPaths: ["documents.incorporationCertificate"],
      },
    ],
  },
};

function getProfileData(payload) {
  return getPayloadContainers(payload).reduce(
    (profile, container) => ({ ...profile, ...container }),
    {},
  );
}

function getVerificationRecord(payload) {
  const containers = getPayloadContainers(payload);

  return (
    containers.find((container) =>
      Boolean(
        container.status ||
        container.firstName ||
        container.legalBusinessName ||
        container.registrationNumber,
      ),
    ) || null
  );
}

function normalizeComparable(value) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function getVerificationKind(profile) {
  const containers = [profile].filter(Boolean);
  const accountType = normalizeComparable(
    pickString(containers, [
      "accountType",
      "account_type",
      "businessType",
      "business_type",
      "userType",
      "merchantType",
    ]),
  );

  if (
    ["business", "company", "merchant", "organization"].includes(accountType)
  ) {
    return "kyb";
  }
  if (["individual", "personal", "person"].includes(accountType)) {
    return "kyc";
  }

  const businessMarker = pickString(containers, [
    "companyName",
    "legalBusinessName",
    "website",
    "websiteLink",
    "companyType",
    "registrationNumber",
    "taxId",
  ]);

  if (businessMarker) return "kyb";

  const fullName = normalizeComparable(
    pickString(containers, ["fullName", "name"]),
  );
  const businessName = normalizeComparable(
    pickString(containers, ["businessName", "company", "merchantName"]),
  );

  if (businessName && (!fullName || businessName !== fullName)) {
    return "kyb";
  }

  return "kyc";
}

function getPathValue(source, path) {
  return path.split(".").reduce((value, key) => value?.[key], source);
}

function hasVerificationValue(value) {
  if (Array.isArray(value)) return value.length > 0;
  if (value instanceof Date) return !Number.isNaN(value.getTime());
  if (typeof value === "string") return value.trim().length > 0;
  if (typeof value === "number") return Number.isFinite(value);
  return Boolean(value);
}

function getRequirementCompletion(requirement, record) {
  if (!record) return false;
  return requirement.requiredPaths.every((path) =>
    hasVerificationValue(getPathValue(record, path)),
  );
}

function normalizeVerificationStatus(status) {
  const value = normalizeComparable(status);
  if (value === "approved") return "Approved";
  if (value === "rejected") return "Rejected";
  if (value === "submitted") return "Submitted";
  if (value === "pending") return "Pending";
  return "";
}

function getVerificationStatus(record) {
  if (!record) return "Not started";

  const status = normalizeVerificationStatus(
    pickString(
      [record],
      ["status", "kycStatus", "kybStatus", "verificationStatus"],
    ),
  );

  return status || "Pending";
}

function getVerificationStatusTone(status) {
  if (status === "Approved") return "success";
  if (status === "Rejected" || status === "Required") return "danger";
  if (status === "Pending" || status === "Submitted") return "warning";
  return "muted";
}

function getRawVerificationStatus(record) {
  return pickString(
    [record],
    ["status", "kycStatus", "kybStatus", "verificationStatus"],
  );
}

function canEditVerificationRecord(record) {
  if (!record) return true;

  const status = normalizeComparable(getRawVerificationStatus(record));
  return status === "rejected" || status === "pending";
}

function getVerificationStatusMessage(record, kind = "kyb") {
  const label = kind === "kyc" ? "KYC" : "KYB";
  const status = getVerificationStatus(record);

  if (status === "Approved") {
    return `Your ${label} is approved. The submitted details are shown below for reference only.`;
  }

  if (status === "Rejected") {
    const { reason } = getVerificationRejectionDetails(record);
    return reason
      ? `Your ${label} was rejected by admin. Reason: ${reason}`
      : `Your ${label} was rejected by admin. You can update the requested details and resubmit.`;
  }

  if (status === "Pending") {
    return `Your ${label} is still in draft mode. You can review and edit the submitted details before submitting.`;
  }

  if (status === "Submitted") {
    return `Your ${label} is under admin review. The submitted details are visible here and remain read-only until an admin rejects them.`;
  }

  return `Start ${label} verification by submitting your details.`;
}

function getVerificationActionLabel(record, kind = "kyb") {
  const label = kind === "kyc" ? "KYC" : "KYB";
  const status = getVerificationStatus(record);

  if (!record) return `Start ${label} verification`;
  if (status === "Rejected") return `Resubmit ${label}`;
  if (status === "Pending") return `Edit ${label} details`;
  if (status === "Approved") return `View approved ${label}`;
  return `View submitted ${label}`;
}

function getKybStatusMessage(record) {
  return getVerificationStatusMessage(record, "kyb");
}

function getKybActionLabel(record) {
  return getVerificationActionLabel(record, "kyb");
}

function toCommaInput(value) {
  if (Array.isArray(value)) return value.filter(Boolean).join(", ");
  return typeof value === "string" ? value : "";
}

function isPreviewableImage(value = "", mimeType = "") {
  if (typeof mimeType === "string" && mimeType.startsWith("image/")) return true;
  return /\.(png|jpe?g)$/i.test(String(value).split("?")[0]);
}

function getDisplayFileName(value) {
  const filePath = typeof value === "string" ? value.trim() : "";
  if (!filePath) return "";

  try {
    const url = /^https?:\/\//i.test(filePath) ? new URL(filePath) : null;
    return decodeURIComponent(
      (url?.pathname || filePath).split("/").filter(Boolean).pop() || filePath,
    );
  } catch {
    return filePath.split("/").filter(Boolean).pop() || filePath;
  }
}

function normalizeWebsiteValue(value) {
  const website = typeof value === "string" ? value.trim() : "";
  if (!website) return "";
  return /^https?:\/\//i.test(website) ? website : `https://${website}`;
}

function splitPhoneValue(phone) {
  if (typeof phone !== "string") {
    return { countryCode: "", localNumber: "" };
  }
  const trimmed = phone.trim();
  const country = PHONE_COUNTRY_OPTIONS.find((c) =>
    trimmed.startsWith(c.dialCode),
  );
  if (country) {
    return {
      countryCode: country.dialCode,
      localNumber: trimmed.slice(country.dialCode.length),
    };
  }
  return { countryCode: "", localNumber: trimmed };
}


function normalizeDateValue(value) {
  if (value === null || value === undefined) return "";

  const stringValue = String(value).trim();
  if (!stringValue) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(stringValue)) return stringValue;

  const compactValue = stringValue.replace(/T.*$/, "");
  const isoMatch = compactValue.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})$/);

  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    return `${year}-${String(Number(month)).padStart(2, "0")}-${String(Number(day)).padStart(2, "0")}`;
  }

  const slashMatch = compactValue.match(
    /^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/,
  );

  if (slashMatch) {
    const [, first, second, third] = slashMatch;
    const year = third.length === 2 ? `20${third}` : third;
    return `${year}-${String(Number(second)).padStart(2, "0")}-${String(Number(first)).padStart(2, "0")}`;
  }

  const date = new Date(compactValue);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
}

function formatDateForDisplay(value) {
  const stringValue = String(value || "").trim();
  const normalizedDate = stringValue.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (!normalizedDate) return stringValue;

  const [, year, month, day] = normalizedDate;
  return `${day}-${month}-${year}`;
}

function normalizeDisplayDateInput(value) {
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

function DatePickerTrigger({ value, label, min, max, onChange }) {
  const pickerRef = useRef(null);
  const pickerValue = parseValidDate(normalizeDateValue(value))
    ? normalizeDateValue(value)
    : "";

  return (
    <>
      <button
        type="button"
        aria-label={`Open ${label} date picker`}
        onClick={() => openNativeDatePicker(pickerRef.current)}
        className="flex h-10 w-10 items-center justify-center rounded-full text-secondary-text transition hover:text-primary-text"
      >
        <CalendarDays size={17} />
      </button>
      <input
        ref={pickerRef}
        type="date"
        value={pickerValue}
        min={min}
        max={max}
        tabIndex={-1}
        aria-hidden="true"
        onChange={(event) => onChange(event.target.value)}
        className="pointer-events-none absolute right-0 top-1/2 h-11 w-80 max-w-[calc(100vw-4rem)] -translate-y-1/2 opacity-0"
      />
    </>
  );
}

function formatVerificationSummaryValue(value) {
  if (value === null || value === undefined) return "Not provided";
  if (typeof value === "string") {
    const normalized = value.trim();
    return normalized || "Not provided";
  }
  if (typeof value === "number") {
    return Number.isFinite(value) ? String(value) : "Not provided";
  }
  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }
  if (Array.isArray(value)) {
    return value.filter(Boolean).join(", ") || "Not provided";
  }
  if (typeof value === "object") {
    return JSON.stringify(value);
  }
  return "Not provided";
}

function VerificationSummaryRow({ label, value }) {
  return (
    <div className="rounded-[12px] border border-input-border/70 bg-primary-bg/60 p-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-secondary-text">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium text-theme-text">
        {formatVerificationSummaryValue(value)}
      </p>
    </div>
  );
}

function VerificationReadOnlySummary({ kind, record }) {
  if (!record) return null;

  const sections = kind === "kyb" ? KYB_FORM_SECTIONS : KYC_FORM_SECTIONS;
  const beneficialOwners = Array.isArray(record?.beneficialOwners)
    ? record.beneficialOwners
    : [];
  const uploadedAt = record?.updatedAt || record?.createdAt || null;
  const ownerFiles = beneficialOwners
    .map((owner, index) =>
      owner?.beneficialOwnerDocumentImage
        ? {
            id: `beneficial-owner-${index}`,
            name: `Beneficial owner ${index + 1} document`,
            label: `Beneficial owner ${index + 1} document`,
            url: resolveBackendMediaUrl(owner.beneficialOwnerDocumentImage),
            status: "Uploaded",
            uploadedAt,
          }
        : null,
    )
    .filter(Boolean);

  return (
    <div className="space-y-4">
      {sections.map((section) => {
        if (section.dynamic) {
          if (!beneficialOwners.length) return null;

          return (
            <section
              key={section.id}
              className="rounded-[14px] border border-input-border/70 bg-input-bg/50 p-4"
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-theme-text">
                  {section.title}
                </p>
                <span className="rounded-full border border-input-border bg-primary-bg/70 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-secondary-text">
                  {beneficialOwners.length} owner
                  {beneficialOwners.length > 1 ? "s" : ""}
                </span>
              </div>
              <div className="space-y-3">
                {beneficialOwners.map((owner, index) => (
                  <div
                    key={`${section.id}-${index}`}
                    className="rounded-[12px] border border-input-border/60 bg-primary-bg/80 p-3"
                  >
                    <p className="text-sm font-semibold text-theme-text">
                      Beneficial owner #{index + 1}
                    </p>
                    <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                      <VerificationSummaryRow
                        label="Full name"
                        value={owner?.fullName}
                      />
                      <VerificationSummaryRow
                        label="Date of birth"
                        value={owner?.dateOfBirth}
                      />
                      <VerificationSummaryRow
                        label="Nationality"
                        value={owner?.nationality}
                      />
                      <VerificationSummaryRow
                        label="Ownership %"
                        value={owner?.ownershipPercentage}
                      />
                      <VerificationSummaryRow
                        label="Document type"
                        value={owner?.documentType}
                      />
                    </div>
                  </div>
                ))}
              </div>
              {ownerFiles.length ? (
                <div className="mt-4">
                  <DocumentViewer
                    files={ownerFiles}
                    allowDownload
                    allowFullscreen
                    readOnly
                    authToken={getStoredAccessToken()}
                    emptyText="No owner documents uploaded"
                  />
                </div>
              ) : null}
            </section>
          );
        }

        const fieldEntries = (section.fields || []).filter((field) =>
          hasVerificationValue(getPathValue(record, field.name)),
        );
        const fileEntries = (section.files || []).filter((field) =>
          hasVerificationValue(getPathValue(record, field.name)),
        );

        if (!fieldEntries.length && !fileEntries.length) return null;

        return (
          <section
            key={section.id}
            className="rounded-[14px] border border-input-border/70 bg-input-bg/50 p-4"
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-theme-text">
                {section.title}
              </p>
              <span className="rounded-full border border-input-border bg-primary-bg/70 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-secondary-text">
                {fieldEntries.length + fileEntries.length} item
                {fieldEntries.length + fileEntries.length > 1 ? "s" : ""}
              </span>
            </div>
            {fieldEntries.length ? (
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {fieldEntries.map((field) => (
                  <VerificationSummaryRow
                    key={field.name}
                    label={field.label}
                    value={getPathValue(record, field.name)}
                  />
                ))}
              </div>
            ) : null}
            {fileEntries.length ? (
              <div className="mt-4">
                <DocumentViewer
                  files={fileEntries.map((field) =>
                    buildDocumentFileEntry(field, record),
                  )}
                  allowDownload
                  allowFullscreen
                  readOnly
                  authToken={getStoredAccessToken()}
                  emptyText="No documents uploaded"
                />
              </div>
            ) : null}
          </section>
        );
      })}
    </div>
  );
}

const KYC_FORM_SECTIONS = [
  {
    id: "personal",
    title: "Personal details",
    fields: [
      {
        name: "firstName",
        label: "First name",
        placeholder: "Example first name",
        required: true,
      },
      {
        name: "middleName",
        label: "Middle name",
        placeholder: "Example middle name",
      },
      {
        name: "lastName",
        label: "Last name",
        placeholder: "Example last name",
        required: true,
      },
      {
        name: "dateOfBirth",
        label: "Date of birth",
        type: "date",
        required: true,
      },
      {
        name: "gender",
        label: "Gender",
        type: "select",
        options: ["Male", "Female", "Other"],
        required: true,
      },
      {
        name: "nationality",
        label: "Nationality",
        type: "country",
        placeholder: "Select nationality",
        required: true,
      },
      {
        name: "countryOfResidence",
        label: "Country of residence",
        type: "country",
        placeholder: "Select country",
        required: true,
      },
      {
        name: "email",
        label: "Email",
        type: "email",
        placeholder: "person@example.com",
        required: true,
      },
      {
        name: "phoneNumber",
        label: "Phone number",
        type: "tel",
        placeholder: "Mobile number",
        required: true,
      },
    ],
  },
  {
    id: "address",
    title: "Residential address",
    fields: [
      {
        name: "address.addressLine1",
        label: "Address line 1",
        placeholder: "123 Example Street",
        required: true,
      },
      {
        name: "address.addressLine2",
        label: "Address line 2",
        placeholder: "Suite 100",
      },
      {
        name: "address.city",
        label: "City",
        placeholder: "Example City",
        required: true,
      },
      {
        name: "address.state",
        label: "State",
        placeholder: "Example State",
        required: true,
      },
      {
        name: "address.postalCode",
        label: "Postal code",
        placeholder: "000000",
        required: true,
        maxLength: 6,
      },
      {
        name: "address.country",
        label: "Country",
        type: "country",
        placeholder: "Select country",
        required: true,
      },
    ],
  },
  {
    id: "identity",
    title: "Identity document",
    fields: [
      {
        name: "identity.documentType",
        label: "Document type",
        type: "select",
        required: true,
        options: ["Passport", "National ID", "Driving License"],
      },
      {
        name: "identity.documentNumber",
        label: "Document number",
        placeholder: "DOC-000000",
        required: true,
      },
      { name: "identity.issueDate", label: "Issue date", type: "date",required: true },
      { name: "identity.expiryDate", label: "Expiry date", type: "date",required: true },
    ],
    files: [
      {
        name: "identity.frontImage",
        label: "Document front",
        required: true,
        uploadName: "frontImage",
      },
      {
        name: "identity.backImage",
        label: "Document back",
        uploadName: "backImage",
      },
      {
        name: "selfieImage",
        label: "Selfie image",
        required: true,
        uploadName: "selfieImage",
      },
    ],
  },
];

const KYB_FORM_SECTIONS = [
  {
    id: "business",
    title: "Business profile",
    fields: [
      {
        name: "businessName",
        label: "Business name",
        placeholder: "Example Business LLC",
        required: true,
      },
      {
        name: "legalBusinessName",
        label: "Legal business name",
        placeholder: "Example Business Legal LLC",
        required: true,
      },
      {
        name: "registrationNumber",
        label: "Registration number",
        placeholder: "REG-000000",
        required: true,
      },
      { name: "taxId", label: "Tax ID", placeholder: "TAX-000000" },
      {
        name: "companyType",
        label: "Company type",
        type: "select",
        required: true,
        options: [
          "Private Limited",
          "Public Limited",
          "LLC",
          "Partnership",
          "Sole Proprietorship",
          "NGO",
          "Government",
          "Other",
        ],
      },
      {
        name: "industry",
        label: "Industry",
        placeholder: "Example industry",
        required: true,
      },
      {
        name: "incorporationDate",
        label: "Incorporation date",
        type: "date",
        required: true,
      },
    ],
  },
  {
    id: "address",
    title: "Business address",
    fields: [
      {
        name: "address.addressLine1",
        label: "Address line 1",
        placeholder: "123 Example Street",
        required: true,
      },
      {
        name: "address.addressLine2",
        label: "Address line 2",
        placeholder: "Suite 100",
      },
      {
        name: "address.city",
        label: "City",
        placeholder: "Example City",
        required: true,
      },
      {
        name: "address.state",
        label: "State",
        placeholder: "Example State",
        required: true,
      },
      {
        name: "address.postalCode",
        label: "Postal code",
        placeholder: "000000",
        required: true,
        maxLength: 6,
      },
      {
        name: "address.country",
        label: "Country",
        type: "country",
        placeholder: "Select country",
        required: true,
      },
    ],
  },
  {
    id: "contact",
    title: "Business contact",
    fields: [
      {
        name: "businessEmail",
        label: "Business email",
        type: "email",
        placeholder: "business@example.com",
        required: true,
      },
      {
        name: "businessPhone",
        label: "Business phone",
        placeholder: "Business phone number",
      },
      { name: "website", label: "Website", placeholder: "https://example.com" },
    ],
  },
  {
    id: "owner",
    title: "Beneficial owners",
    dynamic: "beneficialOwners",
  },
  {
    id: "documents",
    title: "Company documents",
    files: [
      {
        name: "documents.incorporationCertificate",
        label: "Incorporation certificate",
        required: true,
      },
      { name: "documents.taxCertificate", label: "Tax certificate" },
      { name: "documents.addressProof", label: "Address proof" },
    ],
  },
];

const BENEFICIAL_OWNER_DOCUMENT_TYPES = [
  { value: "Passport", label: "Passport" },
  { value: "National ID", label: "National ID" },
  { value: "Driving License", label: "Driving license" },
];

const BENEFICIAL_OWNER_IMAGE_ACCEPT = ".jpg,.jpeg,.png";
const BENEFICIAL_OWNER_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
];
const BENEFICIAL_OWNER_IMAGE_MAX_SIZE = 5 * 1024 * 1024;

const EMPTY_BENEFICIAL_OWNER = {
  fullName: "",
  dateOfBirth: "",
  nationality: "",
  ownershipPercentage: "",
  documentType: "",
};

const EMAIL_PATTERN = BASIC_EMAIL_PATTERN;
const VERIFICATION_FILE_ACCEPT = "image/png,image/jpeg";
const VERIFICATION_FILE_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
];
const VERIFICATION_FILE_MAX_SIZE = 5 * 1024 * 1024;
const BENEFICIAL_OWNER_FORM_FIELDS = [
  { name: "fullName", label: "Full name", required: true },
  { name: "dateOfBirth", label: "Date of birth", type: "date", required: true },
  {
    name: "nationality",
    label: "Nationality",
    type: "country",
    placeholder: "Select nationality",
    required: true,
  },
  {
    name: "ownershipPercentage",
    label: "Ownership %",
    type: "number",
    required: true,
    min: 0,
    max: 100,
  },
  {
    name: "documentType",
    label: "Document type",
    type: "select",
    required: true,
  },
];

const VERIFICATION_IMAGE_FRIENDLY_LABELS = {
  "identity.frontImage": "Front ID image",
  "identity.backImage": "Back ID image",
  selfieImage: "selfie image",
  businessLogo: "business logo",
  logo: "business logo",
  beneficialOwnerImage: "document image",
  beneficialOwnerDocumentImage: "document image",
};

const VERIFICATION_DOCUMENT_FRIENDLY_LABELS = {
  "documents.incorporationCertificate": "incorporation certificate",
  incorporationCertificate: "incorporation certificate",
  registrationCertificate: "registration certificate",
  "documents.taxCertificate": "tax certificate",
  taxCertificate: "tax certificate",
  "documents.addressProof": "address proof document",
  addressProof: "address proof document",
  proofOfIdentity: "identity document",
  identityDocument: "identity document",
  proofOfAddress: "address proof document",
};

function getFriendlyVerificationFileInfo(source = "") {
  const text = String(source);

  for (const key of Object.keys(VERIFICATION_IMAGE_FRIENDLY_LABELS)) {
    if (text.includes(key)) {
      return {
        label: VERIFICATION_IMAGE_FRIENDLY_LABELS[key],
        image: true,
      };
    }
  }

  for (const key of Object.keys(VERIFICATION_DOCUMENT_FRIENDLY_LABELS)) {
    if (text.includes(key)) {
      return {
        label: VERIFICATION_DOCUMENT_FRIENDLY_LABELS[key],
        image: false,
      };
    }
  }

  return null;
}

function getFriendlyVerificationFileLabel(name = "") {
  const info = getFriendlyVerificationFileInfo(name);
  return info ? info.label : "";
}

function getFriendlyVerificationMessage(message) {
  const raw = typeof message === "string" ? message.trim() : "";
  if (!raw) return "";

  return raw;
}

function startOfTodayUtc() {
  const now = new Date();
  return Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
}

function parseValidDate(value) {
  const stringValue = String(value ?? "").trim();
  const match = stringValue.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  if (month < 1 || month > 12 || day < 1 || day > 31) return null;

  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return date;
}

function getCalendarTodayIso() {
  const today = new Date();
  return new Date(
    Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()),
  ).toISOString().slice(0, 10);
}

function addCalendarDays(isoDate, days) {
  const parsed = parseValidDate(isoDate);
  if (!parsed) return "";

  const shifted = new Date(
    Date.UTC(
      parsed.getUTCFullYear(),
      parsed.getUTCMonth(),
      parsed.getUTCDate() + days,
    ),
  );

  return shifted.toISOString().slice(0, 10);
}

function getIdentityDateLiveError(identity) {
  const issue = normalizeDateValue(identity?.issueDate);
  const expiry = normalizeDateValue(identity?.expiryDate);
  const todayIso = getCalendarTodayIso();
  const minExpiryIso = addCalendarDays(todayIso, 1);

  if (issue && issue > todayIso) {
    return "Document issue date cannot be in the future.";
  }

  if (issue && expiry && expiry <= issue) {
    return "Document expiry date must be after the issue date.";
  }
  return "";
}

function validateDateOfBirth(value) {
  const parsed = parseValidDate(normalizeDateValue(value));
  if (!parsed) return "Please select Date of Birth.";
  if (parsed.getTime() > startOfTodayUtc()) {
    return "Date of Birth cannot be in the future.";
  }

  const now = new Date();
  let age = now.getFullYear() - parsed.getUTCFullYear();
  const monthDiff = now.getMonth() - parsed.getUTCMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && now.getDate() < parsed.getUTCDate())
  ) {
    age -= 1;
  }

  return age < 18 ? "You must be at least 18 years old." : null;
}

function isPersonNameField(name = "") {
  return /(^|\.)(firstName|middleName|lastName|fullName|businessName|legalBusinessName|companyName|merchantName|city|state)$/i.test(
    name,
  );
}

function sanitizePersonName(value = "") {
  return String(value).replace(/[^A-Za-z ]/g, "");
}

function isValidPersonName(value = "") {
  return /^[A-Za-z ]+$/.test(String(value).trim());
}

function getRequiredVerificationMessage(field) {
  const verb =
    field.type === "select" ||
    field.type === "country" ||
    field.type === "date"
      ? "select"
      : "enter";

  return `Please ${verb} ${field.label}.`;
}

function getPhoneCountryForField({ field, values, phoneCountries = {}, kind }) {
  const explicitCountry = phoneCountries[field.name];
  if (explicitCountry?.value) return explicitCountry;

  const phoneCountry = getCountryOption(splitPhoneValue(getPathValue(values, field.name)).countryCode);
  if (phoneCountry) return phoneCountry;

  const linkedCountryPath =
    kind === "kyc" && field.name === "phoneNumber"
      ? "countryOfResidence"
      : kind === "kyb" && field.name === "businessPhone"
        ? "address.country"
        : "";

  return getCountryOption(getPathValue(values, linkedCountryPath)) || DEFAULT_PHONE_COUNTRY;
}

function getPhoneCountryMismatchError({ field, values, phoneCountries, kind }) {
  const linkedCountryPath =
    kind === "kyc" && field.name === "phoneNumber"
      ? "countryOfResidence"
      : kind === "kyb" && field.name === "businessPhone"
        ? "address.country"
        : "";

  if (!linkedCountryPath) return "";

  const expectedCountry = getCountryOption(getPathValue(values, linkedCountryPath));
  if (!expectedCountry) return "";

  const phoneCountry = getPhoneCountryForField({
    field,
    values,
    phoneCountries,
    kind,
  });

  if (!phoneCountry?.value || phoneCountry.value === expectedCountry.value) {
    return "";
  }

  return kind === "kyc"
    ? "Phone country must match Country of residence."
    : "Business phone country must match Business address country.";
}

function getVerificationFieldError({ field, values, phoneCountries = {}, kind }) {
  const value = getPathValue(values, field.name);
  const fail = (message) => ({ name: field.name, message });

  if (!hasVerificationValue(value)) {
    return field.required ? fail(getRequiredVerificationMessage(field)) : null;
  }

  if (field.type === "country" && !getCountryOption(value)) {
    return fail(`Select a valid ${field.label}.`);
  }

  if (/dateOfBirth$/i.test(field.name)) {
    const dobError = validateDateOfBirth(value);
    return dobError ? fail(dobError) : null;
  }

  if (isPersonNameField(field.name) && !isValidPersonName(value)) {
    return fail(`${field.label} can contain letters only.`);
  }

  if (field.type === "email" || /(^|\.)email$/i.test(field.name)) {
    if (!EMAIL_PATTERN.test(String(value).trim())) {
      return fail("Enter a valid email address.");
    }
    return null;
  }

  if (/phone/i.test(field.name)) {
    const phoneCountry = getPhoneCountryForField({
      field,
      values,
      phoneCountries,
      kind,
    });
    const localNumber = getNationalPhoneNumber(value, phoneCountry?.dialCode);
    const countryLabel = phoneCountry?.label || "selected country";
    const allowedLengths = getCountryPhoneDigitLengths(phoneCountry);
    const mismatchError = getPhoneCountryMismatchError({
      field,
      values,
      phoneCountries,
      kind,
    });

    if (!/^\d+$/.test(localNumber)) {
      return fail("Enter digits only.");
    }

    if (allowedLengths.length) {
      if (!allowedLengths.includes(localNumber.length)) {
        return fail(
          `Enter a valid mobile number with ${formatPhoneDigitLengths(allowedLengths)} for ${countryLabel}.`,
        );
      }
    } else if (localNumber.length < 7 || localNumber.length > 15) {
      return fail(`Enter a valid mobile number for ${countryLabel}.`);
    }

    if (mismatchError) return fail(mismatchError);

    return null;
  }

  if (/website/i.test(field.name)) {
    const website = normalizeWebsiteValue(value);
    try {
      const parsed = new URL(website);
      if (!/^https?:$/.test(parsed.protocol)) throw new Error("Unsupported");
    } catch {
      return fail("Enter a valid website URL.");
    }
    return null;
  }

  if (field.type === "number") {
    const numeric = Number(String(value).trim());
    if (!Number.isFinite(numeric)) {
      return fail(`Please enter a valid ${field.label}.`);
    }
    if (field.min !== undefined && numeric < field.min) {
      return fail(`${field.label} must be at least ${field.min}.`);
    }
    if (field.max !== undefined && numeric > field.max) {
      return fail(`${field.label} must be at most ${field.max}.`);
    }
    return null;
  }

  if (
    field.type === "date" ||
    /incorporationDate|issueDate|expiryDate$/i.test(field.name)
  ) {
    const parsed = parseValidDate(normalizeDateValue(value));
    if (!parsed) {
      if (/issueDate$/i.test(field.name)) {
        return fail("Please enter a valid document issue date.");
      }
      if (/expiryDate$/i.test(field.name)) {
        return fail("Please enter a valid document expiry date.");
      }
      return fail(`Please enter a valid ${field.label}.`);
    }
    if (
      /incorporationDate$/i.test(field.name) &&
      parsed.getTime() > startOfTodayUtc()
    ) {
      return fail("Incorporation date cannot be in the future.");
    }
    if (/issueDate$/i.test(field.name) && parsed.getTime() > startOfTodayUtc()) {
      return fail("Document issue date cannot be in the future.");
    }
    if (/expiryDate$/i.test(field.name)) {
      const issueParsed = parseValidDate(
        normalizeDateValue(getPathValue(values, "identity.issueDate")),
      );
      if (issueParsed && parsed.getTime() <= issueParsed.getTime()) {
        return fail("Document expiry date must be after the issue date.");
      }
    }
  }

  return null;
}

function findVerificationField(kind, path) {
  const sections = kind === "kyb" ? KYB_FORM_SECTIONS : KYC_FORM_SECTIONS;

  for (const section of sections) {
    const field = section.fields?.find((item) => item.name === path);
    if (field) return field;
  }

  const ownerMatch = path.match(/^beneficialOwners\.(\d+)\.(.+)$/);
  if (ownerMatch) {
    const ownerField = BENEFICIAL_OWNER_FORM_FIELDS.find(
      (field) => field.name === ownerMatch[2],
    );
    if (ownerField) {
      return {
        ...ownerField,
        name: path,
        label: `Beneficial owner #${Number(ownerMatch[1]) + 1} ${ownerField.label}`,
      };
    }
  }

  return null;
}

function validateVerificationForm({ kind, values, selectedFiles, record, phoneCountries = {} }) {
  const sections = kind === "kyb" ? KYB_FORM_SECTIONS : KYC_FORM_SECTIONS;
  const fail = (name, message) => ({ name, message });
  const getValue = (path) => getPathValue(values, path);
  const hasFile = (path) =>
    Boolean(selectedFiles[path]) ||
    hasVerificationValue(getPathValue(record, path));

  const checkField = (field) => {
    const value = getValue(field.name);

    if (!hasVerificationValue(value)) {
      if (!field.required) return null;
      const verb =
        field.type === "select" ||
        field.type === "country" ||
        field.type === "date"
          ? "select"
          : "enter";
      return fail(field.name, `Please ${verb} ${field.label}.`);
    }

    if (/dateOfBirth$/i.test(field.name)) {
      const dobError = validateDateOfBirth(value);
      return dobError ? fail(field.name, dobError) : null;
    }

    if (isPersonNameField(field.name) && !isValidPersonName(value)) {
      return fail(field.name, `${field.label} can contain letters only.`);
    }

    if (field.type === "email" || /(^|\.)email$/i.test(field.name)) {
      if (!EMAIL_PATTERN.test(String(value).trim())) {
        return fail(field.name, "Enter a valid email address.");
      }
      return null;
    }

    if (/phone/i.test(field.name)) {
      const rawPhone = String(value).trim();
      const phone = rawPhone.replace(/[\s()-]/g, "");
      const { localNumber } = splitPhoneValue(phone);

      if (!/^\+\d+$/.test(phone) || !localNumber) {
        return fail(field.name, "Select a country code and enter digits only.");
      }
      if (localNumber.length < 7 || localNumber.length > 15) {
        return fail(field.name, "Enter a valid phone number.");
      }
      return null;
    }

    if (/website/i.test(field.name)) {
      const website = normalizeWebsiteValue(value);
      try {
        const parsed = new URL(website);
        if (!/^https?:$/.test(parsed.protocol)) throw new Error("Unsupported");
      } catch {
        return fail(field.name, "Enter a valid website URL.");
      }
      return null;
    }

    if (field.type === "number") {
      const numeric = Number(String(value).trim());
      if (!Number.isFinite(numeric)) {
        return fail(field.name, `Please enter a valid ${field.label}.`);
      }
      if (field.min !== undefined && numeric < field.min) {
        return fail(
          field.name,
          `${field.label} must be at least ${field.min}.`,
        );
      }
      if (field.max !== undefined && numeric > field.max) {
        return fail(field.name, `${field.label} must be at most ${field.max}.`);
      }
      return null;
    }

    if (
      field.type === "date" ||
      /incorporationDate|issueDate|expiryDate$/i.test(field.name)
    ) {
      const parsed = parseValidDate(normalizeDateValue(value));
      if (!parsed) {
        if (/issueDate$/i.test(field.name)) {
          return fail(field.name, "Please enter a valid document issue date.");
        }
        if (/expiryDate$/i.test(field.name)) {
          return fail(field.name, "Please enter a valid document expiry date.");
        }
        return fail(field.name, `Please enter a valid ${field.label}.`);
      }
      if (
        /incorporationDate$/i.test(field.name) &&
        parsed.getTime() > startOfTodayUtc()
      ) {
        return fail(field.name, "Incorporation date cannot be in the future.");
      }
      if (/issueDate$/i.test(field.name) && parsed.getTime() > startOfTodayUtc()) {
        return fail(field.name, "Document issue date cannot be in the future.");
      }
      if (/expiryDate$/i.test(field.name)) {
        const issueParsed = parseValidDate(
          normalizeDateValue(getValue("identity.issueDate")),
        );
        if (issueParsed && parsed.getTime() <= issueParsed.getTime()) {
          return fail(
            field.name,
            "Document expiry date must be after the issue date.",
          );
        }
        if (parsed.getTime() <= startOfTodayUtc()) {
          return fail(
            field.name,
            "Document expiry date must be a future date.",
          );
        }
      }
      return null;
    }

    return null;
  };

  for (const section of sections) {
    if (section.fields?.length) {
      for (const field of section.fields) {
        const invalid = checkField(field);
        if (invalid) return invalid;
      }
    }

    if (section.dynamic) {
      const owners = Array.isArray(values[section.dynamic])
        ? values[section.dynamic]
        : [];

      for (let index = 0; index < owners.length; index += 1) {
        const prefix = `beneficialOwners.${index}`;
        const owner = owners[index] || {};

        for (const field of BENEFICIAL_OWNER_FORM_FIELDS) {
          const value = owner[field.name];

          if (!hasVerificationValue(value)) {
            if (!field.required) continue;
            const verb =
              field.type === "select" ||
              field.type === "country" ||
              field.type === "date"
                ? "select"
                : "enter";
            return fail(
              `${prefix}.${field.name}`,
              `Please ${verb} Beneficial owner #${index + 1} ${field.label}.`,
            );
          }

          if (field.type === "date") {
            const dobError = validateDateOfBirth(value);
            if (dobError) return fail(`${prefix}.${field.name}`, dobError);
          }

          if (isPersonNameField(field.name) && !isValidPersonName(value)) {
            return fail(
              `${prefix}.${field.name}`,
              `Beneficial owner #${index + 1} ${field.label} can contain letters only.`,
            );
          }

          if (field.type === "number") {
            const numeric = Number(String(value).trim());
            if (!Number.isFinite(numeric) || numeric < 0 || numeric > 100) {
              return fail(
                `${prefix}.${field.name}`,
                `Beneficial owner #${index + 1} ${field.label} must be between 0 and 100.`,
              );
            }
          }
        }

        if (!hasFile(`${prefix}.beneficialOwnerDocumentImage`)) {
          return fail(
            `${prefix}.beneficialOwnerDocumentImage`,
            `Please upload the document image for Beneficial owner #${index + 1}.`,
          );
        }
      }
    }

    if (section.files?.length) {
      for (const field of section.files) {
        if (field.required && !hasFile(field.name)) {
          const friendlyLabel =
            getFriendlyVerificationFileLabel(field.name) || field.label;
          return fail(field.name, `Please upload the ${friendlyLabel}.`);
        }
      }
    }
  }

  if (kind === "kyc") {
    const issueDate = normalizeDateValue(getValue("identity.issueDate"));
    const expiryDate = normalizeDateValue(getValue("identity.expiryDate"));
    if (issueDate && expiryDate && expiryDate <= issueDate) {
      return fail(
        "identity.expiryDate",
        "Document expiry date must be after the issue date.",
      );
    }
  }

  return null;
}

function focusVerificationField(name) {
  const escaped = CSS.escape(name);
  const element = document.querySelector(
    `input:not([type="hidden"])[name="${escaped}"], select[name="${escaped}"], textarea[name="${escaped}"], [data-verification-field="${escaped}"] input:not([type="hidden"]), [data-verification-field="${escaped}"] button`,
  );
  if (!element) return;

  if (element.type === "file") {
    element
      .closest("div")
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
    return;
  }

  element.focus({ preventScroll: true });
  element.scrollIntoView({ behavior: "smooth", block: "center" });
}

function toInputDate(value) {
  return normalizeDateValue(value);
}

function cloneWithPathValue(source, path, value) {
  const next = JSON.parse(JSON.stringify(source || {}));
  const parts = path.split(".");
  let current = next;

  parts.forEach((part, index) => {
    const isLast = index === parts.length - 1;
    const nextPart = parts[index + 1];

    if (isLast) {
      current[part] = value;
      return;
    }

    if (current[part] === undefined || current[part] === null) {
      current[part] = /^\d+$/.test(nextPart) ? [] : {};
    }

    current = current[part];
  });

  return next;
}

function getInitialVerificationForm(
  kind,
  profile,
  record,
  { prefillFromProfile = true } = {},
) {
  const source = record || {};
  const profileContainers = prefillFromProfile ? [profile] : [];

  if (kind === "kyb") {
    return {
      businessName:
        getPathValue(source, "businessName") ||
        pickString(profileContainers, ["businessName", "companyName"]) ||
        "",
      legalBusinessName: getPathValue(source, "legalBusinessName") || "",
      registrationNumber: getPathValue(source, "registrationNumber") || "",
      taxId: getPathValue(source, "taxId") || "",
      companyType: getPathValue(source, "companyType") || "",
      industry: getPathValue(source, "industry") || "",
      incorporationDate: toInputDate(getPathValue(source, "incorporationDate")),
      address: {
        addressLine1: getPathValue(source, "address.addressLine1") || "",
        addressLine2: getPathValue(source, "address.addressLine2") || "",
        city: getPathValue(source, "address.city") || "",
        state: getPathValue(source, "address.state") || "",
        postalCode: getPathValue(source, "address.postalCode") || "",
        country:
          getPathValue(source, "address.country") ||
          pickString(profileContainers, ["country"]) ||
          "",
      },
      businessEmail:
        getPathValue(source, "businessEmail") ||
        pickString(profileContainers, ["email"]) ||
        "",
      businessPhone:
        getPathValue(source, "businessPhone") ||
        pickString(profileContainers,["phone"]) ||
        "",
      website: getPathValue(source, "website") || "",
      beneficialOwners: (() => {
        const owners = Array.isArray(getPathValue(source, "beneficialOwners"))
          ? getPathValue(source, "beneficialOwners")
          : [];

        return owners.length > 0
          ? owners.map((owner) => ({
              fullName: owner.fullName || "",
              dateOfBirth: toInputDate(owner.dateOfBirth),
              nationality: owner.nationality || "",
              ownershipPercentage: owner.ownershipPercentage ?? "",
              documentType: owner.documentType || "",
            }))
          : [{ ...EMPTY_BENEFICIAL_OWNER }];
      })(),
    };
  }

  return {
    firstName: getPathValue(source, "firstName") || "",
    middleName: getPathValue(source, "middleName") || "",
    lastName: getPathValue(source, "lastName") || "",
    dateOfBirth: toInputDate(getPathValue(source, "dateOfBirth")),
    gender: getPathValue(source, "gender") || "",
    nationality:
      getPathValue(source, "nationality") ||
      pickString(profileContainers, ["country"]) ||
      "",
    countryOfResidence:
      getPathValue(source, "countryOfResidence") ||
      pickString(profileContainers, ["country"]) ||
      "",
    email:
      getPathValue(source, "email") ||
      pickString(profileContainers, ["email"]) ||
      "",
    phoneNumber:
      getPathValue(source, "phoneNumber") ||
      pickString(profileContainers, ["phone"]) ||
      "",
    address: {
      addressLine1: getPathValue(source, "address.addressLine1") || "",
      addressLine2: getPathValue(source, "address.addressLine2") || "",
      city: getPathValue(source, "address.city") || "",
      state: getPathValue(source, "address.state") || "",
      postalCode: getPathValue(source, "address.postalCode") || "",
      country:
        getPathValue(source, "address.country") ||
        pickString(profileContainers, ["country"]) ||
        "",
    },
    identity: {
      documentType: getPathValue(source, "identity.documentType") || "",
      documentNumber: getPathValue(source, "identity.documentNumber") || "",
      issueDate: toInputDate(getPathValue(source, "identity.issueDate")),
      expiryDate: toInputDate(getPathValue(source, "identity.expiryDate")),
    },
  };
}

const BACKUP_CODES = [
  "GF2K-91QX-44PZ",
  "B8N3-2LVC-7MJP",
  "Q7X4-8KDN-1HLC",
  "T6MR-0ZPA-55WF",
  "J2LK-91VC-6XQH",
  "X9PF-2WZM-4NTR",
];

const initialTrustedDevices = [
  {
    id: "macbook",
    icon: Laptop,
    label: "MacBook Pro - Chrome - San Francisco",
    status: "This device",
  },
  {
    id: "iphone",
    icon: Smartphone,
    label: "iPhone 15 - Safari - San Francisco",
    status: "Trusted",
  },
  {
    id: "windows",
    icon: Monitor,
    label: "Windows PC - Edge - New York",
    status: "Trusted",
  },
];

const initialSessions = [
  {
    id: "macbook",
    device: "MacBook Pro - Chrome",
    location: "San Francisco, US",
    ip: "203.0.113.42",
    lastActive: "Active now",
    actionLabel: "â€”",
    actionTone: "default",
    deviceTag: "This device",
    isCurrent: true,
    icon: Laptop,
  },
  {
    id: "iphone",
    device: "iPhone 15 - Safari",
    location: "San Francisco, US",
    ip: "203.0.113.19",
    lastActive: "2 hours ago",
    actionLabel: "Revoke",
    actionTone: "success",
    deviceTag: null,
    isCurrent: false,
    icon: Smartphone,
  },
  {
    id: "windows",
    device: "Windows PC - Edge",
    location: "New York, US",
    ip: "198.51.100.7",
    lastActive: "Yesterday, 4:12 PM",
    actionLabel: "Block",
    actionTone: "danger",
    deviceTag: null,
    isCurrent: false,
    icon: Monitor,
  },
  {
    id: "firefox",
    device: "Unknown device - Firefox",
    location: "Lagos, Nigeria",
    ip: "41.203.88.12",
    lastActive: "Jun 30, 2026",
    actionLabel: "Block",
    actionTone: "danger",
    deviceTag: null,
    isCurrent: false,
    icon: Monitor,
  },
];

const initialAllowlist = ["203.0.113.42", "198.51.100.7"];

const TRUSTED_TONES = {
  "This device": "bg-primary-text/10 text-primary-text border-primary-text/15",
  Trusted: "bg-success/10 text-success border-success/15",
};

function SectionCard({
  title,
  subtitle,
  headerAction,
  icon: Icon,
  children,
  className = "",
}) {
  return (
    <section
      className={`rounded-[18px] border border-input-border bg-primary-bg p-4 shadow-[0_18px_42px_rgba(8,19,12,0.08)] sm:p-5 ${className}`}
    >
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          {Icon ? (
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-primary/10 text-primary-text">
              <Icon size={19} strokeWidth={2.1} />
            </span>
          ) : null}
          <div className="min-w-0">
            <p className="text-xl font-semibold text-theme-text sm:text-[1.35rem]">
              {title}
            </p>
            {subtitle ? (
              <p className="mt-1 text-sm text-secondary-text">{subtitle}</p>
            ) : null}
          </div>
        </div>
        {headerAction ? <div className="shrink-0">{headerAction}</div> : null}
      </div>
      {children}
    </section>
  );
}

function SecurityTabButton({ tab, active, onClick }) {
  const Icon = tab.icon;

  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      tabIndex={active ? 0 : -1}
      onClick={onClick}
      className={`relative z-10 flex w-full items-center gap-3 rounded-[10px] px-3 py-2.5 text-left text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/25 ${
        active
          ? "text-primary-text"
          : "text-secondary-text hover:bg-secondary-bg hover:text-theme-text"
      }`}
    >
      {active ? (
        <>
          <motion.div
            layoutId="securityTabBg"
            className="absolute inset-0 -z-10 rounded-[10px] bg-primary/10"
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
          />
          <motion.span
            layoutId="securityTabIndicator"
            className="absolute bottom-2 left-0 top-2 w-0.5 rounded-r-full bg-primary-text -z-10"
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
          />
        </>
      ) : null}
      <Icon size={17} strokeWidth={2.1} />
      <span>{tab.label}</span>
    </button>
  );
}

function StatusPill({ value, tone = "success" }) {
  const toneClasses =
    TRUSTED_TONES[value] ??
    (tone === "danger" || tone === "Required"
      ? "bg-red-500/10 text-red-500 border-red-500/15"
      : tone === "warning"
        ? "bg-amber-400/10 text-amber-400 border-amber-400/15"
        : tone === "success" || tone === "complete"
          ? "bg-green-400/10 text-green-400 border-green-400/15"
          : tone === "muted"
            ? "bg-secondary-bg text-secondary-text border-border"
            : "bg-primary-text/10 text-primary-text border-primary-text/15");

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold leading-none ${toneClasses}`}
    >
      <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current" />
      {value}
    </span>
  );
}

function ToggleRow({ title, description, checked, onChange }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0 pr-4">
        <p className="text-sm font-semibold text-text">{title}</p>
        <p className="mt-1 text-xs leading-5 text-secondary-text">
          {description}
        </p>
      </div>
      <Toggle checked={checked} onChange={onChange} ariaLabel={title} />
    </div>
  );
}

function VerificationRejectionNotice({ record, kind = "kyb", className = "" }) {
  const label = kind === "kyc" ? "KYC" : "KYB";
  const { reason, adminNotes, rejectedFields } =
    getVerificationRejectionDetails(record);
  const reasonText = reason || getVerificationRejectionFallback(kind);

  return (
    <div
      className={`rounded-[16px] h-fit border border-red-500/25 bg-red-500/10 p-4 text-sm text-red-100 ${className}`}
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-500/15 text-red-300">
          <AlertTriangle size={17} />
        </span>
        <div className="min-w-0">
          <p className="font-semibold text-red-400">{label} rejected</p>
          <p className="mt-1 leading-6 text-red-400/85">
            <span className="font-semibold text-red-400">Reason:</span>{" "}
            {reasonText}
          </p>
          {adminNotes ? (
            <p className="mt-2 leading-6 text-red-400/85">
              <span className="font-semibold text-red-400">Admin notes:</span>{" "}
              {adminNotes}
            </p>
          ) : null}
          {rejectedFields.length ? (
            <p className="mt-2 leading-6 text-red-400/85">
              <span className="font-semibold text-red-400">Needs update:</span>{" "}
              {rejectedFields.join(", ")}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function VerificationRequirementCard({ requirement, complete }) {
  const Icon = requirement.icon || FileCheck2;

  return (
    <div
      className={`rounded-[16px] border p-4 ${
        complete
          ? "border-primary-text/20 bg-primary-text/10"
          : "border-input-border bg-input-bg/55"
      }`}
    >
      <div className="flex items-start gap-3">
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] ${
            complete
              ? "bg-primary-text/10 text-primary-text"
              : "bg-secondary-bg text-secondary-text"
          }`}
        >
          <Icon size={18} strokeWidth={2.1} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-theme-text">
                {requirement.title}
              </p>
              <p className="mt-1 text-xs leading-5 text-secondary-text">
                {requirement.description}
              </p>
            </div>
            <StatusPill
              value={complete ? "Complete" : "Required"}
              tone={complete ? "success" : "Required"}
            />
          </div>
          {requirement.fields?.length ? (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {requirement.fields.map((field) => (
                <span
                  key={field}
                  className="rounded-full border border-input-border bg-primary-bg/60 px-2.5 py-1 text-[11px] font-medium text-secondary-text"
                >
                  {field}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function getStrength(password) {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  return Math.min(score, 3);
}

function StrengthBar({ score }) {
  return (
    <div>
      <div className="flex items-center gap-1">
        {[0, 1, 2].map((index) => (
          <span
            key={index}
            className={`h-1.5 flex-1 rounded-full ${index < score ? "bg-primary-text" : "bg-secondary-bg"}`}
          />
        ))}
      </div>
      <p className="mt-2 text-[11px] text-secondary-text">
        Strong - includes uppercase, number and symbol
      </p>
    </div>
  );
}

function BackupCodesModal({ open, onClose, onCopyAll }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Backup codes"
      description="Store these codes somewhere safe. Each code can only be used once."
      className="max-w-2xl"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        {BACKUP_CODES.map((code) => (
          <div
            key={code}
            className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-secondary-bg/45 px-4 py-3"
          >
            <span className="font-mono text-sm font-semibold tracking-wide text-text">
              {code}
            </span>
            <CopyButton value={code} />
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCopyAll}
          className="inline-flex h-11 items-center justify-center rounded-full border border-input-border bg-input-bg px-5 text-sm font-semibold text-text transition hover:border-primary hover:text-primary"
        >
          Copy all codes
        </button>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-5 text-sm font-semibold text-white transition hover:bg-primary-hover"
        >
          Done
        </button>
      </div>
    </Modal>
  );
}

function Setup2FAModal({
  open,
  onClose,
  onEnable,
  onCopy,
  setupKey = "",
  otpAuthUrl = "",
  qrCodeUrl = "",
  isGenerating = false,
  isEnabling = false,
  errorMessage = "",
  onRetry,
}) {
  const [code, setCode] = useState("");
  const generatedQrCodeUrl = otpAuthUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(otpAuthUrl)}`
    : "";
  const visibleQrCodeUrl = qrCodeUrl || generatedQrCodeUrl;
  const hasSetupDetails = Boolean(setupKey || otpAuthUrl || visibleQrCodeUrl);
  const copyValue = (value, label) => {
    if (value) onCopy?.(value, label);
  };

  const handleClose = () => {
    setCode("");
    onClose();
  };

  const handleVerify = async () => {
    if (code.length >= 6) {
      const enabled = await onEnable(code);
      if (enabled) setCode("");
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Connect Google Authenticator"
      description="Scan the QR code or copy the secret key into Google Authenticator."
      className="max-w-xl"
    >
      <div className="grid gap-5 lg:grid-cols-[224px_minmax(0,1fr)] lg:items-start">
        <div className="mx-auto flex h-56  w-56 items-center justify-center rounded-[18px] shadow-inner">
          {isGenerating ? (
            <div className="flex h-full w-full flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-input-border text-center text-xs font-semibold text-secondary-text">
              <span className="h-8 w-8 animate-spin rounded-full border-2 border-primary/25 border-t-primary" />
              <span>Generating QR code</span>
            </div>
          ) : visibleQrCodeUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={visibleQrCodeUrl}
              alt="Google Authenticator QR code"
              className="h-full w-full object-cover  rounded-[18px]"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-input-border text-center text-xs font-semibold text-secondary-text">
              <Shield size={20} />
              <span>
                {errorMessage ? "QR not available" : "Use the setup key"}
              </span>
            </div>
          )}
        </div>

        <div className="min-w-0 space-y-4">
          {errorMessage ? (
            <div className="rounded-[14px] border border-red-400/30 bg-red-400/10 p-3 text-sm text-red-300">
              <div className="flex items-start gap-2">
                <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="font-semibold text-red-200">
                    Could not generate 2FA setup
                  </p>
                  <p className="mt-1 text-xs leading-5 text-red-200/80">
                    {errorMessage}
                  </p>
                  {onRetry ? (
                    <button
                      type="button"
                      onClick={onRetry}
                      disabled={isGenerating}
                      className="mt-3 inline-flex h-8 items-center justify-center rounded-full border border-red-300/40 px-3 text-xs font-semibold text-red-100 transition hover:border-red-200 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isGenerating ? "Retrying..." : "Try again"}
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          ) : null}

          <div className="rounded-[14px] border border-input-border bg-input-bg p-3">
            <div className="mb-2 flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase text-secondary-text">
                Secret key
              </p>
              <button
                type="button"
                onClick={() => copyValue(setupKey, "Secret key")}
                disabled={!setupKey}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-input-border text-secondary-text transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Copy secret key"
                title="Copy secret key"
              >
                <Copy size={14} />
              </button>
            </div>
            <input
              type="text"
              readOnly
              value={
                setupKey || (isGenerating ? "Generating secret key..." : "")
              }
              placeholder="Secret key will appear here"
              className="w-full bg-transparent font-mono text-sm font-semibold text-text outline-none"
            />
          </div>

          {/* {otpAuthUrl ? (
            <div className="rounded-[14px] border border-input-border bg-input-bg p-3">
              <div className="mb-2 flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase text-secondary-text">
                  Authenticator URL
                </p>
                <div className="flex items-center gap-2">
                  <a
                    href={otpAuthUrl}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-input-border text-secondary-text transition hover:border-primary hover:text-primary"
                    aria-label="Open authenticator URL"
                    title="Open authenticator URL"
                  >
                    <ExternalLink size={14} />
                  </a>
                  <button
                    type="button"
                    onClick={() => copyValue(otpAuthUrl, "Authenticator URL")}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-input-border text-secondary-text transition hover:border-primary hover:text-primary"
                    aria-label="Copy authenticator URL"
                    title="Copy authenticator URL"
                  >
                    <Copy size={14} />
                  </button>
                </div>
              </div>
              <textarea
                readOnly
                value={otpAuthUrl}
                rows={3}
                className="w-full resize-none bg-transparent font-mono text-xs leading-5 text-text outline-none"
              />
            </div>
          ) : null} */}

          <Input
            label="Verification Code"
            placeholder="Enter 6-digit code"
            value={code}
            rounded="rounded-full"
            inputMode="numeric"
            maxLength={6}
            disabled={!hasSetupDetails || isGenerating}
            onChange={(e) =>
              setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
            }
            inputClassName="text-center text-lg tracking-widest"
          />
        </div>
      </div>

      <div className="mt-2 flex items-center justify-end gap-3">
        <Button
          type="button"
          onClick={handleClose}
          className="inline-flex h-11 items-center justify-center rounded-full border border-input-border bg-input-bg px-5 text-sm font-semibold text-text transition hover:border-theme-text hover:bg-secondary-bg"
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={handleVerify}
          disabled={
            !hasSetupDetails || code.length < 6 || isGenerating || isEnabling
          }
          variant="primary"
          className="text-white"
        >
          {isEnabling ? "Enabling..." : "Verify & Enable"}
        </Button>
      </div>
    </Modal>
  );
}

function Disable2FAModal({ open, onClose, onConfirm, isSubmitting = false }) {
  const [code, setCode] = useState("");

  const handleDisable = async () => {
    if (code.length === 6) {
      const isDisabled = await onConfirm(code);
      if (isDisabled !== false) {
        setCode("");
      }
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Disable Two-Factor Authentication"
      description="Enter the 6-digit code from your authenticator app to disable 2FA."
      className="max-w-md"
    >
      <Input
        label="Verification Code"
        placeholder="Enter 6-digit code"
        value={code}
        rounded="rounded-full"
        disabled={isSubmitting}
        onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
        inputClassName="text-center text-lg tracking-widest"
      />

      <div className="mt-6 flex justify-end gap-3">
        <Button onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>

        <Button
          variant="primary"
          className="text-white"
          disabled={code.length < 6 || isSubmitting}
          onClick={handleDisable}
        >
          {isSubmitting ? "Disabling..." : "Confirm Disable"}
        </Button>
      </div>
    </Modal>
  );
}

function normalizeDropdownOptions(options = []) {
  return options.map((option) =>
    typeof option === "string" ? { label: option, value: option } : option,
  );
}

function findDropdownValue(options, value) {
  if (!value) return null;
  const normalizedValue = String(value).trim().toLowerCase();

  return (
    options.find(
      (option) =>
        String(option.value).trim().toLowerCase() === normalizedValue ||
        String(option.label).trim().toLowerCase() === normalizedValue,
    ) || null
  );
}

function PhoneVerificationField({
  field,
  value,
  onChange,
  onCountryChange,
  country,
  error = "",
}) {
  const initialCountry =
    country ||
    (typeof value === "string" && value.trim().startsWith("+")
      ? PHONE_COUNTRY_OPTIONS.find((option) =>
          value.startsWith(option.dialCode),
        ) || DEFAULT_PHONE_COUNTRY
      : DEFAULT_PHONE_COUNTRY);

  return (
    <div data-verification-field={field.name} className="flex flex-col gap-2">
      <span className="text-sm font-medium text-secondary-text">
        {field.label}
        {field.required ? <span className="ml-1 text-red-400">*</span> : null}
      </span>

      <PhoneInput
        key={`${field.name}-${initialCountry?.value || "in"}`}
        defaultCountry={initialCountry?.value || "in"}
        preferredCountries={["in", "us", "gb", "ae", "sg", "au"]}
        value={String(value || "")}
        onChange={(nextPhone, meta) => {
          const nextCountry = {
            label: meta.country.name,
            value: meta.country.iso2,
            dialCode: `+${meta.country.dialCode}`,
          };

          onCountryChange?.(field.name, nextCountry);
          onChange(field.name, nextPhone, nextCountry);
        }}
        disableDialCodeAndPrefix
        name={field.name}
        required={field.required}
        placeholder={field.placeholder || "Mobile number"}
        inputProps={{
          "aria-label": field.label || "Mobile number",
          autoComplete: "tel",
          inputMode: "tel",
        }}
        className="signup-phone-input w-full rounded-full"
        style={{
          "--react-international-phone-height": "43px",
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
      {error ? <span className="text-xs font-medium text-red-400">{error}</span> : null}
    </div>
  );
}

function VerificationField({
  field,
  value,
  onChange,
  onCountryChange,
  phoneCountry,
  error = "",
}) {
  if (field.type === "textarea") {
    return (
      <label className="flex flex-col gap-2 md:col-span-2 xl:col-span-3">
        <span className="text-sm font-medium text-secondary-text">
          {field.label}
          {field.required ? <span className="ml-1 text-red-400">*</span> : null}
        </span>
        <textarea
          name={field.name}
          value={value || ""}
          placeholder={field.placeholder || ""}
          onChange={(event) => onChange(field.name, event.target.value)}
          rows={4}
          className="w-full resize-none rounded-[20px] border border-input-border bg-input-bg px-4 py-3 text-sm leading-6 text-theme-text outline-none transition placeholder:text-secondary-text focus:border-theme-text disabled:cursor-not-allowed disabled:opacity-50"
        />
        {error ? <span className="text-xs font-medium text-red-400">{error}</span> : null}
      </label>
    );
  }

  if (/phone/i.test(field.name)) {
    return (
      <PhoneVerificationField
        field={field}
        value={value}
        onChange={onChange}
        onCountryChange={onCountryChange}
        country={phoneCountry}
        error={error}
      />
    );
  }

  if (field.type === "select" || field.type === "country") {
    const isCountryField = field.type === "country";
    const options = isCountryField
      ? COUNTRY_OPTIONS
      : normalizeDropdownOptions(field.options || []);
    const selectedValue = findDropdownValue(options, value);

    return (
      <div data-verification-field={field.name}>
        <Dropdown
          label={field.label}
          required={field.required}
          placeholder={field.placeholder || "Select"}
          options={options}
          value={selectedValue}
          onChange={(option) =>
            onChange(
              field.name,
              option ? (isCountryField ? option.label : option.value) : "",
            )
          }
          searchable={isCountryField}
          clearable={!field.required}
          className="w-full"
          triggerClassName="rounded-full text-sm"
          error={error}
        />
        <input type="hidden" name={field.name} value={value || ""} />
      </div>
    );
  }

  const isPostalCode = /postalCode$/i.test(field.name);
  const isName = isPersonNameField(field.name);
  const isDateField = field.type === "date";

  const isIdentityIssueDate = /issueDate$/i.test(field.name);
  const isIdentityExpiryDate = /expiryDate$/i.test(field.name);
  const identityDateBounds =
    isIdentityIssueDate || isIdentityExpiryDate
      ? isIdentityIssueDate
        ? { max: getCalendarTodayIso() }
        : { min: addCalendarDays(getCalendarTodayIso(), 1) }
      : {};

  const input = (
    <Input
      label={field.label}
      name={field.name}
      type={isDateField ? "text" : field.type || "text"}
      value={isDateField ? formatDateForDisplay(value) : value || ""}
      placeholder={isDateField ? "dd-mm-yyyy" : field.placeholder || ""}
      maxLength={isDateField ? 10 : field.maxLength}
      inputMode={isDateField || isPostalCode ? "numeric" : undefined}
      showRequired={field.required}
      min={isDateField ? undefined : identityDateBounds.min}
      max={isDateField ? undefined : identityDateBounds.max}
      error={error}
      rightElement={
        isDateField ? (
          <DatePickerTrigger
            value={value}
            label={field.label}
            min={identityDateBounds.min}
            max={identityDateBounds.max}
            onChange={(nextValue) => onChange(field.name, nextValue)}
          />
        ) : null
      }
      rightElementClassName={
        isDateField ? "absolute right-1 top-1/2 -translate-y-1/2" : ""
      }
      onChange={(event) => {
        let nextValue = event.target.value;
        if (isDateField) nextValue = normalizeDisplayDateInput(nextValue);
        if (isPostalCode) nextValue = nextValue.replace(/\D/g, "");
        if (isName) nextValue = sanitizePersonName(nextValue);
        if (
          field.type === "number" &&
          field.max !== undefined &&
          nextValue !== ""
        ) {
          const num = Number(nextValue);
          if (!Number.isNaN(num) && num > field.max) {
            nextValue = String(field.max);
          }
        }
        if (
          field.type === "number" &&
          field.min !== undefined &&
          nextValue !== ""
        ) {
          const num = Number(nextValue);
          if (!Number.isNaN(num) && num < field.min) {
            nextValue = String(field.min);
          }
        }
        onChange(field.name, nextValue);
      }}
      rounded="rounded-full"
      inputClassName="h-11 text-sm"
    />
  );

  if (/dateOfBirth$/i.test(field.name)) {
    return (
      <div className="flex flex-col gap-1">
        {input}
        {/* <span className={`text-xs leading-5 ${error ? "text-red-400" : "text-secondary-text"}`}>
          Must be at least 18 years old.
        </span> */}
      </div>
    );
  }

  return input;
}

function VerificationFileField({
  field,
  currentValue,
  selectedFile,
  onChange,
}) {
  const inputId = `verification-file-${field.name.replace(/[^a-z0-9_-]/gi, "-")}`;
  const [fileError, setFileError] = useState("");
  const selectedName = selectedFile?.name || "";
  const currentName = getDisplayFileName(currentValue);
  const label = selectedName || currentName || "Choose file";
  const previewUrl =
    selectedFile?.previewUrl ||
    (isPreviewableImage(currentValue)
      ? resolveBackendMediaUrl(currentValue)
      : "");
  const hasDocument = Boolean(selectedFile || currentValue);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] || null;

    if (!file) {
      setFileError("");
      onChange(field.name, null);
      return;
    }

    if (!VERIFICATION_FILE_MIME_TYPES.includes(file.type)) {
      setFileError("Only PNG and JPG images are allowed.");
      event.target.value = "";
      return;
    }

    if (file.size > VERIFICATION_FILE_MAX_SIZE) {
      setFileError("Document size must be less than 5 MB.");
      event.target.value = "";
      return;
    }

    setFileError("");
    onChange(field.name, file);
  };

  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={inputId}
        className="text-sm font-medium text-secondary-text"
      >
        {field.label}
        {field.required ? <span className="ml-1 text-red-400">*</span> : null}
      </label>
      <label
        htmlFor={inputId}
        className="flex min-h-11 cursor-pointer items-center justify-between gap-3 rounded-full border border-input-border bg-input-bg px-4 text-sm text-theme-text transition hover:bg-secondary-bg"
      >
        <span className="truncate">{label}</span>
        <span className="shrink-0 text-xs font-semibold text-primary-text">
          Browse
        </span>
      </label>
      <input
        id={inputId}
        type="file"
        name={field.uploadName || field.name}
        onChange={handleFileChange}
        className="hidden"
        accept={VERIFICATION_FILE_ACCEPT}
      />
      <span className="text-[11px] ml-2 text-secondary-text">
        PNG or JPG
      </span>

      {fileError ? (
        <p className="text-xs font-medium text-red-400">{fileError}</p>
      ) : null}

      {hasDocument ? (
        <div className="mt-2 flex items-start gap-3">
          <div className="flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden rounded-[14px] border border-input-border bg-secondary-bg">
            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- Local file previews use blob URLs.
              <img
                src={previewUrl}
                alt={label}
                className="h-full w-full object-contain p-1"
              />
            ) : (
              <FileText size={30} className="text-secondary-text" />
            )}
          </div>
          <div className="min-w-0 pt-1">
            <p className="truncate text-sm font-semibold text-theme-text">
              {label}
            </p>
            <p className="mt-1 text-xs text-secondary-text">
              {selectedFile ? "Ready to upload" : "Uploaded document"}
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function BeneficialOwnerImageField({
  index,
  currentValue,
  selectedFile,
  onFileChange,
  onRemove,
}) {
  const fieldPath = `beneficialOwners.${index}.beneficialOwnerDocumentImage`;
  const inputId = `beneficial-owner-image-${index}`;
  const inputRef = useRef(null);
  const [error, setError] = useState("");
  const selectedName = selectedFile?.name || "";
  const currentName = getDisplayFileName(currentValue);
  const label = selectedName || currentName || "Choose file";
  const previewUrl =
    selectedFile?.previewUrl ||
    (isPreviewableImage(currentValue)
      ? resolveBackendMediaUrl(currentValue)
      : "");
  const hasDocument = Boolean(selectedFile || currentValue);
  const required = !currentValue && !selectedFile;

  const handleChange = (event) => {
    const file = event.target.files?.[0] || null;
    if (!file) return;

    if (!BENEFICIAL_OWNER_IMAGE_MIME_TYPES.includes(file.type)) {
      setError("Please upload a valid image (JPG, JPEG, or PNG).");
      event.target.value = "";
      return;
    }

    if (file.size > BENEFICIAL_OWNER_IMAGE_MAX_SIZE) {
      setError("Image size must be less than 5 MB.");
      event.target.value = "";
      return;
    }

    setError("");
    onFileChange?.(fieldPath, file);
  };

  const handleRemove = () => {
    setError("");
    if (inputRef.current) inputRef.current.value = "";
    onRemove?.(fieldPath);
  };

  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={inputId}
        className="text-sm font-medium text-secondary-text"
      >
        Beneficial owner document image
        {required ? <span className="ml-1 text-red-400">*</span> : null}
      </label>

      <input
        ref={inputRef}
        id={inputId}
        type="file"
        name={fieldPath}
        accept={BENEFICIAL_OWNER_IMAGE_ACCEPT}
        onChange={handleChange}
        className="hidden"
      />

      {hasDocument ? (
        <div className="flex flex-col gap-3 rounded-2xl border border-input-border bg-secondary-bg/40 p-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-input-border bg-primary-bg">
              {previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- Local file previews use blob URLs.
                <img
                  src={previewUrl}
                  alt={label}
                  className="h-full w-full object-contain p-0.5"
                />
              ) : (
                <FileText size={22} className="text-secondary-text" />
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-theme-text">
                {label}
              </p>
              <p className="mt-0.5 text-xs text-secondary-text">
                {selectedFile ? "Ready to upload" : "Uploaded document"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="inline-flex h-9 items-center gap-1.5 rounded-full border border-input-border bg-input-bg px-3 text-xs font-semibold text-theme-text transition hover:border-primary hover:text-primary"
            >
              <Camera size={14} />
              {selectedFile ? "Replace" : "Upload"}
            </button>
            {/* <button
              type="button"
              onClick={handleRemove}
              className="inline-flex h-9 items-center gap-1.5 rounded-full border border-input-border bg-input-bg px-3 text-xs font-semibold text-secondary-text transition hover:border-danger hover:text-danger"
            >
              <Trash2 size={14} />
              Remove
            </button> */}
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex min-h-11 w-full cursor-pointer items-center justify-between gap-3 rounded-full border border-input-border bg-input-bg px-4 text-sm text-theme-text transition hover:bg-secondary-bg"
        >
          <span className="truncate">{label}</span>
          <span className="shrink-0 text-xs font-semibold text-primary-text">
            Choose file
          </span>
        </button>
      )}

      <span className="text-[11px] text-secondary-text">
        PNG or JPG up to 5 MB
      </span>

      {error ? (
        <p className="text-xs font-medium text-red-400">{error}</p>
      ) : null}
    </div>
  );
}

function BeneficialOwnersEditor({
  record,
  values,
  selectedFiles,
  fieldErrors = {},
  onUpdateField,
  onUpdateFile,
  onRemoveFile,
}) {
  const owners = Array.isArray(values.beneficialOwners)
    ? values.beneficialOwners
    : [];

  const addOwner = () => {
    onUpdateField("beneficialOwners", [
      ...owners,
      { ...EMPTY_BENEFICIAL_OWNER },
    ]);
  };

  const removeOwner = (index) => {
    onUpdateField(
      "beneficialOwners",
      owners.filter((_, ownerIndex) => ownerIndex !== index),
    );
    onRemoveFile?.(index);
  };

  return (
    <div className="space-y-4">
      {owners.map((owner, index) => (
        <div
          key={index}
          className="rounded-[14px] border border-input-border bg-primary-bg/60 p-4"
        >
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-theme-text">
              Beneficial Owner #{index + 1}
            </p>
            {owners.length > 1 ? (
              <button
                type="button"
                onClick={() => removeOwner(index)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-400 transition hover:text-red-300"
              >
                <Trash2 size={14} />
                Remove Owner
              </button>
            ) : null}
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <VerificationField
              field={{
                name: `beneficialOwners.${index}.fullName`,
                label: "Full name",
                placeholder: "Example owner name",
                required: true,
              }}
              value={owner.fullName}
              onChange={onUpdateField}
              error={fieldErrors[`beneficialOwners.${index}.fullName`]}
            />
            <VerificationField
              field={{
                name: `beneficialOwners.${index}.dateOfBirth`,
                label: "Date of birth",
                type: "date",
                placeholder:'dd-mm-yyyy',
                required: true,
              }}
              value={owner.dateOfBirth}
              onChange={onUpdateField}
              error={fieldErrors[`beneficialOwners.${index}.dateOfBirth`]}
            />
            <VerificationField
              field={{
                name: `beneficialOwners.${index}.nationality`,
                label: "Nationality",
                type: "country",
                placeholder: "Select nationality",
                required: true,
              }}
              value={owner.nationality}
              onChange={onUpdateField}
              error={fieldErrors[`beneficialOwners.${index}.nationality`]}
            />
            <VerificationField
              field={{
                name: `beneficialOwners.${index}.ownershipPercentage`,
                label: "Ownership %",
                type: "number",
                placeholder: "25",
                min: 0,
                max: 100,
                required: true,
              }}
              value={owner.ownershipPercentage}
              onChange={onUpdateField}
              error={fieldErrors[`beneficialOwners.${index}.ownershipPercentage`]}
            />
            <VerificationField
              field={{
                name: `beneficialOwners.${index}.documentType`,
                label: "Document type",
                type: "select",
                required: true,
                options: BENEFICIAL_OWNER_DOCUMENT_TYPES,
              }}
              value={owner.documentType}
              onChange={onUpdateField}
              error={fieldErrors[`beneficialOwners.${index}.documentType`]}
            />
          </div>

          <div className="mt-3 max-w-sm">
            <BeneficialOwnerImageField
              index={index}
              currentValue={getPathValue(
                record,
                `beneficialOwners.${index}.beneficialOwnerDocumentImage`,
              )}
              selectedFile={
                selectedFiles[
                  `beneficialOwners.${index}.beneficialOwnerDocumentImage`
                ]
              }
              onFileChange={onUpdateFile}
              onRemove={onRemoveFile}
            />
          </div>
        </div>
      ))}

      {/* <button
        type="button"
        onClick={addOwner}
        className="inline-flex h-10 items-center gap-1.5 rounded-full border border-dashed border-input-border px-4 text-sm font-semibold text-primary-text transition hover:border-primary hover:bg-primary/5"
      >
        <Plus size={16} />
        Add Owner
      </button> */}
    </div>
  );
}

function appendSelectValuesToFormData(formData, kind, values) {
  const sections = kind === "kyb" ? KYB_FORM_SECTIONS : KYC_FORM_SECTIONS;

  for (const section of sections) {
    for (const field of section.fields || []) {
      if (field.type !== "select") continue;
      const value = getPathValue(values, field.name);
      if (hasVerificationValue(value)) {
        formData.set(field.name, String(value));
      }
    }

    if (section.dynamic) {
      const owners = Array.isArray(values[section.dynamic])
        ? values[section.dynamic]
        : [];

      owners.forEach((owner, index) => {
        const value = getPathValue(owner, "documentType");
        if (hasVerificationValue(value)) {
          formData.set(`beneficialOwners.${index}.documentType`, String(value));
        }
      });
    }
  }
}

function withPhoneCountryPrefix(phone, country) {
  const localNumber = getNationalPhoneNumber(phone, country?.dialCode);
  const dialCode = String(country?.dialCode || "").trim();

  if (!localNumber) return "";
  if (!dialCode) return localNumber;

  return `${dialCode}${localNumber}`;
}

function appendPhoneValuesToFormData(formData, kind, values, phoneCountries) {
  if (kind === "kyc") {
    const phoneNumber = withPhoneCountryPrefix(
      getPathValue(values, "phoneNumber"),
      phoneCountries.phoneNumber,
    );

    if (phoneNumber) formData.set("phoneNumber", phoneNumber);
    return;
  }

  const businessPhone = withPhoneCountryPrefix(
    getPathValue(values, "businessPhone"),
    phoneCountries.businessPhone,
  );

  if (businessPhone) formData.set("businessPhone", businessPhone);
}

function VerificationForm({
  kind,
  profile,
  record,
  formId,
  hideSubmit = false,
  onSubmit,
  onValidationError,
  isSubmitting = false,
  prefillFromProfile = true,
}) {
  const sections = kind === "kyb" ? KYB_FORM_SECTIONS : KYC_FORM_SECTIONS;
  const [values, setValues] = useState(() =>
    getInitialVerificationForm(kind, profile, record, { prefillFromProfile }),
  );
  const [initialValues, setInitialValues] = useState(() =>
    getInitialVerificationForm(kind, profile, record, { prefillFromProfile }),
   );
   const [selectedFiles, setSelectedFiles] = useState({});
   const [phoneCountries, setPhoneCountries] = useState(() => ({
     phoneNumber:
       getCountryOption(splitPhoneValue(getPathValue(values, "phoneNumber")).countryCode) ||
       getCountryOption(getPathValue(values, "countryOfResidence")) ||
       DEFAULT_PHONE_COUNTRY,
     businessPhone:
       getCountryOption(splitPhoneValue(getPathValue(values, "businessPhone")).countryCode) ||
       getCountryOption(getPathValue(values, "address.country")) ||
       DEFAULT_PHONE_COUNTRY,
   }));
   const [fieldErrors, setFieldErrors] = useState({});
   const [touchedFields, setTouchedFields] = useState({});
   const previewUrlsRef = useRef(new Set());
   const identityDateErrorRef = useRef("");

  const hasChanges = useMemo(() => {
    const sameValues = JSON.stringify(values) === JSON.stringify(initialValues);
    const sameFiles = Object.keys(selectedFiles).length === 0;
    return !sameValues || !sameFiles;
  }, [values, initialValues, selectedFiles]);

  const revokePreviewUrl = useCallback((url) => {
    if (!url) return;
    URL.revokeObjectURL(url);
    previewUrlsRef.current.delete(url);
  }, []);

  const revokeAllFilePreviews = useCallback(() => {
    previewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    previewUrlsRef.current.clear();
  }, []);

  useEffect(() => {
    let cancelled = false;

    queueMicrotask(() => {
      if (cancelled) return;

      revokeAllFilePreviews();
      const freshValues = getInitialVerificationForm(kind, profile, record, {
        prefillFromProfile,
      });
      setValues(freshValues);
      setInitialValues(freshValues);
      setSelectedFiles({});
      setPhoneCountries({
        phoneNumber:
          getCountryOption(splitPhoneValue(getPathValue(freshValues, "phoneNumber")).countryCode) ||
          getCountryOption(getPathValue(freshValues, "countryOfResidence")) ||
          DEFAULT_PHONE_COUNTRY,
        businessPhone:
          getCountryOption(splitPhoneValue(getPathValue(freshValues, "businessPhone")).countryCode) ||
          getCountryOption(getPathValue(freshValues, "address.country")) ||
          DEFAULT_PHONE_COUNTRY,
      });
      setFieldErrors({});
      setTouchedFields({});
    });

    return () => {
      cancelled = true;
    };
  }, [kind, profile, record, prefillFromProfile, revokeAllFilePreviews]);

  useEffect(() => () => revokeAllFilePreviews(), [revokeAllFilePreviews]);

  const clearFormState = useCallback(() => {
    revokeAllFilePreviews();
    const emptyValues = getInitialVerificationForm(kind, null, null, {
      prefillFromProfile: false,
    });
    setValues(emptyValues);
    setInitialValues(emptyValues);
    setSelectedFiles({});
    setPhoneCountries({
      phoneNumber: DEFAULT_PHONE_COUNTRY,
      businessPhone: DEFAULT_PHONE_COUNTRY,
    });
    setFieldErrors({});
    setTouchedFields({});
    identityDateErrorRef.current = "";
  }, [kind, revokeAllFilePreviews]);

  const updatePhoneCountry = (path, country) => {
    setPhoneCountries((current) => ({
      ...current,
      [path]: country || DEFAULT_PHONE_COUNTRY,
    }));
  };

  const updateField = (path, value, nextPhoneCountry) => {
    let nextValues = cloneWithPathValue(values, path, value);
    if (kind === "kyc" && path === "phoneNumber" && nextPhoneCountry?.label) {
      nextValues = cloneWithPathValue(
        nextValues,
        "countryOfResidence",
        nextPhoneCountry.label,
      );
    } else if (
      kind === "kyb" &&
      path === "businessPhone" &&
      nextPhoneCountry?.label
    ) {
      nextValues = cloneWithPathValue(
        nextValues,
        "address.country",
        nextPhoneCountry.label,
      );
    }
    setValues(nextValues);

    const nextPhoneCountries = {
      ...phoneCountries,
      ...(nextPhoneCountry ? { [path]: nextPhoneCountry } : {}),
    };

    if (kind === "kyc" && path === "countryOfResidence") {
      nextPhoneCountries.phoneNumber =
        getCountryOption(value) || DEFAULT_PHONE_COUNTRY;
      setPhoneCountries((current) => ({
        ...current,
        phoneNumber: nextPhoneCountries.phoneNumber,
      }));
    } else if (kind === "kyb" && path === "address.country") {
      nextPhoneCountries.businessPhone =
        getCountryOption(value) || DEFAULT_PHONE_COUNTRY;
      setPhoneCountries((current) => ({
        ...current,
        businessPhone: nextPhoneCountries.businessPhone,
      }));
    }

    setTouchedFields((current) => ({
      ...current,
      [path]: true,
      ...(kind === "kyc" && path === "phoneNumber"
        ? { countryOfResidence: true }
        : {}),
      ...(kind === "kyb" && path === "businessPhone"
        ? { "address.country": true }
        : {}),
    }));
    setFieldErrors((current) => {
      const next = { ...current };
      if (path === "beneficialOwners") {
        Object.keys(next).forEach((key) => {
          if (key.startsWith("beneficialOwners.")) delete next[key];
        });
        return next;
      }

      const pathsToValidate = new Set([path]);

      if (/identity\.issueDate$/.test(path)) {
        pathsToValidate.add("identity.expiryDate");
      }
      if (path === "countryOfResidence") {
        pathsToValidate.add("phoneNumber");
      }
      if (path === "address.country") {
        pathsToValidate.add("businessPhone");
      }
      if (path === "phoneNumber") {
        pathsToValidate.add("countryOfResidence");
      }
      if (path === "businessPhone") {
        pathsToValidate.add("address.country");
      }

      pathsToValidate.forEach((fieldPath) => {
        if (
          fieldPath !== path &&
          !touchedFields[fieldPath] &&
          !hasVerificationValue(getPathValue(nextValues, fieldPath))
        ) {
          return;
        }

        const field = findVerificationField(kind, fieldPath);
        if (!field) return;

        const invalid = getVerificationFieldError({
          field,
          values: nextValues,
          phoneCountries: nextPhoneCountries,
          kind,
        });

        if (invalid) {
          next[fieldPath] = invalid.message;
        } else {
          delete next[fieldPath];
        }
      });

      return next;
    });

    if (
      kind === "kyc" &&
      /identity\.(issueDate|expiryDate)$/.test(path)
    ) {
      const liveError = getIdentityDateLiveError(nextValues.identity);

      if (liveError && liveError !== identityDateErrorRef.current) {
        identityDateErrorRef.current = liveError;
        onValidationError?.(liveError);
      } else if (!liveError) {
        identityDateErrorRef.current = "";
      }
    }
  };

  const updateFile = (path, file) => {
    setSelectedFiles((current) => {
      const previous = current[path];
      if (previous?.previewUrl) revokePreviewUrl(previous.previewUrl);

      if (!file) {
        const { [path]: _removed, ...rest } = current;
        return rest;
      }

      const previewUrl = isPreviewableImage(file.name, file.type)
        ? URL.createObjectURL(file)
        : "";

      if (previewUrl) previewUrlsRef.current.add(previewUrl);

      return {
        ...current,
        [path]: {
          name: file.name,
          type: file.type,
          previewUrl,
        },
      };
    });
  };

  const removeOwnerFileEntries = (target) => {
    if (typeof target !== "number") {
      updateFile(target, null);
      return;
    }

    setSelectedFiles((current) => {
      const next = {};

      for (const [path, entry] of Object.entries(current)) {
        const match = path.match(
          /^beneficialOwners\.(\d+)\.beneficialOwnerDocumentImage$/,
        );
        if (!match) {
          next[path] = entry;
          continue;
        }

        const ownerIndex = Number(match[1]);
        if (ownerIndex === target) {
          if (entry?.previewUrl) revokePreviewUrl(entry.previewUrl);
          continue;
        }

        next[
          `beneficialOwners.${
            ownerIndex > target ? ownerIndex - 1 : ownerIndex
          }.beneficialOwnerDocumentImage`
        ] = entry;
      }

      return next;
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const invalidField = validateVerificationForm({
      kind,
      values,
      selectedFiles,
      record,
      phoneCountries,
    });

    if (invalidField) {
      setTouchedFields((current) => ({ ...current, [invalidField.name]: true }));
      setFieldErrors((current) => ({
        ...current,
        [invalidField.name]: invalidField.message,
      }));
      focusVerificationField(invalidField.name);
      onValidationError?.(invalidField.message);
      return;
    }

    const formData = new FormData(event.currentTarget);
    const website = normalizeWebsiteValue(formData.get("website"));
    const dateFieldPattern =
      /(^|\.)(dateOfBirth|issueDate|expiryDate|incorporationDate)$/i;

    appendSelectValuesToFormData(formData, kind, values);
    appendPhoneValuesToFormData(formData, kind, values, phoneCountries);

    if (website) {
      formData.set("website", website);
    } else {
      formData.delete("website");
    }

    for (const [key, value] of Array.from(formData.entries())) {
      if (typeof value !== "string") continue;
      if (!dateFieldPattern.test(key)) continue;

      const normalizedDate = normalizeDateValue(value);
      if (normalizedDate) {
        formData.set(key, normalizedDate);
      }
    }

    formData.set("kind", kind);
    Promise.resolve(onSubmit?.(formData)).then((submitted) => {
      if (submitted !== false) clearFormState();
    });
  };

  return (
    <form id={formId} onSubmit={handleSubmit} noValidate className="space-y-5">
      {sections.map((section) => (
        <section
          key={section.id}
          className="rounded-[16px] border border-input-border bg-input-bg/55 p-4"
        >
          <div className="mb-4 flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-text">{section.title}</p>
            <StatusPill
              value={section.optional ? "Optional" : "Required"}
              tone={section.optional ? "muted" : "Required"}
            />
          </div>

          {section.dynamic ? (
              <BeneficialOwnersEditor
                record={record}
                values={values}
                selectedFiles={selectedFiles}
                fieldErrors={fieldErrors}
                onUpdateField={updateField}
                onUpdateFile={updateFile}
                onRemoveFile={removeOwnerFileEntries}
            />
          ) : (
            <>
              {section.fields?.length ? (
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {section.fields.map((field) => (
                    <VerificationField
                      key={field.name}
                      field={field}
                      type={field.type}
                      value={getPathValue(values, field.name)}
                      onChange={updateField}
                      onCountryChange={updatePhoneCountry}
                      phoneCountry={phoneCountries[field.name]}
                      error={fieldErrors[field.name]}
                    />
                  ))}
                </div>
              ) : null}

              {section.files?.length ? (
                <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {section.files.map((field) => (
                    <VerificationFileField
                      key={field.name}
                      field={field}
                      currentValue={getPathValue(record, field.name)}
                      selectedFile={selectedFiles[field.name]}
                      onChange={updateFile}
                    />
                  ))}
                </div>
              ) : null}
            </>
          )}
        </section>
      ))}

      {!hideSubmit ? (
        <div className="flex justify-end">
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting || (record && !hasChanges)}
            className="h-11 px-6 text-sm text-white"
          >
            {isSubmitting
              ? "Submitting..."
              : record
                ? `Update ${kind === "kyb" ? "KYB" : "KYC"} verification`
                : `Submit ${kind === "kyb" ? "KYB" : "KYC"} verification`}
          </Button>
        </div>
      ) : null}
    </form>
  );
}

function VerificationOverview({
  kind,
  profile,
  record,
  error,
  onOpenDrawer,
  className = "",
}) {
  const config =
    VERIFICATION_REQUIREMENTS[kind] ?? VERIFICATION_REQUIREMENTS.kyc;
  const status = getVerificationStatus(record);
  const accountName =
    kind === "kyb"
      ? pickString(
          [profile],
          ["businessName", "companyName", "legalBusinessName"],
        ) || "Business profile"
      : pickString([profile], ["fullName", "email"]) || "Individual profile";
  const canEdit = canEditVerificationRecord(record);
  const isReadOnly = Boolean(record) && !canEdit;
  const isRejected = status === "Rejected";
  const hideApprovedKybActionCard = kind === "kyb" && status === "Approved";

  return (
    <SectionCard
      title={config.title}
      subtitle={config.subtitle}
      icon={config.icon}
      className={className}
      headerAction={
        <StatusPill value={status} tone={getVerificationStatusTone(status)} />
      }
    >
      <div
        className={
          hideApprovedKybActionCard
            ? "grid gap-4"
            : "grid gap-4 xl:grid-cols-[0.7fr_1.3fr]"
        }
      >
        {!hideApprovedKybActionCard ? (
          <div className="rounded-[16px] border border-input-border bg-input-bg/55 p-4">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-primary/10 text-primary-text">
                {kind === "kyb" ? (
                  <Building2 size={19} strokeWidth={2.2} />
                ) : (
                  <IdCard size={19} strokeWidth={2.2} />
                )}
              </span>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase text-secondary-text">
                  {config.accountLabel}
                </p>
                <p className="mt-1 truncate text-sm font-semibold text-text">
                  {accountName}
                </p>
              </div>
            </div>

            {/* {error ? (
            <div className="mt-4 rounded-[14px] border border-amber-300/30 bg-amber-300/10 p-3 text-xs leading-5 text-amber-200">
              {error}
            </div>
          ) : null} */}

          <div className="mt-4 rounded-[14px] border border-input-border/70 bg-primary-bg/70 p-3 text-sm text-secondary-text">
            <p className="font-semibold text-theme-text">
              {isRejected
                ? "Update and resubmit your details"
                : isReadOnly
                  ? "Submitted details are locked"
                  : "Review your details before submission"}
            </p>
            <p className="mt-1 text-sm leading-6">
              {isRejected
                ? "Check the rejection reason, correct the required fields, and submit again."
                : isReadOnly
                  ? "Your submitted information is shown below for reference and cannot be edited."
                  : "Review or update the information below before sending it for verification."}
            </p>
          </div>

            <Button
              type="button"
              variant="primary"
              onClick={canEdit ? onOpenDrawer : undefined}
              icon={<ClipboardCheck size={16} />}
              className="mt-4 h-11 w-full text-sm text-white"
              disabled={!canEdit}
            >
              {getVerificationActionLabel(record, kind)}
            </Button>
          </div>
        ) : null}

        {isRejected ? (
          <VerificationRejectionNotice record={record} kind={kind} />
        ) : isReadOnly ? (
          <div className="rounded-[16px] border border-primary-text/20 bg-primary-text/10 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-theme-text">
                  Submitted details
                </p>
                <p className="mt-1 text-sm leading-6 text-secondary-text">
                  {status === "Approved"
                    ? "Your approved submission is shown below for reference."
                    : "Your submission is currently under review and can only be viewed here."}
                </p>
              </div>
              <StatusPill
                value={status === "Approved" ? "Read only" : "Review"}
                tone={status === "Approved" ? "success" : "warning"}
              />
            </div>
            <div className="mt-4">
              <VerificationReadOnlySummary kind={kind} record={record} />
            </div>
          </div>
        ) : null}
      </div>
    </SectionCard>
  );
}

function buildDocumentFileEntry(field, record) {
  return {
    id: field.name,
    name: field.label,
    label: field.label,
    url: resolveBackendMediaUrl(getPathValue(record, field.name)),
    status: "Uploaded",
    uploadedAt: record?.updatedAt || record?.createdAt || null,
  };
}

function KybDocumentTile({ field, value }) {
  return (
    <DocumentViewer
      files={[
        {
          id: field.name,
          name: field.label,
          label: field.label,
          url: resolveBackendMediaUrl(value),
          status: value ? "Uploaded" : "",
          uploadedAt: null,
        },
      ]}
      allowDownload
      allowFullscreen
      readOnly
      authToken={getStoredAccessToken()}
      emptyText={`${field.label} not uploaded`}
    />
  );
}

function KybApprovedState() {
  return (
    <div className="flex min-h-[360px] flex-col items-center justify-center rounded-[18px] border border-primary-text/25 bg-primary-text/10 px-5 py-10 text-center">
      <div className="relative flex h-32 w-32 items-center justify-center rounded-full bg-primary-text/10 text-primary-text">
        <motion.span
          className="absolute inset-0 rounded-full border border-primary-text/25"
          initial={{ scale: 0.75, opacity: 0.7 }}
          animate={{ scale: 1.18, opacity: 0 }}
          transition={{ duration: 0.9, delay: 0.35, ease: "easeOut" }}
        />
        <motion.svg
          viewBox="0 0 100 100"
          className="relative h-24 w-24"
          aria-hidden="true"
        >
          <motion.circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.65, ease: "easeOut" }}
          />
          <motion.path
            d="M31 51 L44 64 L70 36"
            fill="none"
            stroke="currentColor"
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.45, delay: 0.45, ease: "easeOut" }}
          />
        </motion.svg>
      </div>

      <p className="mt-7 text-2xl font-semibold text-theme-text">
        KYB approved
      </p>
      <p className="mt-2 max-w-md text-sm leading-6 text-secondary-text">
        Your business verification is complete.
      </p>
    </div>
  );
}

function KybReviewState({ error }) {
  return (
    <div className="flex min-h-[360px] flex-col items-center justify-center rounded-[18px] border border-warning/25 bg-warning/10 px-5 py-10 text-center">
      <motion.div
        className="flex h-20 w-20 items-center justify-center rounded-[22px] border border-warning/25 bg-warning/10 text-warning"
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.28, ease: "easeOut" }}
      >
        <ClipboardCheck size={36} strokeWidth={2.1} />
      </motion.div>

      <p className="mt-6 text-2xl font-semibold text-theme-text">
        Under admin review
      </p>
      <p className="mt-2 max-w-lg text-sm leading-6 text-secondary-text">
        Your KYB details have been submitted. Editing will be available only if
        an admin rejects the verification.
      </p>

      {error ? (
        <div className="mt-5 max-w-lg rounded-[14px] border border-amber-300/30 bg-amber-300/10 p-3 text-xs leading-5 text-amber-200">
          {error}
        </div>
      ) : null}
    </div>
  );
}

function VerificationKybPanel({
  profile,
  record,
  error,
  onOpenDrawer,
  isSubmitting = false,
}) {
  const config = VERIFICATION_REQUIREMENTS.kyb;
  const status = getVerificationStatus(record);
  const rawStatus = normalizeComparable(getRawVerificationStatus(record));
  const isApproved = status === "Approved";
  const isLockedReview = status === "Submitted" || rawStatus === "draft";

  if (isApproved) {
    return (
      <SectionCard
        title="Verification (KYB)"
        subtitle="Business verification details"
        icon={Building2}
        headerAction={
          <StatusPill value={status} tone={getVerificationStatusTone(status)} />
        }
      >
        <KybApprovedState />
      </SectionCard>
    );
  }

  if (isLockedReview) {
    return (
      <SectionCard
        title="Verification (KYB)"
        subtitle="Business verification details"
        icon={Building2}
        headerAction={
          <StatusPill value={status} tone={getVerificationStatusTone(status)} />
        }
      >
        <KybReviewState error={error} />
      </SectionCard>
    );
  }

  const documentFields =
    KYB_FORM_SECTIONS.find((section) => section.id === "documents")?.files ||
    [];
  const completedCount = config.requirements.filter((requirement) =>
    getRequirementCompletion(requirement, record),
  ).length;
  const progress = Math.round(
    (completedCount / Math.max(config.requirements.length, 1)) * 100,
  );
  const accountName =
    pickString(
      [record, profile],
      ["businessName", "legalBusinessName", "companyName"],
    ) || "Business profile";
  const canEdit = canEditVerificationRecord(record);
  const statusMessage = getKybStatusMessage(record);
  const {
    reason: rejectionReason,
    adminNotes,
    rejectedFields,
  } = getVerificationRejectionDetails(record);

  return (
    <div className="space-y-5">
      <SectionCard
        title="Verification (KYB)"
        subtitle="Business verification details"
        icon={Building2}
        headerAction={
          <StatusPill value={status} tone={getVerificationStatusTone(status)} />
        }
      >
        <div className="grid gap-4 xl:grid-cols-[0.7fr_1.3fr]">
          <div className="rounded-[16px] border border-input-border bg-input-bg/55 p-4">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-primary/10 text-primary-text">
                <Building2 size={19} strokeWidth={2.2} />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase text-secondary-text">
                  Business account
                </p>
                <p className="mt-1 truncate text-sm font-semibold text-text">
                  {accountName}
                </p>
              </div>
            </div>

            <div className="mt-5">
              <div className="flex items-center justify-between gap-3 text-xs font-semibold text-secondary-text">
                <span>KYB completion</span>
                <span>
                  {completedCount}/{config.requirements.length}
                </span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary-bg">
                <span
                  className="block h-full rounded-full bg-primary"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {error ? (
              <div className="mt-4 rounded-[14px] border border-amber-300/30 bg-amber-300/10 p-3 text-xs leading-5 text-amber-200">
                {error}
              </div>
            ) : null}

            <div
              className={`mt-4 rounded-[14px] border p-3 text-xs leading-5 ${
                status === "Rejected"
                  ? "border-red-500/20 bg-red-500/10 text-red-300"
                  : "border-input-border bg-secondary-bg/45 text-secondary-text"
              }`}
            >
              <p>{statusMessage}</p>
              {status === "Rejected" ? (
                <p className="mt-2">
                  <span className="font-semibold text-theme-text">Reason:</span>{" "}
                  {rejectionReason || getVerificationRejectionFallback("kyb")}
                </p>
              ) : null}
              {adminNotes ? (
                <p className="mt-1">
                  <span className="font-semibold text-theme-text">
                    Admin notes:
                  </span>{" "}
                  {adminNotes}
                </p>
              ) : null}
              {rejectedFields.length ? (
                <p className="mt-1">
                  <span className="font-semibold text-theme-text">
                    Needs update:
                  </span>{" "}
                  {rejectedFields.join(", ")}
                </p>
              ) : null}
            </div>

            <Button
              type="button"
              variant="primary"
              icon={<ClipboardCheck size={16} />}
              onClick={onOpenDrawer}
              disabled={isSubmitting || !canEdit}
              className="mt-5 h-11 w-full text-sm text-white"
            >
              {getKybActionLabel(record)}
            </Button>
          </div>

          <div className="grid min-w-0 gap-3 lg:grid-cols-2">
            {config.requirements.map((requirement) => (
              <VerificationRequirementCard
                key={requirement.id}
                requirement={requirement}
                complete={getRequirementCompletion(requirement, record)}
              />
            ))}
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="KYB uploads & documents"
        subtitle="Uploaded business verification documents"
        icon={FileCheck2}
        headerAction={
          <Button
            type="button"
            onClick={onOpenDrawer}
            disabled={isSubmitting || !canEdit}
            className="h-10 border-input-border bg-input-bg px-4 text-sm font-semibold text-theme-text hover:border-primary hover:text-primary"
          >
            {canEdit ? "Upload documents" : "Locked"}
          </Button>
        }
      >
        <div className="grid gap-3 lg:grid-cols-3">
          {documentFields.map((field) => (
            <KybDocumentTile
              key={field.name}
              field={field}
              value={getPathValue(record, field.name)}
            />
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

function VerificationEditPanel({
  onCancel,
  kind,
  profile,
  record,
  formResetKey = 0,
  onSubmit,
  onValidationError,
  isSubmitting = false,
  prefillFromProfile = true,
}) {
  const config =
    VERIFICATION_REQUIREMENTS[kind] ?? VERIFICATION_REQUIREMENTS.kyc;
  const Icon = config.icon;
  const formId = `verification-${kind}-form`;
  const isDisabled = isSubmitting || (record && !canEditVerificationRecord(record));
  const actionLabel = isSubmitting
    ? "Saving..."
    : record
      ? `Save ${config.shortLabel}`
      : `Submit ${config.shortLabel}`;

  return (
    <section
      className="flex h-[calc(100vh-12rem)] min-h-[560px] flex-col overflow-hidden rounded-[18px] border border-input-border/80 shadow-[0_18px_42px_rgba(8,19,12,0.08)]"
      style={{ background: "var(--card-bg)" }}
    >
      <div className="flex shrink-0 flex-col gap-4 border-b border-input-border px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-primary/10 text-primary-text">
            <Icon size={19} strokeWidth={2.2} />
          </span>
          <div className="min-w-0">
            <h2 className="text-xl font-bold tracking-tight text-theme-text">
              {config.title}
            </h2>
            <p className="mt-1 text-sm leading-5 text-secondary-text">
              {config.subtitle}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="inline-flex h-10 items-center justify-center rounded-full border border-input-border bg-input-bg px-4 text-sm font-semibold text-theme-text transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            form={formId}
            disabled={isDisabled}
            className="inline-flex h-10 items-center justify-center hover:scale-[1.03] rounded-full border border-transparent bg-primary-text px-5 text-sm font-semibold text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {actionLabel}
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5">
        <VerificationForm
          key={formResetKey}
          formId={formId}
          hideSubmit
          kind={kind}
          profile={profile}
          record={record}
          onSubmit={onSubmit}
          onValidationError={onValidationError}
          isSubmitting={isSubmitting}
          prefillFromProfile={prefillFromProfile}
        />
      </div>
    </section>
  );
}

export default function Page() {
  const router = useRouter();
  const baseRoute = getAccountBaseRoute();
  const passwordLogoutTimerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("password");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [requestSigningEnabled, setRequestSigningEnabled] = useState(true);
  const [allowlist, setAllowlist] = useState(initialAllowlist);
  const [allowlistInput, setAllowlistInput] = useState("");
  const [sessions, setSessions] = useState(initialSessions);
  const [backupOpen, setBackupOpen] = useState(false);
  const [setup2FAOpen, setSetup2FAOpen] = useState(false);
  const [disable2FAOpen, setDisable2FAOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    tone: "success",
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [twoFactorSetup, setTwoFactorSetup] = useState({
    secret: "",
    otpauthUrl: "",
    qrCodeUrl: "",
  });
  const [twoFactorSetupError, setTwoFactorSetupError] = useState("");
  const [isGenerating2FA, setIsGenerating2FA] = useState(false);
  const [isEnabling2FA, setIsEnabling2FA] = useState(false);
  const [isDisabling2FA, setIsDisabling2FA] = useState(false);
  const [securityProfile, setSecurityProfile] = useState(null);
  const [verificationRecord, setVerificationRecord] = useState(null);
  const [verificationError, setVerificationError] = useState("");
  const [isSubmittingVerification, setIsSubmittingVerification] =
    useState(false);
  const [verificationEditOpen, setVerificationEditOpen] = useState(false);
  const [verificationFormResetKey, setVerificationFormResetKey] = useState(0);
  const [verificationKind, setVerificationKind] = useState("kyb");

  const strengthScore = useMemo(() => getStrength(newPassword), [newPassword]);
  const allowlistEntries = useMemo(
    () => allowlist.map((ip, index) => ({ id: `${ip}-${index}`, ip })),
    [allowlist],
  );
  const trustedDevices = useMemo(() => initialTrustedDevices, []);

  useEffect(() => {
    queueMicrotask(() => {
      setActiveTab(readStoredSecurityActiveTab("password"));
    });
  }, []);

  useEffect(() => {
    return () => {
      if (passwordLogoutTimerRef.current) {
        window.clearTimeout(passwordLogoutTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      const pendingMessage = consumeKybSecurityMessage();
      if (pendingMessage) {
        setSnackbar({ open: true, message: pendingMessage, tone: "error" });
      }
    });
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadSecurityProfile = async () => {
      const token = getStoredAccessToken();

      if (!token) {
        if (!cancelled) setLoading(false);
        return;
      }

      try {
        let payload = null;
        let responseOk = false;

        try {
          const baseRoute = getAccountBaseRoute();

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
            setSnackbar({
              open: true,
              message: responseMessage,
              tone: "error",
            });
          }
          return;
        }

        const profileData = getProfileData(payload);

        const profileVerificationKind = getVerificationKind(profileData);

        if (!cancelled) {
          setSecurityProfile(profileData);
          setVerificationKind(profileVerificationKind);
          setVerificationRecord(null);
          setVerificationError("");
        }

        const enabled = getTwoFactorEnabled(payload);
        if (!cancelled && enabled !== null) {
          setTwoFactorEnabled(enabled);
        }

        const verificationRoute =
          profileVerificationKind === "kyc"
            ? `${baseRoute}/kyc`
            : `${baseRoute}/kyb-status`;
        let verificationPayload = null;
        let verificationOk = false;
        let verificationStatus = 0;

        try {
          const verificationResponse = await apiClient.get(verificationRoute);
          verificationPayload = verificationResponse.data;
          verificationStatus = verificationResponse.status;
          verificationOk = true;
        } catch (requestError) {
          verificationPayload = getApiErrorPayload(requestError);
          verificationStatus = getApiErrorStatus(requestError);
        }

        if (cancelled) return;

        if (verificationStatus === 404) {
          setVerificationRecord(null);
          setVerificationError("");
          return;
        }

        if (!verificationOk || verificationPayload?.success === false) {
          setVerificationRecord(null);
          setVerificationError(
            getResponseMessage(verificationPayload) ||
              `Could not load ${profileVerificationKind === "kyc" ? "KYC" : "KYB"} status.`,
          );
          return;
        }

        setVerificationRecord(getVerificationRecord(verificationPayload));
        setVerificationError("");
      } catch (error) {
        if (!cancelled && error instanceof Error && error.message) {
          setSnackbar({ open: true, message: error.message, tone: "error" });
          setVerificationError(error.message);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadSecurityProfile();

    return () => {
      cancelled = true;
    };
  }, []);

  const addAllowlistIp = () => {
    const value = allowlistInput.trim();
    if (!value) return;

    const isLikelyIp =
      /^((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.|$)){4}$/.test(value) ||
      /^([0-9a-fA-F:]+)$/.test(value);

    if (!isLikelyIp) {
      setSnackbar({
        open: true,
        message: "Enter a valid IP address.",
        tone: "error",
      });
      return;
    }

    if (allowlist.includes(value)) {
      setSnackbar({
        open: true,
        message: "That IP address is already allowlisted.",
        tone: "warning",
      });
      return;
    }

    setAllowlist((current) => [...current, value]);
    setAllowlistInput("");
    setSnackbar({
      open: true,
      message: `Added ${value} to the IP allowlist.`,
      tone: "success",
    });
  };

  const updatePassword = async () => {
    setIsChangingPassword(true);

    try {
      let payload = null;
      let responseOk = false;
      try {
        const response = await apiClient.post(`${baseRoute}/change-password`, {
          oldPassword: currentPassword,
          newPassword,
          confirmPassword,
        });
        payload = response.data;
        responseOk = true;
      } catch (requestError) {
        payload = getApiErrorPayload(requestError);
      }

      const responseMessage = getResponseMessage(payload);
      if (!responseOk || payload?.success === false) {
        if (responseMessage)
          setSnackbar({ open: true, message: responseMessage, tone: "error" });
        return;
      }

      if (responseMessage)
        setSnackbar({ open: true, message: responseMessage, tone: "success" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      if (passwordLogoutTimerRef.current) {
        window.clearTimeout(passwordLogoutTimerRef.current);
      }
      passwordLogoutTimerRef.current = window.setTimeout(() => {
        passwordLogoutTimerRef.current = null;
        setForceLogoutMessage(
          responseMessage ||
            "Password changed successfully. Please sign in again.",
        );
        clearAuthTokens();
        clearStoredUserVerification();
        router.replace("/Auth/login");
      }, PASSWORD_CHANGE_LOGOUT_DELAY_MS);
    } catch (error) {
      if (error instanceof Error && error.message) {
        setSnackbar({ open: true, message: error.message, tone: "error" });
      }
    } finally {
      setIsChangingPassword(false);
    }
  };

  const submitVerification = async (formData) => {
    const token = getStoredAccessToken();

    if (!token) {
      setSnackbar({
        open: true,
        message: "Login token is missing. Please sign in again.",
        tone: "error",
      });
      return false;
    }

    const activeKind = verificationKind === "kyc" ? "kyc" : "kyb";

    if (verificationRecord && !canEditVerificationRecord(verificationRecord)) {
      const message = getVerificationStatusMessage(
        verificationRecord,
        activeKind,
      );
      setVerificationError(message);
      setSnackbar({ open: true, message, tone: "info" });
      setVerificationEditOpen(false);
      return false;
    }

    setIsSubmittingVerification(true);

    try {
      const activeKind = verificationKind === "kyc" ? "kyc" : "kyb";
      const endpoint = verificationRecord
        ? activeKind === "kyc"
          ? `${baseRoute}/update/kyc`
          : `${baseRoute}/update-kyb`
        : activeKind === "kyc"
          ? `${baseRoute}/create/kyc`
          : `${baseRoute}/create-kyb`;
      const response = verificationRecord
        ? await apiClient.put(endpoint, formData)
        : await apiClient.post(endpoint, formData);
      const payload = response.data;
      const responseMessage = getFriendlyVerificationMessage(
        getResponseMessage(payload),
      );

      if (payload?.success === false) {
        const message = responseMessage || "Could not submit verification.";
        setVerificationError(message);
        setSnackbar({ open: true, message, tone: "error" });
        return false;
      }

      setVerificationRecord(getVerificationRecord(payload));
      setVerificationError("");
      setVerificationEditOpen(false);
      setSnackbar({
        open: true,
        message:
          responseMessage ||
          `${activeKind === "kyc" ? "KYC" : "KYB"} submitted successfully.`,
        tone: "success",
      });
      return true;
    } catch (error) {
      const payload = getApiErrorPayload(error);
      const message =
        getFriendlyVerificationMessage(getResponseMessage(payload)) ||
        "Could not submit verification.";
      setVerificationError(message);
      setSnackbar({ open: true, message, tone: "error" });
      return false;
    } finally {
      setIsSubmittingVerification(false);
    }
  };

  const generateTwoFactor = async () => {
    setTwoFactorSetup({ secret: "", otpauthUrl: "", qrCodeUrl: "" });
    setTwoFactorSetupError("");
    setSetup2FAOpen(true);
    setIsGenerating2FA(true);

    try {
      const token = getStoredAccessToken();

      if (!token) {
        const message = "Login token is missing. Please sign in again.";
        setTwoFactorSetupError(message);
        setSnackbar({ open: true, message, tone: "error" });
        return;
      }

      let payload = null;
      let responseOk = false;
      try {
        const response = await apiClient.post(`${baseRoute}/generate-2fa`);
        payload = response.data;
        responseOk = true;
      } catch (requestError) {
        payload = getApiErrorPayload(requestError);
      }

      const responseMessage = getResponseMessage(payload);
      if (!responseOk || payload?.success === false) {
        const message =
          responseMessage || "Could not generate Google Authenticator setup.";
        setTwoFactorSetupError(message);
        setSnackbar({ open: true, message, tone: "error" });
        return;
      }

      const setup = getTwoFactorSetup(payload);

      if (!setup.secret && !setup.otpauthUrl && !setup.qrCodeUrl) {
        const message =
          responseMessage || "2FA setup details were not returned.";
        setTwoFactorSetupError(message);
        setSnackbar({ open: true, message, tone: "error" });
        return;
      }

      setTwoFactorSetup(setup);
      setTwoFactorSetupError("");
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : "Could not generate Google Authenticator setup.";
      setTwoFactorSetupError(message);
      setSnackbar({ open: true, message, tone: "error" });
    } finally {
      setIsGenerating2FA(false);
    }
  };

  const enableTwoFactor = async (tokenValue) => {
    const verificationToken =
      typeof tokenValue === "string" ? tokenValue.trim() : "";

    if (!TWO_FACTOR_TOKEN_PATTERN.test(verificationToken)) {
      setSnackbar({
        open: true,
        message: "Enter the six-digit verification code.",
        tone: "error",
      });
      return false;
    }

    setIsEnabling2FA(true);

    try {
      let payload = null;
      let responseOk = false;
      try {
        const response = await apiClient.post(`${baseRoute}/enable-2fa`, {
          token: verificationToken,
        });
        payload = response.data;
        responseOk = true;
      } catch (requestError) {
        payload = getApiErrorPayload(requestError);
      }

      const responseMessage = getResponseMessage(payload);
      if (!responseOk || payload?.success === false) {
        if (responseMessage)
          setSnackbar({ open: true, message: responseMessage, tone: "error" });
        return false;
      }

      setTwoFactorEnabled(getTwoFactorEnabled(payload) ?? true);
      setTwoFactorSetup({ secret: "", otpauthUrl: "", qrCodeUrl: "" });
      setTwoFactorSetupError("");
      setSetup2FAOpen(false);
      if (responseMessage)
        setSnackbar({ open: true, message: responseMessage, tone: "success" });
      return true;
    } catch (error) {
      if (error instanceof Error && error.message) {
        setSnackbar({ open: true, message: error.message, tone: "error" });
      }
      return false;
    } finally {
      setIsEnabling2FA(false);
    }
  };

  const disableTwoFactor = async (tokenValue) => {
    const verificationToken =
      typeof tokenValue === "string" ? tokenValue.trim() : "";

    if (!TWO_FACTOR_TOKEN_PATTERN.test(verificationToken)) {
      setSnackbar({
        open: true,
        message: "Enter the six-digit verification code.",
        tone: "error",
      });
      return false;
    }

    setIsDisabling2FA(true);

    try {
      let payload = null;
      let responseOk = false;
      try {
        const response = await apiClient.post(`${baseRoute}/disable-2fa`, {
          token: verificationToken,
        });
        payload = response.data;
        responseOk = true;
      } catch (requestError) {
        payload = getApiErrorPayload(requestError);
      }

      const responseMessage = getResponseMessage(payload);
      if (!responseOk || payload?.success === false) {
        if (responseMessage)
          setSnackbar({ open: true, message: responseMessage, tone: "error" });
        return false;
      }

      setTwoFactorEnabled(getTwoFactorEnabled(payload) ?? false);
      setDisable2FAOpen(false);
      setSnackbar({
        open: true,
        message: responseMessage || "2FA disabled successfully.",
        tone: "success",
      });
      return true;
    } catch (error) {
      if (error instanceof Error && error.message) {
        setSnackbar({ open: true, message: error.message, tone: "error" });
      }
      return false;
    } finally {
      setIsDisabling2FA(false);
    }
  };

  const handleTwoFactorToggle = (nextValue) => {
    if (!nextValue) {
      setDisable2FAOpen(true);
      return;
    }

    if (
      twoFactorSetup.secret ||
      twoFactorSetup.otpauthUrl ||
      twoFactorSetup.qrCodeUrl
    ) {
      setSetup2FAOpen(true);
      return;
    }

    generateTwoFactor();
  };

  const handleSessionAction = (row) => {
    if (row.isCurrent) return;

    setSessions((current) =>
      current.map((session) =>
        session.id === row.id
          ? {
              ...session,
              lastActive:
                row.actionLabel === "Block"
                  ? "Blocked just now"
                  : "Revoked just now",
              actionLabel: row.actionLabel === "Block" ? "Blocked" : "Revoked",
              actionTone: row.actionLabel === "Block" ? "danger" : "success",
            }
          : session,
      ),
    );

    setSnackbar({
      open: true,
      message: `${row.device} ${row.actionLabel.toLowerCase()}ed successfully.`,
      tone: "success",
    });
  };

  const copyAllBackupCodes = async () => {
    try {
      await navigator.clipboard.writeText(BACKUP_CODES.join("\n"));
      setSnackbar({
        open: true,
        message: "Backup codes copied to clipboard.",
        tone: "success",
      });
    } catch {
      setSnackbar({
        open: true,
        message: "Copy failed. Please try again.",
        tone: "error",
      });
    }
  };

  const columns = [
    {
      key: "device",
      title: "Device",
      width: "34%",
      render: (_, row) => {
        const Icon = row.icon ?? Monitor;
        return (
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary-bg text-secondary-text">
              <Icon size={16} />
            </span>
            <div className="min-w-0">
              <p className="truncate font-medium text-text">{row.device}</p>
              {row.deviceTag ? (
                <div className="mt-1">
                  <StatusPill value={row.deviceTag} />
                </div>
              ) : null}
            </div>
          </div>
        );
      },
    },
    {
      key: "location",
      title: "Location",
      width: "18%",
      render: (value) => <span className="text-secondary-text">{value}</span>,
    },
    {
      key: "ip",
      title: "IP Address",
      width: "18%",
      render: (value) => (
        <span className="font-mono text-secondary-text">{value}</span>
      ),
    },
    {
      key: "lastActive",
      title: "Last Active",
      width: "20%",
      render: (value) => <span className="text-secondary-text">{value}</span>,
    },
  ];

  const rowActions = (row) => {
    if (row.isCurrent) return [];

    return [
      {
        key: "action",
        label: row.isCurrent ? "â€”" : row.actionLabel,
        onClick: () => handleSessionAction(row),
        className: row.isCurrent
          ? "border-transparent bg-transparent  shadow-none hover:bg-transparent"
          : row.actionLabel === "Block" || row.actionLabel == "Blocked"
            ? "border-red-400/20 bg-red-400/10 text-red-400 hover:border-red-400 hover:bg-red-400/15"
            : "border-primary-text/20 bg-primary-text/10 text-primary-text hover:border-primary-text hover:bg-primary-text/15",
      },
    ];
  };

  const renderPasswordPanel = () => (
    <SectionCard title="Change password" icon={KeyRound}>
      <div className="space-y-3">
        <PasswordInput
          label="Current password"
          value={currentPassword}
          onChange={(event) => setCurrentPassword(event.target.value)}
          inputClassName="h-11"
        />

        <PasswordInput
          label="New password"
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
          inputClassName="h-11"
        />

        <StrengthBar score={strengthScore} />

        <PasswordInput
          label="Confirm new password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          inputClassName="h-11"
        />

        <div className="flex justify-end pt-1">
          <Button
            variant="primary"
            onClick={updatePassword}
            disabled={isChangingPassword}
            className="h-10 px-5 text-sm text-white"
          >
            {isChangingPassword ? "Updating password..." : "Update password"}
          </Button>
        </div>
      </div>
    </SectionCard>
  );

  const renderApiSecurityPanel = () => (
    <SectionCard title="API security" icon={Shield}>
      <div className="space-y-5">
        <div>
          <p className="text-sm font-semibold text-text">IP allowlist</p>
          <div className="mt-3 rounded-full border border-input-border bg-input-bg px-3 py-2.5">
            <div className="flex flex-wrap items-center gap-2">
              {allowlistEntries.map((entry) => (
                <span
                  key={entry.id}
                  className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary"
                >
                  {entry.ip}
                  <button
                    type="button"
                    onClick={() => {
                      setAllowlist((current) =>
                        current.filter((ip) => ip !== entry.ip),
                      );
                      setSnackbar({
                        open: true,
                        message: `Removed ${entry.ip} from the allowlist.`,
                        tone: "success",
                      });
                    }}
                    className="inline-flex h-4 w-4 items-center justify-center rounded-full transition hover:bg-primary/10"
                    aria-label={`Remove ${entry.ip}`}
                  >
                    <Trash2 size={11} />
                  </button>
                </span>
              ))}

              <div className="flex min-w-[170px] flex-1 items-center gap-2">
                <input
                  value={allowlistInput}
                  onChange={(event) => setAllowlistInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      addAllowlistIp();
                    }
                  }}
                  placeholder="Add IP address..."
                  className="min-w-0 flex-1 bg-transparent text-sm text-text outline-none placeholder:text-secondary-text"
                />
                <button
                  type="button"
                  onClick={addAllowlistIp}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary transition hover:bg-primary hover:text-white"
                  aria-label="Add IP address"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          </div>
          <p className="mt-2 text-xs text-secondary-text">
            Requests outside this list will be rejected in live mode
          </p>
        </div>

        <ToggleRow
          title="Require request signing"
          description="Verify webhook signatures on delivery"
          checked={requestSigningEnabled}
          onChange={(next) => {
            setRequestSigningEnabled(next);
            setSnackbar({
              open: true,
              message: next
                ? "Request signing enabled."
                : "Request signing disabled.",
              tone: "success",
            });
          }}
        />
      </div>
    </SectionCard>
  );

  const renderTwoFactorPanel = () => (
    <SectionCard
      title="Two-factor authentication"
      subtitle="Add an extra layer of protection"
      icon={Shield}
      headerAction={
        <Toggle
          checked={twoFactorEnabled}
          disabled={isGenerating2FA || isEnabling2FA || isDisabling2FA}
          onChange={handleTwoFactorToggle}
          ariaLabel="Toggle two-factor authentication"
        />
      }
    >
      <div className="space-y-4">
        {!twoFactorEnabled ? (
          <div className="rounded-2xl border border-amber-200/80 bg-amber-100/10 px-4 py-4 text-sm text-secondary-text">
            <div className="flex items-start gap-3">
              <AlertTriangle
                size={16}
                className="mt-0.5 shrink-0 text-amber-500"
              />
              <p>
                <span className="font-semibold text-text">
                  2FA is currently disabled
                </span>
                <br />
                We strongly recommend enabling it to protect your account and
                funds.
              </p>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-primary-text/20 bg-primary-text/10 px-4 py-4 text-sm text-secondary-text">
            <div className="flex items-start gap-3">
              <CheckCircle2
                size={16}
                className="mt-0.5 shrink-0 text-success"
              />
              <p>
                <span className="font-semibold text-text">2FA is active</span>
                <br />
                Backup codes remain available if your authenticator device is
                lost.
              </p>
            </div>
          </div>
        )}

        {!twoFactorEnabled ? (
          <Button
            type="button"
            variant="primary"
            onClick={generateTwoFactor}
            disabled={isGenerating2FA || isEnabling2FA || isDisabling2FA}
            className="h-11 w-full text-sm text-white"
          >
            {isGenerating2FA
              ? "Generating QR code..."
              : "Set up Google Authenticator"}
          </Button>
        ) : null}
      </div>
    </SectionCard>
  );

  const openVerificationEdit = () => {
    if (!canEditVerificationRecord(verificationRecord)) {
      const message = getVerificationStatusMessage(
        verificationRecord,
        verificationKind,
      );
      setVerificationError(message);
      setSnackbar({ open: true, message, tone: "info" });
      return;
    }

    setVerificationFormResetKey((key) => key + 1);
    setVerificationEditOpen(true);
  };

  const closeVerificationEdit = () => {
    if (isSubmittingVerification) return;
    setVerificationEditOpen(false);
  };

  const renderVerificationPanel = () =>
    verificationEditOpen ? (
      <VerificationEditPanel
        kind={verificationKind}
        profile={securityProfile}
        record={verificationRecord}
        formResetKey={verificationFormResetKey}
        onCancel={closeVerificationEdit}
        onSubmit={submitVerification}
        onValidationError={(message) =>
          setSnackbar({ open: true, message, tone: "error" })
        }
        isSubmitting={isSubmittingVerification}
        prefillFromProfile
      />
    ) : (
      <VerificationOverview
        kind={verificationKind}
        profile={securityProfile}
        record={verificationRecord}
        error={verificationError}
        onOpenDrawer={openVerificationEdit}
        className=""
      />
    );

  const verificationTabs = useMemo(
    () =>
      SECURITY_TABS.map((tab) =>
        tab.key === "verification"
          ? {
              ...tab,
              label:
                verificationKind === "kyc"
                  ? "Verification (KYC)"
                  : "Verification (KYB)",
            }
          : tab,
      ),
    [verificationKind],
  );

  const renderActivePanel = () => {
    if (activeTab === "api") return renderApiSecurityPanel();
    if (activeTab === "twoFactor") return renderTwoFactorPanel();
    if (activeTab === "verification") return renderVerificationPanel();
    return renderPasswordPanel();
  };

  const handleSecurityTabChange = (tabKey) => {
    saveStoredSecurityActiveTab(tabKey);
    setActiveTab(tabKey);
  };

  if (loading) {
    return <Skeleton pageName="security" />;
  }
  return (
    <div className="space-y-6 pb-2">
      <PageTopBanner
        title="Security"
        description="Password, two-factor authentication and account access"
      />

      <section className="grid gap-5 md:grid-cols-[minmax(14rem,0.3fr)_1fr] xl:grid-cols-[minmax(17rem,0.25fr)_1fr] md:items-start">
        <aside className="space-y-4 md:sticky md:top-0 md:self-start">
          <section
            role="tablist"
            aria-label="Security settings tabs"
            aria-orientation="vertical"
            className="rounded-[18px] border border-input-border/80 p-3 shadow-[0_18px_42px_rgba(8,19,12,0.08)] sm:p-4"
            style={{ background: "var(--card-bg)" }}
          >
            <div className="space-y-1">
              {verificationTabs.map((tab) => (
                <SecurityTabButton
                  key={tab.key}
                  tab={tab}
                  active={tab.key === activeTab}
                  onClick={() => handleSecurityTabChange(tab.key)}
                />
              ))}
            </div>
          </section>
        </aside>

        <div className="min-w-0">{renderActivePanel()}</div>
      </section>

      <BackupCodesModal
        open={backupOpen}
        onClose={() => setBackupOpen(false)}
        onCopyAll={copyAllBackupCodes}
      />

      <Setup2FAModal
        open={setup2FAOpen}
        onClose={() => {
          setSetup2FAOpen(false);
          setTwoFactorSetupError("");
        }}
        setupKey={twoFactorSetup.secret}
        otpAuthUrl={twoFactorSetup.otpauthUrl}
        qrCodeUrl={twoFactorSetup.qrCodeUrl}
        isGenerating={isGenerating2FA}
        isEnabling={isEnabling2FA}
        errorMessage={twoFactorSetupError}
        onRetry={generateTwoFactor}
        onCopy={async (value, label = "Value") => {
          try {
            await navigator.clipboard.writeText(value);
            setSnackbar({
              open: true,
              message: `${label} copied to clipboard.`,
              tone: "success",
            });
          } catch (err) {
            setSnackbar({ open: true, message: "Copy failed.", tone: "error" });
          }
        }}
        onEnable={enableTwoFactor}
      />

      <Disable2FAModal
        open={disable2FAOpen}
        onClose={() => {
          if (!isDisabling2FA) setDisable2FAOpen(false);
        }}
        isSubmitting={isDisabling2FA}
        onConfirm={disableTwoFactor}
      />

      <Snackbar
        open={snackbar.open}
        message={snackbar.message}
        tone={snackbar.tone}
        onClose={() =>
          setSnackbar({ open: false, message: "", tone: "success" })
        }
      />
    </div>
  );
}
