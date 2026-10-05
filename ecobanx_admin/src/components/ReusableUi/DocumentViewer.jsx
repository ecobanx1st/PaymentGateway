"use client";

import {
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  Eye,
  FileImage,
  FileQuestion,
  FileText,
  RotateCcw,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "gif"];
const PDF_EXTENSIONS = ["pdf"];
const MIN_ZOOM = 1;
const MAX_ZOOM = 5;

function getUrlExtension(value = "") {
  const clean = String(value).split("?")[0].split("#")[0];
  const match = clean.match(/\.([a-z0-9]+)$/i);
  return match ? match[1].toLowerCase() : "";
}

function isImageFile(file) {
  const mimeType = String(file.mimeType || "").toLowerCase();
  if (mimeType.startsWith("image/")) return true;
  return IMAGE_EXTENSIONS.includes(getUrlExtension(file.url));
}

function isPdfFile(file) {
  const mimeType = String(file.mimeType || "").toLowerCase();
  if (mimeType === "application/pdf") return true;
  return PDF_EXTENSIONS.includes(getUrlExtension(file.url));
}

function getDisplayName(file) {
  const value = String(file.name || file.label || "").trim();
  if (value) return value;

  const url = String(file.url || "").split("?")[0].split("#")[0];
  const segments = url.split("/").filter(Boolean);
  return segments.length > 0 ? decodeURIComponent(segments[segments.length - 1]) : "Document";
}

function formatUploadedAt(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function normalizeFiles(files) {
  return (files || [])
    .map((entry, index) => {
      if (!entry) return null;

      const file =
        typeof entry === "string"
          ? { url: entry, name: "", label: "", mimeType: "", status: "" }
          : {
              id: entry.id || `${index}`,
              name: entry.name || "",
              label: entry.label || "",
              url: entry.url || "",
              mimeType: entry.mimeType || "",
              status: entry.status || "",
              uploadedAt: entry.uploadedAt || null,
            };

      if (!file.url) return null;

      return {
        id: file.id || `${index}`,
        name: getDisplayName(file),
        url: file.url,
        mimeType: file.mimeType,
        status: file.status,
        uploadedAt: file.uploadedAt,
        isImage: isImageFile(file),
        isPdf: isPdfFile(file),
      };
    })
    .filter(Boolean);
}

function downloadFile(file, authToken = "") {
  const headers = authToken ? { Authorization: `Bearer ${authToken}` } : undefined;

  fetch(file.url, headers ? { headers } : undefined)
    .then((response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.blob();
    })
    .then((blob) => {
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = file.name || "document";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    })
    .catch(() => {
      window.open(file.url, "_blank", "noopener,noreferrer");
    });
}

function useAuthenticatedMediaUrl(url, authToken = "") {
  const [state, setState] = useState({ url: "", blobUrl: "" });

  useEffect(() => {
    let cancelled = false;
    let objectUrl = null;

    if (!url || !authToken) {
      return undefined;
    }

    fetch(url, { headers: { Authorization: `Bearer ${authToken}` } })
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.blob();
      })
      .then((blob) => {
        if (cancelled) return;
        if (objectUrl) URL.revokeObjectURL(objectUrl);
        objectUrl = URL.createObjectURL(blob);
        setState({ url, blobUrl: objectUrl });
      })
      .catch(() => {
        if (!cancelled) setState({ url: "", blobUrl: "" });
      });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [url, authToken]);

  return state.url === url ? state.blobUrl : url;
}

function SkeletonPreview() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-input-bg/60">
      <span className="block h-8 w-8 animate-pulse rounded-full bg-input-bg" />
      <span className="absolute inset-0 animate-pulse bg-input-bg/40" />
    </div>
  );
}

function BrokenPreview({ label }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-input-bg/40 px-4 text-center">
      <FileQuestion className="h-7 w-7 text-text-secondary" />
      <p className="text-small text-text-secondary">Preview unavailable</p>
      {label ? <p className="max-w-full truncate text-small text-text-secondary/70">{label}</p> : null}
    </div>
  );
}

