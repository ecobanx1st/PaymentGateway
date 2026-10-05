"use client";

import { Button, ExportButton, Table, Tabs } from "@/components/ReusableUi";
import { Check, History, Pause, RefreshCw, WalletCards, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

const settlements = [
  {
    id: "set-2291",
    settlementId: "SET-2291",
    merchant: "Kaveri Textiles",
    amount: "?86,400.00",
    bankAccount: "HDFC â€¢â€¢â€¢4471",
    status: "Completed",
    date: "Jul 15, 2026",
  },
  {
    id: "set-2290",
    settlementId: "SET-2290",
    merchant: "Nilgiri Foods",
    amount: "?42,100.00",
    bankAccount: "ICICI â€¢â€¢â€¢2291",
    status: "Completed",
    date: "Jul 15, 2026",
  },
  {
    id: "set-2289",
    settlementId: "SET-2289",
    merchant: "Kaveri Textiles",
    amount: "?128,900.00",
    bankAccount: "SBI â€¢â€¢â€¢7734",
    status: "Pending",
    date: "Jul 14, 2026",
  },
  {
    id: "set-2288",
    settlementId: "SET-2288",
    merchant: "Sundaram Retail",
    amount: "?9,600.00",
    bankAccount: "Axis â€¢â€¢â€¢1182",
    status: "Failed",
    date: "Jul 15, 2026",
  },
  {
    id: "set-2287",
    settlementId: "SET-2287",
    merchant: "Coral Electronics",
    amount: "?64,250.00",
    bankAccount: "HDFC â€¢â€¢â€¢9021",
    status: "Completed",
    date: "Jul 13, 2026",
  },
  {
    id: "set-2286",
    settlementId: "SET-2286",
    merchant: "Coral Electronics",
    amount: "?31,780.00",
    bankAccount: "ICICI â€¢â€¢â€¢5540",
    status: "Consolidated",
    date: "Jul 13, 2026",
  },
];

const columns = [
  { key: "settlementId", header: "Settlement ID", cellClassName: "min-w-36" },
  { key: "merchant", header: "Merchant", cellClassName: "min-w-40" },
  { key: "amount", header: "Amount", cellClassName: "min-w-36" },
  { key: "bankAccount", header: "Bank account", cellClassName: "min-w-44" },
  { key: "status", header: "Status", type: "status" },
  { key: "date", header: "Date", cellClassName: "min-w-36" },
  { key: "actions", header: "Actions", type: "actions" },
];


const tabs = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Consolidated", value: "consolidated" },
  { label: "Failed", value: "failed" },
];

const actions = [
  { key: "approve", label: "Approve settlement", iconNode: <Check className="h-3 w-3" /> },
  { key: "pause", label: "Hold settlement", iconNode: <Pause className="h-3 w-3" /> },
  { key: "history", label: "View history", iconNode: <History className="h-3 w-3" /> },
];

const statCards = [
  { label: "Pending", value: "$142,300", icon: RefreshCw },
  { label: "Completed (24h)", value: "$1,842,110", icon: WalletCards },
  { label: "Auto-retry need review", value: "$6,420", icon: X },
];

function StatCard({ stat }) {
  const Icon = stat.icon;

  return (
    <article className="rounded-rounded border border-input-border/40 [background:var(--card-bg)] p-5">
      <span className="mb-8 grid h-9 w-9 place-items-center rounded-[8px] border border-input-border [background:var(--card-bg)] text-text-primary">
        <Icon className="h-4 w-4" />
      </span>
      <p className="text-2xl font-black text-theme-text">{stat.value}</p>
      <p className="mt-1 text-small text-text-secondary">{stat.label}</p>
    </article>
  );
}

export default function SettlementsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");

  const filteredSettlements = useMemo(() => {
    const query = search.trim().toLowerCase();

    return settlements.filter((settlement) => {
      const status = settlement.status.toLowerCase();
      const matchesTab = activeTab === "all" || status === activeTab;
      const matchesSearch =
        !query ||
        [
          settlement.settlementId,
          settlement.merchant,
          settlement.amount,
          settlement.bankAccount,
          settlement.status,
          settlement.date,
        ]
          .join(" ")
          .toLowerCase()
          .includes(query);

      return matchesTab && matchesSearch;
    });
  }, [activeTab, search]);

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <h1 className="text-large font-semibold text-theme-text">Settlements</h1>
          <p className="text-small text-text-secondary">Bank Settlement Batches And Payout Status</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          {/* <ExportButton
            rows={filteredSettlements}
            columns={columns}
            fileName={`eco-banx-settlements-${activeTab}.csv`}
            disabled={!filteredSettlements.length}
          >
            Export Transactions
          </ExportButton> */}
          <Button
            variant="primary"
            className="w-full sm:w-auto"
            onClick={() => router.push("/settlements/run-batch")}
          >
            Run Settlement Batch
          </Button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {statCards.map((stat) => (
          <StatCard key={stat.label} stat={stat} />
        ))}
      </section>

      <Tabs tabs={tabs} value={activeTab} onChange={setActiveTab} className="gap-2" />

      <Table
        title="Settlements"
        columns={columns}
        data={filteredSettlements}
        rowKey="id"
        searchValue={search}
        searchPlaceholder="Search transaction ID"
        onSearchChange={setSearch}
        viewAllLabel="View All"
        actions={actions}
        pagination={{
          page: 1,
          pageSize: filteredSettlements.length || 1,
          total: filteredSettlements.length,
        }}
        className="mt-0"
        tableClassName="min-w-[1060px]"
      />
    </div>
  );
}
