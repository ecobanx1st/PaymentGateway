"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowUpRight,
  Eye,
  EyeOff,
  Info,
  KeyRound,
  PencilLine,
  Plus,
  Save,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import Button from "@/components/ui/button";
import CopyButton from "@/components/ui/CopyButton";
import Input from "@/components/ui/input";
import Modal from "@/components/ui/Modal";
import PageTopBanner from "@/components/ui/PageTopBanner";
import Snackbar from "@/components/ui/Snackbar";
import StatusBadge from "@/components/ui/StatusBadge";
import Table from "@/components/ui/table";
import TableSearch from "@/components/ui/Table/TableSearch";
import Skeleton from "@/components/ui/skeleton";
import Toggle from "@/components/ui/Toggle";
import apiClient, { getApiErrorPayload } from "@/lib/axiosInterceptor";
import { useStoredUserVerification } from "@/lib/user-verification-storage";
import {
  saveStoredSecurityActiveTab,
  SECURITY_PAGE_HREF,
  SECURITY_TAB_VERIFICATION,
} from "@/lib/security-tab-storage";

const permissionTemplates = [
  { id: "basicInfo", title: "Basic Info", description: "View basic account information", checked: false },
  { id: "getBalance", title: "Get Balance", description: "Check account balance", checked: false },
  { id: "deposit", title: "Deposit", description: "Create deposits", checked: false },
  { id: "withdraw", title: "Withdraw", description: "Process withdrawals", checked: false },
  { id: "getTransaction", title: "Get Transaction", description: "View transaction details", checked: false },
  { id: "getDepositHistory", title: "Get Deposit History", description: "View deposit history", checked: false },
  { id: "getWithdrawHistory", title: "Get Withdraw History", description: "View withdrawal history", checked: false },
  { id: "createTransaction", title: "Create Transaction", description: "Create new transactions", checked: false },
];

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

function getApiKeyVerificationNotice(verification) {
  if (!verification?.blocked) return null;

  const label = verification.label || "KYC";
  const details = verification.message || "";

  return {
    blocked: true,
    label,
    title: `Verify ${label}`,
    message: `Verify ${label} before creating or managing API keys.`,
    details,
  };
}
const emptyForm = {
  name: "",
  restrictedIp: "",
};

function clonePermissions(permissions = permissionTemplates) {
  return permissions.map((permission) => ({ ...permission }));
}

function mapPermissionsFromBackend(backendPerms = {}) {
  return permissionTemplates.map((tmpl) => ({
    ...tmpl,
    checked: backendPerms[tmpl.id] === true,
  }));
}

function mapPermissionsToBackend(permissions = []) {
  const result = {};
  permissions.forEach((p) => {
    result[p.id] = p.checked;
  });
  return result;
}

function mapApiKeyFromBackend(item) {
  return {
    id: item.id,
    name: item.keyName,
    restrictedIp:
      item.ipRestrictions?.length > 0
        ? item.ipRestrictions.join(", ")
        : "Any IP",
    publicKey: item.publicKey,
    privateKey: item.secretKey,
    status: item.status.charAt(0) + item.status.slice(1).toLowerCase(),
    createdAt: new Date(item.createdAt).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    permissions: mapPermissionsFromBackend(item.permissions),
  };
}

function KeyTextCell({ value }) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <span className="min-w-0 truncate font-mono text-[12px] text-secondary-text">{value}</span>
      <CopyButton value={value} label="Copy key" className="h-7 w-7 shrink-0" />
    </div>
  );
}

function PrivateKeyCell({ value }) {
  const [visible, setVisible] = useState(false);
  const displayValue = visible ? value : `${value.slice(0, 8)}****************`;

  return (
    <div className="flex min-w-0 items-center gap-2">
      <span className="min-w-0 truncate font-mono text-[12px] text-secondary-text">
        {displayValue}
      </span>
      <button
        type="button"
        onClick={() => setVisible((current) => !current)}
        aria-label={visible ? "Hide private key" : "Show private key"}
        className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-input-border bg-primary-bg text-secondary-text transition hover:border-primary hover:text-primary"
      >
        {visible ? <EyeOff size={14} /> : <Eye size={14} />}
      </button>
      <CopyButton value={value} label="Copy private key" className="h-7 w-7 shrink-0" />
    </div>
  );
}

