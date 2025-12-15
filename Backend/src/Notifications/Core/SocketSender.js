/**
 * Real-time Notifications Module
 * Handles Socket.IO real-time notification broadcasting
 */

/**
 * Send real-time notification via Socket.IO
 */
async function sendRealTimeNotification(io, notification) {
  try {
    const recipientId = notification.recipient.toString();

    const notificationPayload = {
      id: notification._id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      data: notification.data,
      priority: notification.priority,
      createdAt: notification.createdAt,
      sentAt: notification.sentAt || new Date(),
      isNew: true,
    };

    // Send to user's room (by userId) - this is enough since user joins room on connect
    io.to(recipientId).emit("newNotification", notificationPayload);
    
    if (global.onlineUsers && global.onlineUsers.has(recipientId)) {
      const userData = global.onlineUsers.get(recipientId);
      console.log(`📱 Real-time notification sent to ${userData.firstName} (${notification.type}) in room ${recipientId}`);
    } else {
      console.log(`📡 User ${recipientId} not in onlineUsers, notification sent to room for offline delivery`);
    }
  } catch (error) {
    console.error("❌ Error sending real-time notification:", error);
  }
}

module.exports = {
  sendRealTimeNotification,
};
