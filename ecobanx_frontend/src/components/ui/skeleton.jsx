const DEFAULT_VARIANT = "dashboard";

function SkeletonBlock({ className = "", style }) {
  return (
    <div
      className={`animate-pulse rounded-2xl bg-secondary-bg ${className}`}
      style={style}
    />
  );
}

function Panel({ children, className = "" }) {
  return (
    <div
      className={`rounded-[18px] border border-input-border bg-primary-bg p-4 shadow-[0_14px_30px_rgba(8,19,12,0.05)] sm:p-5 ${className}`}
    >
      {children}
    </div>
  );
}

function Header() {
  return (
    <div className="rounded-[22px] border border-input-border bg-primary-bg p-5 shadow-[0_16px_36px_rgba(8,19,12,0.06)] sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1 space-y-3">
          <SkeletonBlock className="h-7 w-44 max-w-full rounded-full" />
          <SkeletonBlock className="h-4 w-full max-w-xl rounded-full" />
          <SkeletonBlock className="h-4 w-2/3 max-w-md rounded-full" />
        </div>
        <div className="flex shrink-0 gap-2">
          <SkeletonBlock className="h-10 w-28 rounded-full" />
          <SkeletonBlock className="hidden h-10 w-10 rounded-full sm:block" />
        </div>
      </div>
    </div>
  );
}

function TableSkeleton({ rows = 5 }) {
  return (
    <Panel>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <SkeletonBlock className="h-5 w-44 rounded-full" />
          <SkeletonBlock className="h-4 w-64 max-w-full rounded-full" />
        </div>
        <div className="flex gap-2">
          <SkeletonBlock className="h-10 w-40 rounded-full" />
          <SkeletonBlock className="h-10 w-28 rounded-full" />
        </div>
      </div>
      <div className="mt-5 grid grid-cols-[1.2fr_0.9fr_0.8fr_0.8fr] gap-3 border-b border-input-border pb-3 max-sm:hidden">
        {Array.from({ length: 4 }).map((_, index) => (
          <SkeletonBlock key={index} className="h-3 rounded-full" />
        ))}
      </div>
      <div className="mt-4 space-y-3">
        {Array.from({ length: rows }).map((_, index) => (
          <div
            key={index}
            className="grid gap-3 rounded-[14px] border border-input-border/60 bg-input-bg/40 p-3 sm:grid-cols-[1.2fr_0.9fr_0.8fr_0.8fr]"
          >
            <SkeletonBlock className="h-4 rounded-full" />
            <SkeletonBlock className="h-4 rounded-full" />
            <SkeletonBlock className="h-4 rounded-full" />
            <SkeletonBlock className="h-4 rounded-full" />
          </div>
        ))}
      </div>
    </Panel>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-5 pb-4">
      <Header />
      <div className="grid items-stretch gap-5 xl:grid-cols-[minmax(0,1.05fr)_minmax(390px,0.95fr)]">
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Panel key={index} className="flex min-h-[170px] flex-col justify-between">
              <SkeletonBlock className="h-10 w-10 rounded-[14px]" />
              <div className="space-y-3">
                <SkeletonBlock className="h-8 w-32 rounded-full" />
                <SkeletonBlock className="h-4 w-40 max-w-full rounded-full" />
              </div>
            </Panel>
          ))}
        </div>

        <div className="space-y-3">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="space-y-2">
              <SkeletonBlock className="h-5 w-32 rounded-full" />
              <SkeletonBlock className="h-4 w-56 rounded-full" />
            </div>
            <SkeletonBlock className="h-8 w-20 rounded-full" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <Panel key={index} className="min-h-[116px]">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <SkeletonBlock className="h-9 w-9 rounded-full" />
                    <div className="space-y-2">
                      <SkeletonBlock className="h-4 w-24 rounded-full" />
                      <SkeletonBlock className="h-3 w-12 rounded-full" />
                    </div>
                  </div>
                  <SkeletonBlock className="h-6 w-14 rounded-full" />
                </div>
                <div className="mt-5 flex items-end justify-between gap-3">
                  <SkeletonBlock className="h-5 w-28 rounded-full" />
                  <SkeletonBlock className="h-1.5 w-12 rounded-full" />
                </div>
              </Panel>
            ))}
          </div>
        </div>
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.85fr)]">
        <Panel>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-2">
              <SkeletonBlock className="h-5 w-36 rounded-full" />
              <SkeletonBlock className="h-4 w-60 max-w-full rounded-full" />
            </div>
            <div className="flex gap-3">
              <SkeletonBlock className="h-3 w-24 rounded-full" />
              <SkeletonBlock className="h-3 w-20 rounded-full" />
            </div>
          </div>
          <SkeletonBlock className="mt-6 h-72 w-full rounded-[16px]" />
        </Panel>
        <Panel>
          <div className="space-y-3">
            <SkeletonBlock className="h-5 w-32 rounded-full" />
            <SkeletonBlock className="h-10 w-44 rounded-full" />
            <SkeletonBlock className="h-4 w-56 max-w-full rounded-full" />
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <SkeletonBlock key={index} className="h-28 rounded-[16px]" />
            ))}
          </div>
        </Panel>
      </div>

      <TableSkeleton rows={5} />
    </div>
  );
}

