"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MessageCircle, Plus } from "lucide-react";
import Table from "@/components/ui/Table";
import Button from "@/components/ui/button";
import PageTopBanner from "@/components/ui/PageTopBanner";
import Skeleton from "@/components/ui/skeleton";
import Snackbar from "@/components/ui/Snackbar";
import apiClient from "@/lib/axiosInterceptor";
import { getStoredAccessToken } from "@/lib/auth";
import { io } from "socket.io-client";
import { formatTicketDate, getShortTicketId } from "./_utils";
import { getAccountBaseRoute } from "@/utils/accountRoutes";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3700/ecobanxApi";
const SOCKET_URL = (
  process.env.NEXT_PUBLIC_SOCKET_URL || API_BASE_URL
).replace(/\/ecobanxApi\/?$/, "");

function normalizeSocketToken(token) {
  return typeof token === "string"
    ? token.replace(/^Bearer\s+/i, "").trim()
    : "";
}

const PAGE_SIZE = 10;

function LiveChatCard() {
  return (
    <div className="flex min-h-[13.25rem] w-full flex-col justify-center rounded-[18px] bg-primary-bg p-5 sm:p-6 xl:h-full">
      <div className="flex flex-col items-center text-center">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary-bg text-primary-text">
          <MessageCircle size={18} />
        </span>
        <p className="mt-3 text-lg font-bold tracking-tight text-theme-text">
          Live Chat
        </p>
        {/* <p className="mt-1 text-md text-secondary-text">
          Avg. response time: 3 minutes
        </p> */}

        <Button onNavigate="/User/help/live-chat" className="mt-4 w-[80%] max-w-[23rem]">
          Open chat
        </Button>
      </div>
    </div>
  );
}

function normalizeTicket(ticket) {
  const category =
    ticket.customCategory || ticket.category?.name || "Support Ticket";
  const title = ticket.title || "-";
  const messages = Array.isArray(ticket.messages) ? ticket.messages : [];
  const lastMessage = ticket.lastMessage || (messages.length ? messages[messages.length - 1] : null);
  const unreadCount =
    typeof ticket.unreadCount === "number"
      ? ticket.unreadCount
      : messages.filter((m) => m.senderType === "admin" && !m.seen).length;

  return {
    id: ticket._id || ticket.id,
    subject: category
      .toLowerCase()
      .replace(/\s+/g, " ")
      .replace(/\b[a-z]/g, (char) => char.toUpperCase()),
    title: title
      .toLowerCase()
      .replace(/\s+/g, " ")
      .replace(/\b[a-z]/g, (char) => char.toUpperCase()),
    priority: ticket.priority || "Medium",
    status: ticket.status || "Open",
    updatedAt: formatTicketDate(ticket.updatedAt || ticket.createdAt || lastMessage?.createdAt),
    lastMessage: lastMessage?.message || ticket.description || "",
    unreadCount,
    raw: ticket,
  };
}

