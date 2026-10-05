"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BadgeDollarSign,
  Link2,
  ReceiptText,
  ShieldCheck,
} from "lucide-react";
import Button from "@/components/ui/button";
import Checkbox from "@/components/ui/Checkbox";
import Dropdown from "@/components/ui/dropdown";
import Input from "@/components/ui/input";
import MerchantToolPageHeader from "@/components/ui/MerchantToolPageHeader";
import Snackbar from "@/components/ui/Snackbar";
import {
  buildCreateInvoiceTransactionPayload,
  buildInvoiceDetailUrl,
  defaultInvoiceValues,
  formatDecimalInput,
  getInvoiceBillSummary,
  invoiceFiatOptions,
  normalizeInvoiceValues,
  validateInvoiceValues,
} from "@/lib/invoice-maker";
import apiClient from "@/lib/axiosInterceptor";
import { getStoredUserUniqueId } from "@/lib/auth";
import { getAccountBaseRoute } from "@/utils/accountRoutes";

const NAME_DISALLOWED = /[^a-zA-Z0-9 _-]/g;
const NAME_MAX = 20;

const DESCRIPTION_DISALLOWED = /[^a-zA-Z0-9 _-]/g;
const DESCRIPTION_MAX = 100;

const URL_DISALLOWED = /[^a-zA-Z0-9 :/._~?#[\]@!$&'()*+,;=%-]/g;

const NUMBER_MAX_LENGTH = 20;

function sanitizeName(v) {
  return String(v ?? "").replace(NAME_DISALLOWED, "").slice(0, NAME_MAX);
}
function sanitizeDescription(v) {
  return String(v ?? "").replace(DESCRIPTION_DISALLOWED, "").slice(0, DESCRIPTION_MAX);
}
function sanitizeUrl(v) {
  return String(v ?? "").replace(URL_DISALLOWED, "");
}
function sanitizeNumberInput(v) {
  const cleaned = String(v ?? "")
    .replace(/[^0-9.]/g, "")
    .slice(0, NUMBER_MAX_LENGTH);
  const parts = cleaned.split(".");
  if (parts.length <= 1) return cleaned;
  return `${parts[0]}.${parts.slice(1).join("")}`;
}

function getOption(options, value) {
  return options.find((option) => option.value === value) || options[0];
}

/* ---------- field row (unchanged) ---------- */
function InvoiceFieldRow({ label, required = false, error = "", helper = "", children }) {
  return (
    <div className="grid gap-3 px-4 py-4 sm:px-5 lg:grid-cols-[minmax(11rem,0.8fr)_minmax(0,1.7fr)_5rem] lg:items-start lg:gap-6 lg:px-0">
      <div className="pt-2">
        <p className="text-sm font-semibold tracking-tight text-theme-text">
          {label}
          {required ? <span className="ml-1 text-red-400">*</span> : null}
        </p>
      </div>
      <div className="min-w-0 space-y-2">
        {children}
        {helper ? <p className="text-xs leading-5 text-secondary-text">{helper}</p> : null}
        {error ? (
          <p className="text-xs font-semibold text-red-400" role="alert">
            {error}
          </p>
        ) : null}
      </div>
      <div className="pt-2 text-sm font-semibold text-secondary-text lg:text-center">
        {required ? "Yes" : "Optional"}
      </div>
    </div>
  );
}

/* ---------- amount + currency row (unchanged) ---------- */
function AmountCurrencyField({
  amount,
  currency,
  options,
  error,
  maxLength,
  onAmountChange,
  onCurrencyChange,
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_7.5rem]">
      <Input
        value={amount}
        onChange={(event) => onAmountChange(event.target.value)}
        inputMode="decimal"
        maxLength={maxLength}
        rounded="rounded-full"
        inputClassName="!border-0"
        error={error}
      />
      <Dropdown
        value={getOption(options, currency)}
        options={options}
        searchable={false}
        clearable={false}
        onChange={(option) => onCurrencyChange(option.value)}
        triggerClassName="!border-0"
      />
    </div>
  );
}

