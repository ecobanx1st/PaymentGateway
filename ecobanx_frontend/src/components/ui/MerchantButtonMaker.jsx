"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { BadgeDollarSign, CalendarDays } from "lucide-react";
import brandLogo from "@/components/assets/darklogo.png";
import Button from "@/components/ui/button";
import Checkbox from "@/components/ui/Checkbox";
import Dropdown from "@/components/ui/dropdown";
import Input from "@/components/ui/input";
import MerchantToolPageHeader from "@/components/ui/MerchantToolPageHeader";
import Snackbar from "@/components/ui/Snackbar";
import Skeleton from "@/components/ui/skeleton";
import {
  CurrencyField,
  FormActionBar,
  GeneratedCodeModal,
  ImageUploadField,
  MerchantFieldRow,
  MerchantToolFormLayout,
  MerchantToolSection,
  RequiredFieldControl,
} from "@/components/ui/MerchantToolForm";
import {
  buildInitialRequiredFields,
  buildInitialValues,
  copyHtmlToClipboard,
  downloadHtmlFile,
  fileToDataUrl,
  generatePaymentButtonHtml,
  getOption,
  validateMerchantButtonForm,
} from "@/lib/merchant-button-utils";
import apiClient from "@/lib/axiosInterceptor";
import { getStoredUserUniqueId } from "@/lib/auth";
import { getAccountBaseRoute } from "@/utils/accountRoutes";

const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
const ECO_BANX_LOGO_SRC = brandLogo.src || brandLogo;

const NAME_DISALLOWED = /[^a-zA-Z0-9 _-]/g;
const NAME_MAX = 20;

const DESCRIPTION_DISALLOWED = /[^a-zA-Z0-9 _-]/g;
const DESCRIPTION_MAX = 100;

