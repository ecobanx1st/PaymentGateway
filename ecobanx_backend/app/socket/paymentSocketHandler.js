let ioInstance = null;

const initPaymentSocket = (io) => {
  ioInstance = io;

  io.on("connection", (socket) => {
    console.log("🔌 Socket connected:", socket.id);

    socket.on("join_txn", (data) => {
      const txnId = data?.txn_id || data;

      if (!txnId) {
        return socket.emit("join_txn_error", {
          success: false,
          message: "txn_id is required",
        });
      }

      const room = `txn:${txnId}`;

      socket.join(room);

      console.log(
        `✅ Socket ${socket.id} joined room ${room}`
      );

      socket.emit("joined_txn", {
        success: true,
        txn_id: txnId,
      });
    });

    socket.on("leave_txn", (data) => {
      const txnId = data?.txn_id || data;

      if (!txnId) return;

      const room = `txn:${txnId}`;

      socket.leave(room);

      console.log(
        `🚪 Socket ${socket.id} left room ${room}`
      );
    });

    socket.on("disconnect", (reason) => {
      console.log(
        `❌ Socket disconnected: ${socket.id}`,
        reason
      );
    });
  });
};


const emitPaymentConfirmed = async (txnId, payload) => {
  if (!ioInstance) {
    console.error(
      "❌ Socket.IO instance is not initialized"
    );
    return false;
  }

  if (!txnId) {
    console.error(
      "❌ emitPaymentConfirmed: txnId missing"
    );
    return false;
  }

  const room = `txn:${txnId}`;

  try {
    // DEBUG: verify that the checkout socket is actually inside room
    const sockets = await ioInstance
      .in(room)
      .fetchSockets();

    console.log("=================================");
    console.log("🚀 PAYMENT CONFIRMED SOCKET");
    console.log("txnId:", txnId);
    console.log("room:", room);
    console.log(
      "sockets in room:",
      sockets.map((socket) => socket.id)
    );
    console.log("payload:", payload);
    console.log("=================================");

    ioInstance.to(room).emit(
      "payment_confirmed",
      payload
    );

    console.log(
      `✅ payment_confirmed emitted to ${room}`
    );

    return true;
  } catch (error) {
    console.error(
      "❌ emitPaymentConfirmed failed:",
      error
    );
    return false;
  }
};


module.exports = {
  initPaymentSocket,
  emitPaymentConfirmed,
};
