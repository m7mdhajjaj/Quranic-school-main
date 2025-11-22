// ============================================================================
// Ranking Routes - Index File
// ============================================================================

const express = require("express");
const router = express.Router();

// Import sub-routes
const getRoutes = require("./get.routes");
const crudRoutes = require("./crud.routes");

// Use sub-routes
router.use("/", getRoutes);
router.use("/", crudRoutes);

module.exports = router;
