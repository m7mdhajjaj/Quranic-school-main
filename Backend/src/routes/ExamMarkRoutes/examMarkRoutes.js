const express = require("express");
const router = express.Router();
const examMarkController = require("../../controllers/ExamMark/examMarkController");
const { validateExamMarkData } = require("../../Validation/Exam/ExamMarkValidation");

// علامات طالب واحد
router.get("/student/:studentId", examMarkController.getStudentMarks);

// علامات امتحان واحد
router.get("/:examId", examMarkController.getExamMarks);

// معدل الامتحان
router.get("/:examId/average", examMarkController.getExamAverage);

// إضافة أو تعديل علامات عدة طلاب دفعة واحدة
router.post("/:examId", validateExamMarkData, examMarkController.setExamMarks);

// تعديل علامة طالب واحد
router.put("/:examId/:studentId", validateExamMarkData, examMarkController.updateStudentMark);

// حذف علامة طالب
router.delete("/:examId/:studentId", examMarkController.deleteStudentMark);

module.exports = router;
