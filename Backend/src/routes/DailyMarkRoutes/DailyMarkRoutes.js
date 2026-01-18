const express = require("express");
const router = express.Router();
const dailyMarkController = require("../../controllers/DailyMarkController");
const groupController = require("../../controllers/basicController/groupController");
const { protect, teacherProtect } = require("../../middleware/auth");
const {
  validateDailyMarksData,
  validateBulkMarks,
  validateUpdateMark,
  validateBulkUpdateMarks,
  validateDeleteMark,
} = require("../../Validation/DailyMark/DailyMarksValidation");
const { validateActiveGroupsQuery } = require("../../Validation/Group/ActiveGroupsValidation");
const { validateGroupStats } = require("../../Validation/DailyMark/GroupStatsValidation");

// ============================================================================
// MIDDLEWARE - حماية جميع الـ routes
// ============================================================================
router.use(protect);

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

// Get active groups for daily marks filtering
// GET /api/daily-marks/active-groups?type=basic|detailed
router.get("/active-groups", validateActiveGroupsQuery, groupController.getActiveGroups);

// Get group statistics (students count and sections count)
// GET /api/daily-marks/group-stats/:groupName?month=11&year=2024
router.get("/group-stats/:groupName", validateGroupStats, dailyMarkController.getGroupStats);

// Get filtered marks with advanced filters (month, year, search, group)
// GET /api/daily-marks/filtered?month=11&year=2024&search=الفاتحة&group=الحلقة الأولى&studentId=123
router.get("/filtered", dailyMarkController.getFilteredMarks);

// Get filtered sections (without marks)
// GET /api/daily-marks/filtered-sections?month=11&year=2024&search=الفاتحة&group=الحلقة الأولى
router.get("/filtered-sections", dailyMarkController.getFilteredSections);

// Get student averages for filtered marks
// GET /api/daily-marks/student/:studentId/averages?month=11&year=2024&group=الحلقة الأولى
router.get("/student/:studentId/averages", dailyMarkController.getStudentAverages);

// Get student sections grouped by Surah (NEW - للطالب فقط)
// GET /api/daily-marks/student/:studentId/grouped-sections?groupId=123
router.get("/student/:studentId/grouped-sections", dailyMarkController.getStudentSectionsGrouped);

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
// POST ROUTES - إضافة/إنشاء العلامات (المعلم فقط)
// ============================================================================

// Create or update a single mark
// POST /api/daily-marks
router.post(
  "/",
  teacherProtect,
  validateDailyMarksData,
  dailyMarkController.createOrUpdateMark
);

// Add marks for multiple students (bulk operation)
// POST /api/daily-marks/bulk
router.post("/bulk", teacherProtect, validateBulkMarks, dailyMarkController.setMarks);

// Add marks for a specific section
// POST /api/daily-marks/section/:sectionId
router.post(
  "/section/:sectionId",
  teacherProtect,
  validateBulkMarks,
  dailyMarkController.setMarksForSection
);

// ============================================================================
// PUT ROUTES - تعديل العلامات (المعلم فقط)
// ============================================================================

// Update a mark by ID
// PUT /api/daily-marks/:id
router.put("/:id", teacherProtect, validateUpdateMark, dailyMarkController.updateMarkById);

// Update multiple marks at once (bulk update)
// PUT /api/daily-marks/bulk
router.put("/bulk", teacherProtect, validateBulkUpdateMarks, dailyMarkController.updateMultipleMarks);

// ============================================================================
// DELETE ROUTES - حذف العلامات (المعلم فقط)
// ============================================================================

// Delete a mark by ID
// DELETE /api/daily-marks/:id
router.delete("/:id", teacherProtect, validateDeleteMark, dailyMarkController.deleteMark);

module.exports = router;
