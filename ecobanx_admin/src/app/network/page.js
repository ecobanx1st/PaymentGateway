"use client";

import { Button, ExportButton, Modal, Table, Toast, Toggle } from "@/components/ReusableUi";
import { postWithTokenApi } from "@/lib/apiHelper";
import { getAuthToken } from "@/lib/axiosInterceptor";
import { formatApiDate } from "@/lib/dateFormat";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const NETWORK_PAGE_SIZE = 10;
const NETWORK_ENDPOINTS = {
  create: "/network/create",
  list: "/create-network",
  softDelete: "/network/soft-delete",
  hardDelete: "/network/hard-delete",
  update: "/network/update",
};

const exportColumns = [
  { key: "networkName", header: "Network Name", cellClassName: "min-w-44" },
  { key: "networkSymbol", header: "Symbol", cellClassName: "min-w-28" },
  { key: "chainId", header: "Chain ID", cellClassName: "min-w-28" },
  { key: "rpcUrl", header: "RPC URL", cellClassName: "min-w-72" },
  { key: "type", header: "Type", type: "status" },
  { key: "depositEnabled", header: "Deposit Enabled" },
  { key: "withdrawEnabled", header: "Withdraw Enabled" },
  { key: "withdrawFee", header: "Withdraw Fees" },
  { key: "explorerUrl", header: "Explorer URL", cellClassName: "min-w-72" },
  // { key: "status", header: "Status" },
  // { key: "createdAt", header: "Created At", cellClassName: "min-w-40" },
];

const entityActions = [
  { key: "edit", label: "Edit network", iconNode: <Pencil className="h-3 w-3" /> },
  {
    key: "hardDelete",
    label: "Delete network",
    iconNode: <Trash2 className="h-3 w-3" />,
  },
];

const NETWORK_TYPE_OPTIONS = [
  { label: "EVM", value: "EVM" },
  { label: "NON-EVM", value: "NON-EVM" },
];
const NETWORK_STATUS_FILTER_OPTIONS = [
  { label: "All Status", value: "all" },
  { label: "Active", value: "true" },
  { label: "Inactive", value: "false" },
];

const NETWORK_FORM_FIELD_TYPES = {
  type: "select",
  depositEnabled: "toggle",
  withdrawEnabled: "toggle",
  withdrawFee: "number",
  status: "toggle",
};

function toFormField(column, editable = true) {
  return {
    key: column.key,
    label: column.header,
    type: NETWORK_FORM_FIELD_TYPES[column.key],
    options: column.key === "type" ? NETWORK_TYPE_OPTIONS : undefined,
    placeholder: column.key === "type" ? "Select type" : undefined,
    editable,
  };
}

const createFields = exportColumns
  .map((column) => toFormField(column));

const formFields = [
  ...exportColumns,
].map((column) =>
  toFormField(column, true),
);

function getApiErrorMessage(error, fallbackMessage = "Network action failed.") {
  const data = error.response?.data;

  return data?.message || data?.msg || data?.error || data?.errors?.msg || error.message || fallbackMessage;
}

function getNetworkActive(network) {
  if (typeof network.status === "boolean") {
    return network.status;
  }

  if (network.isDeleted || network.deletedAt || network.softDeleted) {
    return false;
  }

  const normalizedStatus = String(network.status || "").trim().toLowerCase();

  if (["false", "inactive", "disabled", "soft deleted", "deleted"].includes(normalizedStatus)) {
    return false;
  }

  return true;
}

function getBooleanValue(value) {
  if (typeof value === "boolean") {
    return value;
  }

  return ["true", "enabled", "active", "yes", "1"].includes(
    String(value || "").trim().toLowerCase(),
  );
}

