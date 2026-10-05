const {
  Notification,
  NotificationCategory,
} = require("../../models/NotificationSchema");
const { escapeRegex } = require("../../middleware/utils/escapeRegex");

const createNotification = async (data) => {
  const notification = await Notification.create(data);

  if (global.io) {
    if (data.role === "admin") {
      global.io.to("admins").emit("notification:new", {
        success: true,
        event: "notification:new",
        data: notification,
      });
      Notification.countDocuments({ role: "admin", seen: false })
        .then((count) => {
          global.io.to("admins").emit("notification:unreadCount", {
            success: true,
            event: "notification:unreadCount",
            data: { count },
          });
        })
        .catch(() => {});
    } else if (data.role === "user" && data.user_id) {
      const userIdStr = String(data.user_id);
      global.io.to(`user:${userIdStr}`).emit("notification:new", {
        success: true,
        event: "notification:new",
        data: notification,
      });
      Notification.countDocuments({ user_id: data.user_id, seen: false })
        .then((count) => {
          global.io.to(`user:${userIdStr}`).emit("notification:unreadCount", {
            success: true,
            event: "notification:unreadCount",
            data: { count },
          });
        })
        .catch(() => {});
    }
  }

  return notification;
};

const findMatchingNotificationCategories = (category, allowPartial = false) => {
  if (!category || typeof category !== "string") return [];

  const normalizedCategory = category.trim().toUpperCase();
  if (!normalizedCategory) return [];

  const categoryEntries = Object.entries(NotificationCategory);
  const exactMatch = categoryEntries.find(
    ([key, value]) => key === normalizedCategory || value.toUpperCase() === normalizedCategory
  );

  if (exactMatch) return [exactMatch[1]];

  if (!allowPartial) return [];

  return categoryEntries
    .filter(
      ([key, value]) =>
        key.includes(normalizedCategory) || value.toUpperCase().includes(normalizedCategory)
    )
    .map(([, value]) => value);
};

const buildCategoryFilter = ({ category, search } = {}) => {
  const hasCategory = typeof category === "string" && category.trim();
  const hasSearch = typeof search === "string" && search.trim();

  if (hasCategory) {
    const matchingCategories = findMatchingNotificationCategories(category, false);

    if (!matchingCategories.length) return { _id: null };

    const categoryFilter =
      matchingCategories.length === 1
        ? { category: matchingCategories[0] }
        : { category: { $in: matchingCategories } };

    if (!hasSearch) return categoryFilter;

    const escapedSearch = escapeRegex(search.trim());
    const searchRegex = new RegExp(escapedSearch, "i");

    return {
      ...categoryFilter,
      $or: [
        { title: { $regex: searchRegex } },
        { description: { $regex: searchRegex } },
        { type: { $regex: searchRegex } },
        { category: { $regex: searchRegex } },
      ],
    };
  }

  if (!hasSearch) return {};

  const escapedSearch = escapeRegex(search.trim());
  const searchRegex = new RegExp(escapedSearch, "i");

  return {
    $or: [
      { title: { $regex: searchRegex } },
      { description: { $regex: searchRegex } },
      { type: { $regex: searchRegex } },
      { category: { $regex: searchRegex } },
    ],
  };
};

const getUserNotifications = async (userId, page = 1, limit = 10, filters = {}) => {
  const options = { page, limit, sort: { createdAt: -1 } };
  const categoryFilter = buildCategoryFilter(filters);

  const query = { user_id: userId };

  // isRead is for admin, seen is for user - support both for backward compat
  const rawSeen = filters.seen !== undefined && filters.seen !== "" ? filters.seen : filters.isRead;
  if (rawSeen !== undefined && rawSeen !== "") {
    query.seen = String(rawSeen).toLowerCase() === "true";
  }

  const result = await Notification.paginate(
    { ...query, ...categoryFilter },
    options
  );
  return formatPaginatedResult(result);
};

const getAdminNotifications = async (page = 1, limit = 10, filters = {}) => {
  const options = { page, limit, sort: { createdAt: -1 } };
  const baseFilter = buildCategoryFilter(filters);
  const query = { role: "admin", ...baseFilter };
  if (filters.type) {
    query.type = filters.type;
  }
  // For admin, use seen (not isRead) as per requirement: seen true/false
  const rawSeen = filters.seen !== undefined && filters.seen !== "" && filters.seen !== null ? filters.seen : filters.isRead;
  if (rawSeen !== undefined && rawSeen !== "" && rawSeen !== null) {
    query.seen = String(rawSeen).toLowerCase() === "true";
  }
  const result = await Notification.paginate(query, options);
  return formatPaginatedResult(result);
};

