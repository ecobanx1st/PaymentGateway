"use client";

import PermissionItem from "./PermissionItem";

export default function PermissionCard({
  title,
  subtitle,
  permissions = [],
  onToggle,
  className = "",
}) {
  return (
    <article
      className={`border border-input-border rounded-[18px] p-5 sm:p-6 ${className}`}
      style={{ background: "var(--cardbg)" }}
    >
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-theme-text">
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-1 text-sm text-secondary-text">{subtitle}</p>
        ) : null}
      </div>

      <div className="mt-5 space-y-3">
        {permissions.map((permission) => (
          <PermissionItem
            key={permission.id}
            title={permission.title}
            description={permission.description}
            checked={permission.checked}
            onChange={(next) => onToggle?.(permission.id, next)}
          />
        ))}
      </div>
    </article>
  );
}
