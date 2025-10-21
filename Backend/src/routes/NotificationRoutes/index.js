// ============================================================================
// NotificationRoutes/index.js - Main Router Entry Point
// ============================================================================

const express = require("express");
const router = express.Router();

// Import route modules
const getRoutes = require("./getRoutes");
const updateRoutes = require("./updateRoutes");
const deleteRoutes = require("./deleteRoutes");
const createRoutes = require("./createRoutes");
const deviceTokenRoutes = require("./deviceTokenRoutes");

// Mount route modules
router.use("/", getRoutes);
router.use("/", updateRoutes);
router.use("/", deleteRoutes);
router.use("/", createRoutes);
router.use("/", deviceTokenRoutes);

module.exports = router;
