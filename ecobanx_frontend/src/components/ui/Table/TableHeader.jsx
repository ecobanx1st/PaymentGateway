"use client";

export default function TableHeader({
  title,
  subtitle,
  actions = null,
  className = "",
}) {
  if (!title && !subtitle && !actions) return null;

  return (
    <div
      className={`flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between ${className}`}
    >
      <div className="min-w-0">
        {title ? (
          <h2 className="text-lg font-semibold tracking-tight text-text sm:text-xl">
            {title}
          </h2>
        ) : null}
        {subtitle ? (
          <p className="mt-1 text-sm text-secondary-text">{subtitle}</p>
        ) : null}
      </div>

      {actions ? (
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
          {actions}
        </div>
      ) : null}
    </div>
  );
}