function StatTile({ icon: Icon, label, value, helper }) {
  return (
    <article
      className="rounded-[18px] border border-input-border p-5"
      style={{ background: "var(--cardbg)" }}
    >
      <div className="flex items-start gap-4">
        <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-secondary-bg text-primary">
          <Icon size={21} />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-medium text-secondary-text">{label}</p>
          <p className="mt-1 text-2xl font-bold text-theme-text">{value}</p>
          {helper ? <p className="mt-1 text-sm text-secondary-text">{helper}</p> : null}
        </div>
      </div>
    </article>
  );
}

function PermissionToggleRow({ permission, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-input-border py-3 last:border-0">
      <div className="min-w-0">
        <h4 className="text-sm font-semibold text-theme-text">{permission.title}</h4>
        <p className="mt-0.5 text-sm leading-5 text-secondary-text">{permission.description}</p>
      </div>
      <Toggle
        checked={permission.checked}
        onChange={onChange}
        ariaLabel={permission.title}
        size="md"
      />
    </div>
  );
}

function VerificationNotice({ notice }) {
  if (!notice?.blocked) return null;

  return (
    <div className="rounded-[18px] border border-amber-400/35 bg-amber-400/10 p-4 shadow-[0_18px_45px_rgba(0,0,0,0.08)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-400/15 text-amber-400">
          <Info size={20} />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-bold text-theme-text">{notice.title}</h3>
          <p className="mt-1 text-sm leading-6 text-secondary-text">
            {notice.message}
          </p>
        </div>
        <Button
          value="Verify now"
          variant="primary"
          className="h-10 w-full border-0 px-4 text-sm text-white sm:w-auto sm:shrink-0"
          rightIcon={<ArrowUpRight size={16} />}
          onClick={() =>
            saveStoredSecurityActiveTab(SECURITY_TAB_VERIFICATION)
          }
          onNavigate={SECURITY_PAGE_HREF}
        />
      </div>
    </div>
  );
}
function ApiKeyForm({ form, error, permissions, onFormChange, onPermissionChange,
  keyRecord, otp, otpError, onOtpChange }) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Key name"
          name="name"
          value={form.name}
          placeholder="Checkout integration"
          error={error}
          onChange={(event) => onFormChange("name", event.target.value)}
          inputClassName="rounded-full"
          required
        />
        <Input
          label="Restrict IP address (optional)"
          name="restrictedIp"
          value={form.restrictedIp}
          placeholder="203.0.113.10"
          onChange={(event) => onFormChange("restrictedIp", event.target.value)}
          inputClassName="rounded-full"
        />
      </div>

      {keyRecord ? (
        <div className="grid gap-3 rounded-[14px] border border-input-border bg-secondary-bg/30 p-3 sm:grid-cols-2">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase text-secondary-text">Public key</p>
            <div className="mt-2">
              <KeyTextCell value={keyRecord.publicKey} />
            </div>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase text-secondary-text">Private key</p>
            <div className="mt-2">
              <PrivateKeyCell value={keyRecord.privateKey} />
            </div>
          </div>
        </div>
      ) : null}

      <section>
        <div className="mb-2">
          <h4 className="text-base font-semibold text-theme-text">API permissions</h4>
          <p className="mt-1 text-sm text-secondary-text">
            Control what this API key can access.
          </p>
        </div>

        <div
          data-lenis-prevent="true"
          className="max-h-[240px] overflow-y-auto rounded-[14px] border border-input-border px-3"
        >
          {permissions.map((permission) => (
            <PermissionToggleRow
              key={permission.id}
              permission={permission}
              onChange={(nextValue) => onPermissionChange(permission.id, nextValue)}
            />
          ))}
        </div>
      </section>

      <section>
        <Input
          label="Google authenticator code"
          name="otp"
          value={otp}
          placeholder="123456"
          error={otpError}
          onChange={(event) =>
            onOtpChange(event.target.value.replace(/\D/g, "").slice(0, 8))
          }
          inputClassName="rounded-full"
          required
        />
        <p className="mt-1 text-xs text-secondary-text">
          Enter the 6-digit code from your authenticator app to confirm.
        </p>
      </section>
    </div>
  );
}

