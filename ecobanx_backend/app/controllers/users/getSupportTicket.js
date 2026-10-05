const mongoose = require("mongoose");
const supportTicketService = require("../../services/supportTicket/supportTicketService");
const { SupportTicket } = require("../../models/userSupportTicket");
const { escapeRegex } = require("../../middleware/utils/escapeRegex");



const getSupportTicket = async (req, reply) => {
    try {



        if (!req.user) {
            return reply.code(401).send({
                success: false,
                message: "Unauthorized",
            });
        }

        const userId = req.user._id || req.user.id;
        const { page = 1, limit = 10, search = "", status = "" } = req.query;

        const filter = { userId: new mongoose.Types.ObjectId(userId) };

        if (status?.trim()) {
            filter.status = {
                $regex: `^${escapeRegex(status.trim())}$`,
                $options: "i",
            };
        }

        if (search?.trim()) {
            filter.$or = await supportTicketService.buildSearchFilter(search);
        }

        const result = await supportTicketService.listTickets({
            filter,
            page,
            limit,
            sort: { updatedAt: -1 },
        });

        // Lightweight for list: lastMessage + unreadCount (admin messages unseen for user)
        const lightweightTickets = result.tickets.map((ticket) => {
            const messages = Array.isArray(ticket.messages) ? ticket.messages : [];
            const unreadCount = messages.filter(
                (m) => m.senderType === "admin" && !m.seen
            ).length;
            const lastMessage = messages.length ? messages[messages.length - 1] : null;
            const { messages: _messages, ...rest } = ticket;
            return { ...rest, lastMessage, unreadCount };
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
        console.error("getSupportTicket error:", error);
        return reply.code(500).send({
            success: false,
            message: "Error fetching support tickets",
        });
    }
};

const getTicketById = async (req, reply) => {
    try {
        if (!req.user) {
            return reply.code(401).send({
                success: false,
                message: "Unauthorized",
            });
        }

        const userId = req.user._id || req.user.id;
        const ticket = await supportTicketService.getTicketWithPopulate(req.params.id);

        if (!ticket) {
            return reply.code(404).send({
                success: false,
                message: "Ticket not found",
            });
        }

        if (String(ticket.userId._id || ticket.userId) !== String(userId)) {
            return reply.code(403).send({
                success: false,
                message: "You can only view your own tickets",
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

const closeTicket = async (req, reply) => {
    try {
        if (!req.user) {
            return reply.code(401).send({
                success: false,
                message: "Unauthorized",
            });
        }

        const userId = req.user._id || req.user.id;
        const ticket = await supportTicketService.getTicketWithPopulate(req.params.id);

        if (!ticket) {
            return reply.code(404).send({
                success: false,
                message: "Ticket not found",
            });
        }

        if (String(ticket.userId._id || ticket.userId) !== String(userId)) {
            return reply.code(403).send({
                success: false,
                message: "You can only close your own tickets",
            });
        }

        if (ticket.status === "Closed") {
            return reply.code(400).send({
                success: false,
                message: "Ticket is already closed",
            });
        }

        ticket.status = "Closed";
        await ticket.save();

        await SupportTicket.findByIdAndUpdate(ticket._id, {
            $push: {
                messages: {
                    senderType: "system",
                    message: "Ticket closed by user",
                },
            },
        });

        const io = req.server?.io || global.io;
        if (io) {
            const updatedTicket = await supportTicketService.getTicketWithPopulate(ticket._id);

            io.to(`support-ticket-${ticket._id}`).to("admins").emit("supportTicketClosed", {
                success: true,
                ticketId: ticket._id,
            });
            io.to(`support-ticket-${ticket._id}`).to("admins").emit("supportTicketUpdated", {
                success: true,
                ticketId: ticket._id,
                status: "Closed",
                ticket: updatedTicket,
            });
        }

        return reply.code(200).send({
            success: true,
            message: "Ticket closed successfully",
        });
    } catch (error) {
        console.error("closeTicket error:", error);
        return reply.code(500).send({
            success: false,
            message: "Error closing ticket",
        });
    }
};

module.exports = { getSupportTicket, getTicketById, closeTicket };
