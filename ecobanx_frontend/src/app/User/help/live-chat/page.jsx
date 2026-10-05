"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Ban,
  Check,
  CheckCheck,
  Mic,
  MoreVertical,
  Paperclip,
  Search,
  Send,
  Smile,
  Plus,
  UserPlus,
  Video,
  Phone,
  X,
} from "lucide-react";
import Link from "next/link";
import Button from "@/components/ui/button";
import Snackbar from "@/components/ui/Snackbar";
import Skeleton from "@/components/ui/skeleton";
import apiClient from "@/lib/axiosInterceptor";
import { getStoredAccessToken } from "@/lib/auth";
import { io } from "socket.io-client";
import { getTicketInitials, getShortTicketId, formatTicketDate } from "../_utils";
import {getAccountBaseRoute} from '@/utils/accountRoutes'
const API_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3700/ecobanxApi";
const SOCKET_URL = (
  process.env.NEXT_PUBLIC_SOCKET_URL || API_BASE_URL
).replace(/\/ecobanxApi\/?$/, "");

const DEFAULT_PAGE_SIZE = 50;
const SEARCH_DEBOUNCE_MS = 400;

function normalizeSocketToken(token) {
  return typeof token === "string"
    ? token.replace(/^Bearer\s+/i, "").trim()
    : "";
}

function formatTime(date = new Date()) {
  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

function toChatMessage(message) {
  return {
    id:
      message._id ||
      `${message.senderType}-${message.createdAt}-${message.message}`,
    from: message.senderType === "user" ? "support" : "customer",
    text: message.message,
    time: formatTime(new Date(message.createdAt)),
    status: message.seen ? "seen" : "delivered",
  };
}

function toTitleCase(value, fallback = "") {
  const text = String(value || "").trim();
  if (!text) return fallback;

  return text
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/\b[a-z]/g, (char) => char.toUpperCase());
}

function toConversation(ticket) {
  const messages = Array.isArray(ticket.messages) ? ticket.messages : [];
  const lastMessageFromArray = messages[messages.length - 1];
  const lastMessageObj = ticket.lastMessage || lastMessageFromArray || null;
  const categoryLabel = toTitleCase(
    ticket.customCategory || ticket.category?.name,
    "Support Ticket",
  );
  const titleLabel = toTitleCase(ticket.title, "Untitled Ticket");
  const unreadFromBackend =
    typeof ticket.unreadCount === "number"
      ? ticket.unreadCount
      : messages.filter((m) => m.senderType === "admin" && !m.seen).length;

  return {
    id: ticket._id || ticket.id,
    name: categoryLabel,
    // title: titleLabel,
    ticketId: getShortTicketId(ticket._id || ticket.id),
    role: "merchant",
    lastMessage: lastMessageObj?.message || ticket.description || "No messages yet",
    time: formatTicketDate(lastMessageObj?.createdAt || ticket.updatedAt || ticket.createdAt),
    unread: unreadFromBackend,
    open: ticket.status === "Open",
    online: false,
    blocked: false,
    initials: getTicketInitials(categoryLabel),
    accent: "bg-primary/10 text-primary",
    addedUser: false,
    category: categoryLabel,
    rawUpdatedAt: ticket.updatedAt || lastMessageObj?.createdAt || ticket.createdAt,
  };
}

const avatarStyle = {
  background: "linear-gradient(135deg, var(--primary), var(--primary-hover))",
};

const chatCanvasStyle = {
  background: "var(--dashboardbg)",
};

const bubbleShadow = {
  boxShadow: "0 2px 10px color-mix(in srgb, var(--theme-text) 8%, transparent)",
};

// function Avatar({ initials, online = false, size = "h-12 w-12" }) {
//   return (
//     <span
//       className={`relative flex ${size} shrink-0 items-center justify-center rounded-full text-xs font-bold text-white shadow-inner`}
//       style={avatarStyle}
//     >
//       {initials}
//       {online ? (
//         <span className="absolute bottom-0.5 right-0.5 h-3 w-3 rounded-full border-2 border-card-bg-normal bg-primary-text" />
//       ) : null}
//     </span>
//   );
// }

