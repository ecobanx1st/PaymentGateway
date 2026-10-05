const { SupportTicket } = require("../../models/userSupportTicket");
const supportTicketService = require("../../services/supportTicket/supportTicketService");
const notificationService = require("../../services/notification/notificationService");
const { SupportTicketCategory } = require("../../models/supportTicketCategoryModel");

const supportTicketCreate = async (req, reply) => {
  try {
    if (!req.user) {
      return reply.code(401).send({
        success: false,
        message: "Unauthorized",
      });
    }

    const { title, description, category, customCategory } = req.validatedData || req.body;
    console.log("supportTicketCreate validatedData:", req.validatedData);

    const ticket = await SupportTicket.create({
      userId: req.user._id || req.user.id,
      title,
      description,
      category: category || null,
      customCategory: customCategory || null,

    });

    await supportTicketService.addMessage(ticket._id, {
      senderId: req.user._id || req.user.id,
      senderType: "user",
      message: description,
    });

    const populatedTicket = await supportTicketService.getTicketWithPopulate(ticket._id);

    const io = req.server?.io || global.io;
    if (io) {
      io.to("admins").emit("supportTicketCreated", {
        success: true,
        ticket: populatedTicket,
      });
    }


    const userId = req.user._id || req.user.id;
    const userName = req.user.fullName || req.user.businessName || req.user.email || "A user";

    let categoryName = "General";
    if (populatedTicket.customCategory) {
      categoryName = populatedTicket.customCategory;
    } else if (populatedTicket.category && typeof populatedTicket.category === "object" && populatedTicket.category.name) {
      categoryName = populatedTicket.category.name;
    } else if (populatedTicket.category) {
      const cat = await SupportTicketCategory.findById(populatedTicket.category).select("name");
      if (cat) categoryName = cat.name;
    }

    const ticketTitleForNotif = (populatedTicket.title && String(populatedTicket.title).trim()) || (populatedTicket.description && String(populatedTicket.description).trim().slice(0, 40)) || `Ticket #${String(populatedTicket._id).slice(-6)}`;

    await notificationService.createNotification({
      user_id: userId,
      role: "user",
      title: "Support Ticket Created",
      description: `Your support ticket "${ticketTitleForNotif}" has been created successfully under ${categoryName}.`,
      type: "support",
      category: "SUPPORT",
      status: "success",
    });

    await notificationService.createNotification({
      role: "admin",
      title: "New Support Ticket Raised",
      description: `${userName} has created a support ticket: "${ticketTitleForNotif}" under ${categoryName}.`,
      type: "support",
      category: "SUPPORT",
      status: "info",
    });

    return reply.code(201).send({
      success: true,
      message: "Support ticket created successfully",
      result: populatedTicket,
    });
  } catch (error) {
    console.error("supportTicketCreate error:", error);
    return reply.code(500).send({
      success: false,
      message: "Error creating support ticket",
    });
  }
};

module.exports = { supportTicketCreate };