function WalletSkeleton() {
  return (
    <div className="space-y-5 pb-4">
      <Header />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <Panel key={index} className="p-4">
            <SkeletonBlock className="h-10 w-10 rounded-full" />
            <SkeletonBlock className="mt-4 h-4 w-28 rounded-full" />
            <SkeletonBlock className="mt-3 h-8 w-32 rounded-full" />
          </Panel>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,0.95fr)_minmax(360px,0.55fr)]">
        <Panel>
          <SkeletonBlock className="h-5 w-36 rounded-full" />
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <SkeletonBlock className="h-12 w-full rounded-full" />
            <SkeletonBlock className="h-12 w-full rounded-full" />
            <SkeletonBlock className="h-12 w-full rounded-full sm:col-span-2" />
            <SkeletonBlock className="h-28 w-full rounded-[18px] sm:col-span-2" />
          </div>
        </Panel>
        <Panel>
          <SkeletonBlock className="h-5 w-32 rounded-full" />
          <SkeletonBlock className="mx-auto mt-6 h-44 w-44 rounded-[18px]" />
          <SkeletonBlock className="mt-5 h-11 w-full rounded-full" />
        </Panel>
      </div>
    </div>
  );
}

function MerchantSkeleton() {
  return (
    <div className="space-y-5 pb-4">
      <Header />
      <Panel className="min-h-[220px]">
        <div className="grid gap-5 lg:grid-cols-[0.75fr_1.25fr] lg:items-center">
          <SkeletonBlock className="h-40 w-full rounded-[18px]" />
          <div className="space-y-3">
            <SkeletonBlock className="h-6 w-52 max-w-full rounded-full" />
            <SkeletonBlock className="h-4 w-full max-w-xl rounded-full" />
            <SkeletonBlock className="h-4 w-4/5 rounded-full" />
            <div className="flex flex-wrap gap-2 pt-2">
              <SkeletonBlock className="h-10 w-32 rounded-full" />
              <SkeletonBlock className="h-10 w-32 rounded-full" />
            </div>
          </div>
        </div>
      </Panel>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Panel key={index} className="min-h-[150px]">
            <SkeletonBlock className="h-11 w-11 rounded-[14px]" />
            <SkeletonBlock className="mt-5 h-5 w-40 rounded-full" />
            <SkeletonBlock className="mt-3 h-4 w-full rounded-full" />
            <SkeletonBlock className="mt-2 h-4 w-2/3 rounded-full" />
          </Panel>
        ))}
      </div>
    </div>
  );
}

