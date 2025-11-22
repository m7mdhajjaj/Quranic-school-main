// ============================================================================
// Chat Routes - Index File
// ============================================================================

const express = require("express");
const router = express.Router();

// Import sub-routes
const messageRoutes = require("./message.routes");
const userRoutes = require("./user.routes");

// Use sub-routes
router.use("/", messageRoutes);
router.use("/", userRoutes);

module.exports = router;
