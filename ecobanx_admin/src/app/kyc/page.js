"use client";

import { Button, ConfirmationDialog, DocumentPreviewModal, Table, Toast } from "@/components/ReusableUi";
import { getWithTokenApi, patchWithTokenApi } from "@/lib/apiHelper";
import { getAuthToken } from "@/lib/axiosInterceptor";
import { formatApiDate } from "@/lib/dateFormat";
import { resolveDocumentUrl } from "@/lib/documentUrl";
import { Check, Eye, FileText, ImageOff, Maximize2, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

const KYC_ENDPOINT = "/kyc";
const KYC_PAGE_SIZE = 10;

function getColumns(onPreview) {
  return [
    { key: "applicant", header: "Applicant", cellClassName: "min-w-44" },
    { key: "email", header: "Email", cellClassName: "min-w-56" },
    { key: "phoneNumber", header: "Phone", cellClassName: "min-w-40" },
    { key: "documentType", header: "Document", cellClassName: "min-w-32" },
    {
      key: "documentsPreview",
      header: "Images",
      cellClassName: "min-w-44",
      render: (_value, row) => (
        <DocumentPreviewGroup row={row} onPreview={onPreview} />
      ),
    },
    { key: "status", header: "Status", type: "status" },
    { key: "submitted", header: "Submitted", cellClassName: "min-w-40" },
    { key: "actions", header: "Actions", type: "actions" },
  ];
}

const statusFilterOptions = [
  { label: "All", value: "all" },
  { label: "Pending", value: "Pending" },
  { label: "Approved", value: "Approved" },
  { label: "Rejected", value: "Rejected" },
];

function buildKycListParams({ page, search, status, dateRange }) {
  const params = {
    page: String(page),
    limit: String(KYC_PAGE_SIZE),
  };
  const trimmedSearch = String(search || "").trim();

  if (trimmedSearch) {
    params.search = trimmedSearch;
  }

  if (status && status !== "all") {
    params.status = String(status);
  }

  if (dateRange?.from) {
    params.fromDate = String(dateRange.from);
  }

  if (dateRange?.to) {
    params.toDate = String(dateRange.to);
  }

  return params;
}

const allActions = [
  { key: "view", label: "View KYC", iconNode: <Eye className="h-3 w-3" /> },
  { key: "approve", label: "Approve KYC", iconNode: <Check className="h-3 w-3" /> },
  { key: "reject", label: "Reject KYC", iconNode: <X className="h-3 w-3" /> },
];

function normalizeActionKey(value) {
  const normalized = String(value || "")
    .replace(/[^a-z0-9]/gi, "")
    .toLowerCase();

  if (normalized.includes("approve")) {
    return "approve";
  }

  if (normalized.includes("reject")) {
    return "reject";
  }

  if (normalized.includes("view")) {
    return "view";
  }

  return normalized;
}

function isTruthyActionValue(value) {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    return value !== 0;
  }

  return !["", "0", "false", "no", "disabled", "hidden"].includes(
    String(value ?? "")
      .trim()
      .toLowerCase(),
  );
}

function isActionAllowed(action) {
  if (!action || typeof action !== "object") {
    return isTruthyActionValue(action);
  }

  const allowedValue =
    action.enabled ??
    action.allowed ??
    action.visible ??
    action.show ??
    action.can;

  return allowedValue === undefined ? true : isTruthyActionValue(allowedValue);
}

function getRecordActionSource(record) {
  return (
    record?.actions ??
    record?.availableActions ??
    record?.allowedActions ??
    record?.reviewActions ??
    record?.permissions
  );
}

function normalizeRecordActionKeys(actionSource) {
  if (Array.isArray(actionSource)) {
    return actionSource
      .filter(isActionAllowed)
      .map((action) =>
        normalizeActionKey(
          typeof action === "object"
            ? action.key ?? action.action ?? action.name ?? action.label
            : action,
        ),
      )
      .filter(Boolean);
  }

  if (typeof actionSource === "string") {
    return actionSource
      .split(",")
      .map(normalizeActionKey)
      .filter(Boolean);
  }

  if (actionSource && typeof actionSource === "object") {
    return Object.entries(actionSource)
      .filter(([, value]) => isActionAllowed(value))
      .map(([key, value]) =>
        normalizeActionKey(
          value && typeof value === "object"
            ? value.key ?? value.action ?? value.name ?? value.label ?? key
            : key,
        ),
      )
      .filter(Boolean);
  }

  return null;
}

