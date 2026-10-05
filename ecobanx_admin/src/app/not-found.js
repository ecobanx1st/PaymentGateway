import { CircleSlash2, CreditCard, Home, RotateCw } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <section className="grid min-h-[calc(100vh-132px)] place-items-center py-10">
      <div className="mx-auto grid w-full max-w-5xl items-center gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-5">
          <span className="inline-flex rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-small font-semibold text-red-400">
            404 route not found
          </span>
          <div className="space-y-3">
            <h1 className="max-w-xl text-3xl font-semibold leading-tight text-theme-text sm:text-4xl">
              This payment route does not exist
            </h1>
            <p className="max-w-xl text-mid leading-7 text-text-secondary">
              The page you requested is not available in the Eco Banx admin routes.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center gap-2 rounded-full [background:var(--button-primary)] px-5 py-2 text-mid font-medium text-white transition hover:brightness-110 active:brightness-95"
            >
              <Home className="h-4 w-4" />
              Back to login
            </Link>
            <Link
              // href="/dashboard"
              href="/merchants"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-input-border bg-button-secondary px-5 py-2 text-mid font-medium text-theme-text transition hover:border-text-primary hover:bg-input-bg"
            >
              <RotateCw className="h-4 w-4" />
              Try dashboard
            </Link>
          </div>
        </div>

        <div className="relative min-h-[300px] overflow-hidden rounded-rounded border border-input-border/40 bg-card-bg p-6 shadow-2xl shadow-black/30">
          <div className="absolute left-0 top-16 h-px w-full bg-input-border/50" />
          <div className="absolute left-8 top-16 h-1 w-20 rounded-full bg-red-500 [animation:payment-flow_2.2s_ease-in-out_infinite]" />
          <div className="relative z-10 flex min-h-[248px] flex-col items-center justify-center gap-5 text-center">
            <div className="grid h-24 w-24 place-items-center rounded-rounded border border-red-500/30 bg-red-500/10 text-red-400 [animation:pulse-ring_2s_ease-in-out_infinite]">
              <CircleSlash2 className="h-11 w-11" />
            </div>
            <div className="rounded-rounded border border-input-border/40 bg-input-bg p-4 text-left">
              <CreditCard className="mb-5 h-6 w-6 text-text-secondary" />
              <p className="text-small text-text-secondary">Route check</p>
              <p className="mt-1 text-large font-semibold text-theme-text">Transaction declined</p>
            </div>
            <p className="text-small text-text-secondary">Error code: 404</p>
          </div>
        </div>
      </div>
    </section>
  );
}

