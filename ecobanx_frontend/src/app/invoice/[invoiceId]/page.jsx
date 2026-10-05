"use client";

import { Suspense } from "react";
import { useParams } from "next/navigation";
import InvoicePreview from "@/components/ui/InvoicePreview";

function InvoiceDetailClient() {
  const params = useParams();
  const raw = params?.invoiceId;
  const invoiceId = Array.isArray(raw) ? raw[0] : String(raw || "");

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
      <InvoicePreview invoiceId={invoiceId} />
    </main>
  );
}

function InvoiceDetailFallback() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
      <div className="rounded-[18px] border border-input-border bg-primary-bg p-6 text-sm text-secondary-text">
        Loading invoice...
      </div>
    </main>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<InvoiceDetailFallback />}>
      <InvoiceDetailClient />
    </Suspense>
  );
}