/* ---------- preview (unchanged) ---------- */
function InvoiceDraftLine({ label, value, strong = false }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-200 py-2.5 text-sm">
      <span className="text-slate-500">{label}</span>
      <span
        className={
          strong
            ? "text-right font-black text-slate-950"
            : "text-right font-semibold text-slate-700"
        }
      >
        {value}
      </span>
    </div>
  );
}

function InvoiceLivePreview({ values }) {
  const summary = getInvoiceBillSummary(values);
  const normalized = summary.values;
  const shippingText = normalized.collectShippingAddress ? "Collect" : "Skip";
  const noteText = normalized.allowBuyerNote ? "Allowed" : "Off";

  return (
    <aside className="xl:sticky xl:top-6">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-theme-text">Invoice Preview</h2>
          <p className="text-sm text-secondary-text">Updates while you type.</p>
        </div>
        <span className="rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase text-primary">
          Draft
        </span>
      </div>

      <section className="rounded-[24px] border border-input-border bg-primary-bg p-3 shadow-[0_24px_70px_rgba(0,0,0,0.12)]">
        <div className="rounded-[18px] bg-white p-5 text-slate-950 ring-1 ring-black/5">
          <div className="flex items-start justify-between gap-4 border-b-2 border-slate-950 pb-4">
            <div>
              <p className="text-xl font-black tracking-[0.08em]">ECO BANX</p>
              <p className="mt-1 text-xs font-semibold text-slate-500">Merchant invoice</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black tracking-[0.08em]">INVOICE</p>
              <p className="mt-1 max-w-36 break-all text-xs font-semibold text-slate-500">
                {normalized.invoice || "INV-0001"}
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-[12px] border border-slate-200 bg-slate-50 p-3">
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">
                Bill from
              </p>
              <p className="mt-2 text-sm font-black">Eco Banx Merchant</p>
              <p className="mt-1 truncate text-xs text-slate-500">
                {normalized.merchantId}
              </p>
            </div>
            <div className="rounded-[12px] border border-slate-200 bg-slate-50 p-3">
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">
                Bill to
              </p>
              <p className="mt-2 text-sm font-black">{normalized.buyerName || "Customer / Buyer"}</p>
              <p className="mt-1 truncate text-xs text-slate-500">{normalized.buyerEmail || "At checkout"}</p>
            </div>
          </div>

          <div className="mt-4 overflow-hidden rounded-[12px] border border-slate-200">
            <div className="grid grid-cols-[minmax(0,1fr)_5rem] bg-slate-950 px-3 py-2 text-[10px] font-black uppercase tracking-[0.1em] text-white">
              <span>Description</span>
              <span className="text-right">Amount</span>
            </div>
            <div className="grid grid-cols-[minmax(0,1fr)_5rem] px-3 py-3 text-sm">
              <span className="line-clamp-2 pr-3 font-semibold text-slate-800">
                {normalized.requestDescription || "Add request description"}
              </span>
              <span className="text-right font-black text-slate-950">
                {summary.subtotalLabel}
              </span>
            </div>
          </div>

          <div className="mt-3 rounded-[12px] border border-slate-200 bg-slate-50 px-4 py-2">
            <InvoiceDraftLine label="Subtotal" value={summary.subtotalLabel} />
            <InvoiceDraftLine label="Tax" value={summary.taxLabel} />
            <InvoiceDraftLine label="Shipping" value={summary.shippingLabel} />
            <div className="mt-3 flex items-center justify-between gap-4 rounded-[12px] bg-slate-950 px-3 py-3 text-white">
              <span className="text-sm font-bold">Total due</span>
              <span className="text-lg font-black">{summary.totalLabel}</span>
            </div>
          </div>

          <div className="mt-4 rounded-[14px] border border-violet-100 bg-violet-50 p-4">
            <p className="text-[11px] font-black uppercase tracking-[0.14em] text-violet-600">
              Checkout request
            </p>
            <p className="mt-1 text-xl font-black text-slate-950">
              {summary.requestLabel}
            </p>
            <p className="mt-2 text-xs font-semibold text-slate-500">
              Shipping: {shippingText} / Buyer note: {noteText}
            </p>
          </div>
        </div>

        <div className="px-3 py-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-secondary-text">
            <ShieldCheck size={16} className="text-primary" />
            Checkout link is generated after validation.
          </div>
        </div>
      </section>
    </aside>
  );
}

