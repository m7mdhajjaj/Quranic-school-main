// ============================================================================
// messageHandlers.js - Socket Handlers for Messages
// ============================================================================

const { MessageService } = require("../../services/Chat");
const { editMessageSchema } = require("../../Validation/Chat/chatValidation");

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

  /**
   * Edit Message via Socket
   */
  socket.on("message:edit", async (data, ack) => {
    try {
      const { messageId, text } = data;
      
      // Validate input
      const validated = editMessageSchema.parse({ text });
      
      const message = await MessageService.editMessage(userId, messageId, validated.text);
      if (ack) ack({ status: "ok", data: message });
    } catch (error) {
      console.error("Socket message:edit error:", error);
      // Handle Zod validation errors
      if (error.errors) {
        if (ack) ack({ status: "error", message: error.errors[0].message });
      } else {
        if (ack) ack({ status: "error", message: error.message });
      }
    }
  });
};
