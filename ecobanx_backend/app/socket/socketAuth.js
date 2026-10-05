const { verifyToken } = require("../middleware/utils/pasetoService");

const socketAuth = async (socket, next) => {
  try {
    const token =
      socket.handshake.auth?.token || socket.handshake.query?.token;

    if (!token) {
      return next(new Error("Authentication required"));
    }

    const payload = await verifyToken(token);

    socket.userId = payload.id;
    socket.userRole = payload.role || "user";

    if (payload.permissions && Array.isArray(payload.permissions)) {
      socket.userPermissions = payload.permissions;
    }

    socket.join(`user:${socket.userId}`);

    if (socket.userRole === "admin") {
      socket.join("admins");
    }

    next();
  } catch (err) {
    next(new Error("Invalid token"));
  }
};

module.exports = { socketAuth };
