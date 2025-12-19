// ============================================================================
// Student History Helpers - نقطة تجميع لكل دوال التاريخ
// ============================================================================

const { logWarningEvent, logExpulsionEvent } = require("./warningHistory");
const { logRestorationEvent } = require("./restorationHistory");
const { logGroupChangeEvent, logGroupRemovalEvent } = require("./groupHistory");
const { getStudentHistory, getStudentHistoryStats } = require("./queryHistory");

module.exports = {
  // Warning operations
  logWarningEvent,
  logExpulsionEvent,
  
  // Restoration operations
  logRestorationEvent,
  
  // Group operations
  logGroupChangeEvent,
  logGroupRemovalEvent,
  
  // Query operations
  getStudentHistory,
  getStudentHistoryStats
};
