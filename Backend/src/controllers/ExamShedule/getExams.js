// ============================================================================
// getExams.js - Get All Exams
// ============================================================================

const Exam = require("../../schema/Exam");

/**
 * Get all exams
 * @route GET /api/exams
 */
const getExams = async (req, res) => {
  try {
    const exams = await Exam.find();
    res.json(exams);
  } catch (err) {
    console.error("Error fetching exams:", err);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = getExams;
