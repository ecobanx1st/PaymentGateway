"use client";

import { Button, ExportButton, Table, Toast } from "@/components/ReusableUi";
import {
  ArrowDownRight,
  ArrowLeftRightIcon,
  ArrowUpRight,
  CalendarDays,
  CircleDollarSign,
  Clock3,
  CreditCardIcon,
  RefreshCcw,
  RotateCcw,
  ShieldCheck,
  Verified,
  WalletCards,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { postWithTokenApi } from "@/lib/apiHelper";
import { getAuthToken } from "@/lib/axiosInterceptor";
import { formatApiDate } from "@/lib/dateFormat";


import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const DASHBOARD_ENDPOINT = "/admin-dashboard";

function getApiErrorMessage(error, fallbackMessage = "Unable to load dashboard.") {
  const data = error.response?.data;

  return data?.message || data?.msg || data?.error || data?.errors?.msg || error.message || fallbackMessage;
}

function normalizeRecentTransaction(transaction) {
  return {
    type: transaction?.type ?? "-",
    customerName: transaction?.customerName ?? "-",
    email: transaction?.email ?? "-",
    asset: transaction?.asset || "-",
    network: transaction?.network || "-",
    amount: transaction?.amount ?? "-",
    status: transaction?.status === "confirmed" ? (
      <span style={{ color: "green", fontWeight: 600 }}>Confirmed</span>
    ) : "",
    createdAt: formatApiDate(transaction?.createdAt),
  };
}

function getStats(dashboard) {
  return [
    {
      label: "Total transactions",
      value: dashboard?.totalTransactions ?? "-",
      delta: "-",
      icon: ArrowLeftRightIcon,
      to: "/transactions",
    },
    {
      label: "Total Assets",
      value: dashboard?.totalAssets ?? "-",
      icon: Verified,
      to: "",
    },
    {
      label: "Total Networks",
      value: dashboard?.totalNetworks ?? "-",
      icon: X,
      to: "",
    },
    {
      label: "Approved KYCs",
      value: dashboard?.kyc?.approved ?? "-",
      icon: Clock3,
      to: "",
    },
    {
      label: "Pending  KYCs",
      value: dashboard?.kyc?.pending ?? "-",
      icon: CircleDollarSign,
      to: "",
    },
    {
      label: "Approved KYBs",
      value: dashboard?.kyb?.approved ?? "-",
      icon: WalletCards,
      to: "/settlements",
    },
    {
      label: "Pending KYBs",
      value: dashboard?.kyb?.pending ?? "-",
      icon: CreditCardIcon,
      to: "",
    },
    {
      label: "Total Clients",
      value: dashboard?.totalUsers ?? "-",
      icon: RotateCcw,
      to: "/refunds",
    },
  ];
}

const transactionColumns = [
  { key: "type", header: "Type", cellClassName: "min-w-24" },
  { key: "customerName", header: "Customer Name", cellClassName: "min-w-36" },
  { key: "email", header: "Email", cellClassName: "min-w-44" },
  { key: "asset", header: "Asset", cellClassName: "min-w-24" },
  { key: "network", header: "Network", cellClassName: "min-w-24" },
  { key: "amount", header: "Amount", cellClassName: "min-w-28" },
  { key: "status", header: "Status", type: "status" },
  { key: "createdAt", header: "Date", cellClassName: "min-w-40" },
];

function StatCard({ stat }) {
  const Icon = stat.icon;
  const positive = stat?.delta?.startsWith("+");

  const router = useRouter();



  return (
    <article className=" rounded-rounded bg-transparent hover:bg-text-primary/50">
      <div
        className="rounded-rounded border border-input-border/40 z-10 [background:var(--card-bg)] hover:rotate-[-7deg] p-4 cursor-pointer transition-all"
        onClick={() => router.push(stat.to)}
      >
        <div className="mb-7 flex items-start justify-between gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-[8px] [background:var(--card-bg)] text-text-primary border border-input-border">
            <Icon className="h-4 w-4" />
          </span>
          {stat.delta && (
            <span className="inline-flex items-center gap-1 rounded-full bg-text-primary/10 px-2 py-1 text-[10px] font-semibold text-text-primary">
              {positive ? (
                <ArrowUpRight className="h-3 w-3" />
              ) : (
                <ArrowDownRight className="h-3 w-3" />
              )}
              {stat.delta}
            </span>
          )}
        </div>
        <p className="text-2xl font-black text-theme-text">{stat.value}</p>
        <p className="mt-1 text-small text-text-secondary">{stat.label}</p>
      </div>
    </article>
  );
}

function TransactionVolumeChart() {
  return (
    <section className="rounded-rounded border border-input-border/40 bg-card-bg p-5">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-large font-semibold text-theme-text">
            Transaction volume
          </h2>
          <p className="mt-1 text-small text-text-secondary">
            Gross volume vs successful settlements, last 14 days
          </p>
        </div>
        <div className="flex items-center gap-4 text-small text-text-secondary">
          <span className="inline-flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-text-primary" />
            Gross volume
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-sky-300" />
            Settled
          </span>
        </div>
      </div>
      <div className="relative h-56 overflow-hidden rounded-rounded bg-bg-secondary/40 p-3">
        <div className="absolute inset-x-3 top-1/4 h-px bg-input-border/40" />
        <div className="absolute inset-x-3 top-1/2 h-px bg-input-border/40" />
        <div className="absolute inset-x-3 top-3/4 h-px bg-input-border/40" />
        {/* <svg
          className="relative h-full w-full"
          viewBox="0 0 720 220"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M0 155 C35 145 50 130 82 142 C120 156 130 102 170 117 C206 132 219 92 258 102 C296 113 305 76 347 87 C386 98 394 58 437 70 C478 82 492 37 534 50 C573 62 588 24 631 38 C667 49 674 28 720 36"
            fill="none"
            stroke="rgb(46 213 115)"
            strokeWidth="3"
          />
          <path
            d="M0 178 C34 168 53 171 83 165 C118 159 132 143 170 151 C205 160 217 132 258 139 C295 147 308 116 347 125 C385 134 397 102 438 111 C478 120 492 88 535 100 C573 112 588 74 631 88 C668 101 682 82 720 90"
            fill="none"
            stroke="rgb(125 211 252)"
            strokeDasharray="5 5"
            strokeWidth="2"
          />
        </svg> */}
      </div>
    </section>
  );
}

function PaymentMethodMix() {
  const methods = [
    {
      label: "UPI",
      value: "-",
      className: "left-[35%] top-[14%] h-32 w-32 bg-text-primary/80",
    },
    {
      label: "Wallets",
      value: "-",
      className: "left-[15%] top-[42%] h-24 w-24 bg-text-primary",
    },
    {
      label: "Bank transfer",
      value: "-",
      className: "right-[18%] top-[48%] h-28 w-28 bg-text-primary/60",
    },
  ];

  return (
    <section className="rounded-rounded border border-input-border/40 bg-card-bg p-5">
      <div className="mb-4">
        <h2 className="text-large font-semibold text-theme-text">
          Payment method mix
        </h2>
        <p className="mt-1 text-small text-text-secondary">
          Share of volume this month
        </p>
      </div>
      <div className="relative h-56 overflow-hidden rounded-rounded bg-bg-secondary/40">
        {methods.map((method) => (
          <div
            key={method.label}
            className={`absolute grid place-items-center rounded-full text-center text-white shadow-2xl shadow-black/30 ${method.className}`}
          >
            <div>
              <p className="text-2xl font-semibold">{method.value}</p>
            </div>
          </div>
        ))}
        <p className="absolute left-[56%] top-[7%] text-small font-semibold text-theme-text">
          UPI
        </p>
        <p className="absolute bottom-7 left-[8%] text-small font-semibold text-theme-text">
          Wallets
        </p>
        <p className="absolute bottom-3 right-[7%] text-small font-semibold text-theme-text">
          Bank transfer
        </p>
      </div>
    </section>
  );
}

function formatDateRangeLabel(range, fallbackLabel) {
  if (fallbackLabel) {
    return fallbackLabel;
  }

  if (!range.from || !range.to) {
    return "Custom range";
  }

  const from = new Date(`${range.from}T00:00:00`);
  const to = new Date(`${range.to}T00:00:00`);
  const formatter = new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  });

  return `${formatter.format(from)} - ${formatter.format(to)}`;
}

