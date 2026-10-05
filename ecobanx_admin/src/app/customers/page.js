"use client";

import { Table } from "@/components/ReusableUi";
import { useMemo, useState } from "react";

const customers = [
  {
    id: "cust-001",
    customer: "Aarav Sharma",
    email: "Aarav.Sharma@Gmail.Com",
    phone: "+91 98450 12233",
    transactions: 142,
    totalSpend: "?86,400",
    riskScore: 12,
    status: "Active",
  },
  {
    id: "cust-002",
    customer: "Priya Nair",
    email: "Priya.Nair@Gmail.Com",
    phone: "+91 90210 44521",
    transactions: 88,
    totalSpend: "?42,100",
    riskScore: 8,
    status: "Active",
  },
  {
    id: "cust-003",
    customer: "Daniel Cho",
    email: "Daniel.Cho@Gmail.Com",
    phone: "+91 99887 10293",
    transactions: 54,
    totalSpend: "?128,900",
    riskScore: 34,
    status: "Active",
  },
  {
    id: "cust-004",
    customer: "Meera Iyer",
    email: "Meera.Iyer@Gmail.Com",
    phone: "+91 98123 55201",
    transactions: 12,
    totalSpend: "?9,600",
    riskScore: 72,
    status: "Flagged",
  },
  {
    id: "cust-005",
    customer: "Sara Ali",
    email: "Sara.Ali@Gmail.Com",
    phone: "+91 96541 22110",
    transactions: 7,
    totalSpend: "?3,120",
    riskScore: 85,
    status: "Blocked",
  },
];

function RiskScore({ value }) {
  const filledDots = Math.max(1, Math.round(value / 10));
  const isHighRisk = value >= 70;
  const dotColor = isHighRisk ? "bg-red-400" : "bg-text-primary";
  const emptyColor = isHighRisk ? "bg-red-400/20" : "bg-text-primary/20";

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        {Array.from({ length: 10 }).map((_, index) => (
          <span
            key={index}
            className={`h-2.5 w-2.5 rounded-full ${index < filledDots ? dotColor : emptyColor}`}
          />
        ))}
      </div>
      <span className="text-mid text-theme-text">{value}</span>
    </div>
  );
}

const columns = [
  { key: "customer", header: "Customer", cellClassName: "min-w-40" },
  { key: "email", header: "Email", cellClassName: "min-w-56" },
  { key: "phone", header: "Phone", cellClassName: "min-w-40" },
  { key: "transactions", header: "Transactions", cellClassName: "min-w-32" },
  { key: "totalSpend", header: "Total spend", cellClassName: "min-w-36" },
  {
    key: "riskScore",
    header: "Risk score",
    cellClassName: "min-w-48",
    render: (value) => <RiskScore value={value} />,
  },
  { key: "status", header: "Status", type: "status" },
];

export default function CustomersPage() {
  const [search, setSearch] = useState("");

  const filteredCustomers = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return customers;
    }

    return customers.filter((customer) =>
      [
        customer.customer,
        customer.email,
        customer.phone,
        customer.transactions,
        customer.totalSpend,
        customer.riskScore,
        customer.status,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [search]);

  return (
    <div className="space-y-8">
      <section className="space-y-2">
        <h1 className="text-large font-semibold text-theme-text">Customers</h1>
        <p className="text-small text-text-secondary">
          End-Customers Transacting Across Merchant Storefronts
        </p>
      </section>

      <Table
        title="Customers List"
        columns={columns}
        data={filteredCustomers}
        rowKey="id"
        searchValue={search}
        searchPlaceholder="Search customers"
        onSearchChange={setSearch}
        viewAllLabel="View All"
        pagination={{
          page: 1,
          pageSize: filteredCustomers.length || 1,
          total: filteredCustomers.length,
        }}
        className="mt-0"
        tableClassName="min-w-[1080px]"
      />
    </div>
  );
}
