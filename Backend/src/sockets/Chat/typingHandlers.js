// ============================================================================
// typingHandlers.js - Socket Handlers for Typing Indicators
// ============================================================================

// Throttle map: userId -> { targetId -> lastTypingTime }
const typingThrottle = new Map();
const TYPING_THROTTLE_MS = 3000; // 3 seconds

module.exports = (io, socket, userId, userRole) => {
  /**
   * Typing Start
   */
  socket.on("typing:start", (data) => {
    const { chatType, targetId } = data;
    
    // Throttle check
    if (!typingThrottle.has(userId)) {
      typingThrottle.set(userId, new Map());
    }
    
    const userThrottle = typingThrottle.get(userId);
    const now = Date.now();
    const lastTime = userThrottle.get(targetId) || 0;
    
    if (now - lastTime < TYPING_THROTTLE_MS) {
      return; // Skip if sent recently
    }
    
    userThrottle.set(targetId, now);
    
    if (chatType === "DM") {
      io.to(targetId).emit("typing:start", { 
        userId, 
        chatType, 
        targetId: userId, 
        userRole 
      });
    } else if (chatType === "GROUP") {
      socket.to(`group:${targetId}`).emit("typing:start", { 
        userId, 
        chatType, 
        targetId, 
        userRole 
      });
    }
  });

  /**
   * Typing Stop
   */
  socket.on("typing:stop", (data) => {
    const { chatType, targetId } = data;
    
    if (chatType === "DM") {
      io.to(targetId).emit("typing:stop", { 
        userId, 
        chatType, 
        targetId: userId, 
        userRole 
      });
    } else if (chatType === "GROUP") {
      socket.to(`group:${targetId}`).emit("typing:stop", { 
        userId, 
        chatType, 
        targetId, 
        userRole 
      });
    }
  });

  /**
   * Cleanup on disconnect
   */
  socket.on("disconnect", () => {
    if (typingThrottle.has(userId)) {
      typingThrottle.delete(userId);
    }
  });
};
