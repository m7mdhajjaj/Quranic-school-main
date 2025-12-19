// ============================================================================
// Student History Helpers - نقطة تجميع لكل دوال التاريخ
// ============================================================================

const { logWarningEvent, logExpulsionEvent } = require("./warningHistory");
const { logRestorationEvent } = require("./restorationHistory");
const { getStudentHistory, getStudentHistoryStats } = require("./queryHistory");

module.exports = {
  // Warning operations
  logWarningEvent,
  logExpulsionEvent,
  
  // Restoration operations
  logRestorationEvent,
  
  // Query operations
  getStudentHistory,
  getStudentHistoryStats
};
