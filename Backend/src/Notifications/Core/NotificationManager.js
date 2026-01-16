const Notification = require("../../schema/Notification");
const cron = require("node-cron");
const PrayerJob = require("../Jobs/PrayerJob");
const ScheduleReminderJob = require("../Jobs/ScheduleReminderJob");
const { sendRealTimeNotification, getCategoryFromType } = require("../Core/SocketSender");
const { sendPushNotification, sendNotificationToDevices } = require("../Core/PushSender");
const {
  notifySystemMessage,
  notifyWarning,
} = require("../Handlers/GeneralHandler");
const {
  notifyAbsence,
  notifyAbsenceRemoved,
  notifyBulkAbsences,
} = require("../Handlers/AttendanceHandler");

const {
  notifyGroupAssigned,
  notifyGroupUpdated,
  notifyGroupTransferredFrom,
  notifyGroupTransferredTo,
  notifyGroupDeleted,
  notifyTeacherInfoUpdated,
  notifyGroupStudentsTeacherChanged,
  notifyGroupDeletedForStudents,
  notifyGroupRenamed,
  notifyAdminAddedStudent,
  notifyAdminRemovedStudent,
  notifyAdminMovedStudent,
} = require("../Handlers/AdminHandler");

/**
 * NotificationManager - خدمة الإشعارات المركزية (محسّنة)
 */
class NotificationManager {
  constructor(io) {
    this.io = io;
    
    // Initialize prayer notifications
    this.prayerJob = new PrayerJob(io);
    this.prayerJob.setupPrayerNotifications();

    // Initialize Schedule Reminder Job
    this.scheduleReminderJob = new ScheduleReminderJob(this);
    this.scheduleReminderJob.setupScheduleReminders();
    
    console.log("🔔 NotificationManager initialized with optimized schema");
  }

  /**
   * Create and dispatch a notification (Optimized)
   */
  async createNotification(notificationData) {
    try {
      // إضافة الفئة تلقائياً إذا لم تكن موجودة
      if (!notificationData.category) {
        notificationData.category = getCategoryFromType(notificationData.type);
      }

      // إضافة ملخص الرسالة إذا كانت الرسالة طويلة
      if (notificationData.message && notificationData.message.length > 150 && !notificationData.messageSummary) {
        notificationData.messageSummary = notificationData.message.substring(0, 147) + '...';
      }

      const notification = new Notification(notificationData);
      const savedNotification = await notification.save();

      // Send via Socket.IO (real-time) - lightweight payload
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

      console.log(`✅ Notification created: ${savedNotification.title} (${savedNotification.category}/${savedNotification.type})`);
      return savedNotification;
    } catch (error) {
      console.error("❌ Error creating notification:", error);
      throw error;
    }
  }

  /**
   * Create notification with details (for large data)
   */
  async createNotificationWithDetails(notificationData, detailedData = {}, summaryData = {}) {
    try {
      return await Notification.createWithDetails(
        notificationData.recipient,
        notificationData.recipientModel,
        notificationData.type,
        notificationData.title,
        notificationData.message,
        { ...detailedData, link: notificationData.link },
        summaryData
      );
    } catch (error) {
      console.error("❌ Error creating notification with details:", error);
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

  // ============================================================================
  // Attendance Notifications
  // ============================================================================

  async notifyAbsence(studentId, date, teacherName) {
    return notifyAbsence(this.createNotification.bind(this), studentId, date, teacherName);
  }

  async notifyAbsenceRemoved(studentId, date, teacherName) {
    return notifyAbsenceRemoved(this.createNotification.bind(this), studentId, date, teacherName);
  }

  async notifyBulkAbsences(absentStudents, date, teacherName) {
    return notifyBulkAbsences(this.createNotification.bind(this), absentStudents, date, teacherName);
  }

  // ============================================================================
  // General Notifications
  // ============================================================================

  async notifyWarning(userId, userModel, title, message, data = {}) {
    return notifyWarning(
      this.createNotification.bind(this),
      userId,
      userModel,
      title,
      message,
      data
    );
  }

  async notifySystemMessage(userId, userModel, title, message, data = {}) {
    return notifySystemMessage(
      this.createNotification.bind(this),
      userId,
      userModel,
      title,
      message,
      data
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

  async notifyGroupStudentsTeacherChanged(studentIds, groupName, teacherName, actionType) {
    return notifyGroupStudentsTeacherChanged(
      this.createNotification.bind(this),
      studentIds,
      groupName,
      teacherName,
      actionType
    );
  }

  async notifyGroupDeletedForStudents(studentIds, groupName, adminName) {
    return notifyGroupDeletedForStudents(
      this.createNotification.bind(this),
      studentIds,
      groupName,
      adminName
    );
  }

  async notifyGroupRenamed(teacherId, studentIds, oldName, newName, adminName) {
    return notifyGroupRenamed(
      this.createNotification.bind(this),
      teacherId,
      studentIds,
      oldName,
      newName,
      adminName
    );
  }

  async notifyAdminAddedStudent(teacherId, student, groupName, adminName) {
    console.log("📣 NotificationManager.notifyAdminAddedStudent استُدعي");
    console.log("📣 المعلم:", teacherId);
    console.log("📣 الطالب:", student.firstName, student.lastName);
    console.log("📣 الحلقة:", groupName);
    console.log("📣 الأدمن:", adminName);
    
    return notifyAdminAddedStudent(
      this.createNotification.bind(this),
      teacherId,
      student,
      groupName,
      adminName
    );
  }

  async notifyAdminRemovedStudent(teacherId, student, groupName, adminName) {
    return notifyAdminRemovedStudent(
      this.createNotification.bind(this),
      teacherId,
      student,
      groupName,
      adminName
    );
  }

  async notifyAdminMovedStudent(oldTeacherId, newTeacherId, student, oldGroupName, newGroupName, adminName) {
    return notifyAdminMovedStudent(
      this.createNotification.bind(this),
      oldTeacherId,
      newTeacherId,
      student,
      oldGroupName,
      newGroupName,
      adminName
    );
  }

  // Helper to expose push notification functionality
  async sendNotificationToDevices(userIds, title, message, data) {
    return sendNotificationToDevices(userIds, title, message, data);
  }
}

module.exports = NotificationManager;
