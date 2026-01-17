// ============================================================================
// shared/getMarks.js - Get Marks Operations (Shared)
// ============================================================================

const Mark = require("../../../schema/DailyMark/DailyMark");
const {
  sendSuccess,
  sendError,
  formatPagination,
} = require("../utils/responseHelpers");

/**
 * Get all marks with pagination and performance optimization
 * @route GET /api/daily-marks
 */
exports.getMarks = async (req, res) => {
  try {
    console.log("⚡ Fetching all marks...");
    const startTime = Date.now();

    const page = req.query.page || 1;
    const limit = req.query.limit || 200;
    const skip = (page - 1) * limit;

    const marks = await Mark.find()
      .populate("studentId", "firstName fatherName lastName group")
      .populate("sectionId", "date memorizationSection reviewSection group")
      .skip(skip)
      .limit(limit)
      .lean()
      .sort({ createdAt: -1 });

    const total = await Mark.countDocuments();

    const duration = Date.now() - startTime;
    console.log(`✅ Fetched ${marks.length} marks in ${duration}ms`);

    sendSuccess(res, marks, `تم تحميل ${marks.length} علامة بنجاح`, 200, {
      pagination: formatPagination(total, page, limit),
    });
  } catch (error) {
    console.error("❌ Error fetching marks:", error);
    sendError(res, error.message, 500, error);
  }
};

/**
 * Get all marks for a specific section
 * @route GET /api/daily-marks/section/:sectionId
 */
exports.getSectionMarks = async (req, res) => {
  try {
    console.log("⚡ Fetching marks for section:", req.params.sectionId);
    const startTime = Date.now();

    const marks = await Mark.find({ sectionId: req.params.sectionId })
      .populate("studentId", "firstName fatherName lastName group")
      .populate("sectionId")
      .lean()
      .sort({ createdAt: -1 });

    const duration = Date.now() - startTime;
    console.log(`✅ Fetched ${marks.length} marks in ${duration}ms`);

    sendSuccess(res, marks, `تم تحميل ${marks.length} علامة للقسم بنجاح`);
  } catch (error) {
    console.error("❌ Error fetching section marks:", error);
    sendError(res, error.message, 500, error);
  }
};
