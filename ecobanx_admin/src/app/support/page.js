"use client";

import { Button, Input, Tabs, Toast } from "@/components/ReusableUi";
import { Pagination } from "@/components/ReusableUi/Table";
import { getWithTokenApi, postWithTokenApi } from "@/lib/apiHelper";
import { getAuthToken } from "@/lib/axiosInterceptor";
import { formatApiDate } from "@/lib/dateFormat";
import { io } from "socket.io-client";
import {
  ArrowLeft,
  CheckCheck,
  CheckCircle2,
  Lock,
  Mail,
  MessageSquare,
  Plus,
  Search,
  Send,
  Ticket,
  UserRound,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

const SOCKET_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || "")
  .replace(/\/eco-banx\/admin\/?$/, "")
  .replace(/\/$/, "");

const tabs = [
  { label: "Open", value: "open" },
  { label: "Closed", value: "closed" },
];

const statusClasses = {
  open: "bg-blue-500/15 text-blue-300",
  closed: "bg-red-400/20 text-red-400",
};

const priorityClasses = {
  high: "bg-red-500/15 text-red-400",
  medium: "bg-amber-500/15 text-amber-300",
  low: "bg-emerald-500/15 text-text-primary",
};

function joinClasses(...classes) {
  return classes.filter(Boolean).join(" ");
}

function getTicketErrorMessage(
  error,
  fallbackMessage = "Unable to load support tickets.",
) {
  const data = error.response?.data;

  return (
    data?.message ||
    data?.msg ||
    data?.error ||
    data?.errors?.msg ||
    fallbackMessage
  );
}

function getTicketCategory(ticket) {
  if (ticket.customCategory) {
    return `Custom Category: ${ticket.customCategory}`;
  }

  return ticket.category?.name || "Uncategorized";
}

function getAssignedName(assignedTo) {
  if (!assignedTo) {
    return "Unassigned";
  }

  if (typeof assignedTo === "string") {
    return assignedTo;
  }

  return (
    assignedTo.fullName || assignedTo.name || assignedTo.email || "Assigned"
  );
}

function normalizeTicket(ticket) {
  const messages = Array.isArray(ticket.messages) ? ticket.messages : [];
  const lastMessage =
    ticket.lastMessage !== undefined
      ? ticket.lastMessage
      : messages.length
        ? messages[messages.length - 1]
        : null;
  const unreadCount =
    typeof ticket.unreadCount === "number"
      ? ticket.unreadCount
      : messages.filter((m) => m.senderType === "user" && !m.seen).length;

  return {
    ...ticket,
    id: String(ticket._id || ticket.id || ticket.ticketId),
    ticketId: String(ticket._id || ticket.id || ticket.ticketId),
    requester:
      ticket.userId?.fullName || ticket.userId?.email || "Unknown user",
    requesterEmail: ticket.userId?.email || "-",
    subject: ticket.title || "-",
    categoryName: getTicketCategory(ticket),
    assignedToName: getAssignedName(ticket.assignedTo),
    date: formatApiDate(ticket.createdAt),
    lastMessage,
    unreadCount,
    messages,
  };
}

function PriorityBadge({ value }) {
  const priority = String(value || "").toLowerCase();

  return (
    <span
      className={joinClasses(
        "inline-flex rounded-full px-2.5 py-1 text-small font-medium leading-none",
        priorityClasses[priority] || "bg-input-bg text-text-secondary",
      )}
    >
      {value || "-"}
    </span>
  );
}

