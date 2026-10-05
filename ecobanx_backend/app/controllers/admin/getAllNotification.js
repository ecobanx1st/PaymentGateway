const mongoose = require("mongoose");
const notificationService = require("../../services/notification/notificationService");

const getAllNotification = async (req, reply) => {

    try {

        if (!req.user) {
            return reply.code(401).send({
                success: false,
                message: "Unauthorized",
            });
        }

        const page = parseInt(req.query.page, 10) || 1;
        const limit = Math.min(parseInt(req.query.limit, 10) || 10, 100);
        const { category, search, isRead, seen, type } = req.query;

        const result = await notificationService.getAdminNotifications(page, limit, {
            category,
            search,
            isRead: seen !== undefined ? seen : isRead,
            seen: seen !== undefined ? seen : isRead,
            type,
        });

        return reply.code(200).send({
            success: true,
            message: "Notification fetched successfully",
            ...result,
        });

    } catch (error) {
        console.error("getAllNotification error:", error);
        return reply.code(500).send({
            success: false,
            message: "Error fetching getallnotifications",
        });
    }
}

const markAsRead = async (req, reply) => {
  try {
    if (!req.user) {
      return reply.code(401).send({ success: false, message: "Unauthorized" });
    }

    const { notificationId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(notificationId)) {
      return reply.code(400).send({
        success: false,
        message: "Invalid notificationId",
        data: null,
      });
    }

    const notification = await notificationService.markAdminAsRead(notificationId);

    if (!notification) {
      return reply.code(404).send({
        success: false,
        message: "Notification not found",
        data: null,
      });
    }

    return reply.code(200).send({
      success: true,
      message: "Notification marked as read successfully",
      data: notification,
    });
  } catch (error) {
    console.error("markAsRead Error:", error);
    return reply.code(500).send({
      success: false,
      message: "Internal server error",
      data: null,
    });
  }
};

const markAllAsRead = async (req, reply) => {
  try {
    if (!req.user) {
      return reply.code(401).send({ success: false, message: "Unauthorized" });
    }
    await notificationService.markAdminAllAsRead();
    const unreadCount = await notificationService.getAdminUnreadCount();
    return reply.code(200).send({
      success: true,
      message: "All notifications marked as read.",
      unreadCount,
    });
  } catch (error) {
    console.error("markAllAsRead error:", error);
    return reply.code(500).send({ success: false, message: "Error marking notifications as read" });
  }
};

const clearAllNotifications = async (req, reply) => {
  try {
    if (!req.user) {
      return reply.code(401).send({ success: false, message: "Unauthorized" });
    }
    await notificationService.clearAdminNotifications();
    return reply.code(200).send({
      success: true,
      message: "All notifications cleared.",
    });
  } catch (error) {
    console.error("clearAllNotifications error:", error);
    return reply.code(500).send({ success: false, message: "Error clearing notifications" });
  }
};

const getUnreadCount = async (req, reply) => {
  try {
    if (!req.user) {
      return reply.code(401).send({ success: false, message: "Unauthorized" });
    }
    const count = await notificationService.getAdminUnreadCount();
    return reply.code(200).send({ success: true, count });
  } catch (error) {
    console.error("getUnreadCount error:", error);
    return reply.code(500).send({ success: false, message: "Error fetching unread count" });
  }
};

module.exports = {
    getAllNotification,
    markAsRead,
    markAllAsRead,
    getUnreadCount,
    clearAllNotifications,
}
