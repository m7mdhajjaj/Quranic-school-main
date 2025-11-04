/**
 * Profile Routes Index
 * Central export point for all profile-related routes
 * 
 * Structure:
 * - profile.routes.js: Profile management (get, update)
 * - avatar.routes.js: Avatar upload/delete
 * - user.routes.js: User viewing and status
 */

const express = require("express");
const router = express.Router();

// Import sub-routes
const profileRoutes = require("./profile.routes");
const avatarRoutes = require("./avatar.routes");
const userRoutes = require("./user.routes");

// Use sub-routes
router.use("/", profileRoutes);
router.use("/", avatarRoutes);
router.use("/", userRoutes);

module.exports = router;