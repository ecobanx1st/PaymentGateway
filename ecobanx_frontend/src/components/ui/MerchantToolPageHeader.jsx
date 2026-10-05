"use client";

import { ArrowLeft, Store } from "lucide-react";
import { useRouter } from "next/navigation";
import PageTopBanner from "@/components/ui/PageTopBanner";

export default function MerchantToolPageHeader({
  title,
  description = "",
  icon: Icon = Store,
  backHref = "/User/merchant",
  backLabel = "Back to Merchant Tools",
  actions = null,
  className = "",
}) {
  const router = useRouter();

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }

    router.push(backHref);
  };

  return (
    <PageTopBanner
      title={title}
      description={description}
      actions={actions}
      className={className}
      leading={
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleBack}
            aria-label={backLabel}
            title={backLabel}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-input-border bg-input-bg text-secondary-text transition hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
          >
            <ArrowLeft size={18} />
          </button>

          <span className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-input-bg text-primary shadow-sm sm:flex">
            <Icon size={24} aria-hidden="true" />
          </span>
        </div>
      }
    />
  );
}
