// routes/studentRoutes/crud.routes.js
const express = require("express");
const router = express.Router();
const studentController = require("../../controllers/studentController");
const { validateStudentData } = require("../../Validation/StudentValidation");
const { protect } = require("../../middleware/authMiddleware");

/**
 * CRUD Routes for Students
 * All routes use StudentValidation middleware
 */

// Get all students
router.get("/", protect, studentController.getStudents);

// Get students by group
router.get("/group/:group", protect, studentController.getStudentsByGroup);

// Get students by teacher
router.get("/teacher/:teacher", protect, studentController.getStudentsByTeacher);

// Get students with absence statistics (optimized)
router.get("/with-absence-stats", protect, studentController.getStudentsWithAbsenceStats);

// Get student by ID
router.get("/:id", protect, studentController.getStudentById);

// Create new student (with validation)
router.post("/", protect, validateStudentData, studentController.createStudent);

// Update student (with validation)
router.put("/:id", protect, validateStudentData, studentController.updateStudent);

// Bulk delete students (must be before /:id)
router.delete("/bulk", protect, studentController.bulkDeleteStudents);

// Delete student
router.delete("/:id", protect, studentController.deleteStudent);

module.exports = router;
