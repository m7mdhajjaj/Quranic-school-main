// Export all attendance controllers
const { createAttendance } = require("./createController");
const {
  getAttendanceByDate,
  getStudentAttendance,
  getAbsentStudentsToday,
} = require("./getController");
const {
  getStudentAttendanceStats,
  updateGroupsMonthlyStats,
} = require("./statsController");
const { deleteAttendance } = require("./deleteController");
const { getTeacherGroupsForAttendance } = require("./getTeacherGroups");
const { getTeacherGroupsForMarks } = require("./getTeacherGroupsForMarks");
const {
  getAdvancedAttendanceStats,
  getFilteredAttendanceStats,
  getAttendanceReport,
} = require("./advancedStatsController");

module.exports = {
  createAttendance,
  getAttendanceByDate,
  getStudentAttendance,
  getAbsentStudentsToday,
  getStudentAttendanceStats,
  deleteAttendance,
  updateGroupsMonthlyStats,
  getTeacherGroupsForAttendance,
  getTeacherGroupsForMarks,
  // Advanced statistics
  getAdvancedAttendanceStats,
  getFilteredAttendanceStats,
  getAttendanceReport,
};
