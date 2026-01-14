/**
 * Avatar Management Routes
 * Handles user avatar upload and deletion
 */

const express = require("express");
const router = express.Router();
const { protect } = require("../../middleware/auth");
const { uploadAvatar } = require("../../config/cloudinary");

// Import avatar controllers from uploadController
const {
  uploadAvatar: uploadAvatarHandler,
  deleteAvatar,
} = require("../../controllers/uploadController");

/**
 * @route   POST /api/avatar
 * @desc    Upload user avatar
 * @access  Private
 */
router.post("/avatar", protect, uploadAvatar.single("avatar"), uploadAvatarHandler);

/**
 * @route   DELETE /api/avatar
 * @desc    Delete user avatar
 * @access  Private
 */
router.delete("/avatar", protect, deleteAvatar);

module.exports = router;
