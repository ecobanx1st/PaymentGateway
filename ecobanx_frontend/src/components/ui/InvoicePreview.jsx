"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import {
  ArrowLeft,
  Copy,
  Download,
  ExternalLink,
  Link2,
  QrCode,
  ReceiptText,
} from "lucide-react";
import Button from "@/components/ui/button";
import CopyButton from "@/components/ui/CopyButton";
import Input from "@/components/ui/input";
import MerchantToolPageHeader from "@/components/ui/MerchantToolPageHeader";
import Modal from "@/components/ui/Modal";
import Snackbar from "@/components/ui/Snackbar";
import {
  INVOICE_MAKER_ROUTE,
  buildCheckoutDetailUrl,
  buildInvoiceCheckoutUrl,
  buildInvoiceDetailUrl,
  buildInvoicePreviewHtml,
  buildUpdateInvoicePayload,
  getInvoiceBillSummary,
  getInvoiceFilename,
  mapInvoiceDisplayStatus,
  normalizeInvoiceValues,
} from "@/lib/invoice-maker";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3700/ecobanxApi";

function InvoiceInfoBlock({ title, children }) {
  return (
    <div className="rounded-[14px] border border-slate-200 bg-slate-50 p-4">
      <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">
        {title}
      </p>
      <div className="mt-3 space-y-1.5 text-sm leading-6 text-slate-700">
        {children}
      </div>
    </div>
  );
}

function InvoiceMetaLine({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-5 text-sm">
      <span className="text-slate-500">{label}</span>
      <strong className="break-all text-right text-slate-950">{value}</strong>
    </div>
  );
}

