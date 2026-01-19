const Notification = require("../../schema/Notfcation/Notification");
const cron = require("node-cron");
const PrayerJob = require("../Jobs/PrayerJob");
const ScheduleReminderJob = require("../Jobs/ScheduleReminderJob");
const { sendRealTimeNotification, getCategoryFromType } = require("../Core/SocketSender");
const { sendPushNotification, sendNotificationToDevices } = require("../Core/PushSender");
const { 
  invalidateOnNewNotification,
  invalidateBatchUsers,
} = require("../Core/NotificationCache");
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

// ✅ Secretary Handler
const SecretaryHandler = require("../Handlers/SecretaryHandler");

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

      // ✅ إبطال كاش Redis للمستلم
      try {
        await invalidateOnNewNotification(savedNotification.recipient);
      } catch (cacheErr) {
        console.error("❌ Error invalidating notification cache:", cacheErr);
      }

      console.log(`✅ Notification created: ${savedNotification.title} (${savedNotification.category}/${savedNotification.type})`);
      return savedNotification;
    } catch (error) {
      console.error("❌ Error creating notification:", error);
      throw error;
    }
  }

  // ============================================================================
  // Bulk Operations - عمليات دفعية محسّنة
  // ============================================================================

  /**
   * إرسال إشعار لعدة مستخدمين (دفعي - محسّن للأداء)
   * @param {Array} recipients - قائمة المستلمين [{id, model}]
   * @param {String} type - نوع الإشعار
   * @param {String} title - العنوان
   * @param {String} message - الرسالة
   * @param {Object} data - بيانات إضافية
   */
  async createBulkNotifications(recipients, type, title, message, data = {}) {
    try {
      if (!recipients || recipients.length === 0) {
        console.log("⚠️ No recipients for bulk notification");
        return [];
      }

      console.log(`📢 Creating bulk notifications for ${recipients.length} recipients`);

      // استخدام الدالة المحسّنة من Schema
      const notifications = await Notification.createBulkBatched(
        recipients,
        type,
        title,
        message,
        data
      );

      // إرسال Real-time notifications بالتوازي (بدفعات)
      const batchSize = 50;
      for (let i = 0; i < notifications.length; i += batchSize) {
        const batch = notifications.slice(i, i + batchSize);
        const realTimePromises = batch.map(notification => 
          sendRealTimeNotification(this.io, notification).catch(err => 
            console.error("❌ RT error:", err.message)
          )
        );
        await Promise.allSettled(realTimePromises);
      }

      // إرسال Push notifications للأجهزة
      try {
        const recipientIds = recipients.map(r => r.id);
        await sendNotificationToDevices(recipientIds, { title, message, data });
      } catch (pushErr) {
        console.error("❌ Bulk push error:", pushErr.message);
      }

      // إبطال كاش Redis لجميع المستلمين
      try {
        const userIds = recipients.map(r => r.id);
        await invalidateBatchUsers(userIds);
      } catch (cacheErr) {
        console.error("❌ Batch cache error:", cacheErr.message);
      }

      console.log(`✅ Bulk notifications created: ${notifications.length}`);
      return notifications;
    } catch (error) {
      console.error("❌ Error creating bulk notifications:", error);
      throw error;
    }
  }

  /**
   * إرسال إشعار لجميع المستخدمين من نوع معين
   * @param {String} recipientModel - نوع المستلم (Student, Teacher, etc.)
   * @param {String} type - نوع الإشعار
   * @param {String} title - العنوان
   * @param {String} message - الرسالة
   * @param {Object} data - بيانات إضافية
   */
  async broadcastToModel(recipientModel, type, title, message, data = {}) {
    try {
      const Model = require(`mongoose`).model(recipientModel);
      const users = await Model.find({ isActive: { $ne: false } }).select('_id').lean();
      
      const recipients = users.map(user => ({
        id: user._id,
        model: recipientModel,
      }));

      return this.createBulkNotifications(recipients, type, title, message, data);
    } catch (error) {
      console.error(`❌ Error broadcasting to ${recipientModel}:`, error);
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

  // ============================================================================
  // Secretary Notifications - إشعارات السكرتير
  // ============================================================================

  /**
   * إرسال إشعار لجميع الطلاب (حسب صلاحيات السكرتير)
   */
  async secretaryNotifyAllStudents(secretaryId, title, message, data = {}) {
    return SecretaryHandler.notifyAllStudents(
      this.createNotification.bind(this),
      secretaryId,
      title,
      message,
      data
    );
  }

  /**
   * إرسال إشعار لجميع المعلمين (حسب صلاحيات السكرتير)
   */
  async secretaryNotifyAllTeachers(secretaryId, title, message, data = {}) {
    return SecretaryHandler.notifyAllTeachers(
      this.createNotification.bind(this),
      secretaryId,
      title,
      message,
      data
    );
  }

  /**
   * إرسال إشعار للمدير
   */
  async secretaryNotifyAdmin(secretaryId, title, message, data = {}) {
    return SecretaryHandler.notifyAdmin(
      this.createNotification.bind(this),
      secretaryId,
      title,
      message,
      data
    );
  }

  /**
   * إرسال إشعار للجميع (حسب صلاحيات السكرتير)
   * ⚠️ لا يشمل المساعدين
   */
  async secretaryNotifyAll(secretaryId, title, message, data = {}) {
    return SecretaryHandler.notifyAll(
      this.createNotification.bind(this),
      secretaryId,
      title,
      message,
      data
    );
  }

  /**
   * إشعار طالب معين
   */
  async secretaryNotifyStudent(secretaryId, studentId, title, message, data = {}) {
    return SecretaryHandler.notifyStudent(
      this.createNotification.bind(this),
      secretaryId,
      studentId,
      title,
      message,
      data
    );
  }

  /**
   * إشعار معلم معين
   */
  async secretaryNotifyTeacher(secretaryId, teacherId, title, message, data = {}) {
    return SecretaryHandler.notifyTeacher(
      this.createNotification.bind(this),
      secretaryId,
      teacherId,
      title,
      message,
      data
    );
  }

  /**
   * إشعار عند إضافة طالب من السكرتير
   */
  async secretaryStudentAdded(secretaryId, student, groupName, teacherId) {
    return SecretaryHandler.notifyStudentAdded(
      this.createNotification.bind(this),
      secretaryId,
      student,
      groupName,
      teacherId
    );
  }

  /**
   * إشعار عند إزالة طالب من السكرتير
   */
  async secretaryStudentRemoved(secretaryId, student, groupName, teacherId, reason = '') {
    return SecretaryHandler.notifyStudentRemoved(
      this.createNotification.bind(this),
      secretaryId,
      student,
      groupName,
      teacherId,
      reason
    );
  }

  /**
   * إشعار عند نقل طالب من السكرتير
   */
  async secretaryStudentMoved(secretaryId, student, fromGroup, toGroup, oldTeacherId, newTeacherId) {
    return SecretaryHandler.notifyStudentMoved(
      this.createNotification.bind(this),
      secretaryId,
      student,
      fromGroup,
      toGroup,
      oldTeacherId,
      newTeacherId
    );
  }

  /**
   * التحقق من صلاحية السكرتير
   */
  async checkSecretaryPermission(secretaryId, permission, level = 'view') {
    return SecretaryHandler.checkSecretaryPermission(secretaryId, permission, level);
  }

  /**
   * جلب صلاحيات السكرتير
   */
  async getSecretaryPermissions(secretaryId) {
    return SecretaryHandler.getSecretaryPermissions(secretaryId);
  }

  // Helper to expose push notification functionality
  async sendNotificationToDevices(userIds, title, message, data) {
    return sendNotificationToDevices(userIds, title, message, data);
  }
}

module.exports = NotificationManager;