function getFlagActionKeys(record) {
  const flags = [
    ["approve", record?.canApprove ?? record?.allowApprove ?? record?.approve],
    ["reject", record?.canReject ?? record?.allowReject ?? record?.reject],
  ];
  const availableFlags = flags.filter(([, value]) => value !== undefined);

  if (!availableFlags.length) {
    return null;
  }

  return availableFlags
    .filter(([, value]) => isActionAllowed(value))
    .map(([key]) => key);
}

function resolveRecordActions(record, fallbackActions) {
  const responseActionKeys =
    normalizeRecordActionKeys(getRecordActionSource(record)) ??
    getFlagActionKeys(record);

  if (!responseActionKeys) {
    return fallbackActions;
  }

  const allowedKeys = new Set(["view", ...responseActionKeys]);

  return allActions.filter((action) => allowedKeys.has(action.key));
}

function getReviewActions(row) {
  return (row?.actions || []).filter((action) =>
    ["approve", "reject"].includes(normalizeActionKey(action.key)),
  );
}

function getApiErrorMessage(error, fallbackMessage = "Unable to load KYC records.") {
  const data = error.response?.data;

  return data?.message || data?.msg || data?.error || data?.errors?.msg || error.message || fallbackMessage;
}

function getApplicantName(record) {
  const fullName = [record.firstName, record.middleName, record.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();

  return fullName || record.userId?.fullName || "-";
}

function getUploadStatus(path) {
  return path ? "Uploaded" : "Missing";
}

function getKycActions(status) {
  const normalizedStatus = String(status || "").toLowerCase();

  if (normalizedStatus === "rejected") {
    return [allActions[0],allActions[1]];
  }

  if (normalizedStatus === "approved") {
    return [allActions[0], allActions[2]];
  }

  return allActions;
}

function normalizeKycRecord(record) {
  const identity = record.identity || {};
  const address = record.address || {};
  const rejectedFieldsArray = Array.isArray(record.rejectedFields) ? record.rejectedFields.filter(Boolean) : [];
  const rejectedFields = rejectedFieldsArray.length > 0 ? rejectedFieldsArray.join(", ") : "-";

  const documentFiles = Array.isArray(record.documentFiles) && record.documentFiles.length > 0
    ? record.documentFiles.map((file) => ({
      ...file,
      url: resolveDocumentUrl(file.url),
    }))
    : [
      { name: "Front Image", url: resolveDocumentUrl(identity.frontImage), status: getUploadStatus(identity.frontImage) },
      { name: "Back Image", url: resolveDocumentUrl(identity.backImage), status: getUploadStatus(identity.backImage) },
      { name: "Selfie Image", url: resolveDocumentUrl(record.selfieImage), status: getUploadStatus(record.selfieImage) },
    ].filter((file) => Boolean(file.url));

  return {
    id: record._id,
    kycId: record._id,
    applicant: getApplicantName(record),
    firstName: record.firstName || "-",
    middleName: record.middleName || "-",
    lastName: record.lastName || "-",
    userName: record.userId?.fullName || "-",
    userEmail: record.userId?.email || "-",
    userId: record.userId?._id || "-",
    email: record.email || record.userId?.email || "-",
    phoneNumber: record.phoneNumber || "-",
    dateOfBirth: formatApiDate(record.dateOfBirth),
    gender: record.gender || "-",
    nationality: record.nationality || "-",
    country: record.countryOfResidence || address.country || "-",
    addressLine1: address.addressLine1 || "-",
    addressLine2: address.addressLine2 || "-",
    city: address.city || "-",
    state: address.state || "-",
    postalCode: address.postalCode || "-",
    documentType: identity.documentType || "-",
    documentNumber: identity.documentNumber || "-",
    issueDate: formatApiDate(identity.issueDate),
    expiryDate: formatApiDate(identity.expiryDate),
    frontImage: getUploadStatus(identity.frontImage),
    backImage: getUploadStatus(identity.backImage),
    selfieImage: getUploadStatus(record.selfieImage),
    frontImageUrl: resolveDocumentUrl(identity.frontImage),
    backImageUrl: resolveDocumentUrl(identity.backImage),
    selfieImageUrl: resolveDocumentUrl(record.selfieImage),
    documentFiles,
    status: record.status || "-",
    rejectedFields,
    rejectedFieldsList: rejectedFieldsArray,
    rejectionReason: record.rejectionReason || "-",
    adminNotes: record.adminNotes || "-",
    submitted: formatApiDate(record.createdAt),
    updated: formatApiDate(record.updatedAt),
    reviewed: formatApiDate(record.reviewedAt),
    actions: resolveRecordActions(record, getKycActions(record.status)),
    raw: record,
  };
}


function DetailItem({ label, value, children }) {
  return (
    <div className="rounded-[8px] border border-input-border/40 bg-input-bg/50 p-3">
      <p className="text-small font-medium text-text-secondary">{label}</p>
      <div className="mt-1 break-words text-mid font-medium text-theme-text">{children ?? (value || "-")}</div>
    </div>
  );
}

function DetailsSection({ title, children }) {
  return (
    <section className="rounded-[10px] border border-input-border/40 bg-card-bg p-4 sm:p-5">
      <h3 className="mb-4 text-mid font-semibold text-theme-text">{title}</h3>
      {children}
    </section>
  );
}

function StatusPill({ value }) {
  const normalized = String(value || "").toLowerCase();
  let tone = "border-zinc-500/20 bg-zinc-500/10 text-text-secondary";

  if (normalized === "approved") {
    tone = "border-emerald-500/25 bg-emerald-500/15 text-emerald-300";
  } else if (normalized === "rejected") {
    tone = "border-red-500/25 bg-red-500/15 text-red-400";
  } else if (normalized === "pending") {
    tone = "border-amber-500/25 bg-amber-500/15 text-amber-300";
  } else if (normalized === "submitted") {
    tone = "border-sky-500/25 bg-sky-500/15 text-sky-300";
  }

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-small font-semibold ${tone}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {value || "-"}
    </span>
  );
}

