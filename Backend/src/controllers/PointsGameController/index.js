// ============================================================================
// PointsGameController Index - تجميع جميع الـ Controllers
// ============================================================================

const dailyPointsController = require("./dailyPointsController");
const badgesController = require("./badgesController");
const rankingsController = require("./rankingsController");
const statsController = require("./statsController");
const championsController = require("./championsController");
const debugController = require("./debugController");

module.exports = {
  // Daily Points Controllers
  saveDailyPoints: dailyPointsController.saveDailyPoints,
  getDailyPoints: dailyPointsController.getDailyPoints,

  // Badges Controllers
  getStudentBadges: badgesController.getStudentBadges,

  // Rankings Controllers
  getPointsRankings: rankingsController.getPointsRankings,
  getBadgesRankings: rankingsController.getBadgesRankings,

  // Stats Controllers
  getStudentStats: statsController.getStudentStats,

  // Champions Controllers
  crownMonthlyChampions: championsController.crownMonthlyChampions,
  getMonthlyChampions: championsController.getMonthlyChampions,

  // Debug Controllers
  getDebugMonthlyPoints: debugController.getDebugMonthlyPoints,
  recalculateMonthlyPoints: debugController.recalculateMonthlyPoints,
};
