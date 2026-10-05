let registry = null;

class SocketRegistry {
  constructor(io) {
    this.io = io;
  }

  emitToUser(userId, event, payload) {
    this.io.to(`user:${userId}`).emit(event, {
      success: true,
      event,
      data: payload,
    });
  }

  emitToAdmin(adminId, event, payload) {
    this.io.to(`admin:${adminId}`).emit(event, {
      success: true,
      event,
      data: payload,
    });
  }

  emitToAdmins(event, payload) {
    this.io.to("admins").emit(event, {
      success: true,
      event,
      data: payload,
    });
  }

  emitToRoom(room, event, payload) {
    this.io.to(room).emit(event, {
      success: true,
      event,
      data: payload,
    });
  }

  broadcast(event, payload) {
    this.io.emit(event, {
      success: true,
      event,
      data: payload,
    });
  }

  emitError(socket, event, message) {
    socket.emit("error", {
      success: false,
      event,
      message,
    });
  }
}

const initRegistry = (io) => {
  registry = new SocketRegistry(io);
  global.socketRegistry = registry;
  return registry;
};

const getRegistry = () => {
  if (!registry) {
    throw new Error("SocketRegistry not initialized. Call initRegistry(io) first.");
  }
  return registry;
};

module.exports = { initRegistry, getRegistry, SocketRegistry };
