// ============================================
// TIMETABLE CONTROLLER - INDEX FILE
// ============================================
// هذا الملف يجمع جميع عمليات المواعيد من الملفات المنفصلة

const { getAllTimetables } = require("./getTimetables");
const { createTimetable } = require("./createTimetable");
const { updateTimetable } = require("./updateTimetable");
const { deleteTimetable } = require("./deleteTimetable");
const { getAvailableHours } = require("./getAvailableHours");
const { getAvailableHoursForTeacher } = require("./getAvailableHoursForTeacher");
const { getGroupTimetable, getGroupTimetableByName } = require("./getGroupTimetable");
const { getMonthlyPlan } = require("./getMonthlyPlan");

module.exports = {
  // Read operations
  getAllTimetables,
  getMonthlyPlan,
  getSessions: getAllTimetables, // backward compatibility
  getAvailableHours, // إرجاع الأوقات المتاحة (عامة)
  getAvailableHoursForTeacher, // إرجاع الأوقات المتاحة للمعلم في يوم معين
  getGroupTimetable, // إرجاع جدول حلقة معينة
  getGroupTimetableByName, // إرجاع جدول حلقة باسمها

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
