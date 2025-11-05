/**
 * Dashboard Controller Index
 * Exports all dashboard-related controllers
 */

const getDashboardStats = require("./getStats");
const getDashboardCharts = require("./getCharts");

module.exports = {
  getDashboardStats,
  getDashboardCharts,
};
