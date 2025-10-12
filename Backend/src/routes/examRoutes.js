const express = require("express");
const router = express.Router();
const examController = require("../controllers/examController");
const { protect } = require("../middleware/authMiddleware");
// const { validateExamData } = require("../Validation/ExamValidation"); // تم تعطيله مؤقتاً

router.get("/", protect, examController.getExams);
router.post("/", examController.addExam); // تم إزالة validateExamData
router.put("/:examId", examController.updateExam); // تم إزالة validateExamData
router.delete("/:examId", examController.deleteExam);

module.exports = router;
