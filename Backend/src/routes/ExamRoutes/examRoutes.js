const express = require("express");
const router = express.Router();
const examController = require("../../controllers/ExamShedule/examController");
const { protect } = require("../../middleware/authMiddleware");
const { validateExamData } = require("../../Validation/ExamValidation");

router.get("/", protect, examController.getExams);
router.post("/", protect, validateExamData, examController.addExam);
router.put("/:examId", protect, validateExamData, examController.updateExam);
router.delete("/:examId", protect, examController.deleteExam);

module.exports = router;
