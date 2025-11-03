const express = require("express");
const router = express.Router();

// Import route modules
const createRoutes = require("./createRoutes");
const getRoutes = require("./getRoutes");
const statsRoutes = require("./statsRoutes");
const deleteRoutes = require("./deleteRoutes");

// Mount routes
router.use("/", createRoutes);
router.use("/", getRoutes);
router.use("/", statsRoutes);
router.use("/", deleteRoutes);

module.exports = router;
