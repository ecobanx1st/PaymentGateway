"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { defaultCountries } from "react-international-phone";
import {
  BellRing,
  Building2,
  Check,
  CheckCircle2,
  CircleDollarSign,
  Copy,
  Globe2,
  KeyRound,
  Link2,
  Mail,
  RefreshCw,
  Save,
  Settings2,
  ShieldCheck,
  Sparkles,
  UserRound,
  Webhook,
} from "lucide-react";
import Button from "@/components/ui/button";
import Checkbox from "@/components/ui/Checkbox";
import CopyButton from "@/components/ui/CopyButton";
import Dropdown from "@/components/ui/dropdown";
import Input from "@/components/ui/input";
import MerchantToolPageHeader from "@/components/ui/MerchantToolPageHeader";
import Snackbar from "@/components/ui/Snackbar";
import Skeleton from "@/components/ui/skeleton";
import Toggle from "@/components/ui/Toggle";
import { apiClient, getApiErrorPayload } from "@/lib/axiosInterceptor";
import { normalizeEmail } from "@/lib/normalize-email";
import { getAccountBaseRoute } from "@/utils/accountRoutes";

const coinOptions = [{ label: "All coins", value: "all" }];

const countryOptions = defaultCountries.map(([label, value]) => ({
  label,
  value,
}));

const tabItems = [
  {
    key: "basic",
    label: "Basic settings",
    eyebrow: "Profile",
    icon: UserRound,
  },
  {
    key: "merchant",
    label: "Merchant settings",
    eyebrow: "IPN",
    icon: Webhook,
  },
];

const defaultBasicSettings = {
  merchantId: "",
  verificationStatus: "",
  accountEmail: "",
  displayName: "",
  supportEmail: "",
  phone: "",
  country: null,
  electronicCommunication: false,
  monthlyStatement: false,
};

const defaultMerchantSettings = {
  ipnSecret: "",
  ipnUrl: "",
  statusEmail: "",
  callbackCoin: coinOptions[0],
  signedPayloads: false,
  retryFailedCallbacks: false,
  notifyPaymentSubmitted: false,
  notifyFundsReceived: false,
  notifyFundsSent: false,
  notifyDepositReceived: false,
};

function normalizeCoinOption(value, options = coinOptions) {
  if (!value) return options[0] || { label: "All coins", value: "all" };

  const normalizedValue =
    typeof value === "string" ? value.trim() : String(value).trim();
  if (!normalizedValue) return options[0] || { label: "All coins", value: "all" };

  const matchedOption = options.find(
    (option) =>
      String(option.value).toLowerCase() === normalizedValue.toLowerCase(),
  );

  if (matchedOption) return matchedOption;

  const symbol = normalizedValue.toUpperCase();
  return { label: symbol, value: symbol };
}

function normalizeString(value) {
  return typeof value === "string" && value.trim() ? value.trim() : "";
}

function splitFullName(fullName) {
  const parts =
    typeof fullName === "string" ? fullName.trim().split(/\s+/) : [];

  return {
    firstName: parts[0] || "",
    lastName: parts.slice(1).join(" "),
  };
}

function getCountryOption(country) {
  const normalizedCountry = normalizeString(country).toLowerCase();
  if (!normalizedCountry) return null;

  return (
    countryOptions.find(
      (option) =>
        option.label.toLowerCase() === normalizedCountry ||
        option.value.toLowerCase() === normalizedCountry,
    ) || { label: country, value: country }
  );
}

function findList(value) {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== "object") return null;

  for (const key of [
    "assets",
    "docs",
    "data",
    "result",
    "items",
    "list",
    "wallets",
  ]) {
    const list = findList(value[key]);
    if (list) return list;
  }

  return null;
}

function getAssetList(payload) {
  const candidates = [
    payload,
    payload?.data,
    payload?.result,
    payload?.data?.result,
    payload?.result?.data,
  ];

  for (const candidate of candidates) {
    const list = findList(candidate);
    if (list) return list;
  }

  return [];
}

