// ============================================================================
// index.js - Notifications Module Exports
// ============================================================================

/**
 * Central export file for all notification-related services and handlers
 */

// Main Services
const NotificationManager = require("./Core/NotificationManager");
const FCMService = require("./Core/FCMService");

// Notification Handlers
const DailyMarksHandler = require("./Handlers/DailyMarksHandler");
const ExamHandler = require("./Handlers/ExamHandler");
const NewsHandler = require("./Handlers/NewsHandler");
const StudentHandler = require("./Handlers/StudentHandler");
const AttendanceHandler = require("./Handlers/AttendanceHandler");
const WarningHandler = require("./Handlers/WarningHandler");
const ChatHandler = require("./Handlers/ChatHandler");
const TimetableHandler = require("./Handlers/TimetableHandler");
const SecretaryHandler = require("./Handlers/SecretaryHandler");

module.exports = {
  // Main Services
  NotificationService: NotificationManager, // Export as NotificationService for backward compatibility
  FCMService,
  
  // Warning Notifications
  notifyStudentWarning: WarningHandler.notifyStudentWarning,
  
  // Student Notifications
  notifyStudentAddedToGroup: StudentHandler.notifyStudentAddedToGroup,
  notifyStudentRemovedFromGroup: StudentHandler.notifyStudentRemovedFromGroup,
  notifyStudentMovedGroup: StudentHandler.notifyStudentMovedGroup,
  
  // Attendance Notifications
  notifyAbsence: AttendanceHandler.notifyAbsence,
  notifyAbsenceRemoved: AttendanceHandler.notifyAbsenceRemoved,
  notifyBulkAbsences: AttendanceHandler.notifyBulkAbsences,
  
  // Section Notifications
  notifySectionAdded: DailyMarksHandler.notifySectionAdded,
  notifySectionUpdated: DailyMarksHandler.notifySectionUpdated,
  notifySectionDeleted: DailyMarksHandler.notifySectionDeleted,
  notifyStudentAboutSection: DailyMarksHandler.notifyStudentAboutSection,
  
  // Exam Notifications
  notifyExamCreated: ExamHandler.notifyExamCreated,
  notifyExamDeleted: ExamHandler.notifyExamDeleted,
  notifyExamUpdated: ExamHandler.notifyExamUpdated,
  notifyExamMarkAdded: ExamHandler.notifyExamMarkAdded,
  notifyBulkExamMarks: ExamHandler.notifyBulkExamMarks,
  
  // Daily Mark Notifications
  notifyMarkAdded: DailyMarksHandler.notifyMarkAdded,
  notifyMarksAdded: DailyMarksHandler.notifyMarksAdded,
  notifyMarkUpdated: DailyMarksHandler.notifyMarkUpdated,
  notifyMarkDeleted: DailyMarksHandler.notifyMarkDeleted,
  notifyStudentMarks: DailyMarksHandler.notifyStudentMarks,
  
  // News Notifications
  notifyNewsCreated: NewsHandler.notifyNewsCreated,
  notifyNewsUpdated: NewsHandler.notifyNewsUpdated,
  notifyNewsDeleted: NewsHandler.notifyNewsDeleted,

  // Admin Notifications (Actions by Admin)
  notifyGroupAssigned: require("./Handlers/AdminHandler").notifyGroupAssigned,
  notifyGroupUpdated: require("./Handlers/AdminHandler").notifyGroupUpdated,
  notifyGroupTransferredFrom: require("./Handlers/AdminHandler").notifyGroupTransferredFrom,
  notifyGroupTransferredTo: require("./Handlers/AdminHandler").notifyGroupTransferredTo,
  notifyGroupDeleted: require("./Handlers/AdminHandler").notifyGroupDeleted,
  notifyTeacherInfoUpdated: require("./Handlers/AdminHandler").notifyTeacherInfoUpdated,
  notifyGroupRenamed: require("./Handlers/AdminHandler").notifyGroupRenamed,
  notifyAdminAddedStudent: require("./Handlers/AdminHandler").notifyAdminAddedStudent,
  notifyAdminRemovedStudent: require("./Handlers/AdminHandler").notifyAdminRemovedStudent,
  notifyAdminMovedStudent: require("./Handlers/AdminHandler").notifyAdminMovedStudent,

  // Chat Notifications
  notifyNewMessage: ChatHandler.notifyNewMessage,

  // Timetable Notifications
  notifyTimetableCreated: TimetableHandler.notifyTimetableCreated,
  notifyTimetableUpdated: TimetableHandler.notifyTimetableUpdated,
  notifyTimetableDeleted: TimetableHandler.notifyTimetableDeleted,

  notifyNewsPublished: NewsHandler.notifyNewsPublished,
  notifyNewsArchived: NewsHandler.notifyNewsArchived,
  notifyBulkNewsCreated: NewsHandler.notifyBulkNewsCreated,
  notifyBulkNewsUpdated: NewsHandler.notifyBulkNewsUpdated,
  notifyBulkNewsDeleted: NewsHandler.notifyBulkNewsDeleted,
  notifyViewsIncremented: NewsHandler.notifyViewsIncremented,
  
  // ✅ Secretary Notifications - إشعارات السكرتير
  SecretaryHandler,
  secretaryNotifyAllStudents: SecretaryHandler.notifyAllStudents,
  secretaryNotifyAllTeachers: SecretaryHandler.notifyAllTeachers,
  secretaryNotifyAdmin: SecretaryHandler.notifyAdmin,
  secretaryNotifyAll: SecretaryHandler.notifyAll,
  secretaryNotifyStudent: SecretaryHandler.notifyStudent,
  secretaryNotifyTeacher: SecretaryHandler.notifyTeacher,
  secretaryStudentAdded: SecretaryHandler.notifyStudentAdded,
  secretaryStudentRemoved: SecretaryHandler.notifyStudentRemoved,
  secretaryStudentMoved: SecretaryHandler.notifyStudentMoved,
  checkSecretaryPermission: SecretaryHandler.checkSecretaryPermission,
  getSecretaryPermissions: SecretaryHandler.getSecretaryPermissions,
  
  // Helper functions from NotificationManager
  sendNotificationToDevices: NotificationManager.prototype.sendNotificationToDevices,
  // Note: sendNotificationToUser is not static, so we can't export it easily here without an instance
  // But it's usually accessed via global.notificationService
};
