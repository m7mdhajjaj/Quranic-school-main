// ============================================================================
// ReportController/index.js - Main Controller Entry Point
// ============================================================================

// Import all report controllers
const studentMarks = require("./studentMarks");
const averageMarks = require("./averageMarks");
const studentReport = require("./studentReport");
const groupReport = require("./groupReport");
const exportReports = require("./exportReports");

// Export all functions
module.exports = {
  // Student marks operations
  ...studentMarks,

  // Average marks operations
  ...averageMarks,

  // Student report operations
  ...studentReport,

  // Group report operations
  ...groupReport,

  // Export operations
  ...exportReports,
};