function pickString(source, keys) {
  if (typeof source === "string") return source.trim();

  for (const key of keys) {
    const value = source?.[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }

  return "";
}

function getAssetSymbol(asset) {
  return pickString(asset, [
    "assetSymbol",
    "symbol",
    "assets",
    "asset",
    "currency",
    "coin",
    "ticker",
    "code",
  ]).toUpperCase();
}

function getAssetName(asset) {
  return pickString(asset, [
    "assetName",
    "name",
    "assetFullName",
    "fullName",
    "currencyName",
  ]);
}

function getCoinOptionsFromAssets(payload) {
  const seen = new Set(["all"]);
  const options = [...coinOptions];

  getAssetList(payload).forEach((asset) => {
    const symbol = getAssetSymbol(asset);
    if (!symbol || seen.has(symbol.toLowerCase())) return;

    seen.add(symbol.toLowerCase());
    const name = getAssetName(asset);
    options.push({
      label: name && name.toUpperCase() !== symbol ? `${name} (${symbol})` : symbol,
      value: symbol,
    });
  });

  return options;
}

function getVerificationStatus(profileData = {}) {
  const explicitStatus =
    normalizeString(profileData.verificationStatus) ||
    normalizeString(profileData.kycStatus) ||
    normalizeString(profileData.kybStatus) ||
    normalizeString(profileData.status);

  if (explicitStatus) return explicitStatus;
  if (profileData.isVerified || profileData.verified) return "Verified";

  return "";
}

function mapProfileResponse(profileData = {}) {
  const splitName = splitFullName(profileData.fullName);
  const firstName =
    normalizeString(profileData.firstname) ||
    normalizeString(profileData.firstName) ||
    splitName.firstName;
  const lastName =
    normalizeString(profileData.lastname) ||
    normalizeString(profileData.lastName) ||
    splitName.lastName;
  const displayName =
    normalizeString(profileData.businessName) ||
    normalizeString(profileData.companyName) ||
    [firstName, lastName].filter(Boolean).join(" ");

  return {
    merchantId:
      normalizeString(profileData.merchantId) ||
      normalizeString(profileData.merchant_id) ||
      normalizeString(profileData.hashpayId) ||
      normalizeString(profileData._id) ||
      normalizeString(profileData.id),
    verificationStatus: getVerificationStatus(profileData),
    accountEmail: normalizeEmail(profileData.email),
    displayName,
    supportEmail:
      normalizeEmail(profileData.supportEmail) ||
      normalizeEmail(profileData.support_email),
    phone: profileData.phone ?? profileData.phoneNumber ?? "",
    country: getCountryOption(profileData.country),
    electronicCommunication: Boolean(
      profileData.electronicCommunication ?? profileData.emailNotifications,
    ),
    monthlyStatement: Boolean(profileData.monthlyStatement),
  };
}

function hasMerchantSettingsPayload(payload = {}) {
  const nestedPayload = payload?.data ?? payload?.result;

  if (nestedPayload !== undefined && nestedPayload !== null) {
    if (typeof nestedPayload !== "object") return Boolean(nestedPayload);
    return Object.keys(nestedPayload).length > 0;
  }

  return Object.keys(payload).some(
    (key) =>
      !["success", "message", "error"].includes(key) &&
      payload[key] !== undefined &&
      payload[key] !== null &&
      payload[key] !== "",
  );
}

function mapMerchantSettingsResponse(payload = {}, options = coinOptions) {
  return {
    ipnSecret: payload.ipnSecret ?? "",
    ipnUrl: payload.ipnUrl ?? "",
    statusEmail:
      payload.logEmail ?? payload.statusEmail ?? payload.emailStatus ?? "",
    callbackCoin: normalizeCoinOption(payload.depositCoin, options),
    signedPayloads: Boolean(
      payload.signedPayloads ?? payload.signedPayload ?? payload.signPayload,
    ),
    retryFailedCallbacks: Boolean(
      payload.retryFailedCallbacks ?? payload.retryCallbacks,
    ),
    notifyPaymentSubmitted: Boolean(payload.newpayment),
    notifyFundsReceived: Boolean(payload.fundreceive),
    notifyFundsSent: Boolean(payload.fundsend),
    notifyDepositReceived: Boolean(payload.depositreceived),
  };
}

function buildSecret() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  const bytes =
    typeof window !== "undefined" && window.crypto?.getRandomValues
      ? window.crypto.getRandomValues(new Uint8Array(22))
      : Array.from({ length: 22 }, () => Math.floor(Math.random() * 255));

  return `ipn_sec_${Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("")}`;
}

