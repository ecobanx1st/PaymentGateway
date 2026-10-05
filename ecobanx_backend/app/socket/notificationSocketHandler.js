const {
  getAdminUnreadCount,
} = require("../services/notification/notificationService");

const initNotificationSocket = (io) => {
  io.on("connection", (socket) => {
    socket.on("notification:getUnreadCount", async () => {
      if (socket.userRole !== "admin") {
        return;
      }

      try {
        const count = await getAdminUnreadCount();
        socket.emit("notification:unreadCount", {
          success: true,
          event: "notification:unreadCount",
          data: { count },
        });
      } catch (error) {
        console.error("notification:getUnreadCount error:", error);
      }
    });
  });
};

module.exports = { initNotificationSocket };