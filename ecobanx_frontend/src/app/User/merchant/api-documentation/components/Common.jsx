"use client";

import { Check, Copy, Globe2, Search } from "lucide-react";
import { useState } from "react";

const METHOD_STYLES = {
  GET: "from-sky-500 to-cyan-500",
  POST: "from-violet-500 to-indigo-500",
  PUT: "from-amber-500 to-orange-500",
  PATCH: "from-fuchsia-500 to-purple-500",
  DELETE: "from-rose-500 to-red-500",
};

export function MethodBadge({ method }) {
  return (
    <span
      className={`inline-flex rounded bg-gradient-to-r ${METHOD_STYLES[method] || METHOD_STYLES.GET} px-1.5 py-0.5 text-[9px] font-bold leading-4 text-white`}
    >
      {method}
    </span>
  );
}

export function CopyButton({ value, label = "Copy" }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };
  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-input-border bg-primary-bg px-3 py-2 text-xs font-semibold text-secondary-text transition hover:border-primary hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      aria-label={copied ? "Copied" : label}
    >
      {copied ? <Check size={15} /> : <Copy size={15} />}
      {copied ? "Copied" : label}
    </button>
  );
}

export function SearchBar({ value, onChange }) {
  return (
    <label className="relative block min-w-[15rem] flex-1 lg:max-w-[25rem]">
      <Search
        size={17}
        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary-text"
      />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search documentation..."
        className="w-full rounded-xl border border-input-border bg-input-bg py-3 pl-10 pr-4 text-sm text-theme-text outline-none transition placeholder:text-secondary-text focus:border-primary focus:ring-2 focus:ring-primary/15"
      />
    </label>
  );
}

export function UrlCard({ url }) {
  return (
    <section className="rounded-xl border border-input-border bg-primary/5 p-3">
      <p className="mb-2 text-xs font-bold uppercase tracking-wider text-secondary-text">
        Endpoint URL
      </p>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <Globe2 size={18} className="shrink-0 text-primary" />
          <code className="break-all text-sm font-semibold text-theme-text">
            {url}
          </code>
        </div>
        <CopyButton value={url} label="Copy URL" />
      </div>
    </section>
  );
}

export function ParameterTable({ title, rows, compact = false, label, description, hideHeader = false }) {
  if (!rows?.length) return null;
  return (
    <section className="space-y-3">
      {title && <h3 className="text-base font-semibold text-theme-text">{title}</h3>}
      {label && <p className="text-sm font-semibold text-theme-text">{label}</p>}
      {description && <p className="-mt-2 text-sm text-secondary-text">{description}</p>}
      <div className="overflow-x-auto rounded-xl border border-input-border">
        <table className="min-w-[570px] w-full text-left text-sm">
          {!hideHeader && <thead className="bg-primary/8 text-xs uppercase tracking-wider text-secondary-text">
            <tr>
              {(compact ? ["Field Name", "Description", "Required?"] : ["Field", "Type", "Description", "Required"]).map((heading) => (
                <th key={heading} className="px-4 py-3 font-semibold">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>}
          <tbody>
            {rows.map((row, index) => (
              <tr
                key={`${row.field}-${index}`}
                className="border-t border-input-border/70 text-secondary-text transition-colors hover:bg-primary/6"
              >
                <td className="px-4 py-3 font-mono text-[13px] font-semibold text-theme-text">
                  {row.field}
                </td>
                {!compact && <td className="px-4 py-3"><span className="rounded-md bg-primary/10 px-2 py-1 font-mono text-xs text-primary">{row.type}</span></td>}
                <td className="px-4 py-3">{row.description}</td>

                <td className="px-4 py-3 text-emerald-500">{typeof row.required === "string" ? row.required : row.required ? "Yes" : compact ? "No" : "Optional"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function CodeBlock({ title, value, copyLabel = "Copy" }) {
  return (
    <section className="overflow-hidden rounded-xl border border-[#2c2440] bg-[#0d0b13]">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <span className="text-sm font-semibold text-white">{title}</span>
        <CopyButton value={value} label={copyLabel} />
      </div>
      <pre className="max-h-[30rem] overflow-auto p-4 font-mono text-xs leading-6 text-slate-200">
        <code>{value}</code>
      </pre>
    </section>
  );
}
