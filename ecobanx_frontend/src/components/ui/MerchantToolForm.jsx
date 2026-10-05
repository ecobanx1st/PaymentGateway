"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Copy, Download, LockKeyhole, UploadCloud, X } from "lucide-react";
import Button from "./button";
import Dropdown from "./dropdown";
import Input from "./input";
import Modal from "./Modal";
import Toggle from "./Toggle";

const supportedImageTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/svg+xml"];

export function MerchantToolFormLayout({ children, className = "" }) {
  return (
    <section
      className={`border border-input-border bg-primary-bg rounded-[15px] p-4 sm:p-6 lg:p-7 ${className}`}
    >
      <div className="hidden grid-cols-[minmax(0,0.95fr)_minmax(0,1.9fr)_auto] gap-6 rounded-full border border-input-border bg-input-bg px-5 py-4 text-[14px] font-semibold uppercase tracking-[0.1em] text-theme-text lg:grid">
        <span>Item</span>
        <span>Value</span>
        <span className="justify-self-end">Required?</span>
      </div>

      <div className="space-y-0 px-0 py-4 sm:px-2 lg:px-5 lg:py-2">
        {children}
      </div>
    </section>
  );
}

export function MerchantToolSection({ children }) {
  return <div className="contents">{children}</div>;
}

