"use client";

function WavePattern() {
  const leftLines = Array.from({ length: 10 }, (_, index) => index);
  const rightLines = Array.from({ length: 14 }, (_, index) => index);

  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
      preserveAspectRatio="none"
      viewBox="0 0 1200 120"
    >
      <path
        d="M0 0H1200V120H0Z"
        fill="var(--page-banner-bg)"
      />
      <path
        d="M250 -12C390 80 474 91 618 10C713 -43 829 -43 922 11C1048 84 1126 90 1200 46V120H0V54C72 100 138 92 250 -12Z"
        fill="var(--page-banner-accent)"
      />
      {leftLines.map((line) => (
        <path
          key={`left-${line}`}
          d={`M-76 ${20 + line * 7}C52 ${-8 + line * 7} 129 ${94 + line * 5} 270 ${48 + line * 6}C391 ${9 + line * 5} 437 ${17 + line * 5} 526 ${50 + line * 4}`}
          fill="none"
          stroke="var(--page-banner-line)"
          strokeLinecap="round"
          strokeWidth="2"
        />
      ))}
      {rightLines.map((line) => (
        <path
          key={`right-${line}`}
          d={`M688 ${-16 + line * 7}C798 ${74 + line * 5} 887 ${-20 + line * 8} 996 ${34 + line * 6}C1074 ${73 + line * 5} 1136 ${75 + line * 5} 1278 ${42 + line * 6}`}
          fill="none"
          stroke="var(--page-banner-line)"
          strokeLinecap="round"
          strokeWidth="2"
        />
      ))}
    </svg>
  );
}

export default function PageTopBanner({
  title,
  description = "",
  eyebrow = "",
  leading = null,
  actions = null,
  className = "",
}) {
  return (
    <section
      className={`relative rounded-lg border px-5 py-7 sm:px-6 ${className}`}
      style={{
        background: "var(--page-banner-bg)",
        borderColor: "var(--page-banner-border)",
        boxShadow: "var(--page-banner-shadow)",
        "--inputbg": "var(--page-banner-control-bg)",
        "--inputborder": "var(--page-banner-control-border)",
        "--secondary": "var(--page-banner-text)",
        "--theme-text": "var(--page-banner-title)",
      }}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
        <WavePattern />
      </div>

      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          {leading ? <div className="shrink-0">{leading}</div> : null}
          <div className="min-w-0">
            {eyebrow ? (
              <p
                className="mb-2 text-xs font-bold uppercase tracking-[0.16em]"
                style={{ color: "var(--page-banner-text)" }}
              >
                {eyebrow}
              </p>
            ) : null}
            <h1
              className="max-w-full break-words text-[1.7rem] font-semibold leading-tight tracking-normal sm:text-[2rem]"
              style={{ color: "var(--page-banner-title)" }}
            >
              {title}
            </h1>
            {description ? (
              <p
                className="mt-2 max-w-3xl text-sm leading-6 sm:text-[15px]"
                style={{ color: "var(--page-banner-text)" }}
              >
                {description}
              </p>
            ) : null}
          </div>
        </div>

        {actions ? (
          <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap lg:w-auto lg:justify-end">
            {actions}
          </div>
        ) : null}
      </div>
    </section>
  );
}
