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
  { key: "reference", header: "IPN ID", cellClassName: "min-w-40" },
  { key: "merchant", header: "Merchant", cellClassName: "min-w-40" },
  { key: "event", header: "Event", cellClassName: "min-w-40" },
  { key: "endpoint", header: "Endpoint", cellClassName: "min-w-48" },
  { key: "status", header: "Status", type: "status" },
  { key: "date", header: "Date", cellClassName: "min-w-36" },
  { key: "actions", header: "Actions", type: "actions" },
];

const initialRows = Array.from({ length: 13 }, (_, index) => ({
  id: `ipn-${index + 1}`,
  reference: `IPN-${String(index + 1).padStart(5, "0")}`,
  merchant: ["Meera Organics", "Zenith Travels", "Sundaram Retail"][index % 3],
  event: ["payment.success", "withdraw.pending", "invoice.expired"][index % 3],
  endpoint: `https://merchant${(index % 3) + 1}.test/webhook`,
  status: ["Success", "Failed", "Pending"][index % 3],
  date: "Jul 28, 2026",
  attempts: `${(index % 4) + 1}`,
  responseCode: ["200", "500", "202"][index % 3],
}));

const tableActions = [viewAction];
export default function IpnHistoryPage() {
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
        <h1 className="text-large font-semibold text-theme-text">
          IPN History
        </h1>
        <p className="text-small text-text-secondary">
          Instant payment notification delivery history
        </p>
      </section>

      <div className="flex justify-start sm:justify-end">
        {/* <ExportButton
          rows={filteredRows}
          columns={columns}
          fileName="eco-banx-ipn-history.csv"
        >
          Export
        </ExportButton> */}
      </div>

      <Table
        title="IPN History"
        description="Latest webhook delivery records"
        columns={columns}
        data={[]}
        rowKey="id"
        searchValue={search}
        searchPlaceholder="Search IPN"
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
        title="IPN History Details"
        description={viewRow?.reference || viewRow?.id}
        data={viewRow}
        fields={getDetailFields(viewRow)}
        onClose={() => setViewRow(null)}
      />
    </div>
  );
}
