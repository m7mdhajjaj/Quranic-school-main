// routes/teacherRoutes/crud.routes.js
const express = require("express");
const router = express.Router();
const controller = require("../../controllers/basicController/teacherController");
const { protect } = require("../../middleware/authMiddleware");
const {
  validateTeacherData,
  validateTeacherGroups,
  sanitizeTeacherData,
} = require("../../Validation/Teacher/TeacherValidation");

/**
 * CRUD Routes for Teachers
 * All routes use TeacherValidation middleware
 */

// Get all teachers
router.get("/", protect, controller.getAllTeachers);

// Get available groups for teacher (must be before /:id)
router.get("/available-groups/:teacherId", protect, controller.getAvailableGroupsForTeacher);

// Check duplicate field (no cache - real-time check needed)
router.get("/check-duplicate", protect, controller.checkDuplicate);

// Export teachers to CSV (no cache - always fresh data)
router.get("/export", protect, controller.exportTeachersToCSV);

// Get teacher with groups and students (for attendance page)
router.get("/:id/with-groups-and-students", protect, controller.getTeacherWithGroupsAndStudents);

// ❌ تم حذف route مكرر: /:id/students
// استخدم بدلاً منه: GET /api/students/teacher/:teacher

// Get teacher by ID
router.get("/:id", protect, controller.getTeacherById);

// Create new teacher (with validation)
router.post(
  "/",
  protect,
  sanitizeTeacherData,
  validateTeacherData,
  validateTeacherGroups,
  controller.createTeacher
);

// Update teacher (with validation)
router.put(
  "/:id",
  protect,
  sanitizeTeacherData,
  validateTeacherData,
  validateTeacherGroups,
  controller.updateTeacher
);

// Bulk delete teachers (must be before /:id)
router.delete("/bulk", protect, controller.bulkDeleteTeachers);

// Delete teacher
router.delete("/:id", protect, controller.deleteTeacher);

module.exports = router;
