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

// Get teacher with groups and students (for attendance page)
router.get("/:id/with-groups-and-students", protect, controller.getTeacherWithGroupsAndStudents);

// Get students by teacher ID
router.get("/:id/students", protect, controller.getStudentsByTeacherId);

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

// Delete teacher
router.delete("/:id", protect, controller.deleteTeacher);

module.exports = router;
