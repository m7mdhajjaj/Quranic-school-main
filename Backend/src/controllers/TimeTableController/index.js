// ============================================
// TIMETABLE CONTROLLER - INDEX FILE
// ============================================
// هذا الملف يجمع جميع عمليات المواعيد من الملفات المنفصلة

const { getAllTimetables } = require("./getTimetables");
const { createTimetable } = require("./createTimetable");
const { updateTimetable } = require("./updateTimetable");
const { deleteTimetable } = require("./deleteTimetable");

module.exports = {
  // Read operations
  getAllTimetables,
  getSessions: getAllTimetables, // backward compatibility

  // Create operations
  createTimetable,
  addSession: createTimetable, // backward compatibility

  // Update operations
  updateTimetable,
  updateSession: updateTimetable, // backward compatibility

  // Delete operations
  deleteTimetable,
  deleteSession: deleteTimetable, // backward compatibility
};
