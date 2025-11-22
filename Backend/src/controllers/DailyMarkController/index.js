// ============================================================================
// DailyMarkController/index.js - Main Controller Entry Point
// ============================================================================

// Import DailyMark controllers
const getMarks = require("./getMarks");
const setMarks = require("./setMarks");
const updateMark = require("./updateMark");
const deleteMark = require("./deleteMark");

// Import Section controllers (part of DailyMark system)
const sectionControllers = require("./SectionControllers");

// Export all functions
module.exports = {
  // DailyMark operations
  ...getMarks,
  ...setMarks,
  ...updateMark,
  ...deleteMark,

  // Section operations (part of DailyMark)
  ...sectionControllers,
};
