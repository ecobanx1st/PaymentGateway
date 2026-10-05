"use client";
import { useEffect, useMemo, useState } from "react";
import { Eye, FilterX } from "lucide-react";
import Table from "@/components/ui/Table";
import TableSearch from "@/components/ui/Table/TableSearch";
import TableFilter from "@/components/ui/Table/TableFilter";
import TablePagination from "@/components/ui/Table/TablePagination";
import PageTopBanner from "@/components/ui/PageTopBanner";
import Snackbar from "@/components/ui/Snackbar";
import DateFilter from "@/components/ui/DateFilter";
import Skeleton from "@/components/ui/skeleton";
import Modal from "@/components/ui/Modal";
import apiClient, { getApiErrorPayload } from "@/lib/axiosInterceptor";

const PAGE_SIZE = 10;

const chipMaps = {
  status: {
    Delivered: {
      dot: "bg-primary-text",
      text: "text-primary-text",
      bg: "bg-primary-text/10",
    },
    Failed: { dot: "bg-red-400", text: "text-red-400", bg: "bg-red-400/10" },
    Retrying: {
      dot: "bg-amber-400",
      text: "text-amber-400",
      bg: "bg-amber-400/15",
    },
  },
};

function getResponseMessage(payload) {
  if (typeof payload === "string" && payload.trim()) return payload;
  if (typeof payload?.message === "string" && payload.message.trim()) {
    return payload.message;
  }
  if (typeof payload?.error === "string" && payload.error.trim()) {
    return payload.error;
  }
  if (typeof payload?.errors?.message === "string") {
    return payload.errors.message;
  }
  if (Array.isArray(payload?.errors)) {
    const firstMessage = payload.errors.find(
      (item) => typeof item === "string" || typeof item?.message === "string",
    );

    if (typeof firstMessage === "string") return firstMessage;
    if (typeof firstMessage?.message === "string") return firstMessage.message;
  }

  return "";
}