/* ---------- main component ---------- */
export default function InvoiceMaker() {
  const router = useRouter();
  const [values, setValues] = useState(() => {
    const stored = getStoredUserUniqueId();
    return stored ? { ...defaultInvoiceValues, merchantId: stored } : defaultInvoiceValues;
  });
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState({ open: false, message: "", tone: "success" });
  const [generating, setGenerating] = useState(false);

  /* live price conversion states */
  const [converting, setConverting] = useState(false);
  const [rateText, setRateText] = useState("");
  const lastConvertKey = useRef("");
  const lastEditedRef = useRef(null);

  /* assets + limits, same API the button maker uses */
  const [assetMap, setAssetMap] = useState({});        // { SYMBOL: [{label,value}, ...] }
  const [depositLimits, setDepositLimits] = useState({}); // { SYMBOL: { NET: { min, max } } }
  const [cryptoOptions, setCryptoOptions] = useState([]); // [{label:"USDT (USDT)", value:"USDT"}]
  const [networkOptions, setNetworkOptions] = useState([]);
  const [networkLoading, setNetworkLoading] = useState(false);

  /* load assets */
  useEffect(() => {
    let cancelled = false;

    const baseRoute = getAccountBaseRoute();
    if (!baseRoute) return undefined;

    const toSymbol = (v) => String(v || "").trim().toUpperCase();

    const loadAssets = async () => {
      setNetworkLoading(true);
      try {
        const res = await apiClient.post(`${baseRoute}/asset/list`, {});
        const payload = res?.data || {};
        const list = payload?.data || payload?.result || payload?.assets || [];
        const assets = Array.isArray(list) ? list : [];

        const map = {};
        const limits = {};
        const cryptoOpts = [];
        const allNetworks = new Map();

        assets.forEach((a) => {
          const symbol = toSymbol(a.assetSymbol || a.symbol);
          if (!symbol) return;

          const nets = (a.networks || [])
            .filter((n) => n && (n.networkId || n.network || n))
            .map((wrapper) => {
              const networkId = wrapper?.networkId || wrapper?.network || wrapper;
              const nsymbol = toSymbol(networkId?.networkSymbol || networkId?.symbol);
              const nname = String(networkId?.networkName || networkId?.name || nsymbol);

              if (nsymbol && !allNetworks.has(nsymbol)) {
                allNetworks.set(nsymbol, {
                  label: `${nname} (${nsymbol})`,
                  value: nsymbol,
                });
              }

              const minDeposit =
                Number(wrapper.minDepositAmount ?? wrapper.minDeposit ?? 0) || 0;
              const maxDeposit =
                Number(wrapper.maxDepositAmount ?? wrapper.maxDeposit ?? 0) || 0;

              if (minDeposit > 0 || maxDeposit > 0) {
                if (!limits[symbol]) limits[symbol] = {};
                limits[symbol][nsymbol] = { minDeposit, maxDeposit };
              }

              return { label: `${nname} (${nsymbol})`, value: nsymbol };
            })
            .filter((o) => o.value);

          map[symbol] = nets;
          cryptoOpts.push({
            label: `${String(a.assetName || a.name || symbol)} (${symbol})`,
            value: symbol,
          });
        });

        if (cancelled) return;
        setAssetMap(map);
        setDepositLimits(limits);
        setCryptoOptions(cryptoOpts);

        // Default the crypto currency + network if not already set.
        const firstAsset = cryptoOpts[0]?.value || "";
        const pool = map[firstAsset] || [...allNetworks.values()];
        setNetworkOptions(pool);

        setValues((current) => {
          const next = { ...current };
          if (!next.requestCurrency && firstAsset) next.requestCurrency = firstAsset;
          if (!next.network && pool[0]?.value) next.network = pool[0].value;
          return next;
        });
      } catch {
        if (!cancelled) {
          setAssetMap({});
          setDepositLimits({});
          setCryptoOptions([]);
          setNetworkOptions([]);
        }
      } finally {
        if (!cancelled) setNetworkLoading(false);
      }
    };

    loadAssets();
    return () => {
      cancelled = true;
    };
  }, []);

  /* visible networks for the selected crypto */
  const selectedCrypto = String(values.requestCurrency || "").trim().toUpperCase();
  const visibleNetworkOptions = useMemo(() => {
    if (assetMap[selectedCrypto]) return assetMap[selectedCrypto];
    return networkOptions;
  }, [assetMap, selectedCrypto, networkOptions]);

  /* active deposit limits */
  const activeDepositLimits = useMemo(() => {
    const asset = selectedCrypto;
    const net = String(values.network || "").trim().toUpperCase();
    if (!asset || !net) return null;
    return depositLimits[asset]?.[net] || null;
  }, [depositLimits, selectedCrypto, values.network]);

  /* normalized preview + validation used by the preview card */
  const normalizedValues = useMemo(
    () => normalizeInvoiceValues({ ...values, currency: values.currency || "USD" }),
    [values]
  );

  /* ---------------- live price conversion ---------------- */
  const toFixed8 = (value) => {
    const [intPart, fracPart = ""] = String(value).split(".");
    return `${intPart}.${(fracPart + "00000000").slice(0, 8)}`;
  };

  useEffect(() => {
    const fiatAmount = String(values.amount || "").trim();
    const fiatCurrency = String(values.currency || "USD").trim().toUpperCase();
    const cryptoAmount = String(values.requestAmount || "").trim();
    const cryptoCurrency = String(values.requestCurrency || "").trim().toUpperCase();

    if (!cryptoCurrency) return undefined;

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
              setValues((current) => ({
                ...current,
                amount: filled,
              }));
              setErrors((current) => ({ ...current, amount: "" }));
            } else {
              setValues((current) => ({
                ...current,
                requestAmount: filled,
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
  }, [values.amount, values.currency, values.requestAmount, values.requestCurrency]);

  /* ---------------- sanitize on change ---------------- */
  const updateValue = (field, value) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
  };

  const handleAmountChange = (field, raw) => {
    if (field === "amount") lastEditedRef.current = "fiat";
    else if (field === "requestAmount") lastEditedRef.current = "crypto";

    const next = sanitizeNumberInput(raw);

    // Live deposit-limit error for Request Amount.
    if (field === "requestAmount" && activeDepositLimits) {
      const num = Number(next);
      let limitError = "";
      if (Number.isFinite(num) && num > 0) {
        const { minDeposit, maxDeposit } = activeDepositLimits;
        if (minDeposit > 0 && num < minDeposit) {
          limitError = `Minimum deposit is ${minDeposit} ${selectedCrypto}.`;
        } else if (maxDeposit > 0 && num > maxDeposit) {
          limitError = `Maximum deposit is ${maxDeposit} ${selectedCrypto}.`;
        }
      }
      setValues((current) => ({ ...current, [field]: next }));
      setErrors((current) => ({ ...current, [field]: limitError }));
      return;
    }

    setValues((current) => ({ ...current, [field]: next }));
    setErrors((current) => ({ ...current, [field]: "" }));
  };

  const handleNameChange = (field, raw) => {
    updateValue(field, sanitizeName(raw));
  };

  const handleDescriptionChange = (field, raw) => {
    updateValue(field, sanitizeDescription(raw));
  };

  const handleUrlChange = (field, raw) => {
    updateValue(field, sanitizeUrl(raw));
  };

  /* ---------------- submit: call create_invoice_transaction (save-only) ---------------- */
  const handleGenerate = async () => {
    if (generating) return;

    const nextErrors = validateInvoiceValues(values);
    if (
      visibleNetworkOptions.length &&
      values.network &&
      !visibleNetworkOptions.some((o) => o.value === values.network)
    ) {
      nextErrors.network = `${values.network} is not available for ${selectedCrypto}. Pick another network.`;
    }

    if (activeDepositLimits) {
      const amountValue = Number(values.requestAmount);
      const { minDeposit, maxDeposit } = activeDepositLimits;
      if (Number.isFinite(amountValue)) {
        if (minDeposit > 0 && amountValue < minDeposit) {
          nextErrors.requestAmount = `Amount must be at least ${minDeposit} ${selectedCrypto}.`;
        } else if (maxDeposit > 0 && amountValue > maxDeposit) {
          nextErrors.requestAmount = `Amount must not exceed ${maxDeposit} ${selectedCrypto}.`;
        }
      }
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length) {
      setToast({
        open: true,
        message: "Please fix the highlighted invoice fields.",
        tone: "error",
      });
      return;
    }

    const baseRoute = getAccountBaseRoute();
    if (!baseRoute) {
      setToast({
        open: true,
        message: "Merchant account session not found. Please log in again.",
        tone: "error",
      });
      return;
    }

    setGenerating(true);
    try {
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      // Save-only: no address/wallet/QR/timer is generated here.
      const payload = buildCreateInvoiceTransactionPayload(values, origin);

      const res = await apiClient.post(`${baseRoute}/create_invoice_transaction`, payload);
      const data = res?.data;

      if (!data?.success || !data?.result) {
        throw new Error(data?.message || "Failed to create invoice transaction.");
      }

      const invoiceId =
        data.result.invoiceId ||
        data.result.invoice?._id ||
        data.result.invoice?.txnId ||
        data.result.txn_id;
      if (!invoiceId) {
        throw new Error("Invoice was created but no invoiceId was returned.");
      }

      setToast({
        open: true,
        message: "Invoice saved successfully! Opening invoice page...",
        tone: "success",
      });

      // Eco Banx Invoice flow: /invoice/:invoiceId (no address yet).
      router.push(buildInvoiceDetailUrl(invoiceId));
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to create invoice transaction.";
      setToast({
        open: true,
        message: msg,
        tone: "error",
      });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6 pb-4">
      <MerchantToolPageHeader
        title="Payment Request Invoice Maker"
        description="Create a shareable invoice preview and checkout link for a customer payment request."
        icon={ReceiptText}
      />

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.65fr)]">
        <div className="rounded-[24px] border border-input-border bg-primary-bg p-4 shadow-[0_22px_70px_rgba(0,0,0,0.08)] sm:p-6">
          <div className="mb-5 flex flex-col gap-4 border-b border-input-border pb-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h2 className="text-xl font-black text-theme-text">Invoice fields</h2>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-secondary-text">
                Fill the request fields, generate an invoice page, then copy or open
                the checkout URL from the preview.
              </p>
            </div>
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-input-border bg-input-bg px-3 py-1.5 text-xs font-bold text-secondary-text">
              <Link2 size={14} className="text-primary" />
              Checkout ready
            </span>
          </div>

          <div className="hidden grid-cols-[minmax(11rem,0.8fr)_minmax(0,1.7fr)_5rem] gap-6 rounded-full border border-input-border bg-input-bg px-5 py-4 text-sm font-bold text-secondary-text lg:grid">
            <span>Item</span>
            <span>Value</span>
            <span className="text-center">Required?</span>
          </div>

          <div className="divide-y divide-input-border/70 lg:px-5">
            <InvoiceFieldRow label="Merchant ID" required error={errors.merchantId}>
              <Input
                value={normalizedValues.merchantId}
                onChange={(event) => handleNameChange("merchantId", event.target.value)}
                rounded="rounded-full"
                inputClassName="!border-0"
                maxLength={NAME_MAX}
                disabled
              />
            </InvoiceFieldRow>

            <InvoiceFieldRow label="Amount in Currency" required error={errors.amount}>
              <AmountCurrencyField
                amount={normalizedValues.amount}
                currency={normalizedValues.currency}
                options={invoiceFiatOptions}
                maxLength={NUMBER_MAX_LENGTH}
                onAmountChange={(value) => handleAmountChange("amount", value)}
                onCurrencyChange={(value) => updateValue("currency", value)}
              />
              {(converting || rateText) ? (
                <p className="text-xs leading-5 text-secondary-text">
                  {converting ? "Converting…" : rateText}
                </p>
              ) : null}
            </InvoiceFieldRow>

            <InvoiceFieldRow
              label="Request Amount"
              required
              error={errors.requestAmount}
              helper={
                activeDepositLimits
                  ? `Deposit limits: ${
                      activeDepositLimits.minDeposit > 0
                        ? activeDepositLimits.minDeposit
                        : "no minimum"
                    } – ${
                      activeDepositLimits.maxDeposit > 0
                        ? activeDepositLimits.maxDeposit
                        : "no maximum"
                    } ${selectedCrypto || ""}`
                  : networkLoading
                  ? "Loading deposit limits…"
                  : ""
              }
            >
              <AmountCurrencyField
                amount={normalizedValues.requestAmount}
                currency={normalizedValues.requestCurrency}
                options={cryptoOptions}
                maxLength={NUMBER_MAX_LENGTH}
                onAmountChange={(value) => handleAmountChange("requestAmount", value)}
                onCurrencyChange={(value) => {
                  const next = String(value || "").trim().toUpperCase();
                  const pool = assetMap[next] || [];
                  setValues((current) => ({
                    ...current,
                    requestCurrency: value,
                    network: pool[0]?.value || current.network || "",
                  }));
                  setErrors((current) => ({
                    ...current,
                    requestCurrency: "",
                    requestAmount: "",
                  }));
                }}
              />
              {(converting || rateText) ? (
                <p className="text-xs leading-5 text-secondary-text">
                  {converting ? "Converting…" : rateText}
                </p>
              ) : null}
            </InvoiceFieldRow>

            <InvoiceFieldRow
              label="Network"
              required
              error={errors.network}
              helper="Select an asset above first — only networks available for that asset are shown here."
            >
              {visibleNetworkOptions.length ? (
                <Dropdown
                  value={
                    visibleNetworkOptions.find((o) => o.value === values.network) ||
                    visibleNetworkOptions[0]
                  }
                  options={visibleNetworkOptions}
                  searchable={false}
                  clearable={false}
                  onChange={(option) => updateValue("network", option.value)}
                  triggerClassName="!border-0"
                />
              ) : (
                <p className="text-xs leading-5 text-secondary-text">
                  {networkLoading ? "Loading networks…" : "Select an asset above to see its networks."}
                </p>
              )}
            </InvoiceFieldRow>

            <InvoiceFieldRow
              label="Request Description"
              required
              error={errors.requestDescription}
            >
              <textarea
                value={normalizedValues.requestDescription}
                onChange={(event) =>
                  handleDescriptionChange("requestDescription", event.target.value)
                }
                placeholder="Describe the goods, service, or payment reason."
                maxLength={DESCRIPTION_MAX}
                className="min-h-24 w-full resize-y rounded-[18px] border-0 bg-input-bg px-4 py-3 text-sm leading-6 text-theme-text outline-none transition placeholder:text-secondary-text/60 focus:ring-2 focus:ring-primary/20"
              />
            </InvoiceFieldRow>

            <InvoiceFieldRow label="Invoice" required error={errors.invoice}>
              <Input
                value={normalizedValues.invoice}
                onChange={(event) => handleNameChange("invoice", event.target.value)}
                placeholder="INV-2026-001"
                rounded="rounded-full"
                inputClassName="!border-0"
                maxLength={NAME_MAX}
              />
            </InvoiceFieldRow>

            {/* <InvoiceFieldRow label="Customer / Buyer Name" error={errors.buyerName}>
              <Input
                value={normalizedValues.buyerName}
                onChange={(event) => updateValue("buyerName", event.target.value)}
                placeholder="John Doe"
                rounded="rounded-full"
                inputClassName="!border-0"
                maxLength={NAME_MAX}
              />
            </InvoiceFieldRow>

            <InvoiceFieldRow label="Customer / Buyer Email" error={errors.buyerEmail}>
              <Input
                value={normalizedValues.buyerEmail}
                onChange={(event) => updateValue("buyerEmail", event.target.value)}
                placeholder="customer@example.com"
                type="email"
                rounded="rounded-full"
                inputClassName="!border-0"
              />
            </InvoiceFieldRow> */}

            <InvoiceFieldRow label="Tax Amount" error={errors.taxAmount}>
              <Input
                value={normalizedValues.taxAmount}
                onChange={(event) =>
                  updateValue("taxAmount", sanitizeNumberInput(event.target.value))
                }
                inputMode="decimal"
                rounded="rounded-full"
                inputClassName="!border-0"
                maxLength={NUMBER_MAX_LENGTH}
              />
            </InvoiceFieldRow>

            <InvoiceFieldRow label="Collect Shipping Address">
              <Checkbox
                checked={normalizedValues.collectShippingAddress}
                onChange={(checked) => updateValue("collectShippingAddress", checked)}
                ariaLabel="Collect shipping address"
                description="Ask checkout to collect the buyer shipping address."
                className="rounded-[16px] border border-input-border bg-input-bg p-3"
              />
            </InvoiceFieldRow>

            <InvoiceFieldRow label="Shipping Cost" error={errors.shippingCost}>
              <Input
                value={normalizedValues.shippingCost}
                onChange={(event) =>
                  updateValue("shippingCost", sanitizeNumberInput(event.target.value))
                }
                inputMode="decimal"
                rounded="rounded-full"
                inputClassName="!border-0"
                maxLength={NUMBER_MAX_LENGTH}
              />
            </InvoiceFieldRow>

            <InvoiceFieldRow
              label="IPN URL"
              error={errors.ipnUrl}
              helper="Leave blank to use your account default."
            >
              <Input
                value={normalizedValues.ipnUrl}
                onChange={(event) => handleUrlChange("ipnUrl", event.target.value)}
                placeholder="https://yourdomain.com/ipn"
                rounded="rounded-full"
                inputClassName="!border-0"
              />
            </InvoiceFieldRow>

            <InvoiceFieldRow label="Allow buyer to Leave a Note">
              <Checkbox
                checked={normalizedValues.allowBuyerNote}
                onChange={(checked) => updateValue("allowBuyerNote", checked)}
                ariaLabel="Allow buyer to leave a note"
                description="Let the buyer add an optional note during checkout."
                className="rounded-[16px] border border-input-border bg-input-bg p-3"
              />
            </InvoiceFieldRow>
          </div>

          <div className="mt-6 flex justify-center">
            <div className="w-full max-w-sm">
              <Button
                value={generating ? "Generating Link…" : "Generate Link"}
                variant="primary"
                disabled={generating}
                rightIcon={<BadgeDollarSign size={17} />}
                onClick={handleGenerate}
                className="w-full border-0 text-white"
              />
            </div>
          </div>
        </div>

        <InvoiceLivePreview values={values} />
      </section>

      <Snackbar
        open={toast.open}
        message={toast.message}
        tone={toast.tone}
        onClose={() => setToast((current) => ({ ...current, open: false }))}
      />
    </div>
  );
}
