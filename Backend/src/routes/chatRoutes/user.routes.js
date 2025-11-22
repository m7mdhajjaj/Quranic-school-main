const express = require("express");
const router = express.Router();
const chatController = require("../../controllers/chatController");
const { protect } = require("../../middleware/authMiddleware");

// ============================================================================
// USER ROUTES - مستخدمين
// ============================================================================

// Get teachers for a student to chat with
router.get("/teachers/:studentId", protect, chatController.getTeachers);

// Get students for a teacher
router.get("/students/:teacherId", protect, chatController.getStudents);

module.exports = router;
