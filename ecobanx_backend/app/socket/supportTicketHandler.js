const { SupportTicket } = require("../models/userSupportTicket");
const supportTicketService = require("../services/supportTicket/supportTicketService");
const notificationService = require("../services/notification/notificationService");
const { SupportTicketCategory } = require("../models/supportTicketCategoryModel");

const initSupportTicketSocket = (io) => {
  io.on("connection", (socket) => {
    console.log("Support socket connected:", socket.id, "user:", socket.userId, "role:", socket.userRole);

    socket.on("joinSupportRoom", async ({ ticketId }) => {
      try {
        if (!ticketId) {
          socket.emit("ticket_message_error", {
            success: false,
            message: "ticketId is required",
          });
          return;
        }

        const ticket = await SupportTicket.findById(ticketId).select("userId title status").lean();

        if (!ticket) {
          socket.emit("ticket_message_error", {
            success: false,
            message: "Ticket not found",
          });
          return;
        }

        const ticketUserId = ticket.userId ? String(ticket.userId) : null;

        if (socket.userRole === "user") {
          if (!ticketUserId || ticketUserId !== String(socket.userId)) {
            socket.emit("ticket_message_error", {
              success: false,
              message: "You can only join your own tickets",
            });
            return;
          }
        }

        socket.join(`support-ticket-${ticketId}`);
        console.log(`Socket ${socket.id} joined support-ticket-${ticketId}`);
      } catch (err) {
        console.error("joinSupportRoom error:", err);
        socket.emit("ticket_message_error", {
          success: false,
          message: "Error joining support room",
        });
      }
    });

    socket.on("leaveSupportRoom", ({ ticketId }) => {
      if (!ticketId) return;
      socket.leave(`support-ticket-${ticketId}`);
      console.log(`Socket ${socket.id} left support-ticket-${ticketId}`);
    });

    socket.on("sendSupportMessage", async (data) => {
      try {
        const { ticketId, senderType, message } = data;

        if (!ticketId || !senderType || !message) {
          socket.emit("ticket_message_error", {
            success: false,
            message: "ticketId, senderType and message are required",
          });
          return;
        }

        if (socket.userRole === "user" && senderType !== "user") {
          socket.emit("ticket_message_error", {
            success: false,
            message: "Users can only send messages as user type",
          });
          return;
        }

        if (socket.userRole === "admin" && senderType !== "admin") {
          socket.emit("ticket_message_error", {
            success: false,
            message: "Admins can only send messages as admin type",
          });
          return;
        }

        const ticket = await SupportTicket.findById(ticketId).lean();
        if (!ticket) {
          socket.emit("ticket_message_error", {
            success: false,
            message: "Ticket not found",
          });
          return;
        }

        if (socket.userRole === "user") {
          const ticketUserId = ticket.userId ? String(ticket.userId) : null;
          if (!ticketUserId || ticketUserId !== String(socket.userId)) {
            socket.emit("ticket_message_error", {
              success: false,
              message: "You can only send messages to your own tickets",
            });
            return;
          }
        }

        if (ticket.status === "Closed") {
          socket.emit("ticket_message_error", {
            success: false,
            message: "This support ticket has been closed.",
          });
          return;
        }

        await supportTicketService.addMessage(ticketId, {
          senderId: socket.userId,
          senderType,
          message,
        });

        const updatedTicket = await supportTicketService.getTicketWithPopulate(ticketId);
        const newMessage = updatedTicket.messages[updatedTicket.messages.length - 1];

        const payload = {
          success: true,
          ticketId,
          message: newMessage,
        };
        io.to(`support-ticket-${ticketId}`).emit("receiveSupportMessage", payload);
        io.to("admins").emit("receiveSupportMessage", payload);
        const ownerIdForEmit =
          updatedTicket.userId && typeof updatedTicket.userId === "object"
            ? updatedTicket.userId._id
            : updatedTicket.userId;
        if (ownerIdForEmit) {
          io.to(`user:${ownerIdForEmit}`).emit("receiveSupportMessage", payload);
        }

        let categoryName = "General";
        if (updatedTicket.customCategory) {
          categoryName = updatedTicket.customCategory;
        } else if (updatedTicket.category && typeof updatedTicket.category === "object" && updatedTicket.category.name) {
          categoryName = updatedTicket.category.name;
        } else if (updatedTicket.category) {
          const cat = await SupportTicketCategory.findById(updatedTicket.category).select("name");
          if (cat) categoryName = cat.name;
        }

        if (senderType === "user") {
          const userObj = updatedTicket.userId;
          const userName = (userObj && typeof userObj === "object" ? userObj.fullName || userObj.email : null) || "A user";
          await notificationService.createNotification({
            role: "admin",
            title: "New Support Message",
            description: `${userName} sent a new message on support ticket '${updatedTicket.title}' (${categoryName}).`,
            type: "general",
            category: "SUPPORT",
            status: "info",
          });
        } else if (senderType === "admin") {
          const targetUserId = updatedTicket.userId && typeof updatedTicket.userId === "object"
            ? updatedTicket.userId._id
            : updatedTicket.userId;
          await notificationService.createNotification({
            role: "user",
            user_id: targetUserId,
            title: "Support Team Replied",
            description: `Our support team has replied to your support ticket '${updatedTicket.title}' (${categoryName}).`,
            type: "general",
            category: "SUPPORT",
            status: "info",
          });
        }
      } catch (err) {
        console.error("sendSupportMessage error:", err);
        socket.emit("ticket_message_error", {
          success: false,
          message: "Error sending message",
        });
      }
    });

    socket.on("adminJoinedTicket", ({ ticketId, adminName }) => {
      if (!ticketId) return;
      io.to(`support-ticket-${ticketId}`).emit("adminJoinedTicket", {
        success: true,
        ticketId,
        adminName: adminName || "Admin",
      });
    });

    socket.on("typing", ({ ticketId, senderType }) => {
      if (!ticketId) return;
      socket.to(`support-ticket-${ticketId}`).emit("typing", {
        ticketId,
        senderType,
      });
    });

    socket.on("stopTyping", ({ ticketId, senderType }) => {
      if (!ticketId) return;
      socket.to(`support-ticket-${ticketId}`).emit("stopTyping", {
        ticketId,
        senderType,
      });
    });

    socket.on("disconnect", () => {
      console.log("Support socket disconnected:", socket.id, "user:", socket.userId);
    });
  });
};

module.exports = { initSupportTicketSocket };
