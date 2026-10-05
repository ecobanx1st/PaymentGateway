"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Button({
  value = "Button",
  children,
  onClick,
  onNavigate,
  type = "button",
  disabled = false,
  loading = false,
  className = "",
  icon,
  rightIcon,
  variant = "",
}) {
  const router = useRouter();

  const handleClick = (e) => {
    if (disabled || loading) return;

    onClick?.(e);

    if (onNavigate) {
      router.push(onNavigate);
    }
  };

  const variantStyle =
    variant === "primary"
      ? { background: "var(--primarybtn)" }
      : variant === "danger"
        ? { backgroundColor: '#FECACA"' }
        : { background: "var(--inputbg)" };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={handleClick}
      className={`flex max-w-full items-center justify-center gap-2 rounded-full cursor-pointer font-medium transition-all mt-1 mb-1 duration-300 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 h-11 px-3 text-md border border-input-border hover:scale-[1.03] transition-all ${className}`}
      style={variantStyle}
    >
      {loading ? (
        <span className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : icon ? (
        <span className="shrink-0">
          {typeof icon === "object" && icon.src ? (
            <Image src={icon} alt="Button Icon" width={16} height={16} className="object-contain" />
          ) : (
            icon
          )}
        </span>
      ) : null}
      <span className="min-w-0 break-words text-center leading-tight">{children ?? value}</span>
      {rightIcon ? (
        <span className="shrink-0">
          {typeof rightIcon === "object" && rightIcon.src ? (
            <Image src={rightIcon} alt="Button Icon" width={16} height={16} className="object-contain" />
          ) : (
            rightIcon
          )}
        </span>
      ) : null}
    </button>
  );
}
