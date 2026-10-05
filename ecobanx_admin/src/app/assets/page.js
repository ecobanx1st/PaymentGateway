"use client";

import {
  Button,
  ExportButton,
  Modal,
  Table,
  Toast,
} from "@/components/ReusableUi";
import { postWithTokenApi } from "@/lib/apiHelper";
import { getAuthToken } from "@/lib/axiosInterceptor";
import { formatApiDate } from "@/lib/dateFormat";
import { Archive, Pencil, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

const ASSET_PAGE_SIZE = 10;
const ASSET_ENDPOINTS = {
  create: "/asset/create",
  list: "/create-asset",
  softDelete: "/asset/soft-delete",
  hardDelete: "/asset/hard-delete",
  update: "/asset/update",
};
const NETWORK_ENDPOINTS = {
  list: "/create-network",
};
const ASSET_IMAGE_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";
const ASSET_IMAGE_ORIGIN = getAssetImageOrigin(ASSET_IMAGE_BASE_URL);
const ASSET_STATUS_FILTER_OPTIONS = [
  { label: "All Status", value: "all" },
  { label: "Active", value: "true" },
  { label: "Inactive", value: "false" },
];

const columns = [
  {
    key: "image",
    header: "Image",
    cellClassName: "min-w-20",
    render: (_value, row) => <AssetImageCell row={row} />,
  },
  { key: "assetName", header: "Asset Name", cellClassName: "min-w-44" },
  { key: "assetSymbol", header: "Symbol", cellClassName: "min-w-28" },
  {
    key: "networkNames",
    header: "Network Details",
    cellClassName: "min-w-96",
    render: (_value, row) => <NetworkBadgesCell row={row} />,
  },
  {
    key: "contractAddress",
    header: "Contract Address",
    type: "contractAddress",
  },

  { key: "depositStatusLabel", header: "Deposit", type: "status" },
  { key: "withdrawStatusLabel", header: "Withdraw", type: "status" },
  { key: "status", header: "Status", type: "status" },
  { key: "createdAt", header: "Created At", cellClassName: "min-w-40" },
  { key: "actions", header: "Actions", type: "actions" },
];

const entityActions = [
  {
    key: "edit",
    label: "Edit asset",
    iconNode: <Pencil className="h-3 w-3" />,
  },
  // {
  //   key: "softDelete",
  //   label: "Soft delete asset",
  //   iconNode: <Archive className="h-3 w-3" />,
  // },
  {
    key: "hardDelete",
    label: "Delete asset",
    iconNode: <Trash2 className="h-3 w-3" />,
  },
];

function getApiErrorMessage(error, fallbackMessage = "Asset action failed.") {
  const data = error.response?.data;

  return (
    data?.message ||
    data?.msg ||
    data?.error ||
    data?.errors?.msg ||
    error.message ||
    fallbackMessage
  );
}

function getBooleanStatus(value) {
  if (typeof value === "boolean") {
    return value ? "Enabled" : "Disabled";
  }

  if (String(value).toLowerCase() === "true") {
    return "Enabled";
  }

  if (String(value).toLowerCase() === "false") {
    return "Disabled";
  }

  return value || "Disabled";
}

function getBooleanValue(value) {
  if (typeof value === "boolean") {
    return value;
  }

  return ["true", "enabled", "active", "yes", "1"].includes(
    String(value || "")
      .trim()
      .toLowerCase(),
  );
}

function getAssetStatus(asset) {
  if (typeof asset.status === "boolean") {
    return asset.status ? "Active" : "Inactive";
  }

  if (asset.status) {
    return asset.status;
  }

  if (asset.isDeleted || asset.deletedAt || asset.softDeleted) {
    return "Inactive";
  }

  return "Active";
}

function getNetworkConfigString(value) {
  if (value === null || value === undefined || value === "") {
    return "";
  }

  return String(value);
}

function normalizeNetworkConfig(entry) {
  if (typeof entry === "string") {
    return {
      networkId: entry,
      networkName: "",
      networkSymbol: "",
      contractAddress: "",
      withdrawFee: "",
      minWithdrawAmount: "",
      maxWithdrawAmount: "",
      minDepositAmount: "",
      maxDepositAmount: "",
      decimal: "",
    };
  }

  const networkRef = entry?.networkId;
  const network =
    typeof networkRef === "object" && networkRef ? networkRef : {};
  const networkId =
    typeof networkRef === "string"
      ? networkRef
      : network?._id || network?.id || entry?._id || entry?.id || "";

  return {
    networkId,
    networkName: network?.networkName || "",
    networkSymbol: network?.networkSymbol || "",
    chainId: network?.chainId || "",
    type: network?.type || "",
    contractAddress: getNetworkConfigString(entry?.contractAddress),
    withdrawFee: getNetworkConfigString(entry?.withdrawFee),
    minWithdrawAmount: getNetworkConfigString(entry?.minWithdrawAmount),
    maxWithdrawAmount: getNetworkConfigString(entry?.maxWithdrawAmount),
    minDepositAmount: getNetworkConfigString(entry?.minDepositAmount),
    maxDepositAmount: getNetworkConfigString(entry?.maxDepositAmount),
    decimal: getNetworkConfigString(entry?.decimal),
  };
}

function normalizeNetworkConfigs(networks) {
  if (!Array.isArray(networks)) {
    return [];
  }

  return networks
    .map(normalizeNetworkConfig)
    .filter((network) => network.networkId);
}

function getNetworkNames(networks) {
  if (!Array.isArray(networks) || networks.length === 0) {
    return "-";
  }

  return networks
    .map(
      (network) =>
        network.networkName || network.networkSymbol || network.networkId,
    )
    .filter(Boolean)
    .join(", ");
}
function getAssetImage(asset) {
  const imageValue =
    asset.image || asset.images || asset.assetImage || asset.icon || asset.logo;

  if (Array.isArray(imageValue)) {
    return imageValue[0] || "";
  }

  return imageValue || "";
}

function getAssetImageOrigin(baseUrl) {
  const value = String(baseUrl || "").trim();

  if (!value) {
    return "";
  }

  try {
    return new URL(value).origin;
  } catch (error) {
    return value.replace(/\/+$/, "");
  }
}

function resolveAssetImageUrl(imagePath) {
  const value = String(imagePath || "").trim();

  if (!value || /^(blob:|data:|https?:\/\/)/i.test(value)) {
    return value;
  }

  if (!ASSET_IMAGE_ORIGIN) {
    return value;
  }

  return `${ASSET_IMAGE_ORIGIN}/${value.replace(/^\/+/, "")}`;
}

function normalizeAsset(asset) {
  const networks = normalizeNetworkConfigs(asset.networks);
  const depositStatus = getBooleanValue(asset.depositStatus);
  const withdrawStatus = getBooleanValue(asset.withdrawStatus);
  const imagePath = getAssetImage(asset);

  return {
    id: asset._id || asset.id || asset.assetId,
    assetId: asset._id || asset.id || asset.assetId,
    assetName: asset.assetName || "-",
    assetSymbol: asset.assetSymbol || "-",
    networks,
    networkNames: getNetworkNames(networks),
    contractAddress: networks.length
      ? networks
        .map(
          (network) =>
            `${network.networkName}: ${network.contractAddress || "-"}`,
        )
        .join("\n")
      : "-",

    image: resolveAssetImageUrl(imagePath),
    imagePath,
    depositStatus,
    withdrawStatus,
    depositStatusLabel: getBooleanStatus(depositStatus),
    withdrawStatusLabel: getBooleanStatus(withdrawStatus),
    status: getAssetStatus(asset),
    createdAt: formatApiDate(asset.createdAt),
    updatedAt: formatApiDate(asset.updatedAt),
    raw: asset,
  };
}

function createBlankAsset() {
  return {
    id: `asset-${Date.now()}`,
    assetId: "",
    assetName: "",
    assetSymbol: "",
    networks: [],
    image: "",
    imagePath: "",
    depositStatus: true,
    withdrawStatus: true,
    status: "Active",
  };
}

function toNetworkConfigNumber(value) {
  if (value === "" || value === null || value === undefined) {
    return undefined;
  }

  const number = Number(value);

  return Number.isFinite(number) ? number : undefined;
}
function getAssetPayloadImage(asset) {
  if (isFileValue(asset.image)) {
    return asset.image;
  }

  if (isFileValue(asset.images)) {
    return asset.images;
  }

  if (asset.image === "") {
    return "";
  }

  return (
    asset.imagePath || asset.raw?.image || asset.image || asset.images || ""
  );
}

function buildAssetPayload(asset) {
  const networks = (Array.isArray(asset.networks) ? asset.networks : [])
    .map((network) => ({
      networkId: String(network?.networkId || "").trim(),
      contractAddress: String(network?.contractAddress || "").trim(),
      withdrawFee: toNetworkConfigNumber(network?.withdrawFee),
      minWithdrawAmount: toNetworkConfigNumber(network?.minWithdrawAmount),
      maxWithdrawAmount: toNetworkConfigNumber(network?.maxWithdrawAmount),
      minDepositAmount: toNetworkConfigNumber(network?.minDepositAmount),
      maxDepositAmount: toNetworkConfigNumber(network?.maxDepositAmount),
      decimal: toNetworkConfigNumber(network?.decimal),
    }))
    .filter((network) => network.networkId);

  return {
    assetName: String(asset.assetName || "").trim(),
    assetSymbol: String(asset.assetSymbol || "").trim(),
    networks,
    image: getAssetPayloadImage(asset),
    depositStatus: Boolean(asset.depositStatus),
    withdrawStatus: Boolean(asset.withdrawStatus),
    status: getBooleanValue(asset.status) ?? true,
  };
}

function isFileValue(value) {
  return typeof File !== "undefined" && value instanceof File;
}

const INDEXED_ARRAY_FORM_FIELDS = new Set(["networks"]);

function appendAssetFormValue(formData, key, value) {
  if (value === undefined || value === null || value === "") {
    return;
  }

  if (isFileValue(value)) {
    formData.append(key, value);
    return;
  }

  if (Array.isArray(value)) {
    if (INDEXED_ARRAY_FORM_FIELDS.has(key)) {
      value.forEach((item, index) =>
        appendAssetFormValue(formData, `${key}.${index}`, item),
      );
      return;
    }

    value.forEach((item) => appendAssetFormValue(formData, key, item));
    return;
  }

  if (typeof value === "object") {
    Object.entries(value).forEach(([itemKey, itemValue]) => {
      appendAssetFormValue(formData, `${key}.${itemKey}`, itemValue);
    });
    return;
  }

  formData.append(key, String(value));
}

function buildAssetRequestPayload(payload, assetId) {
  const requestPayload = assetId ? { assetId, ...payload } : { ...payload };
  const formData = new FormData();

  Object.entries(requestPayload).forEach(([key, value]) => {
    appendAssetFormValue(formData, key, value);
  });

  return formData;
}

function validateAssetPayload(payload) {
  if (!payload.assetName) {
    return "Asset name is required.";
  }

  if (!payload.assetSymbol) {
    return "Asset symbol is required.";
  }

  if (!payload.networks.length) {
    return "Select at least one network.";
  }

  for (const network of payload.networks) {
    // if (!network.contractAddress) {
    //   return "Contract address is required for every selected network.";
    // }

    if (!Number.isFinite(network.withdrawFee) || network.withdrawFee < 0) {
      return "Withdraw fee must be a valid non-negative number for every selected network.";
    }

    if (
      !Number.isFinite(network.minWithdrawAmount) ||
      network.minWithdrawAmount < 0
    ) {
      return "Min withdraw amount must be a valid non-negative number for every selected network.";
    }

    if (
      !Number.isFinite(network.maxWithdrawAmount) ||
      network.maxWithdrawAmount < 0
    ) {
      return "Max withdraw amount must be a valid non-negative number for every selected network.";
    }

    if (
      !Number.isFinite(network.minDepositAmount) ||
      network.minDepositAmount < 0
    ) {
      return "Min deposit amount must be a valid non-negative number for every selected network.";
    }

    if (
      !Number.isFinite(network.maxDepositAmount) ||
      network.maxDepositAmount < 0
    ) {
      return "Max deposit amount must be a valid non-negative number for every selected network.";
    }

    if (
      Number.isFinite(network.maxWithdrawAmount) &&
      Number.isFinite(network.minWithdrawAmount) &&
      network.maxWithdrawAmount <= network.minWithdrawAmount
    ) {
      return "Max withdraw amount must be greater than min withdraw amount for every selected network.";
    }

    if (
      Number.isFinite(network.maxDepositAmount) &&
      Number.isFinite(network.minDepositAmount) &&
      network.maxDepositAmount <= network.minDepositAmount
    ) {
      return "Max deposit amount must be greater than min deposit amount for every selected network.";
    }

    if (
      network.decimal !== undefined &&
      network.decimal !== null &&
      network.decimal !== "" &&
      (!Number.isFinite(Number(network.decimal)) || Number(network.decimal) < 0)
    ) {
      return "Decimal must be a valid non-negative number for every selected network.";
    }
    // const hasContractAddress =
    //   typeof network.contractAddress === "string" &&
    //   network.contractAddress.trim().length > 0;
    const hasDecimal = Number.isFinite(network.decimal);

    // if (!hasContractAddress && hasDecimal) {
    //   return "Contract address is required.";
    // }

    if (!hasDecimal) {
      return "Decimal is required.";
    }
  }


  return "";
}
function assertApiSuccess(response, fallbackMessage) {
  if (response?.success === false) {
    throw new Error(response.message || fallbackMessage);
  }
}

function getAssetId(row) {
  return row?.assetId || row?.id || row?._id;
}

function AssetImageCell({ row }) {
  const imageUrl = row?.image || "";
  const fallbackLabel = String(row?.assetSymbol || row?.assetName || "?")
    .trim()
    .slice(0, 2)
    .toUpperCase();
  const className =
    "grid h-10 w-10 place-items-center overflow-hidden rounded-[8px] border border-input-border bg-input-bg";
  const thumbnail = imageUrl ? (
    <span
      role="img"
      aria-label={`${row?.assetName || row?.assetSymbol || "Asset"} image`}
      className="block h-full w-full bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${imageUrl})` }}
    />
  ) : (
    <span className="text-small font-semibold text-text-secondary">
      {fallbackLabel}
    </span>
  );

  if (!imageUrl) {
    return <span className={className}>{thumbnail}</span>;
  }

  return (
    <a
      href={imageUrl}
      target="_blank"
      rel="noreferrer"
      className={`${className} transition hover:border-text-primary`}
      aria-label={`Open ${row?.assetName || row?.assetSymbol || "asset"} image`}
      onClick={(event) => event.stopPropagation()}
    >
      {thumbnail}
    </a>
  );
}

function NetworkBadgesCell({ row }) {
  const networks = Array.isArray(row?.networks) ? row.networks : [];

  if (!networks.length) {
    return <span className="text-text-secondary">-</span>;
  }

  function getConfigValue(value) {
    return value === "" || value === null || value === undefined ? "-" : value;
  }

  return (
    <div className="flex min-w-0 flex-col gap-2">
      {networks.map((network) => {
        const networkName =
          network.networkName || network.networkSymbol || network.networkId;
        const networkSymbol = network.networkSymbol
          ? ` (${network.networkSymbol})`
          : "";

        return (
          <div
            key={network.networkId}
            className="rounded-[8px] border border-input-border/50 bg-input-bg/40 px-3 py-2"
          >
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="text-small font-semibold text-theme-text">
                {networkName}
                {networkSymbol}
              </span>
              {network.type ? (
                <span className="rounded-full bg-card-bg px-2 py-0.5 text-[11px] font-medium text-text-secondary">
                  {network.type}
                </span>
              ) : null}
            </div>
            <div className="mt-1 grid grid-cols-1 gap-1 text-[11px] text-text-secondary sm:grid-cols-2">
              <span>Fee: {getConfigValue(network.withdrawFee)}</span>
              <span>Decimal: {getConfigValue(network.decimal)}</span>
              <span>Min Withdraw: {getConfigValue(network.minWithdrawAmount)}</span>
              <span>Max Withdraw: {getConfigValue(network.maxWithdrawAmount)}</span>
              <span>Min Deposit: {getConfigValue(network.minDepositAmount)}</span>
              <span>Max Deposit: {getConfigValue(network.maxDepositAmount)}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function AssetsPage() {
  const [assetRows, setAssetRows] = useState([]);
  const [networkOptions, setNetworkOptions] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [search, setSearch] = useState("");
  const [networkFilter, setNetworkFilter] = useState("all");
  const [assetStatusFilter, setAssetStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submittingAction, setSubmittingAction] = useState(false);
  const [toast, setToast] = useState(null);
  const [modalState, setModalState] = useState({
    open: false,
    mode: "edit",
    intent: "add",
    row: null,
  });

  const filteredAssets = assetRows;

  const networkFilterOptions = useMemo(
    () => [{ label: "All Networks", value: "all" }, ...networkOptions],
    [networkOptions],
  );

  const networkConfigField = useMemo(
    () => ({
      key: "networks",
      label: "Networks",
      type: "networkConfig",
      options: networkOptions,
      placeholder: networkOptions.length
        ? "Select networks"
        : "No networks available",
      configFields: [
        {
          key: "contractAddress",
          label: "Contract Address",
          placeholder: "0x...",
        },
        {
          key: "withdrawFee",
          label: "Withdraw Fee",
          type: "number",
          placeholder: "0",
        },
        {
          key: "minWithdrawAmount",
          label: "Minimum Withdraw Amount",
          type: "number",
          placeholder: "0",
        },
        {
          key: "maxWithdrawAmount",
          label: "Maximum Withdraw Amount",
          type: "number",
          placeholder: "0",
        },
        {
          key: "minDepositAmount",
          label: "Minimum Deposit Amount",
          type: "number",
          placeholder: "0",
        },
        {
          key: "maxDepositAmount",
          label: "Maximum Deposit Amount",
          type: "number",
          placeholder: "0",
        },
        { key: "decimal", label: "Decimal", type: "number", placeholder: "18" },
      ],
    }),
    [networkOptions],
  );

  const createAssetFormFields = useMemo(
    () => [
      { key: "assetName", label: "Asset Name" },
      { key: "assetSymbol", label: "Symbol" },
      {
        key: "image",
        label: "Image",
        type: "imageUpload",
        placeholder: "Upload asset image",
      },
      networkConfigField,
      { key: "depositStatus", label: "Deposit Status", type: "toggle" },
      { key: "withdrawStatus", label: "Withdraw Status", type: "toggle" },
      { key: "status", label: "Status", type: "toggle" },
    ],
    [networkConfigField],
  );

  const editAssetFormFields = useMemo(
    () => [
      { key: "assetName", label: "Asset Name" },
      { key: "assetSymbol", label: "Symbol" },
      {
        key: "image",
        label: "Image",
        type: "imageUpload",
        placeholder: "Upload asset image",
      },
      networkConfigField,
      { key: "depositStatus", label: "Deposit Status", type: "toggle" },
      { key: "withdrawStatus", label: "Withdraw Status", type: "toggle" },
      { key: "status", label: "Status", type: "toggle" },
      { key: "networkNames", label: "Network Names", editable: false },
      { key: "createdAt", label: "Created At", editable: false },
      { key: "updatedAt", label: "Updated At", editable: false },
    ],
    [networkConfigField],
  );

  const fetchAssets = useCallback(async (nextPage = 1) => {
    const token = getAuthToken();

    if (!token) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const payload = {
        page: String(nextPage),
        limit: String(ASSET_PAGE_SIZE),
      };
      const trimmedSearch = search.trim();

      if (trimmedSearch) {
        payload.search = trimmedSearch;
      }

      if (networkFilter !== "all") {
        payload.networkId = String(networkFilter);
      }

      if (assetStatusFilter !== "all") {
        payload.status = String(assetStatusFilter);
      }

      const response = await postWithTokenApi(token, ASSET_ENDPOINTS.list, payload);
      assertApiSuccess(response, "Unable to fetch assets.");

      const rows = Array.isArray(response?.data) ? response.data : [];

      setAssetRows(rows.map(normalizeAsset));
      setPagination(response?.pagination || null);
      setPage(response?.pagination?.page || nextPage);
    } catch (error) {
      setAssetRows([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, [assetStatusFilter, networkFilter, search]);
  const fetchNetworkOptions = useCallback(async () => {
    const token = getAuthToken();

    if (!token) {
      setNetworkOptions([]);
      return;
    }

    try {
      const response = await postWithTokenApi(token, NETWORK_ENDPOINTS.list, {
        status: "true",
      });
      assertApiSuccess(response, "Unable to fetch networks.");

      const rows = Array.isArray(response?.data) ? response.data : [];

      setNetworkOptions(
        rows
          .map((network) => {
            const networkId = network?._id || network?.id;

            if (!networkId) {
              return null;
            }

            const networkName = network.networkName || networkId;
            const networkSymbol = network.networkSymbol || "";

            return {
              value: networkId,
              label: `${networkName}${networkSymbol ? ` (${networkSymbol})` : ""}`,
              networkName,
              networkSymbol,
            };
          })
          .filter(Boolean),
      );
    } catch (error) {
      setNetworkOptions([]);
    }
  }, []);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      fetchAssets(1);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [fetchAssets]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      fetchNetworkOptions();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [fetchNetworkOptions]);

  function closeModal() {
    setModalState((current) => ({ ...current, open: false }));
  }

  function showToast(content, color = "success") {
    setToast({ id: Date.now(), content, color });
  }

  function handleAddAsset() {
    setModalState({
      open: true,
      mode: "edit",
      intent: "add",
      row: createBlankAsset(),
    });
  }

  function handleEditAsset(row) {
    setModalState({
      open: true,
      mode: "edit",
      intent: "edit",
      row,
    });
  }

  async function handleSoftDeleteAsset(row) {
    const token = getAuthToken();
    const assetId = getAssetId(row);

    if (!token) {
      showToast("Session token not found", "error");
      return;
    }

    if (!assetId) {
      showToast("Asset ID not found", "error");
      return;
    }

    setSubmittingAction(true);

    // try {
    //   const response = await postWithTokenApi(
    //     token,
    //     ASSET_ENDPOINTS.softDelete,
    //     { assetId },
    //   );
    //   assertApiSuccess(response, "Unable to soft delete asset.");

    //   showToast(
    //     response?.message || "Asset soft deleted successfully",
    //     "success",
    //   );
    //   await fetchAssets(page);
    // } catch (error) {
    //   showToast(
    //     getApiErrorMessage(error, "Unable to soft delete asset."),
    //     "error",
    //   );
    // } finally {
    //   setSubmittingAction(false);
    // }
  }

  async function handleHardDeleteAsset(row) {
    const token = getAuthToken();
    const assetId = getAssetId(row);

    if (!token) {
      showToast("Session token not found", "error");
      return;
    }

    if (!assetId) {
      showToast("Asset ID not found", "error");
      return;
    }

    setSubmittingAction(true);

    try {
      const response = await postWithTokenApi(
        token,
        ASSET_ENDPOINTS.hardDelete,
        { assetId },
      );
      assertApiSuccess(response, "Unable to delete asset.");

      showToast(
        response?.message || "Asset permanently deleted successfully",
        "success",
      );
      await fetchAssets(page);
    } catch (error) {
      showToast(getApiErrorMessage(error, "Unable to delete asset."), "error");
    } finally {
      setSubmittingAction(false);
    }
  }

  function handleTableAction(actionKey, row) {
    if (submittingAction) {
      return;
    }

    if (actionKey === "edit") {
      handleEditAsset(row);
      return;
    }

    if (actionKey === "softDelete") {
      handleSoftDeleteAsset(row);
      return;
    }

    if (actionKey === "hardDelete") {
      handleHardDeleteAsset(row);
    }
  }

  async function handleSaveAsset(updatedAsset) {
    if (submittingAction) {
      return;
    }

    const token = getAuthToken();

    if (!token) {
      showToast("Session token not found", "error");
      return;
    }

    const payload = buildAssetPayload(updatedAsset);
    const validationMessage = validateAssetPayload(payload);

    if (validationMessage) {
      showToast(validationMessage, "error");
      return;
    }

    setSubmittingAction(true);

    try {
      if (modalState.intent === "add") {
        const response = await postWithTokenApi(
          token,
          ASSET_ENDPOINTS.create,
          buildAssetRequestPayload(payload),
        );
        assertApiSuccess(response, "Unable to create asset.");
        showToast(response?.message || "Asset created successfully", "success");
        closeModal();
        await fetchAssets(1);
        return;
      }

      const assetId = getAssetId(updatedAsset);

      if (!assetId) {
        showToast("Asset ID not found", "error");
        return;
      }

      const response = await postWithTokenApi(
        token,
        ASSET_ENDPOINTS.update,
        buildAssetRequestPayload(payload, assetId),
      );
      assertApiSuccess(response, "Unable to update asset.");
      showToast(response?.message || "Asset updated successfully", "success");
      closeModal();
      await fetchAssets(page);
    } catch (error) {
      showToast(
        getApiErrorMessage(
          error,
          modalState.intent === "add"
            ? "Unable to create asset."
            : "Unable to update asset.",
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
          <h1 className="text-xl font-semibold text-theme-text">Assets</h1>
          <p className="text-small text-text-secondary">
            {pagination?.totalDocs ?? filteredAssets.length} asset
            {(pagination?.totalDocs ?? filteredAssets.length) === 1
              ? ""
              : "s"}{" "}
            configured
          </p>
        </section>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
            {/* <ExportButton
            rows={filteredAssets}
            columns={columns}
            fileName="eco-banx-assets.csv"
            disabled={!filteredAssets.length || loading}
          >
            Export Assets
          </ExportButton> */}
            <Button
              variant="primary"
              beforeIcon={<Plus className="h-4 w-4" />}
              className="w-full sm:w-auto"
              disabled={submittingAction}
              onClick={handleAddAsset}
            >
              Add New
            </Button>
          </div>
        </div>
      </div>

      <Table
        title="All Assets"
        description="Latest supported digital assets"
        columns={columns}
        data={loading ? [] : filteredAssets}
        loading={loading}
        rowKey="id"
        filters={[
          {
            key: "search",
            type: "search",
            label: "Search Asset",
            placeholder: "Search asset",
          },
          {
            key: "networkId",
            label: "Network",
            placeholder: "All Networks",
            options: networkFilterOptions,
          },
          {
            key: "status",
            label: "Asset Status",
            placeholder: "All Status",
            options: ASSET_STATUS_FILTER_OPTIONS,
          },
        ]}
        filterValues={{
          search,
          networkId: networkFilter,
          status: assetStatusFilter,
        }}
        onFilterChange={(key, value) => {
          if (key === "search") {
            setSearch(value);
            setPage(1);
          }

          if (key === "networkId") {
            setNetworkFilter(value || "all");
            setPage(1);
          }

          if (key === "status") {
            setAssetStatusFilter(value || "all");
            setPage(1);
          }
        }}
        showSearch={false}
        searchPlaceholder="Search by asset name,network or symbol"
        viewAllLabel="View All"
        actions={entityActions}
        onAction={handleTableAction}
        pagination={{
          page,
          pageSize: pagination?.limit || ASSET_PAGE_SIZE,
          total: pagination?.totalDocs ?? filteredAssets.length,
          totalPages: pagination?.totalPages || 1,
          onPageChange: fetchAssets,
        }}
        className="mt-0"
        tableClassName="min-w-[1360px]"
      />

      <Modal
        open={modalState.open}
        mode={modalState.mode}
        title={modalState.intent === "add" ? "Add asset" : "Edit asset"}
        description={modalState.row?.assetName || "Asset details"}
        data={modalState.row}
        fields={
          modalState.intent === "add"
            ? createAssetFormFields
            : editAssetFormFields
        }
        onClose={closeModal}
        onSave={handleSaveAsset}
        saveLabel={
          submittingAction
            ? "Saving..."
            : modalState.intent === "add"
              ? "Add asset"
              : "Save changes"
        }
      />
    </div>
  );
}
