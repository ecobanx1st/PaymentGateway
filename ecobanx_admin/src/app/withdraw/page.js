"use client";

import { Button, ConfirmationDialog, Table, Toast } from "@/components/ReusableUi";
import { getWithTokenApi, postWithTokenApi } from "@/lib/apiHelper";
import { getAuthToken } from "@/lib/axiosInterceptor";
import { formatApiDate } from "@/lib/dateFormat";
import { Eye, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

const WITHDRAW_PAGE_SIZE = 10;
const WITHDRAW_ENDPOINTS = {
  list: "/withdrawals",
  detail: (withdrawalId) => `/withdrawals/${withdrawalId}`,
  approve: (withdrawalId) => `/withdrawals/${withdrawalId}/approve`,
  reject: (withdrawalId) => `/withdrawals/${withdrawalId}/reject`,
};

const WITHDRAW_STATUS_OPTIONS = [
  { value: "", label: "All Status" },
  { value: "PENDING", label: "Pending" },
  // { value: "APPROVED", label: "Approved" },
  { value: "PROCESSING", label: "Processing" },
  { value: "COMPLETED", label: "Completed" },
  { value: "REJECTED", label: "Rejected" },
  { value: "FAILED", label: "Failed" },
];

const WITHDRAW_TYPE_OPTIONS = [
  { value: "", label: "All Types" },
  { value: "withdraw", label: "Withdraw" },
  { value: "payout", label: "Payout" },
];

const detailFields = [
  // { key: "reference", label: "Reference" },
  // { key: "withdrawalId", label: "Withdrawal ID" },
  { key: "merchant", label: "Merchant" },
  { key: "merchantEmail", label: "Merchant Email" },
  { key: "merchantType", label: "Merchant Type" },
  { key: "type", label: "Type" },
  // { key: "userId", label: "User ID" },
  // { key: "walletAddressId", label: "Wallet Address ID" },
  // { key: "walletId", label: "Wallet ID" },
  { key: "asset", label: "Asset" },
  // { key: "assetName", label: "Asset Name" },
  // { key: "network", label: "Network" },
  { key: "networkSymbol", label: "Network Symbol" },
  { key: "apiKeyName", label: "API Key Name" },
  { key: "amount", label: "Amount" },
  // { key: "fee", label: "Fee" },
  { key: "fee", label: "Withdraw Fee" },
  { key: "gasFee", label: "Gas Fee" },
  { key: "netAmount", label: "Net Amount" },
  // { key: "totalAmount", label: "Total Amount" },
  { key: "status", label: "Status" },
  { key: "toAddress", label: "To Address" },
  // { key: "fromAddress", label: "From Address" },
  { key: "receiverAddress", label: "Receiver Address" },
  // { key: "txHash", label: "TX Hash" },
  { key: "transactionHash", label: "Transaction Hash" },
  { key: "blockNumber", label: "Block Number" },
  { key: "explorerUrl", label: "Explorer URL" },
  // { key: "failureReason", label: "Failure Reason" },
  { key: "rejectionReason", label: "Rejection Reason" },
  // { key: "adminEmail", label: "Admin Email" },
  // { key: "approvedAt", label: "Approved At" },
  // { key: "rejectedAt", label: "Rejected At" },
  { key: "createdAt", label: "Created At" },
  { key: "updatedAt", label: "Updated At" },
];

const columns = [
  // { key: "reference", header: "Reference", cellClassName: "min-w-40" },
  { key: "merchant", header: "Merchant", cellClassName: "min-w-40" },
  // { key: "merchantType", header: "Type", cellClassName: "min-w-28" },
  { key: "asset", header: "Asset", cellClassName: "min-w-28" },
  { key: "networkSymbol", header: "Network", cellClassName: "min-w-32" },
  { key: "apiKeyName", header: "API Key", cellClassName: "min-w-32" },
  { key: "amount", header: "Amount", cellClassName: "min-w-28" },
  { key: "fee", header: "Withdraw Fee", cellClassName: "min-w-28" },
  // { key: "withdrawFee", header: "Withdraw Fee", cellClassName: "min-w-32" },
  { key: "gasFee", header: "Gas Fee", cellClassName: "min-w-28" },
  { key: "netAmount", header: "Net Amount", cellClassName: "min-w-36" },
  // { key: "totalAmount", header: "Total Amount", cellClassName: "min-w-36" },
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
  // {
  //   key: "approve",
  //   label: "Approve withdraw",
  //   iconNode: <Check className="h-3 w-3" />,
  // },
  // {
  //   key: "reject",
  //   label: "Reject withdraw",
  //   iconNode: <X className="h-3 w-3" />,
  // },
];

function getApiErrorMessage(error, fallbackMessage = "Withdrawal action failed.") {
  const data = error.response?.data;

  return data?.message || data?.msg || data?.error || data?.errors?.msg || error.message || fallbackMessage;
}

function assertApiSuccess(response, fallbackMessage) {
  if (response?.success === false) {
    throw new Error(response.message || fallbackMessage);
  }
}

function titleCaseStatus(value) {
  const status = String(value || "").trim();

  if (!status) {
    return "-";
  }

  return status
    .toLowerCase()
    .split(/[\s_]+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatExactAmount(amount) {
  if (amount === null || amount === undefined || amount === "") {
    return "-";
  }

  return String(amount);
}

function getReference(withdrawal) {
  const identifier = withdrawal?._id || withdrawal?.id || "";

  if (!identifier) {
    return "-";
  }

  return `WDR-${String(identifier).slice(-8).toUpperCase()}`;
}

function getWithdrawalId(row) {
  return row?.withdrawalId || row?._id || row?.id;
}

function normalizeWithdrawal(withdrawal = {}) {
  const merchant = withdrawal.merchantId || {};
  const network = withdrawal.networkId || {};
  const asset = withdrawal.assetId || {};
  const toAddress = withdrawal.toAddress || withdrawal.receiverAddress || "-";
  const txHash = withdrawal.txHash || withdrawal.transactionHash || "-";

  return {
    id: withdrawal._id || withdrawal.id,
    withdrawalId: withdrawal._id || withdrawal.id || "-",
    reference: getReference(withdrawal),
    merchant: merchant.fullName || merchant.email || "-",
    merchantEmail: merchant.email || "-",
    merchantType: merchant.accountType
      ? merchant.accountType.charAt(0).toUpperCase() + merchant.accountType.slice(1).toLowerCase()
      : "-",
    userId: withdrawal.userId || "-",
    walletAddressId: withdrawal.walletAddressId || "-",
    walletId: withdrawal.walletId || "-",
    asset: asset.assetSymbol || asset.assetName || "-",
    assetName: asset.assetName || "-",
    network: network.networkName || network.networkSymbol || "-",
    networkSymbol: network.networkSymbol || "-",
    apiKeyName: withdrawal.apiKeyName || "-",
    amount: formatExactAmount(withdrawal.amount),
    fee: formatExactAmount(withdrawal.fee),
    withdrawFee: formatExactAmount(withdrawal.withdrawFee),
    netAmount: formatExactAmount(withdrawal.netAmount),
    totalAmount: formatExactAmount(withdrawal.totalAmount),
    status: titleCaseStatus(withdrawal.status),
    date: formatApiDate(withdrawal.createdAt),
    toAddress,
    fromAddress: withdrawal.fromAddress || "-",
    receiverAddress: withdrawal.receiverAddress || toAddress,
    txHash,
    transactionHash: withdrawal.transactionHash || withdrawal.txHash || "-",
    blockNumber: withdrawal.blockNumber ?? "-",
    gasFee: formatExactAmount(withdrawal.gasFee),
    type: withdrawal.type || "-",
    explorerUrl: withdrawal.explorerUrl || "-",
    failureReason: withdrawal.failureReason || "-",
    rejectionReason: withdrawal.rejectionReason || "-",
    adminEmail: withdrawal.adminId?.email || "-",
    approvedAt: formatApiDate(withdrawal.approvedAt),
    rejectedAt: formatApiDate(withdrawal.rejectedAt),
    createdAt: formatApiDate(withdrawal.createdAt),
    updatedAt: formatApiDate(withdrawal.updatedAt),
    searchText: [
      merchant.fullName,
      merchant.email,
      asset.assetName,
      asset.assetSymbol,
      network.networkName,
      network.networkSymbol,
      withdrawal.apiKeyName,
      withdrawal.amount,
      withdrawal.netAmount,
      withdrawal.totalAmount,
      withdrawal.status,
      toAddress,
      withdrawal.fromAddress,
      txHash,
      withdrawal.createdAt,
    ]
      .filter(Boolean)
      .join(" "),
    raw: withdrawal,
  };
}

function DetailValue({ label, value }) {
  return (
    <div className="rounded-[8px] border border-input-border/40 bg-input-bg/50 p-3">
      <p className="text-small font-medium text-text-secondary">{label}</p>
      <p className="mt-1 break-words text-mid font-medium text-theme-text">{value || "-"}</p>
    </div>
  );
}

function WithdrawDetailModal({
  open,
  row,
  loading,
  actionLoading,
  onClose,
  onRequestApprove,
  onRequestReject,
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 px-4 py-6">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Withdraw Details"
        className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-rounded border border-input-border/60 bg-bg-primary shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-input-border/40 px-5 py-4">
          <div className="space-y-1">
            <h2 className="text-large font-semibold text-theme-text">Withdraw Details</h2>
            {/* <p className="text-small text-text-secondary">{row?.reference || row?.withdrawalId || "Loading withdrawal"}</p> */}
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
              Loading withdrawal details...
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {detailFields.map((field) => (
                <DetailValue key={field.key} label={field.label} value={row?.[field.key]} />
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-input-border/40 px-5 py-4 sm:flex-row sm:justify-end">
          <Button variant="secondary" type="button" onClick={onClose} className="w-full sm:w-auto">
            Close
          </Button>
          {/* <Button
            type="button"
            disabled={loading || actionLoading || !row}
            onClick={() => onRequestReject(row)}
            className="w-full !border-red-500/30 !bg-red-500/15 !text-red-300 hover:!border-red-400 sm:w-auto"
            beforeIcon={<X className="h-4 w-4" />}
          >
            Reject
          </Button>
          <Button
            type="button"
            disabled={loading || actionLoading || !row}
            onClick={() => onRequestApprove(row)}
            className="w-full !border-emerald-500/30 !bg-emerald-500/15 !text-emerald-300 hover:!border-emerald-400 sm:w-auto"
            beforeIcon={<Check className="h-4 w-4" />}
          >
            Approve
          </Button> */}
        </div>
      </div>
    </div>
  );
}

export default function WithdrawPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [page, setPage] = useState(1);
  const [tableRows, setTableRows] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [viewRow, setViewRow] = useState(null);
  const [confirmation, setConfirmation] = useState(null);
  const [toast, setToast] = useState(null);

  const totalPages = pagination?.totalPages || Math.max(1, Math.ceil((pagination?.total ?? 0) / WITHDRAW_PAGE_SIZE));

  function showToast(content, color = "success") {
    setToast({ id: Date.now(), content, color });
  }

  const fetchWithdrawals = useCallback(async (nextPage = 1) => {
    const token = getAuthToken();

    if (!token) {
      setTableRows([]);
      setPagination(null);
      setLoading(false);
      setToast({ id: Date.now(), content: "Session token not found", color: "error" });
      return;
    }

    setLoading(true);

    try {
      const params = {
        page: nextPage,
        limit: WITHDRAW_PAGE_SIZE,
      };

      if (debouncedSearch) {
        params.search = debouncedSearch;
      }

      if (statusFilter) {
        params.status = statusFilter;
      }

      if (typeFilter) {
        params.type = typeFilter;
      }

      if (dateRange.from) {
        params.startDate = `${dateRange.from}T00:00:00`;
      }

      if (dateRange.to) {
        params.endDate = `${dateRange.to}T23:59:59`;
      }

      const response = await getWithTokenApi(token, WITHDRAW_ENDPOINTS.list, params);
      assertApiSuccess(response, "Unable to fetch withdrawals.");

      const withdrawals = Array.isArray(response?.data?.withdrawals) ? response.data.withdrawals : [];
      const nextPagination = response?.data?.pagination || null;

      setTableRows(withdrawals.map(normalizeWithdrawal));
      setPagination(nextPagination);
      setPage(nextPagination?.page || nextPage);
    } catch (error) {
      setTableRows([]);
      setPagination(null);
      showToast(getApiErrorMessage(error, "Unable to fetch withdrawals."), "error");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, statusFilter, typeFilter, dateRange.from, dateRange.to]);

  const fetchWithdrawalDetail = useCallback(async (withdrawalId, fallbackRow = null) => {
    const token = getAuthToken();

    if (!token) {
      showToast("Session token not found", "error");
      return null;
    }

    if (!withdrawalId) {
      showToast("Withdrawal ID not found", "error");
      return null;
    }

    setViewRow(fallbackRow);
    setDetailLoading(true);

    try {
      const response = await getWithTokenApi(token, WITHDRAW_ENDPOINTS.detail(withdrawalId));
      assertApiSuccess(response, "Unable to fetch withdrawal details.");

      const normalizedDetail = normalizeWithdrawal(response?.data || {});
      setViewRow(normalizedDetail);
      return normalizedDetail;
    } catch (error) {
      showToast(getApiErrorMessage(error, "Unable to fetch withdrawal details."), "error");
      return null;
    } finally {
      setDetailLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 500);

    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      fetchWithdrawals(1);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [fetchWithdrawals]);

  function closeDetailModal() {
    setViewRow(null);
    setDetailLoading(false);
    setConfirmation(null);
  }

  function requestModalAction(actionKey, row) {
    setConfirmation({ actionKey, row });
  }

  async function runWithdrawalAction(actionKey, row, details = {}) {
    if (actionLoading) {
      return;
    }

    const token = getAuthToken();
    const withdrawalId = getWithdrawalId(row);

    if (!token) {
      showToast("Session token not found", "error");
      return;
    }

    if (!withdrawalId) {
      showToast("Withdrawal ID not found", "error");
      return;
    }

    setActionLoading(true);

    try {
      const endpoint = actionKey === "approve"
        ? WITHDRAW_ENDPOINTS.approve(withdrawalId)
        : WITHDRAW_ENDPOINTS.reject(withdrawalId);
      const payload = actionKey === "reject" ? { reason: details.reason || "" } : {};
      const response = await postWithTokenApi(token, endpoint, payload);

      assertApiSuccess(
        response,
        actionKey === "approve" ? "Unable to approve withdrawal." : "Unable to reject withdrawal.",
      );

      showToast(
        response?.message || (actionKey === "approve" ? "Withdraw approved successfully" : "Withdraw rejected successfully"),
      );
      await fetchWithdrawals(page);

      if (viewRow && getWithdrawalId(viewRow) === withdrawalId) {
        await fetchWithdrawalDetail(withdrawalId, viewRow);
      }
    } catch (error) {
      showToast(
        getApiErrorMessage(
          error,
          actionKey === "approve" ? "Unable to approve withdrawal." : "Unable to reject withdrawal.",
        ),
        "error",
      );
    } finally {
      setActionLoading(false);
    }
  }

  function handleAction(actionKey, row, details = {}) {
    if (actionKey === "view") {
      fetchWithdrawalDetail(getWithdrawalId(row), row);
      return;
    }

    if (actionKey === "approve" || actionKey === "reject") {
      runWithdrawalAction(actionKey, row, details);
    }
  }

  function handleWithdrawFilterChange(key, value) {
    if (key === "search") {
      setSearch(value);
      setPage(1);
      return;
    }

    if (key === "status") {
      setStatusFilter(value);
      setPage(1);
      return;
    }

    if (key === "type") {
      setTypeFilter(value);
      setPage(1);
      return;
    }

    if (key === "from" || key === "to") {
      setDateRange((current) => ({ ...current, [key]: value }));
      setPage(1);
    }
  }

  function resetWithdrawFilters() {
    setSearch("");
    setDebouncedSearch("");
    setStatusFilter("");
    setTypeFilter("");
    setDateRange({ from: "", to: "" });
    setPage(1);
  }

  const modalConfirmationCopy = confirmation?.actionKey === "approve"
    ? {
        title: "Confirm approval",
        description: "Are you sure you want to approve this withdrawal?",
        confirmLabel: "Approve",
        tone: "success",
        requireReason: false,
      }
    : {
        title: "Confirm rejection",
        description: "Add a reason before you reject this withdrawal.",
        confirmLabel: "Reject",
        tone: "danger",
        requireReason: true,
      };

  return (
    <div className="space-y-8">
      {toast && (
        <div className="fixed right-4 top-4 z-[80] w-[calc(100vw-2rem)] max-w-md sm:right-6 sm:top-6">
          <Toast key={toast.id} content={toast.content} color={toast.color} duration={2500} />
        </div>
      )}

      <section className="space-y-2">
        <h1 className="text-large font-semibold text-theme-text">Withdraw</h1>
        <p className="text-small text-text-secondary">
          {pagination?.total ?? tableRows.length} withdraw
          {(pagination?.total ?? tableRows.length) === 1 ? "" : "s"} requested
        </p>
      </section>

      <Table
        title="Withdraw History"
        description="Latest withdraw requests"
        columns={columns}
        data={loading ? [] : tableRows}
        loading={loading}
        rowKey="id"
        filters={[
          {
            key: "search",
            type: "search",
            label: "Search Withdraw",
            placeholder: "Search by asset, network, address or hash",
          },
          {
            key: "status",
            type: "dropdown",
            label: "Status",
            options: WITHDRAW_STATUS_OPTIONS,
            placeholder: "All Status",
          },
          {
            key: "type",
            type: "dropdown",
            label: "Type",
            options: WITHDRAW_TYPE_OPTIONS,
            placeholder: "All Types",
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
          status: statusFilter,
          type: typeFilter,
          from: dateRange.from,
          to: dateRange.to,
        }}
        onFilterChange={handleWithdrawFilterChange}
        onFiltersReset={search.trim() || statusFilter || typeFilter || dateRange.from || dateRange.to ? resetWithdrawFilters : undefined}
        showSearch={false}
        showViewAll={false}
        actions={tableActions}
        onAction={handleAction}
        pagination={{
          page,
          pageSize: pagination?.limit || WITHDRAW_PAGE_SIZE,
          total: pagination?.total ?? tableRows.length,
          totalPages,
          onPageChange: fetchWithdrawals,
        }}
        className="mt-0"
        tableClassName="min-w-[1540px]"
      />

      <WithdrawDetailModal
        open={Boolean(viewRow) || detailLoading}
        row={viewRow}
        loading={detailLoading}
        actionLoading={actionLoading}
        onClose={closeDetailModal}
        onRequestApprove={(row) => requestModalAction("approve", row)}
        onRequestReject={(row) => requestModalAction("reject", row)}
      />

      <ConfirmationDialog
        open={Boolean(confirmation)}
        title={modalConfirmationCopy.title}
        description={modalConfirmationCopy.description}
        confirmLabel={modalConfirmationCopy.confirmLabel}
        reasonLabel="Rejection reason"
        reasonPlaceholder="Type the reason"
        requireReason={modalConfirmationCopy.requireReason}
        tone={modalConfirmationCopy.tone}
        onClose={() => setConfirmation(null)}
        onConfirm={(details) => {
          if (confirmation) {
            runWithdrawalAction(confirmation.actionKey, confirmation.row, details);
          }
          setConfirmation(null);
        }}
      />
    </div>
  );
}
