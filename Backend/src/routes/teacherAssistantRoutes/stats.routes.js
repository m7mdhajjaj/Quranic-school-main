// routes/teacherAssistantRoutes/stats.routes.js
const express = require("express");
const router = express.Router();
const controller = require("../../controllers/basicController/teacherAssistantController");
const { adminProtect } = require("../../middleware/auth/role.middleware");

/**
 * Statistics Routes for Teacher Assistants
 * مسارات الإحصائيات لمساعدي المدرسين
 */

// Get teacher assistant statistics - Admin only
router.get("/stats", adminProtect, controller.getAssistantStats);

module.exports = router;
