"use client";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  CalendarDays,
  FilterX,
  History,
  Eye,
  Download,
} from "lucide-react";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";
import Table from "@/components/ui/Table";
import TableSearch from "@/components/ui/Table/TableSearch";
import TableFilter from "@/components/ui/Table/TableFilter";
import DateFilter from "@/components/ui/DateFilter";
import TablePagination from "@/components/ui/Table/TablePagination";
import Modal from "@/components/ui/Modal";
import PageTopBanner from "@/components/ui/PageTopBanner";
import Snackbar from "@/components/ui/Snackbar";
import CopyButton from "@/components/ui/CopyButton";
import ExportIcon from "@/components/assets/Dashboard/export.svg";
import Skeleton from "@/components/ui/skeleton";
import apiClient, { getApiErrorPayload } from "@/lib/axiosInterceptor";
import { useStoredUserVerification } from "@/lib/user-verification-storage";
import { getAccountBaseRoute } from "@/utils/accountRoutes";

const PAGE_SIZE = 8;

const TABS = [
  { key: "deposit", label: "Deposit", icon: ArrowDownToLine },
  { key: "withdraw", label: "Withdraw", icon: ArrowUpFromLine },
  { key: "payin", label: "Payin", icon: ArrowDownToLine },
  { key: "payout", label: "Payout", icon: ArrowUpFromLine },
  // { key: "transaction", label: "Transaction", icon: History },
  { key: "apihistory", label: "API History", icon: History },
];


const amountFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 8,
});

const WITHDRAW_STATUS_CHIP_MAP = {
  Pending: {
    dot: "bg-amber-400",
    text: "text-amber-400",
    bg: "bg-amber-400/15",
  },
  Processing: {
    dot: "bg-sky-400",
    text: "text-sky-400",
    bg: "bg-sky-400/15",
  },
  Approved: {
    dot: "bg-primary-text",
    text: "text-primary-text",
    bg: "bg-primary-text/10",
  },
  Completed: {
    dot: "bg-primary-text",
    text: "text-primary-text",
    bg: "bg-primary-text/10",
  },
  Confirmed: {
    dot: "bg-primary-text",
    text: "text-primary-text",
    bg: "bg-primary-text/10",
  },
  Rejected: {
    dot: "bg-red-400",
    text: "text-red-400",
    bg: "bg-red-400/10",
  },
  Failed: {
    dot: "bg-red-400",
    text: "text-red-400",
    bg: "bg-red-400/10",
  },
  Expired: {
     dot: "bg-red-400",
    text: "text-red-400",
    bg: "bg-red-400/10",
  },
  Processing : {
     dot: "bg-amber-400",
    text: "text-amber-400",
    bg: "bg-amber-400/10",
  },
};

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

