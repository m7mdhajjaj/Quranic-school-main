const express = require("express");
const router = express.Router();
const examController = require("../controllers/examController");
const { protect } = require("../middleware/authMiddleware");

router.get("/", protect, examController.getExams);
router.post("/", examController.addExam);
router.put("/:examId", examController.updateExam);
router.delete("/:examId", examController.deleteExam);

module.exports = router;
