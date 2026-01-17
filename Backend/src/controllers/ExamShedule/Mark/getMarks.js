// ============================================================================
// getMarks.js - Get Marks Operations
// ============================================================================

const ExamSchedule = require("../../../schema/ExamShedule/ExamSchedule");

/**
 * Get all marks for a specific student
 * @route GET /api/exam-marks/student/:studentId
 */
exports.getStudentMarks = async (req, res) => {
  try {
    const studentId = req.params.studentId;
    
    // Find all exams that have marks for this student
    const exams = await ExamSchedule.find({
      "marks.student": studentId
    }).populate("marks.student");

    // Extract only the marks for this student
    const studentMarks = exams.map(exam => {
      const mark = exam.marks.find(m => m.student._id.toString() === studentId);
      return {
        _id: mark._id,
        exam: {
          _id: exam._id,
          title: exam.title || exam.name,
          subject: exam.subject,
          date: exam.date,
          totalMarks: exam.totalMarks
        },
        mark: mark.mark,
        percentage: mark.percentage,
        detail: mark.detail,
        createdAt: mark.createdAt,
        updatedAt: mark.updatedAt
      };
    });

    res.json(studentMarks);
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
    
    const exam = await ExamSchedule.findById(examId).populate("marks.student");
    
    if (!exam) {
      return res.status(404).json({ error: "Exam not found" });
    }

    res.json(exam.marks);
  } catch (err) {
    console.error("Error in getExamMarks:", err);
    res.status(500).json({ error: "Server error" });
  }
};
