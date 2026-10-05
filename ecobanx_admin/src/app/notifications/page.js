"use client";

import { Tabs, Toast } from "@/components/ReusableUi";
import { patchWithTokenApi, deleteWithTokenApi } from "@/lib/apiHelper";
import { getAuthToken } from "@/lib/axiosInterceptor";
import { formatApiDate } from "@/lib/dateFormat";
import {
  fetchNotificationPage,
  getNotificationItems,
  getNotificationPagination,
  getNotificationTotalDocs,
  markNotificationAsRead,
  NOTIFICATION_PAGE_SIZE,
  storeNotificationTotal,
} from "@/lib/notificationSummary";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  Bell,
  CheckCheck,
  CheckCircle2,
  Clock3,
  RefreshCw,
  ShieldAlert,
  Ticket,
  Trash2,
  UserPlus,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || "")
  .replace(/\/eco-banx\/admin\/?$/, "")
  .replace(/\/$/, "");

const notificationTabs = [
  { label: "All", value: "all" },
  // { label: "Support", value: "SUPPORT" },
  // { label: "Onboarding", value: "ONBOARDING" },
  // { label: "Security", value: "SECURITY" },
];

function getCategoryFilter(value) {
  return value === "all" ? null : value;
}

function notificationnavigate(title, router) {
  const text = title?.toLowerCase() || "";

  if (
    [
      "merchant",
      "register",
      "2fa",
      "two-factor",
      "client",
      "business",
      "individual",
      "verified",
    ].some((keyword) => text.includes(keyword))
  ) {
    router.replace("/merchants");
  } else if (text.includes("network")) {
    router.replace("/network");
  } else if (text.includes("assets")) {
    router.replace("/assets");
  } else if (
    ["limit", "withdrawlimit", "withdraw request"].some((keyword) =>
      text.includes(keyword),
    )
  ) {
    router.replace("/withdrawfee");
  } else if (text.includes("kyc")) {
    router.replace("/kyc");
  } else if (text.includes("kyb")) {
    router.replace("/kyb");
  } else if (text.includes("deposit")) {
    router.replace("/deposit");
  } else if (text.includes("withdraw")) {
    router.replace("/withdraw");
  } else if (text.includes("category")) {
    router.replace("/support-category");
  } else if (
    ["tickets", "help", "support"].some((keyword) => text.includes(keyword))
  ) {
    router.replace("/support");
  } else if (
    ["name", "email", "number", "mobile", "phone", "password", "role"].some(
      (keyword) => text.includes(keyword),
    )
  ) {
    router.replace("/account");
  }
}

const statusClasses = {
  success: "bg-emerald-500/10 text-emerald-300 ring-emerald-500/20",
  info: "bg-blue-500/10 text-blue-300 ring-blue-500/20",
  warning: "bg-yellow-500/10 text-yellow-300 ring-yellow-500/20",
  error: "bg-red-500/10 text-red-300 ring-red-500/20",
};

const categoryIcons = {
  ONBOARDING: UserPlus,
  SUPPORT: Ticket,
  SECURITY: ShieldAlert,
};

function getNotificationErrorMessage(error) {
  const data = error.response?.data;

  return (
    data?.message ||
    data?.msg ||
    data?.error ||
    "Unable to update notifications."
  );
}

function getNotificationId(notification) {
  return notification?._id ?? notification?.id ?? notification?.notificationId;
}

function mergeNotifications(currentNotifications, nextNotifications) {
  const seenIds = new Set();
  const mergedNotifications = [];

  [...currentNotifications, ...nextNotifications].forEach((notification) => {
    const notificationId = getNotificationId(notification);
    const uniqueKey = notificationId
      ? String(notificationId)
      : `${notification?.createdAt || ""}-${notification?.title || ""}`;

    if (seenIds.has(uniqueKey)) {
      return;
    }

    seenIds.add(uniqueKey);
    mergedNotifications.push(notification);
  });

  return mergedNotifications;
}