export function RequiredFieldControl({
  checked = false,
  disabled = false,
  locked = false,
  onChange,
  label,
}) {
  if (locked) {
    return (
      <span className="inline-flex items-center gap-2 rounded-full  px-3 py-0.5 text-xs font-semibold text-primary">
        <LockKeyhole size={13} />
        Required
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-primary-bg px-3 py-1.5">
      <Toggle
        checked={checked}
        disabled={disabled}
        onChange={onChange}
        size="md"
        ariaLabel={label}
      />
      <span className="text-xs font-semibold text-secondary-text">
        {checked ? "Yes" : "No"}
      </span>
    </span>
  );
}

export function MerchantFieldRow({
  fieldId,
  label,
  description = "",
  requiredControl = null,
  error = "",
  children,
  rowRef,
}) {
  return (
    <div
      id={fieldId ? `merchant-field-${fieldId}` : undefined}
      ref={rowRef}
      className="px-4 py-3 sm:px-5 lg:px-0 lg:py-4"
    >
      <div className="grid gap-3 overflow-visible lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.9fr)_auto] lg:gap-6">
        <div className="min-w-0">
          <p className="text-sm font-semibold tracking-tight text-theme-text sm:text-[15px]">
            {label}
          </p>
          {description ? (
            <p className="mt-1 text-xs leading-5 text-secondary-text">
              {description}
            </p>
          ) : null}
        </div>

        <div className="min-w-0 space-y-2">
          {children}
          {error ? (
            <p className="text-xs font-medium text-red-400" role="alert">
              {error}
            </p>
          ) : null}
          {requiredControl ? <div className="lg:hidden">{requiredControl}</div> : null}
        </div>

        <div className="hidden justify-end lg:flex">
          {requiredControl || (
            <span className="inline-flex text-xs font-semibold text-primary-text">
              N/A
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export function CurrencyField({
  amount,
  currency,
  options,
  onAmountChange,
  onCurrencyChange,
  placeholder = "0",
  disabled = false,
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <Input
        value={amount}
        onChange={(event) => onAmountChange?.(event.target.value)}
        placeholder={placeholder}
        inputMode="decimal"
        rounded="rounded-full"
        className="w-full flex-1"
        inputClassName="!border-0"
        disabled={disabled}
      />
      <Dropdown
        value={currency}
        onChange={onCurrencyChange}
        options={options}
        searchable={false}
        clearable={false}
        className="w-full rounded-full sm:w-28 lg:w-32"
        triggerClassName={`!border-0 ${disabled ? "pointer-events-none opacity-60" : ""}`}
      />
    </div>
  );
}

export function ImageUploadField({
  label = "Upload button image",
  value = null,
  onChange,
  onRemove,
  onError,
  error = "",
  maxSizeBytes = 2 * 1024 * 1024,
}) {
  const inputRef = useRef(null);
  const [localError, setLocalError] = useState("");

  const previewData = useMemo(() => {
    if (!value) return { previewUrl: "", fileName: "", objectUrl: "" };

    if (typeof value === "string") {
      return { previewUrl: value, fileName: "Uploaded image", objectUrl: "" };
    }

    const objectUrl = URL.createObjectURL(value);
    return {
      previewUrl: objectUrl,
      fileName: value.name || "Uploaded image",
      objectUrl,
    };
  }, [value]);

  useEffect(() => {
    return () => {
      if (previewData.objectUrl) URL.revokeObjectURL(previewData.objectUrl);
    };
  }, [previewData.objectUrl]);

  const setUploadError = (message) => {
    setLocalError(message);
    onError?.(message);
  };

  const handleFileChange = (event) => {
    const nextFile = event.target.files?.[0] || null;
    if (!nextFile) return;

    if (!supportedImageTypes.includes(nextFile.type)) {
      setUploadError("Please upload a PNG, JPG, JPEG, SVG, or WEBP image.");
      return;
    }

    if (nextFile.size > maxSizeBytes) {
      const maxSizeMb = Math.round((maxSizeBytes / 1024 / 1024) * 10) / 10;
      setUploadError(`Please upload an image smaller than ${maxSizeMb} MB.`);
      return;
    }

    setUploadError("");
    onChange?.(nextFile);
  };

  const handleRemove = () => {
    setUploadError("");
    onRemove?.();
    if (inputRef.current) inputRef.current.value = "";
  };

  const displayError = localError || error;

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept={supportedImageTypes.join(",")}
        onChange={handleFileChange}
        aria-label={label}
        className="hidden"
      />

      {previewData.previewUrl ? (
        <div className="flex flex-col gap-3 rounded-2xl border border-input-border bg-secondary-bg/40 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-input-border bg-primary-bg">
              {/* eslint-disable-next-line @next/next/no-img-element -- Blob and data URL previews are browser-local values. */}
              <img
                src={previewData.previewUrl}
                alt={previewData.fileName}
                className="h-full w-full object-contain"
              />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-theme-text">
                {previewData.fileName}
              </p>
              <p className="text-xs text-secondary-text">
                Logo will appear before the payment text.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              value="Replace"
              onClick={() => inputRef.current?.click()}
              className="text-theme-text"
            />
            <Button value="Remove" onClick={handleRemove} className="text-theme-text" />
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex w-full flex-col items-center justify-center rounded-2xl border border-dashed border-input-border bg-input-bg/50 px-4 py-6 text-center transition hover:border-primary hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
        >
          <UploadCloud size={22} className="mb-2 text-primary" />
          <span className="text-sm font-semibold text-theme-text">{label}</span>
          <span className="mt-1 text-xs text-secondary-text">
            PNG, JPG, JPEG, SVG, or WEBP up to 2 MB.
          </span>
        </button>
      )}

      {displayError ? (
        <p className="text-xs font-medium text-danger" role="alert">
          {displayError}
        </p>
      ) : null}
    </div>
  );
}

export function CodePreview({ code, className = "" }) {
  return (
    <pre className={`max-h-[48vh] overflow-auto rounded-[14px] border border-input-border bg-card-bg p-4 text-xs leading-5 text-theme-text shadow-inner ${className}`}>
      <code>{code}</code>
    </pre>
  );
}

export function FormActionBar({ children }) {
  return <div className="mt-6 flex justify-center">{children}</div>;
}

export function GeneratedCodeModal({
  open,
  html,
  previewHtml,
  onClose,
  onCopy,
  onDownload,
}) {
  return (
    <Modal
      open={open}
      title="Generated Payment Button"
      description="Review the customer-facing preview and copy or download the standalone HTML."
      onClose={onClose}
      className="max-w-4xl"
    >
      <div className="flex min-h-0 flex-col gap-4">
        <section className="rounded-[16px] border border-input-border bg-input-bg/45 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-sm font-bold text-theme-text">Preview</h3>
            <p className="text-xs leading-5 text-secondary-text">
              This is the payment button customers will see.
            </p>
          </div>
          <div className="mt-3 overflow-hidden rounded-[14px] border border-input-border bg-card-bg">
            <iframe
              title="Generated payment button preview"
              srcDoc={previewHtml}
              sandbox="allow-forms"
              className="h-32 w-full bg-white sm:h-36"
            />
          </div>
        </section>

        <section className="min-w-0 rounded-[16px] border border-input-border bg-input-bg/45 p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-sm font-bold text-theme-text">HTML code</h3>
            <p className="text-xs leading-5 text-secondary-text">
              Scroll to review the full standalone snippet.
            </p>
          </div>
          <div className="mt-3 min-w-0">
            <CodePreview code={html} className="h-[min(46vh,420px)] max-h-none" />
          </div>
        </section>

        <div className="mt-5 flex shrink-0 flex-col-reverse gap-3 border-t border-input-border pt-4 sm:flex-row sm:justify-end">
          <Button
            value="Close"
            onClick={onClose}
            rightIcon={<X size={16} />}
            className="w-full text-theme-text sm:w-auto"
          />
          <Button
            value="Copy Code"
            onClick={onCopy}
            rightIcon={<Copy size={16} />}
            className="w-full text-theme-text sm:w-auto"
          />
          <Button
            value="Download HTML"
            variant="primary"
            onClick={onDownload}
            rightIcon={<Download size={16} />}
            className="w-full border-0 text-white sm:w-auto"
          />
        </div>
      </div>
    </Modal>
  );
}
