/**
 * Teacher Avatar Routes
 * Handles teacher avatar upload, get, and delete
 */

const express = require("express");
const router = express.Router();
const { uploadAvatar } = require("../../config/multer");
const { protect } = require("../../middleware/auth");
const {
  uploadAvatarById,
  getAvatarById,
  deleteAvatarById,
} = require("../../controllers/uploadController/avatarManagementController");

// Avatar routes
router.post("/:id/avatar", protect, uploadAvatar.single("avatar"), uploadAvatarById);
router.get("/:id/avatar", protect, getAvatarById);
router.delete("/:id/avatar", protect, deleteAvatarById);

module.exports = router;