function ApiKeysSkeleton() {
  return (
    <div className="space-y-5 pb-4">
      <Header />
      <div className="grid gap-4 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Panel key={index}>
            <SkeletonBlock className="h-4 w-32 rounded-full" />
            <SkeletonBlock className="mt-4 h-9 w-24 rounded-full" />
          </Panel>
        ))}
      </div>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
        <TableSkeleton rows={5} />
        <Panel>
          <SkeletonBlock className="h-5 w-40 rounded-full" />
          <SkeletonBlock className="mt-3 h-4 w-60 max-w-full rounded-full" />
          <div className="mt-6 space-y-3">
            <SkeletonBlock className="h-11 w-full rounded-full" />
            <SkeletonBlock className="h-11 w-full rounded-full" />
            <SkeletonBlock className="h-32 w-full rounded-[16px]" />
            <SkeletonBlock className="h-11 w-full rounded-full" />
          </div>
        </Panel>
      </div>
    </div>
  );
}

function SecuritySkeleton() {
  return (
    <div className="space-y-5 pb-4">
      <Header />
      <div className="grid gap-4 xl:grid-cols-[1fr_0.95fr]">
        <div className="space-y-4">
          <Panel>
            <SkeletonBlock className="h-5 w-36 rounded-full" />
            <div className="mt-5 space-y-3">
              <SkeletonBlock className="h-11 w-full rounded-full" />
              <SkeletonBlock className="h-11 w-full rounded-full" />
              <SkeletonBlock className="h-11 w-full rounded-full" />
            </div>
          </Panel>

          <Panel>
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-2">
                <SkeletonBlock className="h-5 w-48 rounded-full" />
                <SkeletonBlock className="h-4 w-60 max-w-full rounded-full" />
              </div>
              <SkeletonBlock className="h-9 w-20 rounded-full" />
            </div>
            <div className="mt-5 space-y-3">
              <SkeletonBlock className="h-20 w-full rounded-[16px]" />
              <SkeletonBlock className="h-20 w-full rounded-[16px]" />
            </div>
          </Panel>
        </div>

        <div className="space-y-4">
          <Panel>
            <SkeletonBlock className="h-5 w-32 rounded-full" />
            <div className="mt-5 space-y-3">
              <SkeletonBlock className="h-11 w-full rounded-full" />
              <SkeletonBlock className="h-11 w-full rounded-full" />
              <SkeletonBlock className="h-11 w-full rounded-full" />
            </div>
          </Panel>

          <TableSkeleton rows={4} />
        </div>
      </div>
    </div>
  );
}

function HistorySkeleton() {
  return (
    <div className="space-y-5 pb-4">
      <Header />
      <Panel>
        <div className="flex justify-end">
          <div className="flex flex-wrap gap-2">
            <SkeletonBlock className="h-10 w-24 rounded-[12px]" />
            <SkeletonBlock className="h-10 w-24 rounded-[12px]" />
            <SkeletonBlock className="h-10 w-24 rounded-[12px]" />
            <SkeletonBlock className="h-10 w-24 rounded-[12px]" />
          </div>
        </div>
        <div className="mt-5 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <SkeletonBlock className="h-11 w-full max-w-md rounded-full" />
          <div className="flex flex-wrap gap-2">
            <SkeletonBlock className="h-11 w-36 rounded-full" />
            <SkeletonBlock className="h-11 w-36 rounded-full" />
            <SkeletonBlock className="h-11 w-36 rounded-full" />
          </div>
        </div>
      </Panel>
      <TableSkeleton rows={6} />
    </div>
  );
}

function FaqSkeleton() {
  return (
    <div className="space-y-5 pb-4">
      <Header />
      <Panel>
        <div className="space-y-2">
          <SkeletonBlock className="h-5 w-40 rounded-full" />
          <SkeletonBlock className="h-4 w-56 max-w-full rounded-full" />
        </div>
      </Panel>
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Panel key={index}>
            <div className="space-y-2">
              <SkeletonBlock className="h-5 w-40 rounded-full" />
              <SkeletonBlock className="h-4 w-full rounded-full" />
            </div>

            <div className="mt-4 flex gap-2">
              <SkeletonBlock className="h-11 flex-1 rounded-full" />
              <SkeletonBlock className="h-11 w-12 rounded-full" />
            </div>
          </Panel>
        ))}
      </div>
      <Panel>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <SkeletonBlock className="h-5 w-40 rounded-full" />
            <SkeletonBlock className="h-4 w-56 max-w-full rounded-full" />
          </div>
          <SkeletonBlock className="h-9 w-28 rounded-full" />
        </div>
        <div className="mt-6 space-y-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <SkeletonBlock key={index} className="h-16 w-full rounded-[14px]" />
          ))}
        </div>
      </Panel>
    </div>
  );
}

