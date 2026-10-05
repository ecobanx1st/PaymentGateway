"use client";

import Link from "next/link";
import { MoonStar, SunMedium } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import brandLogo from "@/components/assets/darklogo.png";

const BRAND_LOGO_SRC = brandLogo.src;

export default function AuthShell({
  children,
  title,
  subtitle,
  maxWidth = "max-w-xl",
  topLink = "/",
  topLinkLabel = "Eco Banx",
  className = "",
}) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <main
      className="auth-shell relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-12 transition-colors duration-500 sm:px-6 sm:py-8"
      style={{ background: "var(--authbg)" }}
    >
      <div className="absolute right-6 top-6 z-10 flex items-center gap-2">
        <button
          type="button"
          aria-pressed={isDark}
          aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
          onClick={toggleTheme}
          className={`inline-flex ${
            isDark ? "flex-row-reverse" : ""
          } h-9 items-center gap-2 rounded-full border border-border transition-all bg-card-bg px-3 text-sm font-medium text-secondary-text shadow-sm transition hover:border-primary hover:text-primary`}
        >
          {isDark ? <SunMedium size={16} /> : <MoonStar size={16} />}
          <span className="hidden sm:inline">{isDark ? "Light" : "Dark"}</span>
        </button>
      </div>

      <div
        className={`auth-panel relative z-0 w-[510px] ${maxWidth} rounded-3xl border p-6 sm:p-8 ${className}`}
      >
        <div className="mb-8 flex flex-col items-center">
          <Link
            href={topLink}
            className="mb-3 inline-flex items-center"
            aria-label={topLinkLabel}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- Public asset path works reliably in static export output. */}
            <img
              src={BRAND_LOGO_SRC}
              alt={topLinkLabel}
              width={496}
              height={105}
              className="h-auto w-44 object-contain"
            />
          </Link>

          <h2 className="text-center text-2xl font-bold text-themetext sm:text-[2rem]">
            {title}
          </h2>

          {subtitle ? (
            <p className="mt-2 text-center text-sm text-secondary-text">
              {subtitle}
            </p>
          ) : null}
        </div>

        {children}
      </div>
    </main>
  );
}
