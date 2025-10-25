// ============================================================================
// WarningController/index.js - Main Controller Entry Point
// ============================================================================

// Import all controllers
const createWarning = require("./createWarning");
const getWarnings = require("./getWarnings");
const deleteWarning = require("./deleteWarning");
const warningStatistics = require("./warningStatistics");
const studentStatus = require("./studentStatus");

// Export all functions
module.exports = {
  // Create operations
  ...createWarning,

  // Get operations
  ...getWarnings,

  // Delete operations
  ...deleteWarning,

  // Statistics operations
  ...warningStatistics,

  // Student status operations
  ...studentStatus,
};
