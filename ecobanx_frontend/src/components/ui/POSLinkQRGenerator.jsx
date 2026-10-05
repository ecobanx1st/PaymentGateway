"use client";

/* eslint-disable @next/next/no-img-element */
import Image from "next/image";
import { useMemo, useState } from "react";
import {
  Copy,
  CreditCard,
  Delete,
  Download,
  ExternalLink,
  QrCode,
  ReceiptText,
  RotateCcw,
} from "lucide-react";
import Button from "@/components/ui/button";
import Dropdown from "@/components/ui/dropdown";
import Input from "@/components/ui/input";
import MerchantToolPageHeader from "@/components/ui/MerchantToolPageHeader";
import Modal from "@/components/ui/Modal";
import Snackbar from "@/components/ui/Snackbar";
import Toggle from "@/components/ui/Toggle";
import { cryptoOptions, MERCHANT_BUTTON_ROUTES } from "@/lib/merchant-button-config";
import { createQrMatrix, drawQrToCanvas, qrMatrixToDataUrl } from "@/lib/qr-code";
import brandLogo from "@/components/assets/darklogo.png";

const POS_PAYMENT_ENDPOINT = "https://example.com/ecobanx/pos/checkout";
const ECO_BANX_LOGO_SRC = brandLogo.src;

const defaultForm = {
  merchantId: "a133a4b4474c84d5043e6cf97103b28e",
  paymentDescription: "Order Payment",
  initialAmount: "0.1",
  currency: "BTC",
  allowChangeCurrency: false,
};

const previewKeypadButtons = [
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "clear",
  "0",
  "backspace",
];

function formatDecimalInput(value) {
  return value.replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1");
}

function getSelectedCurrency(currency) {
  return cryptoOptions.find((option) => option.value === currency) || cryptoOptions[0];
}

function getValidationErrors(values) {
  const errors = {};
  const merchantId = values.merchantId.trim();
  const description = values.paymentDescription.trim();
  const amount = Number(values.initialAmount);

  if (!merchantId) errors.merchantId = "Merchant ID is required.";
  else if (merchantId.length > 64) errors.merchantId = "Merchant ID must be 64 characters or less.";

  if (!description) errors.paymentDescription = "Payment description is required.";
  else if (description.length > 64) errors.paymentDescription = "Description must be 64 characters or less.";

  if (!values.initialAmount.trim()) errors.initialAmount = "Initial amount is required.";
  else if (!Number.isFinite(amount) || amount < 0) errors.initialAmount = "Enter zero or a positive amount.";

  if (!cryptoOptions.some((option) => option.value === values.currency)) errors.currency = "Choose a currency.";

  return errors;
}

function buildPosPaymentLink(values) {
  const url = new URL(POS_PAYMENT_ENDPOINT);
  url.searchParams.set("merchant_id", values.merchantId.trim());
  url.searchParams.set("description", values.paymentDescription.trim());
  url.searchParams.set("amount", values.initialAmount.trim());
  url.searchParams.set("currency", values.currency);
  url.searchParams.set("allow_currency_change", values.allowChangeCurrency ? "1" : "0");
  return url.toString();
}

function safeQrFilename(description) {
  const slug = description
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);

  return `pos-payment-${slug || "checkout"}.png`;
}

function FieldRow({ label, fieldId, required = false, error = "", helper = "", children }) {
  return (
    <div data-pos-field={fieldId} className="grid gap-3 px-2 py-4 sm:grid-cols-[minmax(10rem,0.36fr)_minmax(0,1fr)_5rem] sm:items-start sm:px-0">
      <div className="pt-2 text-sm font-semibold text-theme-text">
        {label}
        {required ? <span className="ml-1 text-red-400">*</span> : null}
      </div>
      <div className="min-w-0 space-y-2">
        {children}
        {helper ? <p className="text-xs leading-5 text-secondary-text">{helper}</p> : null}
        {error ? <p className="text-xs font-semibold text-red-400">{error}</p> : null}
      </div>
      <div className="pt-2 text-sm font-semibold text-secondary-text sm:text-center">
        {required ? "Yes" : "No"}
      </div>
    </div>
  );
}

function AmountCurrencyInput({ amount, currency, error, onAmountChange, onCurrencyChange }) {
  return (
    <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_8rem]">
      <Input
        value={amount}
        onChange={(event) => onAmountChange(formatDecimalInput(event.target.value))}
        inputMode="decimal"
        inputClassName="rounded-full !border-0"
        error={error}
      />
      <Dropdown
        value={getSelectedCurrency(currency)}
        options={cryptoOptions}
        searchable={false}
        clearable={false}
        onChange={(option) => onCurrencyChange(option.value)}
        triggerClassName="!border-0"
      />
    </div>
  );
}