function RejectedFieldBadges({ fields }) {
  const list = Array.isArray(fields) ? fields.filter(Boolean) : [];

  if (list.length === 0) {
    return <p className="text-small text-text-secondary">No rejected fields.</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {list.map((field) => (
        <span key={field} className="inline-flex items-center rounded-full border border-red-500/25 bg-red-500/10 px-2.5 py-1 text-small font-medium text-red-300">
          {field}
        </span>
      ))}
    </div>
  );
}

function DocumentThumbnail({ label, url, onPreview }) {
  const shortLabel = label
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2);

  const content = url ? (
    <span
      role="img"
      aria-label={label}
      className="block h-full w-full bg-contain bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${url})` }}
    />
  ) : (
    <span className="text-small font-semibold text-text-secondary">{shortLabel}</span>
  );

  if (!url) {
    return (
      <span className="grid h-10 w-10 place-items-center overflow-hidden rounded-[8px] border border-input-border bg-input-bg">
        {content}
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onPreview({ label, url })}
      className="grid h-10 w-10 place-items-center overflow-hidden rounded-[8px] border border-input-border bg-input-bg transition hover:border-text-primary"
      aria-label={`Preview ${label}`}
    >
      {content}
    </button>
  );
}

function DocumentPreviewGroup({ row, onPreview }) {
  return (
    <div className="flex items-center gap-2">
      <DocumentThumbnail label="Front Image" url={row.frontImageUrl} onPreview={onPreview} />
      <DocumentThumbnail label="Back Image" url={row.backImageUrl} onPreview={onPreview} />
      <DocumentThumbnail label="Selfie Image" url={row.selfieImageUrl} onPreview={onPreview} />
    </div>
  );
}

function isPdfUrl(url) {
  return /\.pdf($|\?)/i.test(String(url || "").split("#")[0]);
}

