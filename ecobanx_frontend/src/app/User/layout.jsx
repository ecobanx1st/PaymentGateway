"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { io } from "socket.io-client";
import { getAccountBaseRoute } from "@/utils/accountRoutes";
import {
  Bell,
  CircleHelp,
  MoonStar,
  SunMedium,
  X,
  UserRound,
  LayoutDashboard,
  House,
  KeyRound,
  ShieldCheck,
  WalletCards,
  MessageSquare,
  MessagesSquare,
  ChartNoAxesCombined,
  RadioTower,
  LogOut,
  ChevronUp,
  ChevronDown,
  MoreHorizontal,
  RefreshCw,
  Trash2,
  CheckCheck,
  ArrowRightToLineIcon,
  LucideArrowUpRightSquare,
  ArrowUpRight,
} from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { AUTH_CHANGE_EVENT, setForceLogoutMessage } from "@/lib/auth";
import apiClient, {
  clearAuthTokens,
  getStoredAccessToken,
  KYB_SECURITY_REDIRECT_EVENT,
} from "@/lib/axiosInterceptor";
import {
  resolveBackendMediaUrl,
  USER_PROFILE_CHANGE_EVENT,
} from "@/lib/user-profile";
import {
  clearStoredUserVerification,
  useStoredUserVerification,
  writeStoredUserVerification,
} from "@/lib/user-verification-storage";
import brandLogo from "@/components/assets/favicon.png";
import { MerchantSkeleton } from "@/components/ui/skeleton";

const ipnCount = 3;

const ECO_BANX_LOGO_SRC = brandLogo.src;
const SOCKET_URL = (
  process.env.NEXT_PUBLIC_SOCKET_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "http://localhost:3700/ecobanxApi"
).replace(/\/ecobanxApi\/?$/, "");
const DEFAULT_SIDEBAR_PROFILE = {
  name: "Account user",
  email: "",
  profilePicture: "",
};
const SIDEBAR_TOOLTIP_OFFSET = 12;
const NOTIFICATION_PAGE_LIMIT = 20;
const NOTIFICATION_SCROLL_THRESHOLD = 120;
const DEFAULT_NOTIFICATION_PAGINATION = {
  page: 1,
  limit: NOTIFICATION_PAGE_LIMIT,
  totalDocs: 0,
  totalPages: 1,
  hasNextPage: false,
  nextPage: null,
};

function normalizeSocketToken(token) {
  return typeof token === "string"
    ? token.replace(/^Bearer\s+/i, "").trim()
    : "";
}

function SidebarTooltipPortal({ tooltip }) {
  if (!tooltip || typeof document === "undefined") return null;

  return createPortal(
    <span
      role="tooltip"
      className="pointer-events-none fixed z-[120] -translate-y-1/2 whitespace-nowrap rounded-md border border-input-border bg-[var(--surface-strong)] px-3 py-2 text-xs font-semibold leading-none text-theme-text shadow-[0_12px_32px_rgba(0,0,0,0.22)]"
      style={{ left: tooltip.left, top: tooltip.top }}
    >
      <span className="absolute left-[-4px] top-1/2 h-2 w-2 -translate-y-1/2 rotate-45 border-b border-l border-input-border bg-[var(--surface-strong)]" />
      {tooltip.label}
    </span>,
    document.body,
  );
}

function pickTextValue(...values) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number" && Number.isFinite(value))
      return String(value);
  }

  return "";
}

function toNotificationItem(notification) {
  const item = notification || {};

  return {
    id: String(item._id || item.id || ""),
    title: item.title || "",
    description: item.description || "",
    category: item.category || "GENERAL",
    isRead: Boolean(item.isRead),
    seen: Boolean(item.seen),
    createdAt: item.createdAt || "",
    time: formatNotificationTime(item.createdAt),
  };
}

function getNotificationVerificationKind(notification) {
  const text = [
    notification?.title,
    notification?.description,
    notification?.message,
    notification?.body,
    notification?.category,
    notification?.type,
    notification?.data?.title,
    notification?.data?.description,
    notification?.data?.message,
  ]
    .filter((value) => typeof value === "string" && value.trim())
    .join(" ");
  const kycIndex = text.search(/\bkyc\b/i);
  const kybIndex = text.search(/\bkyb\b/i);

  if (kycIndex === -1 && kybIndex === -1) return "";
  if (kycIndex === -1) return "kyb";
  if (kybIndex === -1) return "kyc";

  return kycIndex < kybIndex ? "kyc" : "kyb";
}

function toPositiveInteger(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? Math.floor(number) : fallback;
}

function toNonNegativeInteger(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? Math.floor(number) : fallback;
}

function getNotificationList(payload) {
  const candidates = [
    payload?.notifications,
    payload?.data?.notifications,
    payload?.result?.notifications,
    payload?.data?.docs,
    payload?.docs,
  ];

  return candidates.find(Array.isArray) ?? [];
}

function getNotificationPagination(payload, fallback = {}) {
  const source =
    payload?.pagination ||
    payload?.data?.pagination ||
    payload?.result?.pagination ||
    payload ||
    {};
  const page = toPositiveInteger(source.page, fallback.page ?? 1);
  const limit = toPositiveInteger(
    source.limit ?? source.pageSize,
    fallback.limit ?? NOTIFICATION_PAGE_LIMIT,
  );
  const totalDocs = toNonNegativeInteger(
    source.totalDocs ?? source.totalItems ?? source.total,
    fallback.totalDocs ?? 0,
  );
  const totalPages = toPositiveInteger(
    source.totalPages,
    fallback.totalPages ?? 1,
  );
  const nextPage =
    source.nextPage === null || source.nextPage === undefined
      ? null
      : toPositiveInteger(source.nextPage, null);
  const hasNextPage =
    typeof source.hasNextPage === "boolean"
      ? source.hasNextPage
      : nextPage !== null
        ? true
        : page < totalPages;

  return {
    page,
    limit,
    totalDocs,
    totalPages,
    hasNextPage,
    nextPage,
  };
}

function mergeNotificationItems(currentItems, incomingItems, mode = "replace") {
  if (mode !== "append") return incomingItems;

  const seenIds = new Set(currentItems.map((item) => item.id));
  const uniqueIncoming = incomingItems.filter((item) => {
    if (!item.id || seenIds.has(item.id)) return false;
    seenIds.add(item.id);
    return true;
  });

  return [...currentItems, ...uniqueIncoming];
}

