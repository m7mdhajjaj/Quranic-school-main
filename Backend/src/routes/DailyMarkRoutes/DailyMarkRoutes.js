const express = require("express");
const router = express.Router();
const dailyMarkController = require("../../controllers/DailyMarkController");
const {
  validateDailyMarksData,
  validateBulkMarks,
  validateUpdateMark,
  validateBulkUpdateMarks,
  validateDeleteMark,
  validateDeleteStudentMarks,
  validateDeleteSectionMarks,
} = require("../../Validation/DailyMark/DailyMarksValidation");

// Import Section Routes (part of DailyMark system)
const sectionRoutes = require("./SectionRoutes");

// ============================================================================
// SECTION ROUTES - إدارة المقاطع (جزء من نظام العلامات اليومية)
// ============================================================================
// Mount section routes under /sections
router.use("/sections", sectionRoutes);

// ============================================================================
// GET ROUTES - جلب العلامات
// ============================================================================

// Get all marks with pagination
// GET /api/daily-marks?page=1&limit=200
router.get("/", dailyMarkController.getMarks);

// Get marks for a specific student
// GET /api/daily-marks/student/:studentId
router.get("/student/:studentId", dailyMarkController.getStudentMarks);

// Get marks statistics for a student
// GET /api/daily-marks/student/:studentId/stats
router.get("/student/:studentId/stats", dailyMarkController.getStudentMarkStats);

// Get marks for a specific section
// GET /api/daily-marks/section/:sectionId
router.get("/section/:sectionId", dailyMarkController.getSectionMarks);

// ============================================================================
// POST ROUTES - إضافة/إنشاء العلامات
// ============================================================================

// Create or update a single mark
// POST /api/daily-marks
router.post(
  "/",
  validateDailyMarksData,
  dailyMarkController.createOrUpdateMark
);

// Add marks for multiple students (bulk operation)
// POST /api/daily-marks/bulk
router.post("/bulk", validateBulkMarks, dailyMarkController.setMarks);

// Add marks for a specific section
// POST /api/daily-marks/section/:sectionId
router.post(
  "/section/:sectionId",
  validateBulkMarks,
  dailyMarkController.setMarksForSection
);

// ============================================================================
// PUT ROUTES - تعديل العلامات
// ============================================================================

// Update a mark by ID
// PUT /api/daily-marks/:id
router.put("/:id", validateUpdateMark, dailyMarkController.updateMarkById);

// Update multiple marks at once (bulk update)
// PUT /api/daily-marks/bulk
router.put("/bulk", validateBulkUpdateMarks, dailyMarkController.updateMultipleMarks);

// ============================================================================
// DELETE ROUTES - حذف العلامات
// ============================================================================

// Delete a mark by ID
// DELETE /api/daily-marks/:id
router.delete("/:id", validateDeleteMark, dailyMarkController.deleteMark);

// Delete all marks for a specific student
// DELETE /api/daily-marks/student/:studentId
router.delete(
  "/student/:studentId",
  validateDeleteStudentMarks,
  dailyMarkController.deleteStudentMarks
);

// Delete all marks for a specific section
// DELETE /api/daily-marks/section/:sectionId
router.delete(
  "/section/:sectionId",
  validateDeleteSectionMarks,
  dailyMarkController.deleteSectionMarks
);

// Delete a mark for a specific student in a specific section
// DELETE /api/daily-marks/student/:studentId/section/:sectionId
router.delete(
  "/student/:studentId/section/:sectionId",
  validateDeleteStudentMarks,
  validateDeleteSectionMarks,
  dailyMarkController.deleteStudentSectionMark
);

module.exports = router;
