// ============================================================================
// config/index.js - Notifications Module Exports
// ============================================================================

/**
 * Central export file for all notification-related services and handlers
 * 
 * Usage:
 * const { NotificationService, FCMService, examNotifications } = require('./Notifications/config');
 */

// Main Services
const NotificationService = require("../NotificationService");
const FCMService = require("./FCMService");

// Notification Handlers
const sectionNotifications = require("../sectionNotifications");
const examNotifications = require("../examNotifications");
const dailyMarkNotifications = require("../dailyMarkNotifications");
const newsNotifications = require("../newsNotifications");

module.exports = {
  // Main Services
  NotificationService,
  FCMService,
  
  // Section Notifications
  notifySectionAdded: sectionNotifications.notifySectionAdded,
  notifySectionUpdated: sectionNotifications.notifySectionUpdated,
  notifySectionDeleted: sectionNotifications.notifySectionDeleted,
  notifyStudentAboutSection: sectionNotifications.notifyStudentAboutSection,
  
  // Exam Notifications
  notifyExamCreated: examNotifications.notifyExamCreated,
  notifyExamDeleted: examNotifications.notifyExamDeleted,
  notifyExamUpdated: examNotifications.notifyExamUpdated,
  
  // Daily Mark Notifications
  notifyMarkAdded: dailyMarkNotifications.notifyMarkAdded,
  notifyMarksAdded: dailyMarkNotifications.notifyMarksAdded,
  notifyMarkUpdated: dailyMarkNotifications.notifyMarkUpdated,
  notifyMarkDeleted: dailyMarkNotifications.notifyMarkDeleted,
  notifyStudentMarks: dailyMarkNotifications.notifyStudentMarks,
  
  // News Notifications
  notifyNewsCreated: newsNotifications.notifyNewsCreated,
  notifyNewsUpdated: newsNotifications.notifyNewsUpdated,
  notifyNewsDeleted: newsNotifications.notifyNewsDeleted,
  notifyNewsPublished: newsNotifications.notifyNewsPublished,
  notifyNewsArchived: newsNotifications.notifyNewsArchived,
  notifyBulkNewsCreated: newsNotifications.notifyBulkNewsCreated,
  notifyBulkNewsUpdated: newsNotifications.notifyBulkNewsUpdated,
  notifyBulkNewsDeleted: newsNotifications.notifyBulkNewsDeleted,
  notifyViewsIncremented: newsNotifications.notifyViewsIncremented,
  
  // Helper functions from NotificationService
  sendNotificationToDevices: NotificationService.sendNotificationToDevices,
  sendNotificationToUser: NotificationService.sendNotificationToUser,
};
