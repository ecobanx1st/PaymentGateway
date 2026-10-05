"use client";

import {
  Button,
  ConfirmationDialog,
  Input,
  Modal,
  Table,
  Toast,
  Toggle,
} from "@/components/ReusableUi";
import { getWithTokenApi, postWithTokenApi } from "@/lib/apiHelper";
import { getAuthToken } from "@/lib/axiosInterceptor";
import { CheckCircle2, Pencil, Eye, Check, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

const initialLimitRows = [
  {
    id: "daily-limit",
    limitType: "Daily withdraw limit",
    amountLimit: "5000",
    active: true,
  },
  {
    id: "weekly-limit",
    limitType: "Weekly withdraw limit",
    amountLimit: "25000",
    active: true,
  },
  {
    id: "monthly-limit",
    limitType: "Monthly withdraw limit",
    amountLimit: "100000",
    active: false,
  },
];

const editFields = [
  { key: "limitType", label: "Limit Type", editable: false },
  { key: "amountLimit", label: "Withdraw Amount Limit", type: "number" },
  { key: "active", label: "Active Status", type: "toggle" },
];

const limitActions = [
  {
    key: "edit",
    label: "Edit limit",
    iconNode: <Pencil className="h-3 w-3" />,
  },
];

const WITHDRAW_FEE_ENDPOINTS = {
  get: "/getWithdrawFee",
  update: "/updateWithdrawFee",
};

const WITHDRAWAL_ENDPOINTS = {
  list: "/withdrawals",
  detail: (withdrawId) => `/withdrawals/${withdrawId}`,
  approve: (withdrawId) => `/withdrawals/${withdrawId}/approve`,
  reject: (withdrawId) => `/withdrawals/${withdrawId}/reject`,
};

function getApiErrorMessage(error, fallbackMessage = "Action failed.") {
  const data = error.response?.data;

  return data?.message || data?.msg || data?.error || data?.errors?.msg || error.message || fallbackMessage;
}

function assertApiSuccess(response, fallbackMessage) {
  if (response?.success === false) {
    throw new Error(response.message || fallbackMessage);
  }
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

function isUrl(value) {
  return /^https?:\/\//i.test(String(value || ""));
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

function normalizeWithdrawalDetail(data) {
  return {
    ...data,
    _id: data._id || "-",
    status: data.status || "-",
    amount: data.amount != null ? Number(data.amount) : "-",
    fee: data.fee != null ? Number(data.fee) : 0,
    withdrawFee: data.fee != null ? Number(data.fee) : 0,
    netAmount: data.netAmount != null ? Number(data.netAmount) : "-",
    totalAmount: data.totalAmount != null ? Number(data.totalAmount) : "-",
    merchantName: data.merchantId?.fullName
      ? `${data.merchantId.fullName}${data.merchantId.email ? ` (${data.merchantId.email})` : ""}`
      : "-",
    asset:
      data.assetId?.assetName || data.assetId?.assetSymbol || data.assetSymbol || "-",
    network:
      data.networkId?.networkName || data.networkId?.networkSymbol || data.networkSymbol || "-",
    fromAddress: data.fromAddress || "-",
    receiverAddress: data.receiverAddress || data.toAddress || "-",
    transactionHash: data.transactionHash || data.txHash || "-",
    failureReason: data.failureReason || "-",
    rejectionReason: data.rejectionReason || "-",
    approvedAt: data.approvedAt ? new Date(data.approvedAt).toLocaleString() : "-",
    rejectedAt: data.rejectedAt ? new Date(data.rejectedAt).toLocaleString() : "-",
    createdAt: data.createdAt ? new Date(data.createdAt).toLocaleString() : "-",
  };
}

function getWithdrawalDetailFields() {
  return [
    // { key: "_id", label: "Withdrawal ID" },
    { key: "status", label: "Status" },
    { key: "merchantName", label: "Merchant" },
    { key: "asset", label: "Asset" },
    { key: "network", label: "Network" },
    { key: "amount", label: "Amount" },
    { key: "withdrawFee", label: "Withdraw Fee" },
    // { key: "netAmount", label: "Net Amount" },
    { key: "totalAmount", label: "Total Amount" },
    { key: "fromAddress", label: "From Address" },
    { key: "receiverAddress", label: "Receiver Address" },
    { key: "transactionHash", label: "Transaction Hash" },
    { key: "failureReason", label: "Failure Reason" },
    { key: "rejectionReason", label: "Rejection Reason" },
    { key: "approvedAt", label: "Approved At" },
    { key: "rejectedAt", label: "Rejected At" },
    { key: "createdAt", label: "Requested At" },
  ];
}

function WithdrawalDetailModal({ open, row, loading, onClose }) {
  if (!open) {
    return null;
  }

  const detailData = row?.raw || {};
  const visibleFields = getWithdrawalDetailFields();

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 px-4 py-6">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Withdrawal Details"
        className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-rounded border border-input-border/60 bg-bg-primary shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-input-border/40 px-5 py-4">
          <div className="space-y-1">
            <h2 className="text-large font-semibold text-theme-text">Withdrawal Details</h2>
            <p className="text-small text-text-secondary">{detailData._id || "Loading withdrawal"}</p>
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
              {visibleFields.map((field) => (
                <DetailValue key={field.key} label={field.label} value={detailData[field.key]} />
              ))}
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

export default function WithdrawFeePage() {
  const [withdrawLimit, setWithdrawLimit] = useState("");
  const [limitRows, setLimitRows] = useState(initialLimitRows);
  const [editingRow, setEditingRow] = useState(null);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [pendingWithdrawals, setPendingWithdrawals] = useState([]);
  const [pendingLoading, setPendingLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState({});
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [withdrawPage, setWithdrawPage] = useState(1);
  const [withdrawPageLimit, setWithdrawPageLimit] = useState(10);
  const [withdrawPagination, setWithdrawPagination] = useState(null);
  const [viewRow, setViewRow] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [confirmApproveId, setConfirmApproveId] = useState(null);
  const [confirmRejectId, setConfirmRejectId] = useState(null);

  function showToast(content, color = "success") {
    setToast({ id: Date.now(), content, color });
  }

  const fetchWithdrawFee = useCallback(async () => {
    const token = getAuthToken();

    if (!token) {
      setToast({ id: Date.now(), content: "Session token not found", color: "error" });
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const response = await getWithTokenApi(token, WITHDRAW_FEE_ENDPOINTS.get);
      assertApiSuccess(response, "Unable to fetch withdrawal fee.");

      const fee = response?.result?.withdrawalFee ?? response?.data?.withdrawalFee;

      if (fee !== undefined && fee !== null && fee !== "") {
        setWithdrawLimit(String(fee));
      }
    } catch (error) {
      const message = error.message || getApiErrorMessage(error, "Unable to fetch withdrawal fee.");

      if (message !== "Withdrawal fee not found") {
        showToast(message, "error");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPendingWithdrawals = useCallback(async (nextPage = 1, nextLimit = withdrawPageLimit) => {
    const token = getAuthToken();

    if (!token) {
      setPendingWithdrawals([]);
      setWithdrawPagination(null);
      showToast("Session token not found", "error");
      return;
    }

    setPendingLoading(true);

    const params = {
      page: nextPage,
      limit: nextLimit,
      status: "PENDING",
    };

    if (debouncedSearch) params.search = debouncedSearch;
    if (dateRange.from) params.startDate = `${dateRange.from}T00:00:00`;
    if (dateRange.to) params.endDate = `${dateRange.to}T23:59:59`;

    try {
      const response = await getWithTokenApi(token, WITHDRAWAL_ENDPOINTS.list, params);
      assertApiSuccess(response, "Unable to fetch withdrawals.");

      const withdrawals = response?.data?.withdrawals ?? [];
      const nextPagination = response?.data?.pagination ?? null;

      setPendingWithdrawals(withdrawals);
      setWithdrawPagination(nextPagination);
      setWithdrawPage(nextPagination?.page || nextPage);
    } catch (error) {
      setPendingWithdrawals([]);
      setWithdrawPagination(null);
      const message = error.message || getApiErrorMessage(error, "Unable to fetch withdrawals.");
      showToast(message, "error");
    } finally {
      setPendingLoading(false);
    }
  }, [dateRange.from, dateRange.to, debouncedSearch, withdrawPageLimit]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      fetchWithdrawFee();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [fetchWithdrawFee]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      fetchPendingWithdrawals(1);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [fetchPendingWithdrawals]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 500);

    return () => window.clearTimeout(timer);
  }, [search]);

  async function handleConfirm(event) {
    event.preventDefault();

    if (!withdrawLimit.trim()) {
      showToast("Withdraw limit is required", "error");
      return;
    }

    const feeValue = Number(withdrawLimit);

    if (Number.isNaN(feeValue) || feeValue < 0) {
      showToast("Enter a valid non-negative withdraw limit", "error");
      return;
    }

    const token = getAuthToken();

    if (!token) {
      showToast("Session token not found", "error");
      return;
    }

    setSubmitting(true);

    try {
      const response = await postWithTokenApi(token, WITHDRAW_FEE_ENDPOINTS.update, {
        withdrawalFee: feeValue,
      });
      assertApiSuccess(response, "Unable to save withdrawal fee.");

      showToast(response?.message || "Withdrawal fee saved successfully");
    } catch (error) {
      showToast(getApiErrorMessage(error, "Unable to save withdrawal fee."), "error");
    } finally {
      setSubmitting(false);
    }
  }

  function handleStatusChange(rowId, active) {
    setLimitRows((currentRows) =>
      currentRows.map((row) => (row.id === rowId ? { ...row, active } : row)),
    );
  }

  function handleTableAction(actionKey, row) {
    if (actionKey === "edit") {
      setEditingRow(row);
    }
  }

  function handleSaveLimit(updatedRow) {
    if (!String(updatedRow.amountLimit).trim()) {
      showToast("Withdraw amount limit is required", "error");
      return;
    }

    setLimitRows((currentRows) =>
      currentRows.map((row) =>
        row.id === updatedRow.id
          ? {
            ...row,
            amountLimit: String(updatedRow.amountLimit),
            active: Boolean(updatedRow.active),
          }
          : row,
      ),
    );
    setEditingRow(null);
    showToast(`${updatedRow.limitType} updated successfully`);
  }

  async function handleViewWithdrawal(withdrawId) {
    const token = getAuthToken();

    if (!token) {
      showToast("Session token not found", "error");
      return;
    }

    setDetailLoading(true);
    setViewRow({ raw: {} });

    try {
      const response = await getWithTokenApi(token, WITHDRAWAL_ENDPOINTS.detail(withdrawId));
      assertApiSuccess(response, "Unable to fetch withdrawal details.");

      setViewRow({ raw: normalizeWithdrawalDetail(response?.data || {}) });
    } catch (error) {
      setViewRow(null);
      const message = error.message || getApiErrorMessage(error, "Unable to fetch withdrawal details.");
      showToast(message, "error");
    } finally {
      setDetailLoading(false);
    }
  }

  async function performApprove(withdrawId) {
    const token = getAuthToken();

    if (!token) {
      showToast("Session token not found", "error");
      return;
    }

    setActionLoading((prev) => ({ ...prev, [withdrawId]: "approve" }));

    try {
      const response = await postWithTokenApi(token, WITHDRAWAL_ENDPOINTS.approve(withdrawId), {});
      assertApiSuccess(response, "Unable to approve withdrawal.");

      showToast(response?.message || "Withdrawal approved successfully", "success");
      setConfirmApproveId(null);
      fetchPendingWithdrawals(withdrawPage);
    } catch (error) {
      const message = error.message || getApiErrorMessage(error, "Unable to approve withdrawal.");
      showToast(message, "error");
    } finally {
      setActionLoading((prev) => ({ ...prev, [withdrawId]: null }));
    }
  }

  async function performReject(withdrawId, reason) {
    const token = getAuthToken();

    if (!token) {
      showToast("Session token not found", "error");
      return;
    }

    setActionLoading((prev) => ({ ...prev, [withdrawId]: "reject" }));

    try {
      const response = await postWithTokenApi(token, WITHDRAWAL_ENDPOINTS.reject(withdrawId), {
        reason,
      });
      assertApiSuccess(response, "Unable to reject withdrawal.");

      showToast(response?.message || "Withdrawal rejected successfully", "success");
      setConfirmRejectId(null);
      fetchPendingWithdrawals(withdrawPage);
    } catch (error) {
      const message = error.message || getApiErrorMessage(error, "Unable to reject withdrawal.");
      showToast(message, "error");
    } finally {
      setActionLoading((prev) => ({ ...prev, [withdrawId]: null }));
    }
  }

  function resetWithdrawalFilters() {
    setSearch("");
    setDebouncedSearch("");
    setDateRange({ from: "", to: "" });
    setWithdrawPage(1);
  }

  function handleWithdrawalFilterChange(key, value) {
    if (key === "search") {
      setSearch(value);
      setWithdrawPage(1);
      return;
    }

    if (key === "from" || key === "to") {
      setDateRange((current) => ({ ...current, [key]: value }));
      setWithdrawPage(1);
    }
  }

  const limitColumns = [
    { key: "limitType", header: "Limit Type", cellClassName: "min-w-48" },
    {
      key: "amountLimit",
      header: "Withdraw Amount Limit",
      cellClassName: "min-w-56",
      render: (value) => (
        <span className="font-medium text-theme-text">{value}</span>
      ),
    },
    {
      key: "statusLabel",
      header: "Status",
      cellClassName: "min-w-44",
      render: (_value, row) => (
        <div className="flex items-center gap-3">
          <Toggle
            checked={row.active}
            label={`${row.limitType} status`}
            onChange={(checked) => handleStatusChange(row.id, checked)}
          />
          <span
            className={row.active ? "text-emerald-400" : "text-text-secondary"}
          >
            {row.active ? "Active" : "Inactive"}
          </span>
        </div>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      type: "actions",
      cellClassName: "min-w-28",
    },
  ];

  const pendingColumns = [
    // {
    //   key: "withdrawId",
    //   header: "Withdrawal ID",
    //   cellClassName: "min-w-48",
    //   render: (value) => (
    //     <span className="font-mono text-xs font-medium text-theme-text">
    //       {value ? String(value).slice(0, 12) + "..." : "-"}
    //     </span>
    //   ),
    // },
    {
      key: "asset",
      header: "Asset",
      cellClassName: "min-w-32",
      render: (value) => <span className="font-medium text-theme-text">{value || "-"}</span>,
    },
    {
      key: "network",
      header: "Network",
      cellClassName: "min-w-32",
      render: (value) => <span className="text-text-secondary">{value || "-"}</span>,
    },
    {
      key: "amount",
      header: "Amount",
      cellClassName: "min-w-28",
      render: (value) => <span className="font-medium text-theme-text">{value || "-"}</span>,
    },
    {
      key: "receiverAddress",
      header: "Receiver Address",
      cellClassName: "min-w-48",
      render: (value) => (
        <span className="font-mono text-xs text-text-secondary">
          {value ? String(value).slice(0, 12) + "..." : "-"}
        </span>
      ),
    },
    {
      key: "createdAt",
      header: "Requested At",
      cellClassName: "min-w-40",
      render: (value) => <span className="text-text-secondary">{value ? new Date(value).toLocaleString() : "-"}</span>,
    },
    {
      key: "actions",
      header: "Actions",
      cellClassName: "min-w-40",
      render: (_value, row) => (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleViewWithdrawal(row.id)}
            className="h-8 px-2.5 text-xs"
            title="View details"
          >
            <Eye size={14} />
          </Button>
          <Button
            size="sm"
            variant="primary"
            disabled={actionLoading[row.id]}
            onClick={() => setConfirmApproveId(row.id)}
            className="h-8 px-2.5 text-xs"
            title="Approve"
          >
            <Check size={14} />
          </Button>
          <Button
            size="sm"
            variant="danger"
            disabled={actionLoading[row.id]}
            onClick={() => setConfirmRejectId(row.id)}
            className="h-8 px-2.5 text-xs"
            title="Reject"
          >
            <X size={14} />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      {toast && (
        <div className="fixed right-4 top-4 z-[80] w-[calc(100vw-2rem)] max-w-md sm:right-6 sm:top-6">
          <Toast
            key={toast.id}
            content={toast.content}
            color={toast.color}
            duration={2500}
          />
        </div>
      )}

      <section className="space-y-2">
        <h1 className="text-xl font-semibold text-theme-text">
          Withdraw Limit
        </h1>
        <p className="text-md text-text-secondary">
          Set the withdraw limit requirement.
        </p>
      </section>

      {loading && (
        <div className="rounded-rounded border border-input-border/40 bg-bg-primary px-5 py-4 text-small text-text-secondary">
          Loading withdrawal fee...
        </div>
      )}

      <form
        onSubmit={handleConfirm}
        className="max-w-md flex justify-between items-end gap-5 rounded-rounded border border-input-border/40 bg-card-bg p-5 sm:p-6"
      >
        <Input
          label="Withdraw limit"
          suffix="USD"
          type="number"
          min="0"
          step="any"
          value={withdrawLimit}
          onChange={(event) => setWithdrawLimit(event.target.value)}
          placeholder={loading ? "Loading..." : "Enter withdraw limit"}
          inputClassName="rounded-[8px] w-fit"
          disabled={loading || submitting}
        />
        <div className="h-fit flex justify-end">
          <Button
            type="submit"
            beforeIcon={<CheckCircle2 className="h-4 w-4" />}
            disabled={loading || submitting}
          >
            {submitting ? "Saving..." : "Confirm"}
          </Button>
        </div>
      </form>
      {/* 
      <Table
        title="Withdraw Amount Limits"
        description="Manage active and inactive withdraw amount limits."
        columns={limitColumns}
        // data={limitRows.map((row) => ({
        //   ...row,
        //   statusLabel: row.active ? "Active" : "Inactive",
        // }))}
        data={[]}
        rowKey="id"
        actions={limitActions}
        onAction={handleTableAction}
        showSearch={false}
        showViewAll={false}
        pagination={{
          page: 1,
          pageSize: limitRows.length,
          total: limitRows.length,
          totalPages: 1,
        }}
        tableClassName="min-w-[760px]"
      /> */}

      <Table
        title="Withdrawal Requests"
        description="Review, filter and approve or reject pending withdrawal requests."
        columns={pendingColumns}
        data={pendingWithdrawals.map((w) => ({
          id: w._id || w.id,
          withdrawId: w._id || w.id,
          asset: w.assetId?.assetSymbol || w.assetSymbol || "-",
          network: w.networkId?.networkSymbol || w.networkSymbol || "-",
          amount:
            w.totalAmount != null ? Number(w.totalAmount).toFixed(8) : "-",
          receiverAddress: w.receiverAddress || w.toAddress || "-",
          createdAt: w.createdAt,
          raw: w,
        }))}
        rowKey="id"
        filters={[
          {
            key: "search",
            type: "search",
            label: "Search",
            placeholder: "Search by receiver or from address",
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
          from: dateRange.from,
          to: dateRange.to,
        }}
        onFilterChange={handleWithdrawalFilterChange}
        onFiltersReset={
          search || dateRange.from || dateRange.to
            ? resetWithdrawalFilters
            : undefined
        }
        showSearch={false}
        showViewAll={false}
        loading={pendingLoading}
        emptyTitle="No pending withdrawals"
        emptyMessage="No withdrawal requests match the current filters."
        pagination={{
          page: withdrawPage,
          pageSize: withdrawPagination?.limit || withdrawPageLimit,
          total: withdrawPagination?.total || 0,
          totalPages: withdrawPagination?.totalPages || 1,
          onPageChange: (nextPage) => fetchPendingWithdrawals(nextPage),
          onPageSizeChange: (nextSize) => {
            setWithdrawPageLimit(nextSize);
            fetchPendingWithdrawals(1, nextSize);
          },
        }}
        tableClassName="min-w-[900px]"
      />

      <Modal
        open={Boolean(editingRow)}
        mode="edit"
        title="Edit Withdraw Limit"
        description={editingRow?.limitType}
        data={editingRow}
        fields={editFields}
        saveLabel="Update Limit"
        onClose={() => setEditingRow(null)}
        onSave={handleSaveLimit}
      />

      <WithdrawalDetailModal
        open={Boolean(viewRow) || detailLoading}
        row={viewRow}
        loading={detailLoading}
        onClose={() => {
          setViewRow(null);
          setDetailLoading(false);
        }}
      />

      <ConfirmationDialog
        open={Boolean(confirmApproveId)}
        title="Approve Withdrawal"
        description="Approve this withdrawal? The blockchain transfer will be executed."
        confirmLabel="Approve"
        tone="success"
        confirmLoading={Boolean(
          confirmApproveId && actionLoading[confirmApproveId],
        )}
        onClose={() => {
          if (!actionLoading[confirmApproveId]) setConfirmApproveId(null);
        }}
        onConfirm={() => performApprove(confirmApproveId)}
      />

      <ConfirmationDialog
        open={Boolean(confirmRejectId)}
        title="Reject Withdrawal"
        description="Reject this withdrawal request? The locked balance will be refunded."
        confirmLabel="Reject"
        tone="danger"
        requireReason
        reasonLabel="Rejection reason"
        reasonPlaceholder="Enter the reason for rejection"
        confirmLoading={Boolean(
          confirmRejectId && actionLoading[confirmRejectId],
        )}
        onClose={() => {
          if (!actionLoading[confirmRejectId]) setConfirmRejectId(null);
        }}
        onConfirm={({ reason }) => performReject(confirmRejectId, reason)}
      />
    </div>
  );
}
