"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import Input from "./input";
import CopyButton from "./CopyButton";

function maskSecret(value) {
  if (!value) return "";
  const prefix = value.slice(0, 8);
  return `${prefix}****************`;
}

export default function ApiKeyCard({
  title,
  value = "",
  copyable = true,
  secret = false,
  className = "",
}) {
  const [visible, setVisible] = useState(!secret);

  const displayValue = secret && !visible ? maskSecret(value) : value;

  return (
    <article
      className={`border border-input-border rounded-[18px] p-5 sm:p-6 ${className}`}
      style={{ background: "var(--cardbg)" }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-theme-text">
            {title}
          </h2>
        </div>

        {secret ? (
          <button
            type="button"
            onClick={() => setVisible((current) => !current)}
            aria-label={visible ? "Hide secret key" : "Show secret key"}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-input-border bg-primary-bg text-secondary-text transition hover:bg-secondary-bg hover:text-primary-text"
          >
            {visible ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        ) : null}
      </div>

      <div className="mt-4">
        <Input
          value={displayValue}
          readOnly
          inputClassName="rounded-full font-mono text-[13px] tracking-[0.04em] bg-primary-bg/40 border-input-border"
          rightElement={
            copyable ? (
              <CopyButton
                value={value}
                label="Copy key"
                variant="input-green"
                className="h-8 w-8"
              />
            ) : null
          }
          rightElementClassName="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center justify-center"
        />
      </div>
    </article>
  );
}
