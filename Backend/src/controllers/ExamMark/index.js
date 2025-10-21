// ============================================================================
// ExamMark/index.js - Main Controller Entry Point
// ============================================================================

// Import all controllers
const getMarks = require("./getMarks");
const setMarks = require("./setMarks");
const updateMark = require("./updateMark");
const deleteMark = require("./deleteMark");
const examAverage = require("./examAverage");

// Export all functions
module.exports = {
  ...getMarks,
  ...setMarks,
  ...updateMark,
  ...deleteMark,
  ...examAverage,
};
