import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function MerchantLink({ href, label, className = "", onClick }) {
  const isValidHref =
    typeof href === "string" || (typeof href === "object" && href !== null);
  const baseClass = `group flex min-h-11 items-center gap-3 rounded-lg border border-input-border/70 bg-input-bg px-3 py-2 text-sm font-semibold text-secondary-text transition-all duration-300 hover:border-primary/35 hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 ${className}`;
  const content = (
    <>
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-white">
        <ArrowRight
          size={14}
          strokeWidth={2.5}
          className="transition-transform duration-300 group-hover:translate-x-0.5"
        />
      </div>
      <span className="min-w-0 flex-1 whitespace-normal leading-relaxed">{label}</span>
    </>
  );

  if (!isValidHref) {
    return (
      <span
        aria-disabled="true"
        className={`${baseClass} cursor-not-allowed opacity-60 hover:border-input-border hover:bg-input-bg hover:text-secondary-text`}
      >
        {content}
      </span>
    );
  }

  return (
    <Link
      href={href}
      onClick={onClick}
      className={baseClass}
    >
      {content}
    </Link>
  );
}
