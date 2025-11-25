// Export all attendance controllers
const { createAttendance } = require("./createController");
const {
  getAttendanceByDate,
  getStudentAttendance,
} = require("./getController");
const {
  getStudentAttendanceStats,
  updateGroupsMonthlyStats,
} = require("./statsController");
const { deleteAttendance } = require("./deleteController");
const { getTeacherGroupsForAttendance } = require("./getTeacherGroups");
const { getTeacherGroupsForMarks } = require("./getTeacherGroupsForMarks");

module.exports = {
  createAttendance,
  getAttendanceByDate,
  getStudentAttendance,
  getStudentAttendanceStats,
  deleteAttendance,
  updateGroupsMonthlyStats,
  getTeacherGroupsForAttendance,
  getTeacherGroupsForMarks,
};
