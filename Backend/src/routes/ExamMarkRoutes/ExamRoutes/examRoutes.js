// ============================================================================
// examRoutes.js - Exam Schedule Routes
// ============================================================================

const express = require("express");
const router = express.Router();
const { protect } = require("../../../middleware/authMiddleware");
const { validateExamScheduleData } = require("../../../Validation/ExamSchedule/ExamScheduleValidation");

// Import controllers
const getExams = require("../../../controllers/ExamShedule/getExams");
const getMyExams = require("../../../controllers/ExamShedule/getMyExams");
const addExam = require("../../../controllers/ExamShedule/addExam");
const updateExam = require("../../../controllers/ExamShedule/updateExam");
const deleteExam = require("../../../controllers/ExamShedule/deleteExam");

// Routes
router.get("/", protect, getExams);
router.get("/my-exams", protect, getMyExams);
router.post("/", protect, validateExamScheduleData, addExam);
router.put("/:examId", protect, validateExamScheduleData, updateExam);
router.delete("/:examId", protect, deleteExam);

module.exports = router;
