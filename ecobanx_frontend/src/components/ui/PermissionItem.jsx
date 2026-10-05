"use client";

import Toggle from "./Toggle";

export default function PermissionItem({
  title,
  description,
  checked,
  onChange,
  disabled = false,
}) {
  return (
    <div className="w-full flex items-center justify-between gap-4 py-4 border-b border-input-border last:border-0">
      <div className="min-w-0">
        <h3 className="text-[15px] font-semibold tracking-tight text-theme-text">
          {title}
        </h3>
        <p className="mt-1 text-[13px] leading-5 text-secondary-text">{description}</p>
      </div>

      <Toggle
        checked={checked}
        disabled={disabled}
        onChange={onChange}
        ariaLabel={title}
      />
    </div>
  );
}