function IconButton({ children, label, onClick, danger = false, disabled = false }) {
  return (
    <button
      type="button"
      aria-label={label}
      // title={label}
      onClick={onClick}
      disabled={disabled}
      style={danger ? { color: "var(--danger)" } : undefined}
      className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 ${
        danger
          ? "hover:bg-secondary-bg"
          : "text-secondary-text hover:bg-primary-text/10 hover:text-primary-text"
      }`}
    >
      {children}
    </button>
  );
}

function ConversationItem({ conversation, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex w-full items-center gap-3 px-3 py-3 text-left transition duration-300 ease-out hover:translate-y-0.5 ${
        active ? "bg-primary-text/10" : "hover:bg-secondary-bg"
      }`}
    >
      {/* <Avatar
        initials={conversation.initials}
        online={conversation.online && !conversation.blocked}
      /> */}

      <span className="min-w-0 flex-1 border-b border-input-border pb-3">
        <span className="flex items-start justify-between gap-3">
          <span className="min-w-0">
            <span className="block truncate text-[15px] font-medium text-theme-text">
              {conversation.category}
            </span>
              {/* <span className="mt-0.5 block truncate text-[12px] font-semibold text-secondary-text">
                {conversation.title}
              </span> */}
            <span className="mt-1 block truncate text-[12px] text-secondary-text/80">
              {conversation.lastMessage?.length > 20
              ? `${conversation.lastMessage.slice(0, 20)}...`
              : conversation.lastMessage}
            </span>
          </span>
          <div>

          <span
            className={`shrink-0 text-[11px] ${
              conversation.unread ? "text-primary-text" : "text-secondary-text"
            }`}
          >
            {conversation.time}
          </span>
            <span className="mt-1 flex items-center justify-between">
          {/* <span className="text-[11px] uppercase text-secondary-text">
            {conversation.ticketId}
          </span> */}
          {conversation.unread > 0 ? (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary-text px-1.5 text-[11px] font-bold text-white">
              {conversation.unread}
            </span>
          ) : null}
        </span>
          </div>
        </span>

      
      </span>
    </button>
  );
}

