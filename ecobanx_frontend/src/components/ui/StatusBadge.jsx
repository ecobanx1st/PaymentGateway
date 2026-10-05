"use client";

const statusMap = {
  Active: "bg-[rgba(46,213,115,0.06)] text-[rgba(46,213,115,0.95)] border-[rgba(46,213,115,0.25)]",
  Disabled: "bg-white/4 text-secondary-text/85 border-secondary-text/25",
  Pending: "bg-[#ffa502]/10 text-[#ffa502] border-[#ffa502]/20",
};

export default function StatusBadge({ status = "", className = "" }) {
  const tone =
    statusMap[status] ?? "bg-secondary-bg text-secondary-text border-border";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold leading-none ${tone} ${className}`}
    >
      <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}
