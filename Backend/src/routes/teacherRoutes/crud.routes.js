// routes/teacherRoutes/crud.routes.js
const express = require("express");
const router = express.Router();
const controller = require("../../controllers/teacherController");
const { protect } = require("../../middleware/authMiddleware");
const {
  validateTeacherData,
  validateTeacherGroups,
  sanitizeTeacherData,
} = require("../../Validation/TeacherValidation");

/**
 * CRUD Routes for Teachers
 * All routes use TeacherValidation middleware
 */

// Get all teachers
router.get("/", protect, controller.getAllTeachers);

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
