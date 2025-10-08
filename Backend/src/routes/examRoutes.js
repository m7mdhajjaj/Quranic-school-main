const express = require("express");
const router = express.Router();
const examController = require("../controllers/examController");
const { protect } = require("../middleware/authMiddleware");
const { validateExamData } = require("../Validation/ExamValidation");

router.get("/", protect, examController.getExams);
router.post("/", validateExamData, examController.addExam);
router.put("/:examId", validateExamData, examController.updateExam);
router.delete("/:examId", examController.deleteExam);

module.exports = router;