function SupportSkeleton() {
  return (
    <div className="space-y-5 pb-4">
      <Header />
      <div className="grid min-h-[520px] gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
        <Panel>
          <SkeletonBlock className="h-5 w-24 rounded-full" />
          <SkeletonBlock className="mt-4 h-11 w-full rounded-full" />
          <div className="mt-5 space-y-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="flex items-center gap-3 rounded-[16px] border border-input-border/60 p-3">
                <SkeletonBlock className="h-10 w-10 rounded-full" />
                <div className="min-w-0 flex-1 space-y-2">
                  <SkeletonBlock className="h-4 w-3/4 rounded-full" />
                  <SkeletonBlock className="h-3 w-1/2 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel>
          <div className="flex items-center justify-between gap-4 border-b border-input-border pb-4">
            <div className="space-y-2">
              <SkeletonBlock className="h-5 w-40 rounded-full" />
              <SkeletonBlock className="h-4 w-56 max-w-full rounded-full" />
            </div>
            <SkeletonBlock className="h-9 w-28 rounded-full" />
          </div>
          <div className="mt-6 space-y-4">
            <SkeletonBlock className="h-14 w-2/3 rounded-[18px]" />
            <SkeletonBlock className="ml-auto h-14 w-1/2 rounded-[18px]" />
            <SkeletonBlock className="h-20 w-3/4 rounded-[18px]" />
            <SkeletonBlock className="ml-auto h-16 w-2/5 rounded-[18px]" />
          </div>
          <div className="mt-8 flex gap-2">
            <SkeletonBlock className="h-11 flex-1 rounded-full" />
            <SkeletonBlock className="h-11 w-12 rounded-full" />
          </div>
        </Panel>
      </div>
    </div>
  );
}

