"use client";

export default function Input({
  label,
  type = "text",
  name,
  id,
  value,
  placeholder = "",
  onChange,
  onBlur,
  onFocus,
  onKeyDown,
  disabled = false,
  required = false,
  showRequired,
  readOnly = false,
  autoComplete = "off",
  inputMode,
  maxLength,
  min,
  max,
  error = "",
  className = "",
  inputClassName = "",
  rounded = "",
  leftElement = null,
  rightElement = null,
  rightElementClassName = "",
}) {
  const showAsterisk =
    showRequired !== undefined ? Boolean(showRequired) : Boolean(required);

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {label ? (
        <label
          htmlFor={id || name}
          className="text-sm font-medium text-secondary-text"
        >
          {label}
          {showAsterisk ? <span className="ml-1 text-red-400">*</span> : null}
        </label>
      ) : null}

      <div className="relative">
        {leftElement ? (
          <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-secondary-text">
            {leftElement}
          </div>
        ) : null}

        <input
          id={id || name}
          name={name}
          type={type}
          value={value ?? ""}
          placeholder={placeholder}
          onChange={onChange}
          onBlur={onBlur}
          onFocus={onFocus}
          onKeyDown={onKeyDown}
          disabled={disabled}
          required={showRequired !== undefined ? false : required}
          readOnly={readOnly}
          autoComplete={autoComplete}
          inputMode={inputMode}
          maxLength={maxLength}
          min={min}
          max={max}
          className={`w-full ${rounded} border border-input-border bg-input-bg px-4 py-2 text-theme-text placeholder:text-secondary-text/60 transition-all duration-300 focus:border-theme-text focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 hover:bg-secondary-bg ${leftElement ? "pl-11" : ""} ${rightElement ? "pr-12" : ""} ${inputClassName}`}
        />

        {rightElement ? (
          <div className={rightElementClassName || "absolute right-0 top-1/2 -translate-y-1/2 hover:text-primary-text hover:bg-secondary-bg rounded-full"}>
            {rightElement}
          </div>
        ) : null}
      </div>

      {error ? <span className="text-sm text-red-400">{error}</span> : null}
    </div>
  );
}