function FieldShell({ icon: Icon, title, description, children }) {
  return (
    <section className="rounded-[18px] border border-input-border bg-input-bg/45 p-4">
      <div className="mb-4 flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] bg-primary/10 text-primary-text">
          <Icon size={18} />
        </span>
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-theme-text">{title}</h3>
          {description ? (
            <p className="mt-1 text-sm leading-5 text-secondary-text">
              {description}
            </p>
          ) : null}
        </div>
      </div>
      {children}
    </section>
  );
}

function IpnSecretField({ value, onChange, onRegenerate }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-secondary-text" htmlFor="ipn-secret">
        IPN secret
      </label>
      <div className="flex min-h-11 w-full overflow-hidden rounded-full border border-input-border bg-input-bg text-theme-text transition-all duration-300 hover:bg-secondary-bg focus-within:border-theme-text">
        <div className="flex min-w-0 flex-1 items-center gap-3 px-4">
          <KeyRound size={16} className="shrink-0 text-secondary-text" />
          <input
            id="ipn-secret"
            type="text"
            value={value ?? ""}
            onChange={onChange}
            autoComplete="off"
            className="min-w-0 flex-1 bg-transparent py-2 font-mono text-sm text-theme-text outline-none placeholder:text-secondary-text/60"
          />
        </div>
        <div className="flex shrink-0 items-center gap-1 border-l border-input-border bg-primary-bg/70 px-1.5">
          <CopyButton
            value={value}
            label="Copy IPN secret"
            className="h-8 w-8"
          />
          <button
            type="button"
            onClick={onRegenerate}
            aria-label="Regenerate IPN secret"
            title="Regenerate IPN secret"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-input-border bg-primary-bg text-secondary-text transition hover:border-primary hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

function StatusPill({ children, tone = "success" }) {
  const toneClass =
    tone === "warning"
      ? "border-amber-400/25 bg-amber-400/10 text-amber-300"
      : tone === "info"
        ? "border-sky-400/25 bg-sky-400/10 text-sky-300"
        : "border-emerald-400/25 bg-emerald-400/10 text-emerald-300";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${toneClass}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {children}
    </span>
  );
}

function SummaryTile({ icon: Icon, label, value, tone = "primary", detail }) {
  const toneClass =
    tone === "green"
      ? "bg-emerald-400/10 text-emerald-300"
      : tone === "blue"
        ? "bg-sky-400/10 text-sky-300"
        : "bg-primary/10 text-primary-text";

  return (
    <article className="rounded-[18px] border border-input-border bg-card-bg p-4 shadow-[0_18px_42px_rgba(0,0,0,0.12)]">
      <div className="flex items-start gap-3">
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] ${toneClass}`}
        >
          <Icon size={18} />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-secondary-text">
            {label}
          </p>
          <p className="mt-1 truncate text-xs sm:text-base ffont-medium  sm:font-bold text-theme-text">
            {value}
          </p>
          {detail ? (
            <p className="mt-1 text-xs text-secondary-text">{detail}</p>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function TabButton({ tab, active, onClick }) {
  const Icon = tab.icon;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`relative min-h-[88px] overflow-hidden rounded-[18px] border p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 ${
        active
          ? "border-primary text-theme-text shadow-[0_18px_42px_rgba(75, 71, 255,0.18)]"
          : "border-input-border bg-card-bg text-secondary-text hover:border-primary/50 hover:text-theme-text"
      }`}
    >
      {active ? (
        <motion.span
          layoutId="merchantSettingsTab"
          className="absolute inset-0 -z-10 rounded-[18px] bg-primary/12"
          transition={{ type: "spring", stiffness: 360, damping: 32 }}
        />
      ) : null}

      <span className="flex items-center justify-between gap-4">
        <span className="flex min-w-0 items-center gap-3">
          <span
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] ${
              active
                ? "bg-primary text-white"
                : "bg-secondary-bg text-secondary-text"
            }`}
          >
            <Icon size={19} />
          </span>
          <span className="min-w-0">
            <span className="block text-xs font-bold uppercase tracking-[0.08em] text-secondary-text">
              {tab.eyebrow}
            </span>
            <span className="mt-1 block truncate text-base font-bold text-theme-text">
              {tab.label}
            </span>
          </span>
        </span>
        {active ? (
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-white">
            <Check size={14} strokeWidth={3} />
          </span>
        ) : null}
      </span>
    </button>
  );
}

