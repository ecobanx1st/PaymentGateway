const notificationService = require("../../services/notification/notificationService");

const markAsRead = async (req, reply) => {
  try {
    if (!req.user) {
      return reply.code(401).send({ success: false, message: "Unauthorized" });
    }
    const userId = req.user._id || req.user.id;
    const notification = await notificationService.markAsRead(req.params.id, userId);
    if (!notification) {
      return reply.code(404).send({ success: false, message: "Notification not found" });
    }
    return reply.code(200).send({ success: true, message: "Notification marked as read" });
  } catch (error) {
    console.error("markAsRead error:", error);
    return reply.code(500).send({ success: false, message: "Error marking notification as read" });
  }
};

const markAllAsRead = async (req, reply) => {
  try {
    if (!req.user) {
      return reply.code(401).send({ success: false, message: "Unauthorized" });
    }
    const userId = req.user._id || req.user.id;
    await notificationService.markAllAsRead(userId);
    const unreadCount = await notificationService.getUnreadCount(userId);
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
    const userId = req.user._id || req.user.id;
    await notificationService.clearUserNotifications(userId);
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
    const userId = req.user._id || req.user.id;
    const count = await notificationService.getUnreadCount(userId);
    return reply.code(200).send({ success: true, count });
  } catch (error) {
    console.error("getUnreadCount error:", error);
    return reply.code(500).send({ success: false, message: "Error fetching unread count" });
  }
};

module.exports = { markAsRead, markAllAsRead, getUnreadCount, clearAllNotifications };
