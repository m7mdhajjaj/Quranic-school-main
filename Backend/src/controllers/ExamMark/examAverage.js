// ============================================================================
// examAverage.js - Exam Average Calculation
// ============================================================================

const ExamMark = require("../../schema/ExamMark");
const Exam = require("../../schema/Exam");
const mongoose = require("mongoose");

/**
 * Helper function to calculate and update exam average
 * Used internally by other controllers
 * @param {String} examId - Exam ID
 * @returns {Number|null} Average mark or null
 */
exports.updateExamAverage = async (examId) => {
  try {
    // Aggregate marks for the exam
    const result = await ExamMark.aggregate([
      { $match: { exam: new mongoose.Types.ObjectId(examId) } },
      {
        $group: {
          _id: "$exam",
          avgMark: { $avg: { $toDouble: "$mark" } },
          count: { $sum: 1 },
        },
      },
    ]);

    let average = null;
    if (result.length > 0 && result[0].avgMark != null) {
      // Round average to 2 decimal places
      average = Math.round(result[0].avgMark * 100) / 100;
    }

    // Update exam with new average
    await Exam.findByIdAndUpdate(examId, { examAverage: average });

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
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ error: "Exam not found" });
    }

    // If average is already saved, return it
    if (exam.examAverage !== null && exam.examAverage !== undefined) {
      return res.json({ average: exam.examAverage, count: 0 });
    }

    // If not saved, calculate and update it
    const result = await ExamMark.aggregate([
      { $match: { exam: new mongoose.Types.ObjectId(examId) } },
      {
        $group: {
          _id: "$exam",
          avgMark: { $avg: { $toDouble: "$mark" } },
          count: { $sum: 1 },
        },
      },
    ]);

    if (result.length === 0) {
      return res.json({ average: null, count: 0 });
    }

    const average = Math.round(result[0].avgMark * 100) / 100;

    // Save average to database
    await Exam.findByIdAndUpdate(examId, { examAverage: average });

    res.json({ average: average, count: result[0].count });
  } catch (err) {
    console.error("Error in getExamAverage:", err);
    res.status(500).json({ error: "Server error" });
  }
};