function DateRangeFilter() {
  const presets = [
    { label: "Last 7 days", from: "2026-07-18", to: "2026-07-24" },
    { label: "Last 30 days", from: "2026-06-25", to: "2026-07-24" },
    { label: "This month", from: "2026-07-01", to: "2026-07-24" },
  ];
  const wrapperRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [appliedLabel, setAppliedLabel] = useState("Last 30 days");
  const [selectedPreset, setSelectedPreset] = useState("Last 30 days");
  const [range, setRange] = useState({ from: "2026-06-25", to: "2026-07-24" });

  useEffect(() => {
    function handlePointerDown(event) {
      if (!wrapperRef.current?.contains(event.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  function selectPreset(preset) {
    setSelectedPreset(preset.label);
    setRange({ from: preset.from, to: preset.to });
  }

  function applyRange() {
    setAppliedLabel(formatDateRangeLabel(range, selectedPreset));
    setOpen(false);
  }

  function clearRange() {
    setSelectedPreset("");
    setRange({ from: "", to: "" });
    setAppliedLabel("Custom range");
  }

  return (
    <div ref={wrapperRef} className="relative w-full sm:w-auto">
      <Button
        variant="secondary"
        beforeIcon={<CalendarDays className="h-4 w-4" />}
        className="w-full sm:w-auto"
        onClick={() => setOpen((current) => !current)}
      >
        {appliedLabel}
      </Button>

      {open && (
        <div className="absolute right-0 z-40 mt-3 w-full min-w-[280px] rounded-rounded border border-input-border/40 bg-card-bg p-4 shadow-2xl shadow-black/40 sm:w-[360px]">
          <div className="mb-4">
            <h2 className="text-mid font-semibold text-theme-text">
              Calendar filter
            </h2>
            <p className="mt-1 text-small text-text-secondary">
              Filter dashboard metrics by date range.
            </p>
          </div>

          <div className="mb-4 flex flex-wrap gap-2">
            {presets.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => selectPreset(preset)}
                className={
                  selectedPreset === preset.label
                    ? "rounded-full border border-text-primary bg-text-primary/15 px-3 py-2 text-small font-medium text-text-primary"
                    : "rounded-full border border-input-border bg-input-bg px-3 py-2 text-small font-medium text-text-secondary transition hover:border-text-secondary hover:text-theme-text"
                }
              >
                {preset.label}
              </button>
            ))}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-2 text-small font-medium text-text-secondary">
              From
              <input
                type="date"
                value={range.from}
                onChange={(event) => {
                  setSelectedPreset("");
                  setRange((current) => ({
                    ...current,
                    from: event.target.value,
                  }));
                }}
                className="w-full rounded-full border border-input-border bg-input-bg px-3 py-2 text-small text-theme-text outline-none focus:border-text-primary"
              />
            </label>
            <label className="space-y-2 text-small font-medium text-text-secondary">
              To
              <input
                type="date"
                value={range.to}
                onChange={(event) => {
                  setSelectedPreset("");
                  setRange((current) => ({
                    ...current,
                    to: event.target.value,
                  }));
                }}
                className="w-full rounded-full border border-input-border bg-input-bg px-3 py-2 text-small text-theme-text outline-none focus:border-text-primary"
              />
            </label>
          </div>

          <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="secondary"
              className="w-full sm:w-auto"
              onClick={clearRange}
            >
              Clear
            </Button>
            <Button
              variant="primary"
              className="w-full sm:w-auto"
              onClick={applyRange}
              toastContent="Calendar filter applied"
            >
              Apply filter
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
function exportDashboardSnapshot(stats) {
  const rows = [
    ["Metric", "Value", "Change"],
    ...stats.map((stat) => [stat.label, stat.value, stat.delta]),
  ];
  const csv = rows.map((row) => row.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "eco-banx-dashboard-snapshot.csv";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const stats = useMemo(() => getStats(dashboard), [dashboard]);

  const recentTransactionRows = useMemo(() => {
    const transactions = dashboard?.recentTransactions;

    return Array.isArray(transactions)
      ? transactions.map(normalizeRecentTransaction)
      : [];
  }, [dashboard]);

  const fetchDashboard = useCallback(async () => {
    const token = getAuthToken();

    if (!token) {
      setToast({
        id: Date.now(),
        content: "Session token not found",
        color: "error",
      });
      setLoading(false);
      return;
    }

    setLoading(true);

    try {

      const response = await postWithTokenApi(token, DASHBOARD_ENDPOINT);

      setDashboard(response?.success ? (response?.result ?? null) : null);
    } catch (error) {
      setToast({
        id: Date.now(),
        content: getApiErrorMessage(error),
        color: "error",
      });
      setDashboard(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      fetchDashboard();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [fetchDashboard]);

  return (
    <div className="space-y-6">
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

      <section className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <h1 className="text-large font-semibold text-theme-text">
            Dashboard
          </h1>
          <p className="text-small text-text-secondary">
            Platform-Wide Performance Across All Merchants - Last 30 Days
          </p>
        </div>
        {/* <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          <DateRangeFilter />
          <ExportButton onExport={() => exportDashboardSnapshot(stats)}>
            Export report
          </ExportButton>
        </div> */}
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} stat={stat} />
        ))}
      </section>

      <Table
        title="Recent transactions"
        description="Latest activity across all payment methods"
        columns={transactionColumns}
        data={loading ? [] : recentTransactionRows}
        loading={loading}
        rowKey="id"
        showSearch={false}
        viewAllLabel="View All"
        pagination={null}
        className="mt-0"
        tableClassName="min-w-[920px]"
      />

      {/* <section className="grid gap-4 lg:grid-cols-[2fr_1.05fr]">
        <TransactionVolumeChart />
        <PaymentMethodMix />
      </section> */}
    </div>
  );
}
