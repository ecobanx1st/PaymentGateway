"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Delete,
  PlayCircle,
  QrCode,
  ReceiptText,
  RotateCcw,
  Settings2,
  ShieldCheck,
  Store,
  X,
} from "lucide-react";
import CopyButton from "@/components/ui/CopyButton";
import Dropdown from "@/components/ui/dropdown";
import Input from "@/components/ui/input";
import MerchantCard from "@/components/ui/MerchantCard";
import PageTopBanner from "@/components/ui/PageTopBanner";
import pay from "@/components/assets/Wallet/pay.png";
import api from "@/components/assets/Wallet/api.png";
import invoice from "@/components/assets/Wallet/invoice.png";
import point from "@/components/assets/Wallet/point-sale.png";
import brandLogo from "@/components/assets/darklogo.png";
import Skeleton from "@/components/ui/skeleton";
import { MERCHANT_BUTTON_ROUTES } from "@/lib/merchant-button-config";

const ECO_BANX_LOGO_SRC = brandLogo.src;

const merchantCategories = [
  {
    tourId: "merchant-tour-payment-buttons",
    title: "Payment Buttons",
    description:
      "Build quick payment entry points for checkout, product pages, donations, and lightweight hosted flows.",
    icon: pay,
    links: [
      {
        label: "Simple Button Maker",
        href: MERCHANT_BUTTON_ROUTES.simpleMaker,
      },
      {
        label: "Simple HTML POST Fields",
        href: MERCHANT_BUTTON_ROUTES.simplePostFields,
      },
      {
        label: "Simple Button Examples",
        href: MERCHANT_BUTTON_ROUTES.simpleExamples,
      },
      {
        label: "Advanced Button Maker",
        href: MERCHANT_BUTTON_ROUTES.advancedMaker,
      },
      {
        label: "Advanced HTML POST Fields",
        href: MERCHANT_BUTTON_ROUTES.advancedPostFields,
      },
      {
        label: "Advanced Button Examples",
        href: MERCHANT_BUTTON_ROUTES.advancedExamples,
      },
      {
        label: "Donation Button Maker",
        href: MERCHANT_BUTTON_ROUTES.donationMaker,
      },
      {
        label: "Donation HTML POST Fields",
        href: MERCHANT_BUTTON_ROUTES.donationPostFields,
      },
      {
        label: "Donation Button Examples",
        href: MERCHANT_BUTTON_ROUTES.donationExamples,
      },
    ],
  },
  {
    tourId: "merchant-tour-apis",
    title: "APIs",
    description:
      "Connect your application with notification endpoints, merchant events, and API documentation.",
    icon: api,
    links: [
      {
        label: "Instant Payment Notification",
        href: "/User/merchant/instant-payment-notification",
      },
      {
        label: "Payout Request Limit",
        href: "/User/merchant/payout-request-limit",
      },
      { label: "API Document", href: "/User/merchant/api-documentation" },
    ],
  },
  {
    tourId: "merchant-tour-invoice-builder",
    title: "Invoice Builder",
    description:
      "Create payment request invoices that are easy to share, track, and reconcile.",
    icon: invoice,
    links: [
      {
        label: "Payment Request Invoice Maker",
        href: MERCHANT_BUTTON_ROUTES.invoiceMaker,
      },
    ],
  },
  {
    tourId: "merchant-tour-point-of-sale-tools",
    title: "Point of Sale Tools",
    description:
      "Generate POS-ready checkout links, QR utilities, and onboarding resources for in-person payments.",
    icon: point,
    links: [
      {
        label: "POS How-to / Tutorial",
        href: MERCHANT_BUTTON_ROUTES.posTutorial,
      },
      {
        label: "HTML / URL / POST Fields",
        href: "/User/merchant#html-url-post-fields",
      },
      {
        label: "POS Link & QR Code Generator",
        href: MERCHANT_BUTTON_ROUTES.posQrGenerator,
      },
      {
        label: "POS Example",
        href: "/User/merchant#pos-example",
        action: "open-pos-example",
      },
    ],
  },
];

const merchantTourSteps = [
  {
    targetId: "merchant-tour-payment-buttons",
    title: "Payment Buttons",
    description:
      "Start here to create hosted checkout buttons, HTML POST fields, and ready-to-copy examples.",
  },
  {
    targetId: "merchant-tour-apis",
    title: "APIs",
    description:
      "Use this section for IPN setup, merchant notifications, and developer documentation.",
  },
  {
    targetId: "merchant-tour-invoice-builder",
    title: "Invoice Builder",
    description:
      "Build shareable payment requests for customers and keep invoice flows easy to reconcile.",
  },
  {
    targetId: "merchant-tour-point-of-sale-tools",
    title: "Point of Sale Tools",
    description:
      "Generate POS links, QR utilities, and preview the in-person payment example.",
  },
  {
    targetId: "merchant-tour-settings",
    title: "Merchant Settings",
    description:
      "Finish by configuring merchant IDs, callback URLs, IPN settings, and notification rules.",
  },
];

const posCurrencyOptions = [
  { label: "USD", value: "USD" },
  { label: "EUR", value: "EUR" },
  { label: "GBP", value: "GBP" },
  { label: "NGN", value: "NGN" },
];

const posKeypadButtons = [
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
  "add",
];

const pinKeypadButtons = [
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

const qrCells = Array.from({ length: 81 }, (_, index) => {
  const x = index % 9;
  const y = Math.floor(index / 9);
  const finder = (x < 3 && y < 3) || (x > 5 && y < 3) || (x < 3 && y > 5);

  return finder || (x * 3 + y * 5 + index) % 4 === 0;
});

function formatCurrencyAmount(amount, currency) {
  const numericAmount = Number(amount);
  const safeAmount = Number.isFinite(numericAmount) ? numericAmount : 0;

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency?.value || "USD",
    }).format(safeAmount);
  } catch {
    return `${currency?.value || "USD"} ${safeAmount.toFixed(2)}`;
  }
}

