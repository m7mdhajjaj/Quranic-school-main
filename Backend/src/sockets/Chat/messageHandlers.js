// ============================================================================
// messageHandlers.js - Socket Handlers for Messages
// ============================================================================

const { MessageService } = require("../../services/Chat");

module.exports = (io, socket, userId, userRole) => {
  /**
   * Handle Message Send via Socket
   */
  socket.on("message:send", async (data, ack) => {
    try {
      const message = await MessageService.sendMessage(userId, userRole, data);
      if (ack) ack({ status: "ok", data: message });
    } catch (error) {
      console.error("Socket message:send error:", error);
      if (ack) ack({ status: "error", message: error.message });
    }
  });

  /**
   * Mark Message as Delivered
   */
  socket.on("message:delivered", async (data, ack) => {
    try {
      const { messageId } = data;
      const message = await MessageService.markDelivered(userId, messageId);
      if (ack) ack({ status: "ok" });
    } catch (error) {
      console.error("Socket message:delivered error:", error);
      if (ack) ack({ status: "error", message: error.message });
    }
  });

  /**
   * Mark Message as Read
   */
  socket.on("message:read", async (data, ack) => {
    try {
      const { messageId } = data;
      const message = await MessageService.markSeen(userId, messageId);
      if (ack) ack({ status: "ok" });
    } catch (error) {
      console.error("Socket message:read error:", error);
      if (ack) ack({ status: "error", message: error.message });
    }
  });
};
