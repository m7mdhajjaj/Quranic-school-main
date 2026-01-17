// ============================================================================
// student/getStudentAverages.js - Student Averages
// ============================================================================

const Mark = require("../../../schema/DailyMark/DailyMark");
const Section = require("../../../schema/DailyMark/Section");
const { createLogger } = require("../../../utils/logger");

const logger = createLogger('StudentAverages');

// استيراد الدوال المساعدة للفلترة من utils
const {
  getUserGroupsByRole,
  buildDateFilter,
} = require("../utils/filterHelpers");

/**
 * Get student averages for filtered marks
 * @route GET /api/daily-marks/student/:studentId/averages
 * @query {number} month - Filter by month (1-12)
 * @query {number} year - Filter by year (e.g., 2024)
 * @query {string} group - Filter by group name
 */
exports.getStudentAverages = async (req, res) => {
  try {
    logger.info("STUDENT AVERAGES REQUEST");
    const startTime = Date.now();

    const { studentId } = req.params;
    const { month, year, group } = req.query;

    logger.debug("Request:", { studentId, month, year, group });

    // Get user's group(s) based on role using helper function
    let userGroup;
    try {
      const groupsData = await getUserGroupsByRole(req.user, group);
      userGroup = groupsData.userGroup;
      
      // For teacher role, validate access
      if (req.user && req.user.role === "teacher" && group && groupsData.teacherGroups) {
        if (!groupsData.teacherGroups.includes(group)) {
          return res.status(403).json({
            success: false,
            message: "ليس لديك صلاحية للوصول إلى هذه الحلقة",
          });
        }
      }
    } catch (error) {
      return res.status(403).json({
        success: false,
        message: error.message,
      });
    }

    // Build section filter using helper functions
    const dateFilter = buildDateFilter(month, year);
    const sectionFilter = {
      ...(userGroup ? { group: userGroup } : {}),
      ...(Object.keys(dateFilter).length > 0 ? { date: dateFilter } : {}),
    };

    logger.debug("Section filter:", sectionFilter);

    // Find matching sections
    const sections = await Section.find(sectionFilter).select("_id").lean();
    const sectionIds = sections.map((s) => s._id);

    logger.debug(`Found ${sectionIds.length} matching sections`);

    if (sectionIds.length === 0) {
      return res.json({
        success: true,
        data: {
          reviewAverage: 0,
          memorizationAverage: 0,
          overallAverage: 0,
          totalMarks: 0,
          studentId,
        },
        filters: {
          month: month ? parseInt(month) : null,
          year: year ? parseInt(year) : null,
          group: group || null,
        },
        message: "لا توجد مقاطع في الفترة المحددة",
      });
    }

    // Find marks for student in these sections
    const marks = await Mark.find({
      studentId,
      sectionId: { $in: sectionIds },
    }).lean();

    logger.debug(`Found ${marks.length} marks for student`);

    if (marks.length === 0) {
      return res.json({
        success: true,
        data: {
          reviewAverage: 0,
          memorizationAverage: 0,
          overallAverage: 0,
          totalMarks: 0,
          studentId,
        },
        filters: {
          month: month ? parseInt(month) : null,
          year: year ? parseInt(year) : null,
          group: group || null,
        },
        message: "لا توجد علامات للطالب في الفترة المحددة",
      });
    }

    // Calculate averages
    const reviewMarks = marks
      .filter((m) => m.reviewMark !== null && m.reviewMark !== undefined)
      .map((m) => m.reviewMark);

    const memorizationMarks = marks
      .filter((m) => m.memorizationMark !== null && m.memorizationMark !== undefined)
      .map((m) => m.memorizationMark);

    const reviewAverage =
      reviewMarks.length > 0
        ? reviewMarks.reduce((sum, mark) => sum + mark, 0) / reviewMarks.length
        : 0;

    const memorizationAverage =
      memorizationMarks.length > 0
        ? memorizationMarks.reduce((sum, mark) => sum + mark, 0) / memorizationMarks.length
        : 0;

    // Overall average out of 100: (review + memorization) * 5
    const overallAverage = (reviewAverage + memorizationAverage) * 5;

    const averagesData = {
      reviewAverage: Number(reviewAverage.toFixed(2)),
      memorizationAverage: Number(memorizationAverage.toFixed(2)),
      overallAverage: Number(overallAverage.toFixed(2)),
      totalMarks: marks.length,
      studentId,
      breakdown: {
        reviewMarksCount: reviewMarks.length,
        memorizationMarksCount: memorizationMarks.length,
      },
    };

    const duration = Date.now() - startTime;
    logger.success(`Calculated averages in ${duration}ms`);
    logger.debug("Averages:", averagesData);
    logger.info("STUDENT AVERAGES COMPLETE");

    res.json({
      success: true,
      data: averagesData,
      filters: {
        month: month ? parseInt(month) : null,
        year: year ? parseInt(year) : null,
        group: userGroup || null,
      },
      message: "تم حساب المعدلات بنجاح",
    });
  } catch (error) {
    logger.error("Error calculating student averages:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