function InvoiceTotalLine({ label, value, grand = false }) {
  if (grand) {
    return (
      <div className="mt-2 flex items-center justify-between gap-5 rounded-[14px] bg-slate-950 px-4 py-3 text-white">
        <span className="text-sm font-bold">Total due</span>
        <strong className="text-xl">{value}</strong>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-5 border-b border-slate-200 py-3 text-sm">
      <span className="text-slate-500">{label}</span>
      <strong className="text-slate-950">{value}</strong>
    </div>
  );
}

function downloadHtmlFile(html, filename) {
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function subscribeToOrigin() {
  return () => {};
}

function getBrowserOrigin() {
  return typeof window === "undefined" ? "" : window.location.origin;
}

function getServerOrigin() {
  return "";
}

function resolveInvoiceIdProp(invoice, invoiceId) {
  if (invoiceId && String(invoiceId).trim()) return String(invoiceId).trim();
  if (typeof invoice === "string" && invoice.trim()) return invoice.trim();
  if (invoice && typeof invoice === "object") {
    const cand =
      invoice.invoiceId || invoice._id || invoice.txn_id || invoice.txn || "";
    // Only treat as id mode when it looks like an ObjectId/txnId and no
    // maker-form fields are present.
    const hasMakerFields =
      invoice.amount !== undefined ||
      invoice.requestAmount !== undefined ||
      invoice.requestCurrency !== undefined;
    if (cand && !hasMakerFields) return String(cand).trim();
  }
  return "";
}

export default function InvoicePreview({ invoice, invoiceId: invoiceIdProp }) {
  const router = useRouter();
  const invoiceId = useMemo(
    () => resolveInvoiceIdProp(invoice, invoiceIdProp),
    [invoice, invoiceIdProp]
  );
  const isInvoiceIdMode = Boolean(invoiceId);

  const values = useMemo(() => {
    if (isInvoiceIdMode) return normalizeInvoiceValues({});
    return normalizeInvoiceValues(invoice);
  }, [invoice, isInvoiceIdMode]);
  const summary = useMemo(() => getInvoiceBillSummary(values), [values]);
  const origin = useSyncExternalStore(
    subscribeToOrigin,
    getBrowserOrigin,
    getServerOrigin,
  );
  const [toast, setToast] = useState({
    open: false,
    message: "",
    tone: "success",
  });
  const [txnData, setTxnData] = useState(null);
  const [txnLoading, setTxnLoading] = useState(false);

  // ---- InvoiceId mode state (Eco Banx Invoice flow, Transaction model only) ----
  const [fetched, setFetched] = useState(null);
  const [fetchError, setFetchError] = useState("");
  const [fetching, setFetching] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [buyer, setBuyer] = useState({ firstname: "", lastname: "", email: "" });
  const [buyerErrors, setBuyerErrors] = useState({});
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (isInvoiceIdMode) return undefined;
    if (!values.txn) return undefined;

    let cancelled = false;
    setTxnLoading(true);

    fetch(
      `${String(BACKEND_URL).replace(/\/+$/, "")}/checkout/button-txn/${encodeURIComponent(values.txn)}`,
      { cache: "no-store" }
    )
      .then((res) => res.json().catch(() => null))
      .then((data) => {
        if (cancelled) return;
        if (data?.success && data?.result) {
          setTxnData(data.result);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setTxnLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [values.txn, isInvoiceIdMode]);

  // Fetch Invoice (Transaction) by invoiceId — public, no auth required.
  useEffect(() => {
    if (!isInvoiceIdMode) return undefined;
    let cancelled = false;
    const load = async () => {
      setFetching(true);
      setFetchError("");
      try {
        const res = await fetch(
          `${String(BACKEND_URL).replace(/\/+$/, "")}/checkout/invoice/${encodeURIComponent(invoiceId)}`,
          { cache: "no-store" }
        );
        const data = await res.json().catch(() => null);
        if (cancelled) return;
        if (!res.ok || !data?.success || !data?.result) {
          setFetchError(data?.message || "Invoice not found.");
          setFetched(null);
          return;
        }
        setFetched(data.result);
      } catch {
        if (!cancelled) {
          setFetchError("Unable to load invoice. Please try again.");
          setFetched(null);
        }
      } finally {
        if (!cancelled) setFetching(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [invoiceId, isInvoiceIdMode]);

  // Reuse existing payment monitoring state: poll while pending so the final
  // status (completed/failed/expired) appears without a manual refresh.
  useEffect(() => {
    if (!isInvoiceIdMode || !fetched) return undefined;
    const s = String(fetched.displayStatus || fetched.status || "").toLowerCase();
    if (s !== "pending") return undefined;
    const id = window.setInterval(async () => {
      try {
        const res = await fetch(
          `${String(BACKEND_URL).replace(/\/+$/, "")}/checkout/invoice/${encodeURIComponent(invoiceId)}`,
          { cache: "no-store" }
        );
        const data = await res.json().catch(() => null);
        if (data?.success && data?.result) setFetched(data.result);
      } catch {
        // Keep existing state on poll failure.
      }
    }, 10000);
    return () => window.clearInterval(id);
  }, [isInvoiceIdMode, fetched, invoiceId]);

  const checkoutHref = useMemo(
    () => buildInvoiceCheckoutUrl(values, origin),
    [origin, values],
  );

  // ---- InvoiceId mode derived display values (from saved Invoice only) ----
  const idValues = useMemo(() => {
    if (!isInvoiceIdMode || !fetched) return normalizeInvoiceValues({});
    const buyerName = [fetched.buyerFirstname, fetched.buyerLastname]
      .filter(Boolean)
      .join(" ");
    return normalizeInvoiceValues({
      merchantId: fetched.merchantId || fetched.custom || "",
      amount: fetched.amount ?? "0",
      currency: fetched.currency1 || "USD",
      requestAmount: fetched.crypto_amount ?? fetched.amountInCurrency2 ?? "0",
      requestCurrency: fetched.currency2 || "",
      network: fetched.network || "",
      requestDescription: fetched.item_description || fetched.itemName || "",
      invoice: fetched.invoice || "",
      taxAmount: "0",
      shippingCost: "0",
      ipnUrl: "",
      buyerName,
      buyerEmail: fetched.buyerEmail || "",
      txn: fetched.txn_id || fetched.transactionId || "",
    });
  }, [fetched, isInvoiceIdMode]);
  const idSummary = useMemo(() => getInvoiceBillSummary(idValues), [idValues]);

  if (isInvoiceIdMode) {
    const displayStatus = mapInvoiceDisplayStatus(
      fetched?.displayStatus || fetched?.status || "created"
    );
    const isCreated = !fetched || displayStatus === "created";
    const isPendingPayment =
      fetched && (displayStatus === "pending" || Boolean(fetched.address));
    const isFinal =
      fetched &&
      (displayStatus === "completed" ||
        displayStatus === "failed" ||
        displayStatus === "expired");
    const detailUrl =
      typeof window !== "undefined"
        ? window.location.href
        : buildInvoiceDetailUrl(invoiceId);

    const downloadInvoice = () => {
      downloadHtmlFile(
        buildInvoicePreviewHtml(idValues, detailUrl),
        getInvoiceFilename(idValues)
      );
      setToast({ open: true, message: "Invoice downloaded.", tone: "success" });
    };

    const openCheckout = () => {
      setBuyerErrors({});
      setCheckoutOpen(true);
    };

    const submitCheckout = async () => {
      if (updating) return;
      const errs = {};
      if (!buyer.firstname.trim()) errs.firstname = "First name is required.";
      if (!buyer.lastname.trim()) errs.lastname = "Last name is required.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(buyer.email.trim())) {
        errs.email = "Enter a valid email address.";
      }
      setBuyerErrors(errs);
      if (Object.keys(errs).length) return;
      setUpdating(true);
      try {
        const payload = buildUpdateInvoicePayload(invoiceId, buyer);
        const res = await fetch(
          `${String(BACKEND_URL).replace(/\/+$/, "")}/checkout/invoice/update`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );
        const data = await res.json().catch(() => null);
        if (!res.ok || !data?.success || !data?.result) {
          throw new Error(data?.message || "Failed to start checkout.");
        }
        const transactionId =
          data.result.transactionId || data.result.txn_id || "";
        if (!transactionId) throw new Error("Checkout started but no transaction was returned.");
        setCheckoutOpen(false);
        // Only after Update succeeds: start timer (on checkout page) + navigate.
        router.push(buildCheckoutDetailUrl(transactionId));
      } catch (err) {
        setToast({
          open: true,
          message: err?.message || "Failed to start checkout.",
          tone: "error",
        });
      } finally {
        setUpdating(false);
      }
    };

    return (
      <div className="space-y-6 pb-4">
        <MerchantToolPageHeader
          title="Invoice"
          description="Review the invoice details, then checkout to pay securely."
          icon={ReceiptText}
        />

        {fetching && !fetched ? (
          <div className="rounded-[18px] border border-input-border bg-primary-bg p-6 text-sm text-secondary-text">
            Loading invoice...
          </div>
        ) : fetchError && !fetched ? (
          <div className="rounded-[18px] border border-input-border bg-primary-bg p-6 text-sm font-semibold text-red-400">
            {fetchError}
          </div>
        ) : (
          <section className="grid gap-6 xl:grid-cols-[minmax(0,0.92fr)_minmax(360px,0.58fr)]">
            <article className="rounded-[24px] border border-input-border bg-primary-bg p-3 shadow-[0_24px_80px_rgba(0,0,0,0.1)] sm:p-4">
              <div className="rounded-[18px] bg-white p-5 text-slate-950 ring-1 ring-black/5 sm:p-8">
                <header className="grid gap-6 border-b-2 border-slate-950 pb-6 sm:grid-cols-[minmax(0,1fr)_minmax(15rem,0.75fr)] sm:items-start">
                  <div>
                    <p className="text-2xl font-black tracking-[0.08em] text-slate-950">
                      ECO BANX
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-500">
                      Secure crypto payment invoice
                    </p>
                    <p className="mt-5 max-w-xl text-sm leading-6 text-slate-600">
                      {idValues.requestDescription || "Payment request invoice."}
                    </p>
                  </div>
                  <div className="space-y-3 sm:text-right">
                    <p className="text-4xl font-black tracking-[0.08em] text-slate-950">
                      INVOICE
                    </p>
                    <div className="space-y-2 rounded-[14px] border border-slate-200 bg-slate-50 p-4">
                      <InvoiceMetaLine
                        label="Invoice No."
                        value={idValues.invoice || invoiceId}
                      />
                      {fetched?.txn_id ? (
                        <InvoiceMetaLine label="Transaction ID" value={fetched.txn_id} />
                      ) : null}
                      <InvoiceMetaLine label="Due" value={idSummary.dueDate} />
                      <InvoiceMetaLine label="Status" value={displayStatus.toUpperCase()} />
                    </div>
                  </div>
                </header>

                <section className="grid gap-4 py-6 md:grid-cols-2">
                  <InvoiceInfoBlock title="Bill From">
                    <p className="font-black text-slate-950">Eco Banx Merchant</p>
                    <p className="break-all">Merchant ID: {idValues.merchantId || "-"}</p>
                  </InvoiceInfoBlock>
                  <InvoiceInfoBlock title="Bill To">
                    <p className="font-black text-slate-950">
                      {idValues.buyerName || "Customer / Buyer"}
                    </p>
                    <p>{idValues.buyerEmail || "Buyer details collected at checkout"}</p>
                  </InvoiceInfoBlock>
                </section>

                <div className="overflow-x-auto rounded-[14px] border border-slate-200">
                  <div className="grid min-w-[620px] grid-cols-[minmax(0,1.7fr)_5rem_9rem_9rem] bg-slate-950 px-4 py-3 text-xs font-black uppercase tracking-[0.08em] text-white">
                    <span>Description</span>
                    <span className="text-center">Qty</span>
                    <span className="text-right">Unit price</span>
                    <span className="text-right">Amount</span>
                  </div>
                  <div className="grid min-w-[620px] grid-cols-[minmax(0,1.7fr)_5rem_9rem_9rem] border-b border-slate-200 px-4 py-4 text-sm text-slate-700">
                    <span className="font-semibold text-slate-950">
                      {idValues.requestDescription || "Payment request"}
                    </span>
                    <span className="text-center">1</span>
                    <span className="text-right">{idSummary.subtotalLabel}</span>
                    <span className="text-right font-black text-slate-950">
                      {idSummary.subtotalLabel}
                    </span>
                  </div>
                </div>

                <section className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.48fr)]">
                  <div className="rounded-[16px] border border-violet-100 bg-violet-50 p-5">
                    <p className="text-xs font-black uppercase tracking-[0.14em] text-violet-600">
                      Payment request
                    </p>
                    <p className="mt-2 text-2xl font-black text-slate-950">
                      {idSummary.requestLabel}
                    </p>
                    {isFinal && fetched?.address ? (
                      <div className="mt-4 space-y-2 rounded-[14px] border border-violet-200 bg-white p-3.5">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                          Paid to ({fetched.network})
                        </p>
                        <p className="break-all font-mono text-xs font-bold text-slate-950">
                          {fetched.address}
                        </p>
                        {fetched.qrcode ? (
                          <img
                            src={fetched.qrcode}
                            alt="Payment QR"
                            className="h-16 w-16 rounded-lg border border-slate-200 bg-white p-1"
                          />
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                  <div className="rounded-[16px] border border-slate-200 bg-slate-50 p-4">
                    <InvoiceTotalLine label="Subtotal" value={idSummary.subtotalLabel} />
                    <InvoiceTotalLine label="Tax" value={idSummary.taxLabel} />
                    <InvoiceTotalLine label="Shipping" value={idSummary.shippingLabel} />
                    <InvoiceTotalLine value={idSummary.totalLabel} grand />
                  </div>
                </section>

                <footer className="mt-6 border-t border-slate-200 pt-4 text-sm leading-6 text-slate-500">
                  This invoice is payable through the secure Eco Banx checkout.
                  {isFinal
                    ? ` Final status: ${displayStatus}.`
                    : " No payment window runs until checkout succeeds."}
                </footer>
              </div>
            </article>

            <aside className="space-y-4 xl:sticky xl:top-6">
              <section className="rounded-[24px] border border-input-border bg-primary-bg p-5 shadow-[0_24px_80px_rgba(0,0,0,0.1)]">
                <h2 className="text-lg font-black text-theme-text">Pay this invoice</h2>
                <p className="mt-1 text-sm leading-6 text-secondary-text">
                  {isCreated
                    ? "Checkout collects your name and email, then opens the secure payment page."
                    : isFinal
                    ? `Payment ${displayStatus}. You can download the invoice below.`
                    : "Your payment address is ready on the checkout page."}
                </p>
                <div className="mt-4 grid gap-3">
                  {isCreated ? (
                    <Button
                      value={updating ? "Starting..." : "Checkout"}
                      variant="primary"
                      disabled={updating}
                      onClick={openCheckout}
                      className="w-full border-0 text-white"
                    />
                  ) : fetched?.txn_id ? (
                    <Link
                      href={buildCheckoutDetailUrl(fetched.txn_id)}
                      className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-primary px-4 text-sm font-semibold text-white"
                    >
                      <ExternalLink size={17} />
                      {isFinal ? "View payment" : "Open checkout"}
                    </Link>
                  ) : null}
                  <Button
                    value="Download Invoice PDF"
                    icon={<Download size={17} />}
                    onClick={downloadInvoice}
                    className="w-full text-theme-text"
                  />
                </div>
              </section>
            </aside>
          </section>
        )}

        <Modal
          open={checkoutOpen}
          title="Buyer details"
          description="Enter your name and email to continue to checkout."
          onClose={() => (updating ? null : setCheckoutOpen(false))}
        >
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-sm font-semibold text-theme-text">
                First Name
              </label>
              <Input
                value={buyer.firstname}
                onChange={(e) =>
                  setBuyer((c) => ({ ...c, firstname: e.target.value }))
                }
                placeholder="First name"
                rounded="rounded-full"
                inputClassName="!border-0"
                error={buyerErrors.firstname}
              />
              {buyerErrors.firstname ? (
                <p className="mt-1 text-xs font-semibold text-red-400">{buyerErrors.firstname}</p>
              ) : null}
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-theme-text">
                Last Name
              </label>
              <Input
                value={buyer.lastname}
                onChange={(e) =>
                  setBuyer((c) => ({ ...c, lastname: e.target.value }))
                }
                placeholder="Last name"
                rounded="rounded-full"
                inputClassName="!border-0"
                error={buyerErrors.lastname}
              />
              {buyerErrors.lastname ? (
                <p className="mt-1 text-xs font-semibold text-red-400">{buyerErrors.lastname}</p>
              ) : null}
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-theme-text">
                Email
              </label>
              <Input
                value={buyer.email}
                onChange={(e) => setBuyer((c) => ({ ...c, email: e.target.value }))}
                placeholder="you@example.com"
                type="email"
                rounded="rounded-full"
                inputClassName="!border-0"
                error={buyerErrors.email}
              />
              {buyerErrors.email ? (
                <p className="mt-1 text-xs font-semibold text-red-400">{buyerErrors.email}</p>
              ) : null}
            </div>
            <Button
              value={updating ? "Starting checkout..." : "Submit"}
              variant="primary"
              disabled={updating}
              onClick={submitCheckout}
              className="w-full border-0 text-white"
            />
          </div>
        </Modal>

        <Snackbar
          open={toast.open}
          message={toast.message}
          tone={toast.tone}
          onClose={() => setToast((current) => ({ ...current, open: false }))}
        />
      </div>
    );
  }

  const shippingText = values.collectShippingAddress
    ? "Required at checkout"
    : "Not collected";
  const noteText = values.allowBuyerNote ? "Allowed" : "Disabled";
  const downloadPreview = () => {
    downloadHtmlFile(
      buildInvoicePreviewHtml(values, checkoutHref),
      getInvoiceFilename(values),
    );
    setToast({
      open: true,
      message: "Invoice preview downloaded.",
      tone: "success",
    });
  };

  return (
    <div className="space-y-6 pb-4">
      <MerchantToolPageHeader
        title="Generated Invoice"
        description="Review the invoice details, download a preview, or open the customer checkout link."
        icon={ReceiptText}
        actions={
          <Link
            href={INVOICE_MAKER_ROUTE}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-input-border bg-input-bg px-5 text-sm font-semibold text-secondary-text transition hover:border-primary hover:text-primary sm:w-fit"
          >
            <ArrowLeft size={16} />
            Edit invoice
          </Link>
        }
      />

      <section className="grid gap-6 xl:grid-cols-[minmax(0,0.92fr)_minmax(360px,0.58fr)]">
        <article className="rounded-[24px] border border-input-border bg-primary-bg p-3 shadow-[0_24px_80px_rgba(0,0,0,0.1)] sm:p-4">
          <div className="rounded-[18px] bg-white p-5 text-slate-950 ring-1 ring-black/5 sm:p-8">
            <header className="grid gap-6 border-b-2 border-slate-950 pb-6 sm:grid-cols-[minmax(0,1fr)_minmax(15rem,0.75fr)] sm:items-start">
              <div>
                <p className="text-2xl font-black tracking-[0.08em] text-slate-950">
                  ECO BANX
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-500">
                  Secure crypto payment invoice
                </p>
                <p className="mt-5 max-w-xl text-sm leading-6 text-slate-600">
                  {values.requestDescription || "Payment request invoice."}
                </p>
              </div>

              <div className="space-y-3 sm:text-right">
                <p className="text-4xl font-black tracking-[0.08em] text-slate-950">
                  INVOICE
                </p>
                <div className="space-y-2 rounded-[14px] border border-slate-200 bg-slate-50 p-4">
                  <InvoiceMetaLine
                    label="Invoice No."
                    value={values.invoice || "INV-0001"}
                  />
                  {values.txn ? (
                    <InvoiceMetaLine label="Transaction ID" value={values.txn} />
                  ) : null}
                  <InvoiceMetaLine label="Issue date" value={summary.issueDate} />
                  <InvoiceMetaLine label="Due" value={summary.dueDate} />
                  <InvoiceMetaLine
                    label="Status"
                    value={txnData?.status ? String(txnData.status).toUpperCase() : summary.status}
                  />
                </div>
              </div>
            </header>

            <section className="grid gap-4 py-6 md:grid-cols-2">
              <InvoiceInfoBlock title="Bill From">
                <p className="font-black text-slate-950">Eco Banx Merchant</p>
                <p className="break-all">Merchant ID: {values.merchantId}</p>
                <p className="break-all">
                  IPN: {values.ipnUrl || "Account default"}
                </p>
              </InvoiceInfoBlock>

              <InvoiceInfoBlock title="Bill To">
                <p className="font-black text-slate-950">{values.buyerName || "Customer / Buyer"}</p>
                <p>{values.buyerEmail || "Buyer details collected at checkout"}</p>
                <p>{shippingText}</p>
              </InvoiceInfoBlock>
            </section>

            <div className="overflow-x-auto rounded-[14px] border border-slate-200">
              <div className="grid min-w-[620px] grid-cols-[minmax(0,1.7fr)_5rem_9rem_9rem] bg-slate-950 px-4 py-3 text-xs font-black uppercase tracking-[0.08em] text-white">
                <span>Description</span>
                <span className="text-center">Qty</span>
                <span className="text-right">Unit price</span>
                <span className="text-right">Amount</span>
              </div>
              <div className="grid min-w-[620px] grid-cols-[minmax(0,1.7fr)_5rem_9rem_9rem] border-b border-slate-200 px-4 py-4 text-sm text-slate-700">
                <span className="font-semibold text-slate-950">
                  {values.requestDescription || "Payment request"}
                </span>
                <span className="text-center">1</span>
                <span className="text-right">{summary.subtotalLabel}</span>
                <span className="text-right font-black text-slate-950">
                  {summary.subtotalLabel}
                </span>
              </div>
            </div>

            <section className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.48fr)]">
              <div className="rounded-[16px] border border-violet-100 bg-violet-50 p-5">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-violet-600">
                    Payment request
                  </p>
                  {txnData?.status ? (
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${
                        txnData.status === "confirmed"
                          ? "bg-emerald-100 text-emerald-700"
                          : txnData.status === "failed" || txnData.status === "expired"
                          ? "bg-red-100 text-red-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {txnData.status}
                    </span>
                  ) : null}
                </div>
                <p className="mt-2 text-2xl font-black text-slate-950">
                  {summary.requestLabel}
                </p>

                {txnData?.address ? (
                  <div className="mt-4 space-y-3 rounded-[14px] border border-violet-200 bg-white p-3.5">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Deposit Address ({txnData.network || values.network})
                      </span>
                      <div className="mt-1 flex items-center justify-between gap-2">
                        <span className="min-w-0 flex-1 break-all font-mono text-xs font-bold text-slate-950">
                          {txnData.address}
                        </span>
                        <CopyButton
                          value={txnData.address}
                          label="Copy address"
                          copiedLabel="Copied"
                          onCopied={() =>
                            setToast({
                              open: true,
                              message: "Deposit address copied.",
                              tone: "success",
                            })
                          }
                        />
                      </div>
                    </div>

                    {txnData.qrcode ? (
                      <div className="pt-2 border-t border-slate-100 flex items-center gap-3">
                        <img
                          src={txnData.qrcode}
                          alt="Payment QR"
                          className="h-16 w-16 rounded-lg border border-slate-200 bg-white p-1"
                        />
                        <p className="text-xs text-slate-500 leading-relaxed">
                          Scan with your crypto wallet to pay directly.
                        </p>
                      </div>
                    ) : null}
                  </div>
                ) : null}

                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Buyer note: {noteText}. Shipping address: {shippingText}.
                </p>
              </div>

              <div className="rounded-[16px] border border-slate-200 bg-slate-50 p-4">
                <InvoiceTotalLine label="Subtotal" value={summary.subtotalLabel} />
                <InvoiceTotalLine label="Tax" value={summary.taxLabel} />
                <InvoiceTotalLine label="Shipping" value={summary.shippingLabel} />
                <InvoiceTotalLine value={summary.totalLabel} grand />
              </div>
            </section>

            <footer className="mt-6 border-t border-slate-200 pt-4 text-sm leading-6 text-slate-500">
              This invoice is payable through the secure Eco Banx checkout link.
              The payment page uses the same invoice values shown here.
            </footer>
          </div>
        </article>

        <aside className="space-y-4 xl:sticky xl:top-6">
          <section className="rounded-[24px] border border-input-border bg-primary-bg p-5 shadow-[0_24px_80px_rgba(0,0,0,0.1)]">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-black text-theme-text">Checkout Link</h2>
                <p className="mt-1 text-sm leading-6 text-secondary-text">
                  Share this URL with the buyer or open it to test the checkout page.
                </p>
              </div>
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Link2 size={18} />
              </span>
            </div>

            <div className="flex items-center gap-2 rounded-[18px] border border-input-border bg-input-bg p-3">
              <p className="min-w-0 flex-1 truncate font-mono text-xs text-theme-text">
                {checkoutHref}
              </p>
              <CopyButton
                value={checkoutHref}
                label="Copy checkout link"
                copiedLabel="Copied checkout link"
                onCopied={() =>
                  setToast({
                    open: true,
                    message: "Checkout link copied.",
                    tone: "success",
                  })
                }
              />
            </div>

            <div className="mt-4 grid gap-3">
              <Button
                value="Download Preview"
                icon={<Download size={17} />}
                onClick={downloadPreview}
                className="w-full text-theme-text"
              />
              <a
                href={checkoutHref}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-primary px-4 text-sm font-semibold text-white shadow-[0_14px_32px_rgba(75, 71, 255,0.24)] transition hover:bg-primary-hover"
              >
                <ExternalLink size={17} />
                Open Checkout
              </a>
            </div>
          </section>

          <section className="rounded-[24px] border border-input-border bg-input-bg p-5">
            <div className="flex items-center gap-2 text-sm font-bold text-theme-text">
              <Copy size={16} className="text-primary" />
              Generated line
            </div>
            <p className="mt-2 text-sm leading-6 text-secondary-text">
              Form details are encoded into the invoice URL. The checkout page
              reads the same values and opens the Eco Banx payment experience.
            </p>
          </section>
        </aside>
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