function LiveChatSkeleton() {
  const conversationRows = [0, 1, 2, 3, 4, 5];
  const messageRows = [
    { align: "mr-auto", width: "w-[66%]", height: "h-14" },
    { align: "ml-auto", width: "w-[48%]", height: "h-14" },
    { align: "mr-auto", width: "w-[74%]", height: "h-20" },
    { align: "ml-auto", width: "w-[42%]", height: "h-16" },
    { align: "mr-auto", width: "w-[58%]", height: "h-14" },
  ];

  return (
    <div className="flex h-full min-h-[620px] w-full flex-1 flex-col overflow-hidden bg-card-bg-normal">
      <div className="min-h-0 flex-1 overflow-hidden">
        <div className="h-full min-h-0 lg:hidden">
          <aside className="flex h-full min-h-0 flex-col overflow-hidden bg-card-bg-normal">
            <div className="flex h-[68px] shrink-0 items-center justify-between border-b border-input-border bg-secondary-bg px-4">
              <div className="flex min-w-0 items-center gap-3">
                <SkeletonBlock className="h-10 w-10 rounded-full" />
                <SkeletonBlock className="h-10 w-10 rounded-full" />
                <div className="min-w-0 space-y-2">
                  <SkeletonBlock className="h-4 w-24 rounded-full" />
                  <SkeletonBlock className="h-3 w-20 rounded-full" />
                </div>
              </div>
            </div>

            <div className="border-b border-input-border bg-card-bg-normal px-3 py-2">
              <SkeletonBlock className="h-10 w-full rounded-lg" />
              <div className="mt-2 grid grid-cols-2 gap-2">
                <SkeletonBlock className="h-8 rounded-full" />
                <SkeletonBlock className="h-8 rounded-full" />
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-hidden">
              {conversationRows.map((index) => (
                <div key={index} className="flex items-center gap-3 px-3 py-3">
                  <SkeletonBlock className="h-12 w-12 rounded-full" />
                  <div className="min-w-0 flex-1 border-b border-input-border pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1 space-y-2">
                        <SkeletonBlock className="h-4 w-3/5 rounded-full" />
                        <SkeletonBlock className="h-3 w-4/5 rounded-full" />
                      </div>
                      <SkeletonBlock className="h-3 w-10 rounded-full" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>

        <div className="hidden h-full min-h-0 grid-cols-[380px_minmax(0,1fr)] overflow-hidden lg:grid">
          <aside className="flex h-full min-h-0 flex-col overflow-hidden bg-card-bg-normal border-r border-input-border">
            <div className="flex h-[68px] shrink-0 items-center justify-between border-b border-input-border bg-secondary-bg px-4">
              <div className="flex min-w-0 items-center gap-3">
                <SkeletonBlock className="h-10 w-10 rounded-full" />
                <SkeletonBlock className="h-10 w-10 rounded-full" />
                <div className="min-w-0 space-y-2">
                  <SkeletonBlock className="h-4 w-24 rounded-full" />
                  <SkeletonBlock className="h-3 w-20 rounded-full" />
                </div>
              </div>
            </div>

            <div className="border-b border-input-border bg-card-bg-normal px-3 py-2">
              <SkeletonBlock className="h-10 w-full rounded-lg" />
              <div className="mt-2 grid grid-cols-2 gap-2">
                <SkeletonBlock className="h-8 rounded-full" />
                <SkeletonBlock className="h-8 rounded-full" />
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-hidden">
              {conversationRows.map((index) => (
                <div key={index} className="flex items-center gap-3 px-3 py-3">
                  <SkeletonBlock className="h-12 w-12 rounded-full" />
                  <div className="min-w-0 flex-1 border-b border-input-border pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1 space-y-2">
                        <SkeletonBlock className="h-4 w-3/5 rounded-full" />
                        <SkeletonBlock className="h-3 w-4/5 rounded-full" />
                      </div>
                      <SkeletonBlock className="h-3 w-10 rounded-full" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </aside>

          <section className="flex h-full min-h-0 flex-col overflow-hidden bg-primary-bg">
            <header className="flex h-[68px] shrink-0 items-center justify-between border-b border-input-border bg-secondary-bg px-4">
              <div className="flex min-w-0 items-center gap-3">
                <SkeletonBlock className="h-10 w-10 rounded-full" />
                <div className="min-w-0 space-y-2">
                  <SkeletonBlock className="h-4 w-36 rounded-full" />
                  <SkeletonBlock className="h-3 w-48 max-w-full rounded-full" />
                </div>
              </div>
              <div className="flex gap-1">
                <SkeletonBlock className="h-10 w-10 rounded-full" />
                <SkeletonBlock className="h-10 w-10 rounded-full" />
              </div>
            </header>

            <div className="min-h-0 flex-1 overflow-hidden bg-[var(--dashboardbg)] px-5 py-5">
              <div className="mb-4 flex justify-center">
                <SkeletonBlock className="h-7 w-16 rounded-lg" />
              </div>
              <div className="space-y-2.5">
                {messageRows.map((message, index) => (
                  <SkeletonBlock
                    key={index}
                    className={`${message.align} ${message.height} ${message.width} max-w-[86%] rounded-[14px]`}
                  />
                ))}
              </div>
            </div>

            <footer className="flex shrink-0 items-end gap-2 border-t border-input-border bg-secondary-bg px-4 py-3">
              <SkeletonBlock className="h-11 flex-1 rounded-lg" />
              <SkeletonBlock className="h-11 w-11 rounded-full" />
            </footer>
          </section>
        </div>
      </div>
    </div>
  );
}

function AccountSkeleton() {
  return (
    <div className="space-y-5 pb-4">
      <Header />
      <div className="grid gap-5 md:grid-cols-[minmax(14rem,0.3fr)_1fr] xl:grid-cols-[minmax(17rem,0.25fr)_1fr]">
        <Panel className="h-fit space-y-2">
          {Array.from({ length: 3 }).map((_, index) => (
            <SkeletonBlock key={index} className="h-11 w-full rounded-[12px]" />
          ))}
        </Panel>
        <Panel>
          <div className="flex items-center gap-4">
            <SkeletonBlock className="h-20 w-20 rounded-full" />
            <div className="min-w-0 flex-1 space-y-2">
              <SkeletonBlock className="h-5 w-44 rounded-full" />
              <SkeletonBlock className="h-4 w-60 max-w-full rounded-full" />
            </div>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <SkeletonBlock className="h-11 rounded-full" />
            <SkeletonBlock className="h-11 rounded-full" />
            <SkeletonBlock className="h-11 rounded-full" />
            <SkeletonBlock className="h-11 rounded-full" />
            <SkeletonBlock className="h-24 rounded-[16px] sm:col-span-2" />
          </div>
        </Panel>
      </div>
    </div>
  );
}

function AuthSkeleton() {
  return (
    <div className="mx-auto w-full max-w-xl">
      <Header />
      <Panel>
        <div className="space-y-3 text-center">
          <SkeletonBlock className="mx-auto h-6 w-24 rounded-full" />
          <SkeletonBlock className="mx-auto h-10 w-3/4 rounded-full" />
          <SkeletonBlock className="mx-auto h-4 w-[88%] rounded-full" />
        </div>
        <div className="mt-8 space-y-4">
          <SkeletonBlock className="h-12 w-full rounded-full" />
          <SkeletonBlock className="h-12 w-full rounded-full" />
          <SkeletonBlock className="h-12 w-full rounded-full" />
        </div>
        <SkeletonBlock className="mt-6 h-12 w-full rounded-full" />
      </Panel>
    </div>
  );
}

function GenericSkeleton() {
  return (
    <div className="space-y-5 pb-4">
      <Header />
      <Panel>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <SkeletonBlock key={index} className="h-28 rounded-[16px]" />
          ))}
        </div>
      </Panel>
    </div>
  );
}

function resolveVariantKey(pageName = "") {
  const value = String(pageName)
    .toLowerCase()
    .replace(/[^a-z0-9/]+/g, "");

  if (!value) return DEFAULT_VARIANT;
  if (value.includes("dashboard")) return "dashboard";
  if (
    value.includes("mywallet") ||
    value.includes("withdraw") ||
    value.includes("wallet")
  )
    return "wallet";
  if (value.includes("merchant") || value.includes("buttonmaker"))
    return "merchant";
  if (value.includes("apikey")) return "api";
  if (value.includes("security")) return "security";
  if (value.includes("ipnhistory")) return "history";
  if (value.includes("history")) return "history";
  if (value.includes("livechat")) return "liveChat";
  if (value.includes("newticket") || value.includes("help"))
    return "support";
  if (value.includes("faq")) return "faq";
  if (value.includes("account")) return "account";
  if (
    value.includes("login") ||
    value.includes("signup") ||
    value.includes("forgotpassword") ||
    value.includes("resendverification") ||
    value.includes("otpverification") ||
    value.includes("resetpassword") ||
    value.includes("auth")
  )
    return "auth";
  return DEFAULT_VARIANT;
}

const VARIANT_MAP = {
  dashboard: DashboardSkeleton,
  wallet: WalletSkeleton,
  merchant: MerchantSkeleton,
  api: ApiKeysSkeleton,
  security: SecuritySkeleton,
  history: HistorySkeleton,
  faq: FaqSkeleton,
  liveChat: LiveChatSkeleton,
  support: SupportSkeleton,
  account: AccountSkeleton,
  auth: AuthSkeleton,
  default: GenericSkeleton,
};

export default function Skeleton({
  pageName = DEFAULT_VARIANT,
  variant,
  className = "",
}) {
  const key = resolveVariantKey(variant ?? pageName);
  const Variant = VARIANT_MAP[key] ?? VARIANT_MAP.default;

  return (
    <div className={className}>
      <Variant />
    </div>
  );
}

export {
  AccountSkeleton,
  ApiKeysSkeleton,
  AuthSkeleton,
  DashboardSkeleton,
  GenericSkeleton,
  HistorySkeleton,
  LiveChatSkeleton,
  MerchantSkeleton,
  SecuritySkeleton,
  SupportSkeleton,
  WalletSkeleton,
  FaqSkeleton,
  FaqSkeleton as faqSkeleton,
};
