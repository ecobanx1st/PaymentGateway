const { SupportTicket } = require("../../models/userSupportTicket");
const { SupportTicketCategory } = require("../../models/supportTicketCategoryModel");
const supportTicketService = require("../../services/supportTicket/supportTicketService");
const notificationService = require("../../services/notification/notificationService");

const getAllTickets = async (req, reply) => {
  try {
    const filter = await supportTicketService.buildFilters(req.query);
    const { page, limit, sort } = req.query;

    let sortObj = { updatedAt: -1 };
    if (sort) {
      const [field, order] = sort.split(":");
      sortObj = { [field]: order === "asc" ? 1 : -1 };
    }

    const result = await supportTicketService.listTickets({
      filter,
      page,
      limit,
      sort: sortObj,
    });

    const lightweightTickets = result.tickets.map((ticket) => {
      const messages = Array.isArray(ticket.messages) ? ticket.messages : [];
      const unreadCount = messages.filter(
        (m) => m.senderType === "user" && !m.seen
      ).length;
      const lastMessage = messages.length ? messages[messages.length - 1] : null;
      const { messages: _messages, ...rest } = ticket;
      return {
        ...rest,
        lastMessage,
        unreadCount,
      };
    });

    const pagination = supportTicketService.formatPagination(result.pagination);

    return reply.code(200).send({
      success: true,
      message: "Support tickets fetched successfully.",
      data: {
        records: lightweightTickets,
        pagination,
      },
      result: {
        tickets: lightweightTickets,
        pagination: result.pagination,
      },
    });
  } catch (error) {
    console.error("getAllTickets error:", error);
    return reply.code(500).send({
      success: false,
      message: "Error fetching tickets",
    });
  }
};

const getTicketById = async (req, reply) => {
  try {
    const ticket = await supportTicketService.getTicketWithPopulate(req.params.id);
    if (!ticket) {
      return reply.code(404).send({
        success: false,
        message: "Ticket not found",
      });
    }

    return reply.code(200).send({
      success: true,
      message: "Ticket fetched successfully",
      result: ticket,
    });
  } catch (error) {
    console.error("getTicketById error:", error);
    return reply.code(500).send({
      success: false,
      message: "Error fetching ticket",
    });
  }
};

const adminReply = async (req, reply) => {
  try {
    const { message } = req.validatedData;
    const { id } = req.params;
    const adminId = req.user._id || req.user.id;

    const ticket = await SupportTicket.findById(id);
    if (!ticket) {
      return reply.code(404).send({
        success: false,
        message: "Ticket not found",
      });
    }

    if (ticket.status === "Closed") {
      return reply.code(400).send({
        success: false,
        message: "This support ticket has been closed.",
      });
    }

    await supportTicketService.addMessage(id, {
      senderId: adminId,
      senderType: "admin",
      message,
    });

    const updatedTicket = await supportTicketService.getTicketWithPopulate(id);

    const io = req.server?.io || global.io;
    if (io) {
      const newMessage = updatedTicket.messages[updatedTicket.messages.length - 1];
      const payload = {
        success: true,
        ticketId: id,
        message: newMessage,
      };
      io.to(`support-ticket-${id}`).emit("receiveSupportMessage", payload);
      if (ticket.userId) {
        io.to(`user:${ticket.userId}`).emit("receiveSupportMessage", payload);
      }
      io.to("admins").emit("receiveSupportMessage", payload);
      io.to(`support-ticket-${id}`).emit("supportTicketUpdated", {
        success: true,
        ticketId: id,
        status: ticket.status,
      });
    }

    let categoryName = "General";
    if (ticket.customCategory) {
      categoryName = ticket.customCategory;
    } else if (ticket.category) {
      const cat = await SupportTicketCategory.findById(ticket.category).select("name");
      if (cat) categoryName = cat.name;
    }
    const ticketTitleForNotif = (ticket.title && String(ticket.title).trim()) || (ticket.description && String(ticket.description).trim().slice(0, 40)) || (updatedTicket.title && String(updatedTicket.title).trim()) || `Ticket #${String(ticket._id).slice(-6)}`;
    await notificationService.createNotification({
      role: "user",
      user_id: ticket.userId,
      title: "Support Team Replied",
      description: `Our support team has replied to your support ticket '${ticketTitleForNotif}' (${categoryName}).`,
      type: "general",
      category: "SUPPORT",
      status: "info",
    });

    return reply.code(200).send({
      success: true,
      message: "Reply sent successfully",
      result: updatedTicket,
    });
  } catch (error) {
    console.error("adminReply error:", error);
    return reply.code(500).send({
      success: false,
      message: "Error sending reply",
    });
  }
};

