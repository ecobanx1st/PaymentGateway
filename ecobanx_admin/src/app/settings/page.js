"use client";

import {
  Button,
  Dropdown,
  Input,
  Tabs,
  Toast,
  Toggle,
} from "@/components/ReusableUi";
import { postWithTokenApi } from "@/lib/apiHelper";
import { getAuthToken } from "@/lib/axiosInterceptor";
import { Check, Copy } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const settingsTabs = [
  // { label: "General", value: "general" },
  // { label: "Gateway", value: "gateway" },
  // { label: "Settlement", value: "settlement" },
  { label: "Security", value: "security" },
];

const currencyOptions = [
  { label: "USD - US Dollar", value: "usd" },
  { label: "INR - Indian Rupee", value: "inr" },
  { label: "AED - UAE Dirham", value: "aed" },
];

const timezoneOptions = [
  { label: "UTC", value: "utc" },
  { label: "Asia/Kolkata", value: "asia-kolkata" },
  { label: "Asia/Dubai", value: "asia-dubai" },
];

const gatewayOptions = [
  { label: "PayU", value: "payu" },
  { label: "Razorpay", value: "razorpay" },
  { label: "Stripe", value: "stripe" },
  { label: "Cashfree", value: "cashfree" },
];

const settlementCycleOptions = [
  { label: "T+2 days", value: "t2" },
  { label: "T+1 day", value: "t1" },
  { label: "Weekly", value: "weekly" },
];

const sessionTimeoutOptions = [
  { label: "30 Minutes", value: "30" },
  { label: "1 Hour", value: "60" },
  { label: "2 Hours", value: "120" },
];

const qrCells = new Set([
  0, 1, 2, 3, 4, 6, 10, 12, 13, 14, 18, 20, 24, 25, 26, 27, 28, 36, 38, 39, 41,
  42, 43, 45, 48, 50, 53, 55, 56, 58, 60, 62, 65, 67, 70, 72, 74, 75, 76, 79,
  80, 82, 84, 86, 88, 90, 93, 96, 97, 98, 100, 102, 104, 108, 110, 112, 114,
  116, 117, 118, 120, 122, 126, 127, 128, 129, 130, 132, 136, 138, 140, 142,
  144, 146, 148, 150, 151, 152, 153, 154,
]);

function SettingRow({ title, description, children, align = "center" }) {
  const rowAlignment = align === "start" ? "lg:items-start" : "lg:items-center";

  return (
    <div
      className={`grid gap-4 border-b border-input-border/20 py-6 last:border-b-0 lg:grid-cols-[180px_1fr] ${rowAlignment}`}
    >
      <div>
        <h2 className="text-mid font-semibold text-theme-text">{title}</h2>
        {description && (
          <p className="mt-1 max-w-56 text-small text-text-secondary">
            {description}
          </p>
        )}
      </div>
      {children}
    </div>
  );
}

function FormActions() {
  return (
    <div className="flex flex-col-reverse gap-3 pt-5 sm:flex-row sm:justify-end">
      {/* <Button variant="secondary" className="w-full sm:w-40">
        Discard
      </Button>
      <Button
        variant="primary"
        className="w-full sm:w-44"
        toastContent="Settings saved successfully"
      >
        Save changes
      </Button> */}
    </div>
  );
}

function SettingsPanel({ children }) {
  return (
    <section className="max-w-6xl rounded-rounded border border-input-border/40 bg-card-bg px-5 py-4 sm:px-7 lg:px-8">
      {children}
    </section>
  );
}

function GeneralSettings() {
  return (
    <SettingsPanel>
      <SettingRow
        title="Platform name"
        description="Shown across the admin panel and merchant-facing emails."
      >
        <Input defaultValue="Eco Banx" inputClassName="!h-10" />
      </SettingRow>
      <SettingRow
        title="Support email"
        description="Where merchant replies and escalations are routed."
      >
        <Input defaultValue="support@eco-banx.com" inputClassName="!h-10" />
      </SettingRow>
      <SettingRow
        title="Default currency"
        description="Used when a merchant has not set one explicitly."
      >
        <Dropdown
          options={currencyOptions}
          defaultValue="usd"
          triggerClassName="!h-10"
        />
      </SettingRow>
      <SettingRow
        title="Timezone"
        description="Applied to reports and audit logs."
      >
        <Dropdown
          options={timezoneOptions}
          defaultValue="utc"
          triggerClassName="!h-10"
        />
      </SettingRow>
      <FormActions />
    </SettingsPanel>
  );
}