function formatNotificationTime(value) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
  if (seconds < 60) return "Just now";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;

  return date.toLocaleDateString();
}

function getSidebarProfile(profileData) {
  const nameFromFields = [
    profileData?.firstname,
    profileData?.firstName,
    profileData?.lastname,
    profileData?.lastName,
  ]
    .map((value) => (typeof value === "string" ? value.trim() : ""))
    .filter(Boolean)
    .join(" ");
  const name = pickTextValue(
    nameFromFields,
    profileData?.fullName,
    profileData?.name,
    profileData?.username,
    DEFAULT_SIDEBAR_PROFILE.name,
  );

  return {
    name,
    email: pickTextValue(profileData?.email),
    profilePicture: resolveBackendMediaUrl(
      profileData?.profile_picture ||
        profileData?.profilePicture ||
        profileData?.profileImage ||
        profileData?.avatar,
    ),
  };
}

function getProfileInitials(name, email) {
  const source = pickTextValue(name, email, DEFAULT_SIDEBAR_PROFILE.name);
  const parts = source.split(/\s+/).filter(Boolean);

  if (parts.length > 1) {
    return parts
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  }

  return source.slice(0, 1).toUpperCase() || "A";
}

function SidebarProfileAvatar({ src, name, email }) {
  const initials = useMemo(
    () => getProfileInitials(name, email),
    [email, name],
  );

  return (
    <span className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary text-[14px] font-bold text-white shadow-sm transition-transform group-hover:scale-105">
      <span>{initials}</span>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element -- Supports backend upload URLs without image config.
        <img
          key={src}
          src={src}
          alt={name}
          className="absolute inset-0 h-full w-full object-cover"
          onError={(event) => {
            event.currentTarget.hidden = true;
          }}
        />
      ) : null}
    </span>
  );
}

function getNotificationNavigationPath(notificationTitle) {
  const title = notificationTitle?.toLowerCase() || "";

  if (
    ["kyc", "2fa", "two-factor", "kyb", "password"].some((keyword) =>
      title.includes(keyword),
    )
  ) {
    return "/User/security";
  } else if (
    ["wallet", "deposit", "withdraw", "balance"].some((keyword) =>
      title.includes(keyword),
    )
  ) {
    return "/User/mywallet";
  } else if (
    ["account", "profile", "email", "username"].some((keyword) =>
      title.includes(keyword),
    )
  ) {
    return "/User/account";
  } else if (
    ["ticket", "support", "help", "faq"].some((keyword) =>
      title.includes(keyword),
    )
  ) {
    return "/User/help";
  } else if (["merchant", "api"].some((keyword) => title.includes(keyword))) {
    return "/User/merchant";
  } else if (
    ["history", "transaction", "payment"].some((keyword) =>
      title.includes(keyword),
    )
  ) {
    return "/User/history";
  } else if (title.includes("ipn")) {
    return "/User/ipnhistory";
  }

  return "";
}