const updateTicketStatus = async (req, reply) => {
  try {
    const { status } = req.validatedData;
    const { id } = req.params;
    const adminId = req.user._id || req.user.id;

    const ticket = await SupportTicket.findById(id);
    if (!ticket) {
      return reply.code(404).send({
        success: false,
        message: "Ticket not found",
      });
    }

    ticket.status = status;
    if (status === "In Progress" && !ticket.assignedTo) {
      ticket.assignedTo = adminId;
    }
    await ticket.save();

    await supportTicketService.addMessage(id, {
      senderType: "Admin",
      message: `Your Ticket"${status}"`,
    });

    const updatedTicket = await supportTicketService.getTicketWithPopulate(id);

    const io = req.server?.io || global.io;
    if (io) {
      const ownerId = ticket.userId ? String(ticket.userId) : null;
      let emitter = io.to(`support-ticket-${id}`).to("admins");
      if (ownerId) {
        emitter = emitter.to(`user:${ownerId}`);
      }
      emitter.emit("supportTicketUpdated", {
        success: true,
        ticketId: id,
        status,
        ticket: updatedTicket,
      });
    }

    return reply.code(200).send({
      success: true,
      message: "Ticket status updated successfully",
      result: updatedTicket,
    });
  } catch (error) {
    console.error("updateTicketStatus error:", error);
    return reply.code(500).send({
      success: false,
      message: "Error updating ticket status",
    });
  }
};



const markMessagesSeen = async (req, reply) => {
  try {
    const { id } = req.params;

    const ticket = await SupportTicket.findById(id);
    if (!ticket) {
      return reply.code(404).send({
        success: false,
        message: "Ticket not found",
      });
    }

    const messageIds = ticket.messages
      .filter((message) => message.senderType === "user" && !message.seen)
      .map((message) => message._id);

    if (!messageIds.length) {
      return reply.code(200).send({
        success: true,
        message: "No unseen messages",
        result: { messageIds: [], seenAt: null },
      });
    }

    const seenAt = new Date();

    await SupportTicket.updateOne(
      { _id: id },
      {
        $set: {
          "messages.$[message].seen": true,
          "messages.$[message].seenAt": seenAt,
        },
      },
      {
        arrayFilters: [{ "message._id": { $in: messageIds } }],
      }
    );

    const io = req.server?.io || global.io;
    if (io) {
      const payload = {
        success: true,
        ticketId: id,
        messageIds,
        seenAt,
      };
      io.to(`support-ticket-${id}`).emit("messageSeen", payload);
      io.to("admins").emit("messageSeen", payload);
      if (ticket.userId) {
        io.to(`user:${ticket.userId}`).emit("messageSeen", payload);
      }
    }

    return reply.code(200).send({
      success: true,
      message: "Messages marked as seen",
      result: { messageIds, seenAt },
    });
  } catch (error) {
    console.error("markMessagesSeen error:", error);
    return reply.code(500).send({
      success: false,
      message: "Error marking messages as seen",
    });
  }
};

module.exports = {
  getAllTickets,
  getTicketById,
  adminReply,
  updateTicketStatus,
  markMessagesSeen,
};
