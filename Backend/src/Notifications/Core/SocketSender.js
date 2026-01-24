/**
 * Real-time Notifications Module
 * Handles Socket.IO real-time notification broadcasting
 */

/**
 * أنواع الإشعارات للتصنيف السريع
 */
const NOTIFICATION_CATEGORIES = {
  general: ['general', 'system', 'success', 'alert', 'warning', 'message'],
  academic: ['grade', 'daily_marks', 'exam', 'attendance', 'exam_scheduled', 'mark_added'],
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
      // إرسال الرسالة كاملة و الملخص
      message: notification.message,
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
      data: { 
        action: notification.data?.action,
        sectionId: notification.data?.sectionId,
        markId: notification.data?.markId,
        examId: notification.data?.examId,
        examName: notification.data?.examName,
        mark: notification.data?.mark,
        totalMarks: notification.data?.totalMarks,
        entityType: notification.data?.entityType,
        date: notification.data?.date,
      },
      link: notification.link,
    };

    // Send to user's room (by userId)
    io.to(recipientId).emit("newNotification", notificationPayload);
    
    // Check if user is online using onlineUsersManager
    const isOnline = global.onlineUsersManager?.isUserOnline(recipientId) || false;
    if (isOnline) {
      const userData = global.onlineUsersManager?.getUserData(recipientId);
      const userName = userData?.firstName || 'User';
      console.log(`📱 Real-time notification sent to ${userName} (${notification.type}/${notificationPayload.category})`);
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
