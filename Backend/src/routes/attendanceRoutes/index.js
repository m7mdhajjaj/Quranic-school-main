const express = require("express");
const router = express.Router();

// Import route modules
const createRoutes = require("./createRoutes");
const getRoutes = require("./getRoutes");
const statsRoutes = require("./statsRoutes");

// Mount routes
router.use("/", createRoutes);
router.use("/", getRoutes);
router.use("/", statsRoutes);

module.exports = router;
