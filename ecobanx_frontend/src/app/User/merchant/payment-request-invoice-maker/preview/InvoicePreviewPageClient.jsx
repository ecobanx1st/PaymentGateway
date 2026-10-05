"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import InvoicePreview from "@/components/ui/InvoicePreview";
import { normalizeInvoiceValues } from "@/lib/invoice-maker";

export default function InvoicePreviewPageClient() {
  const searchParams = useSearchParams();
  const invoice = useMemo(
    () => normalizeInvoiceValues(Object.fromEntries(searchParams.entries())),
    [searchParams],
  );

  return <InvoicePreview invoice={invoice} />;
}
