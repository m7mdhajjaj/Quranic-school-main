/**
 * Profile Management Routes
 * Handles user profile data operations (get, update)
 */

const express = require("express");
const router = express.Router();
const { protect } = require("../../middleware/auth");
const { validateProfileData, sanitizeProfile } = require("../../Validation/Profile/ProfileValidation");
const { validateChangePassword } = require("../../Validation/Auth/AuthValidation");
const { changePassword } = require("../../controllers/authController");

// Import profile controllers
const {
  getUserProfile,
  updateUserProfile,
  checkDuplicate,
  getEditLimits,
} = require("../../controllers/profileController");

/**
 * Middleware to extract userId and userType from req.user (set by protect middleware)
 * This is needed for the changePassword controller
 */
const extractUserInfo = (req, res, next) => {
  if (req.user && req.user._id) {
    req.body.userId = req.user._id.toString();
    // Normalize role to lowercase for validation (validation will normalize it back)
    const role = req.user.role || "student";
    req.body.userType = role.toLowerCase();
  }
  next();
};

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
 * @route   PUT /api/profile/change-password
 * @desc    Change user password (for profile page)
 * @access  Private
 */
router.put(
  "/profile/change-password",
  protect,
  extractUserInfo,
  validateChangePassword,
  changePassword
);

/**
 * @route   PUT /api/me
 * @desc    Update current user profile
 * @access  Private
 */
router.put("/me", protect, sanitizeProfile, validateProfileData, updateUserProfile);

module.exports = router;
