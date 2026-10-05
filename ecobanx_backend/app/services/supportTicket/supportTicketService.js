const mongoose = require("mongoose");
const { SupportTicket } = require("../../models/userSupportTicket");
const { SupportTicketCategory } = require("../../models/supportTicketCategoryModel");
const { Users } = require("../../models/usersModel");
const { escapeRegex } = require("../../middleware/utils/escapeRegex");

const getTicketWithPopulate = async (ticketId) => {
  return SupportTicket.findById(ticketId)
    .populate("userId", "fullName email")
    .populate("assignedTo", "name email")
    .populate("category", "name description");
};

const listTickets = async ({ filter, page = 1, limit = 10, sort = { updatedAt: -1 } }) => {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
  const skip = (pageNum - 1) * limitNum;

  const [tickets, total] = await Promise.all([
    SupportTicket.find(filter)
      .populate("userId", "fullName email")
      .populate("assignedTo", "name email")
      .populate("category", "name description")
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .lean(),
    SupportTicket.countDocuments(filter),
  ]);

  return {
    tickets,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
      hasNextPage: pageNum * limitNum < total,
      hasPrevPage: pageNum > 1,
    },
  };
};

const addMessage = async (ticketId, { senderId, senderType, message }) => {
  const ticket = await SupportTicket.findByIdAndUpdate(
    ticketId,
    {
      $push: {
        messages: {
          senderId,
          senderType,
          message,
        },
      },
    },
    { new: true }
  );
  return ticket;
};

const buildSearchFilter = async (search) => {
  const safeSearch = escapeRegex(search.trim());
  const regex = new RegExp(safeSearch, "i");

  const orConditions = [
    { description: regex },
    { customCategory: regex },
  ];

  if (mongoose.isValidObjectId(safeSearch)) {
    orConditions.push({ _id: safeSearch });
  }

  const [userIds, categoryIds] = await Promise.all([
    Users.find(
      {
        $or: [{ fullName: regex }, { email: regex }, { phone: regex }],
      },
      { _id: 1 }
    ).lean(),
    SupportTicketCategory.find({ name: regex }, { _id: 1 }).lean(),
  ]);

  if (userIds.length > 0) {
    orConditions.push({ userId: { $in: userIds.map((user) => user._id) } });
  }

  if (categoryIds.length > 0) {
    orConditions.push({
      category: { $in: categoryIds.map((category) => category._id) },
    });
  }

  return orConditions;
};

const buildFilters = async (query) => {
  const filter = {};
  if (query.status) filter.status = query.status;
  if (query.priority) filter.priority = query.priority;
  if (query.category) filter.category = query.category;
  if (query.userId) filter.userId = query.userId;
  if (query.search?.trim()) {
    filter.$or = await buildSearchFilter(query.search);
  }
  if (query.startDate || query.endDate) {
    filter.createdAt = {};
    if (query.startDate) filter.createdAt.$gte = new Date(query.startDate);
    if (query.endDate) filter.createdAt.$lte = new Date(query.endDate);
  }
  return filter;
};

const formatPagination = ({ total, page, limit, totalPages, hasNextPage, hasPrevPage }) => ({
  totalRecords: total,
  currentPage: page,
  totalPages,
  pageSize: limit,
  hasNextPage,
  hasPrevPage,
});

module.exports = {
  getTicketWithPopulate,
  listTickets,
  addMessage,
  buildFilters,
  buildSearchFilter,
  formatPagination,
};