function GatewaySettings() {
  return (
    <SettingsPanel>
      <SettingRow
        title="Primary gateway"
        description="Used first before falling back to secondary."
      >
        <Dropdown
          options={gatewayOptions}
          defaultValue="payu"
          triggerClassName="!h-10"
        />
      </SettingRow>
      <SettingRow
        title="Fallback routing"
        description="Automatically retry failed payments on a backup gateway."
      >
        <div className="flex justify-start lg:justify-end">
          <Toggle label="Fallback routing" defaultChecked />
        </div>
      </SettingRow>
      <SettingRow
        title="Transaction fee"
        description="Platform fee applied per successful transaction."
      >
        <Input defaultValue="2.4% + 3" inputClassName="!h-10" />
      </SettingRow>
      <FormActions />
    </SettingsPanel>
  );
}

function SettlementSettings() {
  return (
    <SettingsPanel>
      <SettingRow
        title="Settlement cycle"
        description="How often merchant payouts are processed."
      >
        <Dropdown
          options={settlementCycleOptions}
          defaultValue="t2"
          triggerClassName="!h-10"
        />
      </SettingRow>
      <SettingRow
        title="Minimum payout"
        description="Holds smaller balances until threshold is met."
      >
        <Input defaultValue="500" inputClassName="!h-10" />
      </SettingRow>
      <FormActions />
    </SettingsPanel>
  );
}

function QrPreview({ qrCode, loading }) {
  if (loading) {
    return (
      <div className="mx-auto grid h-44 w-44 place-items-center rounded-[12px] border border-input-border bg-input-bg p-4 text-small text-text-secondary">
        Loading QR...
      </div>
    );
  }

  if (qrCode) {
    return (
      <div className="mx-auto grid h-44 w-44 place-items-center rounded-[12px] border border-input-border bg-white p-3">
        <Image
          src={qrCode}
          alt="Two-factor authentication QR code"
          width={180}
          height={180}
          unoptimized
          className="h-full w-full object-contain"
        />
      </div>
    );
  }

  return (
    <div className="mx-auto grid h-44 w-44 grid-cols-[repeat(13,1fr)] gap-1 rounded-[12px] border border-input-border bg-white p-4">
      {Array.from({ length: 169 }).map((_, index) => (
        <span
          key={index}
          className={
            qrCells.has(index)
              ? "rounded-[2px] bg-bg-secondary"
              : "rounded-[2px] bg-white"
          }
        />
      ))}
    </div>
  );
}

