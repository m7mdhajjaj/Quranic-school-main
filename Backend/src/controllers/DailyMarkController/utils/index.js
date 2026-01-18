// ============================================================================
// DailyMark Utils - Entry Point
// ============================================================================
// تجميع كل الدوال المساعدة المشتركة في مكان واحد
// 
// الهيكل:
// ├── responseHelpers.js   - دوال الاستجابة (sendSuccess, sendError, etc.)
// ├── filterHelpers.js     - دوال الفلترة (buildDateFilter, buildGroupFilter, etc.)
// ├── markHelpers.js       - دوال العلامات (updateAverage, notifications, etc.)
// ├── validationHelpers.js - دوال التحقق (validateMarks, editWindow, etc.)
// └── index.js             - نقطة الدخول الرئيسية

// ============================================================================
// Response Helpers - دوال الاستجابة
// ============================================================================
const {
  sendSuccess,
  sendError,
  sendValidationError,
  sendNotFound,
  sendCreated,
  formatPagination,
} = require('./responseHelpers');

// ============================================================================
// Filter Helpers - دوال الفلترة
// ============================================================================
const {
  getUserGroupsByRole,
  buildGroupFilter,
  buildDateFilter,
  buildSectionSearchFilter,
} = require('./filterHelpers');

// ============================================================================
// Mark Helpers - دوال العلامات
// ============================================================================
const {
  // Monthly Average
  updateStudentMonthlyAverage,
  updateMultipleStudentsMonthlyAverage,
  // Section Status
  updateSingleSectionStatus,
  updateMultipleSectionsStatus,
  // Notifications & Socket
  emitSocketEvent,
  notifyAndEmitMarkEvent,
  // Utilities
  collectMarkIds,
} = require('./markHelpers');

// ============================================================================
// Validation Helpers - دوال التحقق
// ============================================================================
const {
  validateMarksArray,
  validateMarkData,
  validateSectionData,
  isValidObjectId,
  isValidDate,
  validateMonthYear,
  // Edit Window
  checkMarkEditWindow,
  validateMarkEditWindow,
} = require('./validationHelpers');

// Import EDIT_WINDOW_DAYS directly from config
const { EDIT_WINDOW_DAYS } = require('../../../config/constants');

// ============================================================================
// Exports - تصدير مجمّع
// ============================================================================
module.exports = {
  // ========== Response Helpers ==========
  sendSuccess,
  sendError,
  sendValidationError,
  sendNotFound,
  sendCreated,
  formatPagination,

  // ========== Filter Helpers ==========
  getUserGroupsByRole,
  buildGroupFilter,
  buildDateFilter,
  buildSectionSearchFilter,

  // ========== Mark Helpers ==========
  // Monthly Average
  updateStudentMonthlyAverage,
  updateMultipleStudentsMonthlyAverage,
  // Section Status
  updateSingleSectionStatus,
  updateMultipleSectionsStatus,
  // Notifications & Socket
  emitSocketEvent,
  notifyAndEmitMarkEvent,
  // Utilities
  collectMarkIds,

  // ========== Validation Helpers ==========
  validateMarksArray,
  validateMarkData,
  validateSectionData,
  isValidObjectId,
  isValidDate,
  validateMonthYear,
  // Edit Window
  EDIT_WINDOW_DAYS,
  checkMarkEditWindow,
  validateMarkEditWindow,
};
