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

    // Send to user's room (by userId)
    io.to(recipientId).emit("newNotification", notificationPayload);
    console.log(`📤 Notification sent to room: ${recipientId} - ${notification.title}`);

    // Also try to send via socketId if user is in onlineUsers
    if (global.onlineUsers && global.onlineUsers.has(recipientId)) {
      const userData = global.onlineUsers.get(recipientId);
      io.to(userData.socketId).emit("newNotification", notificationPayload);
      console.log(`📱 Real-time notification sent to ${userData.firstName} (${notification.type}) via socketId`);
    } else {
      console.log(`📡 User ${recipientId} not in onlineUsers, notification sent to room only`);
    }
  } catch (error) {
    console.error("❌ Error sending real-time notification:", error);
  }
}

module.exports = {
  sendRealTimeNotification,
};