function VerificationDocumentCard({ label, url, emptyText, onPreview }) {
  const resolvedUrl = url || "";
  const isPdf = isPdfUrl(resolvedUrl);

  if (!resolvedUrl) {
    return (
      <div className="flex flex-col rounded-[10px] border border-dashed border-input-border/60 bg-input-bg/30 p-3">
        <div className="grid aspect-[4/3] w-full place-items-center rounded-[8px] border border-input-border/40 bg-bg-primary text-small text-text-secondary">
          <span className="flex flex-col items-center gap-2">
            <ImageOff className="h-5 w-5" />
            {emptyText}
          </span>
        </div>
        <p className="mt-2 text-mid font-medium text-theme-text">{label}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-[10px] border border-input-border/50 bg-bg-primary">
      <div className="group relative aspect-[4/3] w-full overflow-hidden bg-input-bg/40">
        {isPdf ? (
          <button
            type="button"
            onClick={() => onPreview({ label, url: resolvedUrl })}
            className="grid h-full w-full place-items-center text-small font-medium text-text-secondary transition hover:text-theme-text"
            aria-label={`Preview ${label}`}
          >
            <span className="flex flex-col items-center gap-2">
              <FileText className="h-6 w-6" />
              View PDF
            </span>
          </button>
        ) : (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element -- Admin verification documents. */}
            <img
              src={resolvedUrl}
              alt={label}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-contain p-2"
            />
            <button
              type="button"
              onClick={() => onPreview({ label, url: resolvedUrl })}
              className="absolute inset-0 h-full w-full cursor-zoom-in"
              aria-label={`Preview ${label}`}
            />
          </>
        )}
        <span className="pointer-events-none absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full border border-input-border/50 bg-bg-primary/90 text-text-secondary opacity-0 transition group-hover:opacity-100">
          <Maximize2 className="h-3.5 w-3.5" />
        </span>
      </div>
      <div className="flex items-center justify-between gap-2 border-t border-input-border/40 px-3 py-2">
        <p className="truncate text-small font-medium text-theme-text">{label}</p>
        <span className="flex shrink-0 items-center gap-1 text-small font-medium text-text-primary">
          <Eye className="h-3.5 w-3.5" />
          Preview
        </span>
      </div>
    </div>
  );
}

