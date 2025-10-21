// ============================================================================
// getMarks.js - Get Marks Operations
// ============================================================================

const ExamMark = require("../../schema/ExamMark");

/**
 * Get all marks for a specific student
 * @route GET /api/exam-marks/student/:studentId
 */
exports.getStudentMarks = async (req, res) => {
  try {
    const studentId = req.params.studentId;
    const marks = await ExamMark.find({ student: studentId }).populate("exam");
    res.json(marks);
  } catch (err) {
    console.error("Error in getStudentMarks:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * Get all marks for a specific exam
 * @route GET /api/exam-marks/exam/:examId
 */
exports.getExamMarks = async (req, res) => {
  try {
    const examId = req.params.examId;
    const marks = await ExamMark.find({ exam: examId }).populate("student");
    res.json(marks);
  } catch (err) {
    console.error("Error in getExamMarks:", err);
    res.status(500).json({ error: "Server error" });
  }
};
