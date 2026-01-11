// ============================================================================
// getFilteredMarks.js - Get Filtered Marks with Advanced Filters
// ============================================================================

const Mark = require("../../schema/DailyMark/DailyMark");
const Section = require("../../schema/DailyMark/Section");
const {
  updateSectionMarksStatus,
} = require("./SectionControllers/sectionMarksStatus");

// استيراد الدوال المساعدة للفلترة من utils
const {
  getUserGroupsByRole,
  buildGroupFilter,
  buildDateFilter,
  buildSectionSearchFilter,
} = require("./utils/filterHelpers");

/**
 * Get filtered marks with month, year, search, and group filters
 * @route GET /api/daily-marks/filtered
 * @query {number} month - Filter by month (1-12)
 * @query {number} year - Filter by year (e.g., 2024)
 * @query {string} search - Search in reviewSection or memorizationSection
 * @query {string} group - Filter by group name
 * @query {string} studentId - Filter by student ID
 * @query {number} page - Page number for pagination (default: 1)
 * @query {number} limit - Items per page (default: 100)
 */
exports.getFilteredMarks = async (req, res) => {
  try {
    console.log("🔍 ========== FILTERED MARKS REQUEST ==========");
    const startTime = Date.now();

    const {
      month,
      year,
      day,
      search,
      group,
      studentId,
      page = 1,
      limit = 100,
      startDate,
      endDate,
    } = req.query;

    console.log("📋 Filters received:", {
      month,
      year,
      day,
      search,
      group,
      studentId,
      page,
      limit,
      startDate,
      endDate,
    });

    // Get user's group(s) based on role using helper function
    let userGroup, teacherGroups;
    try {
      const groupsData = await getUserGroupsByRole(req.user, group);
      userGroup = groupsData.userGroup;
      teacherGroups = groupsData.teacherGroups;
    } catch (error) {
      return res.status(403).json({
        success: false,
        message: error.message,
      });
    }

    // Build section filter using helper functions
    const groupFilter = buildGroupFilter(req.user, userGroup, group);
    const dateFilter = buildDateFilter(month, year, day, startDate, endDate);
    const searchFilter = buildSectionSearchFilter(search);
    
    // Merge filters properly (handle date and $or from search)
    const sectionFilter = {
      ...groupFilter,
      ...(Object.keys(dateFilter).length > 0 ? { date: dateFilter } : {}),
      ...searchFilter,
    };

    // Log date filter if applied
    if (day && month && year) {
      const dayNum = parseInt(day);
      const monthNum = parseInt(month);
      const yearNum = parseInt(year);
      const startDate = new Date(yearNum, monthNum - 1, dayNum, 0, 0, 0, 0);
      const endDate = new Date(yearNum, monthNum - 1, dayNum, 23, 59, 59, 999);
      console.log("📅 Date filter (day):", {
        day: dayNum,
        month: monthNum,
        year: yearNum,
        startDate,
        endDate,
      });
    } else if (month && year) {
      const monthNum = parseInt(month);
      const yearNum = parseInt(year);
      const startDate = new Date(yearNum, monthNum - 1, 1);
      const endDate = new Date(yearNum, monthNum, 0, 23, 59, 59, 999);
      console.log("📅 Date filter:", {
        month: monthNum,
        year: yearNum,
        startDate,
        endDate,
      });
    } else if (year) {
      const yearNum = parseInt(year);
      const startDate = new Date(yearNum, 0, 1);
      const endDate = new Date(yearNum, 11, 31, 23, 59, 59, 999);
      console.log("📅 Year filter:", { year: yearNum, startDate, endDate });
    }

    if (search && search.trim()) {
      console.log("🔎 Search query:", search);
    }

    console.log("🔧 Section filter built:", sectionFilter);

    // Find sections matching the filters
    const matchedSections = await Section.find(sectionFilter)
      .select("_id date memorizationSection reviewSection group")
      .lean();

    console.log(`📊 Found ${matchedSections.length} matching sections`);

    if (matchedSections.length === 0) {
      return res.json({
        success: true,
        data: [],
        pagination: {
          total: 0,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: 0,
        },
        filters: { month, year, day, search, group, studentId },
        message: "لا توجد علامات مطابقة للفلاتر المحددة",
      });
    }

    // Extract section IDs
    const sectionIds = matchedSections.map((s) => s._id);

    // Build mark filter
    const markFilter = {
      sectionId: { $in: sectionIds },
    };

    // Filter by student if provided
    if (studentId) {
      markFilter.studentId = studentId;
      console.log("👤 Filtering by student:", studentId);
    }

    console.log("🔧 Mark filter built:", markFilter);

    // Count total matching marks
    const total = await Mark.countDocuments(markFilter);
    console.log(`📈 Total matching marks: ${total}`);

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const totalPages = Math.ceil(total / parseInt(limit));

    // Fetch marks with pagination
    const marks = await Mark.find(markFilter)
      .populate("studentId", "firstName fatherName lastName group")
      .populate(
        "sectionId",
        "date memorizationSection reviewSection group teacher"
      )
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const duration = Date.now() - startTime;
    console.log(`✅ Fetched ${marks.length} marks in ${duration}ms`);
    console.log("🔍 ========== FILTERED MARKS COMPLETE ==========\n");

    res.json({
      success: true,
      data: marks,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: totalPages,
      },
      filters: {
        month: month ? parseInt(month) : null,
        year: year ? parseInt(year) : null,
        day: day ? parseInt(day) : null,
        search: search || null,
        group: userGroup || null,
        studentId: studentId || null,
      },
      teacherGroups: teacherGroups || null,
      message: `تم تحميل ${marks.length} علامة بنجاح`,
    });
  } catch (error) {
    console.error("❌ Error fetching filtered marks:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Function moved to SectionControllers/get.controller.js

/**
 * Get student averages for filtered marks
 * @route GET /api/daily-marks/student/:studentId/averages
 * @query {number} month - Filter by month (1-12)
 * @query {number} year - Filter by year (e.g., 2024)
 * @query {string} group - Filter by group name
 */
exports.getStudentAverages = async (req, res) => {
  try {
    console.log("📊 ========== STUDENT AVERAGES REQUEST ==========");
    const startTime = Date.now();

    const { studentId } = req.params;
    const { month, year, group } = req.query;

    console.log("📋 Request:", { studentId, month, year, group });

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

    console.log("🔧 Section filter:", sectionFilter);

    // Find matching sections
    const sections = await Section.find(sectionFilter).select("_id").lean();
    const sectionIds = sections.map((s) => s._id);

    console.log(`📊 Found ${sectionIds.length} matching sections`);

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

    console.log(`📈 Found ${marks.length} marks for student`);

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
    console.log(`✅ Calculated averages in ${duration}ms`);
    console.log("📊 Averages:", averagesData);
    console.log("📊 ========== STUDENT AVERAGES COMPLETE ==========\n");

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
    console.error("❌ Error calculating student averages:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
