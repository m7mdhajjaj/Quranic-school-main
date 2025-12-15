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

module.exports = {
  // Main Services
  NotificationService: NotificationManager, // Export as NotificationService for backward compatibility
  FCMService,
  
  // Student Notifications
  notifyStudentAddedToGroup: StudentHandler.notifyStudentAddedToGroup,
  notifyStudentRemovedFromGroup: StudentHandler.notifyStudentRemovedFromGroup,
  notifyStudentMovedGroup: StudentHandler.notifyStudentMovedGroup,
  
  // Section Notifications
  notifySectionAdded: DailyMarksHandler.notifySectionAdded,
  notifySectionUpdated: DailyMarksHandler.notifySectionUpdated,
  notifySectionDeleted: DailyMarksHandler.notifySectionDeleted,
  notifyStudentAboutSection: DailyMarksHandler.notifyStudentAboutSection,
  
  // Exam Notifications
  notifyExamCreated: ExamHandler.notifyExamCreated,
  notifyExamDeleted: ExamHandler.notifyExamDeleted,
  notifyExamUpdated: ExamHandler.notifyExamUpdated,
  
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
  notifyNewsPublished: NewsHandler.notifyNewsPublished,
  notifyNewsArchived: NewsHandler.notifyNewsArchived,
  notifyBulkNewsCreated: NewsHandler.notifyBulkNewsCreated,
  notifyBulkNewsUpdated: NewsHandler.notifyBulkNewsUpdated,
  notifyBulkNewsDeleted: NewsHandler.notifyBulkNewsDeleted,
  notifyViewsIncremented: NewsHandler.notifyViewsIncremented,
  
  // Helper functions from NotificationManager
  sendNotificationToDevices: NotificationManager.prototype.sendNotificationToDevices,
  // Note: sendNotificationToUser is not static, so we can't export it easily here without an instance
  // But it's usually accessed via global.notificationService
};
