"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RouteDisabledRedirect({ to = "/User/dashboard" }) {
  const router = useRouter();

  useEffect(() => {
    router.replace(to);
  }, [router, to]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-primary-bg px-4 text-theme-text">
      <div
        aria-label="Redirecting"
        className="h-10 w-10 animate-spin rounded-full border-2 border-primary/20 border-t-primary"
        role="status"
      />
    </main>
  );
}
