"use client";

import { Modal, Table, Tabs } from "@/components/ReusableUi";
import { Ban, Check, Eye } from "lucide-react";
import { useMemo, useState } from "react";

const fraudAlerts = [
  {
    id: "fraud-001",
    transaction: "TXN_9KX2L01",
    merchant: "Zenith Travels",
    riskScore: 86,
    reason: "Same Device Fingerprint",
    status: "Needs Review",
  },
  {
    id: "fraud-002",
    transaction: "TXN_3MB8Q77",
    merchant: "Vellai Fashions",
    riskScore: 92,
    reason: "14 Attempts In 2 Min",
    status: "Blocked",
  },
  {
    id: "fraud-003",
    transaction: "TXN_7FDIW40",
    merchant: "Coral Electronics",
    riskScore: 64,
    reason: "Mismatched Billing Geolocation",
    status: "Needs Review",
  },
  {
    id: "fraud-004",
    transaction: "TXN_1RT9N23",
    merchant: "Sundaram Retail",
    riskScore: 86,
    reason: "New Device, First Transaction",
    status: "Approved",
  },
  {
    id: "fraud-005",
    transaction: "TXN_5LP4K88",
    merchant: "Meera Organics",
    riskScore: 77,
    reason: "Card Testing Pattern Detected",
    status: "Blocked",
  },
  {
    id: "fraud-006",
    transaction: "TXN_2QW6X15",
    merchant: "Trident Apparel",
    riskScore: 55,
    reason: "Unusual Transaction Amount",
    status: "Needs Review",
  },
];

function RiskScore({ value }) {
  const filledDots = Math.round(value / 10);

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        {Array.from({ length: 10 }).map((_, index) => (
          <span
            key={index}
            className={
              index < filledDots
                ? "h-2.5 w-2.5 rounded-full bg-text-primary"
                : "h-2.5 w-2.5 rounded-full bg-text-primary/20"
            }
          />
        ))}
      </div>
      <span className="text-mid text-theme-text">{value}</span>
    </div>
  );
}

const columns = [
  { key: "transaction", header: "Transaction", cellClassName: "min-w-40" },
  { key: "merchant", header: "Merchant", cellClassName: "min-w-44" },
  {
    key: "riskScore",
    header: "Risk score",
    cellClassName: "min-w-48",
    render: (value) => <RiskScore value={value} />,
  },
  { key: "reason", header: "Reason", cellClassName: "min-w-64" },
  { key: "status", header: "Status", type: "status" },
  { key: "actions", header: "Actions", type: "actions" },
];

const tabs = [
  { label: "All", value: "all" },
  { label: "Needs review", value: "needs review" },
  { label: "Blocked", value: "blocked" },
  { label: "Approved", value: "approved" },
];

const actions = [
  {
    key: "approve",
    label: "Approve transaction",
    iconNode: <Check className="h-3 w-3" />,
  },
  {
    key: "block",
    label: "Block transaction",
    iconNode: <Ban className="h-3 w-3" />,
  },
  {
    key: "view",
    label: "View risk details",
    iconNode: <Eye className="h-3 w-3" />,
  },
];

export default function FraudDetectionPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [modalState, setModalState] = useState({
    open: false,
    row: null,
  });

  const filteredAlerts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return fraudAlerts.filter((alert) => {
      const status = alert.status.toLowerCase();
      const matchesTab = activeTab === "all" || status === activeTab;
      const matchesSearch =
        !query ||
        [alert.transaction, alert.merchant, alert.riskScore, alert.reason, alert.status]
          .join(" ")
          .toLowerCase()
          .includes(query);

      return matchesTab && matchesSearch;
    });
  }, [activeTab, search]);

  function closeModal() {
    setModalState((current) => ({ ...current, open: false }));
  }

  function handleTableAction(actionKey, row) {
    if (actionKey !== "view") {
      return;
    }

    setModalState({
      open: true,
      row,
    });
  }

  return (
    <div className="space-y-8">
      <section className="space-y-2">
        <h1 className="text-large font-semibold text-theme-text">Fraud Detection</h1>
        <p className="text-small text-text-secondary">
          Automated Risk Scoring Across The Transaction Network
        </p>
      </section>

      <Tabs tabs={tabs} value={activeTab} onChange={setActiveTab} className="gap-2" />

      <Table
        title="Fraud Detection"
        columns={columns}
        data={filteredAlerts}
        rowKey="id"
        searchValue={search}
        searchPlaceholder="Search merchant"
        onSearchChange={setSearch}
        viewAllLabel="View All"
        actions={actions}
        onAction={handleTableAction}
        pagination={{
          page: 1,
          pageSize: filteredAlerts.length || 1,
          total: filteredAlerts.length,
        }}
        className="mt-0"
        tableClassName="min-w-[980px]"
      />

      <Modal
        open={modalState.open}
        mode="view"
        title="View risk details"
        description={modalState.row?.transaction}
        data={modalState.row}
        fields={columns
          .filter((column) => column.key !== "actions")
          .map((column) => ({ key: column.key, label: column.header }))}
        onClose={closeModal}
      />
    </div>
  );
}
