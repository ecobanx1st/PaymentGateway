"use client";

import { ExportButton, Table, Tabs } from "@/components/ReusableUi";
import { useMemo, useState } from "react";

const transactions = [
  {
    id: "txn-8f2ax91",
    transactionId: "TXN_8F2AX91",
    merchant: "Kaveri Textiles",
    customer: "Aarav Sharma",
    amount: "?1,240.00",
    method: "UPI",
    gateway: "Razorpay",
    status: "Success",
    dateTime: "Jul 15, 10:42 AM",
  },
  {
    id: "txn-2lm9q02",
    transactionId: "TXN_2LM9Q02",
    merchant: "Nilgiri Foods",
    customer: "Priya Nair",
    amount: "?8,600.00",
    method: "Card",
    gateway: "Stripe",
    status: "Refunded",
    dateTime: "Jul 15, 10:42 AM",
  },
  {
    id: "txn-97z3w88",
    transactionId: "TXN_97Z3W88",
    merchant: "Trident Apparel",
    customer: "Daniel Cho",
    amount: "?41,250.00",
    method: "Netbanking",
    gateway: "PayU",
    status: "Success",
    dateTime: "Jul 15, 10:42 AM",
  },
  {
    id: "txn-8f2ax92",
    transactionId: "TXN_8F2AX92",
    merchant: "Meera Organics",
    customer: "Meera Iyer",
    amount: "?2,999.00",
    method: "Wallet",
    gateway: "Razorpay",
    status: "Pending",
    dateTime: "Jul 15, 10:42 AM",
  },
  {
    id: "txn-3xv7c15",
    transactionId: "TXN_3XV7C15",
    merchant: "Coral Electronics",
    customer: "James Walker",
    amount: "?5,000.00",
    method: "UPI",
    gateway: "Stripe",
    status: "Success",
    dateTime: "Jul 15, 10:42 AM",
  },
  {
    id: "txn-6qp2m90",
    transactionId: "TXN_6QP2M90",
    merchant: "Zenith Travels",
    customer: "Ananya Iyer",
    amount: "?18,400.00",
    method: "Card",
    gateway: "PayU",
    status: "Failed",
    dateTime: "Jul 15, 10:42 AM",
  },
  {
    id: "txn-1td8n33",
    transactionId: "TXN_1TD8N33",
    merchant: "Sundaram Retail",
    customer: "Rohan Verma",
    amount: "?640.00",
    method: "Wallet",
    gateway: "Stripe",
    status: "Success",
    dateTime: "Jul 15, 10:42 AM",
  },
];

const columns = [
  { key: "transactionId", header: "Transaction ID", cellClassName: "min-w-40" },
  { key: "merchant", header: "Merchant", cellClassName: "min-w-40" },
  { key: "customer", header: "Customer", cellClassName: "min-w-36" },
  { key: "amount", header: "Amount", cellClassName: "min-w-32" },
  { key: "method", header: "Method", cellClassName: "min-w-28" },
  { key: "gateway", header: "Gateway", cellClassName: "min-w-32" },
  { key: "status", header: "Status", type: "status" },
  { key: "dateTime", header: "Date & time", cellClassName: "min-w-40" },
];

const tabs = [
  { label: "All", value: "all" },
  { label: "Success", value: "success" },
  { label: "Pending", value: "pending" },
  { label: "Refunded", value: "refunded" },
];

export default function TransactionsPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");

  const filteredTransactions = useMemo(() => {
    const query = search.trim().toLowerCase();

    return transactions.filter((transaction) => {
      const status = transaction.status.toLowerCase();
      const matchesTab = activeTab === "all" || status === activeTab;
      const matchesSearch =
        !query ||
        [
          transaction.transactionId,
          transaction.merchant,
          transaction.customer,
          transaction.amount,
          transaction.method,
          transaction.gateway,
          transaction.status,
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
        <h1 className="text-large font-semibold text-theme-text">
          Transactions
        </h1>
        <p className="text-small text-text-secondary">
          Real-Time Transaction Ledger Across All Gateways
        </p>
      </section>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <Tabs
          tabs={tabs}
          value={activeTab}
          onChange={setActiveTab}
          className="gap-2"
        />
        {/* <ExportButton
          rows={filteredTransactions}
          columns={columns}
          fileName={`eco-banx-transactions-${activeTab}.csv`}
          disabled={!filteredTransactions.length}
        >
          Export Transactions
        </ExportButton> */}
      </div>

      <Table
        title="All Transactions"
        description="Latest activity across all payment methods"
        columns={columns}
        data={[]}
        rowKey="id"
        searchValue={search}
        searchPlaceholder="Search transaction ID"
        onSearchChange={setSearch}
        viewAllLabel="View All"
        showViewAll
        pagination={{
          page: 1,
          pageSize: filteredTransactions.length || 1,
          total: filteredTransactions.length,
        }}
        className="mt-0"
        tableClassName="min-w-[1080px]"
      />
    </div>
  );
}
