import { Suspense } from "react";
import InvoicePreviewPageClient from "./InvoicePreviewPageClient";

export const metadata = {
  title: "Generated invoice",
};

function InvoicePreviewFallback() {
  return (
    <div className="rounded-[18px] border border-input-border bg-primary-bg p-6 text-sm text-secondary-text">
      Loading invoice preview...
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<InvoicePreviewFallback />}>
      <InvoicePreviewPageClient />
    </Suspense>
  );
}