const markAsRead = async (notificationId, userId) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, user_id: userId },
    { $set: { seen: true } },
    { new: true }
  );

  if (notification && global.io) {
    const userIdStr = String(userId);
    global.io.to(`user:${userIdStr}`).emit("notification:update", {
      success: true,
      event: "notification:update",
      data: notification,
    });
    Notification.countDocuments({ user_id: userId, seen: false })
      .then((count) => {
        global.io.to(`user:${userIdStr}`).emit("notification:unreadCount", {
          success: true,
          event: "notification:unreadCount",
          data: { count },
        });
      })
      .catch(() => {});
  }

  return notification;
};

const markAllAsRead = async (userId) => {
  const result = await Notification.updateMany(
    { user_id: userId, seen: false },
    { $set: { seen: true } }
  );

  if (global.io) {
    const userIdStr = String(userId);
    global.io.to(`user:${userIdStr}`).emit("notification:allRead", {
      success: true,
      event: "notification:allRead",
      data: {},
    });
    global.io.to(`user:${userIdStr}`).emit("notification:unreadCount", {
      success: true,
      event: "notification:unreadCount",
      data: { count: 0 },
    });
  }

  return result;
};

const getUnreadCount = async (userId) => {
  return Notification.countDocuments({ user_id: userId, seen: false });
};

const getAdminUnreadCount = async () => {
  return Notification.countDocuments({ role: "admin", seen: false });
};

const markAdminAsRead = async (notificationId) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, role: "admin" },
    { $set: { seen: true } },
    { new: true }
  );

  if (notification && global.io) {
    global.io.to("admins").emit("notification:update", {
      success: true,
      event: "notification:update",
      data: notification,
    });
    Notification.countDocuments({ role: "admin", seen: false })
      .then((count) => {
        global.io.to("admins").emit("notification:unreadCount", {
          success: true,
          event: "notification:unreadCount",
          data: { count },
        });
      })
      .catch(() => {});
  }

  return notification;
};

const markAdminAllAsRead = async () => {
  const result = await Notification.updateMany(
    { role: "admin", seen: false },
    { $set: { seen: true } }
  );

  if (global.io) {
    global.io.to("admins").emit("notification:allRead", {
      success: true,
      event: "notification:allRead",
      data: {},
    });
    global.io.to("admins").emit("notification:unreadCount", {
      success: true,
      event: "notification:unreadCount",
      data: { count: 0 },
    });
  }

  return result;
};

const clearUserNotifications = async (userId) => {
  const result = await Notification.deleteMany({ user_id: userId });

  if (global.io) {
    const userIdStr = String(userId);
    global.io.to(`user:${userIdStr}`).emit("notification:cleared", {
      success: true,
      event: "notification:cleared",
      data: {},
    });
    global.io.to(`user:${userIdStr}`).emit("notification:unreadCount", {
      success: true,
      event: "notification:unreadCount",
      data: { count: 0 },
    });
  }

  return result;
};

const clearAdminNotifications = async () => {
  const result = await Notification.deleteMany({ role: "admin" });

  if (global.io) {
    global.io.to("admins").emit("notification:cleared", {
      success: true,
      event: "notification:cleared",
      data: {},
    });
    global.io.to("admins").emit("notification:unreadCount", {
      success: true,
      event: "notification:unreadCount",
      data: { count: 0 },
    });
  }

  return result;
};

const formatPaginatedResult = (result) => ({
  notifications: result.docs,
  pagination: {
    totalDocs: result.totalDocs,
    totalPages: result.totalPages,
    currentPage: result.page,
    limit: result.limit,
    hasPrevPage: result.hasPrevPage,
    hasNextPage: result.hasNextPage,
    prevPage: result.prevPage,
    nextPage: result.nextPage,
  },
});

module.exports = {
  createNotification,
  getUserNotifications,
  getAdminNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
  getAdminUnreadCount,
  markAdminAsRead,
  markAdminAllAsRead,
  clearUserNotifications,
  clearAdminNotifications,
};