function normalizeStatus(value) {
  const status = String(value || "Pending").trim();
  if (!status) return "Pending";

  return status
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatDateTime(value) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function prettyJson(value) {
  if (value == null || value === "") return "-";

  if (typeof value === "string") {
    try {
      return JSON.stringify(JSON.parse(value), null, 2);
    } catch {
      return value;
    }
  }

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function formatTokenAmount(value, symbol = "") {
  const amount = Number(value);
  const formatted = Number.isFinite(amount) ? amountFormatter.format(amount) : "-";
  return symbol ? `${formatted} ${symbol}` : formatted;
}

function shortenValue(value, start = 8, end = 6) {
  if (!value) return "-";
  const text = String(value);
  if (text.length <= start + end + 3) return text;
  return `${text.slice(0, start)}...${text.slice(-end)}`;
}

function getWithdrawalList(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.withdrawals)) return payload.withdrawals;
  if (Array.isArray(payload?.data?.withdrawals)) return payload.data.withdrawals;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

function mapWithdrawalRow(item) {
  const id = item?._id || item?.id || "";
  const assetSymbol = item?.assetId?.assetSymbol || item?.assetSymbol || "";
  const assetName = item?.assetId?.assetName || assetSymbol || "Asset";
  const networkSymbol = item?.networkId?.networkSymbol || item?.networkSymbol || "";
  const networkName = item?.networkId?.networkName || networkSymbol || "Network";
  const status = normalizeStatus(item?.status);

  return {
    id,
    withdrawalId: id,
    customer: item?.merchantId || item?.userId || "Merchant",
    email: item?.userId || "",
    method: networkName,
    asset: assetSymbol ? `${assetName}` : assetName,
    network: networkSymbol ? `${networkName} (${networkSymbol})` : networkName,
    amount: formatTokenAmount(item?.amount, assetSymbol),
    fee: formatTokenAmount(item?.fee ?? item?.withdrawFee, assetSymbol),
    netAmount: formatTokenAmount(item?.netAmount, assetSymbol),
    totalAmount: formatTokenAmount(item?.totalAmount, assetSymbol),
    status,
    date: formatDateTime(item?.createdAt),
    rawDate: item?.createdAt,
    reference: id,
    receiverAddress: item?.receiverAddress || item?.toAddress || "",
    apiKeyName: item?.apiKeyName || null,
    raw: item,
  };
}

function hasDetailValue(value) {
  return value !== null && value !== undefined && value !== "";
}

function formatButtonType(value) {
  const text = String(value || "").trim();
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function getDepositList(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.deposits)) return payload.deposits;
  if (Array.isArray(payload?.data?.deposits)) return payload.data.deposits;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

function mapDepositRow(item) {
  const id = item?._id || item?.id || "";
  const symbol = item?.symbol || "";
  const network = item?.network || "";

  return {
    id,
    depositId: id,
    customer: item?.userId || "User",
    email: "",
    method: network,
    asset: symbol || network,
    network,
    amount: formatTokenAmount(item?.amount, symbol),
    receivedAmount: formatTokenAmount(item?.receivedAmount, symbol),
    status: normalizeStatus(item?.status),
    date: formatDateTime(item?.createdAt),
    rawDate: item?.createdAt,
    reference: item?.txId || id,
    address: item?.address || "",
    from: item?.from || "",
    txId: item?.txId || "",
    contractAddress: item?.contractAddress || "",
    type: item?.type || "",
    buttonType: item?.buttonType || "",
    decimal: item?.decimal,
    apiKeyName: item?.apiKeyName || item?.transaction?.apiKeyName || null,
    raw: item,
  };
}

function buildDepositDetailRows(deposit, showApiKey = false) {
  if (!deposit) return [];

  const symbol = deposit.symbol || "";
  // Buyer/item fields live on the nested `transaction` object
  // (see GET deposit-history/:id -> data.transaction), not on the
  // top-level deposit. Fall back to top-level for backwards compat.
  const tx = deposit.transaction || deposit.raw?.transaction || {};
  const pick = (...values) => values.find((v) => hasDetailValue(v));

  return [
    // ["Deposit ID", deposit._id || deposit.id],
    // ["User ID", deposit.userId],
    ["Address", deposit.address],
    ["From", deposit.from],
    ["Transaction Hash", deposit.txId],
    ["Contract Address", deposit.contractAddress],
    ["Network", deposit.network],
    ...(showApiKey
      ? [["API Key", deposit.apiKeyName || deposit.transaction?.apiKeyName]]
      : []),
    ["Type", deposit.type],
    ["Button Type", formatButtonType(deposit.buttonType ?? deposit.raw?.buttonType)],
    ["Symbol", symbol],
    ["Amount", detailAmount(deposit.amount, symbol)],
    ["Received Amount", detailAmount(deposit.receivedAmount, symbol)],
    ["Decimal", deposit.decimal],
    ["Type", deposit.type],
    ["Status", deposit.status],
    ["Buyer Firstname", pick(tx.buyerFirstname, deposit.buyerFirstname)],
    ["Buyer Lastname", pick(tx.buyerLastname, deposit.buyerLastname)],
    ["Buyer Email", pick(tx.buyerEmail, deposit.buyerEmail)],
    ["itemName", pick(tx.itemName, tx.item_name, deposit.itemName)],
    ["itemDescription", pick(tx.item_description, tx.itemDescription, deposit.itemDescription)],
    ["itemNumber", pick(tx.itemNumber, tx.item_number, deposit.itemNumber)],
    ["invoice", pick(tx.invoice, deposit.invoice)],
    ["itemQuantity", pick(tx.item_quantity, tx.itemQuantity, deposit.itemQuantity)],
    ["taxAmount", pick(tx.tax_amount, tx.taxAmount, deposit.taxAmount)],
    ["shippingCost", pick(tx.shipping_cost, tx.shippingCost, deposit.shippingCost)],
    ["successUrl", pick(tx.successUrl, tx.success_url, deposit.successUrl)],
    ["cancelUrl", pick(tx.cancelUrl, tx.cancel_url, deposit.cancelUrl)],
    ["ipnUrl", pick(tx.ipnUrl, tx.ipn_url, deposit.ipnUrl)],
    // ["Created At", detailDate(deposit.createdAt)],
    // ["Updated At", detailDate(deposit.updatedAt)],
    // ["Version", deposit.__v],
  ].filter(([, value]) => hasDetailValue(value));
}

function buildLinkedTransactionRows(transaction) {
  if (!transaction) return [];

  const currency1 = transaction.currency1 || "";
  const currency2 = transaction.currency2 || "";
  const pair = [currency1, currency2].filter(Boolean).join(" / ");

  return [
    // ["Txn ID", transaction.txnId],
    // ["Status", transaction.status ? normalizeStatus(transaction.status) : ""],
    // ["Type", transaction.type],
    // ["Network", transaction.network],
    ["Amount", detailAmount(transaction.amount, currency1)],
    // ["Received Amount", detailAmount(transaction.receivedAmount, currency1)],
    ["Amount In Currency2", detailAmount(transaction.amountInCurrency2, currency2)],
    ["Crypto Amount", transaction.cryptoAmount],
    // ["Currencies", pair],
    ["Address", transaction.address],
    ["Buyer Name", transaction.buyerName || transaction.fullName],
    ["Buyer Email", transaction.buyerEmail],
    ["Item Name", transaction.itemName],
    ["Item Number", transaction.itemNumber],
    ["Invoice", transaction.invoice],
    ["Custom", transaction.custom],
    ["IPN URL", transaction.ipnUrl],
    ["Success URL", transaction.successUrl],
    ["Cancel URL", transaction.cancelUrl],
    ["Checkout URL", transaction.checkoutUrl],
    ["QR Code URL", transaction.qrcodeUrl],
    ["Transaction Hash", transaction.txnHash],
    ["Created At", detailDate(transaction.createdAt)],
    ["Updated At", detailDate(transaction.updatedAt)],
  ].filter(([, value]) => hasDetailValue(value));
}


function detailValue(value) {
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
}

function detailAmount(value, symbol) {
  return hasDetailValue(value) ? formatTokenAmount(value, symbol) : "";
}

function detailDate(value) {
  return hasDetailValue(value) ? formatDateTime(value) : "";
}

function buildWithdrawalDetailRows(withdrawal, showApiKey = false) {
  if (!withdrawal) return [];

  const assetSymbol = withdrawal.assetId?.assetSymbol || withdrawal.assetSymbol || "";

  return [
    // ["Withdrawal ID", withdrawal._id || withdrawal.id],
    // ["Merchant ID", withdrawal.merchantId],
    // ["User ID", withdrawal.userId],
    ["Wallet Address ID", withdrawal.walletAddressId],
    // ["Wallet ID", withdrawal.walletId],
    // ["Asset", withdrawal.assetId?.assetNamecreate_transfer],
    ["Asset Symbol", assetSymbol],
    // ["Network", withdrawal.networkId?.networkName],
    ["Network Symbol", withdrawal.networkId?.networkSymbol],
    ...(showApiKey ? [["API Key", withdrawal.apiKeyName]] : []),
    ["Amount", detailAmount(withdrawal.amount, assetSymbol)],
    // ["Fee", detailAmount(withdrawal.fee, assetSymbol)],
    ["Withdraw Fee", detailAmount(withdrawal.fee, assetSymbol)],
    ["Net Amount", detailAmount(withdrawal.netAmount, assetSymbol)],
    // ["Total Amount", detailAmount(withdrawal.totalAmount, assetSymbol)],
    ["Receiver Address", withdrawal.receiverAddress],
    ["Transaction Hash", withdrawal.transactionHash || withdrawal.txHash],
    ["Block Number", withdrawal.blockNumber],
    ["Gas Fee", withdrawal.gasFee],
    ["Explorer URL", withdrawal.explorerUrl],
    ["Status", withdrawal.status ? normalizeStatus(withdrawal.status) : ""],
    ["Failure Reason", withdrawal.failureReason],
    ["Rejection Reason", withdrawal.rejectionReason],
    // ["Admin ID", withdrawal.adminId],
    ["Approved At", detailDate(withdrawal.approvedAt)],
    ["Rejected At", detailDate(withdrawal.rejectedAt)],
    // ["Created At", detailDate(withdrawal.createdAt)],
    // ["Updated At", detailDate(withdrawal.updatedAt)],
    // ["Version", withdrawal.__v],
  ].filter(([, value]) => hasDetailValue(value));
}


function getFilterLabel(option) {
  if (!option) return null;
  if (typeof option === "string") {
    return option;
  }

  return option.label ?? option.value ?? null;
}

function TransactionDetails({ transaction, onClose }) {
  return (
    <Modal
      open={Boolean(transaction)}
      onClose={onClose}
      title={transaction ? "Transaction details" : undefined}
      description="Review the selected transaction and copy its identifiers when needed."
      className="max-w-2xl"
    >
      {transaction ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-input-border bg-secondary-bg p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary-text">
              Transaction ID
            </p>
            <div className="mt-3 flex items-center gap-3">
              <span className="min-w-0 flex-1 truncate text-sm font-semibold text-text">
                {transaction.id}
              </span>
              <CopyButton value={transaction.id} />
            </div>
          </div>

          <div className="rounded-2xl border border-input-border bg-secondary-bg p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary-text">
              Status
            </p>
            <div className="mt-3">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium leading-none ${
                  transaction.status === "Success"
                    ? "bg-primary-text/10 text-primary-text"
                    : transaction.status === "Pending"
                      ? "bg-amber-400/15 text-amber-400"
                      : transaction.status === "Failed"
                        ? "bg-red-400/10 text-red-400"
                        : "bg-blue-400/10 text-blue-400"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    transaction.status === "Success"
                      ? "bg-primary-text"
                      : transaction.status === "Pending"
                        ? "bg-amber-400"
                        : transaction.status === "Failed"
                          ? "bg-red-400"
                          : "bg-blue-400"
                  }`}
                />
                {transaction.status}
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-input-border bg-secondary-bg p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary-text">
              Customer
            </p>
            <p className="mt-3 text-sm font-semibold text-text">
              {transaction.customer}
            </p>
            <p className="mt-1 text-xs text-secondary-text">
              {transaction.email}
            </p>
          </div>

          <div className="rounded-2xl border border-input-border bg-secondary-bg p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary-text">
              Amount
            </p>
            <p className="mt-3 text-sm font-semibold text-text">
              {transaction.amount}
            </p>
            <p className="mt-1 text-xs text-secondary-text">
              {transaction.method}
            </p>
          </div>

          <div className="rounded-2xl border border-input-border bg-secondary-bg p-4 sm:col-span-2">
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary-text">
                  Date
                </p>
                <p className="mt-3 text-sm font-semibold text-text">
                  {transaction.date}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary-text">
                  Reference
                </p>
                <div className="mt-3 flex items-center gap-3">
                  <p className="min-w-0 flex-1 truncate text-sm font-semibold text-text">
                    {transaction.reference}
                  </p>
                  <CopyButton value={transaction.reference} />
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary-text">
                  Action
                </p>
                <p className="mt-3 text-sm text-secondary-text">
                  This record is ready for reconciliation or support review.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end sm:col-span-2">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-11 items-center justify-center rounded-full border border-input-border bg-input-bg px-5 text-sm font-semibold text-text transition hover:border-primary hover:text-primary"
            >
              Close
            </button>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}


function DetailCell({ label, value, copy = false }) {
  const display = detailValue(value);

  return (
    <div className="min-w-0 rounded-2xl border border-input-border bg-secondary-bg p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary-text">
        {label}
      </p>
      <div className="mt-3 flex min-w-0 items-center gap-3">
        <span className="min-w-0 flex-1 break-all text-sm font-semibold text-text">
          {display}
        </span>
        {copy ? <CopyButton value={display} /> : null}
      </div>
    </div>
  );
}

function WithdrawalDetailsModal({ withdrawal, loading, error, onClose, showApiKey = false }) {
  const detailRows = useMemo(
    () => buildWithdrawalDetailRows(withdrawal, showApiKey),
    [withdrawal, showApiKey],
  );
  const copyLabels = new Set([
    "Withdrawal ID",
    "Merchant ID",
    "User ID",
    "Wallet Address ID",
    "Wallet ID",
    "To Address",
    "From Address",
    "Receiver Address",
    "Transaction Hash",
    "Explorer URL",
  ]);

  return (
    <Modal
      open={Boolean(withdrawal) || loading}
      onClose={onClose}
      title="Withdrawal details"
      description="Full withdrawal record from the merchant withdrawal API."
      className="max-w-4xl"
    >
      {loading ? (
        <div className="rounded-2xl border border-input-border bg-secondary-bg p-5 text-sm font-semibold text-secondary-text">
          Loading withdrawal details...
        </div>
      ) : null}

      {error ? (
        <div className="mb-4 rounded-2xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-400">
          {error}
        </div>
      ) : null}

      {withdrawal ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {detailRows.map(([label, value]) => (
            <DetailCell
              key={label}
              label={label}
              value={value}
              copy={copyLabels.has(label)}
            />
          ))}
        </div>
      ) : null}
    </Modal>
  );
}
function DepositDetailsModal({ deposit, loading, error, onClose, showApiKey = false }) {
  const detailRows = useMemo(
    () => buildDepositDetailRows(deposit, showApiKey),
    [deposit, showApiKey],
  );
  const transactionRows = useMemo(
    () => buildLinkedTransactionRows(deposit?.transaction),
    [deposit],
  );
  const copyLabels = new Set([
    "Deposit ID",
    "User ID",
    "Address",
    "From",
    "Transaction Hash",
    "Contract Address",
    "Txn ID",
    "IPN URL",
    "Success URL",
    "Cancel URL",
    "Checkout URL",
    "QR Code URL",
  ]);

  return (
    <Modal
      open={Boolean(deposit) || loading}
      onClose={onClose}
      title="Deposit details"
      description="Full deposit record from the user deposit history API."
      className="max-w-4xl"
    >
      {/* {loading ? (
        <div className="rounded-2xl border border-input-border bg-secondary-bg p-5 text-sm font-semibold text-secondary-text">
          Loading deposit details...
        </div>
      ) : null} */}

      {error ? (
        <div className="mb-4 rounded-2xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-400">
          {error}
        </div>
      ) : null}

      {deposit ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {detailRows.map(([label, value]) => (
            <DetailCell
              key={label}
              label={label}
              value={value}
              copy={copyLabels.has(label)}
            />
          ))}
        </div>
      ) : null}

      {deposit && !loading ? (
        <div className="mt-6">
          <p className="text-xs font-bold uppercase tracking-[0.08em] text-primary-text">
            Linked transaction
          </p>
          {transactionRows.length > 0 ? (
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              {transactionRows.map(([label, value]) => (
                <DetailCell
                  key={`tx-${label}`}
                  label={label}
                  value={value}
                  copy={copyLabels.has(label)}
                />
              ))}
            </div>
          ) : (
            <p className="mt-3 rounded-2xl border border-input-border bg-secondary-bg p-4 text-sm text-secondary-text">
              No linked transaction for this deposit.
            </p>
          )}
        </div>
      ) : null}
    </Modal>
  );
}

function ApiCallDetailsModal({ record, loading, error, onClose }) {
  if (!record && !loading) return null;

  const raw = record?.raw || record || {};

  return (
    <Modal
      open={Boolean(record) || loading}
      onClose={onClose}
      title="API Call Details"
      description="Full request and response for the selected API call."
      className="max-w-3xl"
    >
      {loading ? (
        <div className="rounded-2xl border border-input-border bg-secondary-bg p-5 text-sm font-semibold text-secondary-text">
          Loading API call details...
        </div>
      ) : null}

      {error ? (
        <div className="mb-4 rounded-2xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-400">
          {error}
        </div>
      ) : null}

      {record ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {/* <div className="rounded-2xl border border-input-border bg-secondary-bg p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary-text">
              Request ID
            </p>
            <p className="mt-3 break-all text-sm font-mono text-text">
              {raw?._id || raw?.id || "-"}
            </p>
          </div> */}

          <div className="rounded-2xl border border-input-border bg-secondary-bg p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary-text">
              Endpoint
            </p>
            <p className="mt-3 break-all text-sm font-mono text-text">
              {raw?.endpoint || "-"}
            </p>
          </div>

          <div className="rounded-2xl border border-input-border bg-secondary-bg p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary-text">
              Method
            </p>
            <p className="mt-3 text-sm font-medium text-text">{raw?.method || "-"}</p>
          </div>

          <div className="rounded-2xl border border-input-border bg-secondary-bg p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary-text">
              Response Status
            </p>
            <p className="mt-3 text-sm font-medium text-text">
              {raw?.responseStatus ?? "-"}
            </p>
          </div>

          <div className="rounded-2xl border border-input-border bg-secondary-bg p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary-text">
              IP Address
            </p>
            <p className="mt-3 text-sm font-mono text-text">{raw?.ip || "-"}</p>
          </div>

          <div className="rounded-2xl border border-input-border bg-secondary-bg p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary-text">
              API Key
            </p>
            <p className="mt-3 text-sm font-medium text-text">{raw?.apiKeyName || "-"}</p>
          </div>

          <div className="rounded-2xl border border-input-border bg-secondary-bg p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary-text">
              Created At
            </p>
            <p className="mt-3 text-sm font-medium text-text">
              {formatDateTime(raw?.createdAt)}
            </p>
          </div>

          <div className="sm:col-span-2 rounded-2xl border border-input-border bg-secondary-bg p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary-text">
              Request Body
            </p>
            <pre className="mt-3 overflow-x-auto whitespace-pre-wrap break-all text-xs text-text">
              {prettyJson(raw?.requestBody)}
            </pre>
          </div>

          <div className="sm:col-span-2 rounded-2xl border border-input-border bg-secondary-bg p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary-text">
              Message
            </p>
            <p className="mt-3 break-all text-sm text-text">{raw?.message || "-"}</p>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}

function exportRowsToCsv(rows, tabLabel) {
  const headers = [
    "Transaction ID",
    "Customer",
    "Email",
    "Method",
    "Amount",
    "Status",
    "Date",
    "Reference",
  ];
  const escape = (value) => `"${String(value).replace(/"/g, '""')}"`;

  const csv = [
    headers.join(","),
    ...rows.map((row) =>
      [
        row.id,
        row.customer,
        row.email,
        row.method,
        row.amount,
        row.status,
        row.date,
        row.reference,
      ]
        .map(escape)
        .join(","),
    ),
  ].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `transaction-history-${tabLabel.toLowerCase()}.csv`;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function Page() {
  const [loading, setLoading] = useState(true);
  const verification = useStoredUserVerification();

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 250);
    return () => window.clearTimeout(timer);
  }, []);

