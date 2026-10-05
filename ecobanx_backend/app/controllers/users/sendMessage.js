const { SupportTicket } = require("../../models/userSupportTicket");
const supportTicketService = require("../../services/supportTicket/supportTicketService");
const notificationService = require("../../services/notification/notificationService");
const { SupportTicketCategory } = require("../../models/supportTicketCategoryModel");

const sendMessage = async (req, reply) => {
  try {
    if (!req.user) {
      return reply.code(401).send({
        success: false,
        message: "Unauthorized",
      });
    }

    const { ticketId, message } = req.validatedData || req.body;
    const userId = req.user._id || req.user.id;

    const ticket = await SupportTicket.findById(ticketId);
    if (!ticket) {
      return reply.code(404).send({
        success: false,
        message: "Ticket not found",
      });
    }

    if (String(ticket.userId) !== String(userId)) {
      return reply.code(403).send({
        success: false,
        message: "You can only message your own tickets",
      });
    }

    if (ticket.status === "Closed") {
      return reply.code(400).send({
        success: false,
        message: "This support ticket has been closed.",
      });
    }

    await supportTicketService.addMessage(ticketId, {
      senderId: userId,
      senderType: "user",
      message,
    });

    const updatedTicket = await supportTicketService.getTicketWithPopulate(ticketId);

    const io = req.server?.io || global.io;
    if (io) {
      io.to(`support-ticket-${ticketId}`).emit("receiveSupportMessage", {
        success: true,
        ticketId,
        message: updatedTicket.messages[updatedTicket.messages.length - 1],
      });
    }

    const userName = req.user.fullName || req.user.businessName || req.user.email || "A user";
    let categoryName = "General";
    if (ticket.customCategory) {
      categoryName = ticket.customCategory;
    } else if (ticket.category) {
      const cat = await SupportTicketCategory.findById(ticket.category).select("name");
      if (cat) categoryName = cat.name;
    }
    await notificationService.createNotification({
      role: "admin",
      title: "New Support Message",
      description: `${userName} sent a new message on support ticket '${ticket.title}' (${categoryName}).`,
      type: "general",
      category: "SUPPORT",
      status: "info",
    });

    return reply.code(200).send({
      success: true,
      message: "Message sent successfully",
      result: updatedTicket,
    });
  } catch (error) {
    console.error("sendMessage error:", error);
    return reply.code(500).send({
      success: false,
      message: "Error sending message",
    });
  }
};

const markMessagesSeen = async (req, reply) => {
  try {
    const { id } = req.params;
    const userId = req.user._id || req.user.id;

    const ticket = await SupportTicket.findById(id);
    if (!ticket) {
      return reply.code(404).send({
        success: false,
        message: "Ticket not found",
      });
    }

    if (String(ticket.userId) !== String(userId)) {
      return reply.code(403).send({
        success: false,
        message: "You can only mark your own tickets as seen",
      });
    }

    const messageIds = ticket.messages
      .filter((message) => message.senderType !== "user" && !message.seen)
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
      io.to(`support-ticket-${id}`).emit("messageSeen", {
        success: true,
        ticketId: id,
        messageIds,
        seenAt,
      });
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

module.exports = { sendMessage, markMessagesSeen };