function PdfPreview({ label, onPreview, allowFullscreen }) {
  return (
    <button
      type="button"
      onClick={onPreview}
      disabled={!allowFullscreen}
      className="group/preview absolute inset-0 flex h-full w-full flex-col items-center justify-center gap-2 bg-card-bg px-4 text-center transition hover:bg-input-bg/50 disabled:cursor-default"
      aria-label={`View PDF ${label}`}
    >
      <span className="grid h-11 w-11 place-items-center rounded-[10px] bg-text-primary/10 text-text-primary">
        <FileText className="h-5 w-5" />
      </span>
      <span className="rounded-full border border-input-border bg-input-bg px-2.5 py-1 text-small font-medium text-text-secondary group-hover/preview:text-theme-text">
        View PDF
      </span>
    </button>
  );
}

function DocumentCardPreview({ file, allowFullscreen, onPreview, authToken }) {
  const [imageState, setImageState] = useState("loading");
  const displayUrl = useAuthenticatedMediaUrl(file.url, authToken);

  if (file.isPdf) {
    return (
      <PdfPreview
        label={file.name}
        onPreview={() => onPreview(file)}
        allowFullscreen={allowFullscreen}
      />
    );
  }

  if (!file.isImage) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-4 text-center">
        <FileImage className="h-7 w-7 text-text-secondary" />
        <p className="text-small text-text-secondary">Unknown document type</p>
      </div>
    );
  }

  return (
    <>
      {imageState === "loading" ? <SkeletonPreview /> : null}
      {/* eslint-disable-next-line @next/next/no-img-element -- Backend document uploads are served from the API origin. */}
      <img
        src={displayUrl}
        alt={file.name}
        loading="lazy"
        onLoad={() => setImageState("loaded")}
        onError={() => setImageState("error")}
        className="absolute inset-0 h-full w-full object-contain p-2 transition duration-300 group-hover:scale-[1.02]"
      />
      {imageState === "error" ? <BrokenPreview label={file.name} /> : null}
      {allowFullscreen && imageState !== "error" ? (
        <button
          type="button"
          onClick={() => onPreview(file)}
          className="absolute inset-0 h-full w-full cursor-zoom-in"
          aria-label={`Preview ${file.name}`}
        />
      ) : null}
    </>
  );
}

