"use client";

import {
  Button,
  ConfirmationDialog,
  Modal,
  Table,
  Tabs,
  Toast,
} from "@/components/ReusableUi";
import { postWithTokenApi } from "@/lib/apiHelper";
import { getAuthToken } from "@/lib/axiosInterceptor";
import { formatApiDate } from "@/lib/dateFormat";
import { Ban, Eye, LockOpen, ShieldOff } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const MERCHANT_PAGE_SIZE = 10;
const MERCHANT_STORAGE_KEY = "merchant-management-state";
const DEFAULT_MERCHANT_FILTERS = {
  accountType: "all",
  blockStatus: "all",
  fromDate: "",
  toDate: "",
};


const accountTypeFilterOptions = [
  { label: "All", value: "all" },
  { label: "Individual", value: "individual" },
  { label: "Business", value: "business" },
];

const blockStatusFilterOptions = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Blocked", value: "blocked" },
];


function getApiErrorMessage(
  error,
  fallbackMessage = "Merchant action failed.",
) {
  const data = error?.response?.data;

  return (
    data?.message ||
    data?.msg ||
    data?.error ||
    data?.errors?.msg ||
    error?.message ||
    fallbackMessage
  );
}

function getMerchantTwoFactorEnabled(merchant) {
  const candidates = [
    merchant?.twoFactorEnabled,
    merchant?.twoFAEnabled,
    merchant?.twoFaEnabled,
    merchant?.two_factor_enabled,
    merchant?.isTwoFactorEnabled,
    merchant?.is2FAEnabled,
    merchant?.twoFactorStatus,
    merchant?.twoFAStatus,
    merchant?.twoFaStatus,
    merchant?.two_factor_status,
    merchant?.["2faStatus"],
    merchant?.["2FAStatus"],
  ];

  const value = candidates.find(
    (candidate) => candidate !== undefined && candidate !== null && candidate !== "",
  );

  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    return value !== 0;
  }

  const normalizedValue = String(value || "").trim().toLowerCase();

  if (["enabled", "enable", "active", "true", "yes", "1"].includes(normalizedValue)) {
    return true;
  }

  if (["disabled", "disable", "inactive", "false", "no", "0"].includes(normalizedValue)) {
    return false;
  }

  return false;
}
function normalizeMerchant(merchant) {
  const id = merchant?._id || merchant?.id || merchant?.merchantId || "";
  const accountverifyStatus = Boolean(merchant?.accountverifyStatus);
  const walletStatus = Boolean(merchant?.walletStatus);
  const blockstatus = Boolean(merchant?.blockstatus);
  const accountType = String(merchant?.accountType || "").trim().toLowerCase();
  const isIndividual = accountType === "individual";

  return {
    id,
    merchantId: id,
    fullName: merchant?.fullName || "-",
    email: merchant?.email || "-",
    phone: merchant?.phone || "-",
    accountType: merchant?.accountType
      ? String(merchant.accountType).charAt(0).toUpperCase() +
      String(merchant.accountType).slice(1)
      : "-",
    companyName: isIndividual ? "-" : merchant?.companyName || "-",
    companyWebsite: isIndividual ? "" : merchant?.companyWebsite || "",
    verificationStatus: accountverifyStatus ? "Verified" : "Unverified",
    walletStatusLabel: walletStatus ? "Enabled" : "Disabled",
    blockStatusLabel: blockstatus ? "Blocked" : "Active",
    accountverifyStatus,
    walletStatus,
    blockstatus,
    twoFactorEnabled: getMerchantTwoFactorEnabled(merchant),
    createdAt: formatApiDate(merchant?.createdAt),
    createdAtRaw: merchant?.createdAt,
    raw: merchant,
  };
}