const URL_DISALLOWED = /[^a-zA-Z0-9 :/._~?#[\]@!$&'()*+,;=%-]/g;

const NUMBER_MAX_LENGTH = 20;

function sanitizeName(value) {
  return String(value ?? "")
    .replace(NAME_DISALLOWED, "")
    .slice(0, NAME_MAX);
}

function sanitizeDescription(value) {
  return String(value ?? "")
    .replace(DESCRIPTION_DISALLOWED, "")
    .slice(0, DESCRIPTION_MAX);
}

function sanitizeUrl(value) {
  return String(value ?? "").replace(URL_DISALLOWED, "");
}

function sanitizeNumberInput(value) {
  const cleaned = String(value ?? "")
    .replace(/[^0-9.]/g, "")
    .slice(0, NUMBER_MAX_LENGTH);
  const parts = cleaned.split(".");
  if (parts.length <= 1) return cleaned;
  return `${parts[0]}.${parts.slice(1).join("")}`;
}

const NAME_FIELD_IDS = new Set(["itemName", "donationName", "itemNumber", "invoice"]);
const DESCRIPTION_FIELD_IDS = new Set(["itemDescription", "donationDescription"]);
const URL_FIELD_IDS = new Set(["successUrl", "cancelUrl", "ipnUrl"]);


function formatDateForDisplay(value) {
  const stringValue = String(value || "").trim();
  const match = stringValue.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return stringValue;
  const [, year, month, day] = match;
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

function DatePickerTrigger({ value, label, onChange }) {
  const pickerRef = useRef(null);

  return (
    <>
      <button
        type="button"
        aria-label={`Open ${label || "date"} picker`}
        onClick={() => openNativeDatePicker(pickerRef.current)}
        className="flex h-10 w-10 items-center justify-center rounded-full text-secondary-text transition hover:text-primary-text"
      >
        <CalendarDays size={17} />
      </button>
      <input
        ref={pickerRef}
        type="date"
        value={String(value || "").match(/^\d{4}-\d{2}-\d{2}$/) ? value : ""}
        tabIndex={-1}
        aria-hidden="true"
        onChange={(event) => onChange(event.target.value)}
        className="pointer-events-none absolute h-px w-px opacity-0"
      />
    </>
  );
}

function buildButtonAppearance(config, values) {
  const appearance = config.buttonAppearance;

  if (appearance.mode === "asset") {
    return {
      text: appearance.text,
      iconDataUrl: appearance.iconDataUrl,
      displayIconSrc: ECO_BANX_LOGO_SRC,
      iconAlt: appearance.iconAlt,
    };
  }

  return {
    text: values[appearance.textField] || "Pay Now",
    iconDataUrl: values[appearance.imageDataUrlField] || appearance.fallbackIconDataUrl || "",
    displayIconSrc: values[appearance.imageDataUrlField] || ECO_BANX_LOGO_SRC,
    iconAlt: appearance.iconAlt || "",
  };
}

function PaymentButtonPreview({ appearance, disabled = false }) {
  return (
    <div className="min-w-0 rounded-[14px] bg-card-bg p-4">
      <button
        type="button"
        disabled={disabled}
        className="inline-flex min-h-12 w-full max-w-full flex-wrap items-center justify-center gap-x-3 gap-y-2 rounded-[10px] border-0 bg-[#0500FF] px-4 py-2.5 text-sm font-extrabold text-white shadow-[0_14px_32px_rgba(5,0,255,0.24)] transition hover:bg-[#0400CC] disabled:cursor-not-allowed disabled:opacity-60 sm:w-fit sm:flex-nowrap"
      >
        <span className="min-w-0 break-words text-center leading-tight">{appearance.text}</span>
        {(appearance.displayIconSrc || appearance.iconDataUrl) ? (
          <img
            src={appearance.displayIconSrc || appearance.iconDataUrl}
            alt=""
            className="h-[28px] w-[min(118px,42vw)] min-w-0 shrink object-contain sm:h-[31px] sm:w-[118px] sm:shrink-0"
          />
        ) : null}
      </button>
    </div>
  );
}

function AssetButtonControl({ field, checked, onChange, appearance }) {
  return (
    <label className="inline-flex w-full max-w-full cursor-pointer flex-wrap items-center justify-center gap-x-3 gap-y-2 rounded-[10px] bg-[#0500FF] px-4 py-3 text-white shadow-[0_14px_32px_rgba(5,0,255,0.24)] transition hover:bg-[#0400CC] focus-within:ring-2 focus-within:ring-primary/35 sm:w-fit sm:flex-nowrap">
      <input
        type="radio"
        name={`${field.id}-template`}
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 accent-primary"
        aria-label={`Use ${field.label}`}
      />
      <span className="min-w-0 break-words text-center text-sm font-bold leading-tight">{appearance.text}</span>
      <img
        src={appearance.displayIconSrc || appearance.iconDataUrl}
        alt={appearance.iconAlt}
        className="h-[28px] w-[min(118px,42vw)] min-w-0 shrink object-contain sm:h-[31px] sm:w-[118px] sm:shrink-0"
      />
    </label>
  );
}
export default function MerchantButtonMaker({ config }) {
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(() => {
    const values = buildInitialValues(config.sections);
    const storedUniqueId = getStoredUserUniqueId();
    if (storedUniqueId && !values.merchantId) values.merchantId = storedUniqueId;
    return {
      values,
      requiredFields: buildInitialRequiredFields(config.sections),
    };
  });
  const [errors, setErrors] = useState({});
  const [uploadErrors, setUploadErrors] = useState({});
  const [generatedHtml, setGeneratedHtml] = useState("");
  const [generatedPreviewHtml, setGeneratedPreviewHtml] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", tone: "success" });
  const [networkOptions, setNetworkOptions] = useState([]);
  const [networkLoading, setNetworkLoading] = useState(false);
  const [assetMap, setAssetMap] = useState({});
  const [depositLimits, setDepositLimits] = useState({});
  const [cryptoOptionsState, setCryptoOptionsState] = useState(null);
  const [converting, setConverting] = useState(false);
  const [rateText, setRateText] = useState("");
  const lastConvertKey = useRef("");
  const lastEditedRef = useRef(null);
  const generateButtonRef = useRef(null);
  const fieldRefs = useRef({});
  const valuesRef = useRef(form.values);

  useEffect(() => {
    valuesRef.current = form.values;
  }, [form.values]);

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 250);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const baseRoute = getAccountBaseRoute();
    if (!baseRoute) return undefined;

    const toSymbol = (v) => String(v || "").trim().toUpperCase();

    const loadProfileAndAssets = async () => {
      try {
        const profileRes = await apiClient.post(`${baseRoute}/profile`);
        const profileData =
          profileRes?.data?.result || profileRes?.data?.data || profileRes?.data?.user || {};
        const uniqueId =
          profileData?.userUniqueId || profileData?.unique_id || getStoredUserUniqueId();
        if (!cancelled && uniqueId) {
          if (typeof window !== "undefined") {
            window.localStorage.setItem("userUniqueId", uniqueId);
          }
          setForm((current) => ({
            ...current,
            values: { ...current.values, merchantId: uniqueId },
          }));
        }
      } catch {
        console.log("Failed to load merchant unique ID.");
      }

      setNetworkLoading(true);
      try {
        const assetRes = await apiClient.post(`${baseRoute}/asset/list`, {});
        const payload = assetRes?.data || {};
        const list = payload?.data || payload?.result || payload?.assets || [];
        const assets = Array.isArray(list) ? list : [];
        const map = {};
        const cryptoOptions = [];
        const allNetworks = new Map();
        const depositLimitsMap = {};
        assets.forEach((a) => {
          const symbol = toSymbol(a.assetSymbol || a.symbol);
          if (!symbol) return;
          const nets = (a.networks || [])
  .filter((n) => n && (n.networkId || n.network || n))
  .map((n) => {
    // Keep both the wrapper and the inner networkId.
    const wrapper = n;
    const networkId = n?.networkId || n?.network || n;
    const nsymbol = toSymbol(networkId?.networkSymbol || networkId?.symbol);
    const nname = String(networkId?.networkName || networkId?.name || nsymbol);

    if (nsymbol && !allNetworks.has(nsymbol)) {
      allNetworks.set(nsymbol, { label: `${nname} (${nsymbol})`, value: nsymbol });
    }

    // Read limits from the WRAPPER, not from networkId.
    const minDeposit = Number(
      wrapper.minDepositAmount ?? wrapper.minDeposit ?? 0
    ) || 0;
    const maxDeposit = Number(
      wrapper.maxDepositAmount ?? wrapper.maxDeposit ?? 0
    ) || 0;

    console.log("[asset-parse]", symbol, nsymbol, "min=", minDeposit, "max=", maxDeposit);

    if (minDeposit > 0 || maxDeposit > 0) {
      if (!depositLimitsMap[symbol]) depositLimitsMap[symbol] = {};
      depositLimitsMap[symbol][nsymbol] = { minDeposit, maxDeposit };
    }

    return { label: `${nname} (${nsymbol})`, value: nsymbol };
  })
  .filter((o) => o.value);
          map[symbol] = nets;
          cryptoOptions.push({
            label: `${String(a.assetName || a.name || symbol)} (${symbol})`,
            value: symbol,
          });
        });
        if (cancelled) return;
        setAssetMap(map);
        setDepositLimits(depositLimitsMap);
        if (cryptoOptions.length) setCryptoOptionsState(cryptoOptions);
        const firstAsset = cryptoOptions[0]?.value || "";
        const unionPool = [...allNetworks.values()];
        const poolFor = (assetSymbol) => {
          const nets = map[toSymbol(assetSymbol)] || [];
          return nets.length ? nets : unionPool;
        };
        const snapshot = valuesRef.current || {};
        const hasAssetField =
          snapshot.cryptoCurrency !== undefined || snapshot.requestAmount !== undefined;
        const effectiveAsset = hasAssetField ? snapshot.cryptoCurrency || firstAsset : "";
        const pool = hasAssetField ? poolFor(effectiveAsset) : unionPool;
        setNetworkOptions(pool);
        setForm((current) => {
          const next = { ...current.values };
          if (hasAssetField && !next.cryptoCurrency && firstAsset) {
            next.cryptoCurrency = firstAsset;
          }
          const resolvedPool = hasAssetField ? poolFor(next.cryptoCurrency) : unionPool;
          if (!next.network || !resolvedPool.some((o) => o.value === next.network)) {
            next.network = resolvedPool[0]?.value || "";
          }
          return { ...current, values: next };
        });
      } catch {
        if (!cancelled) {
          setAssetMap({});
          setDepositLimits({});
          setNetworkOptions([]);
        }
      } finally {
        if (!cancelled) setNetworkLoading(false);
      }
    };

    loadProfileAndAssets();
    return () => {
      cancelled = true;
    };
  }, []);

  const selectedAssetSymbol = String(form.values.cryptoCurrency || "").trim().toUpperCase();
  const hasAssetField = form.values.cryptoCurrency !== undefined;
  const visibleNetworkOptions = useMemo(() => {
    if (!Object.keys(assetMap).length) return networkOptions;
    if (hasAssetField && selectedAssetSymbol) return assetMap[selectedAssetSymbol] || [];
    return networkOptions;
  }, [assetMap, hasAssetField, selectedAssetSymbol, networkOptions]);

  const activeDepositLimits = useMemo(() => {
    const asset = String(form.values.cryptoCurrency || "").trim().toUpperCase();
    const net = String(form.values.network || "").trim().toUpperCase();
    if (!asset || !net) return null;
    return depositLimits[asset]?.[net] || null;
  }, [depositLimits, form.values.cryptoCurrency, form.values.network]);

  const toFixed8 = (value) => {
    const [intPart, fracPart = ""] = String(value).split(".");
    return `${intPart}.${(fracPart + "00000000").slice(0, 8)}`;
  };

  useEffect(() => {
    const fiatAmount = String(form.values.fiatAmount || "").trim();
    const fiatCurrency = String(form.values.fiatCurrency || "").trim().toUpperCase();
    const cryptoAmount = String(form.values.requestAmount || "").trim();
    const cryptoCurrency = String(form.values.cryptoCurrency || "").trim().toUpperCase();

    if (form.values.requestAmount === undefined || !cryptoCurrency) return undefined;

    const key = `${fiatAmount}|${fiatCurrency}|${cryptoAmount}|${cryptoCurrency}`;
    if (key === lastConvertKey.current) return undefined;

    if (Number(fiatAmount) <= 0 && Number(cryptoAmount) <= 0) return undefined;

    if (
      fiatAmount.length > NUMBER_MAX_LENGTH ||
      cryptoAmount.length > NUMBER_MAX_LENGTH
    ) {
      return undefined;
    }

    const baseRoute = getAccountBaseRoute();
    if (!baseRoute) return undefined;

    let cancelled = false;
    const timer = window.setTimeout(() => {
      if (cancelled) return;

      const toFiat = lastEditedRef.current === "crypto";
      const srcAmount = toFiat ? cryptoAmount : fiatAmount;
      const srcCurrency = toFiat ? cryptoCurrency : fiatCurrency;
      const dstCurrency = toFiat ? fiatCurrency : cryptoCurrency;
      const srcNumber = Number(srcAmount);

      if (!srcAmount || !Number.isFinite(srcNumber) || srcNumber <= 0 || !srcCurrency || !dstCurrency) {
        if (!srcAmount) setRateText("");
        return;
      }

      setConverting(true);
      apiClient
        .post(`${baseRoute}/price/convert`, {
          amount: srcAmount,
          currency1: srcCurrency,
          currency2: dstCurrency,
        })
        .then((res) => {
          if (cancelled) return;
          const result = res?.data?.result;
          if (res?.data?.success && result?.cryptoAmount) {
            const filled = toFixed8(result.cryptoAmount).slice(0, NUMBER_MAX_LENGTH);
            lastConvertKey.current = toFiat
              ? `${filled}|${fiatCurrency}|${cryptoAmount}|${cryptoCurrency}`
              : `${fiatAmount}|${fiatCurrency}|${filled}|${cryptoCurrency}`;
            lastEditedRef.current = null;
            if (toFiat) {
              setForm((current) => ({
                ...current,
                values: { ...current.values, fiatAmount: filled },
              }));
              setErrors((current) => ({ ...current, fiatAmount: "" }));
            } else {
              setForm((current) => ({
                ...current,
                values: { ...current.values, requestAmount: filled },
              }));
              setErrors((current) => ({ ...current, requestAmount: "" }));
            }
            setRateText(
              `1 ${result.fromCurrency} ≈ ${Number(result.rate).toFixed(8)} ${result.toCurrency}`
            );
          } else {
            setRateText("Rate unavailable — enter the amount manually.");
          }
        })
        .catch(() => {
          if (!cancelled) setRateText("Rate unavailable — enter the amount manually.");
        })
        .finally(() => {
          if (!cancelled) setConverting(false);
        });
    }, 600);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [form.values.fiatAmount, form.values.fiatCurrency, form.values.requestAmount, form.values.cryptoCurrency]);

  const handleAssetChange = (currencyId, option) => {
    const nextAsset = String(option?.value || "").trim().toUpperCase();
    setForm((current) => {
      const next = { ...current, values: { ...current.values, [currencyId]: option.value } };
      if (currencyId === "cryptoCurrency") {
        const nets = assetMap[nextAsset] || [];
        if (!nets.length) {
          next.values.network = "";
        } else if (!nets.some((o) => o.value === current.values.network)) {
          next.values.network = nets[0].value;
        }
      }
      return next;
    });
    setErrors((current) => ({ ...current, [currencyId]: "", network: "" }));
  };

  const showSnackbar = (message, tone = "success") => {
    setSnackbar({ open: true, message, tone });
  };

  const updateValue = (field, value) => {
    setForm((current) => ({
      ...current,
      values: { ...current.values, [field]: value },
    }));
    setErrors((current) => ({ ...current, [field]: "" }));
  };

  const updateRequired = (field, value) => {
    setForm((current) => ({
      ...current,
      requiredFields: { ...current.requiredFields, [field]: value },
    }));
  };

  const assignFieldRef = (fieldId) => (node) => {
    if (node) fieldRefs.current[fieldId] = node;
  };

  const focusField = (fieldId) => {
    const node = fieldRefs.current[fieldId];
    if (!node) return;
    node.scrollIntoView({ behavior: "smooth", block: "center" });
    const focusable = node.querySelector("input, button, textarea, select");
    window.setTimeout(() => focusable?.focus({ preventScroll: true }), 250);
  };

  const handleImageChange = async (field, file) => {
    updateValue(field.id, file);
    if (field.nameId) updateValue(field.nameId, file.name || "uploaded-image");

    try {
      const dataUrl = await fileToDataUrl(file);
      updateValue(field.dataUrlId, dataUrl);
      setUploadErrors((current) => ({ ...current, [field.id]: "" }));
    } catch {
      updateValue(field.dataUrlId, "");
      setUploadErrors((current) => ({ ...current, [field.id]: "Unable to read the selected image." }));
    }
  };

  const handleImageRemove = (field) => {
    updateValue(field.id, null);
    if (field.dataUrlId) updateValue(field.dataUrlId, "");
    if (field.nameId) updateValue(field.nameId, "");
    setUploadErrors((current) => ({ ...current, [field.id]: "" }));
  };

  const validate = () => {
    const nextErrors = validateMerchantButtonForm({
      sections: config.sections,
      values: form.values,
      requiredFields: form.requiredFields,
      uploadErrors,
    });

    ["fiatAmount", "requestAmount", "donationAmount"].forEach((id) => {
      const v = String(form.values[id] ?? "");
      if (v.length > NUMBER_MAX_LENGTH) {
        nextErrors[id] = `Amount is too long (max ${NUMBER_MAX_LENGTH} characters).`;
      }
    });

    if (activeDepositLimits) {
      const amountValue = Number(form.values.requestAmount);
      const { minDeposit, maxDeposit } = activeDepositLimits;
      if (Number.isFinite(amountValue)) {
        if (minDeposit > 0 && amountValue < minDeposit) {
          nextErrors.requestAmount = `Amount must be at least ${minDeposit} ${selectedAssetSymbol}.`;
        }
        if (maxDeposit > 0 && amountValue > maxDeposit) {
          nextErrors.requestAmount = `Amount must not exceed ${maxDeposit} ${selectedAssetSymbol}.`;
        }
      }
    }

    return nextErrors;
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    window.setTimeout(() => generateButtonRef.current?.querySelector("button")?.focus(), 0);
  };

  const handleGenerate = () => {
    if (generating) return;

    setGenerating(true);
    const nextErrors = validate();
    if (hasAssetField && visibleNetworkOptions.length && form.values.network &&
      !visibleNetworkOptions.some((o) => o.value === form.values.network)) {
      nextErrors.network = `${form.values.network} is not available for ${selectedAssetSymbol}. Pick another network.`;
    }
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length) {
      const [firstField] = Object.keys(nextErrors);
      focusField(firstField);
      showSnackbar("Please fix the highlighted fields before generating HTML.", "error");
      setGenerating(false);
      return;
    }

    const buttonAppearance = buildButtonAppearance(config, form.values);
    const checkoutPageUrl = typeof window !== "undefined" ? `${window.location.origin}/checkout/button` : "";
    const html = generatePaymentButtonHtml({
      title: config.title,
      endpoint: config.endpoint,
      checkoutPageUrl,
      sections: config.sections,
      values: form.values,
      requiredFields: form.requiredFields,
      buttonAppearance,
      toolType: config.toolType,
    });
    const previewHtml = generatePaymentButtonHtml({
      title: config.title,
      endpoint: config.endpoint,
      checkoutPageUrl,
      sections: config.sections,
      values: form.values,
      requiredFields: form.requiredFields,
      buttonAppearance,
      toolType: config.toolType,
      previewOnly: true,
    });

    setGeneratedHtml(html);
    setGeneratedPreviewHtml(previewHtml);
    setModalOpen(true);
    setGenerating(false);
  };

  const handleCopyCode = async () => {
    try {
      await copyHtmlToClipboard(generatedHtml);
      showSnackbar("HTML copied.");
    } catch {
      showSnackbar("Unable to copy HTML. Please try again.", "error");
    }
  };

  const handleDownloadHtml = () => {
    try {
      downloadHtmlFile(generatedHtml, config.downloadFilename);
      handleCloseModal();
      showSnackbar("HTML downloaded successfully.");
    } catch {
      showSnackbar("Unable to download HTML. Please try again.", "error");
    }
  };

  const renderRequiredControl = (field) => {
  if (field.requiredMode === "none") return null;

  if (field.systemRequired) {
    return (
      <RequiredFieldControl
        checked
        locked
        onChange={() => {}}
        label={`${field.label} is system required`}
      />
    );
  }

  return (
    <span className="text-xs font-semibold uppercase tracking-wide text-secondary-text">
      Optional
    </span>
  );
};

  const sanitizeForField = (field, rawValue) => {
    if (NAME_FIELD_IDS.has(field.id)) return sanitizeName(rawValue);
    if (DESCRIPTION_FIELD_IDS.has(field.id)) return sanitizeDescription(rawValue);
    if (URL_FIELD_IDS.has(field.id)) return sanitizeUrl(rawValue);
    if (field.type === "number") return sanitizeNumberInput(rawValue);
    return rawValue;
  };

  const maxLengthForField = (field) => {
    if (field.type === "date") return 10;
    if (NAME_FIELD_IDS.has(field.id)) return NAME_MAX;
    if (DESCRIPTION_FIELD_IDS.has(field.id)) return DESCRIPTION_MAX;
    if (field.type === "number") return NUMBER_MAX_LENGTH;
    return undefined;
  };

  const renderControl = (field) => {
    const { values } = form;
    const disabled = field.disabledWhen?.(values);

    switch (field.type) {
      case "currencyAmount": {
        const isAssetField = field.currencyId === "cryptoCurrency";
        const currencyOptions = isAssetField && cryptoOptionsState?.length
          ? cryptoOptionsState
          : field.currencyOptions;
        const selectedAsset = isAssetField ? String(values[field.currencyId] || "").trim().toUpperCase() : "";
        const isRequestAmount = field.id === "requestAmount";
        const limits = isRequestAmount ? activeDepositLimits : null;
        return (
          <div className="space-y-2">
            <CurrencyField
              amount={values[field.id]}
              currency={getOption(currencyOptions, values[field.currencyId])}
              options={currencyOptions}
              placeholder={field.placeholder}
              disabled={disabled}
              maxLength={NUMBER_MAX_LENGTH}
             onAmountChange={(value) => {
  if (field.id === "fiatAmount") lastEditedRef.current = "fiat";
  else if (field.id === "requestAmount") lastEditedRef.current = "crypto";

  const next = sanitizeNumberInput(value);

  // Write the raw value into state — do NOT clamp.
  setForm((current) => ({
    ...current,
    values: { ...current.values, [field.id]: next },
  }));

  // Live deposit-limit error for Request Amount.
  if (isRequestAmount) {
    let limitError = "";
    const num = Number(next);
    if (limits && next !== "" && Number.isFinite(num) && num > 0) {
      if (limits.minDeposit > 0 && num < limits.minDeposit) {
        limitError = `Minimum deposit is ${limits.minDeposit} ${selectedAsset}.`;
      } else if (limits.maxDeposit > 0 && num > limits.maxDeposit) {
        limitError = `Maximum deposit is ${limits.maxDeposit} ${selectedAsset}.`;
      }
    }
    setErrors((current) => ({ ...current, [field.id]: limitError }));
    return;
  }

  // All other fields just clear their error.
  setErrors((current) => ({ ...current, [field.id]: "" }));
}}
              onCurrencyChange={(option) => (
                isAssetField
                  ? handleAssetChange(field.currencyId, option)
                  : updateValue(field.currencyId, option.value)
              )}
            />
            {isAssetField && selectedAsset && Object.keys(assetMap).length > 0 && !(assetMap[selectedAsset] || []).length ? (
              <p className="text-xs leading-5 text-secondary-text">
                No networks are configured for {selectedAsset}. Pick another asset.
              </p>
            ) : null}
            {(field.id === "requestAmount" || field.id === "fiatAmount") && (converting || rateText) ? (
              <p className="text-xs leading-5 text-secondary-text">
                {converting ? "Converting…" : rateText}
              </p>
            ) : null}
            {isRequestAmount && limits && selectedAsset ? (
              <p className="text-xs leading-5 text-secondary-text">
                Deposit limits:{" "}
                {limits.minDeposit > 0 ? limits.minDeposit : "no minimum"} –{" "}
                {limits.maxDeposit > 0 ? limits.maxDeposit : "no maximum"} {selectedAsset}
              </p>
            ) : null}
          </div>
        );
      }

      case "select": {
        const isNetworkField = field.id === "network";
        const selectOptions = isNetworkField ? visibleNetworkOptions : (field.options || []);
        const selectedAsset = String(values.cryptoCurrency || "").trim().toUpperCase();
        if (!selectOptions.length) {
          return (
            <p className="text-xs leading-5 text-secondary-text">
              {isNetworkField
                ? (networkLoading
                  ? "Loading networks…"
                  : selectedAsset
                    ? `No networks found for ${selectedAsset}. Select another asset.`
                    : "Select an asset above to see its networks.")
                : "No options available."}
            </p>
          );
        }
        const selected = selectOptions.find((o) => o.value === values[field.id]) || selectOptions[0];
        return (
          <Dropdown
            value={selected}
            onChange={(option) => updateValue(field.id, option.value)}
            options={selectOptions}
            searchable={false}
            clearable={false}
            triggerClassName="!border-0"
          />
        );
      }

      case "checkbox":
        return (
          <Checkbox
            checked={Boolean(values[field.id])}
            onChange={(next) => updateValue(field.id, next)}
            ariaLabel={field.label}
            description={field.description}
            className="rounded-[14px] bg-primary-bg/35 p-3"
          />
        );

      case "textarea":
        return (
          <textarea
            value={values[field.id]}
            onChange={(event) => updateValue(field.id, sanitizeDescription(event.target.value))}
            placeholder={field.placeholder}
            disabled={disabled}
            maxLength={DESCRIPTION_MAX}
            className="min-h-24 w-full resize-y rounded-[18px] border-0 bg-input-bg px-4 py-3 text-sm leading-6 text-theme-text outline-none transition placeholder:text-secondary-text focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
          />
        );

      case "imageUpload":
        return (
          <ImageUploadField
            value={values[field.id]}
            maxSizeBytes={MAX_IMAGE_BYTES}
            onChange={(file) => handleImageChange(field, file)}
            onRemove={() => handleImageRemove(field)}
            onError={(message) => setUploadErrors((current) => ({ ...current, [field.id]: message }))}
            error={errors[field.id] || uploadErrors[field.id]}
          />
        );

      case "buttonPreview":
        return <PaymentButtonPreview appearance={buildButtonAppearance(config, values)} />;

      case "assetButton":
        return (
          <AssetButtonControl
            field={field}
            checked={values[field.id] === field.defaultValue}
            onChange={() => updateValue(field.id, field.defaultValue)}
            appearance={buildButtonAppearance(config, values)}
          />
        );

      default:
        return (
          <div className="space-y-2">
            <Input
              type="text"
              value={
                field.type === "date"
                  ? formatDateForDisplay(values[field.id])
                  : values[field.id]
              }
              onChange={(event) => {
                if (field.readOnly) return;

                if (field.type === "date") {
                  updateValue(field.id, normalizeDisplayDateInput(event.target.value));
                  return;
                }

                updateValue(field.id, sanitizeForField(field, event.target.value));
              }}
              placeholder={field.type === "date" ? "dd-mm-yyyy" : field.placeholder}
              inputMode={
                field.type === "number"
                  ? "decimal"
                  : field.type === "date"
                    ? "numeric"
                    : undefined
              }
              maxLength={maxLengthForField(field)}
              rightElement={
                field.type === "date" ? (
                  <DatePickerTrigger
                    value={values[field.id]}
                    label={field.label}
                    onChange={(nextValue) => updateValue(field.id, nextValue)}
                  />
                ) : null
              }
              rightElementClassName={
                field.type === "date"
                  ? "absolute right-1 top-1/2 -translate-y-1/2"
                  : ""
              }
              inputClassName="rounded-full !border-0"
              disabled={disabled || Boolean(field.readOnly)}
            />
            {disabled ? (
              <p className="text-xs leading-5 text-secondary-text">
                This value is preserved but disabled by the current configuration.
              </p>
            ) : null}
          </div>
        );
    }
  };

  if (loading) return <Skeleton pageName="merchant" />;

  return (
    <div className="space-y-6 pb-4">
      <MerchantToolPageHeader title={config.title} description={config.intro} icon={BadgeDollarSign} />

      <MerchantToolFormLayout>
        {config.sections.map((section) => (
          <MerchantToolSection key={section.title} title={section.title} description={section.description}>
            {section.fields.map((field) => (
              <MerchantFieldRow
                key={field.id}
                fieldId={field.id}
                label={field.label}
                description={field.description}
                error={errors[field.id]}
                requiredControl={renderRequiredControl(field)}
                rowRef={assignFieldRef(field.id)}
              >
                {renderControl(field)}
              </MerchantFieldRow>
            ))}
          </MerchantToolSection>
        ))}

        <FormActionBar>
          <div ref={generateButtonRef} className="w-full max-w-3xl">
            <Button
              value={generating ? "Generating..." : "Generate Button"}
              variant="primary"
              disabled={generating}
              onClick={handleGenerate}
              rightIcon={<BadgeDollarSign size={17} />}
              className="w-full border-0 text-white"
            />
          </div>
        </FormActionBar>
      </MerchantToolFormLayout>

      <GeneratedCodeModal
        open={modalOpen}
        html={generatedHtml}
        previewHtml={generatedPreviewHtml}
        onClose={handleCloseModal}
        onCopy={handleCopyCode}
        onDownload={handleDownloadHtml}
      />

      <Snackbar
        open={snackbar.open}
        message={snackbar.message}
        tone={snackbar.tone}
        onClose={() => setSnackbar({ open: false, message: "", tone: "success" })}
      />
    </div>
  );
}
