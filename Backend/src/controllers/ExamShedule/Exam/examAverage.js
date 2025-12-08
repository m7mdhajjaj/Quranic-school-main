// ============================================================================
// examAverage.js - Exam Average Calculation
// ============================================================================

const ExamSchedule = require("../../../schema/ExamSchedule");

/**
 * Helper function to calculate and update exam average
 * Used internally by other controllers (no longer needed as average is calculated inline)
 * @param {String} examId - Exam ID
 * @returns {Number|null} Average mark or null
 */
exports.updateExamAverage = async (examId) => {
  try {
    const exam = await ExamSchedule.findById(examId);
    if (!exam) {
      console.log(`⚠️ Exam ${examId} not found`);
      return null;
    }

    // Calculate average from embedded marks
    const totalMarks = exam.marks.reduce((sum, m) => sum + m.mark, 0);
    const average = exam.marks.length > 0 ? 
      Math.round((totalMarks / exam.marks.length) * 100) / 100 : null;

    // Update exam with new average
    exam.examAverage = average;
    await exam.save();

    console.log(`📊 Exam ${examId} average updated: ${average}`);
    return average;
  } catch (err) {
    console.error("Error updating exam average:", err);
    return null;
  }
};

/**
 * Get average mark for an exam
 * @route GET /api/exam-marks/exam/:examId/average
 */
exports.getExamAverage = async (req, res) => {
  try {
    const examId = req.params.examId;

    // Fetch exam from database
    const exam = await ExamSchedule.findById(examId);
    if (!exam) {
      return res.status(404).json({ error: "Exam not found" });
    }

    // Calculate average from embedded marks
    const totalMarks = exam.marks.reduce((sum, m) => sum + m.mark, 0);
    const average = exam.marks.length > 0 ? 
      Math.round((totalMarks / exam.marks.length) * 100) / 100 : null;

    // Update if not already set
    if (exam.examAverage !== average) {
      exam.examAverage = average;
      await exam.save();
    }

    res.json({ average: average, count: exam.marks.length });
  } catch (err) {
    console.error("Error in getExamAverage:", err);
    res.status(500).json({ error: "Server error" });
  }
};