export default function Page() {
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [tickets, setTickets] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", tone: "success" });
  const fetchSeqRef = useRef(0);
const baseRoute = getAccountBaseRoute();
  const loadTickets = useCallback(
    async (targetPage, signal) => {
      const seq = ++fetchSeqRef.current;
      setLoading(true);

      try {
        const response = await apiClient.get(`${baseRoute}/support-tickets`, {
          params: { page: targetPage, limit: PAGE_SIZE },
          signal,
        });
        const result = response?.data?.result ?? {};
        const data = response?.data?.data ?? {};
        const list = Array.isArray(result.tickets)
          ? result.tickets
          : Array.isArray(data.records)
            ? data.records
            : [];
        const pagination = result.pagination ?? data.pagination ?? {};

        if (seq !== fetchSeqRef.current) return;

        const lastPage = Math.max(1, pagination.totalPages ?? 1);

        if (targetPage > lastPage) {
          setTotalPages(lastPage);
          setTotalItems(pagination.total ?? pagination.totalRecords ?? 0);
          setPage((current) => (current === targetPage ? lastPage : current));
          return;
        }

        setTickets(list.map(normalizeTicket));
        setTotalItems(pagination.total ?? pagination.totalRecords ?? 0);
        setTotalPages(lastPage);
      } catch (error) {
        if (error?.code === "ERR_CANCELED") return;
        if (seq !== fetchSeqRef.current) return;

        setTickets([]);
        setTotalItems(0);
        setTotalPages(1);
        setSnackbar({
          open: true,
          message: error?.response?.data?.message || "Unable to load support tickets.",
          tone: "error",
        });
      } finally {
        if (seq === fetchSeqRef.current) {
          setLoading(false);
        }
      }
    },
    [],
  );

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      loadTickets(page, controller.signal);
    }, 0);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [page, loadTickets]);

  useEffect(() => {
    const token = normalizeSocketToken(getStoredAccessToken());

    if (!token) return undefined;

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
    });

    const moveToTop = (list, ticketId) => {
      const idx = list.findIndex((t) => String(t.id) === String(ticketId));
      if (idx <= 0) return list;
      const item = list[idx];
      return [item, ...list.slice(0, idx), ...list.slice(idx + 1)];
    };

    socket.on("receiveSupportMessage", (payload) => {
      if (payload?.success !== true || !payload?.ticketId || !payload?.message) return;
      const msg = payload.message;
      const isAdmin = msg.senderType === "admin";
      setTickets((current) => {
        const exists = current.find((t) => String(t.id) === String(payload.ticketId));
        if (!exists) {
          setPage(1);
          return current;
        }
        const updated = current.map((ticket) =>
          String(ticket.id) === String(payload.ticketId)
            ? {
                ...ticket,
                lastMessage: msg.message,
                updatedAt: formatTicketDate(msg.createdAt || new Date().toISOString()),
                unreadCount: isAdmin ? (ticket.unreadCount || 0) + (ticket.id === payload.ticketId && false ? 0 : 1) : ticket.unreadCount,
                raw: { ...ticket.raw, lastMessage: msg, unreadCount: isAdmin ? (ticket.unreadCount || 0) + 1 : ticket.unreadCount },
              }
            : ticket,
        );
        return moveToTop(updated, payload.ticketId);
      });
    });

    socket.on("messageSeen", (payload) => {
      if (!payload?.ticketId || !Array.isArray(payload?.messageIds)) return;
      setTickets((current) =>
        current.map((ticket) =>
          String(ticket.id) === String(payload.ticketId)
            ? { ...ticket, unreadCount: 0, raw: { ...ticket.raw, unreadCount: 0 } }
            : ticket,
        ),
      );
    });

    socket.on("supportTicketUpdated", (payload) => {
      if (
        payload?.success !== true ||
        !payload?.ticketId ||
        !payload?.status
      ) {
        return;
      }

      setTickets((current) => {
        const updated = current.map((ticket) =>
          ticket.id === payload.ticketId
            ? {
                ...ticket,
                status: payload.status,
                updatedAt: formatTicketDate(new Date().toISOString()),
                raw: { ...ticket.raw, status: payload.status },
              }
            : ticket,
        );
        return moveToTop(updated, payload.ticketId);
      });
    });

    socket.on("supportTicketCreated", () => {
      setPage((p) => (p === 1 ? 1 : 1));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const safePage = Math.min(page, Math.max(1, totalPages));

  const columns = [
    {
      key: "id",
      title: "Ticket ID",
      render: (value) => (
        <span className="text-secondary-text">{getShortTicketId(value)}</span>
      ),
    },
    {
      key: "subject",
      title: "Category",
      render: (value, row) => (
        <div className="min-w-0">
          <p className="truncate font-semibold text-theme-text">{value}</p>
      
        </div>
      ),
    },
    // {
    //   key: "priority",
    //   title: "Priority",
    //   type: "priority",
    // },
    {
      key: "status",
      title: "Status",
      type: "status",
    },
    {
      key: "updatedAt",
      title: "Last Updated",
    },
  ];

  const rowActions = [
    {
      key: "open",
      label: "Open",
      tone: "ghost",
      href: (row) => `/User/help/live-chat?id=${row.id}`,
    },
  ];

  const summary =
    totalItems > 0
      ? `Showing ${(safePage - 1) * PAGE_SIZE + 1}-${Math.min(safePage * PAGE_SIZE, totalItems)} of ${totalItems} entries`
      : "Showing 0 entries";

  if (loading && tickets.length === 0) {
    return <Skeleton pageName="support" />;
  }
  return (
    <div className="space-y-6 pb-8">
      <PageTopBanner
        title="Help"
        description="Get help from our team or browse documentation"
        actions={
          <Button
            onNavigate="/User/help/new-ticket"
            variant="primary"
            className="w-full border-0 text-white sm:w-auto"
          >
            <div className="flex items-center gap-2">
              <Plus size={16} />
              <p>New Support Ticket</p>
            </div>
          </Button>
        }
      />

      <section className="grid gap-5 xl:grid-cols-[minmax(17rem,0.78fr)_minmax(0,2.22fr)] xl:items-stretch">
        <LiveChatCard />

        <Table
          title="Your support tickets"
          subtitle=""
          search={false}
          filters={[]}
          showFilter={false}
          showViewAll={false}
          showAddButton={false}
          showExportButton={false}
          data={tickets}
          columns={columns}
          bordered
          hover
          minWidth={780}
          className="h-full overflow-hidden"
          rowActions={rowActions}
          chipMaps={{
            status: {
              Closed: {
                dot: "bg-secondary-text",
                text: "text-secondary-text",
                bg: "bg-secondary-bg",
              },
            },
          }}
          pagination={{
            page: safePage,
            totalPages,
            pageSize: PAGE_SIZE,
            totalItems,
            summary,
            onPageChange: setPage,
          }}
        />
      </section>

      <Snackbar
        open={snackbar.open}
        message={snackbar.message}
        tone={snackbar.tone}
        onClose={() => setSnackbar((current) => ({ ...current, open: false }))}
      />
    </div>
  );
}
