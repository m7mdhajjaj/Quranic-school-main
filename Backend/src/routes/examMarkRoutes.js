const express = require("express");
const router = express.Router();
const examMarkController = require("../controllers/examMarkController");

// Get all marks for an exam
router.get("/:examId", examMarkController.getExamMarks);
// Set marks for students in an exam
router.post("/:examId", examMarkController.setExamMarks);

// Get all marks for a specific student
router.get("/student/:studentId", examMarkController.getStudentMarks);

module.exports = router;