function DocumentCard({ file, allowDownload, allowFullscreen, onPreview, authToken }) {
  const showPreviewButton = allowFullscreen && (file.isPdf || file.isImage);

  return (
    <article className="group flex flex-col overflow-hidden rounded-rounded border border-input-border/50 bg-card-bg transition duration-200 hover:-translate-y-0.5 hover:border-text-primary/40 hover:shadow-lg hover:shadow-black/30">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-card-bg">
        <DocumentCardPreview
          key={`${file.id}-${file.url}`}
          file={file}
          allowFullscreen={allowFullscreen}
          onPreview={onPreview}
          authToken={authToken}
        />

        {showPreviewButton ? (
          <button
            type="button"
            onClick={() => onPreview(file)}
            className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full border border-input-border bg-bg-primary/90 text-theme-text opacity-0 backdrop-blur transition group-hover:opacity-100 hover:border-text-primary hover:text-text-primary"
            aria-label={`Open ${file.name} in fullscreen`}
            title="Open in fullscreen"
          >
            <Eye className="h-3.5 w-3.5" />
          </button>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-3 border-t border-input-border/40 p-3">
        <div className="min-w-0">
          <p className="truncate text-mid font-semibold text-theme-text" title={file.name}>
            {file.name}
          </p>
          <p className="mt-1 flex flex-wrap items-center gap-x-2 text-small text-text-secondary">
            {file.status ? <span className="font-medium text-text-primary">{file.status}</span> : null}
            {formatUploadedAt(file.uploadedAt) ? <span>{formatUploadedAt(file.uploadedAt)}</span> : null}
          </p>
        </div>

        <div className="mt-auto flex items-center gap-2">
          {showPreviewButton ? (
            <button
              type="button"
              onClick={() => onPreview(file)}
              className="inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-[8px] border border-input-border bg-input-bg text-small font-medium text-theme-text transition hover:border-text-primary hover:text-text-primary"
            >
              <Eye className="h-3.5 w-3.5" />
              Preview
            </button>
          ) : null}
          {allowDownload ? (
            <button
              type="button"
              onClick={() => downloadFile(file, authToken)}
              className="inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-[8px] border border-input-border bg-input-bg text-small font-medium text-theme-text transition hover:border-text-primary hover:text-text-primary"
              title="Download"
            >
              <Download className="h-3.5 w-3.5" />
              Download
            </button>
          ) : null}
          <a
            href={file.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-[8px] border border-input-border bg-input-bg text-small font-medium text-theme-text transition hover:border-text-primary hover:text-text-primary"
            title="Open in new tab"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Open
          </a>
        </div>
      </div>
    </article>
  );
}

function ZoomableImage({ file, authToken }) {
  const containerRef = useRef(null);
  const [zoom, setZoom] = useState(MIN_ZOOM);
  const displayUrl = useAuthenticatedMediaUrl(file.url, authToken);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    function handleWheel(event) {
      event.preventDefault();
      setZoom((current) =>
        Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, current + (event.deltaY < 0 ? 0.25 : -0.25))),
      );
    }

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleWheel);
  }, []);

  const canZoomIn = zoom < MAX_ZOOM;
  const canZoomOut = zoom > MIN_ZOOM;

  return (
    <div className="flex h-full min-h-0 w-full flex-col">
      <div ref={containerRef} className="relative min-h-0 flex-1 overflow-auto bg-bg-primary">
        <div className="flex min-h-full min-w-full items-center justify-center p-4">
          {/* eslint-disable-next-line @next/next/no-img-element -- Backend document uploads are served from the API origin. */}
          <img
            src={displayUrl}
            alt={file.name}
            className="object-contain"
            style={{
              width: `${zoom * 100}%`,
              height: `${zoom * 100}%`,
              maxWidth: `${zoom * 100}%`,
              maxHeight: `${zoom * 100}%`,
            }}
          />
        </div>
      </div>

      <div className="flex shrink-0 items-center justify-center gap-2 border-t border-input-border/40 bg-card-bg px-4 py-3">
        <span className="mr-2 text-small text-text-secondary">Scroll to zoom</span>
        <button
          type="button"
          onClick={() => setZoom((current) => Math.max(MIN_ZOOM, current - 0.5))}
          disabled={!canZoomOut}
          className="inline-flex h-8 w-8 items-center justify-center rounded-[8px] border border-input-border bg-input-bg text-theme-text transition hover:border-text-primary hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Zoom out"
          title="Zoom out"
        >
          <ZoomOut className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => setZoom((current) => Math.min(MAX_ZOOM, current + 0.5))}
          disabled={!canZoomIn}
          className="inline-flex h-8 w-8 items-center justify-center rounded-[8px] border border-input-border bg-input-bg text-theme-text transition hover:border-text-primary hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Zoom in"
          title="Zoom in"
        >
          <ZoomIn className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => setZoom(MIN_ZOOM)}
          disabled={zoom === MIN_ZOOM}
          className="inline-flex h-8 items-center justify-center gap-1 rounded-[8px] border border-input-border bg-input-bg px-3 text-small font-medium text-theme-text transition hover:border-text-primary hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Reset zoom"
          title="Reset zoom"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset
        </button>
        <span className="ml-2 w-14 text-center text-small font-medium text-theme-text">
          {Math.round(zoom * 100)}%
        </span>
      </div>
    </div>
  );
}