function NotificationDrawer({
  open,
  notifications,
  unreadCount,
  initialLoading = false,
  loadingMore = false,
  hasMore = false,
  onClose,
  onRefresh,
  onLoadMore,
  onDelete,
  onClearAll,
  onMarkAsRead,
  onMarkAllAsRead,
  onNavigate,
}) {
  const hasNotifications = notifications.length > 0;
  const handleScroll = (event) => {
    if (!hasMore || loadingMore || typeof onLoadMore !== "function") return;

    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

    if (distanceFromBottom <= NOTIFICATION_SCROLL_THRESHOLD) {
      onLoadMore();
    }
  };

  return (
    <div
      className={`fixed inset-0 z-[80] ${open ? "" : "pointer-events-none"}`}
      aria-hidden={!open}
    >
      <div
        aria-hidden="true"
        className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ease-out ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="notification-drawer-title"
        className={`absolute right-0 top-0 flex h-dvh w-full max-w-[440px] flex-col border-l border-input-border bg-primary-bg text-theme-text shadow-[0_24px_90px_rgba(0,0,0,0.4)] transition-transform duration-300 ease-out will-change-transform ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center gap-3 border-b border-input-border px-5 py-5">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-secondary-bg text-primary">
            <Bell size={21} />
          </span>
          <div className="min-w-0 flex-1">
            <h2
              id="notification-drawer-title"
              className="text-xl font-bold text-theme-text"
            >
              Notifications
            </h2>
            {/* <p className="text-sm text-secondary-text">
              {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
            </p> */}
          </div>
          <button
            type="button"
            aria-label="Close notifications"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-input-border text-secondary-text transition hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex items-center justify-between gap-3 border-b border-input-border px-5 py-4">
          <button
            type="button"
            aria-label="Reset notifications"
            onClick={onRefresh}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-input-border text-secondary-text transition hover:border-primary hover:text-primary"
          >
            <RefreshCw size={16} />
          </button>

          <div className="flex min-w-0 flex-wrap justify-end gap-2">
            <button
              type="button"
              onClick={onMarkAllAsRead}
              disabled={unreadCount === 0}
              className="inline-flex h-10 items-center gap-2 rounded-full border border-input-border px-4 text-sm font-semibold text-secondary-text transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              <CheckCheck size={16} />
              Read all
            </button>

            <button
              type="button"
              onClick={onClearAll}
              disabled={!hasNotifications}
              className="inline-flex h-10 items-center gap-2 rounded-full border border-input-border px-4 text-sm font-semibold text-secondary-text transition hover:border-red-500 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Trash2 size={16} />
              Clear all
            </button>
          </div>
        </div>

        <div
          data-lenis-prevent="true"
          className="min-h-0 flex-1 overflow-y-auto px-4 py-4"
          onScroll={handleScroll}
        >
          {!hasNotifications ? (
            <div className="flex min-h-[260px] flex-col items-center justify-center rounded-lg border border-dashed border-input-border px-6 text-center">
              {initialLoading ? (
                <>
                  <RefreshCw
                    size={30}
                    className="animate-spin text-secondary-text"
                  />
                  <p className="mt-3 text-base font-semibold text-theme-text">
                    Loading notifications
                  </p>
                </>
              ) : (
                <>
                  <Bell size={30} className="text-secondary-text" />
                  <p className="mt-3 text-base font-semibold text-theme-text">
                    No notifications
                  </p>
                  <p className="mt-1 text-sm text-secondary-text">
                    New account updates will appear here.
                  </p>
                </>
              )}
            </div>
          ) : null}

          {hasNotifications ? (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <article
                  key={notification.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    onMarkAsRead(notification.id);
                    onNavigate?.(notification.title);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      onMarkAsRead(notification.id);
                      onNavigate?.(notification.title);
                    }
                  }}
                  className={`group cursor-pointer rounded-lg border px-4 py-3 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                    notification.isRead
                      ? "border-input-border bg-secondary-bg/60 hover:border-primary/40"
                      : "border-primary/60 bg-primary/10 shadow-[0_12px_35px_rgba(75, 71, 255,0.12)]"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`mt-2 h-2.5 w-2.5 shrink-0 rounded-full ${
                        notification.isRead
                          ? "bg-secondary-text/30"
                          : "bg-primary"
                      }`}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start  gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-theme-text">
                            {notification.title}
                          </p>
                          {notification.description ? (
                            <p className="mt-1 text-sm leading-5 text-secondary-text break-all">
                              {notification.description}
                            </p>
                          ) : null}
                        </div>
                        <div className="flex border border-theme-text/20 rounded-full gap-0 p-0">
                          <button
                            type="button"
                            aria-label="Delete notification"
                            onClick={(event) => {
                              event.stopPropagation();
                              onDelete(notification.id);
                            }}
                            className="cursor-pointer inline-flex h-7 w-7 shrink-0 border-r border-theme-text/20 items-center justify-center text-theme-text/50 opacity-80 transition hover:text-red-500 group-hover:opacity-100"
                          >
                            <Trash2 size={15} />
                          </button>
                          <button
                            type="button"
                            aria-label="Mark as read"
                            onClick={(event) => {
                              event.stopPropagation();
                              onMarkAsRead(notification.id);
                            }}
                            title="Mark as read"
                            className="cursor-pointer inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-theme-text/50 opacity-80 transition  hover:text-primary-text group-hover:opacity-100"
                          >
                            <ArrowUpRight size={15} />
                          </button>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase text-secondary-text">
                        {notification.category ? (
                          <span className="rounded-full border border-input-border px-2 py-1">
                            {notification.category.replace(/_/g, " ")}
                          </span>
                        ) : null}
                        {notification.time ? (
                          <span>{notification.time}</span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </article>
              ))}

              {loadingMore ? (
                <div className="flex items-center justify-center gap-2 rounded-lg border border-input-border bg-secondary-bg/50 px-4 py-3 text-sm font-semibold text-secondary-text">
                  <RefreshCw size={15} className="animate-spin" />
                  Loading more
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </aside>
    </div>
  );
}

/** Static navigation configuration */
const NAV_GROUPS = [
  {
    label: "Overview",
    items: [
      {
        id: "dashboard",
        label: "Dashboard",
        href: "/User/dashboard",
        icon: LayoutDashboard,
      },
      {
        id: "mywallet",
        label: "My Wallet",
        href: "/User/mywallet",
        icon: WalletCards,
      },
    ],
  },
  {
    label: "Business",
    items: [
      {
        id: "merchant",
        label: "Merchant",
        href: "/User/merchant",
        icon: House,
      },
      {
        id: "apikeys",
        label: "API Keys",
        href: "/User/apikeys",
        icon: KeyRound,
      },
      {
        id: "security",
        label: "Security",
        href: "/User/security",
        icon: ShieldCheck,
      },
    ],
  },
  {
    label: "Activity",
    items: [
      {
        id: "history",
        label: "History",
        href: "/User/history",
        icon: ChartNoAxesCombined,
      },
      {
        id: "ipnhistory",
        label: "IPN History",
        href: "/User/ipnhistory",
        icon: RadioTower,
        //  badge: ipnCount,
      },
    ],
  },

  {
    label: "Support",
    items: [
      { id: "faq", label: "FAQ", href: "/User/faq", icon: CircleHelp },
      {
        id: "help",
        label: "Help",
        href: "/User/help",
        icon: MessagesSquare,
      },
      {
        id: "account",
        label: "Account",
        href: "/User/account",
        icon: UserRound,
      },
    ],
  },
];

/** Build a flat id-to-label map for breadcrumb/title resolution */
const ROUTE_META = NAV_GROUPS.flatMap((g) => g.items).reduce(
  (acc, item) => {
    acc[item.href] = item.label;
    return acc;
  },
  {
    "/User/merchant/settings": "Merchant Settings",
    "/User/merchant/payout-request-limit": "Payout Request Limit",
    "/User/merchant/instant-payment-notification":
      "Instant Payment Notification",
    "/User/merchant/simple-button-maker": "Simple Button Maker",
    "/User/merchant/simple-button-examples": "Simple Button Examples",
    "/User/merchant/simple-html-post-fields": "Simple HTML POST Fields",
    "/User/merchant/advanced-button-maker": "Advanced Button Maker",
    "/User/merchant/advanced-button-examples": "Advanced Button Examples",
    "/User/merchant/advanced-html-post-fields": "Advanced HTML POST Fields",
    "/User/merchant/donation-button-maker": "Donation Button Maker",
    "/User/merchant/donation-button-examples": "Donation Button Examples",
    "/User/merchant/donation-html-post-fields": "Donation HTML POST Fields",
    "/User/merchant/pos-how-to-tutorial": "POS How-to Tutorial",
    "/User/merchant/pos-link-qr-generator": "POS Link & QR Generator",
  },
);

const MOBILE_PRIMARY_NAV = [
  {
    id: "dashboard",
    label: "Dashboard",
    href: "/User/dashboard",
    icon: LayoutDashboard,
  },
  {
    id: "mywallet",
    label: "Wallet",
    href: "/User/mywallet",
    icon: WalletCards,
  },
  {
    id: "merchant",
    label: "Merchant",
    href: "/User/merchant",
    icon: House,
  },
  {
    id: "history",
    label: "History",
    href: "/User/history",
    icon: ChartNoAxesCombined,
  },
];

const MERCHANT_ONLY_NAV_IDS = new Set(["merchant", "apikeys", "ipnhistory"]);
const MERCHANT_ONLY_ROUTE_PREFIXES = [
  "/User/merchant",
  "/User/apikeys",
  "/User/ipnhistory",
];

function shouldShowNavigationItem(item, verificationKind) {
  return verificationKind !== "kyc" || !MERCHANT_ONLY_NAV_IDS.has(item.id);
}

function isMerchantOnlyRoute(pathname = "") {
  return MERCHANT_ONLY_ROUTE_PREFIXES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

function SidebarItem({ item, level = 0, onNavigate, getTooltipTriggerProps }) {
  const Icon = item.icon;
  const isChild = level > 0;
  const isActive = item.current || item.active;
  const tooltipTriggerProps = getTooltipTriggerProps?.(item.label) || {};

  return (
    <div className={level > 0 ? "pl-4 md:pl-0" : ""}>
      <Link
        href={item.href}
        onClick={onNavigate}
        aria-label={item.label}
        aria-current={isActive ? "page" : undefined}
        {...tooltipTriggerProps}
        className={`group relative z-10 flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-[16px] font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-text/70 focus-visible:ring-offset-2 focus-visible:ring-offset-primary-bg md:h-11 md:w-11 md:justify-center md:rounded-[14px] md:px-0 md:py-0 ${
          isActive
            ? "text-primary-text"
            : "text-secondary-text hover:bg-secondary-bg"
        }`}
      >
        {isActive ? (
          <>
            <motion.div
              layoutId="sidebarActiveBg"
              className="absolute inset-0 -z-10 rounded-xl md:rounded-[14px]"
              style={{ background: "var(--hoverbtn)" }}
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
            />
            <motion.span
              layoutId="sidebarActiveIndicator"
              className="absolute left-[-8px] top-2 bottom-2 w-1 rounded-r-full bg-[var(--primary)] md:left-0 -z-10"
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
            />
          </>
        ) : null}

        {Icon ? (
          <Icon
            size={20}
            strokeWidth={isActive ? 2.25 : 2}
            absoluteStrokeWidth
            className={`shrink-0 transition-[color,scale,filter,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none group-hover:scale-[1.08] ${
              isActive
                ? "scale-100 text-primary-text opacity-100 drop-shadow-[0_0_7px_color-mix(in_srgb,var(--primary)_55%,transparent)]"
                : "scale-[0.96] text-secondary-text opacity-85 group-hover:text-primary-text group-hover:opacity-100 group-hover:drop-shadow-[0_0_5px_color-mix(in_srgb,var(--primary)_35%,transparent)]"
            } ${isChild ? "ml-1 md:ml-0" : "ml-2 md:ml-0"}`}
          />
        ) : null}

        <span className="text-theme-text md:hidden">{item.label}</span>

        {item.badge ? (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-400 px-1 text-[10px] font-bold text-white md:absolute md:top-1 md:right-1 md:h-4 md:min-w-4 md:text-[8px] md:px-0">
            {item.badge}
          </span>
        ) : null}
      </Link>
    </div>
  );
}

function SidebarSection({ group, onNavigate, getTooltipTriggerProps }) {
  return (
    <div className="mb-4 last:mb-0">
      <p className="mb-2 px-2 text-[15px] font-medium text-theme-text md:hidden">
        {group.label}
      </p>

      <div className="space-y-2 md:space-y-4">
        {group.items.map((item) => (
          <SidebarItem
            key={item.id}
            item={item}
            onNavigate={onNavigate}
            getTooltipTriggerProps={getTooltipTriggerProps}
          />
        ))}
      </div>
    </div>
  );
}

function MobileNavItem({ item, active }) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      aria-label={item.label}
      title={item.label}
      className={`relative inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-[color,transform] duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-button ${
        active
          ? "text-primary-text"
          : "text-white/70 hover:scale-105 hover:text-white"
      }`}
    >
      {active ? (
        <motion.span
          layoutId="mobileNavActiveOrb"
          className="absolute inset-0 rounded-full bg-secondary-button shadow-[0_6px_16px_rgba(0,0,0,0.2)]"
          transition={{ type: "spring", stiffness: 390, damping: 30 }}
        />
      ) : null}
      <Icon
        size={19}
        strokeWidth={active ? 2.25 : 2}
        absoluteStrokeWidth
        className="relative z-10"
      />
    </Link>
  );
}

