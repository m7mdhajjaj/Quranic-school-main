/**
 * Profile Management Routes
 * Handles user profile data operations (get, update)
 */

const express = require("express");
const router = express.Router();
const { protect } = require("../../middleware/authMiddleware");
const { validateProfileData, sanitizeProfile } = require("../../Validation/Profile/ProfileValidation");

// Import profile controllers
const {
  getUserProfile,
  updateUserProfile,
} = require("../../controllers/profileController");

/**
 * @route   GET /api/me
 * @route   GET /api/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get("/me", protect, getUserProfile);
router.get("/profile", protect, getUserProfile);

/**
 * @route   PUT /api/me
 * @desc    Update current user profile
 * @access  Private
 */
router.put("/me", protect, sanitizeProfile, validateProfileData, updateUserProfile);

module.exports = router;