export default function Page() {
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [pagination, setPagination] = useState(null);
  const [apiKeys, setApiKeys] = useState([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [editingKey, setEditingKey] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [revokingId, setRevokingId] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedApiKey, setSelectedApiKey] = useState(null);
  const [permissions, setPermissions] = useState(() => clonePermissions());
  const [snackbar, setSnackbar] = useState({ open: false, message: "", tone: "success" });
  const fetchSeq = useRef(0);
  const verification = useStoredUserVerification();
  const verificationNotice = useMemo(
    () => getApiKeyVerificationNotice(verification),
    [verification],
  );

  const showSnackbar = (message, tone = "success") => {
    setSnackbar({ open: true, message, tone });
  };

  const fetchApiKeys = useCallback(
    async ({ page: nextPage = 1, limit: nextLimit = pageSize, search: nextSearch = appliedSearch, quiet = false } = {}) => {
      const seq = ++fetchSeq.current;

      try {
        if (!quiet) setLoading(true);
        setFetching(true);

        const response = await apiClient.get("/merchant/api-keys", {
          params: {
            page: nextPage,
            limit: nextLimit,
            search: nextSearch.trim(),
          },
        });

        if (seq !== fetchSeq.current) return null;

        const records = response?.data?.data ?? [];
        const paginationData = response?.data?.pagination ?? null;

        setApiKeys(records.map(mapApiKeyFromBackend));
        setPagination(paginationData);

        return paginationData;
      } catch (error) {
        if (seq !== fetchSeq.current) return null;

        console.error("Failed to fetch API keys:", error);

        const payload = getApiErrorPayload(error);

        showSnackbar(
          payload?.message || "Failed to fetch API keys.",
          "error"
        );

        setApiKeys([]);

        return null;
      } finally {
        if (seq === fetchSeq.current) {
          setFetching(false);
          setLoading(false);
        }
      }
    },
    [appliedSearch, pageSize]
  );

  const refetchCurrentPage = useCallback(async () => {
    const result = await fetchApiKeys({ page, search: appliedSearch });

    if (result && result.totalPages > 0 && page > result.totalPages) {
      setPage(result.totalPages);
      await fetchApiKeys({ page: result.totalPages, search: appliedSearch });
    }
  }, [page, appliedSearch, fetchApiKeys]);

  const handleSearchChange = useCallback(
    (value) => {
      if (value === appliedSearch) return;

      setAppliedSearch(value);
      setPage(1);
      fetchApiKeys({ page: 1, search: value, quiet: true });
    },
    [appliedSearch, fetchApiKeys]
  );

  const handlePageChange = useCallback(
    (nextPage) => {
      if (nextPage === page) return;
      setPage(nextPage);
      fetchApiKeys({ page: nextPage, search: appliedSearch, quiet: true });
    },
    [page, appliedSearch, fetchApiKeys]
  );

  const handlePageSizeChange = useCallback(
    (nextPageSize) => {
      if (nextPageSize === pageSize) return;
      setPageSize(nextPageSize);
      setPage(1);
      fetchApiKeys({ page: 1, limit: nextPageSize, search: appliedSearch, quiet: true });
    },
    [pageSize, appliedSearch, fetchApiKeys]
  );

  useEffect(() => {
    (async () => {
      try {
        await fetchApiKeys({ page: 1, search: "" });
      } catch (error) {
        const payload = getApiErrorPayload(error);
        showSnackbar(payload.message || "Failed to load API keys.", "error");
      } finally {
        setLoading(false);
      }
    })();
    // Keep this as an initial fetch; search and pagination handlers refetch explicitly.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const enabledPermissionCount = useMemo(
    () =>
      apiKeys.reduce(
        (count, apiKey) =>
          count + apiKey.permissions.filter((permission) => permission.checked).length,
        0,
      ),
    [apiKeys],
  );

  const resetForm = () => {
    setForm(emptyForm);
    setFormError("");
    setOtp("");
    setOtpError("");
    setPermissions(clonePermissions());
    setEditingKey(null);
  };

  const openCreateModal = () => {
    resetForm();
    setCreateOpen(true);
  };

  const closeCreateModal = () => {
    setCreateOpen(false);
    resetForm();
  };

  const closeEditModal = () => {
    resetForm();
    setEditSubmitting(false);
  };

  const updateFormValue = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    if (field === "name" && value.trim()) setFormError("");
  };

  const updatePermission = (permissionId, nextValue) => {
    setPermissions((current) =>
      current.map((permission) =>
        permission.id === permissionId ? { ...permission, checked: nextValue } : permission,
      ),
    );
  };

  const validateOtp = () => {
    if (!/^\d{6,8}$/.test(otp.trim())) {
      setOtpError("Enter the 6-digit code from your authenticator app.");
      return null;
    }
    setOtpError("");
    return otp.trim();
  };

  const handleGenerateKey = async () => {
    const keyName = form.name.trim();

    if (!keyName) {
      setFormError("Key name is required.");
      return;
    }

    const twoFactorCode = validateOtp();
    if (!twoFactorCode) return;

    setSubmitting(true);
    try {
      const ipRestrictions = form.restrictedIp.trim()
        ? form.restrictedIp.split(",").map((ip) => ip.trim()).filter(Boolean)
        : [];

      const backendPermissions = mapPermissionsToBackend(permissions);

      await apiClient.post("/merchant/api-keys", {
        keyName,
        ipRestrictions,
        permissions: backendPermissions,
        twoFactorCode,
      });

      showSnackbar("API key created successfully.", "success");
      closeCreateModal();
      try {
        await refetchCurrentPage();
      } catch {
        setApiKeys([]);
      }
    } catch (error) {
      const payload = getApiErrorPayload(error);
      showSnackbar(payload.message || "Failed to create API key.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditKey = (apiKey) => {
    setEditingKey(apiKey);
    setOtp("");
    setOtpError("");
    setForm({
      name: apiKey.name,
      restrictedIp: apiKey.restrictedIp === "Any IP" ? "" : apiKey.restrictedIp,
    });
    setFormError("");
    setPermissions(clonePermissions(apiKey.permissions));
  };

  const handleSaveEdit = async () => {
    const keyName = form.name.trim();

    if (!keyName) {
      setFormError("Key name is required.");
      return;
    }

    const twoFactorCode = validateOtp();
    if (!twoFactorCode) return;

    const ipRestrictions = form.restrictedIp.trim()
      ? form.restrictedIp.split(",").map((ip) => ip.trim()).filter(Boolean)
      : [];

    const originalIpRestrictions = editingKey.restrictedIp === "Any IP"
      ? []
      : editingKey.restrictedIp.split(",").map((ip) => ip.trim()).filter(Boolean);

    const permissionsChanged = permissions.some(
      (p, i) => p.checked !== editingKey.permissions[i]?.checked,
    );

    if (
      keyName === editingKey.name &&
      !permissionsChanged &&
      ipRestrictions.length === originalIpRestrictions.length &&
      ipRestrictions.every((ip, i) => ip === originalIpRestrictions[i])
    ) {
      showSnackbar("No changes detected.", "info");
      return;
    }

    setEditSubmitting(true);
    try {
      await apiClient.put(`/merchant/api-keys/${editingKey.id}`, { keyName, ipRestrictions, twoFactorCode });

      const backendPermissions = mapPermissionsToBackend(permissions);
      await apiClient.put(`/merchant/api-keys/${editingKey.id}/permissions`, {
        permissions: backendPermissions,
        twoFactorCode,
      });

      showSnackbar("API key updated successfully.", "success");
      closeEditModal();
      try {
        await refetchCurrentPage();
      } catch {
        setApiKeys([]);
      }
    } catch (error) {
      const payload = getApiErrorPayload(error);
      showSnackbar(payload.message || "Failed to update API key.", "error");
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleDeleteKey = (apiKey) => {
    setSelectedApiKey(apiKey);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setSelectedApiKey(null);
  };

  const handleConfirmDelete = async () => {
    if (!selectedApiKey) return;

    setRevokingId(selectedApiKey.id);
    try {
      await apiClient.delete(`/merchant/api-keys/${selectedApiKey.id}`);
      showSnackbar("Deleted successfully.", "success");
      closeDeleteModal();
      await refetchCurrentPage();
    } catch (error) {
      const payload = getApiErrorPayload(error);
      showSnackbar(payload.message || "Failed to delete API key.", "error");
    } finally {
      setRevokingId(null);
    }
  };

  const apiKeyColumns = [
    {
      key: "name",
      title: "Key name",
      width: 210,
      render: (value, row) => (
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-theme-text">{value}</p>
          <p className="mt-1 text-xs text-secondary-text">{row.createdAt}</p>
        </div>
      ),
    },
    {
      key: "publicKey",
      title: "Public key",
      width: 270,
      render: (value) => <KeyTextCell value={value} />,
    },
    {
      key: "privateKey",
      title: "Private key",
      width: 300,
      render: (value) => <PrivateKeyCell value={value} />,
    },
    {
      key: "restrictedIp",
      title: "Restrict IP address",
      width: 180,
      render: (value) => (
        <span className="font-mono text-[12px] text-secondary-text">{value}</span>
      ),
    },
    {
      key: "permissions",
      title: "Permissions",
      width: 140,
      sortAccessor: (row) => row.permissions.filter((permission) => permission.checked).length,
      render: (_, row) => (
        <span className="rounded-full border border-input-border px-2.5 py-1 text-xs font-semibold text-secondary-text">
          {row.permissions.filter((permission) => permission.checked).length} enabled
        </span>
      ),
    },
    // {
    //   key: "status",
    //   title: "Status",
    //   width: 120,
    //   render: (value) => <StatusBadge status={value} />,
    // },
  ];

  const apiKeyActions = [
    {
      key: "edit",
      icon: <PencilLine size={14} />,
      tone: "api-action",
      ariaLabel: "Edit API key",
      onClick: handleEditKey,
    },
    {
      key: "delete",
      icon: <Trash2 size={14} />,
      tone: "api-action",
      ariaLabel: "Delete API key",
      disabled: (row) => revokingId === row.id,
      onClick: handleDeleteKey,
    },
  ];

  if (loading) {
    return <Skeleton pageName="api" />;
  }

  return (
    <div className="space-y-5 pb-6">
      <PageTopBanner
      title={`API Keys (${pagination?.totalDocs ?? apiKeys.length}/10)`}
        description="Create keys, restrict IP access, and control per-key permissions."
        actions={
          <Button
            value="Create key"
            variant="primary"
            className="h-11 w-full border-0 px-5 text-white sm:w-auto"
            rightIcon={<Plus size={16} />}
            onClick={openCreateModal}
          />
        }
      />

      <VerificationNotice notice={verificationNotice} />

      <section className="grid gap-4 md:grid-cols-2">
        <StatTile
          icon={KeyRound}
          label="API keys created"
          value={pagination?.totalDocs ?? apiKeys.length}
          helper={
            (pagination?.totalDocs ?? apiKeys.length) === 1
              ? "1 active key"
              : `${pagination?.totalDocs ?? apiKeys.length} active keys`
          }
        />
        <StatTile
          icon={ShieldCheck}
          label="Permissions enabled"
          value={enabledPermissionCount}
          helper="Across all API keys"
        />
        {/* <StatTile
          icon={Plus}
          label="Next key"
          value="Ready"
          helper="Use Create key to generate one"
        /> */}
      </section>

      <div className="hidden max-w-2xl">
        <TableSearch
          placeholder="Search by key name or IP address"
          value={search}
          onChange={setSearch}
          onDebouncedChange={handleSearchChange}
          debounce={500}
        />
      </div>

      <Table
        title="Generated API keys"
        subtitle="Public and private keys generated for your integrations. You can create up to 10 API keys."
        data={apiKeys}
        columns={apiKeyColumns}
        rowActions={apiKeyActions}
        loading={fetching}
        emptyTitle="No API keys created"
        emptyMessage="Create your first API key to start using integrations."
        emptyCtaLabel="Create key"
        onEmptyCta={openCreateModal}
        search={false}
        showFilter={false}
        showViewAll={false}
        minWidth={1160}
        pagination={{
          page,
          totalPages: pagination?.totalPages,
          pageSize: pagination?.limit,
          totalItems: pagination?.totalDocs,
          onPageChange: handlePageChange,
          onPageSizeChange: handlePageSizeChange,
        }}
      />

      <Modal
        open={createOpen}
        title="Create API key"
        description="Add a key name and optional IP restriction before generating keys."
        onClose={closeCreateModal}
        className="max-w-2xl"
      >
        <ApiKeyForm
          form={form}
          error={formError}
          permissions={permissions}
          onFormChange={updateFormValue}
          onPermissionChange={updatePermission}
          otp={otp}
          otpError={otpError}
          onOtpChange={(value) => {
            setOtp(value);
            if (value.trim()) setOtpError("");
          }}
        />

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button value="Cancel" className="text-theme-text" onClick={closeCreateModal} />
          <Button
            value="Generate key"
            variant="primary"
            className="border-0 text-white"
            rightIcon={<KeyRound size={16} />}
            disabled={submitting}
            onClick={handleGenerateKey}
          />
        </div>
      </Modal>

      <Modal
        open={Boolean(editingKey)}
        title="Edit API key"
        description="Update the key name, IP restriction, and API permissions."
        onClose={closeEditModal}
        className="max-w-2xl"
      >
        <ApiKeyForm
          form={form}
          error={formError}
          permissions={permissions}
          onFormChange={updateFormValue}
          onPermissionChange={updatePermission}
          keyRecord={editingKey}
          otp={otp}
          otpError={otpError}
          onOtpChange={(value) => {
            setOtp(value);
            if (value.trim()) setOtpError("");
          }}
        />

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button value="Cancel" className="text-theme-text" onClick={closeEditModal} />
          <Button
            value="Save changes"
            variant="primary"
            className="border-0 text-white"
            rightIcon={<Save size={16} />}
            disabled={editSubmitting}
            onClick={handleSaveEdit}
          />
        </div>
      </Modal>

      <Modal
        open={deleteModalOpen}
        title="Delete API key"
        description="Are you sure you want to revoke this API key? This action cannot be undone."
        onClose={closeDeleteModal}
        noScroll
      >
        <div className="mt-2 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button value="Cancel" className="text-theme-text" onClick={closeDeleteModal} />
          <Button
            value="Delete"
            variant="primary"
            className="border-0 text-white"
            disabled={revokingId === selectedApiKey?.id}
            onClick={handleConfirmDelete}
          />
        </div>
      </Modal>

      <Snackbar
        open={snackbar.open}
        message={snackbar.message}
        tone={snackbar.tone}
        onClose={() => setSnackbar({ open: false, message: "", tone: "success" })}
      />
    </div>
  );
}