function getAmountCents(value) {
  const cents = String(value ?? "").replace(/\D/g, "");
  return cents.replace(/^0+(?=\d)/, "") || "0";
}

function formatAmountFromCents(value) {
  const cents = Math.min(Math.max(Number(value) || 0, 0), 99999999);
  return (cents / 100).toFixed(2);
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function applyPosKey(currentAmount, key) {
  const currentCents = getAmountCents(currentAmount);

  if (key === "clear") return "0.00";
  if (key === "backspace")
    return formatAmountFromCents(currentCents.slice(0, -1));
  if (key === "add") return formatAmountFromCents(Number(currentCents) + 100);

  const nextCents = `${currentCents === "0" ? "" : currentCents}${key}`;
  return formatAmountFromCents(nextCents.slice(0, 8));
}

function getTerminalSlug(value) {
  const slug = String(value || "terminal-01")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "terminal-01";
}

function AnimatedSuccessTick() {
  return (
    <div role="img" aria-label="Payment approved" className="pos-success-badge">
      <span className="pos-success-pulse" />
      <svg viewBox="0 0 96 96" aria-hidden="true" className="pos-success-icon">
        <circle
          className="pos-success-ring"
          cx="48"
          cy="48"
          r="40"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray="252"
          strokeDashoffset="252"
        />
        <path
          className="pos-success-check"
          d="M29 49.5 42.5 63 68 35"
          fill="none"
          stroke="currentColor"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="72"
          strokeDashoffset="72"
        />
      </svg>
    </div>
  );
}

function ReceiptPaper({ posForm, formattedPosAmount }) {
  return (
    <div className="pos-receipt-paper w-44 rounded-md bg-white px-4 py-3 text-left text-[#111827] shadow-[0_18px_34px_rgba(0,0,0,0.22)]">
      <div className="flex items-center justify-between border-b border-dashed border-[#9ca3af] pb-2">
        <span className="relative h-7 w-7 overflow-hidden rounded bg-white">
          <img
            src={ECO_BANX_LOGO_SRC}
            alt="Eco Banx"
            width={28}
            height={28}
            className="h-full w-full object-contain"
          />
        </span>
        <span className="text-[10px] font-black uppercase tracking-normal">
          Paid
        </span>
      </div>
      <div className="space-y-1 border-b border-dashed border-[#9ca3af] py-2 text-[9px] font-semibold uppercase tracking-normal text-[#4b5563]">
        <div className="flex justify-between gap-2">
          <span>Order</span>
          <span className="truncate text-right">
            {posForm.orderReference || "ORD-4829"}
          </span>
        </div>
        <div className="flex justify-between gap-2">
          <span>Terminal</span>
          <span className="truncate text-right">
            {posForm.registerId || "POS-01"}
          </span>
        </div>
      </div>
      <div className="flex items-center justify-between pt-2 text-xs font-black uppercase tracking-normal">
        <span>Total</span>
        <span>{formattedPosAmount}</span>
      </div>
    </div>
  );
}

function PosExamplePreview({
  posForm,
  posMode,
  paymentStatus,
  pinDigits,
  formattedPosAmount,
  paymentStatusLabel,
  paymentActionLabel,
  paymentActionDisabled,
  onModeChange,
  onKeypadPress,
  onPaymentAction,
  onResetAmount,
}) {
  const isApproved = paymentStatus === "approved";
  const isPinEntry = paymentStatus === "pin";

  return (
    <div className="w-full max-w-[360px] rounded-lg border border-input-border bg-input-bg p-4">
      <div className="mx-auto w-full max-w-[292px] rounded-[28px] bg-[#202425] p-3 shadow-[0_26px_54px_rgba(0,0,0,0.26)]">
        <div className="mx-auto mb-3 h-24 w-[78%] rounded-lg border border-black/30 bg-[linear-gradient(180deg,#424646_0%,#252828_100%)] p-3 shadow-inner">
          <div className="flex h-full items-center justify-center rounded-md border border-black/50 bg-[radial-gradient(circle_at_50%_20%,rgba(255,255,255,0.1),transparent_58%),linear-gradient(180deg,#242928_0%,#0e1110_100%)] px-2">
            <div className="flex h-12 w-full max-w-[190px] items-center justify-center gap-2 rounded-full border border-white/10 bg-[#070908]/85 px-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_10px_24px_rgba(0,0,0,0.28)]">
              <span className="relative h-18 w-28 shrink-0 overflow-hidden rounded-md">
                <img
                  src={ECO_BANX_LOGO_SRC}
                  alt="Eco Banx logo"
                  width={62}
                  height={32}
                  className="h-full w-full object-contain"
                />
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

          {paymentStatus === "entry" ? (
            <div className="bg-input-bg">
              <div className="flex h-12 items-center justify-between border-b border-input-border px-3">
                <div className="flex items-center gap-2">
                  <span className="relative h-8 w-8 overflow-hidden rounded-lg bg-white shadow-sm">
                    <img
                      src={ECO_BANX_LOGO_SRC}
                      alt="Eco Banx"
                      width={32}
                      height={32}
                      className="h-full w-full object-contain p-1"
                    />
                  </span>
                  <span className="text-xs font-bold text-theme-text">
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
                  onClick={() => onModeChange("qr")}
                  className={`flex h-10 items-center justify-center gap-2 text-xs font-bold uppercase transition ${
                    posMode === "qr"
                      ? "bg-primary text-white"
                      : "bg-primary/10 text-primary"
                  }`}
                >
                  <QrCode size={15} />
                  QR
                </button>
                <button
                  type="button"
                  onClick={() => onModeChange("card")}
                  className={`flex h-10 items-center justify-center gap-2 text-xs font-bold uppercase transition ${
                    posMode === "card"
                      ? "bg-primary text-white"
                      : "bg-primary/10 text-primary"
                  }`}
                >
                  <CreditCard size={15} />
                  Card
                </button>
              </div>

              <div className="min-h-[104px] px-4 py-4 text-right">
                <div className="flex items-center justify-between gap-2 text-left">
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-[10px] font-bold uppercase text-primary">
                    <ReceiptText size={12} />
                    {posForm.orderReference || "ORD-4829"}
                  </span>
                  <span className="truncate text-[10px] font-semibold text-secondary-text">
                    {posForm.extraField || "counter-sale"}
                  </span>
                </div>
                <div className="mt-4 flex items-center justify-end gap-2">
                  <p className="min-w-0 text-3xl font-light tracking-normal text-primary">
                    {formattedPosAmount}
                  </p>
                  <button
                    type="button"
                    onClick={() => onKeypadPress("backspace")}
                    aria-label="Delete digit"
                    title="Delete"
                    className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-white transition hover:bg-primary-hover active:scale-[0.96]"
                  >
                    <Delete size={15} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 border-t border-l border-input-border">
                {posKeypadButtons.map((key) => (
                  <button
                    type="button"
                    key={key}
                    onClick={() => onKeypadPress(key)}
                    aria-label={
                      key === "clear"
                        ? "Clear amount"
                        : key === "add"
                          ? "Add one dollar"
                          : `Enter ${key}`
                    }
                    title={
                      key === "clear"
                        ? "Clear"
                        : key === "add"
                          ? "Add one"
                          : key
                    }
                    className="flex h-12 items-center justify-center border-r border-b border-input-border bg-primary-bg text-lg font-medium text-theme-text transition hover:bg-primary/10 active:scale-[0.97]"
                  >
                    {key === "clear" ? <RotateCcw size={17} /> : null}
                    {key === "add" ? <span aria-hidden="true">+</span> : null}
                    {key.length === 1 ? key : null}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div
              className="relative flex min-h-[352px] flex-col overflow-hidden px-5 py-6 text-white"
              style={{ background: "var(--primary-gradient)" }}
            >
              <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full border border-white/30 bg-white/15 px-3 py-2">
                <span className="relative h-7 w-7 overflow-hidden rounded-md bg-white">
                  <img
                    src={ECO_BANX_LOGO_SRC}
                    alt="Eco Banx"
                    width={28}
                    height={28}
                    className="h-full w-full object-contain p-1"
                  />
                </span>
                <span className="text-xs font-bold">Eco Banx</span>
              </div>

              {paymentStatus === "qr" ? (
                <div className="flex flex-1 flex-col items-center justify-center pt-10 text-center">
                  <div className="relative flex h-36 w-36 items-center justify-center">
                    <span className="pos-qr-scan-ring" />
                    <div
                      aria-label="QR payment ready"
                      className="grid aspect-square w-28 grid-cols-9 gap-1 rounded-lg border border-white/50 bg-white p-3 shadow-[0_16px_34px_rgba(0,0,0,0.2)]"
                    >
                      {qrCells.map((filled, index) => (
                        <span
                          key={index}
                          className={`rounded-[2px] ${filled ? "bg-[#111827]" : "bg-transparent"}`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="mt-4 text-sm font-semibold uppercase">
                    {paymentStatusLabel}
                  </p>
                  <p className="mt-3 text-4xl font-light tracking-normal">
                    {formattedPosAmount}
                  </p>
                  <p className="mt-3 max-w-[190px] text-sm font-medium text-white/85">
                    {posForm.extraField || "counter-sale"}
                  </p>
                  <div className="pos-qr-progress mt-5 h-1.5 w-40 overflow-hidden rounded-full bg-white/25">
                    <span />
                  </div>
                </div>
              ) : null}

              {isPinEntry ? (
                <div className="flex flex-1 flex-col items-center justify-end pt-10 text-center">
                  <div className="w-full">
                    <div className="mx-auto flex h-14 w-28 items-center justify-center gap-2 rounded-lg border border-white/35 bg-white/15">
                      <CreditCard size={22} />
                      <span className="text-sm font-black uppercase">PIN</span>
                    </div>
                    <p className="mt-4 text-sm font-semibold uppercase">
                      {paymentStatusLabel}
                    </p>
                    <p className="mt-3 text-4xl font-light tracking-normal">
                      {formattedPosAmount}
                    </p>
                    <div
                      aria-label={`${pinDigits.length} PIN digits entered`}
                      className="mt-4 flex justify-center gap-2"
                    >
                      {[0, 1, 2, 3].map((index) => (
                        <span
                          key={index}
                          className={`h-3 w-3 rounded-full border border-white/70 ${
                            index < pinDigits.length
                              ? "bg-white"
                              : "bg-white/10"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="mt-5 grid w-full grid-cols-3 overflow-hidden rounded-lg border border-white/30">
                    {pinKeypadButtons.map((key) => (
                      <button
                        type="button"
                        key={key}
                        onClick={() => onKeypadPress(key)}
                        aria-label={
                          key === "clear"
                            ? "Clear PIN"
                            : key === "backspace"
                              ? "Delete PIN digit"
                              : `Enter PIN digit ${key}`
                        }
                        title={
                          key === "clear"
                            ? "Clear PIN"
                            : key === "backspace"
                              ? "Delete"
                              : key
                        }
                        className="flex h-11 items-center justify-center border-r border-b border-white/25 bg-black/10 text-lg font-semibold transition hover:bg-white/15 active:scale-[0.97]"
                      >
                        {key === "clear" ? <RotateCcw size={16} /> : null}
                        {key === "backspace" ? <Delete size={16} /> : null}
                        {key.length === 1 ? key : null}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              {isApproved ? (
                <div className="flex flex-1 flex-col items-center justify-center pt-10 text-center">
                  <AnimatedSuccessTick />
                  <p className="pos-success-message mt-4 text-sm font-semibold uppercase">
                    {paymentStatusLabel}
                  </p>
                  <p className="mt-3 text-4xl font-light tracking-normal">
                    {formattedPosAmount}
                  </p>
                  <div className="mt-5">
                    <ReceiptPaper
                      posForm={posForm}
                      formattedPosAmount={formattedPosAmount}
                    />
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={onPaymentAction}
          disabled={paymentActionDisabled}
          className={`inline-flex h-11 items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold text-white transition active:scale-[0.98] ${
            paymentActionDisabled
              ? "cursor-not-allowed bg-primary/45 text-white/70"
              : "bg-primary hover:bg-primary-hover"
          }`}
        >
          {isApproved ? (
            <RotateCcw size={16} />
          ) : posMode === "card" ? (
            <CreditCard size={17} />
          ) : (
            <QrCode size={17} />
          )}
          {paymentActionLabel}
        </button>
        <button
          type="button"
          onClick={onResetAmount}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-input-border bg-primary-bg px-4 text-sm font-semibold text-secondary-text transition hover:border-primary hover:text-primary active:scale-[0.98]"
        >
          <RotateCcw size={16} />
          Reset Amount
        </button>
      </div>
    </div>
  );
}

function PosExampleDrawer({ open, onClose, previewProps }) {
  return (
    <div
      aria-hidden={!open}
      className={`fixed inset-0 z-[90] ${
        open ? "pointer-events-auto" : "pointer-events-none"
      }`}
    >
      <div
        aria-hidden="true"
        className={`absolute inset-0 bg-black/55 ${open ? "opacity-100" : "opacity-0"}`}
      />

      <aside
        id="pos-example"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pos-example-title"
        className={`absolute right-0 top-0 flex h-dvh w-full max-w-[460px] transform-gpu flex-col border-l border-input-border bg-primary-bg text-theme-text shadow-[0_28px_90px_rgba(0,0,0,0.48)] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center gap-3 border-b border-input-border px-5 py-5">
          <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-white shadow-sm">
            <img
              src={ECO_BANX_LOGO_SRC}
              alt="Eco Banx"
              width={44}
              height={44}
              className="h-full w-full object-contain p-2"
            />
          </span>
          <div className="min-w-0 flex-1">
            <h2
              id="pos-example-title"
              className="text-xl font-bold text-theme-text"
            >
              POS Example
            </h2>
            <p className="text-sm text-secondary-text">
              QR and card payment demo
            </p>
          </div>
          <button
            type="button"
            aria-label="Close POS example"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-input-border text-secondary-text transition hover:border-primary hover:text-primary"
          >
            <X size={18} />
          </button>
        </div>

        <div
          data-lenis-prevent="true"
          className="min-h-0 flex-1 overflow-y-auto px-5 py-6"
        >
          <PosExamplePreview {...previewProps} />
        </div>
      </aside>
    </div>
  );
}

function MerchantTour({ open, steps, stepIndex, onClose, onNext, onPrev }) {
  const [targetRect, setTargetRect] = useState(null);
  const step = steps[stepIndex];
  const targetId = step?.targetId;

  useEffect(() => {
    if (!open || !targetId) return undefined;

    let animationFrame = 0;
    let settleTimer = 0;
    let cancelled = false;

    const updatePosition = () => {
      if (cancelled) return;

      const target = document.getElementById(targetId);
      if (!target) {
        setTargetRect(null);
        return;
      }

      const rect = target.getBoundingClientRect();
      const nextRect = {
        targetId,
        top: rect.top,
        left: rect.left,
        right: rect.right,
        bottom: rect.bottom,
        width: rect.width,
        height: rect.height,
      };

      setTargetRect((currentRect) => {
        if (
          currentRect &&
          currentRect.targetId === nextRect.targetId &&
          Math.abs(currentRect.top - nextRect.top) < 1 &&
          Math.abs(currentRect.left - nextRect.left) < 1 &&
          Math.abs(currentRect.width - nextRect.width) < 1 &&
          Math.abs(currentRect.height - nextRect.height) < 1
        ) {
          return currentRect;
        }

        return nextRect;
      });
    };

    const requestPositionUpdate = () => {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = window.requestAnimationFrame(updatePosition);
    };

    document.getElementById(targetId)?.scrollIntoView({
      block: "center",
      inline: "nearest",
      behavior: "smooth",
    });
    requestPositionUpdate();
    settleTimer = window.setTimeout(requestPositionUpdate, 280);

    window.addEventListener("resize", requestPositionUpdate);
    window.addEventListener("scroll", requestPositionUpdate, true);

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(animationFrame);
      window.clearTimeout(settleTimer);
      window.removeEventListener("resize", requestPositionUpdate);
      window.removeEventListener("scroll", requestPositionUpdate, true);
    };
  }, [open, targetId]);

  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "ArrowRight") onNext();
      if (event.key === "ArrowLeft") onPrev();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onNext, onPrev, open]);

  if (!open || !step) {
    return <AnimatePresence initial={false}>{null}</AnimatePresence>;
  }

  const viewportWidth =
    typeof window === "undefined" ? 1200 : window.innerWidth;
  const viewportHeight =
    typeof window === "undefined" ? 800 : window.innerHeight;
  const popoverWidth = Math.min(320, Math.max(280, viewportWidth - 32));
  const estimatedPopoverHeight = 212;
  const activeTargetRect =
    targetRect?.targetId === targetId ? targetRect : null;
  const hasRightSpace =
    activeTargetRect &&
    activeTargetRect.right + popoverWidth + 28 <= viewportWidth;
  const hasLeftSpace =
    activeTargetRect && activeTargetRect.left - popoverWidth - 28 >= 0;
  const placement = hasRightSpace ? "right" : hasLeftSpace ? "left" : "bottom";
  const popoverTop = activeTargetRect
    ? placement === "bottom"
      ? clamp(
          activeTargetRect.bottom + 16,
          16,
          viewportHeight - estimatedPopoverHeight - 16,
        )
      : clamp(
          activeTargetRect.top +
            activeTargetRect.height / 2 -
            estimatedPopoverHeight / 2,
          16,
          viewportHeight - estimatedPopoverHeight - 16,
        )
    : 112;
  const popoverLeft = activeTargetRect
    ? placement === "right"
      ? activeTargetRect.right + 16
      : placement === "left"
        ? activeTargetRect.left - popoverWidth - 16
        : clamp(
            activeTargetRect.left +
              activeTargetRect.width / 2 -
              popoverWidth / 2,
            16,
            viewportWidth - popoverWidth - 16,
          )
    : clamp(
        (viewportWidth - popoverWidth) / 2,
        16,
        viewportWidth - popoverWidth - 16,
      );
  const isFirstStep = stepIndex === 0;
  const isLastStep = stepIndex === steps.length - 1;

  return (
    <AnimatePresence initial={false}>
      <motion.div
        key="merchant-tools-tour"
        className="fixed inset-0 z-[120]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
      >
        <div
          aria-hidden="true"
          className={`absolute inset-0 ${activeTargetRect ? "bg-transparent" : "bg-black/45 backdrop-blur-[2px]"}`}
        />

        {activeTargetRect ? (
          <motion.div
            className="pointer-events-none fixed z-[1] rounded-xl border-2 border-primary"
            style={{
              top: activeTargetRect.top - 6,
              left: activeTargetRect.left - 6,
              width: activeTargetRect.width + 12,
              height: activeTargetRect.height + 12,
              boxShadow:
                "0 0 0 9999px rgba(0,0,0,0.48), 0 18px 60px rgba(75, 71, 255,0.28)",
            }}
            layout
            transition={{ type: "spring", stiffness: 420, damping: 34 }}
          />
        ) : null}

        <motion.aside
          role="dialog"
          aria-modal="true"
          aria-labelledby="merchant-tour-title"
          className="fixed z-[2] rounded-lg border p-4"
          style={{
            top: popoverTop,
            left: popoverLeft,
            width: popoverWidth,
            background: "var(--snackbar-bg)",
            borderColor: "var(--snackbar-border)",
            boxShadow: "var(--snackbar-shadow)",
          }}
          initial={{ opacity: 0, y: 12, scale: 0.96, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: 8, scale: 0.96, filter: "blur(6px)" }}
          transition={{
            type: "spring",
            stiffness: 480,
            damping: 34,
            mass: 0.85,
          }}
        >
          <span
            className={`absolute h-4 w-4 rotate-45 border ${
              placement === "right"
                ? "-left-2 top-10 border-r-0 border-t-0"
                : placement === "left"
                  ? "-right-2 top-10 border-b-0 border-l-0"
                  : "left-8 -top-2 border-b-0 border-r-0"
            }`}
            style={{
              background: "var(--snackbar-bg)",
              borderColor: "var(--snackbar-border)",
            }}
          />

          <div className="relative flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-normal text-primary">
                {stepIndex + 1} of {steps.length}
              </p>
              <h2
                id="merchant-tour-title"
                className="mt-1 text-base font-black text-theme-text"
              >
                {step.title}
              </h2>
            </div>
            <button
              type="button"
              aria-label="Close tour"
              onClick={onClose}
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-transparent text-secondary-text transition hover:border-input-border hover:bg-input-bg hover:text-theme-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
            >
              <X size={16} />
            </button>
          </div>

          <p className="mt-2 text-sm font-medium leading-6 text-secondary-text">
            {step.description}
          </p>

          <div className="mt-5 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onPrev}
              disabled={isFirstStep}
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md border border-input-border bg-input-bg px-3 text-sm font-semibold text-secondary-text transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-45"
            >
              <ChevronLeft size={15} />
              Prev
            </button>
            <button
              type="button"
              onClick={onNext}
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md bg-[#1677d2] px-4 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(22,119,210,0.25)] transition hover:bg-[#0f69bd] active:scale-[0.98]"
            >
              {isLastStep ? "Done" : "Next"}
              {isLastStep ? null : <ChevronRight size={15} />}
            </button>
          </div>
        </motion.aside>
      </motion.div>
    </AnimatePresence>
  );
}

export default function Page() {
  const [loading, setLoading] = useState(true);
  const [posExampleDrawerOpen, setPosExampleDrawerOpen] = useState(false);
  const [merchantTourOpen, setMerchantTourOpen] = useState(false);
  const [merchantTourStep, setMerchantTourStep] = useState(0);
  const [posAmount, setPosAmount] = useState("50.00");
  const [posMode, setPosMode] = useState("card");
  const [paymentStatus, setPaymentStatus] = useState("entry");
  const [pinDigits, setPinDigits] = useState("");
  const [posForm, setPosForm] = useState(() => ({
    outletName: "Downtown Store",
    registerId: "POS-01",
    orderReference: "ORD-4829",
    customerContact: "maya@example.com",
    currency: posCurrencyOptions[0],
    extraField: "Table 12 pickup",
    successUrl: "https://merchant.example/success",
  }));

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 250);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!posExampleDrawerOpen || paymentStatus !== "qr") return undefined;

    const timer = window.setTimeout(() => {
      setPaymentStatus("approved");
    }, 2200);

    return () => window.clearTimeout(timer);
  }, [paymentStatus, posExampleDrawerOpen]);

  useEffect(() => {
    if (
      !posExampleDrawerOpen ||
      paymentStatus !== "pin" ||
      pinDigits.length < 4
    ) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setPaymentStatus("approved");
    }, 420);

    return () => window.clearTimeout(timer);
  }, [paymentStatus, pinDigits, posExampleDrawerOpen]);

  const formattedPosAmount = useMemo(
    () => formatCurrencyAmount(posAmount, posForm.currency),
    [posAmount, posForm.currency],
  );

  const paymentLink = useMemo(() => {
    const params = new URLSearchParams({
      amount: posAmount,
      currency: posForm.currency.value,
      mode: posMode,
      reference: posForm.orderReference || "ORD-4829",
      customer: posForm.customerContact || "walk-in",
      extra_field: posForm.extraField || "counter-sale",
      outlet: posForm.outletName || "Downtown Store",
      success_url: posForm.successUrl || "https://merchant.example/success",
    });

    return `https://pay.ecobanxApi.app/pos/${getTerminalSlug(posForm.registerId)}?${params.toString()}`;
  }, [
    posAmount,
    posForm.currency,
    posForm.customerContact,
    posForm.extraField,
    posForm.outletName,
    posForm.orderReference,
    posForm.registerId,
    posForm.successUrl,
    posMode,
  ]);

  const posPostFields = useMemo(
    () => [
      { name: "merchant_id", value: "HP-MERCHANT-001" },
      { name: "terminal_id", value: posForm.registerId || "POS-01" },
      { name: "amount", value: posAmount },
      { name: "currency", value: posForm.currency.value },
      { name: "payment_mode", value: posMode },
      { name: "order_reference", value: posForm.orderReference || "ORD-4829" },
      { name: "customer_contact", value: posForm.customerContact || "walk-in" },
      { name: "extra_field", value: posForm.extraField || "counter-sale" },
      {
        name: "success_url",
        value: posForm.successUrl || "https://merchant.example/success",
      },
    ],
    [posAmount, posForm, posMode],
  );

  const paymentStatusLabel =
    paymentStatus === "approved"
      ? "Payment Approved"
      : paymentStatus === "qr"
        ? "Scan QR"
        : paymentStatus === "pin"
          ? "Enter PIN"
          : "Amount Entry";

  const paymentActionLabel =
    paymentStatus === "approved"
      ? "New Sale"
      : paymentStatus === "qr"
        ? "Waiting"
        : paymentStatus === "pin"
          ? "Enter PIN"
          : posMode === "qr"
            ? "Show QR"
            : "Enter PIN";

  const paymentActionDisabled =
    paymentStatus === "qr" || paymentStatus === "pin";

  const activePosStep =
    paymentStatus === "approved"
      ? 2
      : paymentStatus === "qr" || paymentStatus === "pin"
        ? 1
        : 0;

  const updatePosField = (key, value) => {
    setPosForm((current) => ({ ...current, [key]: value }));
  };

  const handleKeypadPress = (key) => {
    if (paymentStatus === "pin") {
      setPinDigits((current) => {
        if (key === "clear") return "";
        if (key === "backspace") return current.slice(0, -1);
        if (/^\d$/.test(key) && current.length < 4) return `${current}${key}`;
        return current;
      });
      return;
    }

    setPaymentStatus("entry");
    setPinDigits("");
    setPosAmount((current) => applyPosKey(current, key));
  };

  const handleModeChange = (mode) => {
    setPosMode(mode);
    setPaymentStatus("entry");
    setPinDigits("");
  };

  const handlePaymentAction = () => {
    if (paymentStatus === "entry") {
      setPinDigits("");
      setPaymentStatus(posMode === "qr" ? "qr" : "pin");
      return;
    }

    if (paymentStatus === "approved") {
      setPinDigits("");
      setPaymentStatus("entry");
    }
  };

  const handleMerchantLinkClick = (link, event) => {
    if (link.action !== "open-pos-example") return;

    event.preventDefault();
    setPosExampleDrawerOpen(true);
  };

  const startMerchantTour = useCallback(() => {
    setMerchantTourStep(0);
    setMerchantTourOpen(true);
  }, []);

  const closeMerchantTour = useCallback(() => {
    setMerchantTourOpen(false);
  }, []);

  const goToPreviousTourStep = useCallback(() => {
    setMerchantTourStep((currentStep) => Math.max(0, currentStep - 1));
  }, []);

  const goToNextTourStep = useCallback(() => {
    if (merchantTourStep >= merchantTourSteps.length - 1) {
      setMerchantTourOpen(false);
      return;
    }

    setMerchantTourStep((currentStep) =>
      Math.min(merchantTourSteps.length - 1, currentStep + 1),
    );
  }, [merchantTourStep]);

  const posExamplePreviewProps = {
    posForm,
    posMode,
    paymentStatus,
    pinDigits,
    formattedPosAmount,
    paymentStatusLabel,
    paymentActionLabel,
    paymentActionDisabled,
    onModeChange: handleModeChange,
    onKeypadPress: handleKeypadPress,
    onPaymentAction: handlePaymentAction,
    onResetAmount: () => {
      setPosAmount("50.00");
      setPaymentStatus("entry");
      setPinDigits("");
    },
  };

  if (loading) {
    return <Skeleton pageName="merchant" />;
  }

  return (
    <div className="space-y-8 pb-8">
      <PageTopBanner
        title="Merchant Tools"
        description="Manage button builders, API integrations, invoices, and point of sale utilities from one place."
        actions={
          <>
            <button
              type="button"
              onClick={startMerchantTour}
              className="inline-flex h-11 w-full shrink-0 items-center justify-center gap-2 rounded-full border border-[#f97316]/50 bg-[#f97316] px-5 text-sm font-semibold text-white shadow-[0_14px_32px_rgba(249,115,22,0.24)] transition hover:-translate-y-0.5 hover:bg-[#ea580c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f97316]/35 sm:w-fit"
            >
              <PlayCircle size={16} />
              Take the tour
            </button>
            <Link
              href="/User/merchant/payout-request-limit"
              className="inline-flex h-11 w-full shrink-0 items-center justify-center gap-2 rounded-full border border-[#0ea5e9]/45 bg-[#0ea5e9] px-5 text-sm font-semibold text-white shadow-[0_14px_32px_rgba(14,165,233,0.24)] transition hover:-translate-y-0.5 hover:bg-[#0284c7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0ea5e9]/35 sm:w-fit"
            >
              <ShieldCheck size={16} />
              Payout Limits
              <ArrowRight size={15} />
            </Link>
            <Link
              id="merchant-tour-settings"
              href="/User/merchant/settings"
              className="inline-flex h-11 w-full shrink-0 items-center justify-center gap-2 rounded-full border border-primary/40 bg-primary px-5 text-sm font-semibold text-white shadow-[0_14px_32px_rgba(75, 71, 255,0.24)] transition hover:-translate-y-0.5 hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 sm:w-fit"
            >
              <Settings2 size={16} />
              Merchant Settings
              <ArrowRight size={15} />
            </Link>
          </>
        }
      />

      <section className="grid gap-6 lg:grid-cols-2">
        {merchantCategories.map((category) => (
          <div
            key={category.title}
            id={category.tourId}
            className="scroll-mt-28"
          >
            <MerchantCard {...category} onLinkClick={handleMerchantLinkClick} />
          </div>
        ))}
      </section>

      {/* <section
        id="pos-link-qr-code-generator"
        className="scroll-mt-28 rounded-lg border border-input-border bg-primary-bg p-4 shadow-[0_18px_48px_rgba(8,19,12,0.06)] sm:p-6 lg:p-7"
      >
        <div
          id="pos-how-to-tutorial"
          className="scroll-mt-28 flex flex-col gap-4 border-b border-input-border pb-6 sm:flex-row sm:items-start sm:justify-between"
        >
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Store size={21} />
              </span>
              <div>
                <h2 className="text-2xl font-bold text-theme-text">
                  Point of Sale
                </h2>
                <p className="mt-1 text-sm leading-6 text-secondary-text">
                  Counter checkout for in-person payments.
                </p>
              </div>
            </div>
          </div>

          <div className="flex w-full flex-wrap gap-2 sm:w-auto sm:justify-end">
            {["Amount", "Present", "Paid"].map((step, index) => (
              <span
                key={step}
                className={`inline-flex h-9 items-center rounded-full border px-3 text-xs font-semibold ${
                  index === activePosStep
                    ? "border-primary bg-primary text-white"
                    : "border-input-border bg-input-bg text-secondary-text"
                }`}
              >
                {step}
              </span>
            ))}
          </div>
        </div>

        <div className="pt-6">
          <div className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="Outlet Name"
                value={posForm.outletName}
                onChange={(event) => updatePosField("outletName", event.target.value)}
                placeholder="Downtown Store"
                rounded="rounded-lg"
              />
              <Input
                label="Register ID"
                value={posForm.registerId}
                onChange={(event) => updatePosField("registerId", event.target.value)}
                placeholder="POS-01"
                rounded="rounded-lg"
              />
              <Input
                label="Order Reference"
                value={posForm.orderReference}
                onChange={(event) => updatePosField("orderReference", event.target.value)}
                placeholder="ORD-4829"
                rounded="rounded-lg"
              />
              <Input
                label="Customer Contact"
                value={posForm.customerContact}
                onChange={(event) => updatePosField("customerContact", event.target.value)}
                placeholder="customer@example.com"
                rounded="rounded-lg"
              />
              <Dropdown
                label="Currency"
                value={posForm.currency}
                onChange={(currency) => updatePosField("currency", currency)}
                options={posCurrencyOptions}
                searchable={false}
                clearable={false}
                className="min-w-0"
                triggerClassName="rounded-lg"
              />
              <Input
                label="Extra Field"
                value={posForm.extraField}
                onChange={(event) => updatePosField("extraField", event.target.value)}
                placeholder="Table 12, loyalty ID, pickup note"
                rounded="rounded-lg"
              />
              <Input
                label="Success URL"
                value={posForm.successUrl}
                onChange={(event) => updatePosField("successUrl", event.target.value)}
                placeholder="https://merchant.example/success"
                rounded="rounded-lg"
                className="md:col-span-2"
              />
            </div>

            <div
              id="html-url-post-fields"
              className="scroll-mt-28 rounded-lg border border-input-border bg-input-bg p-4"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <QrCode size={20} />
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-theme-text">
                      Payment URL
                    </h3>
                    <p className="text-xs text-secondary-text">
                      {paymentStatusLabel}
                    </p>
                  </div>
                </div>
                <CopyButton value={paymentLink} label="Copy payment URL" />
              </div>

              <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_112px]">
                <p className="min-h-16 break-all rounded-lg border border-input-border bg-primary-bg p-3 font-mono text-xs leading-6 text-secondary-text">
                  {paymentLink}
                </p>
                <div
                  aria-label="Generated QR preview"
                  className="grid aspect-square w-28 grid-cols-9 gap-1 rounded-lg border border-input-border bg-white p-2"
                >
                  {qrCells.map((filled, index) => (
                    <span
                      key={index}
                      className={`rounded-[2px] ${filled ? "bg-[#111827]" : "bg-transparent"}`}
                    />
                  ))}
                </div>
              </div>

              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {posPostFields.map((field) => (
                  <div
                    key={field.name}
                    className="flex min-h-12 items-center justify-between gap-3 rounded-lg border border-input-border bg-primary-bg px-3 py-2"
                  >
                    <span className="shrink-0 font-mono text-[11px] font-semibold uppercase text-secondary-text">
                      {field.name}
                    </span>
                    <span className="min-w-0 truncate text-right text-sm font-semibold text-theme-text">
                      {field.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="hidden">
            <div className="w-full max-w-[360px] rounded-lg border border-input-border bg-input-bg p-4">
              <div className="mx-auto w-full max-w-[292px] rounded-[28px] bg-[#202425] p-3 shadow-[0_26px_54px_rgba(0,0,0,0.26)]">
                <div className="mx-auto mb-3 h-24 w-[78%] rounded-lg border border-black/30 bg-[linear-gradient(180deg,#424646_0%,#252828_100%)] p-3 shadow-inner">
                  <div className="h-full rounded-md border border-black/50 bg-[linear-gradient(180deg,#353939_0%,#191c1c_100%)]" />
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

                  {paymentStatus === "entry" ? (
                    <div className="bg-input-bg">
                      <div className="flex h-12 items-center justify-between border-b border-input-border px-3">
                        <div className="flex items-center gap-2">
                          <span className="relative h-8 w-8 overflow-hidden rounded-lg bg-white shadow-sm">
                            <img
                              src={ECO_BANX_LOGO_SRC}
                              alt="Eco Banx"
                              width={32}
                              height={32}
                              className="h-full w-full object-contain p-1"
                            />
                          </span>
                          <span className="text-xs font-bold text-theme-text">
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
                          onClick={() => handleModeChange("qr")}
                          className={`flex h-10 items-center justify-center gap-2 text-xs font-bold uppercase transition ${
                            posMode === "qr"
                              ? "bg-primary text-white"
                              : "bg-primary/10 text-primary"
                          }`}
                        >
                          <QrCode size={15} />
                          QR
                        </button>
                        <button
                          type="button"
                          onClick={() => handleModeChange("card")}
                          className={`flex h-10 items-center justify-center gap-2 text-xs font-bold uppercase transition ${
                            posMode === "card"
                              ? "bg-primary text-white"
                              : "bg-primary/10 text-primary"
                          }`}
                        >
                          <CreditCard size={15} />
                          Card
                        </button>
                      </div>

                      <div className="min-h-[104px] px-4 py-4 text-right">
                        <div className="flex items-center justify-between gap-2 text-left">
                          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-[10px] font-bold uppercase text-primary">
                            <ReceiptText size={12} />
                            {posForm.orderReference || "ORD-4829"}
                          </span>
                          <span className="truncate text-[10px] font-semibold text-secondary-text">
                            {posForm.extraField || "counter-sale"}
                          </span>
                        </div>
                        <div className="mt-4 flex items-center justify-end gap-2">
                          <p className="min-w-0 text-3xl font-light tracking-normal text-primary">
                            {formattedPosAmount}
                          </p>
                          <button
                            type="button"
                            onClick={() => handleKeypadPress("backspace")}
                            aria-label="Delete digit"
                            title="Delete"
                            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-white transition hover:bg-primary-hover active:scale-[0.96]"
                          >
                            <Delete size={15} />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 border-t border-l border-input-border">
                        {posKeypadButtons.map((key) => (
                          <button
                            type="button"
                            key={key}
                            onClick={() => handleKeypadPress(key)}
                            aria-label={
                              key === "clear"
                                ? "Clear amount"
                                : key === "add"
                                    ? "Add one dollar"
                                    : `Enter ${key}`
                            }
                            title={
                              key === "clear"
                                ? "Clear"
                                : key === "add"
                                    ? "Add one"
                                    : key
                            }
                            className="flex h-12 items-center justify-center border-r border-b border-input-border bg-primary-bg text-lg font-medium text-theme-text transition hover:bg-primary/10 active:scale-[0.97]"
                          >
                            {key === "clear" ? <RotateCcw size={17} /> : null}
                            {key === "add" ? <span aria-hidden="true">+</span> : null}
                            {key.length === 1 ? key : null}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div
                      className="relative flex min-h-[352px] flex-col items-center justify-center overflow-hidden px-6 py-8 text-white"
                      style={{ background: "var(--primary-gradient)" }}
                    >
                      <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full border border-white/30 bg-white/15 px-3 py-2">
                        <span className="relative h-7 w-7 overflow-hidden rounded-md bg-white">
                          <img
                            src={ECO_BANX_LOGO_SRC}
                            alt="Eco Banx"
                            width={28}
                            height={28}
                            className="h-full w-full object-contain p-1"
                          />
                        </span>
                        <span className="text-xs font-bold">Eco Banx</span>
                      </div>

                      <div className="relative mt-8 flex h-28 w-28 items-center justify-center rounded-full border border-white/70">
                        {paymentStatus === "approved" ? (
                          <AnimatedSuccessTick />
                        ) : posMode === "qr" ? (
                          <div
                            aria-label="QR payment ready"
                            className="grid aspect-square w-20 grid-cols-9 gap-0.5 rounded-lg border border-white/50 bg-white p-2 shadow-[0_16px_34px_rgba(0,0,0,0.2)]"
                          >
                            {qrCells.map((filled, index) => (
                              <span
                                key={index}
                                className={`rounded-[1px] ${filled ? "bg-[#111827]" : "bg-transparent"}`}
                              />
                            ))}
                          </div>
                        ) : (
                          <Nfc size={66} strokeWidth={1.5} className="animate-pulse" />
                        )}
                      </div>
                      <div className="mt-6 text-center">
                        <p className={`text-sm font-semibold uppercase ${
                          paymentStatus === "approved" ? "pos-success-message" : ""
                        }`}
                        >
                          {paymentStatusLabel}
                        </p>
                        <p className="mt-3 text-4xl font-light tracking-normal">
                          {formattedPosAmount}
                        </p>
                        <p className="mt-3 text-sm font-medium text-white/85">
                          {posForm.outletName || "Downtown Store"}
                        </p>
                      </div>
                      <div className="mt-7 flex items-center gap-3 rounded-full border border-white/40 bg-white/12 px-4 py-2 text-sm font-semibold">
                        {posMode === "card" ? <CreditCard size={18} /> : <QrCode size={18} />}
                        {posMode === "card" ? "Card reader active" : "QR code ready"}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={handlePaymentAction}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary-hover active:scale-[0.98]"
                >
                  {paymentStatus === "approved" ? (
                    <RotateCcw size={16} />
                  ) : posMode === "card" ? (
                    <CreditCard size={17} />
                  ) : (
                    <QrCode size={17} />
                  )}
                  {paymentActionLabel}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPosAmount("50.00");
                    setPaymentStatus("entry");
                  }}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-input-border bg-primary-bg px-4 text-sm font-semibold text-secondary-text transition hover:border-primary hover:text-primary active:scale-[0.98]"
                >
                  <RotateCcw size={16} />
                  Reset Amount
                </button>
              </div>
            </div>
          </div>
        </div>
      </section> */}

      <PosExampleDrawer
        open={posExampleDrawerOpen}
        onClose={() => setPosExampleDrawerOpen(false)}
        previewProps={posExamplePreviewProps}
      />
      <MerchantTour
        open={merchantTourOpen}
        steps={merchantTourSteps}
        stepIndex={merchantTourStep}
        onClose={closeMerchantTour}
        onNext={goToNextTourStep}
        onPrev={goToPreviousTourStep}
      />
    </div>
  );
}