function OtpInputBoxes({ value, onChange }) {
  const inputRefs = useRef([]);

  function updateDigit(index, nextValue) {
    const digit = nextValue.replace(/\D/g, "").slice(-1);
    const nextOtp = [...value];

    nextOtp[index] = digit;
    onChange(nextOtp);

    if (digit && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index, event) {
    if (event.key === "Backspace" && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(event) {
    event.preventDefault();

    const pastedDigits = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);

    if (!pastedDigits) {
      return;
    }

    const nextOtp = Array(6).fill("");

    pastedDigits.split("").forEach((digit, index) => {
      nextOtp[index] = digit;
    });

    onChange(nextOtp);
    inputRefs.current[Math.min(pastedDigits.length, 6) - 1]?.focus();
  }

  return (
    <div className="grid grid-cols-6 gap-2 sm:gap-3" onPaste={handlePaste}>
      {value.map((digit, index) => (
        <input
          key={index}
          ref={(element) => {
            inputRefs.current[index] = element;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          aria-label={`OTP digit ${index + 1}`}
          onChange={(event) => updateDigit(index, event.target.value)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          className="h-12 rounded-[14px] border border-input-border bg-input-bg text-center text-large font-semibold text-theme-text outline-none transition focus:border-text-primary sm:h-14"
        />
      ))}
    </div>
  );
}

function getTwoFactorResult(response) {
  return (
    response?.result ||
    response?.data?.result ||
    response?.data ||
    response ||
    null
  );
}

function getApiErrorMessage(error, fallbackMessage) {
  const data = error.response?.data;

  return (
    data?.message ||
    data?.msg ||
    data?.error ||
    data?.errors?.msg ||
    fallbackMessage
  );
}

function TwoFactorModal({
  nextEnabled,
  otp,
  error,
  secretKey,
  qrCode,
  loading,
  submitting,
  onOtpChange,
  onCancel,
  onConfirm,
}) {
  const [secretCopied, setSecretCopied] = useState(false);

  useEffect(() => {
    if (!secretCopied) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setSecretCopied(false);
    }, 3000);

    return () => window.clearTimeout(timer);
  }, [secretCopied]);

  function handleCopySecret() {
    if (secretKey) {
      navigator.clipboard?.writeText(secretKey);
      setSecretCopied(true);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 px-4 py-6">
      <section className="w-full max-w-lg rounded-rounded border border-input-border/50 bg-card-bg p-5 shadow-2xl shadow-black/50 sm:p-6">
        <div className="mb-5">
          <h2 className="text-large font-semibold text-theme-text">
            {nextEnabled
              ? "Enable two-factor authentication"
              : "Disable two-factor authentication"}
          </h2>
          <p className="mt-1 text-small text-text-secondary">
            Confirm this security change with your authenticator code.
          </p>
        </div>

        {nextEnabled &&<Input
          label="Secret key"
          value={secretKey || ""}
          placeholder={
            loading ? "Loading secret key" : "Secret key unavailable"
          }
          readOnly
          inputClassName="!h-10"
          afterIcon={
            <button
              type="button"
              aria-label={secretCopied ? "Secret key copied" : "Copy secret key"}
              onClick={handleCopySecret}
              disabled={!secretKey}
              className="text-text-secondary transition hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              {secretCopied ? (
                <Check className="h-4 w-4 text-text-primary" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
          }
        />}

        {nextEnabled && (
          <div className="my-7">
            <QrPreview qrCode={qrCode} loading={loading} />
          </div>
        )}

        <div>
          <label className="mb-3 block text-mid font-medium text-text-secondary">
            OTP
          </label>
          <OtpInputBoxes value={otp} onChange={onOtpChange} />
          {error && <p className="mt-2 text-small text-red-400">{error}</p>}
        </div>

        <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            variant="secondary"
            className="w-full sm:w-36"
            onClick={onCancel}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            className="w-full sm:w-36"
            onClick={onConfirm}
            disabled={loading || submitting}
          >
            {submitting ? "Saving..." : "Confirm"}
          </Button>
        </div>
      </section>
    </div>
  );
}

function SecuritySettings() {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [twoFactorDetails, setTwoFactorDetails] = useState(null);
  const [showTwoFactorModal, setShowTwoFactorModal] = useState(false);
  const [twoFactorOtp, setTwoFactorOtp] = useState(Array(6).fill(""));
  const [twoFactorError, setTwoFactorError] = useState("");
  const [loadingTwoFactor, setLoadingTwoFactor] = useState(false);
  const [submittingTwoFactor, setSubmittingTwoFactor] = useState(false);
  const [toast, setToast] = useState(null);

  async function loadTwoFactorDetails({
    showErrorToast = false,
    showSuccessToast = false,
  } = {}) {
    const token = getAuthToken();

    if (!token) {
      if (showErrorToast) {
        setToast({
          id: Date.now(),
          content: "Session token not found",
          color: "error",
        });
      }
      return null;
    }

    setLoadingTwoFactor(true);

    try {
      const response = await postWithTokenApi(token, "/generate-2fa");
      const result = getTwoFactorResult(response);

      setTwoFactorDetails(result);

      if (typeof result?.twoFactorEnabled === "boolean") {
        setTwoFactorEnabled(result.twoFactorEnabled);
      }

      return result;
    } catch (error) {
      const message = getApiErrorMessage(
        error,
        "Unable to generate 2FA details.",
      );

      if (showErrorToast) {
        setToast({ id: Date.now(), content: message, color: "error" });
      } else {
        setTwoFactorError(message);
      }

      return null;
    } finally {
      setLoadingTwoFactor(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadTwoFactorDetails({ showErrorToast: true, showSuccessToast: true });
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  async function requestTwoFactorChange() {
    setTwoFactorOtp(Array(6).fill(""));
    setTwoFactorError("");
    setShowTwoFactorModal(true);

    if (!twoFactorDetails) {
      await loadTwoFactorDetails();
    }
  }

  async function confirmTwoFactorChange() {
    const otpToken = twoFactorOtp.join("");

    if (!/^\d{6}$/.test(otpToken)) {
      setTwoFactorError("Enter a valid 6 digit OTP.");
      return;
    }

    const token = getAuthToken();

    if (!token) {
      setToast({
        id: Date.now(),
        content: "Session token not found",
        color: "error",
      });
      return;
    }

    const currentlyEnabled = Boolean(
      twoFactorDetails?.twoFactorEnabled ?? twoFactorEnabled,
    );
    const endpoint = currentlyEnabled ? "/disable-2fa" : "/enable-2fa";

    setSubmittingTwoFactor(true);

    try {
      const response = await postWithTokenApi(token, endpoint, {
        token: otpToken,
      });
      const nextEnabled = !currentlyEnabled;

      setTwoFactorEnabled(nextEnabled);
      setTwoFactorDetails((current) => ({
        ...current,
        twoFactorEnabled: nextEnabled,
      }));
      setShowTwoFactorModal(false);
      setToast({
        id: Date.now(),
        content:
          response?.message ||
          (nextEnabled
            ? "Two-factor authentication enabled"
            : "Two-factor authentication disabled"),
        color: "success",
      });
    } catch (error) {
      setTwoFactorError(
        getApiErrorMessage(
          error,
          currentlyEnabled
            ? "Unable to disable two-factor authentication."
            : "Unable to enable two-factor authentication.",
        ),
      );
    } finally {
      setSubmittingTwoFactor(false);
    }
  }

  const currentTwoFactorEnabled = Boolean(
    twoFactorDetails?.twoFactorEnabled ?? twoFactorEnabled,
  );

  return (
    <>
      {toast && (
        <div className="fixed right-4 top-4 z-[80] w-[calc(100vw-2rem)] max-w-md sm:right-6 sm:top-6">
          <Toast
            key={toast.id}
            content={toast.content}
            color={toast.color || "success"}
            duration={2500}
          />
        </div>
      )}
      <SettingsPanel>
        <SettingRow
          title="Two-factor authentication"
          description="Require 2FA for all admin accounts."
        >
          <div className="flex justify-start lg:justify-end">
            <Toggle
              checked={twoFactorEnabled}
              label="Two-factor authentication"
              onChange={requestTwoFactorChange}
            />
          </div>
        </SettingRow>
        {/* <SettingRow
          title="IP allow listing"
          description="Restrict admin panel access to approved IP ranges."
        >
          <div className="flex justify-start lg:justify-end">
            <Toggle label="IP allow listing" defaultChecked />
          </div>
        </SettingRow>
        <SettingRow
          title="Session timeout"
          description="Automatically sign out inactive sessions."
        >
          <Dropdown
            options={sessionTimeoutOptions}
            defaultValue="30"
            triggerClassName="!h-10"
          />
        </SettingRow> */}
        <FormActions />
      </SettingsPanel>

      {showTwoFactorModal && (
        <TwoFactorModal
          nextEnabled={!currentTwoFactorEnabled}
          otp={twoFactorOtp}
          error={twoFactorError}
          secretKey={twoFactorDetails?.secret}
          qrCode={twoFactorDetails?.qrCode}
          loading={loadingTwoFactor}
          submitting={submittingTwoFactor}
          onOtpChange={(value) => {
            setTwoFactorOtp(value);
            setTwoFactorError("");
          }}
          onCancel={() => setShowTwoFactorModal(false)}
          onConfirm={confirmTwoFactorChange}
        />
      )}
    </>
  );
}
export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("security");

  const tabPanels = {
    general: <GeneralSettings />,
    gateway: <GatewaySettings />,
    settlement: <SettlementSettings />,
    security: <SecuritySettings />,
  };

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <h1 className="text-large font-semibold text-theme-text">Settings</h1>
        <p className="text-small text-text-secondary">
          Configure Platform, Gateway, And Security Preferences
        </p>
      </section>

      <Tabs
        tabs={settingsTabs}
        value={activeTab}
        onChange={setActiveTab}
        variant="underline"
        className="max-w-6xl"
      />

      {tabPanels[activeTab]}
    </div>
  );
}