function buildMerchantPayload({ page, pageSize, search, filters }) {
  const payload = {
    page,
    limit: pageSize,
    search: String(search || "").trim(),
  };

  if (filters?.verificationStatus && filters.verificationStatus !== "all") {
    payload.accountverifyStatus = filters.verificationStatus === "verified";
  }

  if (filters?.accountType && filters.accountType !== "all") {
    payload.accountType = filters.accountType;
  }

  if (filters?.blockStatus && filters.blockStatus !== "all") {
    payload.blockstatus = filters.blockStatus === "blocked";
  }

  if (filters?.walletStatus && filters.walletStatus !== "all") {
    payload.walletStatus = filters.walletStatus === "enabled";
  }

  if (filters?.fromDate) {
    payload.fromDate = filters.fromDate;
  }

  if (filters?.toDate) {
    payload.toDate = filters.toDate;
  }

  return payload;
}

function MerchantBadge({ label, tone = "default" }) {
  const toneClasses = {
    default: "bg-input-bg text-text-secondary",
    success: "bg-emerald-500/15 text-emerald-400",
    warning: "bg-amber-500/15 text-amber-300",
    danger: "bg-red-500/15 text-red-400",
    neutral: "bg-zinc-500/20 text-text-secondary",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-small font-medium ${toneClasses[tone] || toneClasses.default}`}
    >
      {label}
    </span>
  );
}

function getMerchantActions(row, loadingAction, { onView, onConfirm }) {
  const isBlocked = row.blockstatus;
  const isBlockActionLoading = Boolean(
    loadingAction &&
    loadingAction.rowId === row.id &&
    (loadingAction.actionKey === "block" ||
      loadingAction.actionKey === "unblock"),
  );
  const isDisable2faLoading = Boolean(
    loadingAction &&
    loadingAction.rowId === row.id &&
    loadingAction.actionKey === "disable2fa",
  );

  const actions = [
    {
      key: "view",
      label: "View client",
      iconNode: <Eye className="h-3 w-3" />,
      onClick: onView,
    },
    {
      key: isBlocked ? "unblock" : "block",
      label: isBlocked ? "Unblock client" : "Block client",
      iconNode: isBlocked ? (
        <LockOpen className="h-3 w-3 text-emerald-400" />
      ) : (
        <Ban className="h-3 w-3 text-red-400" />
      ),
      disabled: isBlockActionLoading,
      className: isBlocked
        ? "border-emerald-500/50 text-emerald-400 hover:border-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300"
        : "border-red-500/50 text-red-400 hover:border-red-400 hover:bg-red-500/10 hover:text-red-300",
      onClick: (merchant) =>
        onConfirm(merchant, merchant.blockstatus ? "unblock" : "block"),
    },
  ];

  if (row.twoFactorEnabled && !isBlocked) {
    actions.push({
      key: "disable2fa",
      label: "Disable 2FA",
      iconNode: <ShieldOff className="h-3 w-3 text-orange-400" />,
      disabled: isDisable2faLoading,
      className:
        "border-orange-500/50 text-orange-400 hover:border-orange-400 hover:bg-orange-500/10 hover:text-orange-300",
      onClick: (merchant) => onConfirm(merchant, "disable2fa"),
    });
  }

  return actions;
}
export default function MerchantManagementPage() {
  const [merchants, setMerchants] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [searchInputValue, setSearchInputValue] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(MERCHANT_PAGE_SIZE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState(DEFAULT_MERCHANT_FILTERS);
  const [toast, setToast] = useState(null);
  const [confirmation, setConfirmation] = useState(null);
  const [loadingAction, setLoadingAction] = useState(null);
  const [modalState, setModalState] = useState({ open: false, row: null });
  const requestIdRef = useRef(0);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      try {
        const storedState = window.localStorage.getItem(MERCHANT_STORAGE_KEY);

        if (!storedState) {
          return;
        }

        const parsedState = JSON.parse(storedState);

        if (parsedState.searchInputValue !== undefined) {
          setSearchInputValue(parsedState.searchInputValue);
        }

        if (parsedState.search !== undefined) {
          setSearch(parsedState.search);
        }

        if (parsedState.page !== undefined) {
          setPage(parsedState.page);
        }

        if (parsedState.pageSize !== undefined) {
          setPageSize(parsedState.pageSize);
        }

        const savedFilters = parsedState.filters || parsedState.appliedFilters;

        if (savedFilters) {
          setFilters({ ...DEFAULT_MERCHANT_FILTERS, ...savedFilters });
        }
      } catch {
        // Ignore persisted state issues and fall back to defaults.
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      window.localStorage.setItem(
        MERCHANT_STORAGE_KEY,
        JSON.stringify({
          searchInputValue,
          search,
          page,
          pageSize,
          filters,
        }),
      );
    } catch {
      // Ignore persistence failures.
    }
  }, [filters, page, pageSize, search, searchInputValue]);

  const showToast = useCallback((content, color = "success") => {
    setToast({ id: Date.now(), content, color });
  }, []);

  const closeModal = useCallback(() => {
    setModalState({ open: false, row: null });
  }, []);

  const fetchMerchants = useCallback(
    async (nextPage = 1) => {
      const token = getAuthToken();

      if (!token) {
        setLoading(false);
        setError("Session token not found");
        showToast("Session token not found", "error");
        return;
      }

      const requestId = ++requestIdRef.current;
      setLoading(true);
      setError("");

      try {
        const response = await postWithTokenApi(
          token,
          "/get-merchant-lists",
          buildMerchantPayload({
            page: nextPage,
            pageSize,
            search,
            filters,
          }),
        );
        if (requestIdRef.current !== requestId) {
          return;
        }

        if (response?.success === false) {
          throw new Error(response?.message || "Unable to fetch merchants.");
        }

        const rows = Array.isArray(response?.data) ? response.data : [];
        setMerchants(rows.map(normalizeMerchant));
        setPagination(response?.pagination || null);
        setPage(response?.pagination?.page || nextPage);
      } catch (error) {
        if (requestIdRef.current !== requestId) {
          return;
        }

        setMerchants([]);
        setPagination(null);
        setError(getApiErrorMessage(error, "Unable to fetch merchants."));
      } finally {
        if (requestIdRef.current === requestId) {
          setLoading(false);
        }
      }
    },
    [filters, pageSize, search, showToast],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInputValue.trim());
      setPage(1);
    }, 500);

    return () => window.clearTimeout(timer);
  }, [searchInputValue]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchMerchants(page);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [fetchMerchants, page]);

  const openViewModal = useCallback((row) => {
    setModalState({ open: true, row });
  }, []);

  const openConfirmation = useCallback((row, actionKey) => {
    setConfirmation({ row, actionKey });
  }, []);

  const handleFilterChange = useCallback((key, value) => {
    setFilters((current) => {
      if (current[key] === value) {
        return current;
      }

      return { ...current, [key]: value };
    });
    setPage(1);
  }, []);

  const handleMerchantFilterChange = useCallback(
    (key, value) => {
      if (key === "search") {
        setSearchInputValue(value);
        return;
      }

      handleFilterChange(key, value);
    },
    [handleFilterChange],
  );

  const handleAccountTypeTabChange = useCallback(
    (value) => {
      handleFilterChange("accountType", value);
    },
    [handleFilterChange],
  );

  const merchantFilterValues = useMemo(
    () => ({
      ...filters,
      search: searchInputValue,
    }),
    [filters, searchInputValue],
  );

  const merchantFilters = useMemo(
    () => [
      {
        key: "search",
        type: "search",
        label: "Search Merchants",
        placeholder:
          "Search by Full name, Email or Phone,",
        className: "sm:col-span-2 xl:col-span-2",
      },

      {
        key: "blockStatus",
        type: "dropdown",
        label: "Block Status",
        options: blockStatusFilterOptions,
        placeholder: "Select status",
      },
      {
        type: "dateRange",
        label: "Date Range",
        fromKey: "fromDate",
        toKey: "toDate",
        fromLabel: "From",
        toLabel: "To",
      },
    ],
    [],
  );

  const handleMerchantAction = useCallback(
    async (row, actionKey) => {
      const token = getAuthToken();
      const merchantId = row?.id;

      if (!token) {
        showToast("Session token not found", "error");
        return;
      }

      if (!merchantId) {
        showToast("Merchant ID not found", "error");
        return;
      }

      setLoadingAction({ rowId: merchantId, actionKey });

      try {
        const endpoint =
          actionKey === "disable2fa" ? "/disable-2fa-user" : "/block-user";

        const response = await postWithTokenApi(token, endpoint, {
          id: merchantId,
        });

        if (response?.success === false) {
          throw new Error(response?.message || "Merchant action failed.");
        }

        const successMessage =
          actionKey === "disable2fa"
            ? response?.message ||
            "Two-factor authentication has been disabled successfully."
            : response?.message ||
            (row.blockstatus
              ? "Merchant unblocked successfully."
              : "Merchant blocked successfully.");

        showToast(successMessage, "success");
        await fetchMerchants(page);
      } catch (error) {
        showToast(
          getApiErrorMessage(error, "Merchant action failed."),
          "error",
        );
      } finally {
        setLoadingAction(null);
        setConfirmation(null);
      }
    },
    [fetchMerchants, page, showToast],
  );

  const tableColumns = useMemo(() => {
    const columns = [
      {
        key: "serialNumber",
        header: "S.No",
        cellClassName: "min-w-16",
        render: (_value, row, rowIndex) => {
          const currentPage = pagination?.page ?? 1;
          const currentLimit = pagination?.limit ?? pageSize;

          return rowIndex + 1 + (currentPage - 1) * currentLimit;
        },
      },
      { key: "fullName", header: "Full Name", cellClassName: "min-w-36" },
      { key: "email", header: "Email", cellClassName: "min-w-56" },
      { key: "phone", header: "Phone", cellClassName: "min-w-32" },
      {
        key: "accountType",
        header: "Account Type",
        cellClassName: "min-w-28",
      },
    ];

    if (filters.accountType !== "individual") {
      columns.push(
        {
          key: "companyName",
          header: "Company Name",
          cellClassName: "min-w-40",
        },
        {
          key: "companyWebsite",
          header: "Company Website",
          cellClassName: "min-w-40",
          render: (_value, row) => {
            if (!row.companyWebsite) {
              return "-";
            }

            return (
              <a
                href={row.companyWebsite}
                target="_blank"
                rel="noreferrer"
                className="text-text-primary underline-offset-2 hover:underline"
              >
                {row.companyWebsite}
              </a>
            );
          },
        },
      );
    }

    columns.push(
      {
        key: "verificationStatus",
        header: "Email Verification",
        cellClassName: "min-w-36",
        render: (_value, row) => {
          const tone = row.accountverifyStatus ? "success" : "warning";
          return <MerchantBadge label={row.verificationStatus} tone={tone} />;
        },
      },
      // {
      //   key: "walletStatusLabel",
      //   header: "Wallet Status",
      //   cellClassName: "min-w-28",
      //   render: (_value, row) => {
      //     const tone = row.walletStatus ? "success" : "neutral";
      //     return <MerchantBadge label={row.walletStatusLabel} tone={tone} />;
      //   },
      // },
      {
        key: "blockStatusLabel",
        header: "Block Status",
        cellClassName: "min-w-28",
        render: (_value, row) => {
          const tone = row.blockstatus ? "danger" : "success";
          return <MerchantBadge label={row.blockStatusLabel} tone={tone} />;
        },
      },
      {
        key: "createdAt",
        header: "Created Date",
        cellClassName: "min-w-32",
        render: (_value, row) => row.createdAt,
      },
      {
        key: "actions",
        header: "Actions",
        type: "actions",
        cellClassName: "min-w-28",
      },
    );

    return columns;
  }, [filters.accountType, pageSize, pagination?.limit, pagination?.page]);

  const tableData = useMemo(
    () =>
      merchants.map((merchant) => ({
        ...merchant,
        actions: getMerchantActions(merchant, loadingAction, {
          onView: openViewModal,
          onConfirm: openConfirmation,
        }),
      })),
    [loadingAction, merchants, openConfirmation, openViewModal],
  );

  const totalPages = pagination?.totalPages || 1;
  const currentPage = pagination?.page || page;
  const currentPageSize = pagination?.limit || pageSize;
  const totalRecords = pagination?.totalDocs || merchants.length;
  const startRecord = merchants.length
    ? (currentPage - 1) * currentPageSize + 1
    : 0;
  const endRecord = merchants.length
    ? Math.min(currentPage * currentPageSize, totalRecords)
    : 0;
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

      <section className="space-y-2">
        <h1 className="text-xl font-semibold text-theme-text">
          Client Management
        </h1>
        <p className="text-small text-text-secondary">
          {pagination?.totalDocs
            ? `${pagination.totalDocs} clients available`
            : "Loading clients..."}
        </p>
      </section>

      {!loading && error && (
        <div className="rounded-rounded border border-red-500/20 bg-red-500/10 p-6 text-center">
          <p className="text-mid font-medium text-red-300">{error}</p>
          <Button className="mt-4" onClick={() => void fetchMerchants(page)}>
            Retry
          </Button>
        </div>
      )}

      {!error && (
        <>
          <Tabs
            tabs={accountTypeFilterOptions}
            value={filters.accountType}
            onChange={handleAccountTypeTabChange}
            className="justify-start"
          />
          <Table
            title={`${filters.accountType} Client List`}
            description="Latest records from the admin API"
            columns={tableColumns}
            data={tableData}
            loading={loading}
            rowKey="id"
            filters={merchantFilters}
            filterValues={merchantFilterValues}
            onFilterChange={handleMerchantFilterChange}
            showSearch={false}
            pagination={{
              page: currentPage,
              pageSize: currentPageSize,
              total: totalRecords,
              totalPages,
              from: startRecord,
              to: endRecord,
              pageSizeOptions: [10, 20, 50],
              onPageChange: setPage,
              onPageSizeChange: (size) => {
                setPageSize(size);
                setPage(1);
              },
            }}
            className="mt-0"
            tableClassName={
              filters.accountType === "individual"
                ? "min-w-[1040px]"
                : "min-w-[1320px]"
            }
          />
        </>
      )}

      <Modal
        open={modalState.open}
        mode="view"
        title="View merchant"
        description={modalState.row?.fullName || "Merchant details"}
        data={modalState.row}
        fields={[
          { key: "fullName", label: "Full Name", editable: false },
          { key: "email", label: "Email", editable: false },
          { key: "phone", label: "Phone", editable: false },
          { key: "accountType", label: "Account Type", editable: false },
          ...(String(modalState.row?.accountType || "").toLowerCase() ===
            "individual"
            ? []
            : [
              { key: "companyName", label: "Company Name", editable: false },
              {
                key: "companyWebsite",
                label: "Company Website",
                editable: false,
              },
            ]),
          {
            key: "verificationStatus",
            label: "Email Verification",
            editable: false,
          },
          // { key: "walletStatusLabel", label: "Wallet Status", editable: false },
          { key: "blockStatusLabel", label: "Block Status", editable: false },
          { key: "createdAt", label: "Created Date", editable: false },
        ]}
        onClose={closeModal}
      />

      <ConfirmationDialog
        open={Boolean(confirmation)}
        title={
          confirmation?.actionKey === "disable2fa"
            ? "Disable two-factor authentication"
            : confirmation?.actionKey === "unblock"
              ? "Confirm unblock"
              : "Confirm block"
        }
        description={
          confirmation?.actionKey === "disable2fa"
            ? `Disable two-factor authentication for ${confirmation?.row?.fullName || "this client"}?`
            : confirmation?.actionKey === "unblock"
              ? `Are you sure you want to unblock ${confirmation?.row?.fullName || "this client"}?`
              : `Are you sure you want to block ${confirmation?.row?.fullName || "this client"}?`
        }
        confirmLabel={
          confirmation?.actionKey === "disable2fa"
            ? "Disable 2FA"
            : confirmation?.actionKey === "unblock"
              ? "Unblock"
              : "Block"
        }
        cancelLabel="Cancel"
        tone={confirmation?.actionKey === "disable2fa" ? "warning" : "danger"}
        onClose={() => setConfirmation(null)}
        onConfirm={() => {
          if (confirmation) {
            void handleMerchantAction(confirmation.row, confirmation.actionKey);
          }
        }}
      />
    </div>
  );
}

