// routes/teacherAssistantRoutes/avatar.routes.js
const express = require("express");
const router = express.Router();
const { protect } = require("../../middleware/auth/protect.middleware");
const { uploadAvatar } = require("../../config/cloudinary");
const {
  uploadAvatarById,
  getAvatarById,
  deleteAvatarById,
} = require("../../controllers/uploadController/avatarManagementController");

/**
 * Avatar Routes for Teacher Assistants
 * مسارات الصور لمساعدي المدرسين
 */

// Upload teacher assistant avatar - Admin or Self
router.post("/:id/avatar", protect, uploadAvatar.single("avatar"), uploadAvatarById);

// Get teacher assistant avatar - Admin or Self
router.get("/:id/avatar", protect, getAvatarById);

// Delete teacher assistant avatar - Admin or Self
router.delete("/:id/avatar", protect, deleteAvatarById);

module.exports = router;