function NetworkBadge({ enabled }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-small font-medium ${
        enabled
          ? "bg-emerald-500/15 text-emerald-400"
          : "bg-zinc-500/20 text-text-secondary"
      }`}
    >
      {enabled ? "Enabled" : "Disabled"}
    </span>
  );
}

function normalizeNetwork(network) {
  const networkActive = getNetworkActive(network);

  return {
    id: network._id || network.id || network.networkId,
    networkId: network._id || network.id || network.networkId,
    networkName: network.networkName ,
    networkSymbol: network.networkSymbol,
    chainId: network.chainId ,
    rpcUrl: network.rpcUrl,
    type: network.type === "EVM" ? "EVM" : "NON-EVM",
    depositEnabled: getBooleanValue(network.depositEnabled ?? true),
    withdrawEnabled: getBooleanValue(network.withdrawEnabled ?? true),
    withdrawFee: network.withdrawFee ?? "0",
    explorerUrl: network.explorerUrl,
    networkActive,
    status: networkActive ? "Active" : "Inactive",
    createdAt: formatApiDate(network.createdAt),
    updatedAt: formatApiDate(network.updatedAt),
    raw: network,
  };
}

function createBlankNetwork() {
  return {
    id: `network-${Date.now()}`,
    networkId: "",
    networkName: "",
    networkSymbol: "",
    chainId: "",
    rpcUrl: "",
    type: "EVM",
    depositEnabled: true,
    withdrawEnabled: true,
    withdrawFee: "0",
    explorerUrl: "",
    networkActive: true,
    status: "Active",
  };
}

function buildNetworkPayload(network) {
  return {
    networkName: String(network.networkName || "").trim(),
    networkSymbol: String(network.networkSymbol || "").trim(),
    chainId: String(network.chainId || "").trim(),
    rpcUrl: String(network.rpcUrl || "").trim(),
    type: String(network.type || "").trim(),
    status: Boolean(network.status),
    depositEnabled: Boolean(network.depositEnabled),
    withdrawEnabled: Boolean(network.withdrawEnabled),
    withdrawFee: Number(network.withdrawFee),
    explorerUrl: String(network.explorerUrl || "").trim(),
  };
}

function validateNetworkPayload(payload, intent) {
  if (!payload.networkName) {
    return "Network name is required.";
  }

  if (!payload.networkSymbol) {
    return "Network symbol is required.";
  }

  if (!payload.chainId && payload.type === "EVM") {
    return "Chain ID is required.";
  }

  // if (!payload.rpcUrl) {
  //   return "RPC URL is required.";
  // }

  if (!payload.type) {
    return "Network type is required.";
  }


  // if (intent === "add" && !payload.explorerUrl) {
  //   return "Explorer URL is required.";
  // }

  if (!Number.isFinite(payload.withdrawFee) || payload.withdrawFee < 0) {
    return "Withdraw fee must be a valid non-negative number.";
  }

  // if (payload.explorerUrl) {
  //   try {
  //     new URL(payload.explorerUrl);
  //   } catch (error) {
  //     return "Explorer URL must be a valid URL.";
  //   }
  // }

  return "";
}

function assertApiSuccess(response, fallbackMessage) {
  if (response?.success === false) {
    throw new Error(response.message || fallbackMessage);
  }
}

function getNetworkId(row) {
  return row?.networkId || row?.id || row?._id;
}

export default function NetworkPage() {
  const router = useRouter();
  const [networkRows, setNetworkRows] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submittingAction, setSubmittingAction] = useState(false);
  const [toast, setToast] = useState(null);
  const [conflictState, setConflictState] = useState(null);
  const [modalState, setModalState] = useState({
    open: false,
    mode: "edit",
    intent: "add",
    row: null,
  });

  const tableColumns = [
    { key: "networkName", header: "Network Name", cellClassName: "min-w-44" },
    { key: "networkSymbol", header: "Symbol", cellClassName: "min-w-28" },
    { key: "chainId", header: "Chain ID", cellClassName: "min-w-28" },
    { key: "rpcUrl", header: "RPC URL", cellClassName: "min-w-72" },
    { key: "type", header: "Type", type: "status" },
    {
      key: "depositEnabled",
      header: "Deposit",
      cellClassName: "min-w-28",
      render: (_value, row) => <NetworkBadge enabled={row.depositEnabled} />,
    },
    {
      key: "withdrawEnabled",
      header: "Withdraw",
      cellClassName: "min-w-28",
      render: (_value, row) => <NetworkBadge enabled={row.withdrawEnabled} />,
    },
    {
      key: "withdrawFee",
      header: "Withdraw Fee",
      cellClassName: "min-w-32",
      render: (_value, row) => row.withdrawFee ?? "-",
    },
    {
      key: "explorerUrl",
      header: "Explorer URL",
      cellClassName: "min-w-64",
      render: (_value, row) => {
        if (!row.explorerUrl) {
          return "-";
        }

        return (
          <a
            href={row.explorerUrl}
            target="_blank"
            rel="noreferrer"
            className="text-text-primary underline-offset-2 hover:underline"
          >
            {row.explorerUrl}
          </a>
        );
      },
    },
    {
      key: "status",
      header: "Status",
      cellClassName: "min-w-44",
      render: (_value, row) => (
        <div className="flex items-center gap-3">
          <Toggle
            checked={row.networkActive}
            disabled={submittingAction}
            label={`${row.networkName} status`}
            onChange={() => handleNetworkStatusChange(row)}
          />
          <span className={row.networkActive ? "text-emerald-400" : "text-text-secondary"}>
            {row.networkActive ? "Active" : "Inactive"}
          </span>
        </div>
      ),
    },
    // { key: "createdAt", header: "Created At", cellClassName: "min-w-40" },
    { key: "actions", header: "Actions", type: "actions" },
  ];

  const filteredNetworks = networkRows;

  const fetchNetworks = useCallback(async (nextPage = 1) => {
    const token = getAuthToken();

    if (!token) {
      setToast({ id: Date.now(), content: "Session token not found", color: "error" });
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const payload = {
        page: String(nextPage),
        limit: String(NETWORK_PAGE_SIZE),
      };
      const trimmedSearch = search.trim();

      if (trimmedSearch) {
        payload.search = trimmedSearch;
      }

      if (statusFilter !== "all") {
        payload.status = String(statusFilter);
      }

      const response = await postWithTokenApi(token, NETWORK_ENDPOINTS.list, payload);
      assertApiSuccess(response, "Unable to fetch networks.");

      const rows = Array.isArray(response?.data) ? response.data : [];

      setNetworkRows(rows.map(normalizeNetwork));
      setPagination(response?.pagination || null);
      setPage(response?.pagination?.page || nextPage);
    } catch (error) {
      setToast({
        id: Date.now(),
        content: getApiErrorMessage(error, "Unable to fetch networks."),
        color: "error",
      });
      setNetworkRows([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      fetchNetworks(1);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [fetchNetworks]);

  function closeModal() {
    setModalState((current) => ({ ...current, open: false }));
  }

  function showToast(content, color = "success") {
    setToast({ id: Date.now(), content, color });
  }

  function handleAddNetwork() {
    setModalState({
      open: true,
      mode: "edit",
      intent: "add",
      row: createBlankNetwork(),
    });
  }

  function handleEditNetwork(row) {
    setModalState({
      open: true,
      mode: "edit",
      intent: "edit",
      row,
    });
  }

  async function handleNetworkStatusChange(row) {
    const token = getAuthToken();
    const networkId = getNetworkId(row);

    if (!token) {
      showToast("Session token not found", "error");
      return;
    }

    if (!networkId) {
      showToast("Network ID not found", "error");
      return;
    }

    setSubmittingAction(true);

    try {
      const response = await postWithTokenApi(token, NETWORK_ENDPOINTS.softDelete, {
        networkId,
      });
      assertApiSuccess(response, "Unable to update network status.");

      showToast(response?.message || "Network status updated successfully", "success");
      await fetchNetworks(page);
    } catch (error) {
      if (error.response?.status === 409 && error.response?.data?.result) {
        setConflictState({
          type: "deactivate",
          networkName: row.networkName,
          networkId: networkId,
          currentStatus: row.networkActive,
          data: error.response.data.result,
        });
        showToast("Deactivate all linked assets before deactivating this network.", "error");
        return;
      }
      showToast(getApiErrorMessage(error, "Unable to update network status."), "error");
    } finally {
      setSubmittingAction(false);
    }
  }

  async function handleHardDeleteNetwork(row) {
    const token = getAuthToken();
    const networkId = getNetworkId(row);

    if (!token) {
      showToast("Session token not found", "error");
      return;
    }

    if (!networkId) {
      showToast("Network ID not found", "error");
      return;
    }

    setSubmittingAction(true);

    try {
      const response = await postWithTokenApi(token, NETWORK_ENDPOINTS.hardDelete, { networkId });
      assertApiSuccess(response, "Unable to delete network.");

      showToast(response?.message || "Network permanently deleted successfully", "success");
      await fetchNetworks(page);
    } catch (error) {
      if (error.response?.status === 409 && error.response?.data?.result) {
        setConflictState({
          type: "delete",
          networkName: row.networkName,
          data: error.response.data.result,
        });
        showToast("This network cannot be deleted because it is currently used by existing assets.", "error");
        return;
      }
      showToast(getApiErrorMessage(error, "Unable to delete network."), "error");
    } finally {
      setSubmittingAction(false);
    }
  }

  function handleTableAction(actionKey, row) {
    if (submittingAction) {
      return;
    }

    if (actionKey === "edit") {
      handleEditNetwork(row);
      return;
    }

    if (actionKey === "hardDelete") {
      handleHardDeleteNetwork(row);
    }
  }

  async function handleSaveNetwork(updatedNetwork) {
    if (submittingAction) {
      return;
    }

    const token = getAuthToken();

    if (!token) {
      showToast("Session token not found", "error");
      return;
    }

    const payload = buildNetworkPayload(updatedNetwork);
    const validationMessage = validateNetworkPayload(payload, modalState.intent);

    if (validationMessage) {
      showToast(validationMessage, "error");
      return;
    }

    setSubmittingAction(true);

    try {
      if (modalState.intent === "add") {
        const response = await postWithTokenApi(token, NETWORK_ENDPOINTS.create, {
          status: true,
          ...payload,
        });
        assertApiSuccess(response, "Unable to create network.");
        showToast(response?.message || "Network created successfully", "success");
        closeModal();
        await fetchNetworks(1);
        return;
      }

      const networkId = getNetworkId(updatedNetwork);

      if (!networkId) {
        showToast("Network ID not found", "error");
        return;
      }

      const response = await postWithTokenApi(token, NETWORK_ENDPOINTS.update, {
        networkId,
        ...payload,
      });
      assertApiSuccess(response, "Unable to update network.");
      showToast(response?.message || "Network updated successfully", "success");
      closeModal();
      await fetchNetworks(page);
    } catch (error) {
      showToast(
        getApiErrorMessage(
          error,
          modalState.intent === "add" ? "Unable to create network." : "Unable to update network.",
        ),
        "error",
      );
    } finally {
      setSubmittingAction(false);
    }
  }

  return (
    <div className="space-y-8">
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
      <div className="flex justify-between items-center gap-4 flex-col sm:flex-row">
        <section className="space-y-2">
          <h1 className="text-xl font-semibold text-theme-text">Network</h1>
          <p className="text-small text-text-secondary">
            {pagination?.totalDocs ?? filteredNetworks.length} network
            {(pagination?.totalDocs ?? filteredNetworks.length) === 1
              ? ""
              : "s"}{" "}
            configured
          </p>
        </section>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
            {/* <ExportButton rows={filteredNetworks} columns={exportColumns} fileName="eco-banx-networks.csv" disabled={!filteredNetworks.length || loading}>
            Export Networks
          </ExportButton> */}
            <Button
              variant="primary"
              beforeIcon={<Plus className="h-4 w-4" />}
              className="w-full sm:w-auto"
              disabled={submittingAction}
              onClick={handleAddNetwork}
            >
              Add New
            </Button>
          </div>
        </div>
      </div>

      <Table
        title="All Networks"
        description="Latest configured blockchain endpoints"
        columns={tableColumns}
        data={loading ? [] : filteredNetworks}
        loading={loading}
        rowKey="id"
        filters={[
          {
            key: "search",
            type: "search",
            label: "Search Network",
            placeholder: "Search network",
          },
          {
            key: "status",
            label: "Network Status",
            placeholder: "All Status",
            options: NETWORK_STATUS_FILTER_OPTIONS,
          },
        ]}
        filterValues={{
          search,
          status: statusFilter,
        }}
        onFilterChange={(key, value) => {
          if (key === "search") {
            setSearch(value);
            setPage(1);
          }

          if (key === "status") {
            setStatusFilter(value || "all");
            setPage(1);
          }
        }}
        showSearch={false}
        searchPlaceholder="Search by network name, symbol or chain ID"
        actions={entityActions}
        onAction={handleTableAction}
        pagination={{
          page,
          pageSize: pagination?.limit || NETWORK_PAGE_SIZE,
          total: pagination?.totalDocs ?? filteredNetworks.length,
          totalPages: pagination?.totalPages || 1,
          onPageChange: fetchNetworks,
        }}
        className="mt-0"
        tableClassName="min-w-[1560px]"
      />

      <Modal
        open={modalState.open}
        mode={modalState.mode}
        title={modalState.intent === "add" ? "Add network" : "Edit network"}
        description={modalState.row?.networkName || "Network details"}
        data={modalState.row}
        fields={modalState.intent === "add" ? createFields : formFields}
        onClose={closeModal}
        onSave={handleSaveNetwork}
        saveLabel={
          submittingAction
            ? "Saving..."
            : modalState.intent === "add"
              ? "Add network"
              : "Save changes"
        }
      />

      {conflictState && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 px-4 py-6">
          <div
            role="dialog"
            aria-modal="true"
            className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-rounded border border-input-border/60 bg-bg-primary shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4 border-b border-input-border/40 px-5 py-4">
              <div className="space-y-1">
                <h2 className="text-large font-semibold text-theme-text">
                  {conflictState.type === "delete"
                    ? "Cannot Delete Network"
                    : "Cannot Deactivate Network"}
                </h2>
                <p className="text-small text-text-secondary">
                  This network is currently assigned to one or more assets.
                  Please deactivate or remove the following assets before
                  deleting or deactivating this network.
                </p>
              </div>
              <button
                type="button"
                aria-label="Close modal"
                onClick={() => setConflictState(null)}
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-input-border bg-input-bg text-text-secondary transition hover:border-text-secondary hover:text-theme-text"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div
              className="flex-1 overflow-y-auto px-5 py-4"
              style={{ maxHeight: "250px" }}
            >
              <p className="mb-3 text-mid font-semibold text-text-secondary">
                Assets using this network
              </p>
              <div className="space-y-2">
                {conflictState.data.assets.map((asset) => (
                  <div
                    key={asset._id}
                    className="flex items-center justify-between rounded-[8px] border border-input-border/40 bg-input-bg/30 px-4 py-2.5"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-mid font-medium text-theme-text">
                        {asset.name}
                      </span>
                      <span className="text-small text-text-secondary">
                        {asset.symbol}
                      </span>
                    </div>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        asset.status === "active"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-red-500/10 text-red-400"
                      }`}
                    >
                      {asset.status === "active" ? "Active" : "Inactive"}
                    </span>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-small font-medium text-text-secondary">
                Total Assets: {conflictState.data.assetCount}
              </p>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-input-border/40 px-5 py-4 sm:flex-row sm:justify-end">
              <Button
                variant="secondary"
                type="button"
                onClick={() => setConflictState(null)}
                className="w-full sm:w-auto"
              >
                Close
              </Button>
              <Button
                type="button"
                onClick={async () => {
                  const token = getAuthToken();
                  if (!token) return;

                  setSubmittingAction(true);
                  try {
                    const response = await postWithTokenApi(
                      token,
                      NETWORK_ENDPOINTS.softDelete,
                      {
                        networkId: conflictState.networkId,
                        forceChange: true,
                      },
                    );
                    assertApiSuccess(
                      response,
                      "Unable to update network status.",
                    );
                    setConflictState(null);
                    showToast(
                      response?.message ||
                        "Network status updated successfully",
                      "success",
                    );
                    await fetchNetworks(page);
                  } catch (error) {
                    if (
                      error.response?.status === 409 &&
                      error.response?.data?.result
                    ) {
                      setConflictState({
                        type: conflictState.type,
                        networkName: conflictState.networkName,
                        networkId: conflictState.networkId,
                        currentStatus: !conflictState.currentStatus,
                        data: error.response.data.result,
                      });
                      showToast(
                        "Cannot deactivate. Network still has linked assets.",
                        "error",
                      );
                    } else {
                      showToast(
                        getApiErrorMessage(
                          error,
                          "Unable to update network status.",
                        ),
                        "error",
                      );
                    }
                  } finally {
                    setSubmittingAction(false);
                  }
                }}
                disabled={submittingAction}
                className="w-full sm:w-auto"
              >
                {conflictState?.currentStatus ? "Inactive" : "Active"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


