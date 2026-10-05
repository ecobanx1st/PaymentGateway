import { ArrowRight, BadgeCheck, CreditCard, Landmark, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function UnderConstruction({
  title = "Page",
  description = "This workspace is ready, and the detailed page design will be added next.",
}) {
  return (
    <section className="grid min-h-[calc(100vh-132px)] place-items-center py-10">
      <div className="mx-auto grid w-full max-w-5xl items-center gap-8 lg:grid-cols-[1fr_420px]">
        <div className="space-y-5">
          <span className="inline-flex rounded-full border border-text-primary/30 bg-text-primary/10 px-3 py-1 text-small font-semibold text-text-primary">
            Under construction
          </span>
          <div className="space-y-3">
            <h1 className="max-w-xl text-3xl font-semibold leading-tight text-theme-text sm:text-4xl">
              {title} is being prepared
            </h1>
            <p className="max-w-xl text-mid leading-7 text-text-secondary">
              {description}
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-full [background:var(--button-primary)] px-5 py-2 text-mid font-medium text-white transition hover:brightness-110 active:brightness-95"
            >
              Go to settings
            </Link>
            <Link
              // href="/dashboard"
              href="/merchants"
              className="inline-flex items-center justify-center rounded-full border border-input-border bg-button-secondary px-5 py-2 text-mid font-medium text-theme-text transition hover:border-text-primary hover:bg-input-bg"
            >
              Open dashboard
            </Link>
          </div>
        </div>

        <div className="relative min-h-[320px] overflow-hidden rounded-rounded border border-input-border/40 bg-card-bg p-5 shadow-2xl shadow-black/30">
          <div className="absolute left-6 right-6 top-1/2 h-px bg-input-border/60" />
          <div className="absolute left-8 top-1/2 h-1 w-24 -translate-y-1/2 rounded-full [background:var(--button-primary)] [animation:payment-flow_2.4s_ease-in-out_infinite]" />

          <div className="relative z-10 flex h-full min-h-[280px] flex-col justify-between">
            <div className="flex justify-between gap-3">
              <div className="rounded-rounded border border-input-border/40 bg-input-bg p-4">
                <CreditCard className="mb-6 h-6 w-6 text-text-primary" />
                <p className="text-small text-text-secondary">Merchant</p>
                <p className="mt-1 text-large font-semibold text-theme-text">Payment</p>
              </div>
              <div className="rounded-rounded border border-input-border/40 bg-input-bg p-4 [animation:soft-lift_2.8s_ease-in-out_infinite]">
                <ShieldCheck className="mb-6 h-6 w-6 text-text-primary" />
                <p className="text-small text-text-secondary">Gateway</p>
                <p className="mt-1 text-large font-semibold text-theme-text">Routing</p>
              </div>
            </div>

            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-text-primary/30 bg-text-primary/10 text-text-primary [animation:pulse-ring_2s_ease-in-out_infinite]">
              <ArrowRight className="h-7 w-7" />
            </div>

            <div className="flex justify-between gap-3">
              <div className="rounded-rounded border border-input-border/40 bg-input-bg p-4 [animation:soft-lift_3.2s_ease-in-out_infinite]">
                <Landmark className="mb-6 h-6 w-6 text-text-primary" />
                <p className="text-small text-text-secondary">Settlement</p>
                <p className="mt-1 text-large font-semibold text-theme-text">Bank</p>
              </div>
              <div className="rounded-rounded border border-input-border/40 bg-input-bg p-4">
                <BadgeCheck className="mb-6 h-6 w-6 text-text-primary" />
                <p className="text-small text-text-secondary">Status</p>
                <p className="mt-1 text-large font-semibold text-theme-text">Secure</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
