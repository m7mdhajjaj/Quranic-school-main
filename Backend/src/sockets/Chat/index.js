// ============================================================================
// Chat Socket Index - Main Socket Handler
// ============================================================================

const messageHandlers = require("./messageHandlers");
const typingHandlers = require("./typingHandlers");
const groupHandlers = require("./groupHandlers");
const MessageService = require("../../services/Chat/MessageService");

module.exports = (io, socket) => {
  const userId = socket.handshake.auth?.userId;
  const userRole = socket.handshake.auth?.userRole;

  if (!userId) {
    console.warn("Socket connection without userId");
    return;
  }

  console.log(`🔌 Chat Socket connected - User: ${userId}, Role: ${userRole}`);

  // Mark undelivered messages as delivered
  MessageService.markAllUndeliveredAsDelivered(userId).catch(err => {
    console.error("Failed to mark messages as delivered:", err);
  });

  // Register all handlers
  messageHandlers(io, socket, userId, userRole);
  typingHandlers(io, socket, userId, userRole);
  groupHandlers(io, socket, userId, userRole);

  // Disconnect handler
  socket.on("disconnect", () => {
    console.log(`🔌 Chat Socket disconnected - User: ${userId}`);
  });
};