const baseRoute = getAccountBaseRoute();
  const [activeTab, setActiveTab] = useState("deposit");
  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState(null);
  const [methodFilter, setMethodFilter] = useState(null);
  const [buttonTypeFilter, setButtonTypeFilter] = useState(null);
  const [dateFilter, setDateFilter] = useState({ from: "", to: "", preset: "" });
  const [page, setPage] = useState(1);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
  const [withdrawalRows, setWithdrawalRows] = useState([]);
  const [payinRows, setPayinRows] = useState([]);
  const [selectedPayin, setSelectedPayin] = useState(null);
  const [payinLoading, setPayinLoading] = useState(false);
  const [payinError, setPayinError] = useState("");
  const [payinDetailLoading, setPayinDetailLoading] = useState(false);
  const [payinDetailError, setPayinDetailError] = useState("");
  const [withdrawalLoading, setWithdrawalLoading] = useState(false);
  const [withdrawalError, setWithdrawalError] = useState("");
  const [withdrawPagination, setWithdrawPagination] = useState({
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    totalPages: 1,
  });
  const [payoutRows, setPayoutRows] = useState([]);
  const [payoutLoading, setPayoutLoading] = useState(false);
  const [payoutError, setPayoutError] = useState("");
  const [payoutPagination, setPayoutPagination] = useState({
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    totalPages: 1,
  });
  const [withdrawalDetailLoading, setWithdrawalDetailLoading] = useState(false);
  const [withdrawalDetailError, setWithdrawalDetailError] = useState("");
  const [depositRows, setDepositRows] = useState([]);
  const [depositLoading, setDepositLoading] = useState(false);
  const [depositError, setDepositError] = useState("");
  const [selectedDeposit, setSelectedDeposit] = useState(null);
  const [depositDetailLoading, setDepositDetailLoading] = useState(false);
  const [depositDetailError, setDepositDetailError] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [depositPagination, setDepositPagination] = useState({
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    totalPages: 1,
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: "", tone: "success" });

  const [apiHistoryRows, setApiHistoryRows] = useState([]);
  const [apiHistoryLoading, setApiHistoryLoading] = useState(false);
  const [apiHistoryError, setApiHistoryError] = useState("");
  const [apiHistoryPagination, setApiHistoryPagination] = useState({
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    totalPages: 1,
  });
  const [selectedApiCall, setSelectedApiCall] = useState(null);

  const visibleTabs = useMemo(
    () =>
      verification.kind === "kyc"
         ? TABS.filter((tab) => !["payin", "payout", "transaction", "apihistory"].includes(tab.key))
        : TABS,
    [verification.kind],
  );

  useEffect(() => {
    if (visibleTabs.some((tab) => tab.key === activeTab)) return;
    const timer = window.setTimeout(() => {
      setActiveTab(visibleTabs[0]?.key ?? "deposit");
    }, 0);

    return () => window.clearTimeout(timer);
  }, [activeTab, visibleTabs]);

  const activeTabConfig = visibleTabs.find((tab) => tab.key === activeTab) ?? visibleTabs[0] ?? TABS[0];
  const allRows = useMemo(
    () =>
      activeTab === "withdraw"
        ? withdrawalRows
        : activeTab === "payout"
          ? payoutRows
          : activeTab === "deposit"
            ? depositRows
            : activeTab === "payin"
              ? payinRows
              : activeTab === "apihistory"
                ? apiHistoryRows
                : [],
    [
      activeTab,
      withdrawalRows,
      payoutRows,
      depositRows,
      payinRows,
      apiHistoryRows,
    ],
  );


  useEffect(() => {
    if (activeTab !== "withdraw") return undefined;

    let cancelled = false;

    const fetchWithdrawals = async () => {
      setWithdrawalLoading(true);
      setWithdrawalError("");

      const params = new URLSearchParams({
        withdrawFrom: "request_withdraw",
        page: String(page),
        limit: String(PAGE_SIZE),
      });
      if (debouncedSearch) params.set("search", debouncedSearch);
      const selectedWithdrawStatus = statusFilter?.value ?? statusFilter;
      if (selectedWithdrawStatus) params.set("status", selectedWithdrawStatus);
      const selectedWithdrawMethod = methodFilter?.value ?? methodFilter;
      if (selectedWithdrawMethod) params.set("method", selectedWithdrawMethod);
      // Day bounds: backend compares raw dates, so cover the full days.
      if (dateFilter.from) params.set("from", `${dateFilter.from}T00:00:00`);
      if (dateFilter.to) params.set("to", `${dateFilter.to}T23:59:59`);

      try {
        const response = await apiClient.get(
          `/merchant/withdrawals?${params.toString()}`,
        );

        if (cancelled) return;

        if (response.data?.success === false) {
          setWithdrawalRows([]);
          setWithdrawPagination({
            page: 1,
            limit: PAGE_SIZE,
            total: 0,
            totalPages: 1,
          });
          setWithdrawalError(
            getResponseMessage(response.data) || "Failed to load withdrawals.",
          );
          return;
        }

        const pagination = response.data?.data?.pagination;
        setWithdrawPagination(
          pagination || {
            page: 1,
            limit: PAGE_SIZE,
            total: 0,
            totalPages: 1,
          },
        );
        setWithdrawalRows(getWithdrawalList(response.data).map(mapWithdrawalRow));
      } catch (error) {
        if (cancelled) return;

        const payload = getApiErrorPayload(error);
        setWithdrawalRows([]);
        setWithdrawalError(
          getResponseMessage(payload) || "Failed to load withdrawals.",
        );
      } finally {
        if (!cancelled) setWithdrawalLoading(false);
      }
    };

    fetchWithdrawals();

    return () => {
      cancelled = true;
    };
  }, [activeTab, page, debouncedSearch, statusFilter, methodFilter, dateFilter.from, dateFilter.to]);

  useEffect(() => {
    if (activeTab !== "payout") return undefined;

    let cancelled = false;

    const fetchPayouts = async () => {
      setPayoutLoading(true);
      setPayoutError("");

      const params = new URLSearchParams({
        page: String(page),
        limit: String(PAGE_SIZE),
      });
      if (debouncedSearch) params.set("search", debouncedSearch);
      const selectedPayoutStatus = statusFilter?.value ?? statusFilter;
      params.set("status", selectedPayoutStatus || "All");
      const selectedPayoutMethod = methodFilter?.value ?? methodFilter;
      if (selectedPayoutMethod) params.set("method", selectedPayoutMethod);
      // Day bounds: backend compares raw dates, so cover the full days.
      if (dateFilter.from) params.set("from", `${dateFilter.from}T00:00:00`);
      if (dateFilter.to) params.set("to", `${dateFilter.to}T23:59:59`);

      try {
        const response = await apiClient.get(
          `/merchant/withdrawals/pending-payouts?${params.toString()}`,
        );

        if (cancelled) return;

        if (response.data?.success === false) {
          setPayoutRows([]);
          setPayoutPagination({
            page: 1,
            limit: PAGE_SIZE,
            total: 0,
            totalPages: 1,
          });
          setPayoutError(
            getResponseMessage(response.data) || "Failed to load payouts.",
          );
          return;
        }

        const pagination = response.data?.data?.pagination;
        setPayoutPagination(
          pagination || {
            page: 1,
            limit: PAGE_SIZE,
            total: 0,
            totalPages: 1,
          },
        );
        setPayoutRows(getWithdrawalList(response.data).map(mapWithdrawalRow));
      } catch (error) {
        if (cancelled) return;

        const payload = getApiErrorPayload(error);
        setPayoutRows([]);
        setPayoutError(
          getResponseMessage(payload) || "Failed to load payouts.",
        );
      } finally {
        if (!cancelled) setPayoutLoading(false);
      }
    };

    fetchPayouts();

    return () => {
      cancelled = true;
    };
  }, [activeTab, page, debouncedSearch, statusFilter, methodFilter, dateFilter.from, dateFilter.to]);

  useEffect(() => {
    if (activeTab !== "deposit") return undefined;

    let cancelled = false;

    const fetchDeposits = async () => {
      setDepositLoading(true);
      setDepositError("");

      const body = {
        page: String(page),
        limit: String(PAGE_SIZE),
        type: "deposit",
      };

      if (debouncedSearch) body.search = debouncedSearch;
      const selectedDepositStatus = statusFilter?.value ?? statusFilter;
      if (selectedDepositStatus) body.status = selectedDepositStatus;
      const selectedDepositButtonType = buttonTypeFilter?.value ?? buttonTypeFilter;
      if (selectedDepositButtonType) body.buttonType = selectedDepositButtonType;
      if (dateFilter.from) body.from = `${dateFilter.from}T00:00:00`;
      if (dateFilter.to) body.to = `${dateFilter.to}T23:59:59`;

      try {
        const response = await apiClient.post(`${baseRoute}/deposit-history`, body);

        if (cancelled) return;

        if (response.data?.success === false) {
          setDepositRows([]);
          setDepositPagination({
            page: 1,
            limit: PAGE_SIZE,
            total: 0,
            totalPages: 1,
          });
          setDepositError(
            getResponseMessage(response.data) || "Failed to load deposits.",
          );
          return;
        }

        const pagination = response.data?.data?.pagination;
        setDepositPagination(
          pagination || {
            page: 1,
            limit: PAGE_SIZE,
            total: 0,
            totalPages: 1,
          },
        );
        setDepositRows(getDepositList(response.data).map(mapDepositRow));
      } catch (error) {
        if (cancelled) return;

        const payload = getApiErrorPayload(error);
        setDepositRows([]);
        setDepositError(
          getResponseMessage(payload) || "Failed to load deposits.",
        );
      } finally {
        if (!cancelled) setDepositLoading(false);
      }
    };

    fetchDeposits();

    return () => {
      cancelled = true;
    };
  }, [activeTab, dateFilter.from, dateFilter.to, debouncedSearch, page, statusFilter, buttonTypeFilter]);

  useEffect(() => {
    if (activeTab !== "payin") return undefined;

    let cancelled = false;

    const fetchPayins = async () => {
      setPayinLoading(true);
      setPayinError("");

      const body = {
        page: String(page),
        limit: String(PAGE_SIZE),
        type: "payIn",
      };

      if (debouncedSearch) body.search = debouncedSearch;
      const selectedPayinStatus = statusFilter?.value ?? statusFilter;
      if (selectedPayinStatus) body.status = selectedPayinStatus;
      const selectedPayinButtonType = buttonTypeFilter?.value ?? buttonTypeFilter;
      if (selectedPayinButtonType) body.buttonType = selectedPayinButtonType;
      if (dateFilter.from) body.from = `${dateFilter.from}T00:00:00`;
      if (dateFilter.to) body.to = `${dateFilter.to}T23:59:59`;

      try {
        const response = await apiClient.post(`${baseRoute}/deposit-history`, body);

        if (cancelled) return;

        if (response.data?.success === false) {
          setPayinRows([]);
          setDepositPagination({
            page: 1,
            limit: PAGE_SIZE,
            total: 0,
            totalPages: 1,
          });
          setPayinError(
            getResponseMessage(response.data) || "Failed to load payins.",
          );
          return;
        }

        const pagination = response.data?.data?.pagination;
        setDepositPagination(
          pagination || {
            page: 1,
            limit: PAGE_SIZE,
            total: 0,
            totalPages: 1,
          },
        );
        setPayinRows(getDepositList(response.data).map(mapDepositRow));
      } catch (error) {
        if (cancelled) return;

        const payload = getApiErrorPayload(error);
        setPayinRows([]);
        setPayinError(
          getResponseMessage(payload) || "Failed to load payins.",
        );
      } finally {
        if (!cancelled) setPayinLoading(false);
      }
    };

    fetchPayins();

    return () => {
      cancelled = true;
    };
  }, [activeTab, dateFilter.from, dateFilter.to, debouncedSearch, page, statusFilter, buttonTypeFilter]);

  useEffect(() => {
    const timer = window.setTimeout(
      () => setDebouncedSearch(searchValue.trim()),
      500,
    );

    return () => window.clearTimeout(timer);
  }, [searchValue]);

  useEffect(() => {
    if (activeTab !== "apihistory") return undefined;

    let cancelled = false;

    const fetchApiHistory = async () => {
      setApiHistoryLoading(true);
      setApiHistoryError("");

      const params = new URLSearchParams({
        page: String(page),
        limit: String(PAGE_SIZE),
      });

      if (debouncedSearch) params.set("search", debouncedSearch);
      const selectedStatus = statusFilter?.value ?? statusFilter;
      if (selectedStatus) params.set("success", selectedStatus === "Success" || selectedStatus === "true");
      // Day bounds: backend compares raw dates, so cover the full days.
      if (dateFilter.from) params.set("from", `${dateFilter.from}T00:00:00`);
      if (dateFilter.to) params.set("to", `${dateFilter.to}T23:59:59`);

      try {
        const response = await apiClient.get(
          `/merchant/api-history?${params.toString()}`,
        );

        if (cancelled) return;

        if (response.data?.success === false) {
          setApiHistoryRows([]);
          setApiHistoryPagination({
            page: 1,
            limit: PAGE_SIZE,
            total: 0,
            totalPages: 1,
          });
          setApiHistoryError(
            getResponseMessage(response.data) || "Failed to load API history.",
          );
          return;
        }

        const data = response.data?.data || {};
        const pagination = data.pagination;
        setApiHistoryPagination(
          pagination || {
            page: 1,
            limit: PAGE_SIZE,
            total: 0,
            totalPages: 1,
          },
        );
        setApiHistoryRows(
          (data.records || []).map((record) => ({
            id: record?._id,
            endpoint: record?.endpoint || "-",
            method: record?.method || "-",
            responseStatus: record?.responseStatus ?? "-",
            // status: record?.success === true ? "Success" : "Failed",
            status:
              record?.success === true
                ? "Success"
                : Number(record?.responseStatus) === 200
                  ? "Success"
                  : "Failed",
            message: record?.message || "",
            ip: record?.ip || "-",
            apiKeyName: record?.apiKeyName || null,
            date: record?.createdAt,
            requestBody: record?.requestBody || null,
            raw: record,
          })),
        );
      } catch (error) {
        if (cancelled) return;

        const payload = getApiErrorPayload(error);
        setApiHistoryRows([]);
        setApiHistoryPagination({
          page: 1,
          limit: PAGE_SIZE,
          total: 0,
          totalPages: 1,
        });
        setApiHistoryError(
          getResponseMessage(payload) || "Failed to load API history.",
        );
      } finally {
        if (!cancelled) setApiHistoryLoading(false);
      }
    };

    fetchApiHistory();

    return () => {
      cancelled = true;
    };
  }, [
    activeTab,
    page,
    debouncedSearch,
    statusFilter,
    dateFilter.from,
    dateFilter.to,
  ]);

  const filteredRows = useMemo(() => {
    if (
      activeTab === "deposit" ||
      activeTab === "payin" ||
      activeTab === "apihistory" ||
      activeTab === "withdraw" ||
      activeTab === "payout"
    ) {
      // Server-filtered tabs (search/status/method/date via API).
      return allRows;
    }

    const needle = searchValue.trim().toLowerCase();
    const statusLabel = getFilterLabel(statusFilter);
    const methodLabel = getFilterLabel(methodFilter);

    return allRows.filter((row) => {
      const matchesSearch =
        !needle ||
        [
          row.id,
          row.customer,
          row.email,
          row.method,
          row.asset,
          row.network,
          row.amount,
          row.netAmount,
          row.status,
          row.date,
          row.reference,
          row.receiverAddress,
          row.address,
          row.from,
          row.txId,
          row.contractAddress,
          row.apiKeyName,
        ]
          .join(" ")
          .toLowerCase()
          .includes(needle);

      const matchesStatus = !statusLabel || row.status === statusLabel;
      const matchesMethod = !methodLabel || row.method === methodLabel;
      
      let matchesDate = true;
      if (dateFilter?.from || dateFilter?.to) {
        const rowDateObj = row.rawDate
          ? new Date(row.rawDate)
          : new Date(`${row.date} 2026`);
        if (dateFilter.from) {
          const fromDate = new Date(dateFilter.from);
          fromDate.setHours(0, 0, 0, 0);
          matchesDate = matchesDate && rowDateObj >= fromDate;
        }
        if (dateFilter.to) {
          const toDate = new Date(dateFilter.to);
          toDate.setHours(23, 59, 59, 999);
          matchesDate = matchesDate && rowDateObj <= toDate;
        }
      }

      return matchesSearch && matchesStatus && matchesMethod && matchesDate;
    });
  }, [activeTab, allRows, dateFilter, methodFilter, searchValue, statusFilter]);

  const totalItems =
    activeTab === "withdraw"
      ? withdrawPagination.total
      : activeTab === "payout"
        ? payoutPagination.total
        : activeTab === "deposit" ||
            activeTab === "payin" ||
            activeTab === "apihistory"
          ? activeTab === "apihistory"
            ? apiHistoryPagination.total
            : depositPagination.total
          : filteredRows.length;
  const totalPages =
    activeTab === "withdraw"
      ? Math.max(1, withdrawPagination.totalPages)
      : activeTab === "payout"
        ? Math.max(1, payoutPagination.totalPages)
        : activeTab === "deposit" ||
            activeTab === "payin" ||
            activeTab === "apihistory"
          ? Math.max(
              1,
              activeTab === "apihistory"
                ? apiHistoryPagination.totalPages
                : depositPagination.totalPages,
            )
          : Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  useEffect(() => {
    let cancelled = false;

    queueMicrotask(() => {
      if (!cancelled && page !== safePage) {
        setPage(safePage);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [page, safePage]);

  const visibleRows = useMemo(() => {
    if (
      activeTab === "deposit" ||
      activeTab === "payin" ||
      activeTab === "apihistory" ||
      activeTab === "withdraw" ||
      activeTab === "payout"
    ) {
      return allRows;
    }

    const start = (safePage - 1) * PAGE_SIZE;
    return filteredRows.slice(start, start + PAGE_SIZE);
  }, [activeTab, allRows, filteredRows, safePage]);

  // Static status options per tab (not from API).
  // Selecting one calls the API with that status.
  const TAB_STATUS_OPTIONS = useMemo(
    () => ({
      payin: ["Pending", "Confirmed", "Expired", "All"],
      deposit: ["Pending", "Confirmed", "All"],
      payout: ["Pending", "Completed", "Rejected", "Failed", "All"],
      withdraw: ["Pending", "Processing", "Completed", "Rejected", "All"],
    }),
    [],
  );

  const statusOptions = useMemo(() => {
    const statics = TAB_STATUS_OPTIONS[activeTab];
    if (statics) {
      return statics.map((status) => ({
        label: status === "All" ? "All Status" : status,
        value: status,
      }));
    }
    return [
      { label: "All Status", value: null },
      ...Array.from(new Set(allRows.map((row) => row.status))).map(
        (status) => ({
          label: status,
          value: status,
        }),
      ),
    ];
  }, [allRows, activeTab, TAB_STATUS_OPTIONS]);

  const methodOptions = useMemo(
    () => [
      { label: "All Methods", value: null },
      ...Array.from(new Set(allRows.map((row) => row.method))).map(
        (method) => ({
          label: method,
          value: method,
        }),
      ),
    ],
    [allRows],
  );

  const buttonTypeOptions = useMemo(
    () => [
      { label: "All Button Types", value: "All" },
      { label: "Simple", value: "simple" },
      { label: "Advanced", value: "advanced" },
    ],
    [],
  );

  const resetFilters = () => {
    setSearchValue("");
    setStatusFilter(null);
    setMethodFilter(null);
    setButtonTypeFilter(null);
    setDateFilter({ from: "", to: "", preset: "" });
    setPage(1);
  };

  const handleTabChange = (nextTab) => {
    if (nextTab === activeTab) return;
    setActiveTab(nextTab);
    setSearchValue("");
    setStatusFilter(null);
    setMethodFilter(null);
    setButtonTypeFilter(null);
    setDateFilter({ from: "", to: "", preset: "" });
    setDebouncedSearch("");
    setPage(1);
  };

  const handleExport = () => {
    exportRowsToCsv(filteredRows, activeTabConfig.label);
    setSnackbar({
      open: true,
      message: `Exported ${filteredRows.length.toLocaleString()} ${activeTabConfig.label.toLowerCase()} entries.`,
      tone: "success",
    });
  };

  const columns = useMemo(() => {
    if (activeTab === "withdraw" || activeTab === "payout") {
      return [
        {
          key: "id",
          title: activeTab === "payout" ? "Payout ID" : "Withdrawal ID",
          width: 190,
          render: (value) => (
            <span className="font-mono text-xs font-medium text-text">
              {shortenValue(value)}
            </span>
          ),
        },
        {
          key: "asset",
          title: "Asset",
          render: (value) => <span className="font-medium text-text">{value}</span>,
        },
        {
          key: "network",
          title: "Network",
          render: (value) => <span className="text-secondary-text">{value}</span>,
        },
        {
          key: "amount",
          title: "Amount",
          align: "right",
          render: (value) => <span className="font-medium text-text">{value}</span>,
        },
        {
          key: "netAmount",
          title: "Net Amount",
          align: "right",
          render: (value) => <span className="font-medium text-text">{value}</span>,
        },
        {
          key: "receiverAddress",
          title: "Receiver",
          width: 180,
          render: (value) => (
            <span className="font-mono text-xs text-secondary-text">
              {shortenValue(value)}
            </span>
          ),
        },
        ...(activeTab === "payout"
          ? [
              {
                key: "apiKeyName",
                title: "API Key",
                render: (value) => (
                  <span className="text-secondary-text">{value || "-"}</span>
                ),
              },
            ]
          : []),
        {
          key: "status",
          title: "Status",
          type: "status",
        },
        {
          key: "date",
          title: "Date",
          type: "date",
          width: 190,
        },
      ];
    }

    if (activeTab === "deposit" || activeTab === "payin") {
      return [
        // {
        //   key: "id",
        //   title: "Deposit ID",
        //   width: 190,
        //   render: (value) => (
        //     <span className="font-mono text-xs font-medium text-text">
        //       {shortenValue(value)}
        //     </span>
        //   ),
        // },
        {
          key: "asset",
          title: "Asset",
          render: (value) => <span className="font-medium text-text">{value}</span>,
        },
        {
          key: "network",
          title: "Network",
          render: (value) => <span className="text-secondary-text">{value}</span>,
        },
        {
          key: "amount",
          title: "Amount",
          align: "right",
          render: (value) => <span className="font-medium text-text">{value}</span>,
        },
          {
          key: "receivedAmount",
          title: "Received Amount",
          align: "right",
          render: (value) => <span className="font-medium text-text">{value}</span>,
        },
        {
          key: "address",
          title: "Address",
          width: 180,
          render: (value) => (
            <span className="font-mono text-xs text-secondary-text">
              {shortenValue(value)}
            </span>
          ),
        },
       
        ...(activeTab === "payin"
          ? [
              {
                key: "apiKeyName",
                title: "API Key",
                render: (value) => (
                  <span className="text-secondary-text">{value || "-"}</span>
                ),
              },
            ]
          : []),
        {
          key: "buttonType",
          title: "Button Type",
          render: (value) => (
            <span className="text-secondary-text">{formatButtonType(value) || "-"}</span>
          ),
        },
        {
          key: "status",
          title: "Status",
          type: "status",
        },
        {
          key: "date",
          title: "Date",
          type: "date",
          width: 190,
        },
      ];
    }

    if (activeTab === "apihistory") {
      return [
        // {
        //   key: "id",
        //   title: "Request ID",
        //   width: 200,
        //   render: (value) => (
        //     <span className="font-mono text-xs font-medium text-text">
        //       {shortenValue(value)}
        //     </span>
        //   ),
        // },
        {
          key: "method",
          title: "Method",
          render: (value) => (
            <span className="font-mono text-xs font-medium text-text">{value}</span>
          ),
        },
        {
          key: "endpoint",
          title: "Endpoint",
          render: (value) => (
            <span className="font-mono text-xs text-secondary-text break-all">
              {value}
            </span>
          ),
        },
        {
          key: "responseStatus",
          title: "Status Code",
          align: "center",
          render: (value) => (
            <span className="font-medium text-text">{value ?? "-"}</span>
          ),
        },
        {
          key: "status",
          title: "Status",
          type: "status",
        },
        {
          key: "ip",
          title: "IP",
          render: (value) => (
            <span className="font-mono text-xs text-secondary-text">{value}</span>
          ),
        },
        {
          key: "apiKeyName",
          title: "API Key",
          render: (value) => (
            <span className="text-secondary-text">{value || "-"}</span>
          ),
        },
        {
          key: "date",
          title: "Date",
          type: "date",
          width: 190,
        },
      ];
    }

    return [
      {
        key: "id",
        title: "Transaction ID",
        render: (value) => <span className="font-medium text-text">{value}</span>,
      },
      {
        key: "customer",
        title: "Customer",
        render: (value) => <span className="font-medium text-text">{value}</span>,
      },
      {
        key: "method",
        title: "Method",
        render: (value) => <span className="text-secondary-text">{value}</span>,
      },
      {
        key: "amount",
        title: "Amount",
        align: "right",
        render: (value) => <span className="font-medium text-text">{value}</span>,
      },
      {
        key: "status",
        title: "Status",
        type: "status",
      },
      {
        key: "date",
        title: "Date",
        type: "date",
      },
    ];
  }, [activeTab]);
  const filtersActive = Boolean(
    searchValue ||
      statusFilter ||
      methodFilter ||
      buttonTypeFilter ||
      dateFilter?.from ||
      dateFilter?.to ||
      dateFilter?.preset,
  );

  const closeWithdrawalDetails = () => {
    setSelectedWithdrawal(null);
    setWithdrawalDetailLoading(false);
    setWithdrawalDetailError("");
  };

  const closeDepositDetails = () => {
    setSelectedDeposit(null);
    setDepositDetailLoading(false);
    setDepositDetailError("");
  };

    const handleViewRow = async (row) => {
      if (activeTab === "apihistory") {
        setSelectedApiCall(row.raw || row);
        return;
      }

      if (activeTab === "deposit" || activeTab === "payin") {
      const depositId = row.depositId || row.id;
      if (!depositId) return;

      setSelectedDeposit(row.raw || row);
      setDepositDetailLoading(true);
      setDepositDetailError("");

      try {
        const response = await apiClient.get(`${baseRoute}/deposit-history/${depositId}`);

        if (response.data?.success === false) {
          setDepositDetailError(
            getResponseMessage(response.data) || "Failed to load deposit details.",
          );
          return;
        }

        setSelectedDeposit(response.data?.data || row.raw || row);
      } catch (error) {
        const payload = getApiErrorPayload(error);
        const message = getResponseMessage(payload) || "Failed to load deposit details.";
        setDepositDetailError(message);
        setSnackbar({ open: true, message, tone: "error" });
      } finally {
        setDepositDetailLoading(false);
      }
      return;
    }

    if (activeTab !== "withdraw" && activeTab !== "payout") {
      setSelectedTransaction(row);
      return;
    }

    const withdrawalId = row.withdrawalId || row.id;
    if (!withdrawalId) return;

    setSelectedWithdrawal(row.raw || row);
    setWithdrawalDetailLoading(true);
    setWithdrawalDetailError("");

    try {
      const response = await apiClient.get(`${baseRoute}/withdrawals/${withdrawalId}`);

      if (response.data?.success === false) {
        setWithdrawalDetailError(
          getResponseMessage(response.data) || "Failed to load withdrawal details.",
        );
        return;
      }

      setSelectedWithdrawal(response.data?.data || row.raw || row);
    } catch (error) {
      const payload = getApiErrorPayload(error);
      const message = getResponseMessage(payload) || "Failed to load withdrawal details.";
      setWithdrawalDetailError(message);
      setSnackbar({ open: true, message, tone: "error" });
    } finally {
      setWithdrawalDetailLoading(false);
    }
  };
  const rowActions = [
    {
      key: "view",
      icon: <Eye size={16} />,
      iconOnly: true,
      tone: "ghost",
      ariaLabel: "View transaction details",
      onClick: handleViewRow,
    },
  ];


  if (loading) {
    return <Skeleton pageName="history" />;
  }
  return (
    <div className="space-y-6 pb-6">
      <PageTopBanner
        title="Transaction History"
        description="Search, filter and export every transaction on your account"
        // actions={
        //   <Button
        //     onClick={handleExport}
        //     icon={<Download size={19} />}
        //     value="Export report"
        //     className="h-10 w-full bg-white px-4 text-sm font-semibold text-secondary-text shadow-none hover:border-primary hover:text-primary sm:w-auto"
        //   />
        // }
      />

      <section
        data-lenis-prevent-horizontal="true"
        className="flex w-full justify-start overflow-x-auto pb-1 sm:justify-end"
      >
        <div
          role="tablist"
          className="flex w-max min-w-max items-center gap-1 rounded-2xl border border-input-border/60 bg-secondary-bg/60 p-1 shadow-inner"
        >
          {visibleTabs.map((tab) => {
            const Icon = tab.icon;
            const active = tab.key === activeTab;

            return (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => handleTabChange(tab.key)}
                className={`group relative flex shrink-0 items-center justify-center gap-2 rounded-xl px-4 py-2 text-[13px] font-semibold transition-all duration-300 ${
                  active
                    ? "bg-[var(--primary)] text-white shadow-[0_4px_12px_rgba(75, 71, 255,0.35)]"
                    : "text-secondary-text hover:text-theme-text hover:bg-black/5 dark:hover:bg-white/5"
                }`}
              >
                <Icon
                  size={14}
                  strokeWidth={2.5}
                  className={`transition-colors duration-300 ${active ? "text-white" : "text-secondary-text group-hover:text-theme-text"}`}
                />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="dashboard-card rounded-[28px] p-4 sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="w-full lg:flex-1 lg:max-w-md">
            <TableSearch
              value={searchValue}
              onChange={(nextValue) => {
                setSearchValue(nextValue);
                setPage(1);
              }}
              placeholder={
                activeTab === "withdraw" || activeTab === "payout"
                  ? "Search by withdrawal ID, asset or address..."
                  : activeTab === "deposit"
                    ? "Search by deposit ID, txId, asset or address..."
                    : activeTab === "payin"
                      ? "Search by payin ID, txId, asset or address..."
                      : activeTab === "apihistory"
                        ? "Search by endpoint, method or message..."
                        : "Search by transaction ID, customer or email..."
              }
              className="max-w-none"
            />
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
            {activeTab === "withdraw" ||
            activeTab === "payout" ||
            activeTab === "deposit" ||
            activeTab === "payin" ||
            activeTab === "transaction" ? (
              <>
                <div className="w-full sm:w-[148px]">
                  <TableFilter
                    placeholder="All Status"
                    options={statusOptions}
                    value={statusFilter}
                    onChange={(nextValue) => {
                      setStatusFilter(nextValue);
                      setPage(1);
                    }}
                    searchable={false}
                    className="w-full"
                  />
                </div>

                {/* <div className="w-full sm:w-[156px]">
                  <TableFilter
                    placeholder={
                      activeTab === "withdraw" || activeTab === "payout"
                        ? "All Networks"
                        : activeTab === "payin"
                          ? "All Networks"
                          : "All Methods"
                    }
                    options={methodOptions}
                    value={methodFilter}
                    onChange={(nextValue) => {
                      setMethodFilter(nextValue);
                      setPage(1);
                    }}
                    searchable={false}
                    className="w-full"
                  />
                </div> */}
                {( activeTab === "payin") && (
                  <div className="w-full sm:w-[168px]">
                    <TableFilter
                      placeholder="Button Types"
                      options={buttonTypeOptions}
                      value={buttonTypeFilter}
                      onChange={(nextValue) => {
                        setButtonTypeFilter(nextValue);
                        setPage(1);
                      }}
                      searchable={false}
                      className="w-full"
                    />
                  </div>
                )}
              </>
            ) : null}

            {activeTab === "apihistory" ? (
              <div className="w-full sm:w-[148px]">
                <TableFilter
                  placeholder="All Status"
                  options={statusOptions}
                  value={statusFilter}
                  onChange={(nextValue) => {
                    setStatusFilter(nextValue);
                    setPage(1);
                  }}
                  searchable={false}
                  className="w-full"
                />
              </div>
            ) : null}

            <DateFilter
              value={dateFilter}
              onChange={(nextValue) => {
                setDateFilter(nextValue);
                setPage(1);
              }}
              placeholder="Filter by Date"
              className="w-full sm:w-[160px]"
            />

            {filtersActive ? (
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-input-border bg-input-bg px-4 text-sm font-semibold text-secondary-text transition hover:border-primary hover:text-primary"
              >
                <FilterX size={15} />
                Reset
              </button>
            ) : null}
          </div>
        </div>

        <div className="mt-5">
          <Table
            title=""
            subtitle=""
            search={false}
            filters={[]}
            showFilter={false}
            showViewAll={false}
            showExportButton={false}
            data={visibleRows}
            loading={
              (activeTab === "withdraw" && withdrawalLoading) ||
              (activeTab === "payout" && payoutLoading) ||
              (activeTab === "deposit" && depositLoading) ||
              (activeTab === "payin" && payinLoading) ||
              (activeTab === "apihistory" && apiHistoryLoading)
            }
            columns={columns}
            rowActions={rowActions}
            bordered={false}
            minWidth={
              activeTab === "withdraw" ||
              activeTab === "payout" ||
              activeTab === "deposit" ||
              activeTab === "payin"
                ? 1180
                : activeTab === "apihistory"
                  ? 1000
                  : 980
            }
            chipMaps={{ status: WITHDRAW_STATUS_CHIP_MAP }}
            emptyTitle="No data found"
            emptyMessage={
              activeTab === "withdraw"
                ? withdrawalError || "No data found"
                : activeTab === "payout"
                  ? payoutError || "No data found"
                  : activeTab === "deposit"
                    ? depositError || "No data found"
                    : activeTab === "payin"
                      ? payinError || "No data found"
                      : activeTab === "apihistory"
                        ? apiHistoryError || "No data found"
                        : "No data found"
            }
            pagination={null}
            className="!rounded-none !border-0 !bg-transparent !p-0 !shadow-none"
            bgClassName="!bg-transparent"
          />
        </div>

        {totalItems > 0 ? (
          <TablePagination
            page={safePage}
            totalPages={totalPages}
            pageSize={PAGE_SIZE}
            totalItems={totalItems}
            onPageChange={setPage}
          />
        ) : null}
      </section>

      <TransactionDetails
        transaction={selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
      />

      <WithdrawalDetailsModal
        withdrawal={selectedWithdrawal}
        loading={withdrawalDetailLoading}
        error={withdrawalDetailError}
        onClose={closeWithdrawalDetails}
        showApiKey={activeTab === "payout"}
      />

      <DepositDetailsModal
        deposit={selectedDeposit}
        loading={depositDetailLoading}
        error={depositDetailError}
        onClose={closeDepositDetails}
        showApiKey={activeTab === "payin"}
      />

      <ApiCallDetailsModal
        record={selectedApiCall}
        open={Boolean(selectedApiCall)}
        onClose={() => setSelectedApiCall(null)}
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