function normalizeEventType(value) {
  if (!value) return "-";

  return String(value)
    .toLowerCase()
    .split(/(?:_|-|\s|\.)+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function truncate(text, max = 80) {
  const str = text == null ? "" : String(text);

  if (str.length <= max) return str;

  return `${str.slice(0, max)}...`;
}

function prettyJson(value) {
  if (value == null || value === "") return "-";

  if (typeof value === "string") {
    try {
      return JSON.stringify(JSON.parse(value), null, 2);
    } catch {
      return value;
    }
  }

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function formatDateTime(value) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function mapIpnRow(doc) {
  const payload = doc?.payload || {};
  const typeRaw =
    doc?.transactionId?.type ||
    payload?.type ||
    payload?.event_type ||
    payload?.eventType ||
    "PayOut";
  const success = doc?.success === true;
  const id = doc?.txnId || doc?._id || "";
  const payloadJson = doc?.payload ? JSON.stringify(doc.payload) : "";

  return {
    id,
    type: normalizeEventType(typeRaw),
    endpoint: doc?.url || "-",
    payload: payloadJson,
    response: doc?.responseBody || "",
    httpStatus: doc?.status ?? null,
    status: success ? "Delivered" : "Failed",
    lastAttempt: doc?.createdAt || null,
    error: doc?.error || null,
    raw: doc,
  };
}

function IpnDetailsModal({ record, open, onClose }) {
  if (!record) return null;

  const raw = record.raw || record;
  const status = record.status || (raw?.success ? "Delivered" : "Failed");

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="IPN Delivery Details"
      description="Full request and response for the selected webhook delivery."
      className="max-w-3xl"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {/* <div className="rounded-2xl border border-input-border bg-secondary-bg p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary-text">
            Transaction ID
          </p>
          <p className="mt-3 break-all text-sm font-semibold text-text">
            {record.id || "-"}
          </p>
        </div> */}

        <div className="rounded-2xl border border-input-border bg-secondary-bg p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary-text">
            API Endpoint
          </p>
          <p className="mt-3 break-all text-sm font-mono text-text">
            {raw?.url || "-"}
          </p>
        </div>

        {/* <div className="rounded-2xl border border-input-border bg-secondary-bg p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary-text">
            Type
          </p>
          <p className="mt-3 text-sm font-medium text-text">{record.type}</p>
        </div> */}

        <div className="rounded-2xl border border-input-border bg-secondary-bg p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary-text">
            Response Status
          </p>
          <p className="mt-3 text-sm font-medium text-text">
            {raw?.status ?? "-"}
          </p>
        </div>

        {/* <div className="rounded-2xl border border-input-border bg-secondary-bg p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary-text">
            Delivery Status
          </p>
          <div className="mt-3">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium leading-none ${chipMaps.status[status]?.bg ?? ""} ${chipMaps.status[status]?.text ?? ""}`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${chipMaps.status[status]?.dot ?? ""}`}
              />
              {status}
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-input-border bg-secondary-bg p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary-text">
            Last Attempt
          </p>
          <p className="mt-3 text-sm font-medium text-text">
            {formatDateTime(record.lastAttempt)}
          </p>
        </div> */}

        <div className="sm:col-span-2 rounded-2xl border border-input-border bg-secondary-bg p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary-text">
            Payload
          </p>
          <pre className="mt-3 overflow-x-auto whitespace-pre-wrap break-all text-xs text-text">
            {prettyJson(raw?.payload)}
          </pre>
        </div>

        <div className="sm:col-span-2 rounded-2xl border border-input-border bg-secondary-bg p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary-text">
            Response
          </p>
          <pre className="mt-3 overflow-x-auto whitespace-pre-wrap break-all text-xs text-text">
            {prettyJson(raw?.responseBody)}
          </pre>
        </div>

        {raw?.error ? (
          <div className="sm:col-span-2 rounded-2xl border border-red-400/20 bg-red-400/10 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-400">
              Error
            </p>
            <p className="mt-3 break-all text-sm font-medium text-red-400">
              {raw.error}
            </p>
          </div>
        ) : null}
      </div>
    </Modal>
  );
}

export default function Page() {
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);

  const [records, setRecords] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [searchValue, setSearchValue] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);
  const [dateFilter, setDateFilter] = useState({ from: "", to: "", preset: "" });
  const [page, setPage] = useState(1);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    tone: "success",
  });

  const visibleTypes = useMemo(
    () => [
      { label: "All Types", value: null },
      { label: "Payin", value: "payin" },
      { label: "Payout", value: "payout" },
    ],
    [],
  );

  const visibleStatuses = useMemo(
    () => [
      { label: "All Status", value: null },
      { label: "Delivered", value: "Delivered" },
      { label: "Failed", value: "Failed" },
    ],
    [],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchValue.trim());
      setPage(1);
    }, 500);

    return () => window.clearTimeout(timer);
  }, [searchValue]);

  useEffect(() => {
    const selectedStatus = statusFilter?.value ?? statusFilter;
    const selectedType = typeFilter?.value ?? typeFilter;
    let successParam;

    if (selectedStatus === "Delivered") successParam = true;
    else if (selectedStatus === "Failed") successParam = false;

    const body = { page: String(page), limit: String(PAGE_SIZE) };

    if (debouncedSearch) body.search = debouncedSearch;
    if (selectedType) body.type = selectedType;
    if (successParam !== undefined) body.success = successParam;
    if (dateFilter.from) body.from = `${dateFilter.from}T00:00:00`;
    if (dateFilter.to) body.to = `${dateFilter.to}T23:59:59`;

    let cancelled = false;

    const fetchData = async () => {
      setDataLoading(true);

      try {
        const response = await apiClient.post("/merchant/ipn_history", body);

        if (process.env.NODE_ENV !== "production") {
          console.log("IPN history response:", response.data);
        }

        if (cancelled) return;

        if (response.data?.success === false) {
          setRecords([]);
          setPagination({
            page: 1,
            limit: PAGE_SIZE,
            total: 0,
            totalPages: 1,
            hasNextPage: false,
            hasPrevPage: false,
          });
          setSnackbar({
            open: true,
            message:
              getResponseMessage(response.data) || "Failed to load IPN history.",
            tone: "error",
          });
          return;
        }

        const data = response.data?.data || {};
        const mapped = (data.records || []).map(mapIpnRow);

        setRecords(mapped);
        setPagination(
          data.pagination || {
            page: Number(page) || 1,
            limit: PAGE_SIZE,
            total: mapped.length,
            totalPages: 1,
            hasNextPage: false,
            hasPrevPage: false,
          },
        );
      } catch (error) {
        if (cancelled) return;

        const payload = getApiErrorPayload(error);

        setRecords([]);
        setPagination({
          page: 1,
          limit: PAGE_SIZE,
          total: 0,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        });
        setSnackbar({
          open: true,
          message:
            getResponseMessage(payload) || "Failed to load IPN history.",
          tone: "error",
        });
      } finally {
        if (!cancelled) {
          setDataLoading(false);
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [
    page,
    debouncedSearch,
    typeFilter,
    statusFilter,
    dateFilter.from,
    dateFilter.to,
  ]);

  const filtersActive = Boolean(
    searchValue ||
      typeFilter ||
      statusFilter ||
      dateFilter.from ||
      dateFilter.to,
  );

  const resetFilters = () => {
    setSearchValue("");
    setDebouncedSearch("");
    setTypeFilter(null);
    setStatusFilter(null);
    setDateFilter({ from: "", to: "", preset: "" });
    setPage(1);
  };

  const columns = [
    {
      key: "id",
      title: "Transaction ID",
      render: (value) => (
        <span className="font-mono text-xs font-medium text-text">
          {value || "-"}
        </span>
      ),
    },
    {
      key: "type",
      title: "Type",
      render: (value) => <span className="text-secondary-text">{value}</span>,
    },
    {
      key: "endpoint",
      title: "API Endpoint",
      render: (value) => (
        <span className="font-mono text-xs text-secondary-text break-all">
          {value}
        </span>
      ),
    },
    {
      key: "payload",
      title: "Payload",
      render: (value) => (
        <span className="font-mono text-xs text-secondary-text">
          {truncate(value)}
        </span>
      ),
    },
    // {
    //   key: "response",
    //   title: "Response",
    //   render: (value) => (
    //     <span className="font-mono text-xs text-secondary-text">
    //       {truncate(value)}
    //     </span>
    //   ),
    // },
    // {
    //   key: "httpStatus",
    //   title: "HTTP Status",
    //   align: "center",
    //   render: (value) => (
    //     <span className="font-medium text-text">{value ?? "-"}</span>
    //   ),
    // },
    {
      key: "status",
      title: "Status",
      type: "status",
    },
    {
      key: "lastAttempt",
      title: "Last Attempt",
      type: "date",
    },
  ];

  const rowActions = [
    {
      key: "view",
      label: "View",
      tone: "ghost",
      icon: <Eye size={16} />,
      ariaLabel: "View IPN delivery details",
      onClick: (row) => setSelectedRecord(row.raw || row),
    },
  ];

  if (loading) {
    return <Skeleton pageName="history" />;
  }
  return (
    <div className="space-y-6 pb-6">
      <PageTopBanner
        title="IPN History"
        description="Webhook Delivery Logs, Retries and Payload Inspection"
      />

      <section
        className="rounded-[18px] border border-input-border p-4 shadow-[0_18px_42px_rgba(8,19,12,0.08)] sm:p-5 bg-primary-bg"
      >
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="w-full lg:flex-1 lg:max-w-md">
            <TableSearch
              value={searchValue}
              onChange={setSearchValue}
              placeholder="Search by transaction ID (e.g. txn_123) or endpoint..."
              className="max-w-none"
            />
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
            {/* <div className="w-full sm:w-[146px]">
              <TableFilter
                placeholder="All Types"
                options={visibleTypes}
                value={typeFilter}
                onChange={(nextValue) => {
                  setTypeFilter(nextValue);
                  setPage(1);
                }}
                searchable={false}
                className="w-full"
              />
            </div>

            <div className="w-full sm:w-[146px]">
              <TableFilter
                placeholder="All Status"
                options={visibleStatuses}
                value={statusFilter}
                onChange={(nextValue) => {
                  setStatusFilter(nextValue);
                  setPage(1);
                }}
                searchable={false}
                className="w-full"
              />
            </div> */}

            <DateFilter
              value={dateFilter}
              onChange={(nextValue) => {
                setDateFilter(nextValue);
                setPage(1);
              }}
              placeholder="Filter by Date"
              className="w-full sm:w-[160px]"
            />

            {filtersActive ? (
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-input-border bg-input-bg px-4 text-sm font-semibold text-secondary-text transition hover:border-primary hover:text-primary"
              >
                <FilterX size={15} />
                Reset
              </button>
            ) : null}
          </div>
        </div>

        <div className="mt-5">
          <Table
            title=""
            subtitle=""
            search={false}
            filters={[]}
            showFilter={false}
            showViewAll={false}
            showExportButton={false}
            data={records}
            columns={columns}
            rowActions={rowActions}
            loading={dataLoading}
            bordered={false}
            minWidth={1280}
            pagination={null}
            className="!rounded-none !border-0 !bg-transparent !p-0 !shadow-none"
            bgClassName="!bg-transparent"
            chipMaps={chipMaps}
            emptyTitle="No IPN history found"
            emptyMessage="No matching webhook delivery records were found."
          />
        </div>

        {pagination.total > 0 ? (
          <TablePagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            pageSize={pagination.limit || PAGE_SIZE}
            totalItems={pagination.total}
            onPageChange={setPage}
          />
        ) : null}
      </section>

      <IpnDetailsModal
        record={selectedRecord}
        open={Boolean(selectedRecord)}
        onClose={() => setSelectedRecord(null)}
      />

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