function ToggleRow({ title, description, checked, onChange }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-[14px] border border-input-border bg-primary-bg/35 px-4 py-3">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-theme-text">{title}</p>
        {description ? (
          <p className="mt-1 text-xs leading-5 text-secondary-text">
            {description}
          </p>
        ) : null}
      </div>
      <Toggle checked={checked} onChange={onChange} ariaLabel={title} />
    </div>
  );
}

export default function Page() {
  const baseRoute = getAccountBaseRoute();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("merchant");
  const [basicSettings, setBasicSettings] = useState(defaultBasicSettings);
  const [merchantSettings, setMerchantSettings] = useState(
    defaultMerchantSettings,
  );
  const [coinOptionsState, setCoinOptionsState] = useState(coinOptions);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    tone: "success",
  });
  const [saving, setSaving] = useState(false);
  const [basicSaving, setBasicSaving] = useState(false);
  const [merchantSettingsSaveMode, setMerchantSettingsSaveMode] = useState("unknown");

  useEffect(() => {
    let mounted = true;

    const loadSettings = async () => {
      try {
        if (!baseRoute) return;

        const [merchantResult, profileResult, assetResult] = await Promise.allSettled([
          apiClient.get(`${baseRoute}/merchantsettings`),
          apiClient.post(`${baseRoute}/profile`),
          apiClient.post(`${baseRoute}/asset/list`, {}),
        ]);

        if (!mounted) return;

        let nextCoinOptions = coinOptions;

        if (assetResult.status === "fulfilled") {
          const assetPayload = assetResult.value?.data ?? {};
          if (assetPayload?.success === false) {
            console.warn("Asset list response was not successful:", assetPayload);
          } else {
            nextCoinOptions = getCoinOptionsFromAssets(assetPayload);
          }
        } else {
          console.warn(
            "Failed to load asset list for coin dropdown:",
            assetResult.reason,
          );
        }

        setCoinOptionsState(nextCoinOptions);

        if (profileResult.status === "fulfilled") {
          const profilePayload = profileResult.value?.data ?? {};
          if (profilePayload?.success === false) {
            console.warn("Profile response was not successful:", profilePayload);
          } else {
            const profileData = profilePayload?.result ?? profilePayload?.data ?? profilePayload;
            setBasicSettings((current) => ({
              ...current,
              ...mapProfileResponse(profileData),
            }));
          }
        } else {
          console.warn("Failed to load profile for settings:", profileResult.reason);
        }

        if (merchantResult.status === "fulfilled") {
          const merchantPayload = merchantResult.value?.data ?? {};
          if (merchantPayload?.success === false) {
            setMerchantSettingsSaveMode("unknown");
            const payload = getApiErrorPayload({ response: merchantResult.value });
            showSnackbar(
              payload?.message || "Failed to load merchant settings.",
              "error",
            );
          } else {
            const settingsPayload =
              merchantPayload?.data ?? merchantPayload?.result ?? merchantPayload;
            const hasSettings = hasMerchantSettingsPayload(merchantPayload);

            setMerchantSettingsSaveMode(hasSettings ? "update" : "unknown");

            if (hasSettings) {
              setMerchantSettings((current) => ({
                ...current,
                ...mapMerchantSettingsResponse(settingsPayload, nextCoinOptions),
              }));
              setBasicSettings((current) => ({
                ...current,
                merchantId: settingsPayload.merchantId ?? current.merchantId,
              }));
            }
          }
        } else if (merchantResult.reason?.response?.status === 404) {
          setMerchantSettingsSaveMode("create");
        } else {
          setMerchantSettingsSaveMode("unknown");
          const payload = getApiErrorPayload(merchantResult.reason);
          showSnackbar(
            payload?.message || "Failed to load merchant settings.",
            "error",
          );
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadSettings();

    return () => {
      mounted = false;
    };
  }, []);

  const activeTabMeta = useMemo(
    () => tabItems.find((tab) => tab.key === activeTab) || tabItems[0],
    [activeTab],
  );

  const updateBasic = (field, value) => {
    setBasicSettings((current) => ({ ...current, [field]: value }));
  };

  const updateMerchant = (field, value) => {
    setMerchantSettings((current) => ({ ...current, [field]: value }));
  };

  function showSnackbar(message, tone = "success") {
    setSnackbar({ open: true, message, tone });
  }

  const saveBasicSettings = async () => {
    try {
      setBasicSaving(true);

      const splitName = splitFullName(basicSettings.displayName);
      const formData = new FormData();
      formData.append("firstname", splitName.firstName);
      formData.append("lastname", splitName.lastName);
      formData.append("country", basicSettings.country?.label || "");

      if (basicSettings.phone) formData.append("phone", basicSettings.phone);
      if (basicSettings.displayName) {
        formData.append("businessName", basicSettings.displayName.trim());
      }
      if (basicSettings.supportEmail) {
        formData.append("supportEmail", basicSettings.supportEmail.trim());
      }
      formData.append(
        "electronicCommunication",
        String(basicSettings.electronicCommunication),
      );
      formData.append("monthlyStatement", String(basicSettings.monthlyStatement));

      const response = await apiClient.post(`${baseRoute}/update-profile`, formData);
      const payload = response.data;

      if (payload?.success === false) {
        showSnackbar(payload?.message || "Failed to save basic settings.", "error");
        return;
      }

      if (payload?.result) {
        setBasicSettings((current) => ({
          ...current,
          ...mapProfileResponse(payload.result),
          merchantId: current.merchantId,
        }));
      }

      showSnackbar(payload?.message || "Basic settings updated successfully.");
    } catch (error) {
      console.error("Failed to save basic settings:", error);
      const payload = getApiErrorPayload(error);
      showSnackbar(payload?.message || "Failed to save basic settings.", "error");
    } finally {
      setBasicSaving(false);
    }
  };

  const saveMerchantSettings = async () => {
    try {
      setSaving(true);

      const payload = {
        ipnSecret: merchantSettings.ipnSecret,
        ipnUrl: merchantSettings.ipnUrl,
        depositCoin: merchantSettings.callbackCoin?.value || "all",
        logEmail: merchantSettings.statusEmail,
        newpayment: merchantSettings.notifyPaymentSubmitted,
        fundreceive: merchantSettings.notifyFundsReceived,
        fundsend: merchantSettings.notifyFundsSent,
        depositreceived: merchantSettings.notifyDepositReceived,
      };

      if (merchantSettingsSaveMode === "unknown") {
        showSnackbar(
          "Could not confirm whether merchant settings already exist. Please reload and try again.",
          "error",
        );
        return;
      }

      const response = merchantSettingsSaveMode === "update"
        ? await apiClient.put(`${baseRoute}/merchantsettings`, payload)
        : await apiClient.post(`${baseRoute}/merchantsettings`, payload);
      const responsePayload = response.data;

      if (responsePayload?.success === false) {
        showSnackbar(
          responsePayload?.message || "Failed to save merchant settings.",
          "error",
        );
        return;
      }

      setMerchantSettingsSaveMode("update");
      showSnackbar(
        merchantSettingsSaveMode === "update"
          ? "Merchant settings updated successfully."
          : "Merchant settings created successfully.",
      );
    } catch (error) {
      console.error("Failed to save merchant settings:", error);
      const payload = getApiErrorPayload(error);
      showSnackbar(
        payload?.message || "Failed to save merchant settings.",
        "error",
      );
    } finally {
      setSaving(false);
    }
  };

  const regenerateSecret = () => {
    updateMerchant("ipnSecret", buildSecret());
    showSnackbar("IPN secret regenerated.");
  };

  const renderBasicSettings = () => (
    <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
      <FieldShell
        icon={Building2}
        title="Business profile"
        description="Primary merchant identity and account contact details."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Your merchant ID"
            value={basicSettings.merchantId}
            readOnly
            inputClassName="rounded-full font-mono text-sm"
            rightElement={
              <CopyButton
                value={basicSettings.merchantId}
                label="Copy merchant ID"
                className="h-8 w-8"
              />
            }
            rightElementClassName="absolute right-1.5 top-1/2 -translate-y-1/2"
          />
          <Input
            label="Account email"
            value={basicSettings.accountEmail}
            readOnly
            inputClassName="rounded-full"
            leftElement={<Mail size={16} />}
          />
          <Input
            label="Merchant display name"
            value={basicSettings.displayName}
            onChange={(event) => updateBasic("displayName", event.target.value)}
            inputClassName="rounded-full"
          />
          <Input
            label="Support email"
            value={basicSettings.supportEmail}
            onChange={(event) =>
              updateBasic("supportEmail", event.target.value)
            }
            inputClassName="rounded-full"
          />
          <Input
            label="Business phone"
            value={basicSettings.phone}
            onChange={(event) => updateBasic("phone", event.target.value)}
            inputClassName="rounded-full"
          />
          <Dropdown
            label="Country"
            value={basicSettings.country}
            options={countryOptions}
            searchable={false}
            onChange={(value) => updateBasic("country", value)}
          />
        </div>
      </FieldShell>

      <div className="space-y-4">
        <FieldShell
          icon={ShieldCheck}
          title="Verification"
          description="Verification controls are handled from Security."
        >
          <div className="flex items-center justify-between gap-3 rounded-[16px] border border-emerald-400/25 bg-emerald-400/10 p-4">
            <div>
              <p className="text-sm font-bold text-theme-text">
                Account KYB status
              </p>
              <p className="mt-1 text-sm text-secondary-text">
                Ready for live merchant activity
              </p>
            </div>
            <StatusPill>{basicSettings.verificationStatus || "Not available"}</StatusPill>
          </div>
        </FieldShell>

        <FieldShell
          icon={BellRing}
          title="Optional emails"
          description="Choose account-level communications."
        >
          <div className="space-y-3">
            <Checkbox
              checked={basicSettings.electronicCommunication}
              onChange={(value) =>
                updateBasic("electronicCommunication", value)
              }
              ariaLabel="Receive electronic communications"
              description="Receive electronic communications from Eco Banx."
              className="rounded-[14px] border border-input-border bg-primary-bg/35 p-3"
            />
            <Checkbox
              checked={basicSettings.monthlyStatement}
              onChange={(value) => updateBasic("monthlyStatement", value)}
              ariaLabel="Receive monthly merchant statement"
              description="Receive monthly merchant statement summaries."
              className="rounded-[14px] border border-input-border bg-primary-bg/35 p-3"
            />
          </div>
        </FieldShell>
      </div>

      <div className="xl:col-span-2 flex justify-end">
        <Button
          value={basicSaving ? "Saving..." : "Update basic settings"}
          variant="primary"
          className="h-11 border-0 px-5 text-white"
          rightIcon={<Save size={16} />}
          onClick={saveBasicSettings}
          disabled={basicSaving}
        />
      </div>
    </div>
  );

  const renderMerchantSettings = () => (
    <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
      <FieldShell
        icon={Webhook}
        title="IPN endpoint"
        description="Configure callback delivery for merchant payment events."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <IpnSecretField
            value={merchantSettings.ipnSecret}
            onChange={(event) =>
              updateMerchant("ipnSecret", event.target.value)
            }
            onRegenerate={regenerateSecret}
          />
          <Input
            label="IPN URL"
            value={merchantSettings.ipnUrl}
            onChange={(event) => updateMerchant("ipnUrl", event.target.value)}
            inputClassName="rounded-full"
            leftElement={<Globe2 size={16} />}
          />
          <Dropdown
            label="Callback deposit IPN coin/currency"
            value={merchantSettings.callbackCoin}
            options={coinOptionsState}
            searchable={false}
            onChange={(value) => updateMerchant("callbackCoin", value)}
          />
          <Input
            label="Status/log email"
            value={merchantSettings.statusEmail}
            onChange={(event) =>
              updateMerchant("statusEmail", event.target.value)
            }
            inputClassName="rounded-full"
            leftElement={<Mail size={16} />}
          />
        </div>
      </FieldShell>

      {/* <FieldShell
        icon={Settings2}
        title="Delivery controls"
        description="Fine tune callback signing and retry behavior."
      >
        <div className="space-y-3">
          <ToggleRow
            title="Signed IPN payloads"
            description="Attach a signature header to each callback."
            checked={merchantSettings.signedPayloads}
            onChange={(value) => updateMerchant("signedPayloads", value)}
          />
          <ToggleRow
            title="Retry failed callbacks"
            description="Automatically retry temporary callback failures."
            checked={merchantSettings.retryFailedCallbacks}
            onChange={(value) => updateMerchant("retryFailedCallbacks", value)}
          />
        </div>
      </FieldShell> */}

      <FieldShell
        icon={Mail}
        title="When to receive emails"
        description="Select merchant event notifications."
      >
        <div className="grid gap-3 md:grid-cols-2">
          <Checkbox
            checked={merchantSettings.notifyPaymentSubmitted}
            onChange={(value) =>
              updateMerchant("notifyPaymentSubmitted", value)
            }
            ariaLabel="Notify when a user submits a new payment"
            description="When a user submits a new payment to you."
            className="rounded-[14px] border border-input-border bg-primary-bg/35 p-3"
          />
          <Checkbox
            checked={merchantSettings.notifyFundsReceived}
            onChange={(value) => updateMerchant("notifyFundsReceived", value)}
            ariaLabel="Notify when funds are received"
            description="When funds have been received for a payment."
            className="rounded-[14px] border border-input-border bg-primary-bg/35 p-3"
          />
          <Checkbox
            checked={merchantSettings.notifyFundsSent}
            onChange={(value) => updateMerchant("notifyFundsSent", value)}
            ariaLabel="Notify when funds are sent"
            description="When funds for a payment have been sent to you."
            className="rounded-[14px] border border-input-border bg-primary-bg/35 p-3"
          />
          <Checkbox
            checked={merchantSettings.notifyDepositReceived}
            onChange={(value) => updateMerchant("notifyDepositReceived", value)}
            ariaLabel="Notify when a deposit is received"
            description="When a deposit is received on a deposit address."
            className="rounded-[14px] border border-input-border bg-primary-bg/35 p-3"
          />
        </div>
      </FieldShell>

      {/* <FieldShell
        icon={Link2}
        title="Callback health"
        description="Current delivery profile."
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3 rounded-[14px] border border-input-border bg-primary-bg/35 p-3">
            <span className="text-sm font-semibold text-theme-text">
              URL status
            </span>
            <StatusPill tone="info">Ready</StatusPill>
          </div>
          <div className="flex items-center justify-between gap-3 rounded-[14px] border border-input-border bg-primary-bg/35 p-3">
            <span className="text-sm font-semibold text-theme-text">
              Signing
            </span>
            <StatusPill>
              {merchantSettings.signedPayloads ? "Enabled" : "Off"}
            </StatusPill>
          </div>
        </div>
      </FieldShell> */}

      <div className="xl:col-span-2 flex justify-end">
        <Button
          value="Update merchant settings"
          variant="primary"
          className="h-11 border-0 px-5 text-white"
          rightIcon={<Save size={16} />}
          onClick={saveMerchantSettings}
          disabled={saving}
        />
      </div>
    </div>
  );

  if (loading) {
    return <Skeleton pageName="merchant" />;
  }

  return (
    <div className="space-y-6 pb-8">
      <MerchantToolPageHeader
        title="Merchant Settings"
        description="Manage merchant identity, callback delivery, IPN security, and notification routing."
        icon={Settings2}
      />

      <section className="grid gap-4 md:grid-cols-3">
        <SummaryTile
          icon={Copy}
          label="Merchant ID"
          value={basicSettings.merchantId || "Not available"}
          detail="Copy-ready account identifier"
        />
        <SummaryTile
          icon={CheckCircle2}
          label="Verification"
          value={basicSettings.verificationStatus || "Not available"}
          detail="Account can receive payments"
          tone="green"
        />
        <SummaryTile
          icon={CircleDollarSign}
          label="Callback currency"
          value={merchantSettings.callbackCoin?.label || "All coins"}
          detail="Applies to deposit IPN"
          tone="blue"
        />
      </section>

      {/* <section className="grid gap-3 sm:grid-cols-2">
        {tabItems.map((tab) => (
          <TabButton
            key={tab.key}
            tab={tab}
            active={activeTab === tab.key}
            onClick={() => setActiveTab(tab.key)}
          />
        ))}
      </section> */}

      <section className="space-y-5">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-primary-text">
              {activeTabMeta.eyebrow}
            </p>
            <h2 className="mt-1 text-xl font-bold text-theme-text">
              {activeTabMeta.label}
            </h2>
          </div>
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-input-border bg-input-bg px-3 py-1.5 text-xs font-semibold text-secondary-text">
            <Sparkles size={14} className="text-primary-text" />
            Smart merchant controls
          </span>
        </div>

        {activeTab === "basic"
          ? renderBasicSettings()
          : renderMerchantSettings()}
      </section>

      <Snackbar
        open={snackbar.open}
        message={snackbar.message}
        tone={snackbar.tone}
        onClose={() => setSnackbar({ open: false, message: "", tone: "success" })}
      />
    </div>
  );
}
