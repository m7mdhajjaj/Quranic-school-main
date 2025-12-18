// ============================================================================
// WarningController/index.js - Main Controller Entry Point
// ============================================================================

// Import all controllers
const createWarning = require("./createWarning");
const getWarnings = require("./getWarnings");
const deleteWarning = require("./deleteWarning");
const warningStatistics = require("./warningStatistics");
const studentStatus = require("./studentStatus");
const getGroupStudentsWarnings = require("./getGroupStudentsWarnings");
const deleteWarningByType = require("./deleteWarningByType");
const getGroupStatistics = require("./getGroupStatistics");

// Export all functions
module.exports = {
  // Create operations
  ...createWarning,

  // Get operations
  ...getWarnings,
  ...getGroupStudentsWarnings,
  ...getGroupStatistics,

  // Delete operations
  ...deleteWarning,
  ...deleteWarningByType,

  // Statistics operations
  ...warningStatistics,

  // Student status operations
  ...studentStatus,
};
