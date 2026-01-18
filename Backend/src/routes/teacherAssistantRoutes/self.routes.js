// routes/teacherAssistantRoutes/self.routes.js
const express = require("express");
const router = express.Router();
const controller = require("../../controllers/basicController/teacherAssistantController");
const { protect } = require("../../middleware/auth/protect.middleware");

/**
 * Self Routes for Teacher Assistants
 * مسارات المساعد للوصول إلى بياناته الخاصة
 */

// Get my groups - TeacherAssistant only
router.get("/my-groups", protect, controller.getMyGroups);

// Get my students - TeacherAssistant only
router.get("/my-students", protect, controller.getMyStudents);

// Get my profile - TeacherAssistant only
router.get("/me", protect, controller.getMyProfile);

module.exports = router;
