"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function PasswordInput({
  label,
  name,
  id,
  value,
  placeholder = "Enter Password",
  onChange,
  onBlur,
  onFocus,
  onKeyDown,
  disabled = false,
  required = false,
  readOnly = false,
  autoComplete = "off",
  maxLength,
  error = "",
  className = "",
  inputClassName = "",
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label
          htmlFor={id || name}
          className="text-sm font-medium text-secondary-text"
        >
          {label}
          {required && <span className="ml-1 text-red-400">*</span>}
        </label>
      )}

      <div className="relative">
        <input
          id={id || name}
          name={name}
          type={showPassword ? "text" : "password"}
          value={value ?? ""}
          placeholder={placeholder}
          onChange={onChange}
          onBlur={onBlur}
          onFocus={onFocus}
          onKeyDown={onKeyDown}
          disabled={disabled}
          required={required}
          readOnly={readOnly}
          autoComplete={autoComplete}
          maxLength={maxLength}
          className={`
            w-full
            rounded-xl
            border
            border-input-border
            bg-input-bg
            px-4
            py-2
            pr-12
            text-text
            placeholder:text-secondary-text
            transition-all
            duration-300
            focus:outline-none
            focus:border-theme-text
            disabled:cursor-not-allowed
            disabled:opacity-50
            hover:bg-secondary-bg
            ${inputClassName}
          `}
        />

        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary-text transition hover:text-primary-text"
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      <span className="min-h-[18px] text-xs text-red-400">{error}</span>
    </div>
  );
}