function KycDetailsModal({ row, submitting, onClose, onAction, onPreview }) {
  if (!row) {
    return null;
  }

  const reviewActions = getReviewActions(row);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 px-4 py-6">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="KYC details"
        className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-rounded border border-input-border/60 bg-bg-primary shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-input-border/40 px-5 py-4">
          <div className="min-w-0 space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-large font-semibold text-theme-text">KYC Details</h2>
              <StatusPill value={row.status} />
            </div>
            <p className="text-small text-text-secondary">{row.applicant}</p>
          </div>
          <button
            type="button"
            aria-label="Close KYC details"
            onClick={onClose}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-input-border bg-input-bg text-text-secondary transition hover:border-text-secondary hover:text-theme-text"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5">
          <DetailsSection title="Personal Information">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <DetailItem label="First Name" value={row.firstName} />
              <DetailItem label="Middle Name" value={row.middleName} />
              <DetailItem label="Last Name" value={row.lastName} />
              <DetailItem label="Date of Birth" value={row.dateOfBirth} />
              <DetailItem label="Gender" value={row.gender} />
              <DetailItem label="Nationality" value={row.nationality} />
              <DetailItem label="Country of Residence" value={row.country} />
              <DetailItem label="Email" value={row.email} />
              <DetailItem label="Phone Number" value={row.phoneNumber} />
            </div>
          </DetailsSection>

          <DetailsSection title="Address">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <DetailItem label="Address Line 1" value={row.addressLine1} />
              <DetailItem label="Address Line 2" value={row.addressLine2} />
              <DetailItem label="City" value={row.city} />
              <DetailItem label="State" value={row.state} />
              <DetailItem label="Postal Code" value={row.postalCode} />
              <DetailItem label="Country" value={row.country} />
            </div>
          </DetailsSection>

          <DetailsSection title="Identity Information">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <DetailItem label="Document Type" value={row.documentType} />
              <DetailItem label="Document Number" value={row.documentNumber} />
              <DetailItem label="Issue Date" value={row.issueDate} />
              <DetailItem label="Expiry Date" value={row.expiryDate} />
            </div>
          </DetailsSection>

          <DetailsSection title="Identity Images">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <VerificationDocumentCard label="Front Image" url={row.frontImageUrl} emptyText="No image available" onPreview={onPreview} />
              <VerificationDocumentCard label="Back Image" url={row.backImageUrl} emptyText="No image available" onPreview={onPreview} />
              <VerificationDocumentCard label="Selfie Image" url={row.selfieImageUrl} emptyText="No image available" onPreview={onPreview} />
            </div>
          </DetailsSection>

          {/* <DetailsSection title="Rejected Fields">
            <RejectedFieldBadges fields={row.rejectedFieldsList} />
          </DetailsSection> */}

          <DetailsSection title="Review">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <DetailItem label="Status">
                <StatusPill value={row.status} />
              </DetailItem>
              <DetailItem label="Rejection Reason" value={row.rejectionReason} />
              {/* <DetailItem label="Admin Notes" value={row.adminNotes} /> */}
              <DetailItem label="Created At" value={row.submitted} />
              {/* <DetailItem label="Updated At" value={row.updated} /> */}
              <DetailItem label="Reviewed At" value={row.updated} />
            </div>
          </DetailsSection>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-input-border/40 px-5 py-4 sm:flex-row sm:justify-end">
          <Button variant="secondary" type="button" onClick={onClose} className="w-full sm:w-auto">
            Close
          </Button>
          {reviewActions.map((action) => {
            const actionKey = normalizeActionKey(action.key);
            const isReject = actionKey === "reject";

            return (
              <Button
                key={action.key}
                type="button"
                variant={isReject ? "secondary" : undefined}
                disabled={submitting}
                onClick={() => onAction(actionKey, row)}
                className={
                  isReject
                    ? "w-full !border-red-500/40 !text-red-300 hover:!border-red-400 hover:!bg-red-500/10 sm:w-auto"
                    : "w-full !border-emerald-500/30 !bg-emerald-500/15 !text-emerald-300 hover:!border-emerald-400 sm:w-auto"
                }
                beforeIcon={isReject ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
              >
                {isReject ? "Reject" : "Approve"}
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function KycVerificationPage() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [kycRecords, setKycRecords] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [submittingAction, setSubmittingAction] = useState(false);
  const [viewRow, setViewRow] = useState(null);
  const [documentPreview, setDocumentPreview] = useState(null);
  const [confirmation, setConfirmation] = useState(null);

  const openDocumentPreview = useCallback((preview) => {
    setDocumentPreview(preview);
  }, []);

  const columns = useMemo(() => getColumns(openDocumentPreview), [openDocumentPreview]);

  const filteredSubmissions = kycRecords;

  const fetchKycRecords = useCallback(async (nextPage = 1) => {
    const token = getAuthToken();

    if (!token) {
      setToast({ id: Date.now(), content: "Session token not found", color: "error" });
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const response = await getWithTokenApi(
        token,
        KYC_ENDPOINT,
        buildKycListParams({
          page: nextPage,
          search,
          status: statusFilter,
          dateRange,
        }),
      );
      const records = Array.isArray(response?.data) ? response.data : [];

      setKycRecords(records.map(normalizeKycRecord));
      setPagination(response?.pagination || null);
      setPage(response?.pagination?.currentPage || nextPage);
    } catch (error) {
      setToast({
        id: Date.now(),
        content: getApiErrorMessage(error),
        color: "error",
      });
      setKycRecords([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, [dateRange, search, statusFilter]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      fetchKycRecords(1);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [fetchKycRecords]);


  function openConfirmation(actionKey, row) {
    setConfirmation({ actionKey, row });
  }

  function closeConfirmation() {
    setConfirmation(null);
  }

  async function getParticularkyc(kycId) {
    const token = getAuthToken();
    try{
      const resposne = await getWithTokenApi(token, `/kyc/${kycId}`);
      if(resposne?.data){
        setViewRow(normalizeKycRecord(resposne.data));
      }
    } catch (error) {
      setToast({
        id: Date.now(),
        content: getApiErrorMessage(error, "Unable to fetch KYC details."),
        color: "error",
      });
    }
  }


  async function handleApproveKyc(row) {
    const token = getAuthToken();

    if (!token) {
      setToast({ id: Date.now(), content: "Session token not found", color: "error" });
      return;
    }

    setSubmittingAction(true);

    try {
      const response = await patchWithTokenApi(token, `/kyc/${row.id}/approve`);

      setToast({
        id: Date.now(),
        content: response?.message || "KYC approved successfully.",
        color: "success",
      });
      setViewRow(null);
      await fetchKycRecords(page);
    } catch (error) {
      setToast({
        id: Date.now(),
        content: getApiErrorMessage(error, "Unable to approve KYC."),
        color: "error",
      });
    } finally {
      setSubmittingAction(false);
    }
  }

  async function handleRejectKyc(row, details = {}) {
    const token = getAuthToken();
    const reason = String(details.reason || "").trim();

    if (!token) {
      setToast({ id: Date.now(), content: "Session token not found", color: "error" });
      return;
    }

    if (!reason) {
      setToast({ id: Date.now(), content: "Rejection reason is required.", color: "error" });
      return;
    }

    setSubmittingAction(true);

    try {
      const response = await patchWithTokenApi(token, `/kyc/${row.id}/reject`, {
        rejectionReason: reason,
      });

      setToast({
        id: Date.now(),
        content: response?.message || "KYC rejected successfully.",
        color: "success",
      });
      setViewRow(null);
      await fetchKycRecords(page);
    } catch (error) {
      setToast({
        id: Date.now(),
        content: getApiErrorMessage(error, "Unable to reject KYC."),
        color: "error",
      });
    } finally {
      setSubmittingAction(false);
    }
  }

  function handleTableAction(actionKey, row, details = {}) {
    if (submittingAction) {
      return;
    }

    if (actionKey === "view") {
      getParticularkyc(row.id);
      // setViewRow(row);
      return;
    }

    if (actionKey === "approve") {
      handleApproveKyc(row);
      return;
    }

    if (actionKey === "reject") {
      handleRejectKyc(row, details);
    }
  }

  function handleModalAction(actionKey, row) {
    if (submittingAction) {
      return;
    }

    openConfirmation(actionKey, row);
  }

  const confirmationCopy = confirmation?.actionKey === "approve"
    ? {
      title: "Confirm approval",
      description: `Are you sure you want to approve ${confirmation.row?.applicant}?`,
      confirmLabel: "Approve",
      tone: "success",
      requireReason: false,
      reasonLabel: "Reason",
    }
    : {
      title: "Confirm rejection",
      description: `Add a reason before you reject ${confirmation?.row?.applicant || "this KYC"}.`,
      confirmLabel: "Reject",
      tone: "danger",
      requireReason: true,
      reasonLabel: "Rejection reason",
    };

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

      <section className="space-y-2">
        <h1 className="text-large font-semibold text-theme-text">KYC Verification</h1>
        <p className="text-small text-text-secondary">
          {pagination?.totalDocs ?? filteredSubmissions.length} KYC record
          {(pagination?.totalDocs ?? filteredSubmissions.length) === 1 ? "" : "s"} in review
        </p>
      </section>

      <Table
        title="KYC Verification"
        columns={columns}
        data={loading ? [] : filteredSubmissions}
        loading={loading}
        rowKey="id"
        filters={[
          {
            key: "search",
            type: "search",
            label: "Search KYC",
            placeholder:
              "Search by First name, Email or Phone",
          },
          {
            key: "status",
            type: "dropdown",
            label: "Status",
            options: statusFilterOptions,
            placeholder: "All Status",
          },
          {
            type: "dateRange",
            label: "Date Range",
            fromKey: "from",
            toKey: "to",
            fromLabel: "From",
            toLabel: "To",
            placeholder: "Select date",
          },
        ]}
        filterValues={{
          search,
          status: statusFilter,
          from: dateRange.from,
          to: dateRange.to,
        }}
        onFilterChange={(key, value) => {
          if (key === "search") {
            setSearch(value);
            setPage(1);
            return;
          }

          if (key === "status") {
            setStatusFilter(value);
            setPage(1);
          }

          if (key === "from" || key === "to") {
            setDateRange((currentRange) => ({
              ...currentRange,
              [key]: value,
            }));
            setPage(1);
          }
        }}
        showSearch={false}
        viewAllLabel="View All"
        actions={allActions}
        onAction={handleTableAction}
        pagination={{
          page,
          pageSize: pagination?.limit || KYC_PAGE_SIZE,
          total: pagination?.totalDocs ?? filteredSubmissions.length,
          totalPages: pagination?.totalPages || 1,
          onPageChange: fetchKycRecords,
        }}
        className="mt-0"
        tableClassName="min-w-[1220px]"
      />

      <KycDetailsModal
        row={viewRow}
        submitting={submittingAction}
        onClose={() => setViewRow(null)}
        onAction={handleModalAction}
        onPreview={openDocumentPreview}
      />

      <DocumentPreviewModal
        preview={documentPreview}
        onClose={() => setDocumentPreview(null)}
        authToken={getAuthToken()}
      />

      <ConfirmationDialog
        open={Boolean(confirmation)}
        title={confirmationCopy.title}
        description={confirmationCopy.description}
        confirmLabel={confirmationCopy.confirmLabel}
        tone={confirmationCopy.tone}
        requireReason={confirmationCopy.requireReason}
        reasonLabel={confirmationCopy.reasonLabel}
        reasonPlaceholder="Type the reason"
        onClose={closeConfirmation}
        onConfirm={(details) => {
          const currentConfirmation = confirmation;

          closeConfirmation();

          if (!currentConfirmation) {
            return;
          }

          if (currentConfirmation.actionKey === "approve") {
            handleApproveKyc(currentConfirmation.row);
            return;
          }

          handleRejectKyc(currentConfirmation.row, details);
        }}
      />
    </div>
  );
}