export default function UserLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const verification = useStoredUserVerification();
  const { isDark, toggleTheme } = useTheme();
  const isLiveChat = pathname === "/User/help/live-chat";
  const showFloatingSupport = !isLiveChat;
  const menuButtonRef = useRef(null);
  const closeButtonRef = useRef(null);
  const restoreMobileNavFocusRef = useRef(false);

  const navRef = useRef(null);
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationPagination, setNotificationPagination] = useState(
    DEFAULT_NOTIFICATION_PAGINATION,
  );
  const [notificationInitialLoading, setNotificationInitialLoading] =
    useState(false);
  const [notificationLoadingMore, setNotificationLoadingMore] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [sidebarProfile, setSidebarProfile] = useState(DEFAULT_SIDEBAR_PROFILE);
  const [sidebarTooltip, setSidebarTooltip] = useState(null);
  const notificationFetchSeqRef = useRef(0);
  const notificationLoadingMoreRef = useRef(false);
  const verificationRefreshInFlightRef = useRef("");
  const unreadCount = unreadNotifications;

  const clearNotifications = useCallback(() => {
    notificationFetchSeqRef.current += 1;
    notificationLoadingMoreRef.current = false;
    setNotifications([]);
    setNotificationPagination(DEFAULT_NOTIFICATION_PAGINATION);
    setNotificationInitialLoading(false);
    setNotificationLoadingMore(false);
    setUnreadNotifications(0);
  }, []);