function ChatBubble({ message }) {
  const outgoing = message.from === "support";

  return (
    <div
      className={`chat-message-enter flex w-full ${
        outgoing ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`max-w-[50%] rounded-[14px] px-3.5 py-2.5 text-[15px] leading-5 ${
          outgoing
            ? "rounded-br-[4px] bg-primary-text text-white"
            : "rounded-bl-[4px] bg-secondary-bg text-theme-text"
        }`}
        style={bubbleShadow}
      >
        <p className="whitespace-pre-wrap break-words">{message.text}</p>
        <span
          className={`mt-1 flex justify-end gap-1 text-[11px] leading-none ${
            outgoing ? "text-white/80" : "text-secondary-text"
          }`}
        >
          {message.time}
          {outgoing ? (
            message.status === "seen" ? (
              <CheckCheck size={14} className="text-[#53bdeb]" />
            ) : message.status === "sent" ? (
              <Check size={14} className="text-white/60" />
            ) : (
              <CheckCheck size={14} className="text-white/60" />
            )
          ) : null}
        </span>
      </div>
    </div>
  );
}

function TypingDots() {
  return (
    <div className="flex justify-start">
      <div
        className="flex items-center gap-1 rounded-[14px] rounded-bl-[4px] bg-secondary-bg px-4 py-3"
        style={bubbleShadow}
      >
        {[0, 1, 2].map((dot) => (
          <span
            key={dot}
            className="h-1.5 w-1.5 animate-bounce rounded-full bg-secondary-text"
            style={{ animationDelay: `${dot * 120}ms` }}
          />
        ))}
      </div>
    </div>
  );
}

function NewTicketButton({ className = "" }) {
  return (
    <Button
      onNavigate="/User/help/new-ticket"
      variant="primary"
      className={`border-0 px-5 text-sm text-white ${className}`}
      icon={<Plus size={16} />}
    >
      New Support Ticket
    </Button>
  );
}

function EmptyChatState({ title, description }) {
  return (
    <div className="flex h-full items-center justify-center px-6 text-center">
      <div className="mx-auto max-w-sm">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary-text">
          <Plus size={20} />
        </span>
        {/* <p className="mt-4 text-base font-semibold text-theme-text">{title}</p> */}
        <p className="mt-2 text-sm leading-6 text-secondary-text">
          {description}
        </p>
        <NewTicketButton className="mx-auto mt-5" />
      </div>
    </div>
  );
}

export default function Page() {
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState([]);
  const [messagesByConversation, setMessagesByConversation] = useState({});
  const [activeFilter, setActiveFilter] = useState("open");
  const [searchValue, setSearchValue] = useState("");
  const [searching, setSearching] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(DEFAULT_PAGE_SIZE);
  const [pagination, setPagination] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [mobileView, setMobileView] = useState("list");
  const [draft, setDraft] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", tone: "success" });
  const fileInputRef = useRef(null);
  const messageEndRef = useRef(null);
  const draftInputRef = useRef(null);
  const listScrollRef = useRef(null);
  const paginationRef = useRef(null);
  const socketRef = useRef(null);
  const joinedTicketRef = useRef(null);
  const selectedTicketIdRef = useRef(null);
  const typingEmitRef = useRef(0);
  const ticketsFetchedRef = useRef(false);
  const detailFetchedRef = useRef(null);
  const pendingTempRef = useRef({});
  const seenMarkInFlightRef = useRef(false);
  const searchTimeoutRef = useRef(null);
  const activeFilterRef = useRef("open");
  const searchValueRef = useRef("");
  const conversationsRef = useRef([]);
const baseRoute = getAccountBaseRoute();

  useEffect(() => {
    activeFilterRef.current = activeFilter;
    searchValueRef.current = searchValue;
    conversationsRef.current = conversations;
  }, [activeFilter, searchValue, conversations]);

  useEffect(() => {
    paginationRef.current = pagination;
  }, [pagination]);

  const fetchConversations = useCallback(
    async ({ targetPage, searchTerm = "", status = "" }) => {
      const isLoadMore = targetPage > 1;
      if (isLoadMore) setLoadingMore(true);
      const params = { page: targetPage, limit: pageSize };

      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (status) params.status = status;

      const response = await apiClient.get(`${baseRoute}/support-tickets`, {
        params,
      });
      const result = response?.data?.result ?? {};
      const data = response?.data?.data ?? {};
      const list = Array.isArray(result.tickets)
        ? result.tickets
        : Array.isArray(data.records)
          ? data.records
          : [];
      const paginationData = result.pagination ?? data.pagination ?? {};
      const nextPagination = {
        totalRecords: paginationData.total ?? paginationData.totalRecords ?? 0,
        currentPage: paginationData.page ?? paginationData.currentPage ?? targetPage,
        totalPages: paginationData.totalPages ?? 1,
        hasNextPage: paginationData.hasNextPage ?? targetPage < (paginationData.totalPages ?? 1),
        hasPrevPage: paginationData.hasPrevPage ?? targetPage > 1,
      };
      setPagination(nextPagination);
      setPage(targetPage);

      const nextConversations = list.map(toConversation);
      // lightweight list doesn't have full messages - don't overwrite detail messages
      const nextMessages = {};
      let hasFullMessages = false;
      for (const ticket of list) {
        if (Array.isArray(ticket.messages) && ticket.messages.length) {
          hasFullMessages = true;
          nextMessages[ticket._id || ticket.id] = ticket.messages.map(toChatMessage);
        }
      }

      if (isLoadMore) {
        setConversations((current) => {
          const existingIds = new Set(current.map((c) => String(c.id)));
          const filtered = nextConversations.filter((c) => !existingIds.has(String(c.id)));
          return [...current, ...filtered];
        });
        if (hasFullMessages) {
          setMessagesByConversation((current) => ({ ...current, ...nextMessages }));
        }
      } else {
        setConversations((current) => {
          const byId = new Map(
            current.map((conversation) => [conversation.id, conversation]),
          );
          return nextConversations.map((conversation) => ({
            ...conversation,
            unread: byId.get(conversation.id)?.unread ?? conversation.unread,
            online: byId.get(conversation.id)?.online ?? false,
            blocked: byId.get(conversation.id)?.blocked ?? false,
            addedUser: byId.get(conversation.id)?.addedUser ?? false,
          }));
        });
        if (hasFullMessages) {
          setMessagesByConversation((current) => ({ ...current, ...nextMessages }));
        }
      }

      if (isLoadMore) setLoadingMore(false);
      return nextConversations;
    },
    [pageSize],
  );

  const handleConversationListScroll = useCallback(() => {
    const el = listScrollRef.current;
    const pag = paginationRef.current;
    if (!el || !pag?.hasNextPage) return;
    const threshold = 150;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - threshold) {
      const nextPage = (pag.currentPage || 1) + 1;
      if (!loadingMore) {
        fetchConversations({ targetPage: nextPage, searchTerm: searchValueRef.current, status: activeFilterRef.current }).catch(() => {});
      }
    }
  }, [fetchConversations, loadingMore]);

  useEffect(() => {
    if (ticketsFetchedRef.current) return;
    ticketsFetchedRef.current = true;

    (async () => {
      try {
        const nextConversations = await fetchConversations({
          targetPage: 1,
          searchTerm: "",
          status: activeFilterRef.current,
        });

        const requestedId =
          typeof window !== "undefined"
            ? new URLSearchParams(window.location.search).get("id")
            : null;
        const initialId =
          nextConversations.find(
            (conversation) => conversation.id === requestedId,
          )?.id ?? null;

        setActiveConversationId(initialId);
      } catch (error) {
        setSnackbar({
          open: true,
          message:
            error?.response?.data?.message ||
            "Unable to load your chats.",
          tone: "error",
        });
      } finally {
        setLoading(false);
      }
    })();
  }, [fetchConversations]);

  const handleSearchChange = (value) => {
    setSearchValue(value);

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    setSearching(true);
    if (listScrollRef.current) listScrollRef.current.scrollTop = 0;
    searchTimeoutRef.current = setTimeout(() => {
      setPage(1);
      fetchConversations({
        targetPage: 1,
        searchTerm: value,
        status: activeFilter,
      })
        .catch(() => {
          setSnackbar({
            open: true,
            message: "Unable to load your chats.",
            tone: "error",
          });
        })
        .finally(() => {
          setSearching(false);
        });
    }, SEARCH_DEBOUNCE_MS);
  };

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    setPage(1);
    setConversations([]);
    setPagination(null);
    if (listScrollRef.current) listScrollRef.current.scrollTop = 0;
    fetchConversations({
      targetPage: 1,
      searchTerm: searchValue,
      status: filter,
    }).catch(() => {
      setSnackbar({
        open: true,
        message: "Unable to load your chats.",
        tone: "error",
      });
    });
  };

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, []);

  const markTicketSeen = (ticketId) => {
    if (!ticketId || seenMarkInFlightRef.current) return;

    seenMarkInFlightRef.current = true;

    apiClient
      .post(`${baseRoute}/support-tickets/${ticketId}/seen`)
      .then((response) => {
        const markedIds = response?.data?.result?.messageIds;

        if (!Array.isArray(markedIds) || !markedIds.length) return;

        const markedIdSet = new Set(markedIds);

        setMessagesByConversation((current) => {
          const existing = current[ticketId];

          if (!existing) return current;

          return {
            ...current,
            [ticketId]: existing.map((message) =>
              markedIdSet.has(message.id)
                ? { ...message, status: "seen" }
                : message,
            ),
          };
        });
      })
      .catch(() => {})
      .finally(() => {
        seenMarkInFlightRef.current = false;
      });
  };

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messagesByConversation, activeConversationId, isTyping, mobileView]);

  useEffect(() => {
    const token = normalizeSocketToken(getStoredAccessToken());

    if (!token) return undefined;

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
      const freshToken = normalizeSocketToken(getStoredAccessToken());

      if (freshToken && socket.auth?.token !== freshToken) {
        socket.auth = { token: freshToken };
      }
    });

    socket.on("receiveSupportMessage", (payload) => {
      if (
        payload?.success !== true ||
        !payload?.ticketId ||
        !payload?.message ||
        !payload?.message?._id
      ) {
        return;
      }

      const ticketId = payload.ticketId;
      const chatMessage = toChatMessage(payload.message);
      const isOwn = payload.message.senderType === "user";

      const tempQueue = pendingTempRef.current[ticketId] ?? [];
      const tempIndex = tempQueue.findIndex(
        (entry) => entry.text === payload.message.message,
      );
      const tempEntry = tempIndex !== -1 ? tempQueue[tempIndex] : null;

      if (tempEntry) {
        tempQueue.splice(tempIndex, 1);

        if (tempQueue.length === 0) {
          delete pendingTempRef.current[ticketId];
        } else {
          pendingTempRef.current[ticketId] = tempQueue;
        }
      }

      setMessagesByConversation((current) => {
        const existing = current[ticketId] ?? [];
        const serverIndex = existing.findIndex(
          (message) => message.id === chatMessage.id,
        );

        if (serverIndex !== -1) {
          if (!isOwn) return current;

          const next = [...existing];
          next[serverIndex] = {
            ...next[serverIndex],
            status:
              next[serverIndex].status === "seen" ? "seen" : "delivered",
          };
          return { ...current, [ticketId]: next };
        }

        if (tempEntry) {
          return {
            ...current,
            [ticketId]: existing.map((message) =>
              message.id === tempEntry.id ? chatMessage : message,
            ),
          };
        }

        return { ...current, [ticketId]: [...existing, chatMessage] };
      });

      setConversations((current) => {
        const exists = current.some((c) => String(c.id) === String(ticketId));
        if (!exists) {
          setTimeout(() => {
            fetchConversations({ targetPage: 1, searchTerm: searchValueRef.current, status: activeFilterRef.current }).catch(() => {});
          }, 50);
          return current;
        }
        let updated = null;
        const mapped = current.map((conversation) =>
          conversation.id === ticketId
            ? (updated = {
                ...conversation,
                lastMessage: chatMessage.text,
                time: formatTicketDate(payload.message.createdAt || new Date().toISOString()),
                open: true,
                unread:
                  isOwn || selectedTicketIdRef.current === ticketId
                    ? 0
                    : conversation.unread + 1,
              })
            : conversation,
        );
        if (!updated) return mapped;
        const others = mapped.filter((c) => String(c.id) !== String(ticketId));
        return [updated, ...others];
      });

      if (
        !isOwn &&
        !payload.message.seen &&
        selectedTicketIdRef.current === ticketId
      ) {
        markTicketSeen(ticketId);
      }
    });

    socket.on("messageSeen", (payload) => {
      if (
        !payload?.ticketId ||
        !Array.isArray(payload?.messageIds) ||
        !payload.messageIds.length
      ) {
        return;
      }

      const markedIdSet = new Set(payload.messageIds);

      setMessagesByConversation((current) => {
        const existing = current[payload.ticketId];

        if (!existing) return current;

        return {
          ...current,
          [payload.ticketId]: existing.map((message) =>
            markedIdSet.has(message.id)
              ? { ...message, status: "seen" }
              : message,
          ),
        };
      });
    });

    const refetchCurrentView = () => {
      fetchConversations({
        targetPage: 1,
        searchTerm: searchValueRef.current,
        status: activeFilterRef.current,
      }).catch(() => {});
    };

    const applyTicketStatusEvent = (payload, fallbackStatus) => {
      if (payload?.success !== true || !payload?.ticketId) return;

      const nextStatus =
        payload.ticket?.status || payload.status || fallbackStatus;

      const nextConversation = payload.ticket
        ? toConversation(payload.ticket)
        : null;

      const existsInList = conversationsRef.current.some(
        (conversation) => conversation.id === payload.ticketId,
      );

      if (nextConversation && Array.isArray(payload.ticket.messages)) {
        setMessagesByConversation((current) => ({
          ...current,
          [payload.ticketId]: payload.ticket.messages.map(toChatMessage),
        }));
      }

      setConversations((current) =>
        current.map((conversation) => {
          if (conversation.id !== payload.ticketId) return conversation;

          if (nextConversation) {
            return {
              ...nextConversation,
              unread: conversation.unread,
              online: conversation.online,
              blocked: conversation.blocked,
              addedUser: conversation.addedUser,
            };
          }

          return { ...conversation, open: nextStatus === "Open" };
        }),
      );

      const matchesTab =
        (activeFilterRef.current === "closed" ? "Closed" : "Open") ===
        nextStatus;

      if (!matchesTab || !existsInList) {
        refetchCurrentView();
      }
    };

    socket.on("supportTicketUpdated", (payload) => {
      applyTicketStatusEvent(payload);
    });

    socket.on("supportTicketClosed", (payload) => {
      applyTicketStatusEvent(payload, "Closed");
    });

    socket.on("typing", (payload) => {
      if (payload?.senderType !== "admin") return;
      if (payload?.ticketId !== selectedTicketIdRef.current) return;

      setIsTyping(true);
    });

    socket.on("stopTyping", (payload) => {
      if (payload?.ticketId !== selectedTicketIdRef.current) return;

      setIsTyping(false);
    });

    socket.on("adminJoinedTicket", (payload) => {
      if (payload?.ticketId === selectedTicketIdRef.current) {
        setSnackbar({
          open: true,
          message: "Support agent joined the chat.",
          tone: "success",
        });
      }
    });

    socket.on("ticket_message_error", (payload) => {
      setSnackbar({
        open: true,
        message: payload?.message || "Unable to send the message.",
        tone: "error",
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
  }, [fetchConversations]);

  const selectedConversationId = useMemo(() => {
    if (
      activeConversationId &&
      conversations.some(
        (conversation) => String(conversation.id) === String(activeConversationId),
      )
    ) {
      return activeConversationId;
    }

    return null;
  }, [activeConversationId, conversations]);

  const activeConversation =
    conversations.find(
      (conversation) => conversation.id === selectedConversationId,
    ) ?? null;
  const activeMessages = selectedConversationId
    ? (messagesByConversation[selectedConversationId] ?? [])
    : [];
  const blocked = Boolean(activeConversation?.blocked);
  const ticketClosed = Boolean(activeConversation && !activeConversation.open);
  const unreadTotal = conversations.reduce(
    (total, conversation) => total + conversation.unread,
    0,
  );

  useEffect(() => {
    const previousId = joinedTicketRef.current;
    selectedTicketIdRef.current = selectedConversationId;

    const socket = socketRef.current;

    if (!socket || !selectedConversationId) return undefined;

    socket.emit("joinSupportRoom", { ticketId: selectedConversationId });

    if (previousId && previousId !== selectedConversationId) {
      socket.emit("leaveSupportRoom", { ticketId: previousId });
    }

    joinedTicketRef.current = selectedConversationId;

    return undefined;
  }, [selectedConversationId]);

  const updateConversationPreview = (conversationId, lastMessage) => {
    setConversations((current) =>
      current.map((conversation) =>
        conversation.id === conversationId
          ? {
              ...conversation,
              lastMessage,
              time: "Now",
            }
          : conversation,
      ),
    );
  };

  useEffect(() => {
    const ticketId = activeConversationId;

    if (!ticketId) return undefined;
    if (detailFetchedRef.current === ticketId) return undefined;

    detailFetchedRef.current = ticketId;
    setDetailLoading(true);

    apiClient
      .get(`${baseRoute}/support-tickets/${ticketId}`)
      .then((response) => {
        const ticket = response?.data?.result;

        if (!ticket?._id) return;

        const chatMessages = (
          Array.isArray(ticket.messages) ? ticket.messages : []
        ).map(toChatMessage);

        setMessagesByConversation((current) => {
          const existing = current[ticket._id] ?? [];
          const existingIds = new Set(existing.map((message) => message.id));
          const merged = [
            ...existing,
            ...chatMessages.filter((message) => !existingIds.has(message.id)),
          ];
          const full = chatMessages.length >= existing.length ? chatMessages : merged;
          return { ...current, [ticket._id]: full };
        });

        const hasUnseen = (Array.isArray(ticket.messages) ? ticket.messages : [])
          .some(
            (message) => message.senderType !== "user" && !message.seen,
          );

        if (hasUnseen) {
          markTicketSeen(ticket._id);
        }
        setTimeout(() => {
          messageEndRef.current?.scrollIntoView({ behavior: "auto", block: "end" });
        }, 80);
      })
      .catch(() => {})
      .finally(() => setDetailLoading(false));
  }, [activeConversationId]);

  useEffect(() => {
    if (activeConversationId && !blocked && !ticketClosed) {
      const t = setTimeout(() => draftInputRef.current?.focus(), 120);
      return () => clearTimeout(t);
    }
  }, [activeConversationId, blocked, ticketClosed]);

  const selectConversation = (conversationId) => {
    setActiveConversationId(conversationId);
    setConversations((current) =>
      current.map((conversation) =>
        conversation.id === conversationId
          ? { ...conversation, unread: 0 }
          : conversation,
      ),
    );
    setMobileView("chat");
  };

  const emitTyping = (start) => {
    const socket = socketRef.current;

    if (!socket?.connected || !selectedConversationId) return;

    if (start) {
      const now = Date.now();

      if (now - (typingEmitRef.current || 0) < 1000) return;

      typingEmitRef.current = now;
      socket.emit("typing", {
        ticketId: selectedConversationId,
        senderType: "user",
      });
    } else {
      socket.emit("stopTyping", {
        ticketId: selectedConversationId,
        senderType: "user",
      });
    }
  };

  const handleSend = () => {
    if (!selectedConversationId || blocked || ticketClosed) return;

    const content = draft.trim();
    const attachmentText = attachment ? `Attachment: ${attachment.name}` : "";
    const text = [content, attachmentText].filter(Boolean).join("\n");

    if (!text) return;

    const socket = socketRef.current;
    const ticketId = selectedConversationId;

    setConversations((current) => {
      const idx = current.findIndex((c) => String(c.id) === String(ticketId));
      if (idx <= 0) {
        return current.map((c) => c.id === ticketId ? { ...c, lastMessage: content || attachmentText, time: "Now" } : c);
      }
      const item = current[idx];
      const updated = { ...item, lastMessage: content || attachmentText, time: formatTicketDate(new Date().toISOString()) };
      return [updated, ...current.slice(0, idx), ...current.slice(idx + 1)];
    });
    updateConversationPreview(ticketId, content || attachmentText);
    emitTyping(false);
    setIsTyping(false);
    setDraft("");
    setAttachment(null);
    setTimeout(() => draftInputRef.current?.focus(), 30);

    if (socket && socket.connected) {
      const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      pendingTempRef.current[ticketId] = [
        ...(pendingTempRef.current[ticketId] ?? []),
        { id: tempId, text },
      ];

      setMessagesByConversation((current) => ({
        ...current,
        [ticketId]: [
          ...(current[ticketId] ?? []),
          {
            id: tempId,
            from: "support",
            text,
            time: formatTime(new Date()),
            status: "sent",
          },
        ],
      }));
      setTimeout(() => messageEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }), 50);
      socket.emit("sendSupportMessage", {
        ticketId,
        senderType: "user",
        message: text,
      });
      setTimeout(() => draftInputRef.current?.focus(), 60);
      return;
    }

    apiClient
      .post(`${baseRoute}/support-tickets/${ticketId}/messages`, {
        ticketId,
        message: text,
      })
      .then((response) => {
        const ticket = response?.data?.result;

        if (!ticket?._id) return;

        const chatMessages = (
          Array.isArray(ticket.messages) ? ticket.messages : []
        ).map(toChatMessage);

        setMessagesByConversation((current) => {
          const existing = current[ticket._id] ?? [];
          const existingIds = new Set(existing.map((message) => message.id));
          const merged = [
            ...existing,
            ...chatMessages.filter((message) => !existingIds.has(message.id)),
          ];

          return { ...current, [ticket._id]: merged };
        });
      })
      .catch((error) => {
        setSnackbar({
          open: true,
          message:
            error?.response?.data?.message || "Unable to send the message.",
          tone: "error",
        });
      });
  };

  const handleAddUser = () => {
    if (!selectedConversationId) return;

    const wasAdded = Boolean(activeConversation?.addedUser);

    setConversations((current) =>
      current.map((conversation) =>
        conversation.id === selectedConversationId
          ? { ...conversation, addedUser: !conversation.addedUser }
          : conversation,
      ),
    );
    setSnackbar({
      open: true,
      message: wasAdded
        ? "The teammate was removed from this chat."
        : "A teammate was added to this chat.",
      tone: "success",
    });
  };

  const handleBlockUser = () => {
    if (!selectedConversationId) return;

    const wasBlocked = Boolean(activeConversation?.blocked);

    setConversations((current) =>
      current.map((conversation) =>
        conversation.id === selectedConversationId
          ? { ...conversation, blocked: !conversation.blocked, online: false }
          : conversation,
      ),
    );
    setSnackbar({
      open: true,
      message: wasBlocked
        ? "The customer has been unblocked."
        : "The customer has been blocked.",
      tone: wasBlocked ? "success" : "warning",
    });
  };

  const handleEmoji = () => {
    setDraft((current) => `${current}${current ? " " : ""}:)`);
  };

  const handleAttachmentClick = () => {
    fileInputRef.current?.click();
  };

  const handleAttachmentChange = (event) => {
    const file = event.target.files?.[0] ?? null;
    setAttachment(file);
    event.target.value = "";

    if (file) {
      setSnackbar({
        open: true,
        message: `${file.name} is ready to attach.`,
        tone: "info",
      });
    }
  };

  const handleVoice = () => {
    setSnackbar({
      open: true,
      message: "Voice message capture is ready for this chat.",
      tone: "info",
    });
  };

  const renderSidebar = () => (
    <aside className="flex h-full min-h-0 flex-col overflow-hidden bg-card-bg-normal lg:border-r lg:border-input-border">
      <div className="flex h-[68px] shrink-0 items-center justify-between border-b border-input-border bg-secondary-bg px-4">
        <div className="flex items-center gap-3">
          <Link
            href="/User/help"
            className="inline-flex items-center gap-2 rounded-full border border-input-border bg-input-bg p-2 text-sm font-semibold text-secondary-text transition hover:border-primary hover:text-primary"
          >
            <ArrowLeft size={16} />
          </Link> 
          {/* <Avatar initials="SP" online size="h-10 w-10" /> */}
          <div className="min-w-0">
            <p className="truncate text-[16px] font-semibold text-theme-text">
              Chats
            </p>
            <p className="text-xs text-secondary-text">
              {unreadTotal ? `${unreadTotal} unread` : "All caught up"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* <IconButton label="Add teammate" onClick={handleAddUser}>
            <UserPlus size={19} />
          </IconButton>
          <IconButton label="More options">
            <MoreVertical size={20} />
          </IconButton> */}
        </div>
      </div>

      <div className="border-b border-input-border bg-card-bg-normal px-3 py-2">
        <div className="flex items-center gap-2 rounded-lg border border-input-border bg-input-bg px-3 py-2 text-secondary-text">
          <Search size={17} />
          <input
            value={searchValue}
            onChange={(event) => handleSearchChange(event.target.value)}
            placeholder="Search or start new chat"
            className="w-full bg-transparent text-sm text-theme-text outline-none placeholder:text-secondary-text"
            type="search"
          />
        </div>

        <div className="mt-2 grid grid-cols-2 gap-2">
          {["open", "closed"].map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => handleFilterChange(filter)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize transition ${
                activeFilter === filter
                  ? "bg-primary-text text-white"
                  : "border border-input-border bg-input-bg text-secondary-text hover:bg-secondary-bg hover:text-theme-text"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      <div
        ref={listScrollRef}
        onScroll={handleConversationListScroll}
        className="min-h-0 flex-1 overflow-y-auto"
      >
        {searching ? (
          <div className="flex h-full items-center justify-center px-8 text-center">
            <p className="text-sm font-semibold text-theme-text">Loading...</p>
          </div>
        ) : conversations.length ? (
          <>
            {conversations.map((conversation) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                active={conversation.id === selectedConversationId}
                onClick={() => selectConversation(conversation.id)}
              />
            ))}
            {loadingMore && (
              <div className="py-4 text-center text-sm text-secondary-text">Loading more...</div>
            )}
            {pagination && !pagination.hasNextPage && conversations.length > 0 && (
              <div className="py-3 text-center text-xs text-secondary-text/50">No more chats</div>
            )}
          </>
        ) : (
          <EmptyChatState
            title="No chats found"
            description="Try another search, switch the filter, or create a new support ticket so our team can help."
          />
        )}
      </div>
    </aside>
  );

  const renderChat = () => (
    <section className="flex h-full min-h-0 flex-col overflow-hidden bg-primary-bg">
      <header className="flex h-[68px] shrink-0 items-center justify-between border-b border-input-border bg-secondary-bg px-3 sm:px-4">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            aria-label="Back to chats"
            onClick={() => setMobileView("list")}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-secondary-text transition hover:bg-primary-text/10 hover:text-primary-text lg:hidden"
          >
            <ArrowLeft size={20} />
          </button>
          {/* <Avatar
            initials={activeConversation?.initials ?? "--"}
            online={Boolean(activeConversation?.online && !blocked)}
            size="h-10 w-10"
          /> */}
          <div className="min-w-0">
            <p className="truncate text-[16px] font-semibold text-theme-text">
              {activeConversation?.category ?? "Select a chat"}
            </p>
            {/* <p className="truncate text-xs text-secondary-text">
              {activeConversation?.title
                ? `${activeConversation.title} • `
                : ""}
              {blocked
                ? "Blocked"
                : activeConversation?.online
                  ? "online"
                  : activeConversation?.ticketId ?? "No ticket selected"}
              {activeConversation?.addedUser ? " - team joined" : ""}
            </p> */}
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* <IconButton label="Video call" disabled={!activeConversation}>
            <Video size={20} />
          </IconButton>
          <IconButton label="Voice call" disabled={!activeConversation}>
            <Phone size={19} />
          </IconButton>
          <IconButton
            label={blocked ? "Unblock user" : "Block user"}
            danger
            disabled={!activeConversation}
            onClick={handleBlockUser}
          >
            <Ban size={18} />
          </IconButton>
          <IconButton label="More options" disabled={!activeConversation}>
            <MoreVertical size={20} />
          </IconButton> */}
        </div>
      </header>

      <div
        className="min-h-0 flex-1 overflow-y-auto bg-[var(--dashboardbg)] px-3 py-4 sm:px-5 sm:py-5"
        style={chatCanvasStyle}
      >
        {detailLoading ? (
          <div className="flex h-full min-h-[260px] items-center justify-center">
            <div className="flex flex-col items-center gap-3 text-center">
              <span className="h-7 w-7 animate-spin rounded-full border-2 border-primary/30 border-t-primary" aria-hidden />
              <p className="text-sm font-medium text-secondary-text">Loading conversation...</p>
              <p className="text-xs text-secondary-text/70">Please wait</p>
            </div>
          </div>
        ) : activeConversation ? (
          <div
            key={selectedConversationId}
            className="chat-thread-enter flex min-h-full w-full flex-col"
          >
            <div className="mb-4 flex justify-center">
              {/* <span className="rounded-lg bg-secondary-bg px-3 py-1.5 text-xs font-medium uppercase text-secondary-text">
                Today
              </span> */}
            </div>

            <div className="space-y-2.5">
              {activeMessages.map((message) => (
                <ChatBubble key={message.id} message={message} />
              ))}
              {isTyping ? <TypingDots /> : null}
              <div ref={messageEndRef} />
            </div>
          </div>
        ) : (
          <EmptyChatState
            title="Select a chat"
            description="Choose a conversation from the list to view messages. No chat is selected."
          />
        )}
      </div>

      {activeConversation && attachment ? (
        <div className="border-t border-input-border bg-secondary-bg px-4 py-2">
          <span className="inline-flex max-w-full items-center gap-2 rounded-full border border-input-border bg-input-bg px-3 py-1.5 text-xs text-theme-text">
            <Paperclip size={14} />
            <span className="truncate">{attachment.name}</span>
            <button
              type="button"
              aria-label="Remove attachment"
              onClick={() => setAttachment(null)}
              className="text-secondary-text transition hover:text-theme-text"
            >
              <X size={14} />
            </button>
          </span>
        </div>
      ) : null}

      {!activeConversation ? null : ticketClosed ? (
        <footer className="flex shrink-0 items-center justify-center gap-2 border-t border-input-border bg-secondary-bg px-3 py-4 text-center sm:px-4">
          <p className="text-[14px] leading-5 text-secondary-text">
            This support ticket has been closed.
            <br />
            You can no longer send messages.
          </p>
        </footer>
      ) : (
        <footer className="flex shrink-0 items-end gap-2 border-t border-input-border bg-secondary-bg px-3 py-3 sm:px-4">
          {/* <IconButton label="Emoji" onClick={handleEmoji} disabled={blocked}>
            <Smile size={21} />
          </IconButton>
          <IconButton
            label="Attach file"
            onClick={handleAttachmentClick}
            disabled={blocked}
          >
            <Paperclip size={21} />
          </IconButton> */}

          <textarea
            ref={draftInputRef}
            value={draft}
            onChange={(event) => {
              setDraft(event.target.value);
              emitTyping(true);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                handleSend();
              }
            }}
            placeholder={blocked ? "This chat is blocked" : "Type a message"}
            rows={1}
            disabled={blocked || !activeConversation}
            className="max-h-32 min-h-11 flex-1 resize-none rounded-lg border border-input-border bg-input-bg px-4 py-3 text-[15px] leading-5 text-theme-text outline-none placeholder:text-secondary-text disabled:cursor-not-allowed disabled:opacity-60"
          />

          {draft.trim() || attachment ? (
            <button
              type="button"
              aria-label="Send message"
              onClick={handleSend}
              disabled={blocked || !activeConversation}
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-text text-white transition hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send size={19} />
            </button>
          ) : (
            <IconButton label="Voice message" onClick={handleVoice} disabled={blocked}>
              {/* <Mic size={21} /> */}
            </IconButton>
          )}

          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleAttachmentChange}
          />
        </footer>
      )}
    </section>
  );

  if (loading) {
    return <Skeleton pageName="live-chat" />;
  }

  return (
    <div className="flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden bg-card-bg-normal">

      <div className="min-h-0 flex-1 overflow-hidden">
        <div className="h-full min-h-0 lg:hidden">
          {mobileView === "list" ? renderSidebar() : renderChat()}
        </div>

        <div className="hidden h-full min-h-0 grid-cols-[380px_minmax(0,1fr)] overflow-hidden lg:grid">
          {renderSidebar()}
          {renderChat()}
        </div>
      </div>

      <Snackbar
        open={snackbar.open}
        message={snackbar.message}
        tone={snackbar.tone}
        onClose={() => setSnackbar({ open: false, message: "", tone: "success" })}
      />
    </div>
  );
}