function DocumentLightbox({ files, index, onClose, allowDownload = true, authToken }) {
  const [activeIndex, setActiveIndex] = useState(index || 0);
  const file = files[activeIndex] || null;
  const hasMultiple = files.length > 1;
  const pdfUrl = useAuthenticatedMediaUrl(file ? file.url : "", authToken);

  const goPrev = useCallback(() => {
    setActiveIndex((current) => (current - 1 + files.length) % files.length);
  }, [files.length]);

  const goNext = useCallback(() => {
    setActiveIndex((current) => (current + 1) % files.length);
  }, [files.length]);

  useEffect(() => {
    if (!file) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onClose?.();
      } else if (event.key === "ArrowRight") {
        goNext();
      } else if (event.key === "ArrowLeft") {
        goPrev();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [file, files.length, goNext, goPrev, onClose]);

  if (!file) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[95] flex flex-col bg-black/90">
      <div className="flex shrink-0 items-center justify-between gap-4 border-b border-input-border/40 px-4 py-3 sm:px-5">
        <div className="min-w-0">
          <h2 className="truncate text-mid font-semibold text-theme-text">{file.name}</h2>
          <p className="mt-0.5 text-small text-text-secondary">
            {hasMultiple ? `${activeIndex + 1} of ${files.length}` : "Document preview"}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {allowDownload ? (
            <button
              type="button"
              onClick={() => downloadFile(file, authToken)}
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-[8px] border border-input-border bg-input-bg px-3 text-small font-medium text-theme-text transition hover:border-text-primary hover:text-text-primary"
              title="Download"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Download</span>
            </button>
          ) : null}
          <a
            href={file.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-[8px] border border-input-border bg-input-bg px-3 text-small font-medium text-theme-text transition hover:border-text-primary hover:text-text-primary"
            title="Open in new tab"
          >
            <ExternalLink className="h-4 w-4" />
            <span className="hidden sm:inline">Open</span>
          </a>
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-[8px] border border-input-border bg-input-bg text-theme-text transition hover:border-red-400/60 hover:text-red-300"
            aria-label="Close preview"
            title="Close (Esc)"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="relative min-h-0 flex-1">
        {file.isPdf ? (
          <iframe
            src={pdfUrl}
            title={file.name}
            className="h-full w-full bg-bg-primary"
          />
        ) : file.isImage ? (
          <ZoomableImage key={`${file.id}-${file.url}`} file={file} authToken={authToken} />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
            <FileQuestion className="h-10 w-10 text-text-secondary" />
            <p className="text-mid text-text-secondary">Preview is not available for this file type.</p>
            <a
              href={file.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9 items-center gap-1.5 rounded-[8px] border border-input-border bg-input-bg px-4 text-small font-medium text-theme-text transition hover:border-text-primary hover:text-text-primary"
            >
              <ExternalLink className="h-4 w-4" />
              Open document
            </a>
          </div>
        )}

        {hasMultiple ? (
          <>
            <button
              type="button"
              onClick={goPrev}
              className="absolute left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-input-border bg-bg-primary/80 text-theme-text backdrop-blur transition hover:border-text-primary hover:text-text-primary"
              aria-label="Previous document"
              title="Previous (Left arrow)"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={goNext}
              className="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-input-border bg-bg-primary/80 text-theme-text backdrop-blur transition hover:border-text-primary hover:text-text-primary"
              aria-label="Next document"
              title="Next (Right arrow)"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}

export default function DocumentViewer({
  files,
  allowDownload = true,
  allowFullscreen = true,
  readOnly = false,
  authToken = "",
  emptyText = "No documents uploaded",
  className = "",
}) {
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const normalizedFiles = useMemo(() => normalizeFiles(files), [files]);

  if (!normalizedFiles.length) {
    return (
      <div className={`flex flex-col items-center justify-center gap-2 rounded-rounded border border-dashed border-input-border/60 bg-input-bg/30 px-4 py-8 text-center ${className}`}>
        <FileImage className="h-6 w-6 text-text-secondary" />
        <p className="text-small text-text-secondary">{emptyText}</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {normalizedFiles.map((file) => (
          <DocumentCard
            key={file.id}
            file={file}
            allowDownload={allowDownload}
            allowFullscreen={allowFullscreen}
            authToken={authToken}
            onPreview={setLightboxIndex}
          />
        ))}
      </div>

      {allowFullscreen && lightboxIndex !== null ? (
        <DocumentLightbox
          files={normalizedFiles}
          index={lightboxIndex}
          allowDownload={allowDownload}
          authToken={authToken}
          onClose={() => setLightboxIndex(null)}
        />
      ) : null}
    </div>
  );
}

export { DocumentLightbox };
