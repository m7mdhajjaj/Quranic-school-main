// routes/studentRoutes/crud.routes.js
const express = require("express");
const router = express.Router();
const studentController = require("../../controllers/basicController/studentController");
const { 
  validateStudentData, 
  sanitizeStudentData 
} = require("../../Validation/Student/StudentValidation");
const { validateStudentSearchQuery } = require("../../Validation/Student/StudentQueryValidation");
const { protect } = require("../../middleware/auth");
const { cacheMiddleware } = require("../../middleware/cacheMiddleware");

/**
 * CRUD Routes for Students
 * All routes use StudentValidation middleware
 */

// Get all students (with validation and 2 minute cache)
router.get("/", protect, validateStudentSearchQuery, cacheMiddleware(120), studentController.getStudents);

// Get students statistics (with validation and 5 minute cache)
router.get("/statistics", protect, validateStudentSearchQuery, cacheMiddleware(300), studentController.getStudentsStatistics);

// Check duplicate field (no cache - real-time check needed)
router.get("/check-duplicate", protect, studentController.checkDuplicate);

// Export students to CSV (no cache - always fresh data)
router.get("/export", protect, validateStudentSearchQuery, studentController.exportStudentsToCSV);

// Get students by group (with 3 minute cache)
router.get("/group/:group", protect, cacheMiddleware(180), studentController.getStudentsByGroup);

// Get students by teacher (with 3 minute cache)
router.get("/teacher/:teacher", protect, cacheMiddleware(180), studentController.getStudentsByTeacher);

// Get students with absence statistics (with 2 minute cache)
router.get("/with-absence-stats", protect, cacheMiddleware(120), studentController.getStudentsWithAbsenceStats);

// Get student by ID (with 5 minute cache)
router.get("/:id", protect, cacheMiddleware(300), studentController.getStudentById);

// Create new student (with validation)
router.post("/", protect, sanitizeStudentData, validateStudentData, studentController.createStudent);

// Restore expelled student to group (admin only)
router.post("/:id/restore", protect, studentController.restoreStudentToGroup);

// Update student (with validation)
router.put("/:id", protect, sanitizeStudentData, validateStudentData, studentController.updateStudent);

// Bulk delete students (must be before /:id)
router.delete("/bulk", protect, studentController.bulkDeleteStudents);

// Delete student
router.delete("/:id", protect, studentController.deleteStudent);

module.exports = router;
