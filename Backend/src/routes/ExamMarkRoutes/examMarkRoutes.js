const express = require("express");
const router = express.Router();
const examMarkController = require("../../controllers/ExamShedule/Mark");
const { validateExamMarkData } = require("../../Validation/ExamSchedule/ExamMarkValidation");

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
