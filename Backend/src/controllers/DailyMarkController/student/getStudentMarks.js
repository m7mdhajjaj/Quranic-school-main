// ============================================================================
// student/getStudentMarks.js - Student Mark Operations
// ============================================================================

const Mark = require("../../../schema/DailyMark/DailyMark");
const { createLogger } = require("../../../utils/logger");
const {
  sendSuccess,
  sendError,
} = require("../utils/responseHelpers");

const logger = createLogger('StudentMarks');

/**
 * Get all marks for a specific student
 * @route GET /api/daily-marks/student/:studentId
 */
exports.getStudentMarks = async (req, res) => {
  try {
    logger.debug("⚡ Fetching marks for student:", req.params.studentId);
    const startTime = Date.now();

    const marks = await Mark.find({ studentId: req.params.studentId })
      .populate({
        path: "sectionId",
        select: "date memorizationSection reviewSection group teacher",
      })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    const duration = Date.now() - startTime;
    logger.debug(`✅ Fetched ${marks.length} marks in ${duration}ms`);

    sendSuccess(res, marks, `تم تحميل ${marks.length} علامة للطالب بنجاح`);
  } catch (error) {
    logger.error("❌ Error fetching student marks:", error);
    sendError(res, error.message, 500, error);
  }
};

/**
 * Get marks statistics for a student
 * @route GET /api/daily-marks/student/:studentId/stats
 */
exports.getStudentMarkStats = async (req, res) => {
  try {
    logger.debug("⚡ Calculating mark statistics for student:", req.params.studentId);

    const marks = await Mark.find({ studentId: req.params.studentId });

    const reviewMarks = marks
      .filter((m) => m.reviewMark !== null)
      .map((m) => m.reviewMark);
    const memorizationMarks = marks
      .filter((m) => m.memorizationMark !== null)
      .map((m) => m.memorizationMark);

    const calculateAverage = (arr) =>
      arr.length > 0 ? (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2) : 0;

    const stats = {
      totalMarks: marks.length,
      reviewMarkAverage: calculateAverage(reviewMarks),
      memorizationMarkAverage: calculateAverage(memorizationMarks),
      overallAverage: calculateAverage([
        ...reviewMarks,
        ...memorizationMarks,
      ]),
      reviewMarksCount: reviewMarks.length,
      memorizationMarksCount: memorizationMarks.length,
    };

    logger.debug(`✅ Statistics calculated for student`);

    sendSuccess(res, stats, "تم حساب إحصائيات الطالب بنجاح");
  } catch (error) {
    logger.error("❌ Error calculating statistics:", error);
    sendError(res, error.message, 500, error);
  }
};
