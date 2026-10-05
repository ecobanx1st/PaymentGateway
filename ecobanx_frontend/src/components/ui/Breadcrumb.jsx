import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function Breadcrumb({ items = [], className = "" }) {
  if (!items.length) return null;

  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex flex-wrap items-center gap-2 text-[15px] font-medium text-secondary-text">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const content = (
            <span
              className={
                isLast
                  ? "font-semibold text-primary-text"
                  : "transition hover:text-primary text-secondary-text"
              }
            >
              {item.label}
            </span>
          );

          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-2">
              {item.href && !isLast ? (
                <Link href={item.href}>{content}</Link>
              ) : (
                content
              )}

              {!isLast ? (
                <ChevronRight size={14} className="text-secondary-text" />
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
