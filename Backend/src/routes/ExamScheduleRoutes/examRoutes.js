// ============================================================================
// examRoutes.js - Exam Schedule Routes
// ============================================================================

const express = require("express");
const router = express.Router();
const { protect } = require("../../middleware/authMiddleware");
const { validateExamScheduleData } = require("../../Validation/ExamSchedule/ExamScheduleValidation");

// Import controllers
const getExams = require("../../controllers/ExamShedule/Exam/getExams");
const getMyExams = require("../../controllers/ExamShedule/Exam/getMyExams");
const getGroupsStats = require("../../controllers/ExamShedule/Exam/getGroupsStats");
const addExam = require("../../controllers/ExamShedule/Exam/addExam");
const updateExam = require("../../controllers/ExamShedule/Exam/updateExam");
const deleteExam = require("../../controllers/ExamShedule/Exam/deleteExam");
const bulkDeleteExams = require("../../controllers/ExamShedule/Exam/bulkDeleteExams");

// Routes
router.get("/", protect, getExams);
router.get("/my-exams", protect, getMyExams);
router.get("/groups-stats", protect, getGroupsStats); // Get exam count for each group
router.post("/", protect, validateExamScheduleData, addExam);
router.put("/:examId", protect, validateExamScheduleData, updateExam);
router.delete("/:examId", protect, deleteExam);
router.post("/bulk-delete", protect, bulkDeleteExams); // Bulk delete route

module.exports = router;
