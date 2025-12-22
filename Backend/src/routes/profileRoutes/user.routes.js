/**
 * User View Routes
 * Handles viewing other users' public information
 */

const express = require("express");
const router = express.Router();
const { protect } = require("../../middleware/auth");

// Import user view controllers
const {
  getUserById,
  getUserStatus,
} = require("../../controllers/profileController");

/**
 * @route   GET /api/user/:id
 * @desc    Get user by ID (public info)
 * @access  Private
 */
router.get("/user/:id", protect, getUserById);

/**
 * @route   GET /api/users/:id/status
 * @desc    Get user online status and lastSeen
 * @access  Private
 */
router.get("/users/:id/status", protect, getUserStatus);

module.exports = router;
