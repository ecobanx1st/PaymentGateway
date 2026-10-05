const notificationService = require("../../services/notification/notificationService");

const getAllNotification = async (req, reply) => {
    try {

        if (!req.user) {
            return reply.code(401).send({
                success: false,
                message: "Unauthorized",
            });
        }

        const userId = req.user._id || req.user.id;
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const { category, search, isRead, seen } = req.query;

        // For user, seen is the unread flag (isRead is for admin) - support both, default to unread only
        const rawUnread = seen !== undefined ? seen : isRead !== undefined ? isRead : false;
        const result = await notificationService.getUserNotifications(userId, page, limit, {
            category,
            search,
            seen: rawUnread,
            isRead: rawUnread,
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

module.exports = {
    getAllNotification
}
