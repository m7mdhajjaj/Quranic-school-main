// routes/studentRoutes/crud.routes.js
const express = require("express");
const router = express.Router();
const studentController = require("../../controllers/basicController/studentController");
const {
  validateStudentData,
  sanitizeStudentData,
} = require("../../Validation/Student/StudentValidation");
const {
  validateStudentSearchQuery,
} = require("../../Validation/Student/StudentQueryValidation");
const { secretaryStudentsAccess } = require("../../middleware/auth");
const { cacheMiddleware } = require("../../middleware");

/**
 * CRUD Routes for Students
 * All routes use StudentValidation middleware
 * Admin has full access, Secretary access based on studentsAccess permission
 */

// Get all students (with validation and 2 minute cache) - requires at least view access
router.get(
  "/",
  secretaryStudentsAccess("view"),
  validateStudentSearchQuery,
  cacheMiddleware(120),
  studentController.getStudents
);

// Get students statistics (with validation and 5 minute cache) - requires at least view access
router.get(
  "/statistics",
  secretaryStudentsAccess("view"),
  validateStudentSearchQuery,
  cacheMiddleware(300),
  studentController.getStudentsStatistics
);

// Get groups for student assignment (simplified list) - requires manage access
router.get(
  "/groups-for-assignment",
  secretaryStudentsAccess("manage"),
  cacheMiddleware(120),
  studentController.getGroupsForStudentAssignment
);

// Check duplicate field (no cache - real-time check needed) - requires at least view access
router.get(
  "/check-duplicate",
  secretaryStudentsAccess("view"),
  studentController.checkDuplicate
);

// Export students to CSV (no cache - always fresh data) - requires at least view access
router.get(
  "/export",
  secretaryStudentsAccess("view"),
  validateStudentSearchQuery,
  studentController.exportStudentsToCSV
);

// Get students by group (with 3 minute cache) - requires at least view access
router.get(
  "/group/:group",
  secretaryStudentsAccess("view"),
  cacheMiddleware(180),
  studentController.getStudentsByGroup
);

// Get students by teacher (with 3 minute cache) - requires at least view access
router.get(
  "/teacher/:teacher",
  secretaryStudentsAccess("view"),
  cacheMiddleware(180),
  studentController.getStudentsByTeacher
);

// Get students with absence statistics (with 2 minute cache) - requires at least view access
router.get(
  "/with-absence-stats",
  secretaryStudentsAccess("view"),
  cacheMiddleware(120),
  studentController.getStudentsWithAbsenceStats
);

// Get student by ID (with 5 minute cache) - requires at least view access
router.get(
  "/:id",
  secretaryStudentsAccess("view"),
  cacheMiddleware(300),
  studentController.getStudentById
);

// Create new student (with validation) - requires manage access
router.post(
  "/",
  secretaryStudentsAccess("manage"),
  sanitizeStudentData,
  validateStudentData,
  studentController.createStudent
);

// Restore expelled student to group (admin only) - requires manage access
router.post(
  "/:id/restore",
  secretaryStudentsAccess("manage"),
  studentController.restoreStudentToGroup
);

// Update student (with validation) - requires manage access
router.put(
  "/:id",
  secretaryStudentsAccess("manage"),
  sanitizeStudentData,
  validateStudentData,
  studentController.updateStudent
);

// Bulk delete students (must be before /:id) - requires manage access
router.delete(
  "/bulk",
  secretaryStudentsAccess("manage"),
  studentController.bulkDeleteStudents
);

// Delete student - requires manage access
router.delete(
  "/:id",
  secretaryStudentsAccess("manage"),
  studentController.deleteStudent
);

module.exports = router;