function TicketListItem({ ticket, selected, onClick }) {
  const preview = ticket.lastMessage?.message || ticket.description || "";
  const lastTime = ticket.lastMessage?.createdAt
    ? formatApiDate(ticket.lastMessage.createdAt)
    : ticket.date;
  const unread = ticket.unreadCount || 0;

  return (
    <button
      type="button"
      onClick={() => onClick(ticket)}
      className={joinClasses(
        "w-full border-b border-input-border/20 px-4 py-4 text-left bg-input-bg rounded-rounded mt-2 transition last:border-b-0 hover:bg-input-bg/50",
        selected && "bg-text-primary/10 border-text-primary/20",
        unread > 0 && !selected && "bg-blue-500/[0.06]",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="truncate text-lg font-semibold text-theme-text">
          {ticket.categoryName}
        </p>
        <p className="shrink-0 text-small text-text-secondary/75">
          {lastTime}
        </p>
      </div>
      {/* User name row - as requested */}
      <div className="mt-1.5 flex items-center gap-1.5 text-small">
        <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-text-primary/15 text-text-primary">
          <UserRound className="h-3 w-3" />
        </span>
        <span className="truncate font-medium text-theme-text">
          {ticket.requester}
        </span>
        <span className="truncate text-text-secondary/60 hidden sm:inline">
          • {ticket.requesterEmail}
        </span>
        <span className="ml-auto inline-flex items-center gap-1 shrink-0 text-xs text-text-secondary/70">
          <span className={joinClasses("h-2 w-2 rounded-full", ticket.status === "Closed" ? "bg-red-400" : "bg-emerald-400")} />
          {ticket.status || "-"}
        </span>
      </div>
      <div className="mt-1.5 flex items-center justify-between gap-2">
        <p className="truncate text-small text-text-secondary flex-1">
          {preview ? `${preview.slice(0, 20)}...` : "-"}
        </p>
        {unread > 0 && (
          <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-blue-500 px-1.5 text-xs font-semibold text-white shrink-0">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </div>
      {/* {ticket.lastMessage && (
        <p className="mt-1 truncate text-xs text-text-secondary/60">
          {ticket.lastMessage.senderType === "user" ? "User" : "Admin"}:{" "}
          {ticket.lastMessage.seen ? "Seen" : "Unread"} • {ticket.subject}
        </p>
      )} */}
    </button>
  );
}

function MessageBubble({ message }) {
  const adminMessage = message.senderType === "admin";
  const seen = Boolean(message.seen);

  return (
    <div className={joinClasses("flex", adminMessage && "justify-end")}>
      <div
        className={joinClasses(
          "max-w-[50%] rounded-[8px] border px-4 py-3",
          adminMessage
            ? "border-text-primary/30 bg-text-primary/10"
            : "border-input-border/30 bg-input-bg",
        )}
      >
        <div className="mb-2 flex flex-wrap items-center justify-between gap-3 text-small text-text-secondary">
          <span className="inline-flex items-center gap-1.5 capitalize">
            {adminMessage ? (
              <UserRound className="h-3.5 w-3.5" />
            ) : (
              <Mail className="h-3.5 w-3.5" />
            )}
            {/* {message.senderType || "user"} */}
          </span>
          <span className="inline-flex items-center gap-1.5">
            {formatApiDate(message.createdAt)}
            {adminMessage ? (
              seen ? (
                <CheckCheck className="h-3.5 w-3.5 text-[#53bdeb]" />
              ) : (
                <CheckCheck className="h-3.5 w-3.5 text-text-secondary" />
              )
            ) : null}
          </span>
        </div>
        <p className="break-words text-mid leading-6 text-theme-text">
          {message.message || "-"}
        </p>
      </div>
    </div>
  );
}

function EmptyDetail() {
  return (
    <section className="grid h-full min-h-0 place-items-center rounded-rounded border border-input-border/40 bg-card-bg px-5 py-10 text-center">
      <div className="max-w-sm">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-input-bg text-text-primary">
          <Ticket className="h-5 w-5" />
        </span>
        <h2 className="mt-4 text-large font-semibold text-theme-text">
          Select a ticket
        </h2>
        <p className="mt-2 text-small leading-6 text-text-secondary">
          Choose a support ticket to view the conversation, reply to the user,
          or close the ticket.
        </p>
      </div>
    </section>
  );
}

export default function SupportTicketsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("open");
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [tickets, setTickets] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [toast, setToast] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);
  const [replyMessage, setReplyMessage] = useState("");
  const [replyError, setReplyError] = useState("");
  const [replying, setReplying] = useState(false);
  const [closingTicket, setClosingTicket] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const socketRef = useRef(null);
  const selectedTicketIdRef = useRef(null);
  const seenMarkInFlightRef = useRef(false);
  const fetchSeqRef = useRef(0);
  const searchTimerRef = useRef(null);
  const fetchTicketsRef = useRef(null);
  const activeTabRef = useRef("open");
  const listScrollRef = useRef(null);
  const paginationRef = useRef(null);
  const replyInputRef = useRef(null);
  const pendingFocusRef = useRef(false);
  const prevReplyingRef = useRef(false);
  const messageListRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    paginationRef.current = pagination;
  }, [pagination]);

  const markMessagesSeenInState = useCallback((ticketId, messageIds) => {
    if (!ticketId || !Array.isArray(messageIds) || !messageIds.length) return;

    const markedIdSet = new Set(messageIds.map((id) => String(id)));

    setTickets((current) =>
      current.map((ticket) => {
        if (String(ticket.id) !== String(ticketId)) return ticket;

        let nextLastMessage = ticket.lastMessage;
        if (
          nextLastMessage &&
          markedIdSet.has(String(nextLastMessage._id))
        ) {
          nextLastMessage = {
            ...nextLastMessage,
            seen: true,
            seenAt: new Date().toISOString(),
          };
        }

        const nextUnread = 0;

        let nextMessages = ticket.messages;
        if (Array.isArray(ticket.messages) && ticket.messages.length) {
          nextMessages = ticket.messages.map((message) =>
            markedIdSet.has(String(message._id))
              ? { ...message, seen: true, seenAt: new Date().toISOString() }
              : message,
          );
        }

        return {
          ...ticket,
          lastMessage: nextLastMessage,
          unreadCount: nextUnread,
          messages: nextMessages,
        };
      }),
    );
    setSelectedTicket((current) => {
      if (!current || String(current.id) !== String(ticketId)) return current;

      let nextLastMessage = current.lastMessage;
      if (
        nextLastMessage &&
        markedIdSet.has(String(nextLastMessage._id))
      ) {
        nextLastMessage = {
          ...nextLastMessage,
          seen: true,
          seenAt: new Date().toISOString(),
        };
      }

      const messages = Array.isArray(current.messages) ? current.messages : [];

      return {
        ...current,
        lastMessage: nextLastMessage,
        unreadCount: 0,
        messages: messages.map((message) =>
          markedIdSet.has(String(message._id))
            ? { ...message, seen: true, seenAt: new Date().toISOString() }
            : message,
        ),
      };
    });
  }, []);

  const markTicketSeen = useCallback(
    (ticketId) => {
      if (!ticketId || seenMarkInFlightRef.current) return;

      const token = getAuthToken();

      if (!token) return;

      seenMarkInFlightRef.current = true;

      postWithTokenApi(token, `/support-tickets/${ticketId}/seen`)
        .then((response) => {
          markMessagesSeenInState(ticketId, response?.result?.messageIds);
        })
        .catch(() => {})
        .finally(() => {
          seenMarkInFlightRef.current = false;
        });
    },
    [markMessagesSeenInState],
  );

  const applyTicketUpdate = useCallback((updatedTicket) => {
    const normalized = normalizeTicket(updatedTicket);

    setTickets((current) => {
      let updated = null;
      const mapped = current.map((ticket) =>
        String(ticket.id) === String(normalized.id)
          ? (updated = {
              ...ticket,
              ...normalized,
              lastMessage: normalized.lastMessage,
              unreadCount: normalized.unreadCount,
              updatedAt: normalized.updatedAt || normalized.lastMessage?.createdAt || new Date().toISOString(),
              messages: undefined,
            })
          : ticket,
      );
      if (!updated) return mapped;
      // Move to top so new activity appears first
      const others = mapped.filter((t) => String(t.id) !== String(normalized.id));
      return [updated, ...others];
    });
    setSelectedTicket((current) =>
      current && String(current.id) === String(normalized.id) ? normalized : current,
    );
  }, []);

  const appendMessageToTicket = useCallback((ticketId, message) => {
    if (!ticketId || !message?._id) return;

    const messageIdStr = String(message._id);

    setTickets((current) => {
      let updatedTicket = null;
      let found = false;
      const mapped = current.map((ticket) => {
        if (String(ticket.id) !== String(ticketId)) return ticket;
        found = true;
        if (
          ticket.lastMessage &&
          String(ticket.lastMessage._id) === messageIdStr
        ) {
          updatedTicket = ticket;
          return ticket;
        }

        const isCurrentlyViewing = String(selectedTicketIdRef.current) === String(ticketId);
        const isUnseenUserMessage =
          message.senderType === "user" && !message.seen;

        const nextUnread =
          isUnseenUserMessage && !isCurrentlyViewing
            ? (ticket.unreadCount || 0) + 1
            : ticket.unreadCount;

        updatedTicket = {
          ...ticket,
          lastMessage: message,
          unreadCount: nextUnread,
          updatedAt: message.createdAt || new Date().toISOString(),
        };
        return updatedTicket;
      });

      if (!found) {
        // ticket not in current page (e.g. on later page) - refetch first page so it appears at top
        // avoid spamming fetches, only if we have pagination
        if (paginationRef.current) {
          setTimeout(() => fetchTicketsRef.current?.({ page: 1, showToast: false }), 50);
        }
        return mapped;
      }

      if (!updatedTicket) return mapped;

      // Move updated ticket to first position (most recent activity at top)
      const others = mapped.filter((t) => String(t.id) !== String(ticketId));
      return [updatedTicket, ...others];
    });
    setSelectedTicket((current) => {
      if (!current || String(current.id) !== String(ticketId)) return current;

      const existing = Array.isArray(current.messages) ? current.messages : [];

      if (existing.some((item) => String(item._id) === messageIdStr)) return current;

      return {
        ...current,
        messages: [...existing, message],
        lastMessage: message,
      };
    });
  }, []);

  const updateTicketStatusInState = useCallback((ticketId, status) => {
    if (!ticketId) return;

    setTickets((current) =>
      current.map((ticket) =>
        String(ticket.id) === String(ticketId) ? { ...ticket, status } : ticket,
      ),
    );
    setSelectedTicket((current) =>
      current && String(current.id) === String(ticketId) ? { ...current, status } : current,
    );
  }, []);

  const fetchTicketDetail = useCallback(
    async (ticketId) => {
      if (!ticketId) return;
      const token = getAuthToken();
      if (!token) return;
      setDetailLoading(true);
      try {
        const response = await getWithTokenApi(token, `/support-tickets/${ticketId}`);
        const ticketData = response?.result || response?.data || response;
        if (!ticketData?._id && !ticketData?.id) return;
        const normalized = normalizeTicket(ticketData);
        setSelectedTicket(normalized);
        setTickets((current) =>
          current.map((t) =>
            String(t.id) === String(normalized.id)
              ? {
                  ...t,
                  lastMessage: normalized.lastMessage,
                  unreadCount: normalized.unreadCount,
                  status: normalized.status,
                }
              : t,
          ),
        );
        const hasUnseen =
          Array.isArray(normalized.messages) &&
          normalized.messages.some((m) => m.senderType === "user" && !m.seen);
        if (hasUnseen) {
          markTicketSeen(ticketId);
        }
        setTimeout(() => {
          const el = messageListRef.current;
          if (el) el.scrollTop = el.scrollHeight;
          messagesEndRef.current?.scrollIntoView({ behavior: "auto", block: "end" });
        }, 100);
      } catch (error) {
        setToast({
          id: Date.now(),
          content: getTicketErrorMessage(error, "Unable to load ticket details."),
          color: "error",
        });
      } finally {
        setDetailLoading(false);
      }
    },
    [markTicketSeen],
  );

  useEffect(() => {
    const token = getAuthToken();

    if (!token || !SOCKET_URL) return undefined;

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      const ticketId = selectedTicketIdRef.current;

      if (ticketId) {
        socket.emit("joinSupportRoom", { ticketId });
      }
    });

    socket.on("connect_error", () => {
      const freshToken = getAuthToken();

      if (freshToken && socket.auth?.token !== freshToken) {
        socket.auth = { token: freshToken };
      }
    });

    socket.on("receiveSupportMessage", (payload) => {
      if (payload?.success !== true) return;

      appendMessageToTicket(payload.ticketId, payload.message);

      if (
        String(payload.ticketId) === String(selectedTicketIdRef.current) &&
        payload.message?.senderType === "user" &&
        !payload.message?.seen
      ) {
        markTicketSeen(payload.ticketId);
      }
    });

    socket.on("messageSeen", (payload) => {
      if (payload?.success !== true || !payload?.ticketId) return;

      markMessagesSeenInState(payload.ticketId, payload.messageIds);
    });

    socket.on("supportTicketUpdated", (payload) => {
      if (payload?.success !== true || !payload?.ticketId) return;

      if (payload.ticket) {
        applyTicketUpdate(payload.ticket);
      } else {
        updateTicketStatusInState(payload.ticketId, payload.status);
      }

      const tab = activeTabRef.current;

      if (String(payload.status || "").toLowerCase() !== tab) {
        fetchTicketsRef.current?.({ page: 1, showToast: false });
      }
    });

    socket.on("supportTicketCreated", (payload) => {
      if (payload?.success !== true) return;
      const pag = paginationRef.current;
      const currentStatus = activeTabRef.current === "open" ? "Open" : "Closed";
      fetchTicketsRef.current?.({ page: 1, status: currentStatus, showToast: false });
    });

    socket.on("ticket_message_error", (payload) => {
      setToast({
        id: Date.now(),
        content: payload?.message || "Unable to send the reply.",
        color: "error",
      });
    });

    return () => {
      const currentId = selectedTicketIdRef.current;

      if (currentId) {
        socket.emit("leaveSupportRoom", { ticketId: currentId });
      }

      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
    };
  }, [markTicketSeen, markMessagesSeenInState, appendMessageToTicket, applyTicketUpdate, updateTicketStatusInState]);

  const selectedTicketMessages = useMemo(
    () =>
      Array.isArray(selectedTicket?.messages) ? selectedTicket.messages : [],
    [selectedTicket],
  );

  useEffect(() => {
    const previousId = selectedTicketIdRef.current;
    selectedTicketIdRef.current = selectedTicket?.id ?? null;

    const socket = socketRef.current;
    const ticketId = selectedTicket?.id;

    if (!socket || !ticketId) return undefined;

    if (previousId !== ticketId) {
      socket.emit("joinSupportRoom", { ticketId });

      if (previousId) {
        socket.emit("leaveSupportRoom", { ticketId: previousId });
      }
    }

    if (
      selectedTicketMessages.some(
        (message) => message.senderType === "user" && !message.seen,
      )
    ) {
      markTicketSeen(ticketId);
    }

    return undefined;
  }, [selectedTicket?.id, selectedTicketMessages, markTicketSeen]);

  const showMobileTicketDetail = Boolean(selectedTicket && mobileDetailOpen);

  // Auto-focus input when ticket changes (so admin can type immediately)
  useEffect(() => {
    if (selectedTicket && selectedTicket.status !== "Closed") {
      const timer = setTimeout(() => {
        if (replyInputRef.current && !replyInputRef.current.disabled) {
          replyInputRef.current.focus();
        }
      }, 120);
      return () => clearTimeout(timer);
    }
  }, [selectedTicket?.id]);

  // Reliably re-focus input after message send - wait until replying transitions true->false and input is enabled
  useEffect(() => {
    const wasReplying = prevReplyingRef.current;
    prevReplyingRef.current = replying;
    if (wasReplying && !replying && pendingFocusRef.current) {
      pendingFocusRef.current = false;
      // double rAF ensures React has flushed disabled=false and DOM is ready
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const el = replyInputRef.current;
          if (el && !el.disabled && selectedTicket && selectedTicket.status !== "Closed") {
            el.focus();
            try {
              const len = el.value.length;
              el.setSelectionRange(len, len);
            } catch {}
          }
        });
      });
      // fallback for browsers where rAF is throttled
      setTimeout(() => {
        const el = replyInputRef.current;
        if (el && document.activeElement !== el && !el.disabled) {
          el.focus();
        }
      }, 80);
    }
  }, [replying, selectedTicket]);

  const scrollToBottom = useCallback((smooth = true) => {
    // use double rAF to ensure DOM has painted and scrollHeight is correct
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const container = messageListRef.current;
        const end = messagesEndRef.current;
        if (end) {
          try {
            end.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "end" });
            return;
          } catch {}
        }
        if (container) {
          try {
            if (smooth) {
              container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
            } else {
              container.scrollTop = container.scrollHeight;
            }
          } catch {
            container.scrollTop = container.scrollHeight;
          }
        }
      });
    });
  }, []);

  // Auto-scroll to bottom when messages change, ticket switches, or detail finishes loading
  useLayoutEffect(() => {
    if (selectedTicketMessages.length) {
      scrollToBottom(false);
    }
  }, [selectedTicket?.id, scrollToBottom]);

  useEffect(() => {
    if (!selectedTicketMessages.length) return;
    // wait for DOM paint + images
    const t = setTimeout(() => scrollToBottom(true), 80);
    return () => clearTimeout(t);
  }, [selectedTicketMessages.length, scrollToBottom]);

  useEffect(() => {
    if (!detailLoading && selectedTicketMessages.length) {
      const t = setTimeout(() => scrollToBottom(true), 40);
      return () => clearTimeout(t);
    }
  }, [detailLoading, scrollToBottom, selectedTicketMessages.length]);

  async function fetchSupportTickets({
    selectTicketId,
    page: nextPage = page,
    limit: nextLimit = pageSize,
    search: nextSearch = appliedSearch,
    status: nextStatus = activeTab === "open" ? "Open" : "Closed",
    showToast = true,
  } = {}) {
    const token = getAuthToken();

    if (!token) {
      if (showToast) {
        setToast({
          id: Date.now(),
          content: "Session token not found",
          color: "error",
        });
      }
      setLoading(false);
      setLoadingMore(false);
      return [];
    }

    const isLoadMore = nextPage > 1;
    const seq = ++fetchSeqRef.current;

    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await getWithTokenApi(token, "/support-tickets", {
        page: nextPage,
        limit: nextLimit,
        search: nextSearch,
        status: nextStatus,
      });

      if (seq !== fetchSeqRef.current) return [];

      const result = response?.result || {};
      const data = response?.data || {};
      const dataPagination = data.pagination || {};
      const legacyPagination = result.pagination || {};

      const nextPagination = {
        totalRecords:
          dataPagination.totalRecords ?? legacyPagination.total ?? 0,
        currentPage: dataPagination.currentPage ?? legacyPagination.page ?? nextPage,
        totalPages: dataPagination.totalPages ?? legacyPagination.totalPages ?? 1,
        pageSize: dataPagination.pageSize ?? legacyPagination.limit ?? nextLimit,
        hasNextPage: dataPagination.hasNextPage ?? legacyPagination.hasNextPage ?? false,
        hasPrevPage: dataPagination.hasPrevPage ?? legacyPagination.hasPrevPage ?? false,
      };

      if (nextPagination.totalPages > 0 && nextPage > nextPagination.totalPages) {
        setPage(nextPagination.totalPages);
        fetchSupportTickets({
          page: nextPagination.totalPages,
          selectTicketId,
        });
        return [];
      }

      const rawRecords = Array.isArray(data.records)
        ? data.records
        : Array.isArray(result.tickets)
          ? result.tickets
          : [];

      const nextTickets = rawRecords.map(normalizeTicket);

      setPagination(nextPagination);
      setPage(nextPage);

      if (isLoadMore) {
        setTickets((prev) => {
          const existingIds = new Set(prev.map((t) => String(t.id)));
          const filtered = nextTickets.filter((t) => !existingIds.has(String(t.id)));
          return [...prev, ...filtered];
        });
        return nextTickets;
      }

      setTickets(nextTickets);

      if (nextTickets.length) {
        // Don't auto-select first chat - only restore if explicitly requested or already selected
        const targetId =
          selectTicketId ||
          (selectedTicket?.id &&
          nextTickets.some((t) => String(t.id) === String(selectedTicket.id))
            ? selectedTicket.id
            : null);

        if (!targetId) {
          // No selection to restore - keep current selection if still valid, otherwise show "Select a chat"
          if (selectedTicket && !nextTickets.some((t) => String(t.id) === String(selectedTicket.id))) {
            setSelectedTicket(null);
          }
          return nextTickets;
        }

        const matched = nextTickets.find((ticket) => String(ticket.id) === String(targetId));

        if (matched) {
          const shouldFetchDetail =
            !selectedTicket ||
            String(selectedTicket.id) !== String(matched.id) ||
            !Array.isArray(selectedTicket.messages) ||
            selectedTicket.messages.length === 0;

          if (shouldFetchDetail) {
            if (!selectedTicket || String(selectedTicket.id) !== String(matched.id)) {
              setSelectedTicket(matched);
            }
            fetchTicketDetail(matched.id);
          } else {
            setSelectedTicket((current) =>
              current && String(current.id) === String(matched.id)
                ? { ...current, lastMessage: matched.lastMessage, unreadCount: matched.unreadCount }
                : current,
            );
          }
        }
      } else {
        setSelectedTicket(null);
      }

      return nextTickets;
    } catch (error) {
      if (seq !== fetchSeqRef.current) return [];

      if (showToast) {
        setToast({
          id: Date.now(),
          content: getTicketErrorMessage(error),
          color: "error",
        });
      }
      return [];
    } finally {
      if (seq === fetchSeqRef.current) {
        if (isLoadMore) setLoadingMore(false);
        else setLoading(false);
      }
    }
  }

  fetchTicketsRef.current = fetchSupportTickets;
  activeTabRef.current = activeTab;

  const handleTicketListScroll = useCallback(() => {
    const el = listScrollRef.current;
    const pag = paginationRef.current;
    if (!el || loading || loadingMore) return;
    if (!pag?.hasNextPage) return;
    const threshold = 150;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - threshold) {
      const nextPage = (pag.currentPage || page) + 1;
      fetchSupportTickets({ page: nextPage, showToast: false });
    }
  }, [loading, loadingMore, page]);

  const handleSearchChange = (value) => {
    setSearch(value);
    setMobileDetailOpen(false);

    window.clearTimeout(searchTimerRef.current);

    searchTimerRef.current = window.setTimeout(() => {
      setAppliedSearch(value.trim());
      setPage(1);
      if (listScrollRef.current) listScrollRef.current.scrollTop = 0;
      fetchSupportTickets({ page: 1, search: value.trim() });
    }, 400);
  };

  const handleTabChange = (value) => {
    setActiveTab(value);
    setPage(1);
    setMobileDetailOpen(false);
    setTickets([]);
    setPagination(null);
    if (listScrollRef.current) listScrollRef.current.scrollTop = 0;
    fetchSupportTickets({
      page: 1,
      status: value === "open" ? "Open" : "Closed",
    });
  };

  // kept for backward compat but not used in scroll UI
  const handlePageChange = (nextPage) => {
    if (nextPage === page) return;

    setPage(nextPage);
    fetchSupportTickets({ page: nextPage });
  };

  const handlePageSizeChange = (nextPageSize) => {
    return;
  };

  const handleTicketClick = (ticket) => {
    setMobileDetailOpen(true);
    setReplyError("");
    setSelectedTicket(ticket);
    fetchTicketDetail(ticket.id);
  };

  async function handleReplySubmit(event) {
    event.preventDefault();

    const message = replyMessage.trim();

    if (!selectedTicket) {
      return;
    }

    if (!message) {
      setReplyError("Reply message is required.");
      return;
    }

    const token = getAuthToken();

    if (!token) {
      setToast({
        id: Date.now(),
        content: "Session token not found",
        color: "error",
      });
      return;
    }

    // mark that we need to re-focus input after this send completes
    pendingFocusRef.current = true;
    setReplying(true);

    try {
      const response = await postWithTokenApi(
        token,
        `/support-tickets/${selectedTicket.id}/reply`,
        { message },
      );

      setReplyMessage("");
      setReplyError("");

      if (response?.result) {
        applyTicketUpdate(response.result);
        const normalized = normalizeTicket(response.result);
        setSelectedTicket(normalized);
        // ensure new message is visible - scroll after DOM updates
        setTimeout(() => scrollToBottom(true), 80);
      } else {
        // fallback scroll even if result missing (optimistic)
        setTimeout(() => scrollToBottom(true), 80);
      }
    } catch (error) {
      setToast({
        id: Date.now(),
        content: getTicketErrorMessage(error, "Unable to send reply."),
        color: "error",
      });
      // keep pendingFocus true so input is re-focused even on error to allow retry
    } finally {
      setReplying(false);
      // focus is handled by useEffect watching replying -> pendingFocusRef;
      // immediate fallback if effect misses (e.g. no state transition)
      setTimeout(() => {
        if (pendingFocusRef.current) {
          const el = replyInputRef.current;
          if (el && !el.disabled) {
            el.focus();
            pendingFocusRef.current = false;
          }
        }
      }, 10);
      // also ensure scroll even if message was appended via socket quickly
      setTimeout(() => scrollToBottom(true), 150);
    }
  }

  async function handleCloseTicket() {
    if (!selectedTicket || selectedTicket.status === "Closed") {
      return;
    }

    const token = getAuthToken();

    if (!token) {
      setToast({
        id: Date.now(),
        content: "Session token not found",
        color: "error",
      });
      return;
    }

    setClosingTicket(true);

    try {
      const response = await postWithTokenApi(
        token,
        `/support-tickets/${selectedTicket.id}/status`,
        { status: "Closed" },
      );

      setToast({
        id: Date.now(),
        content: response?.message || "Ticket closed successfully",
        color: "success",
      });

      if (response?.result) {
        applyTicketUpdate(response.result);
      }

      await fetchSupportTickets({ showToast: false });
    } catch (error) {
      setToast({
        id: Date.now(),
        content: getTicketErrorMessage(error, "Unable to close ticket."),
        color: "error",
      });
    } finally {
      setClosingTicket(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      fetchSupportTickets();
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="flex h-[calc(100vh-106px)] min-h-[590px] flex-col gap-5 overflow-hidden xl:min-h-0">
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

      <section className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-theme-text">
            Support Tickets
          </h1>
          {pagination && (
            <p className="text-small text-text-secondary">
              Total {pagination.totalRecords} tickets
               {/* tickets • Page {pagination.currentPage} of {pagination.totalPages} */}
            </p>
          )}
        </div>
      </section>

      <div className="grid min-h-0 flex-1 gap-5 overflow-hidden xl:grid-cols-[380px_minmax(0,1fr)]">
        <section
          className={joinClasses(
            "flex min-h-0 flex-col overflow-hidden rounded-rounded border border-input-border/40 bg-card-bg",
            showMobileTicketDetail && "hidden xl:flex",
          )}
        >
          <div className="border-b border-input-border/30 px-4 py-4">
            <Input
              type="search"
              value={search}
              onChange={(event) => handleSearchChange(event.target.value)}
              placeholder="Search tickets"
              beforeIcon={<Search className="h-3.5 w-3.5" />}
              inputClassName="!h-10 text-small"
            />
            <Tabs
              tabs={tabs}
              value={activeTab}
              onChange={handleTabChange}
              className="w-full mt-4 gap-2"
              tabClassName="flex-1 text-small font-medium"
            />
          </div>

          <div
            ref={listScrollRef}
            onScroll={handleTicketListScroll}
            className="min-h-0 flex-1 overflow-y-auto px-2 scrollbar-thin"
          >
            {loading && !tickets.length ? (
              <div className="grid h-full place-items-center px-4 py-10 text-small text-text-secondary">
                Loading tickets...
              </div>
            ) : tickets.length > 0 ? (
              <>
                {tickets.map((ticket) => (
                  <TicketListItem
                    key={ticket.id}
                    ticket={ticket}
                    selected={selectedTicket?.id === ticket.id}
                    onClick={handleTicketClick}
                  />
                ))}
                {loadingMore && (
                  <div className="py-4 text-center text-small text-text-secondary">
                    Loading more...
                  </div>
                )}
                {!pagination?.hasNextPage && tickets.length > 0 && (
                  <div className="py-3 text-center text-xs text-text-secondary/50">
                    No more tickets
                  </div>
                )}
                <div className="h-2" />
              </>
            ) : (
              <div className="grid h-full place-items-center px-4 py-10 text-center text-small text-text-secondary">
                No support tickets found.
              </div>
            )}
          </div>
        </section>

        {selectedTicket ? (
          <section
            className={joinClasses(
              "flex min-h-0 flex-col overflow-hidden rounded-rounded border border-input-border/40 bg-card-bg xl:flex",
              showMobileTicketDetail ? "flex" : "hidden xl:flex",
            )}
          >
            <div className="flex min-h-0 min-w-0 flex-1 flex-col">
              <div className="border-b border-input-border/30 px-4 py-3 sm:px-5 sm:py-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex min-w-0 items-center gap-3">
                    <button
                      type="button"
                      aria-label="Back to messages"
                      onClick={() => setMobileDetailOpen(false)}
                      className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-input-border bg-input-bg text-text-secondary transition hover:border-text-primary hover:text-text-primary xl:hidden"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </button>
                    <div className="min-w-0">
                      <h2 className="break-words text-xl font-medium text-theme-text capitalize">
                        {selectedTicket.requester}
                      </h2>
                      <p className="truncate text-small text-text-secondary">
                        {selectedTicket.requesterEmail} • {selectedTicket.categoryName}
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="secondary"
                    beforeIcon={<XCircle className="h-4 w-4" />}
                    onClick={handleCloseTicket}
                    disabled={
                      closingTicket || selectedTicket.status === "Closed"
                    }
                    className="w-full bg-red-600 !text-theme-text hover:!bg-red-500/50 sm:w-40"
                  >
                    {closingTicket
                      ? "Closing..."
                      : selectedTicket.status === "Closed"
                        ? "Ticket Closed"
                        : "Close Ticket"}
                  </Button>
                </div>
              </div>

              <div
                ref={messageListRef}
                className="mx-auto flex min-h-0 w-[96%] flex-1 flex-col overflow-y-auto overscroll-contain rounded-rounded bg-bg-secondary/70 px-3 py-4 sm:px-5 mt-1 mb-1"
              >
                {detailLoading ? (
                  <div className="grid min-h-[260px] flex-1 place-items-center rounded-[8px] border border-input-border/25 bg-bg-secondary px-4 py-10">
                    <div className="flex flex-col items-center gap-3 text-center">
                      <span className="h-7 w-7 animate-spin rounded-full border-2 border-text-primary/30 border-t-text-primary" aria-hidden />
                      <p className="text-small font-medium text-text-secondary">Loading conversation...</p>
                      <p className="text-xs text-text-secondary/70">Please wait</p>
                    </div>
                  </div>
                ) : selectedTicketMessages.length ? (
                  <div className="space-y-3">
                    {selectedTicketMessages.map((message) => (
                      <MessageBubble key={message._id} message={message} />
                    ))}
                    <div ref={messagesEndRef} className="h-0" aria-hidden />
                  </div>
                ) : (
                  <div className="grid min-h-[260px] flex-1 place-items-center rounded-[8px] border border-input-border/25 bg-bg-secondary px-4 py-10 text-small text-text-secondary">
                    No messages for this ticket.
                  </div>
                )}
              </div>

              {selectedTicket.status === "Closed" ? (
                <div className="border-t border-input-border/30 px-5 py-4">
                  <div className="flex items-center justify-center gap-2 rounded-rounded border border-input-border bg-input-bg px-4 py-5 text-center">
                    <Lock className="h-4 w-4 shrink-0 text-text-secondary" />
                    <p className="text-small leading-6 text-text-secondary">
                      This support ticket has been closed.
                      <br />
                      You can no longer send messages.
                    </p>
                  </div>
                </div>
              ) : (
                <form
                  onSubmit={handleReplySubmit}
                  className="border-t border-input-border/30 px-5 py-4"
                >
                  <div className="flex items-center gap-2 rounded-full border border-input-border bg-input-bg p-2">
                    <textarea
                      ref={replyInputRef}
                      id="ticketReply"
                      value={replyMessage}
                      onChange={(event) => {
                        setReplyMessage(event.target.value);
                        setReplyError("");
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" && !event.shiftKey) {
                          event.preventDefault();
                          if (!replying) event.currentTarget.form?.requestSubmit();
                        }
                      }}
                      disabled={replying}
                      placeholder="Type your reply..."
                      rows={1}
                      autoFocus={false}
                      className="flex-1 resize-none bg-transparent px-2 py-1 text-mid text-theme-text outline-none transition placeholder:text-input-text disabled:cursor-not-allowed disabled:opacity-60"
                    />
                    <button
                      type="submit"
                      aria-label="Send reply"
                      className=" shrink-0"
                      disabled={replying}
                    >
                      <Send className="h-4 w-4 text-text-primary mr-2 " />
                    </button>
                  </div>
                  {replyError && (
                    <p className="mt-2 text-small text-red-400">{replyError}</p>
                  )}
                </form>
              )}
            </div>
          </section>
        ) : (
          <div className="hidden min-h-0 xl:block">
            <EmptyDetail />
          </div>
        )}
      </div>
    </div>
  );
}
