"use client";

import { PROTECTED_ROUTES } from "@/config/routes";
import { getAuthToken } from "@/lib/axiosInterceptor";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const SOCKET_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || "")
  .replace(/\/eco-banx\/admin\/?$/, "")
  .replace(/\/$/, "");

function isProtectedShellRoute(pathname) {
  if (pathname.startsWith("/auth")) {
    return false;
  }

  return PROTECTED_ROUTES.some((route) => {
    if (route.startsWith("/auth")) {
      return false;
    }

    return pathname === route || pathname.startsWith(`${route}/`);
  });
}

function subscribeToAuthStorage(onStoreChange) {
  if (typeof window === "undefined") {
    return () => {};
  }

  window.addEventListener("storage", onStoreChange);
  window.addEventListener("auth-storage-change", onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener("auth-storage-change", onStoreChange);
  };
}

function normalizeSocketCount(value) {
  const count = Number(value);

  return Number.isFinite(count) && count >= 0 ? count : null;
}

function getSocketNotificationCount(payload) {
  const possibleCounts = [
    payload?.data?.count,
    payload?.data?.unreadCount,
    payload?.data?.totalUnread,
    payload?.count,
    payload?.unreadCount,
    payload?.totalUnread,
  ];

  for (const value of possibleCounts) {
    const count = normalizeSocketCount(value);

    if (count !== null) {
      return count;
    }
  }

  return null;
}

export default function AdminShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const protectedRoute = isProtectedShellRoute(pathname);
  const [accessToken, setAccessToken] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    function syncAuthToken() {
      const nextAccessToken = getAuthToken();

      setAccessToken(nextAccessToken);
      setAuthReady(true);

      if (!nextAccessToken) {
        setNotificationCount(0);
      }

      if (protectedRoute && !nextAccessToken) {
        router.replace("/auth/login");
      }
    }

    syncAuthToken();
    return subscribeToAuthStorage(syncAuthToken);
  }, [pathname, protectedRoute, router]);

  useEffect(() => {
    if (!accessToken || !SOCKET_URL) {
      return undefined;
    }

    const socket = io(SOCKET_URL, {
      auth: { token: accessToken },
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
      socket.emit("notification:getUnreadCount");
    });

    socket.on("connect_error", () => {
      const freshToken = getAuthToken();

      if (freshToken && socket.auth?.token !== freshToken) {
        socket.auth = { token: freshToken };
      }
    });

    socket.on("notification:unreadCount", (payload) => {
      const count = getSocketNotificationCount(payload);

      if (count !== null) {
        setNotificationCount(count);
      }
    });

    socket.on("notification:new", (payload) => {
      const count = getSocketNotificationCount(payload);

      setNotificationCount((currentCount) => count ?? currentCount + 1);
    });

    socket.on("notification:allRead", () => {
      setNotificationCount(0);
    });

    socket.on("notification:cleared", () => {
      setNotificationCount(0);
    });

    return () => {
      socket.disconnect();
    };
  }, [accessToken]);

  if (!protectedRoute) {
    return children;
  }

  if (!authReady || !accessToken) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-bg-primary text-theme-text">
      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        notificationCount={notificationCount}
        onCloseMobile={() => setMobileOpen(false)}
        onToggleCollapse={() => setCollapsed((current) => !current)}
      />
      <div className="flex min-w-0 flex-1 flex-col bg-bg-secondary">
        <Topbar
          collapsed={collapsed}
          notificationCount={notificationCount}
          onOpenMobile={() => setMobileOpen(true)}
          onToggleCollapse={() => setCollapsed((current) => !current)}
        />
        <main className="min-h-0 flex-1 overflow-y-auto bg-bg-secondary p-3 sm:p-4 lg:p-5">
          <div className="mx-auto w-full max-w-8xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