function resolvePaginationState(
  pagination,
  fallbackPage,
  fallbackLimit,
  totalItems,
) {
  const page = Number(
    pagination?.page ?? pagination?.currentPage ?? fallbackPage,
  );
  const limit = Number(
    pagination?.limit ?? pagination?.pageSize ?? fallbackLimit,
  );
  const totalPages = Number(
    pagination?.totalPages ??
      Math.max(1, Math.ceil(totalItems / fallbackLimit)),
  );
  const nextPage =
    pagination?.nextPage ?? (page < totalPages ? page + 1 : null);
  const hasNextPage =
    pagination?.hasNextPage ??
    Boolean(nextPage && Number(nextPage) <= totalPages);

  return {
    page: Number.isFinite(page) && page > 0 ? page : fallbackPage,
    limit: Number.isFinite(limit) && limit > 0 ? limit : fallbackLimit,
    totalPages: Number.isFinite(totalPages) && totalPages > 0 ? totalPages : 1,
    hasNextPage,
    nextPage,
  };
}

function NotificationItem({ notification, onMarkRead, onNavigate }) {
  const Icon = categoryIcons[notification.category] || Bell;
  const statusClass = statusClasses[notification.status] || statusClasses.info;
  const handleClick = () => {
    if (!notification.isRead) onMarkRead(notification);
    onNavigate(notification?.title);
  };

  return (
    <article
      onClick={handleClick}
      className={`flex gap-4 border-b border-input-border/40 px-4 py-4 last:border-b-0 sm:px-5 ${
        notification.isRead ? "cursor-pointer" : "cursor-pointer select-none hover:bg-input-bg/40"
      }`}
    >
      <span className="mt-1 grid h-10 w-10 shrink-0 place-items-center rounded-full bg-input-bg text-text-primary">
        <Icon className="h-4 w-4" />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              {!notification.isRead && (
                <span className="h-2 w-2 shrink-0 rounded-full bg-text-primary shadow-[0_0_14px_rgba(124,58,237,0.45)]" />
              )}
              {notification.title || "No Title available."}
            </div>
            <p className="mt-1 text-small leading-6 text-text-secondary">
              {notification.description || "No description available."}
            </p>
          </div>

          <span
            className={`cursor-pointer inline-flex w-fit shrink-0 items-center rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase text-text-primary hover:rotate-[45deg]`}
            onClick={(event) => {
              event.stopPropagation();
              if (!notification.seen) onMarkRead(notification);
            }}
            title="Mark as read"
          >
            <ArrowUpRight size={20} />
          </span>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-small text-text-secondary/75">
          <span className="rounded-full bg-text-primary/40 px-2 py-1 font-medium uppercase text-theme-text">
            {notification.category || "GENERAL"}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock3 className="h-3.5 w-3.5" />
            {formatApiDate(notification.createdAt)}
          </span>
          {notification.seen && (
            <span className="inline-flex items-center gap-1.5 text-emerald-300">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Seen
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [notifications, setNotifications] = useState([]);
  const [notificationPage, setNotificationPage] = useState(1);
  const [notificationLimit, setNotificationLimit] = useState(
    NOTIFICATION_PAGE_SIZE,
  );
  const router = useRouter();
  const [notificationTotalPages, setNotificationTotalPages] = useState(1);
  const [notificationHasNextPage, setNotificationHasNextPage] = useState(false);
  const [notificationNextPage, setNotificationNextPage] = useState(null);
  const [notificationInitialLoading, setNotificationInitialLoading] =
    useState(true);
  const [notificationLoadingMore, setNotificationLoadingMore] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [toast, setToast] = useState(null);
  const inFlightRef = useRef(false);
  const loadNotificationsRef = useRef(null);
  const activeTabRef = useRef(activeTab);

  const filteredNotifications = useMemo(() => {
    if (activeTab === "all") {
      return notifications;
    }

    return notifications.filter(
      (notification) => notification.category === activeTab,
    );
  }, [activeTab, notifications]);

  const loadNotifications = useCallback(
    async ({ page = 1, mode = "replace", limit = notificationLimit } = {}) => {
      if (inFlightRef.current) {
        return;
      }

      const token = getAuthToken();

      if (!token) {
        setToast({
          id: Date.now(),
          content: "Session token not found",
          color: "error",
        });
        setNotificationInitialLoading(false);
        setNotificationLoadingMore(false);
        return;
      }

      inFlightRef.current = true;
      const appendMode = mode === "append";

      if (appendMode) {
        setNotificationLoadingMore(true);
      } else {
        setNotificationInitialLoading(true);
      }

      try {
        const response = await fetchNotificationPage(token, {
          page,
          limit,
          category: getCategoryFilter(activeTabRef.current),
          isRead: false,
        });
        const nextNotifications = getNotificationItems(response);
        const nextPagination = getNotificationPagination(response);
        const nextTotalItems = getNotificationTotalDocs(response);
        const nextState = resolvePaginationState(
          nextPagination,
          page,
          limit,
          nextTotalItems,
        );

        setNotifications((currentNotifications) =>
          appendMode
            ? mergeNotifications(currentNotifications, nextNotifications)
            : nextNotifications,
        );
        setTotalItems(nextTotalItems);
        setNotificationPage(nextState.page);
        setNotificationLimit(nextState.limit);
        setNotificationTotalPages(nextState.totalPages);
        setNotificationHasNextPage(nextState.hasNextPage);
        setNotificationNextPage(nextState.nextPage);

        if (activeTabRef.current === "all") {
          storeNotificationTotal(nextTotalItems);
        }

        if (nextState.page > nextState.totalPages && nextState.totalPages > 0) {
          queueMicrotask(() => {
            void loadNotificationsRef.current?.({
              page: nextState.totalPages,
              mode: "replace",
              limit: nextState.limit,
            });
          });
        }
      } catch (error) {
        setToast({
          id: Date.now(),
          content: getNotificationErrorMessage(error),
          color: "error",
        });
      } finally {
        inFlightRef.current = false;
        setNotificationInitialLoading(false);
        setNotificationLoadingMore(false);
      }
    },
    [notificationLimit],
  );

  useEffect(() => {
    loadNotificationsRef.current = loadNotifications;
  }, [loadNotifications]);

  const handleRefreshNotifications = useCallback(() => {
    void loadNotifications({ page: 1, mode: "replace" });
  }, [loadNotifications]);

  const handleNotificationNavigate = useCallback(
    (title) => {
      notificationnavigate(title, router);
    },
    [router],
  );

  useEffect(() => {
    activeTabRef.current = activeTab;
  }, [activeTab]);

  const handleTabChange = useCallback(
    (nextTab) => {
      if (nextTab === activeTab) {
        return;
      }

      activeTabRef.current = nextTab;
      setActiveTab(nextTab);
      setNotificationPage(1);
      void loadNotifications({ page: 1, mode: "replace" });
    },
    [activeTab, loadNotifications],
  );

  const handleNotificationScroll = useCallback(
    (event) => {
      const target = event.currentTarget;
      const distanceFromBottom =
        target.scrollHeight - target.scrollTop - target.clientHeight;

      if (
        distanceFromBottom > 120 ||
        notificationLoadingMore ||
        notificationInitialLoading ||
        !notificationHasNextPage
      ) {
        return;
      }

      void loadNotifications({
        page: notificationNextPage || notificationPage + 1,
        mode: "append",
      });
    },
    [
      loadNotifications,
      notificationHasNextPage,
      notificationInitialLoading,
      notificationLoadingMore,
      notificationNextPage,
      notificationPage,
    ],
  );

  async function handleMarkAsRead(notification) {
    const token = getAuthToken();
    const notificationId = getNotificationId(notification);

    if (!token) {
      setToast({
        id: Date.now(),
        content: "Session token not found",
        color: "error",
      });
      return;
    }

    if (!notificationId) {
      setToast({
        id: Date.now(),
        content: "Notification ID not found",
        color: "error",
      });
      return;
    }

    // Optimistically update UI: mark as read will be filtered out since we show only unread
    const wasUnread = !notification.isRead;
    if (wasUnread) {
      setNotifications((current) =>
        current.filter((item) => String(getNotificationId(item)) !== String(notificationId)),
      );
      setTotalItems((prev) => Math.max(0, prev - 1));
    }

    try {
      await markNotificationAsRead(token, notificationId);
      // keep filtered - already removed from unread list
      if (wasUnread) {
        const pagination = getNotificationPagination({ pagination: { totalDocs: totalItems - 1 } });
        storeNotificationTotal(Math.max(0, totalItems - 1));
      }
    } catch (error) {
      // revert on error
      if (wasUnread) {
        setNotifications((current) => {
          if (current.some((item) => String(getNotificationId(item)) === String(notificationId))) return current;
          return [notification, ...current];
        });
        setTotalItems((prev) => prev + 1);
      }
      setToast({
        id: Date.now(),
        content: getNotificationErrorMessage(error),
        color: "error",
      });
    }
  }

  async function handleMarkAllRead() {
    const token = getAuthToken();

    if (!token) {
      setToast({
        id: Date.now(),
        content: "Session token not found",
        color: "error",
      });
      return;
    }

    const previousNotifications = notifications;
    const previousTotal = totalItems;
    // Optimistically clear unread list
    setNotifications([]);
    setTotalItems(0);
    setNotificationHasNextPage(false);
    setNotificationNextPage(null);
    storeNotificationTotal(0);

    try {
      await patchWithTokenApi(token, "/notifications/read-all");
    } catch (error) {
      // revert
      setNotifications(previousNotifications);
      setTotalItems(previousTotal);
      setToast({
        id: Date.now(),
        content: getNotificationErrorMessage(error),
        color: "error",
      });
    }
  }

  async function handleClearAll() {
    const token = getAuthToken();

    if (!token) {
      setToast({
        id: Date.now(),
        content: "Session token not found",
        color: "error",
      });
      return;
    }

    try {
      await deleteWithTokenApi(token, "/notifications/clear-all");
      setNotifications([]);
      setNotificationPage(1);
      setTotalItems(0);
      setNotificationTotalPages(1);
      setNotificationHasNextPage(false);
      setNotificationNextPage(null);
      storeNotificationTotal(0);
    } catch (error) {
      setToast({
        id: Date.now(),
        content: getNotificationErrorMessage(error),
        color: "error",
      });
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadNotifications({ page: 1, mode: "replace" });
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadNotifications]);

  useEffect(() => {
    const token = getAuthToken();

    if (!token || !SOCKET_URL) {
      return undefined;
    }

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
    });

    socket.on("connect_error", () => {
      const freshToken = getAuthToken();

      if (freshToken && socket.auth?.token !== freshToken) {
        socket.auth = { token: freshToken };
      }
    });

    socket.on("notification:new", (payload) => {
      const notification = payload?.data;
      const notificationId = getNotificationId(notification);

      if (!notification || !notificationId) {
        return;
      }

      const selectedCategory = activeTabRef.current;

      if (
        selectedCategory !== "all" &&
        notification.category !== selectedCategory
      ) {
        return;
      }

      setNotifications((currentNotifications) => {
        if (
          currentNotifications.some(
            (item) =>
              String(getNotificationId(item)) === String(notificationId),
          )
        ) {
          return currentNotifications;
        }

        return [notification, ...currentNotifications];
      });
      setTotalItems((currentTotal) => {
        const nextTotalItems = currentTotal + 1;

        if (selectedCategory === "all") {
          storeNotificationTotal(nextTotalItems);
        }

        return nextTotalItems;
      });
    });

    socket.on("notification:allRead", () => {
      setNotifications([]);
      setTotalItems(0);
      setNotificationHasNextPage(false);
      setNotificationNextPage(null);
      storeNotificationTotal(0);
    });

    socket.on("notification:update", (payload) => {
      const notification = payload?.data;
      const notificationId = getNotificationId(notification);

      if (!notification || !notificationId) {
        return;
      }

      // Since we show only unread, if notification is now read, remove it from list
      if (notification.isRead) {
        setNotifications((current) =>
          current.filter((item) => String(getNotificationId(item)) !== String(notificationId)),
        );
        setTotalItems((prev) => Math.max(0, prev - 1));
        storeNotificationTotal(Math.max(0, getStoredNotificationTotal() - 1));
        return;
      }

      setNotifications((currentNotifications) =>
        currentNotifications.map((item) =>
          String(getNotificationId(item)) === String(notificationId)
            ? {
                ...item,
                isRead: notification.isRead ?? item.isRead,
                seen: notification.seen ?? item.seen,
              }
            : item,
        ),
      );
    });

    socket.on("notification:cleared", () => {
      setNotifications([]);
      setNotificationPage(1);
      setTotalItems(0);
      setNotificationTotalPages(1);
      setNotificationHasNextPage(false);
      setNotificationNextPage(null);
      storeNotificationTotal(0);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const selectedTab = notificationTabs.find((tab) => tab.value === activeTab);
  const visibleCountLabel = `${totalItems} item${totalItems === 1 ? "" : "s"}`;

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed right-4 top-4 z-[80] w-[calc(100vw-2rem)] max-w-md sm:right-6 sm:top-6">
          <Toast
            key={toast.id}
            content={toast.content}
            color={toast.color}
            duration={2500}
          />
        </div>
      )}

      <section className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-theme-text">
          Notifications
        </h1>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleMarkAllRead}
            className="inline-flex items-center gap-2 rounded-full border border-input-border px-4 py-2 text-small font-semibold text-text-secondary transition hover:border-primary hover:text-primary"
          >
            <CheckCheck size={15} />
            Read all
          </button>

          <button
            type="button"
            onClick={handleRefreshNotifications}
            disabled={notificationInitialLoading || notificationLoadingMore}
            className="inline-flex items-center gap-2 rounded-full border border-input-border px-4 py-2 text-small font-semibold text-text-secondary transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              size={15}
              className={notificationInitialLoading ? "animate-spin" : ""}
            />
            Refresh
          </button>

          {/* <button
            type="button"
            onClick={handleClearAll}
            disabled={!notifications.length}
            className="inline-flex items-center gap-2 rounded-full border border-input-border px-4 py-2 text-small font-semibold text-text-secondary transition hover:border-red-400 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Trash2 size={15} />
            Clear all
          </button> */}
        </div>
      </section>

      <Tabs
        tabs={notificationTabs}
        value={activeTab}
        onChange={handleTabChange}
        variant="pill"
        className="max-w-5xl"
      />

      <section className="max-w-5xl overflow-hidden rounded-rounded border border-input-border/40 bg-card-bg">
        <div className="flex items-center justify-between gap-3 border-b border-input-border/30 px-4 py-3 sm:px-5">
          <div>
            <h2 className="text-mid font-semibold text-theme-text">
              {selectedTab?.label} notifications
            </h2>
            <p className="mt-1 text-small text-text-secondary">
              {visibleCountLabel}
            </p>
          </div>
        </div>

        <div
          className="h-[calc(100vh-280px)] min-h-80 overflow-y-auto"
          onScroll={handleNotificationScroll}
        >
          {notificationInitialLoading ? (
            <div className="grid h-full place-items-center px-5 py-10 text-small text-text-secondary">
              <span className="inline-flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-text-secondary/25 border-t-text-primary" />
                Loading notifications...
              </span>
            </div>
          ) : filteredNotifications.length > 0 ? (
            <>
              {filteredNotifications.map((notification, index) => (
                <NotificationItem
                  key={
                    getNotificationId(notification) ||
                    `${notification.createdAt}-${index}`
                  }
                  notification={notification}
                  onMarkRead={handleMarkAsRead}
                  onNavigate={handleNotificationNavigate}
                />
              ))}
              {notificationLoadingMore && (
                <div className="flex items-center justify-center gap-2 px-5 py-4 text-small text-text-secondary">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-text-secondary/25 border-t-text-primary" />
                  Loading more...
                </div>
              )}
              {!notificationHasNextPage && notifications.length > 0 && (
                <div className="px-5 py-4 text-center text-small text-text-secondary/75">
                  All notifications loaded
                </div>
              )}
            </>
          ) : (
            <div className="grid h-full place-items-center px-5 py-10 text-small text-text-secondary">
              No notifications found.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
