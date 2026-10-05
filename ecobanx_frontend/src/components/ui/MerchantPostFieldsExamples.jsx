"use client";

import { ArrowLeft, BookOpen } from "lucide-react";
import Button from "@/components/ui/button";
import MerchantToolPageHeader from "@/components/ui/MerchantToolPageHeader";
import { ECO_BANX_LOGO_DATA_URL } from "@/lib/merchant-button-utils";
import { MERCHANT_BUTTON_ROUTES } from "@/lib/merchant-button-config";

function LogoPreview() {
  return (
    <div className="mt-4 inline-flex items-center gap-2 text-[11px] font-bold text-theme-text">
      <span>Pay using</span>
      {/* eslint-disable-next-line @next/next/no-img-element -- Bundled brand asset is provided as a resolved URL. */}
      <img src={ECO_BANX_LOGO_DATA_URL} alt="Eco Banx" className="h-5 w-[82px] object-contain" />
    </div>
  );
}

function PrimaryButtonPreview() {
  return (
    <div className="mt-4 min-w-0">
      <button
        type="button"
        className="inline-flex min-h-11 w-full max-w-full flex-wrap items-center justify-center gap-x-3 gap-y-2 rounded-[10px] border-0 bg-[#0500FF] px-4 py-2.5 text-xs font-bold text-white shadow-[0_14px_32px_rgba(5,0,255,0.24)] transition hover:bg-[#0400CC] sm:w-fit sm:flex-nowrap"
      >
        <span className="min-w-0 break-words text-center leading-tight">Pay using</span>
        {/* eslint-disable-next-line @next/next/no-img-element -- Bundled brand asset is provided as a resolved URL. */}
        <img
          src={ECO_BANX_LOGO_DATA_URL}
          alt="Eco Banx"
          className="h-[28px] w-[min(118px,42vw)] min-w-0 shrink object-contain sm:h-[31px] sm:w-[118px] sm:shrink-0"
        />
      </button>
    </div>
  );
}

function ExamplePreview({ variant }) {
  if (variant === "primaryButton") return <PrimaryButtonPreview />;
  // return <LogoPreview />;
}

function CodeExample({ title, code, textareaClassName = "", previewVariant }) {
  return (
    <section className="min-w-0 space-y-2">
      <h2 className="text-base font-bold text-theme-text sm:text-lg">{title}</h2>
      <textarea
        readOnly
        value={code}
        data-lenis-prevent="true"
        className={`min-h-[210px] w-full min-w-0 resize-y rounded-[4px] border border-input-border bg-input-bg px-3 py-3 font-mono text-[11px] leading-5 text-theme-text outline-none focus:ring-2 focus:ring-primary/20 sm:px-4 sm:text-xs ${textareaClassName}`}
        aria-label={`${title} HTML POST code`}
      />
      <ExamplePreview variant={previewVariant} />
    </section>
  );
}

export default function MerchantPostFieldsExamples({
  title,
  description = "",
  examples,
  previewVariant = "primaryButton",
  panelClassName = "",
  textareaClassName = "",
}) {
  return (
    <div className="mx-auto flex w-full min-w-0 max-w-6xl flex-col gap-6 pb-8">
      <MerchantToolPageHeader
        title={title}
        description={description}
        icon={BookOpen}
      />

      <div className={`min-w-0 rounded-[20px] border border-input-border bg-primary-bg px-3 py-5 shadow-[0_20px_50px_rgba(8,19,12,0.08)] sm:px-8 sm:py-6 lg:px-10 ${panelClassName}`}>
        <div className="space-y-6">
          {examples.map((example) => (
            <CodeExample
              key={example.title}
              title={example.title}
              code={example.code}
              previewVariant={example.previewVariant || previewVariant}
              textareaClassName={example.textareaClassName || textareaClassName}
            />
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <Button
            value="Back To Merchant Tool"
            onNavigate={MERCHANT_BUTTON_ROUTES.tools}
            icon={<ArrowLeft size={16} />}
            className="w-full max-w-sm text-theme-text"
          />
        </div>
      </div>
    </div>
  );
}
