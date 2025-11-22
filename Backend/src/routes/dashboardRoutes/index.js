// ============================================================================
// Dashboard Routes - Index File
// ============================================================================

const express = require("express");
const router = express.Router();

// Import sub-routes
const statsRoutes = require("./stats.routes");
const chartsRoutes = require("./charts.routes");

// Use sub-routes
router.use("/", statsRoutes);
router.use("/", chartsRoutes);

module.exports = router;
