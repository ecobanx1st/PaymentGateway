"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useRef, useState } from "react";
import { ImageUp, Trash2 } from "lucide-react";
import Button from "./button";

const supportedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/svg+xml"];

export default function Upload({
  label = "Upload",
  value = null,
  onChange,
  onRemove,
  accept = supportedTypes.join(","),
  className = "",
}) {
  const inputRef = useRef(null);
  const [error, setError] = useState("");

  const previewData = useMemo(() => {
    if (!value) {
      return { previewUrl: "", fileName: "", objectUrl: "" };
    }

    if (typeof value === "string") {
      return {
        previewUrl: value,
        fileName: value.split("/").pop() || "Uploaded image",
        objectUrl: "",
      };
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
      if (previewData.objectUrl) {
        URL.revokeObjectURL(previewData.objectUrl);
      }
    };
  }, [previewData.objectUrl]);

  const handleFileChange = (event) => {
    const nextFile = event.target.files?.[0] || null;

    if (!nextFile) return;

    if (!supportedTypes.includes(nextFile.type)) {
      setError("Please upload a PNG, JPG, WEBP, or SVG file.");
      return;
    }

    setError("");
    onChange?.(nextFile);
  };

  const handleRemove = () => {
    setError("");
    onRemove?.();

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
      />

      {previewData.previewUrl ? (
        <div className="flex flex-col gap-3 rounded-2xl border border-input-border bg-secondary-bg/40 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-input-border bg-primary-bg">
              <img src={previewData.previewUrl} alt={previewData.fileName} className="h-full w-full object-cover" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-theme-text">{previewData.fileName}</p>
              <p className="text-xs text-secondary-text">Preview ready for upload</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              value="Replace image"
              onClick={() => inputRef.current?.click()}
              rightIcon={<ImageUp size={15} />}
              className="text-theme-text"
            />
            <Button
              value="Remove"
              onClick={handleRemove}
              rightIcon={<Trash2 size={15} />}
              className="text-theme-text"
            />
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex w-full flex-col items-center justify-center rounded-2xl border border-dashed border-input-border bg-input-bg/50 px-4 py-6 text-center transition hover:border-primary hover:bg-primary/5"
        >
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <ImageUp size={20} />
          </span>
          <span className="mt-3 text-sm font-semibold text-theme-text">{label}</span>
          <span className="mt-1 text-xs text-secondary-text">
            PNG, JPG, WEBP, or SVG up to a small web-friendly size.
          </span>
        </button>
      )}

      {error ? <p className="text-xs font-medium text-danger">{error}</p> : null}
    </div>
  );
}
