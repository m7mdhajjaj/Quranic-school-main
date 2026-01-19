// ============================================================================
// WarningController/index.js - Main Controller Entry Point
// ============================================================================

// Import all controllers (OPTIMIZED - Only used endpoints)
const createWarning = require("./createWarning");
const getWarnings = require("./getWarnings");
const deleteWarning = require("./deleteWarning");
const warningStatistics = require("./warningStatistics");
const getGroupStudentsWarnings = require("./getGroupStudentsWarnings");
const deleteWarningByType = require("./deleteWarningByType");
const getGroupStatistics = require("./getGroupStatistics");
const getExpelledStudentsFromGroup = require("./getExpelledStudentsFromGroup");
const restoreStudent = require("./restoreStudent");
// ✅ NEW: إضافة studentStatus (كان مفقوداً)
const studentStatus = require("./studentStatus");

// Export all functions
module.exports = {
  // Create operations
  ...createWarning,
  ...restoreStudent,

  // Get operations
  ...getWarnings,
  ...getGroupStudentsWarnings,
  ...getGroupStatistics,
  ...getExpelledStudentsFromGroup,

  // Delete operations
  ...deleteWarning,
  ...deleteWarningByType,

  // Statistics operations
  ...warningStatistics,

  // ✅ NEW: Student status operations
  ...studentStatus,
};
