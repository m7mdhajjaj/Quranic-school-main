/**
 * Dashboard Controller Index
 * Exports all dashboard-related controllers
 */

const getDashboardStats = require("./getStats");
const getDashboardCharts = require("./getCharts");
const getTopStudents = require("./getTopStudents");
const getTopTeachers = require("./getTopTeachers");

module.exports = {
  getDashboardStats,
  getDashboardCharts,
  getTopStudents,
  getTopTeachers,
};
