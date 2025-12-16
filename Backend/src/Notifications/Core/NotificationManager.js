const Notification = require("../../schema/Notification");
const cron = require("node-cron");
const PrayerJob = require("../Jobs/PrayerJob");
const { sendRealTimeNotification } = require("../Core/SocketSender");
const { sendPushNotification, sendNotificationToDevices } = require("../Core/PushSender");
const {
  notifyNewGrade,
  notifyNewMessage,
  notifyAbsence,
  notifyAbsenceRemoved,
  notifySystemMessage,
  notifyWarning,
} = require("../Handlers/GeneralHandler");

const {
  notifyGroupAssigned,
  notifyGroupUpdated,
  notifyGroupTransferredFrom,
  notifyGroupTransferredTo,
  notifyGroupDeleted,
  notifyTeacherInfoUpdated,
} = require("../Handlers/AdminHandler");

/**
 * NotificationManager - خدمة الإشعارات المركزية
 */
class NotificationManager {
  constructor(io) {
    this.io = io;
    
    // Initialize prayer notifications
    this.prayerJob = new PrayerJob(io);
    this.prayerJob.setupPrayerNotifications();
    
    console.log("🔔 NotificationManager initialized with dynamic prayer times");
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
   * Send real-time notification directly
   * @param {Object} notification - The notification object
   */
  async sendRealTimeNotification(notification) {
    try {
      await sendRealTimeNotification(this.io, notification);
    } catch (err) {
      console.error("❌ Error sending real-time notification:", err);
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

  async notifySystemMessage(recipientId, recipientModel, title, message) {
    return notifySystemMessage(
      this.createNotification.bind(this),
      recipientId,
      recipientModel,
      title,
      message
    );
  }

  /**
   * Teacher Notifications
   */
  async notifyGroupAssigned(teacherId, groupName, adminName) {
    return notifyGroupAssigned(
      this.createNotification.bind(this),
      teacherId,
      groupName,
      adminName
    );
  }

  async notifyGroupUpdated(teacherId, groupName, adminName) {
    return notifyGroupUpdated(
      this.createNotification.bind(this),
      teacherId,
      groupName,
      adminName
    );
  }

  async notifyGroupTransferredFrom(teacherId, groupName, adminName) {
    return notifyGroupTransferredFrom(
      this.createNotification.bind(this),
      teacherId,
      groupName,
      adminName
    );
  }

  async notifyGroupTransferredTo(teacherId, groupName, adminName) {
    return notifyGroupTransferredTo(
      this.createNotification.bind(this),
      teacherId,
      groupName,
      adminName
    );
  }

  async notifyGroupDeleted(teacherId, groupName, adminName) {
    return notifyGroupDeleted(
      this.createNotification.bind(this),
      teacherId,
      groupName,
      adminName
    );
  }

  async notifyTeacherInfoUpdated(teacherId, adminName) {
    return notifyTeacherInfoUpdated(
      this.createNotification.bind(this),
      teacherId,
      adminName
    );
  }

  // Helper to expose push notification functionality
  async sendNotificationToDevices(userIds, title, message, data) {
    return sendNotificationToDevices(userIds, title, message, data);
  }
}

module.exports = NotificationManager;
