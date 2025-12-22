/**
 * Profile Management Routes
 * Handles user profile data operations (get, update)
 */

const express = require("express");
const router = express.Router();
const { protect } = require("../../middleware/auth");
const { validateProfileData, sanitizeProfile } = require("../../Validation/Profile/ProfileValidation");

// Import profile controllers
const {
  getUserProfile,
  updateUserProfile,
  checkDuplicate,
  getEditLimits,
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
 * @route   GET /api/profile/check-duplicate
 * @desc    Check if a field value is duplicate (real-time validation)
 * @access  Private
 */
router.get("/profile/check-duplicate", protect, checkDuplicate);

/**
 * @route   GET /api/profile/edit-limits/:field
 * @desc    Get edit limits for a specific field (e.g., birthDate)
 * @access  Private
 */
router.get("/profile/edit-limits/:field", protect, getEditLimits);

/**
 * @route   PUT /api/me
 * @desc    Update current user profile
 * @access  Private
 */
router.put("/me", protect, sanitizeProfile, validateProfileData, updateUserProfile);

module.exports = router;
