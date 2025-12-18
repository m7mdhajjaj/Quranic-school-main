/**
 * 🟢 Presence Service
 * ===================
 * خدمة إدارة حالة المستخدمين (Online/Offline) في الوقت الفعلي
 * 
 * @module PresenceService
 * @description نظام متكامل لإدارة حالة اتصال المستخدمين عبر Socket.io
 * 
 * @example
 * // استخدام في أي مكان في الكود
 * const { isUserOnline, onlineUsersManager } = require('./services/PresenceService');
 * 
 * if (isUserOnline(userId)) {
 *   console.log('User is online!');
 * }
 * 
 * // الحصول على عدد المستخدمين
 * const count = onlineUsersManager.getOnlineCount();
 */

const { onlineUsersManager } = require('./OnlineUsersManager');

/**
 * دالة مساعدة للتحقق من حالة المستخدم
 * @param {string} userId - معرف المستخدم
 * @returns {boolean} - true إذا كان المستخدم Online
 */
function isUserOnline(userId) {
  return onlineUsersManager.isUserOnline(userId);
}

/**
 * دالة مساعدة للحصول على بيانات المستخدم
 * @param {string} userId - معرف المستخدم
 * @returns {Object|null} - بيانات المستخدم أو null
 */
function getUserPresenceData(userId) {
  return onlineUsersManager.getUserData(userId);
}

/**
 * دالة مساعدة للحصول على جميع المستخدمين Online
 * @returns {Array<string>} - قائمة معرفات المستخدمين
 */
function getAllOnlineUserIds() {
  return onlineUsersManager.getAllOnlineUsers();
}

/**
 * دالة مساعدة للحصول على إحصائيات
 * @returns {Object} - إحصائيات النظام
 */
function getPresenceStats() {
  return onlineUsersManager.getStats();
}

module.exports = {
  // Singleton Manager
  onlineUsersManager,
  
  // Helper Functions
  isUserOnline,
  getUserPresenceData,
  getAllOnlineUserIds,
  getPresenceStats,
};
