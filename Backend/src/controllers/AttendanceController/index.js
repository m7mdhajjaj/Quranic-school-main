// Export all attendance controllers
const { createAttendance } = require("./createController");
const {
  getStudentAttendance,
  getAbsentStudentsToday,
} = require("./getController");
const {
  getStudentAttendanceStats,
} = require("./statsController");
const { getTeacherGroupsForAttendance } = require("./getTeacherGroups");
const { getTeacherGroupsForMarks } = require("./getTeacherGroupsForMarks");
const { getAvailableDates } = require("./getAvailableDates");
const { getAllGroupsForAdmin, getGroupStudentsForAdmin } = require("./adminController");

module.exports = {
  createAttendance,
  getStudentAttendance,
  getAbsentStudentsToday,
  getStudentAttendanceStats,
  getTeacherGroupsForAttendance,
  getTeacherGroupsForMarks,
  getAvailableDates,
  getAllGroupsForAdmin,
  getGroupStudentsForAdmin,
};
