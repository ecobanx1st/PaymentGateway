"use client";

import { ExportButton, Modal, Table } from "@/components/ReusableUi";
import { Eye } from "lucide-react";
import { useMemo, useState } from "react";

function getDetailFields(row) {
  return Object.keys(row ?? {})
    .filter((key) => !["id", "actions"].includes(key))
    .map((key) => ({ key }));
}

const viewAction = {
  key: "view",
  label: "View details",
  iconNode: <Eye className="h-3 w-3" />,
};
const columns = [
  { key: "reference", header: "Invoice ID", cellClassName: "min-w-40" },
  { key: "merchant", header: "Merchant", cellClassName: "min-w-40" },
  { key: "customer", header: "Customer", cellClassName: "min-w-36" },
  { key: "amount", header: "Amount", cellClassName: "min-w-28" },
  { key: "dueDate", header: "Due Date", cellClassName: "min-w-36" },
  { key: "status", header: "Status", type: "status" },
  { key: "actions", header: "Actions", type: "actions" },
];

const initialRows = Array.from({ length: 12 }, (_, index) => ({
  id: `invoice-${index + 1}`,
  reference: `INV-${String(index + 1).padStart(5, "0")}`,
  merchant: ["Kaveri Textiles", "Nilgiri Foods", "Coral Electronics"][
    index % 3
  ],
  customer: ["Aarav Sharma", "Priya Nair", "Daniel Cho"][index % 3],
  amount: `INR ${(3200 + index * 430).toLocaleString("en-IN")}`,
  dueDate: "Aug 02, 2026",
  status: ["Pending", "Success", "Failed"][index % 3],
  issuedDate: "Jul 28, 2026",
  paymentLink: `https://pay.eco-banx.test/inv/${index + 1}`,
}));

const tableActions = [viewAction];
export default function InvoicePage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [tableRows, setTableRows] = useState(initialRows);
  const [viewRow, setViewRow] = useState(null);
  const [toast, setToast] = useState(null);
  const pageSize = 10;

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return tableRows;
    }

    return tableRows.filter((row) =>
      Object.values(row).join(" ").toLowerCase().includes(query),
    );
  }, [search, tableRows]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const paginatedRows = filteredRows.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );

  function handleAction(actionKey, row) {
    if (actionKey === "view") {
      setViewRow(row);
    }
  }
  return (
    <div className="space-y-8">
      <section className="space-y-2">
        <h1 className="text-large font-semibold text-theme-text">Invoice</h1>
        <p className="text-small text-text-secondary">
          Invoice payment history
        </p>
      </section>

      <div className="flex justify-start sm:justify-end">
        {/* <ExportButton
          rows={filteredRows}
          columns={columns}
          fileName="eco-banx-invoice-history.csv"
        >
          Export
        </ExportButton> */}
      </div>

      <Table
        title="Invoice History"
        description="Latest generated invoices"
        columns={columns}
        data={[]}
        rowKey="id"
        searchValue={search}
        searchPlaceholder="Search invoice"
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        showViewAll={false}
        actions={tableActions}
        onAction={handleAction}
        pagination={{
          page,
          pageSize,
          total: filteredRows.length,
          totalPages,
          onPageChange: setPage,
        }}
        className="mt-0"
        tableClassName="min-w-[980px]"
      />

      <Modal
        open={Boolean(viewRow)}
        mode="view"
        title="Invoice Details"
        description={viewRow?.reference || viewRow?.id}
        data={viewRow}
        fields={getDetailFields(viewRow)}
        onClose={() => setViewRow(null)}
      />
    </div>
  );
}
