// ============================================================================
// getMarks.js - Get Marks Operations
// ============================================================================

const Mark = require("../../schema/DailyMark");

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

    res.json({
      success: true,
      data: marks,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
      message: `تم تحميل ${marks.length} علامة بنجاح`,
    });
  } catch (error) {
    console.error("❌ Error fetching marks:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get all marks for a specific student
 * @route GET /api/daily-marks/student/:studentId
 */
exports.getStudentMarks = async (req, res) => {
  try {
    console.log("⚡ Fetching marks for student:", req.params.studentId);
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
    console.log(`✅ Fetched ${marks.length} marks in ${duration}ms`);

    res.json({
      success: true,
      data: marks,
      message: `تم تحميل ${marks.length} علامة للطالب بنجاح`,
    });
  } catch (error) {
    console.error("❌ Error fetching student marks:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
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

    res.json({
      success: true,
      data: marks,
      message: `تم تحميل ${marks.length} علامة للقسم بنجاح`,
    });
  } catch (error) {
    console.error("❌ Error fetching section marks:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get marks statistics for a student
 * @route GET /api/daily-marks/student/:studentId/stats
 */
exports.getStudentMarkStats = async (req, res) => {
  try {
    console.log("⚡ Calculating mark statistics for student:", req.params.studentId);

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

    console.log(`✅ Statistics calculated for student`);

    res.json({
      success: true,
      data: stats,
      message: "تم حساب إحصائيات الطالب بنجاح",
    });
  } catch (error) {
    console.error("❌ Error calculating statistics:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
