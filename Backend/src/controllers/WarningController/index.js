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

// Export all functions
module.exports = {
  // Create operations
  ...createWarning,

  // Get operations
  ...getWarnings,
  ...getGroupStudentsWarnings,
  ...getGroupStatistics,
  ...getExpelledStudentsFromGroup,

  // Delete operations
  ...deleteWarning,
  ...deleteWarningByType,

  // Statistics operations (only getTeacherStatistics is used)
  ...warningStatistics,
};
