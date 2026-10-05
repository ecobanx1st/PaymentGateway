"use client";

import { DocumentLightbox } from "./DocumentViewer";

export default function DocumentPreviewModal({ preview, onClose, authToken = "" }) {
  if (!preview?.url) {
    return null;
  }

  return (
    <DocumentLightbox
      files={[{ name: preview.label || "Document preview", url: preview.url }]}
      index={0}
      onClose={onClose}
      authToken={authToken}
    />
  );
}
