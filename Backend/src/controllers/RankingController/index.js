// ============================================================================
// Ranking Controller Index - التصدير الرئيسي
// ============================================================================

const getRankingByAverages = require("./getRankingByAverages");
const getCurrentRanking = require("./getCurrentRanking");
const {
  getRankingByMonthYear,
  getAvailableRankingPeriods,
} = require("./getRankingByPeriod");
const createOrUpdateRanking = require("./createOrUpdateRanking");
const deleteRanking = require("./deleteRanking");

module.exports = {
  getRankingByAverages,
  getCurrentRanking,
  getRankingByMonthYear,
  getAvailableRankingPeriods,
  createOrUpdateRanking,
  deleteRanking,
};
