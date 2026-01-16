/**
 * Real-time Notifications Module
 * Handles Socket.IO real-time notification broadcasting
 */

/**
 * أنواع الإشعارات للتصنيف السريع
 */
const NOTIFICATION_CATEGORIES = {
  general: ['general', 'system', 'success', 'alert', 'warning', 'message'],
  academic: ['grade', 'daily_marks', 'exam', 'attendance'],
  admin: [
    'teacher_added', 'teacher_updated', 'teacher_deleted',
    'student_added', 'student_updated', 'student_deleted',
    'group_assigned', 'group_updated', 'group_deleted', 'group_transferred',
    'secretary_added', 'secretary_updated', 'secretary_deleted',
  ],
  other: ['prayer_time', 'news', 'chat', 'timetable'],
};

/**
 * تحديد الفئة من النوع
 */
function getCategoryFromType(type) {
  for (const [category, types] of Object.entries(NOTIFICATION_CATEGORIES)) {
    if (types.includes(type)) return category;
  }
  return 'general';
}

/**
 * Send real-time notification via Socket.IO (Optimized)
 */
async function sendRealTimeNotification(io, notification) {
  try {
    const recipientId = notification.recipient.toString();

    // إرسال بيانات خفيفة فقط (lightweight payload)
    const notificationPayload = {
      _id: notification._id,
      type: notification.type,
      category: notification.category || getCategoryFromType(notification.type),
      title: notification.title,
      // إرسال ملخص الرسالة فقط
      messageSummary: notification.messageSummary || 
        (notification.message && notification.message.length > 150 
          ? notification.message.substring(0, 147) + '...' 
          : notification.message),
      priority: notification.priority || 'medium',
      createdAt: notification.createdAt,
      sentAt: notification.sentAt || new Date(),
      isNew: true,
      isRead: false,
      // بيانات مختصرة للعرض السريع
      summary: notification.summary || {},
      data: { action: notification.data?.action }, // فقط الـ action
      link: notification.link,
    };

    // Send to user's room (by userId)
    io.to(recipientId).emit("newNotification", notificationPayload);
    
    if (global.onlineUsers && global.onlineUsers.has(recipientId)) {
      const userData = global.onlineUsers.get(recipientId);
      console.log(`📱 Real-time notification sent to ${userData.firstName} (${notification.type}/${notificationPayload.category})`);
    } else {
      console.log(`📡 User ${recipientId} offline, notification queued in room`);
    }
  } catch (error) {
    console.error("❌ Error sending real-time notification:", error);
  }
}

module.exports = {
  sendRealTimeNotification,
  getCategoryFromType,
  NOTIFICATION_CATEGORIES,
};
