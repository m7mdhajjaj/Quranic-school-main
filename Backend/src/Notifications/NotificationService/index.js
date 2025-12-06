const Notification = require("../../schema/Notification");
const cron = require("node-cron");
const PrayerNotifications = require("./helpers/prayerNotifications");
const { sendRealTimeNotification } = require("./helpers/realtimeNotifications");
const { sendPushNotification, sendNotificationToDevices } = require("./helpers/pushNotifications");
const {
  notifyNewGrade,
  notifyNewMessage,
  notifyAbsence,
  notifyAbsenceRemoved,
  notifySystemMessage,
  notifyWarning,
} = require("./helpers/specificNotifications");

/**
 * NotificationService - خدمة الإشعارات المركزية
 * 
 * ملاحظة هامة: إشعارات الصلاة لا تُحفظ في قاعدة البيانات
 * - يتم بثها فقط عبر Socket.IO و FCM للتنبيه الفوري
 * - لا تظهر في Notification Header للمستخدمين
 * - باقي الإشعارات (علامات، غياب، امتحانات، إلخ) تُحفظ عادياً
 */
class NotificationService {
  constructor(io) {
    this.io = io;
    
    // Initialize prayer notifications
    this.prayerNotifications = new PrayerNotifications(io);
    this.prayerNotifications.setupPrayerNotifications();
    
    console.log("🔔 NotificationService initialized with dynamic prayer times");
  }

  /**
   * Create and dispatch a notification
   */
  async createNotification(notificationData) {
    try {
      const notification = new Notification(notificationData);
      const savedNotification = await notification.save();

      // Send via Socket.IO (real-time)
      try {
        await sendRealTimeNotification(this.io, savedNotification);
      } catch (err) {
        console.error("❌ Error sending real-time notification:", err);
      }

      // Send via FCM (push notification)
      try {
        await sendPushNotification(savedNotification.recipient, savedNotification);
      } catch (fcmErr) {
        console.error("❌ Error sending FCM push:", fcmErr);
      }

      console.log(`✅ Notification created: ${savedNotification.title} for ${savedNotification.recipient}`);
      return savedNotification;
    } catch (error) {
      console.error("❌ Error creating notification:", error);
      throw error;
    }
  }

  /**
   * Specific notification methods
   */
  async notifyNewGrade(studentId, subject, grade, teacherName, isUpdate = false, oldGrade = null) {
    return notifyNewGrade(
      this.createNotification.bind(this),
      studentId,
      subject,
      grade,
      teacherName,
      isUpdate,
      oldGrade
    );
  }

  async notifyNewMessage(recipientId, recipientModel, senderName, messageText) {
    return notifyNewMessage(
      this.createNotification.bind(this),
      recipientId,
      recipientModel,
      senderName,
      messageText
    );
  }

  async notifyAbsence(studentId, date, teacherName) {
    return notifyAbsence(this.createNotification.bind(this), studentId, date, teacherName);
  }

  async notifyAbsenceRemoved(studentId, date, teacherName) {
    return notifyAbsenceRemoved(this.createNotification.bind(this), studentId, date, teacherName);
  }

  async notifyWarning(studentId, warningType, reason, teacherName, penalties = {}) {
    return notifyWarning(
      this.createNotification.bind(this),
      studentId,
      warningType,
      reason,
      teacherName,
      penalties
    );
  }

  async notifySystemMessage(recipientId, recipientModel, title, message, priority = "medium", data = {}) {
    return notifySystemMessage(
      this.createNotification.bind(this),
      recipientId,
      recipientModel,
      title,
      message,
      priority,
      data
    );
  }

  /**
   * Get notification statistics
   */
  async getNotificationStats() {
    try {
      const stats = await Notification.aggregate([
        { 
          $group: { 
            _id: "$type", 
            count: { $sum: 1 }, 
            unreadCount: { $sum: { $cond: [{ $eq: ["$isRead", false] }, 1, 0] } } 
          } 
        },
      ]);
      const totalNotifications = await Notification.countDocuments();
      const totalUnread = await Notification.countDocuments({ isRead: false });
      return { totalNotifications, totalUnread, byType: stats, generatedAt: new Date() };
    } catch (error) {
      console.error("❌ Error getting notification stats:", error);
      throw error;
    }
  }

  /**
   * Schedule daily cleanup of old read notifications
   */
  scheduleDailyCleanup() {
    cron.schedule("0 2 * * *", async () => {
      try {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const result = await Notification.deleteMany({ isRead: true, readAt: { $lt: thirtyDaysAgo } });
        console.log(`🧹 Daily cleanup: Deleted ${result.deletedCount} old read notifications`);
      } catch (error) {
        console.error("❌ Error during daily cleanup:", error);
      }
    });
    console.log("🧹 Daily notification cleanup scheduled at 2:00 AM");
  }

  /**
   * Send real-time notification via Socket.IO
   */
  async sendRealTimeNotification(notification) {
    return sendRealTimeNotification(this.io, notification);
  }
}

/**
 * Helper function: Send notification to a single user
 * Creates DB notification + sends push + sends real-time
 */
async function sendNotificationToUser(userId, userModel, title, message, type = "general", data = {}) {
  try {
    const notification = new Notification({
      recipient: userId,
      recipientModel: userModel,
      title: title,
      message: message,
      type: type,
      data: data,
      isRead: false,
    });

    await notification.save();

    // Send push notification
    await sendNotificationToDevices([userId], title, message, {
      ...data,
      notificationId: notification._id.toString(),
      type: type,
    });

    // Send via Socket.IO if available
    if (global.io) {
      global.io.to(userId.toString()).emit("newNotification", {
        id: notification._id,
        type: type,
        title: title,
        message: message,
        data: data,
        createdAt: notification.createdAt,
        isNew: true,
      });
    }

    console.log(`✅ Notification sent to user ${userId}: ${title}`);
    return notification;
  } catch (error) {
    console.error("❌ Error sending notification to user:", error);
    throw error;
  }
}

// Export both the class and helper functions
module.exports = NotificationService;
module.exports.sendNotificationToDevices = sendNotificationToDevices;
module.exports.sendNotificationToUser = sendNotificationToUser;
