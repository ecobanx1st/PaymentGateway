"use client";

import { Table, Tabs } from "@/components/ReusableUi";
import { Check, X } from "lucide-react";
import { useMemo, useState } from "react";

const refunds = [
  {
    id: "ref-8842",
    refundId: "REF-8842",
    transactionId: "TXN_5RKLP47",
    merchant: "Meera Organics",
    amount: "?2,999.00",
    status: "Approved",
    reason: "Product Not Delivered",
    requested: "Jul 13, 2026",
  },
  {
    id: "ref-8841",
    refundId: "REF-8841",
    transactionId: "TXN_9AB2X10",
    merchant: "Zenith Travels",
    amount: "?18,400.00",
    status: "Approved",
    reason: "Trip Cancelled",
    requested: "Jul 12, 2026",
  },
  {
    id: "ref-8840",
    refundId: "REF-8840",
    transactionId: "TXN_1TD8N33",
    merchant: "Sundaram Retail",
    amount: "?640.00",
    status: "Requested",
    reason: "Duplicate Charge",
    requested: "Jul 11, 2026",
  },
  {
    id: "ref-8839",
    refundId: "REF-8839",
    transactionId: "TXN_4WB5K21",
    merchant: "Vellai Fashions",
    amount: "?3,120.00",
    status: "Rejected",
    reason: "Customer Dispute",
    requested: "Jul 15, 2026",
  },
  {
    id: "ref-8838",
    refundId: "REF-8838",
    transactionId: "TXN_2LM9Q02",
    merchant: "Nilgiri Foods",
    amount: "?450.00",
    status: "Approved",
    reason: "Wrong Item",
    requested: "Jul 9, 2026",
  },
  {
    id: "ref-8837",
    refundId: "REF-8837",
    transactionId: "TXN_7CQIR56",
    merchant: "Coral Electronics",
    amount: "?12,990.00",
    status: "Approved",
    reason: "Defective Product",
    requested: "Jul 8, 2026",
  },
  {
    id: "ref-8836",
    refundId: "REF-8836",
    transactionId: "TXN_6QP2M90",
    merchant: "Kaveri Textiles",
    amount: "?1,240.00",
    status: "Requested",
    reason: "Size Exchange Failed",
    requested: "Jul 7, 2026",
  },
];

const columns = [
  { key: "refundId", header: "Refund ID", cellClassName: "min-w-32" },
  { key: "transactionId", header: "Transaction ID", cellClassName: "min-w-40" },
  { key: "merchant", header: "Merchant", cellClassName: "min-w-40" },
  { key: "amount", header: "Amount", cellClassName: "min-w-32" },
  { key: "status", header: "Status", type: "status" },
  { key: "reason", header: "Reason", cellClassName: "min-w-48" },
  { key: "requested", header: "Requested", cellClassName: "min-w-36" },
  { key: "actions", header: "Actions", type: "actions" },
];

const tabs = [
  { label: "All", value: "all" },
  { label: "Requested", value: "requested" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
];

const actions = [
  {
    key: "approve",
    label: "Approve refund",
    iconNode: <Check className="h-3 w-3" />,
  },
  {
    key: "reject",
    label: "Reject refund",
    iconNode: <X className="h-3 w-3" />,
  },
];

export default function RefundManagementPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");

  const filteredRefunds = useMemo(() => {
    const query = search.trim().toLowerCase();

    return refunds.filter((refund) => {
      const matchesTab = activeTab === "all" || refund.status.toLowerCase() === activeTab;
      const matchesSearch =
        !query ||
        [
          refund.refundId,
          refund.transactionId,
          refund.merchant,
          refund.amount,
          refund.status,
          refund.reason,
          refund.requested,
        ]
          .join(" ")
          .toLowerCase()
          .includes(query);

      return matchesTab && matchesSearch;
    });
  }, [activeTab, search]);

  return (
    <div className="space-y-8">
      <section className="space-y-2">
        <h1 className="text-large font-semibold text-theme-text">Refund Management</h1>
        <p className="text-small text-text-secondary">86 Refund Requests Awaiting Review</p>
      </section>

      <Tabs tabs={tabs} value={activeTab} onChange={setActiveTab} className="gap-2" />

      <Table
        title="Refund Management"
        columns={columns}
        data={filteredRefunds}
        rowKey="id"
        searchValue={search}
        searchPlaceholder="Search refund ID"
        onSearchChange={setSearch}
        viewAllLabel="View All"
        actions={actions}
        pagination={{
          page: 1,
          pageSize: filteredRefunds.length || 1,
          total: filteredRefunds.length,
        }}
        className="mt-0"
        tableClassName="min-w-[1060px]"
      />
    </div>
  );
}