function formatPreviewAmount(values) {
  const amount = values.initialAmount.trim() || "0";
  return `${amount} ${values.currency}`;
}

function getMerchantPreviewName(merchantId) {
  const value = merchantId.trim();
  if (!value) return "Merchant";
  if (value.length <= 12) return value;
  return `${value.slice(0, 8)}...${value.slice(-4)}`;
}

function POSGeneratorEmulator({
  values,
  paymentMode,
  previewQrDataUrl,
  onPaymentModeChange,
}) {
  const amount = formatPreviewAmount(values);
  const description = values.paymentDescription.trim() || "Order Payment";
  const merchantName = getMerchantPreviewName(values.merchantId);

  return (
    <aside className="xl:sticky xl:top-6">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-theme-text">Live POS Preview</h2>
          <p className="text-sm text-secondary-text">Updates from the entered fields.</p>
        </div>
        <span className="rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase text-primary">
          Emulator
        </span>
      </div>

      <div className="mx-auto w-full max-w-[332px] rounded-lg border border-input-border bg-input-bg p-4">
        <div className="mx-auto w-full max-w-[292px] rounded-[28px] bg-[#202425] p-3 shadow-[0_26px_54px_rgba(0,0,0,0.26)]">
          <div className="mx-auto mb-3 h-24 w-[78%] rounded-lg border border-black/30 bg-[linear-gradient(180deg,#424646_0%,#252828_100%)] p-3 shadow-inner">
            <div className="flex h-full items-center justify-center rounded-md border border-black/50 bg-[radial-gradient(circle_at_50%_20%,rgba(255,255,255,0.1),transparent_58%),linear-gradient(180deg,#242928_0%,#0e1110_100%)] px-2">
              <div className="flex h-12 w-full max-w-[190px] items-center justify-center gap-2 rounded-full border border-white/10 bg-[#070908]/85 px-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_10px_24px_rgba(0,0,0,0.28)]">
                <span className="relative h-8 w-8 shrink-0 overflow-hidden rounded-md">
                  <img
                    src={ECO_BANX_LOGO_SRC}
                    alt="Eco Banx logo"
                    width={32}
                    height={32}
                    className="h-full w-full object-contain"
                  />
                </span>
                <span className="whitespace-nowrap text-lg font-black uppercase tracking-normal text-white">
                  HASH<span className="text-primary">PAY</span>
                </span>
              </div>
            </div>
          </div>

          <div className="mb-3 rounded-lg border border-black/50 bg-[#151819] p-2">
            <div className="h-2 rounded-full bg-[#d9d0bd] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.45)]" />
          </div>

          <div className="overflow-hidden rounded-lg border border-black/60 bg-input-bg shadow-inner">
            <div className="flex h-6 items-center justify-between bg-white px-2 text-[#111827]">
              <span className="h-2 w-5 rounded-sm border border-[#111827]/60">
                <span className="block h-full w-3 bg-[#111827]/70" />
              </span>
              <div className="flex items-end gap-0.5">
                {[1, 2, 3, 4].map((bar) => (
                  <span
                    key={bar}
                    className="w-0.5 bg-[#111827]/70"
                    style={{ height: `${bar * 2 + 3}px` }}
                  />
                ))}
              </div>
            </div>

            <div className="bg-input-bg">
              <div className="flex h-12 items-center justify-between border-b border-input-border px-3">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="relative h-8 w-8 shrink-0 overflow-hidden rounded-lg bg-white shadow-sm">
                    <img
                      src={ECO_BANX_LOGO_SRC}
                      alt="Eco Banx"
                      width={32}
                      height={32}
                      className="h-full w-full object-contain p-1"
                    />
                  </span>
                  <span className="truncate text-xs font-bold text-theme-text">
                    Eco Banx POS
                  </span>
                </div>
                <span className="rounded-full bg-primary/10 px-2 py-1 text-[10px] font-bold uppercase text-primary">
                  Live
                </span>
              </div>

              <div className="grid grid-cols-2 border-b border-input-border">
                <button
                  type="button"
                  onClick={() => onPaymentModeChange("qr")}
                  className={`flex h-10 items-center justify-center gap-2 text-xs font-bold uppercase transition ${
                    paymentMode === "qr"
                      ? "bg-primary text-white"
                      : "bg-primary/10 text-primary"
                  }`}
                >
                  <QrCode size={15} />
                  QR
                </button>
                <button
                  type="button"
                  onClick={() => onPaymentModeChange("card")}
                  className={`flex h-10 items-center justify-center gap-2 text-xs font-bold uppercase transition ${
                    paymentMode === "card"
                      ? "bg-primary text-white"
                      : "bg-primary/10 text-primary"
                  }`}
                >
                  <CreditCard size={15} />
                  Card
                </button>
              </div>

              {paymentMode === "qr" ? (
                <div
                  className="relative flex min-h-[272px] flex-col items-center justify-center overflow-hidden px-5 py-6 text-center text-white"
                  style={{ background: "var(--primary-gradient)" }}
                >
                  <div className="relative flex h-32 w-32 items-center justify-center">
                    <span className="pos-qr-scan-ring" />
                    {previewQrDataUrl ? (
                      <Image
                        src={previewQrDataUrl}
                        alt={`QR code for ${description}`}
                        width={112}
                        height={112}
                        unoptimized
                        className="relative rounded-lg border border-white/50 bg-white p-2 shadow-[0_16px_34px_rgba(0,0,0,0.2)]"
                      />
                    ) : (
                      <div className="relative flex h-28 w-28 items-center justify-center rounded-lg border border-white/50 bg-white/15 text-xs font-bold uppercase text-white">
                        QR
                      </div>
                    )}
                  </div>
                  <p className="mt-3 text-xs font-semibold uppercase text-white/90">
                    Scan to pay
                  </p>
                  <p className="mt-2 text-3xl font-light tracking-normal">
                    {amount}
                  </p>
                  <p className="mt-2 line-clamp-2 max-w-[200px] text-sm font-semibold text-white/85">
                    {description}
                  </p>
                </div>
              ) : (
                <div className="bg-input-bg">
                  <div className="min-h-[128px] px-4 py-4 text-right">
                    <div className="flex items-center justify-between gap-2 text-left">
                      <span className="inline-flex max-w-[138px] items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-[10px] font-bold uppercase text-primary">
                        <CreditCard size={12} />
                        <span className="truncate">Card sale</span>
                      </span>
                      <span className="truncate text-[10px] font-semibold text-secondary-text">
                        {merchantName}
                      </span>
                    </div>
                    <p className="mt-4 min-w-0 text-3xl font-light tracking-normal text-primary">
                      {amount}
                    </p>
                    <p className="mt-2 line-clamp-2 text-left text-xs font-semibold text-secondary-text">
                      {description}
                    </p>
                  </div>

                  <div className="grid grid-cols-3 border-t border-l border-input-border">
                    {previewKeypadButtons.map((key) => (
                      <button
                        type="button"
                        key={key}
                        aria-label={
                          key === "clear"
                            ? "Clear"
                            : key === "backspace"
                              ? "Delete"
                              : `Key ${key}`
                        }
                        title={
                          key === "clear"
                            ? "Clear"
                            : key === "backspace"
                              ? "Delete"
                              : key
                        }
                        className="flex h-12 items-center justify-center border-r border-b border-input-border bg-primary-bg text-lg font-medium text-theme-text transition hover:bg-primary/10 active:scale-[0.97]"
                      >
                        {key === "clear" ? <RotateCcw size={17} /> : null}
                        {key === "backspace" ? <Delete size={15} /> : null}
                        {key.length === 1 ? key : null}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3 grid gap-2 text-xs text-secondary-text sm:grid-cols-2 xl:grid-cols-1">
        <div className="rounded-lg border border-input-border bg-input-bg px-3 py-2">
          <span className="font-bold uppercase text-theme-text">Merchant</span>
          <p className="mt-1 truncate">{merchantName}</p>
        </div>
        <div className="rounded-lg border border-input-border bg-input-bg px-3 py-2">
          <span className="font-bold uppercase text-theme-text">Currency</span>
          <p className="mt-1">
            {values.allowChangeCurrency ? "Customer can change" : `${values.currency} locked`}
          </p>
        </div>
      </div>
    </aside>
  );
}

function LinkDisplay({ link, onCopy }) {
  return (
    <div className="rounded-[16px] bg-input-bg p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.08em] text-secondary-text">Generated link</p>
          <p className="mt-1 break-all font-mono text-xs leading-5 text-theme-text">{link}</p>
        </div>
        <button
          type="button"
          onClick={onCopy}
          aria-label="Copy generated POS link"
          title="Copy generated POS link"
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-input-border text-secondary-text transition hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
        >
          <Copy size={16} />
        </button>
      </div>
    </div>
  );
}

function GeneratedQrModal({ open, data, onClose, onCopy, onDownload, onOpenCheckout }) {
  if (!data) return null;

  return (
    <Modal
      open={open}
      title="POS Payment QR"
      description="Share this QR code or payment link with the in-person customer."
      onClose={onClose}
      className="max-w-4xl"
    >
      <div className="grid gap-5 lg:grid-rows-[0.7fr_1.3fr]">
        <section className="rounded-[18px] bg-card-bg p-5">
          <div className="flex min-h-[300px] items-center justify-center rounded-[16px] bg-white p-5">
            <img src={data.qrDataUrl} alt={`QR code for ${data.values.paymentDescription}`} className="h-auto w-full max-w-[280px]" />
          </div>
        </section>

        <section className="flex min-w-0 flex-col gap-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[16px] bg-card-bg p-4">
              <p className="text-xs font-bold uppercase tracking-[0.08em] text-secondary-text">Amount</p>
              <p className="mt-1 text-lg font-bold text-theme-text">{data.values.initialAmount} {data.values.currency}</p>
            </div>
            <div className="rounded-[16px] bg-card-bg p-4">
              <p className="text-xs font-bold uppercase tracking-[0.08em] text-secondary-text">Currency change</p>
              <p className="mt-1 text-lg font-bold text-theme-text">{data.values.allowChangeCurrency ? "Allowed" : "Locked"}</p>
            </div>
          </div>

          <div className="rounded-[16px] bg-card-bg p-4">
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-secondary-text">Payment</p>
            <p className="mt-1 text-base font-bold text-theme-text">{data.values.paymentDescription}</p>
            <p className="mt-2 break-all font-mono text-xs leading-5 text-secondary-text">Merchant: {data.values.merchantId}</p>
          </div>

          <LinkDisplay link={data.link} onCopy={onCopy} />

          <div className="grid gap-3 sm:grid-cols-2">
            <Button value="Copy Link" icon={<Copy size={16} />} onClick={onCopy} className="w-full text-theme-text" />
            <Button value="Download QR" icon={<Download size={16} />} onClick={onDownload} className="w-full text-theme-text" />
            <Button value="Open Checkout" variant="primary" icon={<ExternalLink size={16} />} onClick={onOpenCheckout} className="w-full border-0 text-white" />
            <Button value="Close" onClick={onClose} className="w-full text-theme-text" />
          </div>
        </section>
      </div>
    </Modal>
  );
}

export default function POSLinkQRGenerator() {
  const [values, setValues] = useState(defaultForm);
  const [errors, setErrors] = useState({});
  const [generated, setGenerated] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [previewMode, setPreviewMode] = useState("qr");
  const [snackbar, setSnackbar] = useState({ open: false, message: "", tone: "success" });
  const currentErrors = useMemo(() => getValidationErrors(values), [values]);
  const isFormValid = Object.keys(currentErrors).length === 0;
  const livePaymentLink = useMemo(() => buildPosPaymentLink(values), [values]);
  const previewQrDataUrl = useMemo(() => {
    try {
      return qrMatrixToDataUrl(createQrMatrix(livePaymentLink), 4, 3);
    } catch {
      return "";
    }
  }, [livePaymentLink]);

  const setField = (field, value) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
  };

  const focusField = (field) => {
    const node = document.querySelector(`[data-pos-field="${field}"]`);
    if (!node) return;
    node.scrollIntoView({ behavior: "smooth", block: "center" });
    const focusable = node.querySelector("input, button");
    window.setTimeout(() => focusable?.focus({ preventScroll: true }), 250);
  };

  const showSnackbar = (message, tone = "success") => {
    setSnackbar({ open: true, message, tone });
  };

  const handleGenerate = () => {
    if (generating) return;

    setGenerating(true);
    const nextErrors = getValidationErrors(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length) {
      focusField(Object.keys(nextErrors)[0]);
      showSnackbar("Please fix the highlighted fields before generating the QR.", "error");
      setGenerating(false);
      return;
    }

    try {
      const link = buildPosPaymentLink(values);
      const matrix = createQrMatrix(link);
      setGenerated({ link, matrix, qrDataUrl: qrMatrixToDataUrl(matrix), values: { ...values } });
      setModalOpen(true);
    } catch (error) {
      showSnackbar(error?.message || "Unable to generate POS QR.", "error");
    } finally {
      setGenerating(false);
    }
  };

  const copyLink = async () => {
    if (!generated?.link) return;

    try {
      await navigator.clipboard.writeText(generated.link);
      showSnackbar("POS link copied.");
    } catch {
      showSnackbar("Unable to copy the POS link.", "error");
    }
  };

  const downloadQr = () => {
    if (!generated?.matrix) return;

    const canvas = document.createElement("canvas");
    drawQrToCanvas(canvas, generated.matrix, 12, 4);
    canvas.toBlob((blob) => {
      if (!blob) {
        showSnackbar("Unable to prepare the QR download.", "error");
        return;
      }

      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = safeQrFilename(generated.values.paymentDescription);
      anchor.click();
      URL.revokeObjectURL(url);
      showSnackbar("QR code downloaded.");
    }, "image/png");
  };

  const openCheckout = () => {
    if (!generated?.link) return;
    const opened = window.open(generated.link, "_blank", "noopener,noreferrer");
    if (opened) opened.opener = null;
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 pb-8">
      <MerchantToolPageHeader
        title="POS Link & QR Generator"
        description="Create a checkout link and QR code for in-person payments using the merchant POS flow."
        icon={QrCode}
      />

      <section className="rounded-[24px] border border-input-border bg-primary-bg p-4 shadow-[0_20px_50px_rgba(8,19,12,0.08)] sm:p-6 lg:p-8">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-start">
          <div className="overflow-hidden rounded-[18px] bg-card-bg">
            <div className="grid grid-cols-[minmax(9rem,0.36fr)_minmax(0,1fr)_5rem] border-b border-input-border bg-primary px-4 py-3 text-sm font-bold text-white sm:px-5">
              <span>Item</span>
              <span>Value</span>
              <span className="text-center">Required?</span>
            </div>

            <div className="divide-y divide-input-border/60 px-3 py-2 sm:px-5 sm:py-3">
              <FieldRow label="Merchant ID" required error={errors.merchantId} helper="You can find this on your My Account page. If logged in, this can be filled automatically later." fieldId="merchantId">
                <Input
                  value={values.merchantId}
                  onChange={(event) => setField("merchantId", event.target.value)}
                  maxLength={64}
                  inputClassName="rounded-full !border-0 font-mono text-sm"
                />
              </FieldRow>

              <FieldRow label="Payment Description" required error={errors.paymentDescription} fieldId="paymentDescription">
                <Input
                  value={values.paymentDescription}
                  onChange={(event) => setField("paymentDescription", event.target.value)}
                  maxLength={64}
                  inputClassName="rounded-full !border-0"
                />
              </FieldRow>

              <FieldRow label="Initial Amount" required error={errors.initialAmount || errors.currency} fieldId="initialAmount">
                <AmountCurrencyInput
                  amount={values.initialAmount}
                  currency={values.currency}
                  onAmountChange={(value) => setField("initialAmount", value)}
                  onCurrencyChange={(value) => setField("currency", value)}
                />
              </FieldRow>

              <FieldRow label="Allow Customer to Change Currency" fieldId="allowChangeCurrency">
                <div className="flex items-center gap-3 rounded-[16px] bg-input-bg px-4 py-3">
                  <Toggle
                    checked={values.allowChangeCurrency}
                    onChange={(value) => setField("allowChangeCurrency", value)}
                    ariaLabel="Allow customer to change currency"
                  />
                  <span className="text-sm text-secondary-text">
                    {values.allowChangeCurrency ? "Customer can choose another supported currency." : "Customer pays with the selected currency."}
                  </span>
                </div>
              </FieldRow>
            </div>

            <div className="flex flex-col items-center gap-4 px-4 py-7">
              <Button
                value={generating ? "Generating..." : "Generate QR"}
                variant="primary"
                disabled={generating || !isFormValid}
                icon={<QrCode size={17} />}
                onClick={handleGenerate}
                className="w-full max-w-3xl border-0 text-white"
              />
              <p className="flex items-center gap-2 text-center text-sm leading-6 text-secondary-text">
                <ReceiptText size={16} className="shrink-0 text-primary-text" />
                The generated URL uses a placeholder checkout endpoint until the backend POS route is connected.
              </p>
            </div>
          </div>

          <POSGeneratorEmulator
            values={values}
            paymentMode={previewMode}
            previewQrDataUrl={previewQrDataUrl}
            onPaymentModeChange={setPreviewMode}
          />
        </div>
      </section>

      <GeneratedQrModal
        open={modalOpen}
        data={generated}
        onClose={() => setModalOpen(false)}
        onCopy={copyLink}
        onDownload={downloadQr}
        onOpenCheckout={openCheckout}
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
