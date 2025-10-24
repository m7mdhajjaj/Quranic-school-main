// ============================================================================
// DailyMarkController/index.js - Main Controller Entry Point
// ============================================================================

// Import all controllers
const getMarks = require("./getMarks");
const setMarks = require("./setMarks");
const updateMark = require("./updateMark");
const deleteMark = require("./deleteMark");

// Export all functions
module.exports = {
  // Get operations
  ...getMarks,

  // Set/Create operations
  ...setMarks,

  // Update operations
  ...updateMark,

  // Delete operations
  ...deleteMark,
};
