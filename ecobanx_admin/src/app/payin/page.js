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
  { key: "reference", header: "Reference", cellClassName: "min-w-40" },
  { key: "merchant", header: "Merchant", cellClassName: "min-w-40" },
  { key: "customer", header: "Customer", cellClassName: "min-w-36" },
  { key: "amount", header: "Amount", cellClassName: "min-w-28" },
  { key: "method", header: "Method", cellClassName: "min-w-28" },
  { key: "status", header: "Status", type: "status" },
  { key: "date", header: "Date", cellClassName: "min-w-36" },
  { key: "actions", header: "Actions", type: "actions" },
];

const initialRows = Array.from({ length: 18 }, (_, index) => ({
  id: `payin-${index + 1}`,
  reference: `PIN-${String(index + 1).padStart(5, "0")}`,
  merchant: ["Kaveri Textiles", "Nilgiri Foods", "Coral Electronics"][
    index % 3
  ],
  customer: ["Aarav Sharma", "Priya Nair", "Daniel Cho"][index % 3],
  amount: `INR ${(2400 + index * 375).toLocaleString("en-IN")}`,
  method: ["UPI", "Card", "Netbanking"][index % 3],
  status: ["Success", "Pending", "Failed"][index % 3],
  date: "Jul 28, 2026",
  gatewayReference: `GW-PIN-${index + 101}`,
  settlementCycle: index % 2 === 0 ? "T+1" : "T+2",
}));

const tableActions = [viewAction];
export default function PayinPage() {
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
        <h1 className="text-large font-semibold text-theme-text">Payin</h1>
        <p className="text-small text-text-secondary">
          Payin transaction history
        </p>
      </section>

      <div className="flex justify-start sm:justify-end">
        {/* <ExportButton
          rows={filteredRows}
          columns={columns}
          fileName="eco-banx-payin-history.csv"
        >
          Export
        </ExportButton> */}
      </div>

      <Table
        title="Payin History"
        description="Latest incoming payment records"
        columns={columns}
        data={[]}
        rowKey="id"
        searchValue={search}
        searchPlaceholder="Search payin"
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
        title="Payin Details"
        description={viewRow?.reference || viewRow?.id}
        data={viewRow}
        fields={getDetailFields(viewRow)}
        onClose={() => setViewRow(null)}
      />
    </div>
  );
}
