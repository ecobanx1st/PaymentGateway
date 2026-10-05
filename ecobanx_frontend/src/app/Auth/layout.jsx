"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AUTH_CHANGE_EVENT, getStoredAccessToken } from "@/lib/auth";
import brandLogo from "@/components/assets/darklogo.png";

const BRAND_LOGO_SRC = brandLogo.src;

export default function AuthLayout({ children }) {
  const router = useRouter();
  const [canShowAuthPage, setCanShowAuthPage] = useState(false);

  useEffect(() => {
    const redirectIfAuthenticated = () => {
      const token = getStoredAccessToken();

      if (token) {
        setCanShowAuthPage(false);
        router.replace("/User/dashboard");
        return;
      }

      setCanShowAuthPage(true);
    };

    redirectIfAuthenticated();
    window.addEventListener("storage", redirectIfAuthenticated);
    window.addEventListener(AUTH_CHANGE_EVENT, redirectIfAuthenticated);

    return () => {
      window.removeEventListener("storage", redirectIfAuthenticated);
      window.removeEventListener(AUTH_CHANGE_EVENT, redirectIfAuthenticated);
    };
  }, [router]);

  if (!canShowAuthPage) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-primary-bg">
        {/* eslint-disable-next-line @next/next/no-img-element -- Public asset path works reliably in static export output. */}
        <img
          src={BRAND_LOGO_SRC}
          alt="Eco Banx"
          width={496}
          height={105}
          className="h-auto w-44 object-contain"
        />
      </div>
    );
  }

  return children;
}