const baseRoute = getAccountBaseRoute();
  const loadUnreadCount = useCallback(() => {
    return apiClient
      .get(`${baseRoute}/notifications/unread-count`)
      .then((response) => {
        if (typeof response.data?.count === "number") {
          setUnreadNotifications(response.data.count);
        }
      })
      .catch(() => {});
  }, []);

  const loadNotifications = useCallback(
    async ({ page = 1, mode = "replace", quiet = false } = {}) => {
      const token = getStoredAccessToken();

      if (!token) return null;

      const append = mode === "append";

      if (append) {
        if (notificationLoadingMoreRef.current) return null;
        notificationLoadingMoreRef.current = true;
        setNotificationLoadingMore(true);
      } else if (!quiet) {
        setNotificationInitialLoading(true);
      }

      const requestId = ++notificationFetchSeqRef.current;
const baseRoute = getAccountBaseRoute();
      try {
        const response = await apiClient.get(`${baseRoute}/get-notification`, {
          params: { page, limit: NOTIFICATION_PAGE_LIMIT, isRead: false },
        });

        if (requestId !== notificationFetchSeqRef.current) return null;

        const list = getNotificationList(response.data).map(toNotificationItem);
        const pagination = getNotificationPagination(response.data, {
          page,
          limit: NOTIFICATION_PAGE_LIMIT,
          totalDocs: list.length,
          totalPages: 1,
        });

        setNotifications((currentNotifications) =>
          mergeNotificationItems(currentNotifications, list, mode),
        );
        setNotificationPagination(pagination);

        return pagination;
      } catch {
        return null;
      } finally {
        if (append) {
          notificationLoadingMoreRef.current = false;
          setNotificationLoadingMore(false);
        }

        if (!append && requestId === notificationFetchSeqRef.current) {
          setNotificationInitialLoading(false);
        }
      }
    },
    [],
  );

  const refreshVerificationFromNotification = useCallback(
    async (notification) => {
      const kind = getNotificationVerificationKind(notification);

      if (!kind || verificationRefreshInFlightRef.current === kind) return;

      verificationRefreshInFlightRef.current = kind;

      try {
        const response = await apiClient.get(
          kind === "kyc" ? `${baseRoute}/kyc` : `${baseRoute}/kyb-status`,
        );
        writeStoredUserVerification(response.data, kind);
      } catch (error) {
        if (error?.response?.status === 404) {
          writeStoredUserVerification({ [kind]: false }, kind);
        }
      } finally {
        if (verificationRefreshInFlightRef.current === kind) {
          verificationRefreshInFlightRef.current = "";
        }
      }
    },
    [],
  );

  useEffect(() => {
    let cancelled = false;

    const loadSidebarProfile = () => {
      const token = getStoredAccessToken();

      if (!token) {
        setSidebarProfile(DEFAULT_SIDEBAR_PROFILE);
        clearStoredUserVerification();
        return;
      }

      const baseRoute = getAccountBaseRoute();

      if (!baseRoute) return;

      void apiClient
        .post(`${baseRoute}/profile`)
        .then((response) => {
          if (cancelled) return;
          const profileData =
            response.data?.result || response.data?.data || response.data?.user;
          setSidebarProfile(getSidebarProfile(profileData));
          writeStoredUserVerification(response.data);
        })
        .catch((error) => {
          if (!cancelled && error?.response?.status !== 401) {
            console.error("loadSidebarProfile error:", error);
          }
        });
    };

    const verifyToken = () => {
      const token = getStoredAccessToken();

      if (!token) {
        setIsAuthorized(false);
        clearNotifications();
        setSidebarProfile(DEFAULT_SIDEBAR_PROFILE);
        clearStoredUserVerification();
        router.replace("/Auth/login");
        return;
      }

      setIsAuthorized(true);
      loadSidebarProfile();
    };
    const handleProfileChange = (event) => {
      const profileData = event?.detail;

      if (profileData) {
        setSidebarProfile(getSidebarProfile(profileData));
        writeStoredUserVerification(profileData);
        return;
      }

      loadSidebarProfile();
    };

    verifyToken();
    window.addEventListener("storage", verifyToken);
    window.addEventListener(AUTH_CHANGE_EVENT, verifyToken);
    window.addEventListener(USER_PROFILE_CHANGE_EVENT, handleProfileChange);

    return () => {
      cancelled = true;
      window.removeEventListener("storage", verifyToken);
      window.removeEventListener(AUTH_CHANGE_EVENT, verifyToken);
      window.removeEventListener(
        USER_PROFILE_CHANGE_EVENT,
        handleProfileChange,
      );
    };
  }, [clearNotifications, router]);

  useEffect(() => {
    if (!isAuthorized) {
      queueMicrotask(clearNotifications);
      return;
    }

    queueMicrotask(() => {
      void loadNotifications({ page: 1, mode: "replace" });
      void loadUnreadCount();
    });
  }, [clearNotifications, isAuthorized, loadNotifications, loadUnreadCount]);

  useEffect(() => {
    const token = normalizeSocketToken(getStoredAccessToken());

    if (!isAuthorized || !token || !SOCKET_URL) return undefined;

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
    });

    socket.on("connect_error", () => {
      const freshToken = normalizeSocketToken(getStoredAccessToken());

      if (freshToken && socket.auth?.token !== freshToken) {
        socket.auth = { token: freshToken };
      }
    });

    socket.on("forceLogout", () => {
      socket.disconnect();
      setForceLogoutMessage(
        "Your account has been blocked by the administrator.",
      );
      clearAuthTokens();
      clearStoredUserVerification();
      setIsAuthorized(false);
      router.replace("/Auth/login");
    });

    socket.on("notification:new", (payload) => {
      const notification = payload?.data;

      if (!notification || !notification._id) return;

      setNotifications((currentNotifications) => {
        const next = toNotificationItem(notification);
        return [
          next,
          ...currentNotifications.filter((item) => item.id !== next.id),
        ];
      });
      void refreshVerificationFromNotification(notification);
    });

    socket.on("notification:update", (payload) => {
      const notification = payload?.data;

      if (!notification || !notification._id) return;

      if (notification.isRead) {
        setNotifications((current) => current.filter((item) => item.id !== String(notification._id)));
        setUnreadNotifications((prev) => Math.max(0, prev - 1));
        return;
      }

      setNotifications((currentNotifications) =>
        currentNotifications.map((item) =>
          item.id === String(notification._id)
            ? {
                ...item,
                isRead: Boolean(notification.isRead),
                seen: Boolean(notification.seen),
              }
            : item,
        ),
      );
    });

    socket.on("notification:unreadCount", (payload) => {
      const count = payload?.data?.count;

      if (typeof count === "number") {
        setUnreadNotifications(count);
      }
    });

    socket.on("notification:allRead", () => {
      setNotifications([]);
      setNotificationPagination((prev) => ({ ...prev, totalDocs: 0, hasNextPage: false, nextPage: null }));
      setUnreadNotifications(0);
    });

    socket.on("notification:cleared", () => {
      clearNotifications();
    });

    return () => {
      socket.disconnect();
    };
  }, [
    clearNotifications,
    isAuthorized,
    refreshVerificationFromNotification,
    router,
  ]);

  const checkNavScroll = () => {
    if (navRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = navRef.current;
      setCanScrollUp(scrollTop > 0);
      setCanScrollDown(Math.ceil(scrollTop + clientHeight) < scrollHeight);
    }
  };

  useEffect(() => {
    checkNavScroll();
    window.addEventListener("resize", checkNavScroll);
    return () => window.removeEventListener("resize", checkNavScroll);
  }, []);

  useEffect(() => {
    // Re-check scroll when navigation state changes or sidebar opens
    checkNavScroll();
  }, [pathname, sidebarOpen]);

  const scrollNav = (amount) => {
    if (navRef.current) {
      navRef.current.scrollBy({ top: amount, behavior: "smooth" });
    }
  };

  const closeSidebar = (restoreMobileNavFocus = false) => {
    restoreMobileNavFocusRef.current = restoreMobileNavFocus;
    setSidebarOpen(false);
  };

  const showSidebarTooltip = useCallback((label, event) => {
    if (
      typeof window === "undefined" ||
      !window.matchMedia("(min-width: 768px)").matches
    ) {
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const top = Math.min(
      Math.max(rect.top + rect.height / 2, 18),
      window.innerHeight - 18,
    );

    setSidebarTooltip({
      label,
      left: rect.right + SIDEBAR_TOOLTIP_OFFSET,
      top,
    });
  }, []);

  const hideSidebarTooltip = useCallback(() => {
    setSidebarTooltip(null);
  }, []);

  const getSidebarTooltipTriggerProps = useCallback(
    (label) => ({
      onMouseEnter: (event) => showSidebarTooltip(label, event),
      onMouseLeave: hideSidebarTooltip,
      onFocus: (event) => showSidebarTooltip(label, event),
      onBlur: hideSidebarTooltip,
      onClickCapture: hideSidebarTooltip,
    }),
    [hideSidebarTooltip, showSidebarTooltip],
  );

  /** Nav groups with `current` flag set on the active route */
  const navigationState = useMemo(
    () =>
      NAV_GROUPS.map((group) => ({
        ...group,
        items: group.items
          .filter((item) => shouldShowNavigationItem(item, verification.kind))
          .map((item) => ({
            ...item,
            current:
              pathname === item.href || pathname.startsWith(item.href + "/"),
          })),
      })).filter((group) => group.items.length > 0),
    [pathname, verification.kind],
  );

  const mobilePrimaryNav = useMemo(
    () =>
      MOBILE_PRIMARY_NAV.filter((item) =>
        shouldShowNavigationItem(item, verification.kind),
      ),
    [verification.kind],
  );

  const activeMobileItem = mobilePrimaryNav.find(
    (item) => pathname === item.href || pathname.startsWith(item.href + "/"),
  );
  const restrictedIndividualRoute =
    verification.kind === "kyc" && isMerchantOnlyRoute(pathname);

  useEffect(() => {
    if (!restrictedIndividualRoute) return;
    router.replace("/User/dashboard");
  }, [restrictedIndividualRoute, router]);

  /** Page title derived from the current pathname */
  const pageTitle = useMemo(() => {
    // Walk from most-specific to least-specific path segment
    const segments = pathname.split("/").filter(Boolean);
    for (let i = segments.length; i > 0; i--) {
      const candidate = "/" + segments.slice(0, i).join("/");
      if (ROUTE_META[candidate]) return ROUTE_META[candidate];
    }
    return "Dashboard";
  }, [pathname]);

  const resetNotifications = useCallback(() => {
    void loadNotifications({ page: 1, mode: "replace" });
    void loadUnreadCount();
  }, [loadNotifications, loadUnreadCount]);

  const handleLoadMoreNotifications = useCallback(() => {
    if (
      notificationInitialLoading ||
      notificationLoadingMore ||
      !notificationPagination.hasNextPage
    ) {
      return;
    }

    const nextPage =
      notificationPagination.nextPage ?? notificationPagination.page + 1;

    if (nextPage <= notificationPagination.page) return;

    void loadNotifications({ page: nextPage, mode: "append", quiet: true });
  }, [
    loadNotifications,
    notificationInitialLoading,
    notificationLoadingMore,
    notificationPagination.hasNextPage,
    notificationPagination.nextPage,
    notificationPagination.page,
  ]);

  const handleOpenNotifications = () => {
    setNotificationsOpen(true);
    queueMicrotask(() => {
      void loadNotifications({ page: 1, mode: "replace" });
    });
  };

  const handleDeleteNotification = (notificationId) => {
    const id = String(notificationId);
    setNotifications((currentNotifications) =>
      currentNotifications.filter((item) => item.id !== id),
    );
  };

  const handleClearNotifications = () => {
    if (!notifications.length) return;
    setNotifications([]);
    setNotificationPagination({
      ...DEFAULT_NOTIFICATION_PAGINATION,
      totalDocs: 0,
    });
    setUnreadNotifications(0);
    void apiClient.delete(`${baseRoute}/notifications/clear-all`).catch(() => {});
  };

  const handleMarkNotificationRead = (notificationId) => {
    const id = String(notificationId);
    // Optimistically remove from unread list (we show only unread)
    setNotifications((current) => current.filter((item) => item.id !== id));
    setUnreadNotifications((current) => Math.max(0, current - 1));
    void apiClient
      .patch(`${baseRoute}/notifications/${encodeURIComponent(id)}/read`)
      .catch(() => {
        // revert on error - refetch
        void loadNotifications({ page: 1, mode: "replace", quiet: true });
      });
  };

  const handleMarkAllNotificationsRead = () => {
    const prevNotifications = notifications;
    const prevUnread = unreadNotifications;
    setNotifications([]);
    setUnreadNotifications(0);
    setNotificationPagination((prev) => ({ ...prev, totalDocs: 0, hasNextPage: false, nextPage: null }));
    void apiClient.patch(`${baseRoute}/notifications/read-all`).catch(() => {
      // revert on error
      setNotifications(prevNotifications);
      setUnreadNotifications(prevUnread);
    });
  };

  const handleNotificationNavigate = useCallback(
    (notificationTitle) => {
      const href = getNotificationNavigationPath(notificationTitle);
      setNotificationsOpen(false);
      if (href) {
        if (window.location.pathname === href) {
          router.replace(href);
          setTimeout(() => router.replace(href), 50);
        } else {
          router.replace(href);
        }
      }
    },
    [router],
  );

  /** Breadcrumb items: always [Home, FinalRoute] */
  const breadcrumbItems = useMemo(() => {
    const segments = pathname.split("/").filter(Boolean);
    // Find the label for the deepest known route
    let finalLabel = "";
    for (let i = segments.length; i > 0; i--) {
      const candidate = "/" + segments.slice(0, i).join("/");
      if (ROUTE_META[candidate]) {
        finalLabel = ROUTE_META[candidate];
        break;
      }
    }
    if (!finalLabel) finalLabel = segments.at(-1)?.replace(/-/g, " ") ?? "";
    finalLabel = finalLabel.charAt(0).toUpperCase() + finalLabel.slice(1);
    return [
      { label: "Home", href: "/User/dashboard" },
      { label: finalLabel, href: pathname },
    ];
  }, [pathname]);

  useEffect(() => {
    const handleKybSecurityRequired = () => {
      router.push("/User/security");
    };

    window.addEventListener(
      KYB_SECURITY_REDIRECT_EVENT,
      handleKybSecurityRequired,
    );

    return () => {
      window.removeEventListener(
        KYB_SECURITY_REDIRECT_EVENT,
        handleKybSecurityRequired,
      );
    };
  }, [router]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSidebarOpen(false);
      setNotificationsOpen(false);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow =
      sidebarOpen || notificationsOpen ? "hidden" : previousOverflow;

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [sidebarOpen, notificationsOpen]);

  useEffect(() => {
    if (!notificationsOpen && !sidebarOpen) return undefined;

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        if (sidebarOpen) {
          restoreMobileNavFocusRef.current = true;
          setSidebarOpen(false);
        }
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [notificationsOpen, sidebarOpen]);

  useEffect(() => {
    if (sidebarOpen) {
      closeButtonRef.current?.focus();
      return;
    }

    if (
      restoreMobileNavFocusRef.current &&
      window.matchMedia("(max-width: 767px)").matches
    ) {
      menuButtonRef.current?.focus();
    }
    restoreMobileNavFocusRef.current = false;
  }, [sidebarOpen]);

  const handleLogout = () => {
    clearAuthTokens();
    clearStoredUserVerification();
    setIsAuthorized(false);
    router.replace("/Auth/login");
  };
  const themeTooltipLabel = isDark
    ? "Switch to light theme"
    : "Switch to dark theme";

  if (!isAuthorized) {
    return <div className="min-h-dvh bg-primary-bg" />;
  }

  if (restrictedIndividualRoute) {
    return <div className="min-h-dvh bg-primary-bg" />;
  }

  return (
    <div className="flex h-dvh overflow-hidden bg-primary-bg text-theme-text">
      <button
        type="button"
        aria-label="Close navigation"
        aria-hidden={!sidebarOpen}
        tabIndex={sidebarOpen ? 0 : -1}
        className={`fixed inset-0 z-40 md:hidden transition-opacity duration-300 ease-out ${
          sidebarOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        style={{ background: "var(--shell-overlay)" }}
        onClick={() => closeSidebar(true)}
      />

      <aside
        id="user-sidebar"
        className={`fixed inset-y-0 left-0 z-50 flex w-[min(85vw,20rem)] -translate-x-full flex-col border-r border-input-border bg-primary-bg shadow-[0_24px_80px_rgba(0,0,0,0.18)] transition-[transform,opacity] duration-300 ease-out will-change-transform md:static md:w-[80px] md:translate-x-0 md:shadow-none ${
          sidebarOpen
            ? "translate-x-0 opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none md:opacity-100 md:pointer-events-auto"
        }`}
      >
        <div className="flex h-16 shrink-0 items-center justify-between  px-4 md:justify-center">
          {/* Logo */}
          <Link
            href="/"
            aria-label="Eco Banx home"
            {...getSidebarTooltipTriggerProps("Eco Banx home")}
            className="flex items-center justify-center"
          >
            <img
              src={ECO_BANX_LOGO_SRC}
              alt="Eco Banx"
              width={44}
              height={44}
              // priority
              className="h-11 w-11 object-contain"
            />
          </Link>

          {/* Mobile-only close button shown right of logo */}
          <div className="flex items-center gap-1.5 md:hidden">
            <button
              ref={closeButtonRef}
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-input-border text-secondary-text transition hover:border-primary-text hover:text-primary-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-text"
              onClick={() => closeSidebar(true)}
              aria-label="Close sidebar"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="relative flex-1 flex flex-col min-h-0 group/scroll">
          {/* Scroll Up Button */}
          {canScrollUp ? (
            <div className="absolute top-0 inset-x-0 h-10 bg-gradient-to-b from-primary-bg via-primary-bg/90 to-transparent z-20 flex items-start justify-center opacity-0 group-hover/scroll:opacity-100 transition-opacity duration-300 pointer-events-none">
              <button
                onClick={() => scrollNav(-120)}
                className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-secondary-bg border border-input-border text-secondary-text shadow-sm hover:text-primary hover:border-primary pointer-events-auto transition-all"
                aria-label="Scroll up"
                {...getSidebarTooltipTriggerProps("Scroll up")}
              >
                <ChevronUp size={14} strokeWidth={3} />
              </button>
            </div>
          ) : null}

          <nav
            ref={navRef}
            onScroll={checkNavScroll}
            data-lenis-prevent="true"
            className="flex-1 overflow-y-auto px-4 py-5 flex flex-col [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          >
            <div className="flex-1">
              {navigationState.map((group) => (
                <SidebarSection
                  key={group.label}
                  group={group}
                  onNavigate={() => closeSidebar()}
                  getTooltipTriggerProps={getSidebarTooltipTriggerProps}
                />
              ))}
            </div>

            {/* Theme & Notifications (Scrollable) */}
            <div className="mt-6 flex flex-col gap-4 md:items-center">
              <button
                type="button"
                aria-pressed={isDark}
                aria-label={themeTooltipLabel}
                onClick={toggleTheme}
                {...getSidebarTooltipTriggerProps(themeTooltipLabel)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-secondary-text transition hover:text-primary-text hover:bg-secondary-bg md:h-11 md:w-11 md:rounded-[14px]"
              >
                {isDark ? <SunMedium size={20} /> : <MoonStar size={20} />}
              </button>

              <div className="relative flex">
                <button
                  type="button"
                  onClick={handleOpenNotifications}
                  className={`relative inline-flex h-11 w-11 items-center justify-center rounded-xl transition hover:text-primary-text hover:bg-secondary-bg md:h-11 md:w-11 md:rounded-[14px] ${
                    notificationsOpen
                      ? "bg-secondary-bg text-primary-text"
                      : "text-secondary-text"
                  }`}
                  aria-label="Notifications"
                  aria-expanded={notificationsOpen}
                  {...getSidebarTooltipTriggerProps("Notifications")}
                >
                  <Bell size={20} />
                  {unreadNotifications > 0 ? (
                    <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white ring-2 ring-primary-bg">
                      {unreadNotifications > 99 ? "99+" : unreadNotifications}
                    </span>
                  ) : null}
                </button>
              </div>
            </div>
          </nav>

          {/* Scroll Down Button */}
          {canScrollDown ? (
            <div className="absolute bottom-0 inset-x-0 h-10 bg-gradient-to-t from-primary-bg via-primary-bg/90 to-transparent z-20 flex items-end justify-center opacity-0 group-hover/scroll:opacity-100 transition-opacity duration-300 pointer-events-none">
              <button
                onClick={() => scrollNav(120)}
                className="mb-1 flex h-6 w-6 items-center justify-center rounded-full bg-secondary-bg border border-input-border text-secondary-text shadow-sm hover:text-primary hover:border-primary pointer-events-auto transition-all"
                aria-label="Scroll down"
                {...getSidebarTooltipTriggerProps("Scroll down")}
              >
                <ChevronDown size={14} strokeWidth={3} />
              </button>
            </div>
          ) : null}
        </div>

        {/* Sidebar Footer: Profile & Logout (Sticky) */}
        <div className="border-t border-input-border p-4 md:p-3 flex flex-col gap-4 md:items-center shrink-0">
          <div className="flex items-center justify-between md:flex-col md:gap-4 w-full md:w-auto">
            <Link
              href="/User/account"
              aria-label="Account"
              {...getSidebarTooltipTriggerProps("Account")}
              className="flex items-center gap-3 group"
            >
              <SidebarProfileAvatar
                src={sidebarProfile.profilePicture}
                name={sidebarProfile.name}
                email={sidebarProfile.email}
              />
              <div className="md:hidden">
                <p className="text-sm font-semibold text-theme-text group-hover:text-primary transition">
                  {sidebarProfile.name}
                </p>
                {sidebarProfile.email ? (
                  <p className="max-w-[11rem] truncate text-xs text-secondary-text">
                    {sidebarProfile.email}
                  </p>
                ) : null}
              </div>
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="text-secondary-text hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-500/10 md:w-11 md:h-11 md:flex md:items-center md:justify-center"
              aria-label="Log out"
              {...getSidebarTooltipTriggerProps("Log out")}
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <main
          data-lenis-prevent="true"
          className={`min-h-0 flex-1 bg-[var(--dashboardbg)] p-4 pb-28 scrollbar-thin scrollbar-thumb-input-border sm:p-6 sm:pb-28 md:pb-6 ${
            isLiveChat
              ? "flex overflow-hidden"
              : sidebarOpen
                ? "overflow-hidden"
                : "overflow-y-auto"
          }`}
        >
          {children}
        </main>
      </div>

      <nav
        className={`fixed bottom-4 left-1/2 z-[60] flex h-14 w-[calc(100%-32px)] max-w-[22rem] -translate-x-1/2 items-center justify-between rounded-full border border-primary-text/40 px-2 transition-opacity duration-200 md:hidden ${
          sidebarOpen ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
        aria-label="Primary navigation"
        style={{
          background: "var(--primary-deep)",
          bottom: "max(16px, env(safe-area-inset-bottom))",
          boxShadow:
            "0 16px 32px color-mix(in srgb, var(--primary) 28%, transparent)",
        }}
      >
        {mobilePrimaryNav.map((item) => (
          <MobileNavItem
            key={item.id}
            item={item}
            active={activeMobileItem?.id === item.id}
          />
        ))}
        <button
          ref={menuButtonRef}
          type="button"
          aria-label="Open all pages"
          aria-controls="user-sidebar"
          aria-expanded={sidebarOpen}
          onClick={() => setSidebarOpen(true)}
          title="All pages"
          className={`relative inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-[color,transform] duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-button ${
            !activeMobileItem
              ? "text-primary-text"
              : "text-white/70 hover:scale-105 hover:text-white"
          }`}
        >
          {!activeMobileItem ? (
            <motion.span
              layoutId="mobileNavActiveOrb"
              className="absolute inset-0 rounded-full bg-secondary-button shadow-[0_6px_16px_rgba(0,0,0,0.2)]"
              transition={{ type: "spring", stiffness: 390, damping: 30 }}
            />
          ) : null}
          <MoreHorizontal
            size={21}
            strokeWidth={!activeMobileItem ? 2.25 : 2}
            absoluteStrokeWidth
            className="relative z-10"
          />
        </button>
      </nav>

      <NotificationDrawer
        open={notificationsOpen}
        notifications={notifications}
        unreadCount={unreadCount}
        initialLoading={notificationInitialLoading}
        loadingMore={notificationLoadingMore}
        hasMore={notificationPagination.hasNextPage}
        onClose={() => setNotificationsOpen(false)}
        onRefresh={resetNotifications}
        onLoadMore={handleLoadMoreNotifications}
        onDelete={handleDeleteNotification}
        onClearAll={handleClearNotifications}
        onMarkAsRead={handleMarkNotificationRead}
        onMarkAllAsRead={handleMarkAllNotificationsRead}
        onNavigate={handleNotificationNavigate}
      />

      {/* {showFloatingSupport && !sidebarOpen ? (
        <button
          type="button"
          aria-label="Support chat"
          title="Support chat"
          className="fixed bottom-24 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-[0_8px_30px_rgba(75, 71, 255,0.3)] transition-all duration-300 hover:scale-110 hover:shadow-[0_12px_40px_rgba(75, 71, 255,0.4)] active:scale-95 md:bottom-6"
        >
          <MessageSquare size={24} className="fill-current stroke-[1.5]" />
        </button>
      ) : null} */}

      <SidebarTooltipPortal tooltip={sidebarTooltip} />
    </div>
  );
}
