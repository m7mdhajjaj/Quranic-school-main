// ============================================================================
// PointsGameService/index.js - Main Service Entry Point
// ============================================================================

const badgeService = require("./badgeService");
const monthlyPointsService = require("./monthlyPointsService");

module.exports = {
  // Badge Service
  ...badgeService,

  // Monthly Points Service
  ...monthlyPointsService,
};
