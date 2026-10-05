"use client";

import { Button, ExportButton, Table, Toast } from "@/components/ReusableUi";
import { getWithTokenApi } from "@/lib/apiHelper";
import { getAuthToken } from "@/lib/axiosInterceptor";
import { formatApiDate } from "@/lib/dateFormat";
import { Eye, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

const DEPOSIT_PAGE_SIZE = 10;
const DEPOSIT_ENDPOINTS = {
  list: "/deposits/history",
  detail: (depositId) => `/deposits/history/${depositId}`,
};

function humanizeKey(key) {
  return String(key)
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getDetailFields(data) {
  const hiddenKeys = new Set(["merchantId", "walletId", "decimal", "transaction", "__v", "apiKeyId"]);
  return Object.keys(data ?? {})
    .filter((key) => {
      if (hiddenKeys.has(key)) return false;
      // Hide raw populated user object (shown via Merchant Name/Email/Type instead)
      if (key === "userId" && data[key] && typeof data[key] === "object") return false;
      const value = data[key];
      if (value === null || value === undefined || value === "") return false;
      return true;
    })
    .map((key) => ({ key, label: humanizeKey(key) }));
}

const columns = [
  // { key: "reference", header: "Reference", cellClassName: "min-w-40" },
  // { key: "buyer", header: "Buyer", cellClassName: "min-w-40" },
  { key: "merchantName", header: "Merchant", cellClassName: "min-w-40" },
  // { key: "merchantType", header: "Type", cellClassName: "min-w-28" },
  { key: "asset", header: "Asset", cellClassName: "min-w-28" },
  { key: "network", header: "Network", cellClassName: "min-w-32" },
  { key: "wallet", header: "Wallet", cellClassName: "min-w-44" },
  { key: "apiKeyName", header: "API Key", cellClassName: "min-w-32" },
  { key: "amount", header: "Amount", cellClassName: "min-w-28" },
  { key: "receivedAmount", header: "Received Amount", cellClassName: "min-w-28" },
  { key: "buttonType", header: "Button Type", cellClassName: "min-w-28" },
  { key: "status", header: "Status", type: "status" },
  { key: "date", header: "Date", cellClassName: "min-w-36" },
  { key: "actions", header: "Actions", type: "actions" },
];

const tableActions = [
  {
    key: "view",
    label: "View details",
    iconNode: <Eye className="h-3 w-3" />,
  },
];

function getApiErrorMessage(error, fallbackMessage = "Deposit request failed.") {
  const data = error.response?.data;

  return data?.message || data?.msg || data?.error || data?.errors?.msg || error.message || fallbackMessage;
}

function assertApiSuccess(response, fallbackMessage) {
  if (response?.success === false) {
    throw new Error(response.message || fallbackMessage);
  }
}

function isAvailableValue(value) {
  if (value === null || value === undefined || value === "") {
    return false;
  }

  if (Array.isArray(value)) {
    return value.length > 0;
  }

  if (typeof value === "object") {
    return Object.keys(value).length > 0;
  }

  return true;
}

function titleCaseStatus(value) {
  const status = String(value || "").trim();

  if (!status) {
    return undefined;
  }

  return status
    .toLowerCase()
    .split(/[\s_]+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatAmount(amount, currency) {
  if (!isAvailableValue(amount)) {
    return undefined;
  }

  const numericAmount = Number(amount);
  const displayAmount = Number.isFinite(numericAmount)
    ? numericAmount.toLocaleString("en-US", { maximumFractionDigits: 12 })
    : amount;

  return [displayAmount, currency].filter(Boolean).join(" ");
}

function getReference(deposit) {
  const identifier = deposit?._id || deposit?.id || "";

  if (!identifier) {
    return undefined;
  }

  return `DEP-${String(identifier).slice(-8).toUpperCase()}`;
}

function getDepositId(row) {
  return row?.depositId || row?._id || row?.id;
}

function getTx(deposit) {
  return deposit?.transaction || {};
}

function pickTx(deposit, ...keys) {
  const tx = getTx(deposit);
  for (const key of keys) {
    const value = tx[key] ?? deposit?.[key];
    if (value !== null && value !== undefined && value !== "") return value;
  }
  return undefined;
}

function getBuyerName(deposit) {
  const tx = getTx(deposit);
  return (
    tx.fullName ||
    deposit?.fullName ||
    [tx.buyerFirstname ?? deposit?.buyerFirstname, tx.buyerLastname ?? deposit?.buyerLastname].filter(Boolean).join(" ") ||
    tx.buyerName ||
    deposit?.buyerName
  );
}

function getDepositList(response) {
  const candidates = [
    response?.data?.deposits,
    response?.data?.docs,
    response?.data?.items,
    response?.deposits,
    response?.docs,
    response?.items,
    response?.data,
    response,
  ];

  return candidates.find(Array.isArray) || [];
}

function getDepositPagination(response) {
  return response?.data?.pagination || response?.pagination || null;
}

function getDepositDetail(response) {
  return response?.data?.deposit || response?.deposit || response?.data || response || {};
}

function normalizeDeposit(deposit = {}) {
  const buyerName = getBuyerName(deposit);
  const status = titleCaseStatus(deposit.status);
  const amount = formatAmount(deposit.amount, deposit.currency1);
  const amountInCurrency2 = formatAmount(deposit.amountInCurrency2, deposit.currency2);
  const receivedAmount = formatAmount(deposit.receivedAmount, deposit.currency2 || deposit.currency1);

  return {
    id: deposit._id || deposit.id,
    depositId: deposit._id || deposit.id,
    reference: getReference(deposit),
    txnId: deposit.txnId,
    merchant: deposit.merchantId?._id || deposit.merchantId?.email || deposit.merchantId,
    buyer: buyerName || deposit.buyerEmail || "-",
    buyerName,
    buyerEmail: deposit.buyerEmail,
    buyerFirstname: deposit.buyerFirstname,
    buyerLastname: deposit.buyerLastname,
    fullName: deposit.fullName,
    asset: deposit.currency2 || deposit.currency1 || "-",
    currency1: deposit.currency1,
    currency2: deposit.currency2,
    network: deposit.network,
    wallet: deposit.address || "-",
    address: deposit.address,
    destTag: deposit.destTag,
    amount: amount || "-",
    amountInCurrency2,
    receivedAmount,
    status: status || "-",
    date: formatApiDate(deposit.createdAt),
    itemName: deposit.itemName,
    itemNumber: deposit.itemNumber,
    invoice: deposit.invoice,
    custom: deposit.custom,
    ipnUrl: deposit.ipnUrl,
    successUrl: deposit.successUrl,
    cancelUrl: deposit.cancelUrl,
    checkoutUrl: deposit.checkoutUrl,
    qrcodeUrl: deposit.qrcodeUrl,
    statusUrl: deposit.statusUrl,
    txnHash: deposit.txnHash,
    confirmations: deposit.confirmations,
    confirmsNeeded: deposit.confirmsNeeded,
    timeout: deposit.timeout,
    expiresAt: formatApiDate(deposit.expiresAt),
    createdAt: formatApiDate(deposit.createdAt),
    updatedAt: formatApiDate(deposit.updatedAt),
    searchText: [
      getReference(deposit),
      deposit.txnId,
      buyerName,
      deposit.buyerEmail,
      deposit.currency1,
      deposit.currency2,
      deposit.network,
      deposit.address,
      deposit.amount,
      deposit.amountInCurrency2,
      deposit.status,
      deposit.invoice,
      deposit.txnHash,
      deposit.createdAt,
    ]
      .filter(Boolean)
      .join(" "),
    raw: deposit,
  };
}

function normalizeDepositHistory(deposit = {}) {
  const id = deposit._id || deposit.id;
  const symbol = deposit.symbol || "";
  const tx = getTx(deposit);

  return {
    id,
    depositId: id,
    reference: getReference(deposit),
    txnId: deposit.txId,
    buyer: deposit.userId || "User",
    userId: deposit.userId,
    merchantName:
      deposit.merchantId?.fullName ||
      deposit.merchantId?.companyName ||
      deposit.userId?.fullName ||
      "-",
    merchantEmail: deposit.merchantId?.email || deposit.userId?.email || "-",
    merchantType: (() => {
      const t =
        deposit.merchantId?.accountType || deposit.userId?.accountType || "";
      return t ? t.charAt(0).toUpperCase() + t.slice(1).toLowerCase() : "-";
    })(),
    asset: symbol || deposit.network || "-",
    symbol,
    network: deposit.network,
    wallet: deposit.address || "-",
    address: deposit.address,
    from: deposit.from,
    contractAddress: deposit.contractAddress,
    decimal: deposit.decimal,
    amount: formatAmount(deposit.amount, symbol) || "-",
    receivedAmount: formatAmount(deposit.receivedAmount, symbol) || "-",
    apiKeyName: deposit.apiKeyName || tx.apiKeyName || "-",
    buttonType: deposit.buttonType ? deposit.buttonType.charAt(0).toUpperCase() + deposit.buttonType.slice(1) : "-",
    status: titleCaseStatus(deposit.status) || "-",
    date: formatApiDate(deposit.createdAt),
    createdAt: formatApiDate(deposit.createdAt),
    updatedAt: formatApiDate(deposit.updatedAt),
    // Buyer / item fields live on nested `transaction` (see GET /deposits/history/:id).
    buyerFirstname: tx.buyerFirstname ?? deposit.buyerFirstname,
    buyerLastname: tx.buyerLastname ?? deposit.buyerLastname,
    buyerEmail: tx.buyerEmail ?? deposit.buyerEmail,
    itemName: tx.itemName ?? tx.item_name ?? deposit.itemName,
    itemDescription: tx.item_description ?? tx.itemDescription ?? deposit.itemDescription,
    itemNumber: tx.itemNumber ?? tx.item_number ?? deposit.itemNumber,
    invoice: tx.invoice ?? deposit.invoice,
    itemQuantity: tx.item_quantity ?? tx.itemQuantity ?? deposit.itemQuantity,
    taxAmount: tx.tax_amount ?? tx.taxAmount ?? deposit.taxAmount,
    shippingCost: tx.shipping_cost ?? tx.shippingCost ?? deposit.shippingCost,
    successUrl: tx.successUrl ?? tx.success_url ?? deposit.successUrl,
    cancelUrl: tx.cancelUrl ?? tx.cancel_url ?? deposit.cancelUrl,
    ipnUrl: tx.ipnUrl ?? tx.ipn_url ?? deposit.ipnUrl,
    searchText: [
      getReference(deposit),
      deposit.txId,
      deposit.userId?.email || deposit.merchantId?.email,
      deposit.userId?.fullName || deposit.merchantId?.fullName,
      deposit.merchantId?.companyName,
      symbol,
      deposit.network,
      deposit.address,
      deposit.from,
      deposit.apiKeyName,
      deposit.contractAddress,
      deposit.amount,
      deposit.createdAt,
      tx.buyerEmail,
      tx.buyerFirstname,
      tx.buyerLastname,
      tx.itemName,
      tx.itemNumber,
      tx.invoice,
    ]
      .filter(Boolean)
      .join(" "),
    raw: deposit,
  };
}

function isUrl(value) {
  return /^https?:\/\//i.test(String(value || ""));
}

function formatDetailValue(value) {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  if (typeof value === "object") {
    return JSON.stringify(value, null, 2);
  }

  return String(value);
}

function DetailValue({ label, value }) {
  const displayValue = formatDetailValue(value);

  return (
    <div className="rounded-[8px] border border-input-border/40 bg-input-bg/50 p-3">
      <p className="text-small font-medium text-text-secondary">{label}</p>
      {isUrl(displayValue) ? (
        <a
          href={displayValue}
          target="_blank"
          rel="noreferrer"
          className="mt-1 block break-words text-mid font-medium text-text-primary transition hover:text-theme-text"
        >
          {displayValue}
        </a>
      ) : (
        <p className="mt-1 whitespace-pre-wrap break-words text-mid font-medium text-theme-text">{displayValue}</p>
      )}
    </div>
  );
}

function DepositDetailModal({ open, row, loading, onClose }) {
  if (!open) {
    return null;
  }

  const raw = row?.raw || {};
  const tx = raw.transaction || {};
  const { transaction: _nestedTx, __v: _v, apiKeyId: _apiKeyId, ...restRaw } = raw;
  const detailData = {
    ...restRaw,
    ...(row?.merchantName && row.merchantName !== "-" ? { merchantName: row.merchantName } : {}),
    ...(row?.merchantEmail && row.merchantEmail !== "-" ? { merchantEmail: row.merchantEmail } : {}),
    ...(row?.merchantType && row.merchantType !== "-" ? { merchantType: row.merchantType } : {}),
    // Flatten buyer / item fields from nested transaction so they show in modal.
    ...(pickTx(raw, "buyerFirstname") !== undefined ? { buyerFirstname: pickTx(raw, "buyerFirstname") } : {}),
    ...(pickTx(raw, "buyerLastname") !== undefined ? { buyerLastname: pickTx(raw, "buyerLastname") } : {}),
    ...(pickTx(raw, "buyerEmail") !== undefined ? { buyerEmail: pickTx(raw, "buyerEmail") } : {}),
    ...(pickTx(raw, "itemName", "item_name") !== undefined ? { itemName: pickTx(raw, "itemName", "item_name") } : {}),
    ...(pickTx(raw, "item_description", "itemDescription") !== undefined ? { itemDescription: pickTx(raw, "item_description", "itemDescription") } : {}),
    ...(pickTx(raw, "itemNumber", "item_number") !== undefined ? { itemNumber: pickTx(raw, "itemNumber", "item_number") } : {}),
    ...(pickTx(raw, "invoice") !== undefined ? { invoice: pickTx(raw, "invoice") } : {}),
    ...(pickTx(raw, "item_quantity", "itemQuantity") !== undefined ? { itemQuantity: pickTx(raw, "item_quantity", "itemQuantity") } : {}),
    ...(pickTx(raw, "tax_amount", "taxAmount") !== undefined ? { taxAmount: pickTx(raw, "tax_amount", "taxAmount") } : {}),
    ...(pickTx(raw, "shipping_cost", "shippingCost") !== undefined ? { shippingCost: pickTx(raw, "shipping_cost", "shippingCost") } : {}),
    ...(pickTx(raw, "successUrl", "success_url") !== undefined ? { successUrl: pickTx(raw, "successUrl", "success_url") } : {}),
    ...(pickTx(raw, "cancelUrl", "cancel_url") !== undefined ? { cancelUrl: pickTx(raw, "cancelUrl", "cancel_url") } : {}),
    ...(pickTx(raw, "ipnUrl", "ipn_url") !== undefined ? { ipnUrl: pickTx(raw, "ipnUrl", "ipn_url") } : {}),
    ...(tx.apiKeyName && !restRaw.apiKeyName ? { apiKeyName: tx.apiKeyName } : {}),
  };
  const visibleFields = getDetailFields(detailData);
  // Merchant identity first (like Withdraw Details), rest in record order.
  const priorityKeys = ["merchantName", "merchantEmail", "merchantType"];
  visibleFields.sort((a, b) => {
    const aRank = priorityKeys.indexOf(a.key);
    const bRank = priorityKeys.indexOf(b.key);
    if (aRank === -1 && bRank === -1) return 0;
    if (aRank === -1) return 1;
    if (bRank === -1) return -1;
    return aRank - bRank;
  });

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 px-4 py-6">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Deposit Details"
        className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-rounded border border-input-border/60 bg-bg-primary shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-input-border/40 px-5 py-4">
          <div className="space-y-1">
            <h2 className="text-large font-semibold text-theme-text">Deposit Details</h2>
            {/* <p className="text-small text-text-secondary">{detailData.txnId || detailData._id || row?.reference || row?.depositId || "Loading deposit"}</p> */}
          </div>
          <button
            type="button"
            aria-label="Close modal"
            onClick={onClose}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-input-border bg-input-bg text-text-secondary transition hover:border-text-secondary hover:text-theme-text"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
          {loading ? (
            <div className="rounded-rounded border border-input-border/40 bg-input-bg/40 px-5 py-4 text-small text-text-secondary">
              Loading deposit details...
            </div>
          ) : visibleFields.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {visibleFields.map((field) => (
                <DetailValue key={field.key} label={field.label} value={detailData[field.key]} />
              ))}
            </div>
          ) : (
            <div className="rounded-rounded border border-input-border/40 bg-input-bg/40 px-5 py-4 text-small text-text-secondary">
              No deposit details available.
            </div>
          )}
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-input-border/40 px-5 py-4 sm:flex-row sm:justify-end">
          <Button variant="secondary" type="button" onClick={onClose} className="w-full sm:w-auto">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function DepositPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [buttonTypeFilter, setButtonTypeFilter] = useState("all");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [page, setPage] = useState(1);
  const [tableRows, setTableRows] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [viewRow, setViewRow] = useState(null);
  const [toast, setToast] = useState(null);

  const totalRecords = pagination?.totalDocs ?? pagination?.total ?? tableRows.length;
  const totalPages = pagination?.totalPages || Math.max(1, Math.ceil(totalRecords / DEPOSIT_PAGE_SIZE));

  function showToast(content, color = "success") {
    setToast({ id: Date.now(), content, color });
  }

  const fetchDeposits = useCallback(async (nextPage = 1) => {
    const token = getAuthToken();

    if (!token) {
      setTableRows([]);
      setPagination(null);
      setLoading(false);
      showToast("Session token not found", "error");
      return;
    }

    setLoading(true);

    try {
      const response = await getWithTokenApi(token, DEPOSIT_ENDPOINTS.list, {
        page: nextPage,
        limit: DEPOSIT_PAGE_SIZE,
        ...(search.trim() ? { search: search.trim() } : {}),
        ...(typeFilter && typeFilter !== "all" ? { type: typeFilter } : {}),
        ...(statusFilter && statusFilter !== "all" ? { status: statusFilter } : {}),
        ...(buttonTypeFilter && buttonTypeFilter !== "all" ? { buttonType: buttonTypeFilter } : {}),
        ...(dateRange.from ? { startDate: `${dateRange.from}T00:00:00` } : {}),
        ...(dateRange.to ? { endDate: `${dateRange.to}T23:59:59` } : {}),
      });
      assertApiSuccess(response, "Unable to fetch deposits.");

      const deposits = getDepositList(response);
      const nextPagination = getDepositPagination(response);

      setTableRows(deposits.map(normalizeDepositHistory));
      setPagination(nextPagination);
      setPage(nextPagination?.currentPage || nextPagination?.page || nextPage);
    } catch (error) {
      setTableRows([]);
      setPagination(null);
      showToast(getApiErrorMessage(error, "Unable to fetch deposits."), "error");
    } finally {
      setLoading(false);
    }
  }, [dateRange.from, dateRange.to, search, typeFilter, statusFilter, buttonTypeFilter]);

  const fetchDepositDetail = useCallback(async (depositId, fallbackRow = null) => {
    const token = getAuthToken();

    if (!token) {
      showToast("Session token not found", "error");
      return;
    }

    if (!depositId) {
      showToast("Deposit ID not found", "error");
      return;
    }

    setViewRow(fallbackRow);
    setDetailLoading(true);

    try {
      const response = await getWithTokenApi(token, DEPOSIT_ENDPOINTS.detail(depositId));
      assertApiSuccess(response, "Unable to fetch deposit details.");

      setViewRow(normalizeDepositHistory(getDepositDetail(response)));
    } catch (error) {
      showToast(getApiErrorMessage(error, "Unable to fetch deposit details."), "error");
    } finally {
      setDetailLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      fetchDeposits(1);
    }, 500);

    return () => window.clearTimeout(timer);
  }, [fetchDeposits]);

  function closeDetailModal() {
    setViewRow(null);
    setDetailLoading(false);
  }

  function handleAction(actionKey, row) {
    if (actionKey === "view") {
      fetchDepositDetail(getDepositId(row), row);
    }
  }

  function handleDepositFilterChange(key, value) {
    if (key === "search") {
      setSearch(value);
      setPage(1);
      return;
    }

    if (key === "type") {
      setTypeFilter(value || "all");
      setPage(1);
      return;
    }

    if (key === "status") {
      setStatusFilter(value || "all");
      setPage(1);
      return;
    }

    if (key === "buttonType") {
      setButtonTypeFilter(value || "all");
      setPage(1);
      return;
    }

    if (key === "from" || key === "to") {
      setDateRange((current) => ({ ...current, [key]: value }));
      setPage(1);
    }
  }

  function resetDepositFilters() {
    setSearch("");
    setTypeFilter("all");
    setStatusFilter("all");
    setButtonTypeFilter("all");
    setDateRange({ from: "", to: "" });
    setPage(1);
  }

  return (
    <div className="space-y-8">
      {toast && (
        <div className="fixed right-4 top-4 z-[80] w-[calc(100vw-2rem)] max-w-md sm:right-6 sm:top-6">
          <Toast key={toast.id} content={toast.content} color={toast.color} duration={2500} />
        </div>
      )}

      <section className="space-y-2">
        <h1 className="text-large font-semibold text-theme-text">Deposit</h1>
        <p className="text-small text-text-secondary">
          {totalRecords} deposit{totalRecords === 1 ? "" : "s"} recorded
        </p>
      </section>

      <div className="flex justify-start sm:justify-end">
        {/* <ExportButton
          rows={filteredRows}
          columns={columns}
          fileName="eco-banx-deposit-history.csv"
          disabled={!filteredRows.length || loading}
        >
          Export
        </ExportButton> */}
      </div>

      <Table
        title="Deposit History"
        description="Latest wallet deposit records"
        columns={columns}
        data={loading ? [] : tableRows}
        loading={loading}
        rowKey="id"
        filters={[
          {
            key: "search",
            type: "search",
            label: "Search Deposit",
            placeholder: "Search Deposit, asset, network or hash",
          },
          {
            key: "type",
            type: "dropdown",
            label: "Type",
            placeholder: "All Types",
            options: [
              { label: "All", value: "all" },
              { label: "Deposit", value: "deposit" },
              { label: "PayIn", value: "payIn" },
            ],
          },
          {
            key: "status",
            type: "dropdown",
            label: "Status",
            placeholder: "All Status",
            options: [
              { label: "All", value: "all" },
              { label: "Pending", value: "pending" },
              { label: "Confirmed", value: "confirmed" },
              { label: "Failed", value: "failed" },
            ],
          },
          {
            key: "buttonType",
            type: "dropdown",
            label: "Button Type",
            placeholder: "All Button Types",
            options: [
              { label: "All", value: "all" },
              { label: "Simple", value: "simple" },
              { label: "Advanced", value: "advanced" },
            ],
          },
          {
            type: "dateRange",
            label: "Date Range",
            fromKey: "from",
            toKey: "to",
            fromLabel: "From",
            toLabel: "To",
          },
        ]}
        filterValues={{
          search,
          type: typeFilter,
          status: statusFilter,
          buttonType: buttonTypeFilter,
          from: dateRange.from,
          to: dateRange.to,
        }}
        onFilterChange={handleDepositFilterChange}
        onFiltersReset={search.trim() || typeFilter !== "all" || statusFilter !== "all" || buttonTypeFilter !== "all" || dateRange.from || dateRange.to ? resetDepositFilters : undefined}
        showSearch={false}
        showViewAll={false}
        actions={tableActions}
        onAction={handleAction}
        pagination={{
          page,
          pageSize: pagination?.limit || DEPOSIT_PAGE_SIZE,
          total: totalRecords,
          totalPages,
          onPageChange: fetchDeposits,
        }}
        className="mt-0"
        tableClassName="min-w-[1120px]"
      />

      <DepositDetailModal
        open={Boolean(viewRow) || detailLoading}
        row={viewRow}
        loading={detailLoading}
        onClose={closeDetailModal}
      />
    </div>
  );
}
