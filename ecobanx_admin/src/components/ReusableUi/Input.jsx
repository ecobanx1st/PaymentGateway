"use client";

import { Eye, EyeOff } from "lucide-react";
import { forwardRef, useState } from "react";

function joinClasses(...classes) {
  return classes.filter(Boolean).join(" ");
}

const Input = forwardRef(function Input(
  {
    id,
    label,
    labelDescription,
    type = "text",
    value,
    suffix,
    placeholder,
    beforeIcon,
    afterIcon,
    className = "",
    labelClassName = "",
    descriptionClassName = "",
    inputClassName = "",
    ...props
  },
  ref,
) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;
  const trailingIcon = isPassword || afterIcon;

  return (
    <div className={joinClasses("w-full", className)}>
      {(label || labelDescription) && (
        <div className="mb-2 flex flex-col gap-1">
          {label && (
            <label
              htmlFor={id}
              className={joinClasses(
                "text-mid font-medium text-text-secondary",
                labelClassName,
              )}
            >
              {label}
            </label>
          )}
          {labelDescription && (
            <p
              className={joinClasses(
                "text-small text-input-text",
                descriptionClassName,
              )}
            >
              {labelDescription}
            </p>
          )}
        </div>
      )}

      <div className="relative w-full">
        {beforeIcon && (
          <span className="absolute left-4 top-1/2 inline-flex -translate-y-1/2 text-input-text">
            {beforeIcon}
          </span>
        )}
        <input
          ref={ref}
          id={id}
          type={inputType}
          value={value}
          placeholder={placeholder}
          className={joinClasses(
            "h-11 w-full rounded-full border border-input-border bg-input-bg px-4 text-mid text-theme-text outline-none transition placeholder:text-input-text focus:border-text-primary",
            beforeIcon && "pl-11",
            trailingIcon && "pr-11",
            inputClassName,
          )}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            aria-label={showPassword ? "Hide password" : "Show password"}
            className={`absolute ${afterIcon ? "right-15" : "right-4"} top-1/2 inline-flex -translate-y-1/2 text-input-text transition hover:text-theme-text`}
            onClick={() => setShowPassword((current) => !current)}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        )}
        {afterIcon && (
          <span className="absolute right-0 top-1/2 inline-flex -translate-y-1/2 text-input-text bg-bg-secondary p-3 rounded-full [background:var(--card-bg)] border border-input-border">
            {afterIcon}
          </span>
        )}
        {suffix && (
          <span className="absolute right-1 top-1/2 inline-flex -translate-y-1/2 text-theme-text bg-bg-secondary z-[10] p-2 rounded-full  border border-input-border">
            {suffix}
          </span>
        )}
              </div>
    </div>
  );
});

export default Input;
