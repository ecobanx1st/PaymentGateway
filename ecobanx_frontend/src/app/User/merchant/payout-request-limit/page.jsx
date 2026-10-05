"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Gauge,
  Plus,
  RefreshCw,
  Save,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  UserRound,
  WalletCards,
  X,
  XCircle,
} from "lucide-react";
import Button from "@/components/ui/button";
import Dropdown from "@/components/ui/dropdown";
import Input from "@/components/ui/input";
import MerchantToolPageHeader from "@/components/ui/MerchantToolPageHeader";
import Snackbar from "@/components/ui/Snackbar";
import Skeleton from "@/components/ui/skeleton";
import Toggle from "@/components/ui/Toggle";
import { apiClient, getApiErrorPayload } from "@/lib/axiosInterceptor";
import { getAccountBaseRoute } from "@/utils/accountRoutes";

const STORAGE_KEY = "ecobanx-payout-request-limit";

const currencyOptions = [
  { label: "USDT", value: "USDT" },
  { label: "USD", value: "USD" },
  { label: "BTC", value: "BTC" },
  { label: "ETH", value: "ETH" },
  { label: "NGN", value: "NGN" },
];

const periodOptions = [
  { label: "Per withdrawal", value: "single" },
  { label: "Daily total", value: "daily" },
  { label: "Monthly total", value: "monthly" },
];

const statusFilters = [
  { label: "Pending", value: "Pending" },
  { label: "Processing", value: "Processing" },
  { label: "Approved", value: "Approved" },
  { label: "Rejected", value: "Rejected" },
  { label: "All", value: "All" },
];

const defaultLimitSettings = {
  enabled: true,
  // API: POST /merchant/withdraw-limit -> withdrawalLimit
  amount: "5000",
  // API: POST /merchant/withdraw-limit -> merchantUsersDailyLimit
  dailyAmount: "20000",
  currency: currencyOptions[0],
  period: periodOptions[1],
  autoExpireHours: "24",
  lastUpdated: "2026-08-12T09:15:00+05:30",
};

function toApiNumber(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

const defaultUserLimitDraft = {
  user: "",
  amount: "",
  currency: currencyOptions[0],
};

const defaultUserLimits = [
  {
    id: "limit-riya",
    user: "riya.shah@example.com",
    amount: "7500",
    currency: currencyOptions[0],
    active: true,
  },
  {
    id: "limit-market",
    user: "marketdesk@example.com",
    amount: "12000",
    currency: { label: "USD", value: "USD" },
    active: true,
  },
  {
    id: "limit-test",
    user: "pilot-user@example.com",
    amount: "1500",
    currency: currencyOptions[0],
    active: false,
  },
];

const defaultRequests = [
  {
    id: "PRL-1048",
    userName: "Riya Shah",
    email: "riya.shah@example.com",
    amount: 9200,
    currency: "USDT",
    limit: 7500,
    requestedAt: "2026-08-12T09:38:00+05:30",
    destination: "0x91fa2c8c41b9f04bc832",
    status: "Pending",
    reason: "Daily total exceeded",
    velocity: "3 withdrawals today",
  },
  {
    id: "PRL-1047",
    userName: "Nolan Reeves",
    email: "nolan.reeves@example.com",
    amount: 6800,
    currency: "USDT",
    limit: 5000,
    requestedAt: "2026-08-12T08:05:00+05:30",
    destination: "TTr8d2a7f8d318e22f4",
    status: "Pending",
    reason: "Per withdrawal limit exceeded",
    velocity: "1 withdrawal today",
  },
  {
    id: "PRL-1046",
    userName: "Market Desk",
    email: "marketdesk@example.com",
    amount: 15300,
    currency: "USD",
    limit: 12000,
    requestedAt: "2026-08-11T17:45:00+05:30",
    destination: "bank-settlement-8821",
    status: "Approved",
    reason: "Monthly total exceeded",
    velocity: "High volume account",
    reviewedAt: "2026-08-11T17:58:00+05:30",
  },
  {
    id: "PRL-1045",
    userName: "Pilot User",
    email: "pilot-user@example.com",
    amount: 3100,
    currency: "USDT",
    limit: 1500,
    requestedAt: "2026-08-10T13:14:00+05:30",
    destination: "0x4ce8d4998b619f012bb4",
    status: "Rejected",
    reason: "Inactive user limit",
    velocity: "New wallet address",
    reviewedAt: "2026-08-10T13:31:00+05:30",
  },
];

function toNumber(value, fallback = 0) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

function findCurrencyOption(value) {
  return (
    currencyOptions.find(
      (option) => option.value.toLowerCase() === String(value).toLowerCase(),
    ) || currencyOptions[0]
  );
}

function findPeriodOption(value) {
  return (
    periodOptions.find((option) => option.value === value) || periodOptions[1]
  );
}

function normalizeApiLimit(result) {
  if (!result || typeof result !== "object") return null;

  const patch = {};
  if (result.withdrawalLimit !== undefined && result.withdrawalLimit !== null) {
    patch.amount = String(result.withdrawalLimit);
  }
  if (
    result.merchantUsersDailyLimit !== undefined &&
    result.merchantUsersDailyLimit !== null
  ) {
    patch.dailyAmount = String(result.merchantUsersDailyLimit);
  }
  if (result.updatedAt) patch.lastUpdated = result.updatedAt;
  else if (result.createdAt) patch.lastUpdated = result.createdAt;
  return patch;
}

function normalizeStoredState(value) {
  if (!value || typeof value !== "object") return null;

  return {
    settings: {
      ...defaultLimitSettings,
      ...(value.settings || {}),
      // Back-compat: older drafts may only have `amount`.
      dailyAmount:
        value.settings?.dailyAmount ??
        value.settings?.merchantUsersDailyLimit ??
        defaultLimitSettings.dailyAmount,
      amount:
        value.settings?.amount ??
        value.settings?.withdrawalLimit ??
        defaultLimitSettings.amount,
      currency: findCurrencyOption(
        value.settings?.currency?.value || value.settings?.currency,
      ),
      period: findPeriodOption(value.settings?.period?.value || value.settings?.period),
    },
    userLimits: Array.isArray(value.userLimits)
      ? value.userLimits.map((limit) => ({
          ...limit,
          currency: findCurrencyOption(limit.currency?.value || limit.currency),
          active: limit.active !== false,
        }))
      : defaultUserLimits,
    requests: Array.isArray(value.requests) ? value.requests : defaultRequests,
  };
}

function loadStoredState() {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? normalizeStoredState(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

function writeStoredState(state) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function formatMoney(value, currency = "USDT") {
  const amount = toNumber(value);
  const fiatCurrencies = new Set(["USD", "EUR", "GBP", "NGN"]);

  if (fiatCurrencies.has(currency)) {
    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
        maximumFractionDigits: currency === "NGN" ? 0 : 2,
      }).format(amount);
    } catch {
      return `${currency} ${amount.toLocaleString("en-US")}`;
    }
  }

  return `${amount.toLocaleString("en-US", {
    maximumFractionDigits: 8,
  })} ${currency}`;
}

function formatDateTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isSameLocalDate(value, compareDate = new Date()) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;

  return (
    date.getFullYear() === compareDate.getFullYear() &&
    date.getMonth() === compareDate.getMonth() &&
    date.getDate() === compareDate.getDate()
  );
}

function getStatusTone(status) {
  if (status === "Approved") return "success";
  if (status === "Rejected") return "danger";
  if (status === "Processing") return "info";
  return "warning";
}

function StatusPill({ status }) {
  const tone = getStatusTone(status);
  const toneClass =
    tone === "success"
      ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-300"
      : tone === "danger"
        ? "border-red-400/25 bg-red-400/10 text-red-400"
        : tone === "info"
          ? "border-sky-400/25 bg-sky-400/10 text-sky-300"
          : "border-amber-400/25 bg-amber-400/10 text-amber-300";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${toneClass}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

function SummaryTile({ icon: Icon, label, value, detail, tone = "primary" }) {
  const toneClass =
    tone === "green"
      ? "bg-emerald-400/10 text-emerald-300"
      : tone === "amber"
        ? "bg-amber-400/10 text-amber-300"
        : tone === "blue"
          ? "bg-sky-400/10 text-sky-300"
          : "bg-primary/10 text-primary-text";

  return (
    <article className="rounded-lg border border-input-border bg-card-bg p-4 shadow-[0_14px_34px_rgba(8,19,12,0.08)]">
      <div className="flex items-start gap-3">
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${toneClass}`}
        >
          <Icon size={18} />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-normal text-secondary-text">
            {label}
          </p>
          <p className="mt-1 truncate text-lg font-bold text-theme-text">
            {value}
          </p>
          {detail ? (
            <p className="mt-1 text-xs leading-5 text-secondary-text">
              {detail}
            </p>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function SectionHeader({ icon: Icon, title, action }) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary-text">
          <Icon size={18} />
        </span>
        <h2 className="text-lg font-bold text-theme-text">{title}</h2>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

function RequestCard({ request, onApprove, onReject }) {
  const overLimit = Math.max(request.amount - request.limit, 0);
  const isPending = request.status === "Pending";

  return (
    <article className="rounded-lg border border-input-border bg-card-bg p-4 shadow-[0_14px_34px_rgba(8,19,12,0.08)]">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            {/* <span className="font-mono text-xs font-bold uppercase text-primary-text">
              {request.id}
            </span> */}
            <StatusPill status={request.status} />
          </div>
          <div className="mt-3 flex min-w-0 items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-input-border bg-input-bg text-secondary-text">
              <UserRound size={18} />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-theme-text">
                {request.userName}
              </p>
              <p className="truncate text-xs text-secondary-text">
                {request.email}
              </p>
            </div>
          </div>
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-secondary-text">
            Withdraw ID
          </p>
          <p className="mt-1 truncate font-mono text-xs font-semibold text-theme-text">
            {request.withdrawId || request.id}
          </p>
        </div>

        <div className="grid gap-3 text-sm sm:grid-cols-3 lg:min-w-[430px]">
          <div>
            <p className="text-xs font-semibold text-secondary-text">
              Total Amount
            </p>
            <p className="mt-1 font-bold text-theme-text">
              {formatMoney(request.amount, request.currency)}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold text-secondary-text">WithDrawal Fee</p>
            <p className="mt-1 font-bold text-theme-text">
              {/* {formatMoney(request.limit, request.currency)} */}
              {request.fee}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold text-secondary-text">
              Withdrawal Amount
            </p>
            <p className="mt-1 font-bold text-amber-300">
              {/* {formatMoney(overLimit, request.currency)} */}
              {request.netAmount}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-3 border-t border-input-border pt-4 text-sm md:grid-cols-[1fr_1fr_0.8fr]">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-secondary-text">
            Destination
          </p>
          <p className="mt-1 truncate font-mono text-xs font-semibold text-theme-text">
            {request.destination}
          </p>
        </div>
        {/* <div>
          <p className="text-xs font-semibold text-secondary-text">Signal</p>
          <p className="mt-1 font-semibold text-theme-text">
            {request.reason}
          </p>
          <p className="mt-1 text-xs text-secondary-text">{request.velocity}</p>
        </div> */}
          <div className="mt-4 grid gap-3  border-input-border pt-4 text-sm md:grid-cols-[1fr_1fr_0.8fr]">
        
        <div className="min-w-0">
          <p className="text-xs font-semibold text-secondary-text">
            Tx Hash
          </p>
          <p className="mt-1 truncate font-mono text-xs font-semibold text-theme-text">
            {request.txHash || "-"}
          </p>
        </div>
      </div>

      {request.failureReason || request.rejectionReason ? (
        <p className="mt-3 rounded-lg border border-red-400/25 bg-red-400/10 p-3 text-xs leading-5 text-red-400">
          {request.failureReason || request.rejectionReason}
        </p>
      ) : null}
        <div>
          <p className="text-xs font-semibold text-secondary-text">Time</p>
          <p className="mt-1 font-semibold text-theme-text">
            {formatDateTime(request.requestedAt)}
          </p>
          {request.reviewedAt ? (
            <p className="mt-1 text-xs text-secondary-text">
              Reviewed {formatDateTime(request.reviewedAt)}
            </p>
          ) : null}
        </div>
      </div>

    

      {isPending ? (
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => onReject(request.id)}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-red-400/30 bg-red-400/10 px-4 text-sm font-semibold text-red-400 transition hover:border-red-400/55 hover:bg-red-400/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/30"
          >
            <X size={15} />
            Reject
          </button>
          <button
            type="button"
            onClick={() => onApprove(request.id)}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 text-sm font-semibold text-emerald-300 transition hover:border-emerald-400/55 hover:bg-emerald-400/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/30"
          >
            <Check size={15} />
            Approve
          </button>
        </div>
      ) : null}
    </article>
  );
}

export default function Page() {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState(defaultLimitSettings);
  const [userLimits, setUserLimits] = useState(defaultUserLimits);
  const [draft, setDraft] = useState(defaultUserLimitDraft);
  const [requests, setRequests] = useState(defaultRequests);
  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState(statusFilters[0]);
  const [limitLoading, setLimitLoading] = useState(true);
  const [savingLimit, setSavingLimit] = useState(false);
  const [limitConfigured, setLimitConfigured] = useState(true);
  const [limitError, setLimitError] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    tone: "success",
  });
  const [queueLoading, setQueueLoading] = useState(false);
  const [queueError, setQueueError] = useState("");
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejecting, setRejecting] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  function showSnackbar(message, tone = "success") {
    setSnackbar({ open: true, message, tone });
  }

  function mapWithdrawalToRequest(doc, limitValue) {
    const rawStatus = String(doc?.status || "PENDING").toUpperCase();
    const status =
      rawStatus === "COMPLETED" || rawStatus === "APPROVED"
        ? "Approved"
        : rawStatus === "REJECTED" || rawStatus === "FAILED"
          ? "Rejected"
          : rawStatus === "PROCESSING"
            ? "Processing"
            : "Pending";
    const currency = String(
      doc?.assetId?.assetSymbol || doc?.assetSymbol || "USDT",
    ).toUpperCase();
    const destination = doc?.toAddress || doc?.receiverAddress || "-";
    const source = doc?.withdrawFrom || "";
    return {
      id: String(doc?._id || ""),
      _id: String(doc?._id || ""),
      withdrawId: String(doc?.withdrawId || ""),
      fee: toNumber(doc?.fee),
      netAmount: toNumber(doc?.netAmount ?? doc?.amount),
      totalAmount: toNumber(doc?.totalAmount ?? doc?.amount),
      txHash: doc?.txHash || doc?.transactionHash || null,
      failureReason: doc?.failureReason || null,
      rejectionReason: doc?.rejectionReason || null,
      userName:
        source === "create_transfer"
          ? "Merchant Payout"
          : "Withdrawal Request",
      email: destination,
      amount: toNumber(doc?.amount),
      currency,
      limit: toNumber(limitValue ?? settings.amount, 0),
      requestedAt: doc?.createdAt || new Date().toISOString(),
      reviewedAt: doc?.approvedAt || doc?.rejectedAt || null,
      destination,
      status,
      reason:
        doc?.approvalLevel === "MERCHANT"
          ? "Waiting merchant review"
          : source === "create_transfer"
            ? "Merchant transfer"
            : "Standard withdrawal",
      velocity: source ? `Source: ${source.replace(/_/g, " ")}` : "",
    };
  }

  async function fetchPendingQueue({ silent = false, limitValue, statusValue, pageOverride, searchOverride } = {}) {
    const baseRoute = getAccountBaseRoute();
    const route = baseRoute
      ? `${baseRoute}/withdrawals`
      : "/merchant/withdrawals";
    const tab = statusValue ?? statusFilter?.value ?? "Pending";

    if (!silent) setQueueLoading(true);
    setQueueError("");
    try {
      // Single review-queue API for all tabs (payout + create_transfer scope).
      // Tab is sent as status filter: Pending / Approved / Rejected / All.
      // Search + pagination hit the API.
      const qPage = pageOverride ?? page;
      const qSearch = String(searchOverride ?? searchValue ?? "").trim();
      const params = new URLSearchParams({
        page: String(qPage),
        limit: String(pageSize),
        status: tab,
      });
      if (qSearch) params.set("search", qSearch);
      const response = await apiClient.get(
        `${route}/pending-payouts?${params.toString()}`,
      );
      const payload = response?.data ?? {};
      if (payload?.success === false) {
        throw new Error(payload?.message || "Failed to load withdrawals.");
      }
      const docs =
        payload?.data?.withdrawals ?? payload?.withdrawals ?? [];
      const pagination =
        payload?.data?.pagination ?? payload?.pagination ?? null;
      if (Array.isArray(docs)) {
        setRequests(
          docs.map((doc) => mapWithdrawalToRequest(doc, limitValue)),
        );
      }
      if (pagination) {
        setTotalCount(pagination.total ?? docs.length);
        setTotalPages(pagination.totalPages ?? 1);
        if (pagination.page) setPage(pagination.page);
      } else {
        setTotalCount(docs.length);
        setTotalPages(1);
      }
      return docs;
    } catch (error) {
      const errPayload = getApiErrorPayload(error);
      const message =
        errPayload?.message || "Failed to load pending withdrawals.";
      setQueueError(message);
      if (!silent) showSnackbar(message, "error");
      return null;
    } finally {
      if (!silent) setQueueLoading(false);
    }
  }

  async function fetchWithdrawLimit({ silent = false } = {}) {
    const baseRoute = getAccountBaseRoute();
    if (!baseRoute) {
      const message = "Missing account type. Please sign in again.";
      setLimitError(message);
      if (!silent) showSnackbar(message, "error");
      return null;
    }

    setLimitLoading(true);
    setLimitError("");
    try {
      // Backend uses POST /withdraw-limit for both fetch (empty body)
      // and save (with body). Empty object = fetch operation.
      const response = await apiClient.post(`${baseRoute}/withdraw-limit`, {});
      const payload = response?.data ?? {};
      const result = payload?.result ?? payload?.data ?? null;
      const patch = normalizeApiLimit(result);

      if (patch) {
        setSettings((current) => ({ ...current, ...patch }));
      }
      setLimitConfigured(true);
      return result;
    } catch (error) {
      const status = error?.response?.status;
      const payload = getApiErrorPayload(error);
      if (status === 404) {
        // Limit not configured yet — keep defaults so merchant can save once to create it.
        setLimitConfigured(false);
        return null;
      }
      const message =
        payload?.message || "Failed to load withdrawal limit.";
      setLimitError(message);
      if (!silent) showSnackbar(message, "error");
      return null;
    } finally {
      setLimitLoading(false);
    }
  }

  useEffect(() => {
    let mounted = true;

    const timer = window.setTimeout(() => {
      if (!mounted) return;
      // Local-only sections (user limits / review queue / UI prefs).
      const stored = loadStoredState();
      if (stored) {
        setSettings(stored.settings);
        setUserLimits(stored.userLimits);
        setRequests(stored.requests);
      }
      setLoading(false);
      // Real API: POST /merchant/withdraw-limit with empty body = fetch.
      // Then load the real withdrawal queue so merchant-created
      // (create_transfer) pending requests show up for review.
      fetchWithdrawLimit({ silent: true }).then((limitResult) => {
        if (!mounted) return;
        fetchPendingQueue({
          silent: true,
          limitValue: limitResult?.withdrawalLimit,
          statusValue: statusFilters[0].value,
        });
      });
    }, 250);

    return () => {
      mounted = false;
      window.clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (loading) return;
    writeStoredState({ settings, userLimits, requests });
  }, [loading, requests, settings, userLimits]);

  const pendingRequests = useMemo(
    () => requests.filter((request) => request.status === "Pending"),
    [requests],
  );

  const filteredRequests = useMemo(() => {
    // Search is server-side (API already filtered); only enforce the tab here
    // so API data always shows in UI.
    return requests.filter((request) => {
      const matchesStatus =
        statusFilter.value === "All" || request.status === statusFilter.value;

      return matchesStatus;
    });
  }, [requests, statusFilter]);

  const largestPending = useMemo(() => {
    if (!pendingRequests.length) return null;
    return pendingRequests.reduce((largest, request) =>
      request.amount > largest.amount ? request : largest,
    );
  }, [pendingRequests]);

  const approvedToday = useMemo(
    () =>
      requests.filter(
        (request) =>
          request.status === "Approved" &&
          isSameLocalDate(request.reviewedAt || request.requestedAt),
      ).length,
    [requests],
  );

  function updateSetting(field, value) {
    setSettings((current) => ({ ...current, [field]: value }));
  }

  async function saveSettings() {
    // Backend validator requires both fields as numbers >= 0.
    const withdrawalLimit = toApiNumber(settings.amount);
    const merchantUsersDailyLimit = toApiNumber(settings.dailyAmount);

    if (withdrawalLimit === null || withdrawalLimit < 0) {
      showSnackbar("Enter a per-withdrawal limit of 0 or more.", "error");
      return;
    }

    if (merchantUsersDailyLimit === null || merchantUsersDailyLimit < 0) {
      showSnackbar("Enter a users daily limit of 0 or more.", "error");
      return;
    }

    if (toNumber(settings.autoExpireHours) <= 0) {
      showSnackbar("Enter a review expiry greater than zero.", "error");
      return;
    }

    const baseRoute = getAccountBaseRoute();
    if (!baseRoute) {
      showSnackbar("Missing account type. Please sign in again.", "error");
      return;
    }

    setSavingLimit(true);
    try {
      const response = await apiClient.post(`${baseRoute}/withdraw-limit`, {
        merchantUsersDailyLimit,
        withdrawalLimit,
      });
      const payload = response?.data ?? {};
      const result = payload?.result ?? payload?.data ?? null;
      const patch = normalizeApiLimit(result);

      setSettings((current) => ({
        ...current,
        amount: String(withdrawalLimit),
        dailyAmount: String(merchantUsersDailyLimit),
        autoExpireHours: String(toNumber(current.autoExpireHours)),
        ...(patch || {}),
        lastUpdated:
          patch?.lastUpdated || result?.updatedAt || new Date().toISOString(),
      }));
      setLimitConfigured(true);
      setLimitError("");
      showSnackbar(
        payload?.message || "Merchant withdrawal limit updated successfully.",
      );
    } catch (error) {
      const payload = getApiErrorPayload(error);
      showSnackbar(
        payload?.message || "Failed to save withdrawal limit.",
        "error",
      );
    } finally {
      setSavingLimit(false);
    }
  }

  function updateDraft(field, value) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  function addUserLimit() {
    const user = draft.user.trim();
    const amount = toNumber(draft.amount);

    if (!user) {
      showSnackbar("Enter a user email or ID.", "error");
      return;
    }

    if (amount <= 0) {
      showSnackbar("Enter a user limit greater than zero.", "error");
      return;
    }

    const nextLimit = {
      id: `limit-${user.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      user,
      amount: String(amount),
      currency: draft.currency,
      active: true,
    };

    setUserLimits((current) => {
      const exists = current.some(
        (limit) => limit.user.toLowerCase() === user.toLowerCase(),
      );

      if (!exists) return [nextLimit, ...current];

      return current.map((limit) =>
        limit.user.toLowerCase() === user.toLowerCase()
          ? { ...limit, ...nextLimit, id: limit.id }
          : limit,
      );
    });
    setDraft(defaultUserLimitDraft);
    showSnackbar("User payout limit saved.");
  }

  function toggleUserLimit(id) {
    setUserLimits((current) =>
      current.map((limit) =>
        limit.id === id ? { ...limit, active: !limit.active } : limit,
      ),
    );
  }

  function removeUserLimit(id) {
    setUserLimits((current) => current.filter((limit) => limit.id !== id));
    showSnackbar("User payout limit removed.", "info");
  }

  function openRejectModal(id) {
    const target = requests.find((request) => request.id === id);
    if (!target) return;
    setRejectTarget(target);
    setRejectReason("");
  }

  function closeRejectModal() {
    if (rejecting) return;
    setRejectTarget(null);
    setRejectReason("");
  }

  async function confirmReject() {
    if (!rejectTarget || rejecting) return;
    const reason = rejectReason.trim();
    if (!reason) {
      showSnackbar("Enter a rejection reason.", "error");
      return;
    }
    const withdrawalId = rejectTarget._id || rejectTarget.id;
    const baseRoute = getAccountBaseRoute();
    const route = baseRoute
      ? `${baseRoute}/withdrawals`
      : "/merchant/withdrawals";

    setRejecting(true);
    try {
      await apiClient.post(`${route}/${withdrawalId}/reject`, { reason });
      const rejectedId = rejectTarget.id;
      setRequests((current) =>
        current.map((request) =>
          request.id === rejectedId
            ? { ...request, status: "Rejected", reviewedAt: new Date().toISOString() }
            : request,
        ),
      );
      setRejectTarget(null);
      setRejectReason("");
      fetchPendingQueue({
        silent: true,
        statusValue: statusFilter?.value,
        pageOverride: page,
      });
      showSnackbar("Withdrawal request rejected.", "warning");
    } catch (error) {
      const payload = getApiErrorPayload(error);
      showSnackbar(payload?.message || "Failed to reject withdrawal.", "error");
    } finally {
      setRejecting(false);
    }
  }

  async function decideRequest(id, status) {
    const target = requests.find((request) => request.id === id);
    const withdrawalId = target?._id || id;
    const baseRoute = getAccountBaseRoute();
    const route = baseRoute
      ? `${baseRoute}/withdrawals`
      : "/merchant/withdrawals";
    const action = status === "Approved" ? "approve" : "reject";

    if (action === "reject") {
      openRejectModal(id);
      return;
    }

    try {
      await apiClient.post(`${route}/${withdrawalId}/approve`, {});
      setRequests((current) =>
        current.map((request) =>
          request.id === id
            ? { ...request, status, reviewedAt: new Date().toISOString() }
            : request,
        ),
      );
      // Re-sync with server so the list stays correct.
      fetchPendingQueue({
        silent: true,
        statusValue: statusFilter?.value,
        pageOverride: page,
      });
      showSnackbar("Withdrawal request approved.", "success");
    } catch (error) {
      const payload = getApiErrorPayload(error);
      showSnackbar(payload?.message || "Failed to approve withdrawal.", "error");
    }
  }

  async function refreshQueue() {
    const limitResult = await fetchWithdrawLimit();
    await fetchPendingQueue({
      limitValue: limitResult?.withdrawalLimit,
      statusValue: statusFilter?.value,
      pageOverride: page,
    });
    showSnackbar("Request queue refreshed.", "info");
  }

  function handleStatusTab(filter) {
    setStatusFilter(filter);
    setPage(1);
    fetchPendingQueue({ silent: false, statusValue: filter.value, pageOverride: 1 });
  }

  function goToPage(next) {
    const target = Math.min(Math.max(next, 1), totalPages || 1);
    setPage(target);
    fetchPendingQueue({ silent: false, pageOverride: target });
  }

  // Server-side search (debounced): typing hits the API and shows data in UI.
  useEffect(() => {
    if (loading) return;
    const timer = window.setTimeout(() => {
      setPage(1);
      fetchPendingQueue({
        silent: true,
        statusValue: statusFilter?.value,
        pageOverride: 1,
        searchOverride: searchValue,
      });
    }, 500);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchValue]);

  if (loading) {
    return <Skeleton pageName="merchant payout limit" />;
  }

  return (
    <div className="space-y-6 pb-8">
      <MerchantToolPageHeader
        title="Payout Request Limit"
        description="Set user withdrawal thresholds and review over-limit payout requests."
        icon={ShieldCheck}
      />

      {/* <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryTile
          icon={Gauge}
          label="Per withdrawal limit"
          value={
            limitLoading
              ? "Loading..."
              : formatMoney(settings.amount, settings.currency.value)
          }
          detail={`Daily ${formatMoney(settings.dailyAmount, settings.currency.value)} • ${settings.period.label}`}
        />
        <SummaryTile
          icon={Clock3}
          label="Pending requests"
          value={String(pendingRequests.length)}
          detail={`${settings.autoExpireHours} hour review window`}
          tone="amber"
        />
        <SummaryTile
          icon={WalletCards}
          label="Largest request"
          value={
            largestPending
              ? formatMoney(largestPending.amount, largestPending.currency)
              : "No pending"
          }
          detail={largestPending?.id || "Queue clear"}
          tone="blue"
        />
        <SummaryTile
          icon={CheckCircle2}
          label="Approved today"
          value={String(approvedToday)}
          detail={settings.enabled ? "Approval checks active" : "Checks paused"}
          tone="green"
        />
      </section> */}

      <section className="grid gap-5 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <div className="rounded-lg border border-input-border bg-primary-bg p-4 shadow-[0_14px_34px_rgba(8,19,12,0.06)] sm:p-5">
          {/* <SectionHeader
            icon={SlidersHorizontal}
            title="Limit Settings"
            action={
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${
                  limitLoading
                    ? "border-input-border bg-input-bg text-secondary-text"
                    : limitConfigured
                      ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-300"
                      : "border-amber-400/25 bg-amber-400/10 text-amber-300"
                }`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                {limitLoading
                  ? "Syncing..."
                  : limitConfigured
                    ? "Live from API"
                    : "Not configured"}
              </span>
            }
          /> */}

          {!limitConfigured && !limitLoading ? (
            <p className="mb-4 rounded-lg border border-amber-400/25 bg-amber-400/10 p-3 text-xs leading-5 text-amber-300">
              No withdrawal limit is configured for this merchant yet. Enter
              both values below and save once to create it via
              POST /withdraw-limit.
            </p>
          ) : null}
          {limitError ? (
            <p className="mb-4 rounded-lg border border-red-400/25 bg-red-400/10 p-3 text-xs leading-5 text-red-400">
              {limitError}{" "}
              <button
                type="button"
                onClick={() => fetchWithdrawLimit()}
                className="font-bold underline underline-offset-2"
              >
                Retry
              </button>
            </p>
          ) : null}

          {/* <div className="mb-5 flex items-start justify-between gap-4 rounded-lg border border-input-border bg-input-bg p-4">
            <div className="min-w-0">
              <p className="text-sm font-bold text-theme-text">
                Approval above limit
              </p>
              <p className="mt-1 text-xs leading-5 text-secondary-text">
                Over-limit withdrawals enter merchant review. Display-only;
                only the two limits below are sent to /withdraw-limit.
              </p>
            </div>
            <Toggle
              checked={settings.enabled}
              onChange={(value) => updateSetting("enabled", value)}
              ariaLabel="Approval above limit"
            />
          </div> */}

          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Per withdrawal limit (withdrawalLimit)"
              type="number"
              min="0"
              inputMode="decimal"
              value={settings.amount}
              onChange={(event) => updateSetting("amount", event.target.value)}
              inputClassName="rounded-full"
              leftElement={<CircleDollarSign size={16} />}
            />
            {/* <Input
              label="Users daily limit (merchantUsersDailyLimit)"
              type="number"
              min="0"
              inputMode="decimal"
              value={settings.dailyAmount}
              onChange={(event) =>
                updateSetting("dailyAmount", event.target.value)
              }
              inputClassName="rounded-full"
              leftElement={<WalletCards size={16} />}
            />
            <Dropdown
              label="Currency (display only)"
              value={settings.currency}
              options={currencyOptions}
              searchable={false}
              onChange={(value) => updateSetting("currency", value)}
            />
            <Dropdown
              label="Limit window (display only)"
              value={settings.period}
              options={periodOptions}
              searchable={false}
              onChange={(value) => updateSetting("period", value)}
            />
            <Input
              label="Review expiry hours (display only)"
              type="number"
              min="1"
              inputMode="numeric"
              value={settings.autoExpireHours}
              onChange={(event) =>
                updateSetting("autoExpireHours", event.target.value)
              }
              inputClassName="rounded-full"
              leftElement={<Clock3 size={16} />}
            /> */}
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-secondary-text">
              {limitLoading
                ? "Syncing with API..."
                : `Last updated ${formatDateTime(settings.lastUpdated)}`}
            </p>
            <div className="flex items-center gap-2">
              {/* <Button
                value={limitLoading ? "Loading..." : "Reload"}
                className="h-11 px-5"
                onClick={() => fetchWithdrawLimit()}
                disabled={limitLoading || savingLimit}
              /> */}
              <Button
                value={savingLimit ? "Saving..." : "Save limit"}
                variant="primary"
                className="h-11 border-0 px-5 text-white"
                rightIcon={<Save size={16} />}
                onClick={saveSettings}
                disabled={limitLoading || savingLimit}
              />
            </div>
          </div>
        </div>

        {/* <div className="rounded-lg border border-input-border bg-primary-bg p-4 shadow-[0_14px_34px_rgba(8,19,12,0.06)] sm:p-5">
          <SectionHeader icon={UserRound} title="User Limits" />

          <div className="grid gap-4 md:grid-cols-[minmax(0,1.2fr)_150px_120px_auto] md:items-end">
            <Input
              label="User email or ID"
              value={draft.user}
              placeholder="customer@example.com"
              onChange={(event) => updateDraft("user", event.target.value)}
              inputClassName="rounded-full"
              leftElement={<UserRound size={16} />}
            />
            <Input
              label="Limit"
              type="number"
              min="0"
              inputMode="decimal"
              value={draft.amount}
              onChange={(event) => updateDraft("amount", event.target.value)}
              inputClassName="rounded-full"
            />
            <Dropdown
              label="Currency"
              value={draft.currency}
              options={currencyOptions}
              searchable={false}
              onChange={(value) => updateDraft("currency", value)}
            />
            <Button
              value="Add"
              variant="primary"
              className="h-11 border-0 px-5 text-white"
              rightIcon={<Plus size={16} />}
              onClick={addUserLimit}
            />
          </div>

          <div className="mt-5 space-y-3">
            {userLimits.map((limit) => (
              <article
                key={limit.id}
                className="flex flex-col gap-3 rounded-lg border border-input-border bg-input-bg p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-theme-text">
                    {limit.user}
                  </p>
                  <p className="mt-1 text-xs text-secondary-text">
                    {formatMoney(limit.amount, limit.currency.value)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      limit.active
                        ? "bg-emerald-400/10 text-emerald-300"
                        : "bg-secondary-bg text-secondary-text"
                    }`}
                  >
                    {limit.active ? "Active" : "Paused"}
                  </span>
                  <Toggle
                    checked={limit.active}
                    onChange={() => toggleUserLimit(limit.id)}
                    ariaLabel={`Toggle ${limit.user}`}
                    size="sm"
                  />
                  <button
                    type="button"
                    onClick={() => removeUserLimit(limit.id)}
                    aria-label={`Remove ${limit.user}`}
                    title={`Remove ${limit.user}`}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-input-border bg-primary-bg text-secondary-text transition hover:border-red-400/45 hover:text-red-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/25"
                  >
                    <X size={14} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div> */}
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-400/10 text-amber-300">
                <AlertTriangle size={18} />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-normal text-primary-text">
                  Merchant Review
                </p>
                <h2 className="text-xl font-bold text-theme-text">
                  Withdrawal Requests
                </h2>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
            <div className="relative min-w-0 sm:w-72">
              <Search
                size={16}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-secondary-text"
              />
              <input
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder="Search requests"
                className="h-11 w-full rounded-full border border-input-border bg-input-bg pl-11 pr-10 text-sm text-theme-text outline-none transition hover:bg-secondary-bg focus:border-theme-text"
              />
              {searchValue && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchValue("");
                    setPage(1);
                    fetchPendingQueue({
                      silent: false,
                      statusValue: statusFilter?.value,
                      pageOverride: 1,
                      searchOverride: "",
                    });
                  }}
                  aria-label="Clear search"
                  title="Clear search"
                  className="absolute right-3 top-1/2 inline-flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-secondary-text transition hover:bg-secondary-bg hover:text-primary-text"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={refreshQueue}
              aria-label="Refresh request queue"
              title="Refresh request queue"
              disabled={queueLoading}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-input-border bg-input-bg px-4 text-sm font-semibold text-secondary-text transition hover:border-primary/45 hover:text-primary-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25 disabled:opacity-60 sm:w-auto"
            >
              <RefreshCw size={16} />
              {queueLoading ? "Loading..." : "Refresh"}
            </button>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {statusFilters.map((filter) => {
            const active = statusFilter.value === filter.value;

            return (
              <button
                key={filter.value}
                type="button"
                onClick={() => handleStatusTab(filter)}
                aria-pressed={active}
                className={`h-10 shrink-0 rounded-full border px-4 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25 ${
                  active
                    ? "border-primary bg-primary text-white"
                    : "border-input-border bg-input-bg text-secondary-text hover:border-primary/45 hover:text-primary-text"
                }`}
              >
                {filter.label}
              </button>
            );
          })}
        </div>

        {queueError ? (
          <p className="rounded-lg border border-red-400/25 bg-red-400/10 p-3 text-xs leading-5 text-red-400">
            {queueError}{" "}
            <button
              type="button"
              onClick={() => refreshQueue()}
              className="font-bold underline underline-offset-2"
            >
              Retry
            </button>
          </p>
        ) : null}

        {filteredRequests.length ? (
          <div className="space-y-3">
            {filteredRequests.map((request) => (
              <RequestCard
                key={request.id}
                request={request}
                onApprove={(id) => decideRequest(id, "Approved")}
                onReject={(id) => decideRequest(id, "Rejected")}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-input-border bg-primary-bg p-8 text-center">
            <XCircle className="mx-auto text-secondary-text" size={28} />
            <p className="mt-3 text-sm font-semibold text-theme-text">
              No requests found
            </p>
            <p className="mt-1 text-sm text-secondary-text">
              Change the filter or search term.
            </p>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => goToPage(page - 1)}
              disabled={page <= 1 || queueLoading}
              className="inline-flex h-10 items-center justify-center rounded-full border border-input-border bg-input-bg px-4 text-sm font-semibold text-secondary-text transition hover:border-primary/45 hover:text-primary-text disabled:opacity-50"
            >
              Prev
            </button>
            <span className="text-xs font-semibold text-secondary-text">
              Page {page} of {totalPages} • {totalCount} total
            </span>
            <button
              type="button"
              onClick={() => goToPage(page + 1)}
              disabled={page >= totalPages || queueLoading}
              className="inline-flex h-10 items-center justify-center rounded-full border border-input-border bg-input-bg px-4 text-sm font-semibold text-secondary-text transition hover:border-primary/45 hover:text-primary-text disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </section>

      {rejectTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={closeRejectModal}
        >
          <div
            className="w-full max-w-md rounded-lg border border-input-border bg-card-bg p-5 shadow-[0_14px_34px_rgba(8,19,12,0.25)]"
            onClick={(event) => event.stopPropagation()}
          >
            <h3 className="text-base font-bold text-theme-text">
              Reject withdrawal
            </h3>
            <p className="mt-1 truncate font-mono text-xs text-secondary-text">
              {rejectTarget.withdrawId || rejectTarget.id}
            </p>
            <label className="mt-4 grid gap-1 text-xs font-semibold text-secondary-text">
              Rejection reason
              <textarea
                value={rejectReason}
                onChange={(event) => setRejectReason(event.target.value)}
                placeholder="Enter reason for rejection"
                rows={3}
                autoFocus
                className="w-full rounded-lg border border-input-border bg-input-bg p-3 text-sm text-theme-text outline-none transition focus:border-theme-text"
              />
            </label>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeRejectModal}
                disabled={rejecting}
                className="inline-flex h-10 items-center justify-center rounded-full border border-input-border bg-input-bg px-4 text-sm font-semibold text-secondary-text transition hover:border-primary/45 hover:text-primary-text disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmReject}
                disabled={rejecting || !rejectReason.trim()}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-red-400/30 bg-red-400/10 px-4 text-sm font-semibold text-red-400 transition hover:border-red-400/55 hover:bg-red-400/15 disabled:opacity-60"
              >
                <X size={15} />
                {rejecting ? "Rejecting..." : "Reject"}
              </button>
            </div>
          </div>{rejectTarget && (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
    onClick={closeRejectModal}
  >
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="reject-withdrawal-title"
      className="w-full max-w-md overflow-hidden rounded-xl border border-input-border bg-card-bg shadow-2xl"
      onClick={(event) => event.stopPropagation()}
    >
      {/* Header */}
      <div className="border-b border-input-border px-5 py-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3
              id="reject-withdrawal-title"
              className="text-base font-bold text-theme-text"
            >
              Reject withdrawal
            </h3>

            <p className="mt-1 text-xs text-secondary-text">
              Please provide a reason for rejecting this withdrawal.
            </p>
          </div>

          <button
            type="button"
            onClick={closeRejectModal}
            disabled={rejecting}
            aria-label="Close"
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-secondary-text transition hover:bg-input-bg hover:text-theme-text disabled:opacity-50"
          >
            <X size={17} />
          </button>
        </div>

        {/* Withdrawal ID */}
        <div className="mt-4 rounded-lg border border-input-border bg-input-bg px-3 py-2">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-secondary-text">
            Withdrawal ID
          </p>

          <p className="truncate font-mono text-xs text-theme-text">
            {rejectTarget.withdrawId || rejectTarget.id}
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="px-5 py-4">
        <label className="grid gap-2 text-xs font-semibold text-secondary-text">
          Rejection reason
          <textarea
            value={rejectReason}
            onChange={(event) => setRejectReason(event.target.value)}
            placeholder="Enter the reason for rejecting this withdrawal..."
            rows={4}
            autoFocus
            disabled={rejecting}
            className="w-full resize-none rounded-lg border border-input-border bg-input-bg p-3 text-sm font-normal text-theme-text outline-none transition placeholder:text-secondary-text/60 focus:border-primary focus:ring-1 focus:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-60"
          />
        </label>
      </div>

      {/* Footer */}
      <div className="flex flex-col-reverse gap-2 border-t border-input-border px-5 py-4 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={closeRejectModal}
          disabled={rejecting}
          className="inline-flex h-10 items-center justify-center rounded-lg border border-input-border bg-input-bg px-4 text-sm font-semibold text-secondary-text transition hover:border-primary/45 hover:text-theme-text disabled:cursor-not-allowed disabled:opacity-60"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={confirmReject}
          disabled={rejecting || !rejectReason.trim()}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-red-400/30 bg-red-400/10 px-4 text-sm font-semibold text-red-400 transition hover:border-red-400/50 hover:bg-red-400/15 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <X size={15} />
          {rejecting ? "Rejecting..." : "Reject withdrawal"}
        </button>
      </div>
    </div>
  </div>
)}
        </div>
      )}

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