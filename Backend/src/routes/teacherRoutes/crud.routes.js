// routes/teacherRoutes/crud.routes.js
const express = require("express");
const router = express.Router();
const controller = require("../../controllers/basicController/teacherController");
const { protect, secretaryTeachersAccess } = require("../../middleware/auth");
const {
  validateTeacherData,
  validateTeacherGroups,
  sanitizeTeacherData,
} = require("../../Validation/Teacher/TeacherValidation");
const { createLimiter, updateLimiter, deleteLimiter } = require("../../middleware/rateLimiter");
const { auditLogger } = require("../../middleware/logging/auditLogger.middleware");

/**
 * CRUD Routes for Teachers
 * All routes use TeacherValidation middleware
 * السكرتير يمكنه الوصول بناءً على صلاحية teachersAccess
 */

// Get all teachers - إداري أو سكرتير لديه صلاحية عرض على الأقل
router.get("/", secretaryTeachersAccess('view'), controller.getAllTeachers);

// Get available groups for teacher (must be before /:id) - إداري أو سكرتير لديه صلاحية عرض
router.get("/available-groups/:teacherId", secretaryTeachersAccess('view'), controller.getAvailableGroupsForTeacher);

// Check duplicate field (no cache - real-time check needed) - إداري أو سكرتير لديه صلاحية إدارة
router.get("/check-duplicate", secretaryTeachersAccess('manage'), controller.checkDuplicate);

// Export teachers to CSV (no cache - always fresh data) - إداري أو سكرتير لديه صلاحية إدارة
router.get("/export", secretaryTeachersAccess('manage'), controller.exportTeachersToCSV);

// Get teacher with groups and students (for attendance page) - إداري أو سكرتير لديه صلاحية عرض
router.get("/:id/with-groups-and-students", secretaryTeachersAccess('view'), controller.getTeacherWithGroupsAndStudents);

// ❌ تم حذف route مكرر: /:id/students
// استخدم بدلاً منه: GET /api/students/teacher/:teacher

// Get teacher by ID - إداري أو سكرتير لديه صلاحية عرض
router.get("/:id", secretaryTeachersAccess('view'), controller.getTeacherById);

// Create new teacher (with validation) - إداري أو سكرتير لديه صلاحية إدارة
router.post(
  "/",
  secretaryTeachersAccess('manage'),
  createLimiter,
  auditLogger(),
  sanitizeTeacherData,
  validateTeacherData,
  validateTeacherGroups,
  controller.createTeacher
);

// Update teacher (with validation) - إداري أو سكرتير لديه صلاحية إدارة
router.put(
  "/:id",
  secretaryTeachersAccess('manage'),
  updateLimiter,
  auditLogger(),
  sanitizeTeacherData,
  validateTeacherData,
  validateTeacherGroups,
  controller.updateTeacher
);

// Bulk delete teachers (must be before /:id) - إداري أو سكرتير لديه صلاحية إدارة
router.delete("/bulk", secretaryTeachersAccess('manage'), deleteLimiter, auditLogger(), controller.bulkDeleteTeachers);

// Delete teacher - إداري أو سكرتير لديه صلاحية إدارة
router.delete("/:id", secretaryTeachersAccess('manage'), deleteLimiter, auditLogger(), controller.deleteTeacher);

module.exports = router;
