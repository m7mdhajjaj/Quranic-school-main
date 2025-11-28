// ============================================================================
// getFilteredMarks.js - Get Filtered Marks with Advanced Filters
// ============================================================================

const Mark = require("../../schema/DailyMark");
const Section = require("../../schema/Section");
const { getTeacherGroups } = require("../teacherController/utils.controller");

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
      search,
      group,
      studentId,
      page = 1,
      limit = 100,
    } = req.query;

    console.log("📋 Filters received:", {
      month,
      year,
      search,
      group,
      studentId,
      page,
      limit,
    });

    // Get user's group(s) based on role
    let userGroup = group || null;
    let teacherGroups = null;

    if (req.user) {
      if (req.user.role === "student") {
        // Student: fetch current group from database
        const Student = require("../../schema/Student");
        const studentData = await Student.findById(req.user._id).select('group');
        userGroup = studentData ? studentData.group : null;
      } else if (req.user.role === "teacher") {
        // Teacher: get assigned groups that have students
        const allTeacherGroups = await getTeacherGroups(req.user._id);
        
        if (allTeacherGroups && allTeacherGroups.length > 0) {
          // Get only groups that have students
          const Student = require("../../schema/Student");
          const groupsWithStudents = await Student.distinct('group', {
            group: { $in: allTeacherGroups }
          });
          teacherGroups = groupsWithStudents;
          
          // If specific group requested, check if it has students
          if (userGroup) {
            if (!teacherGroups.includes(userGroup)) {
              return res.status(403).json({
                success: false,
                message: "ليس لديك صلاحية للوصول إلى هذه الحلقة أو الحلقة لا تحتوي على طلاب",
              });
            }
          } else if (teacherGroups.length > 0) {
            // If no specific group requested, use first group with students
            userGroup = teacherGroups[0];
          }
        }
      }
      // Admin can see all groups
    }

    // Build section filter
    const sectionFilter = {};

    // Filter by group
    if (req.user && req.user.role === "student") {
      // Student: only their group
      sectionFilter.group = userGroup;
    } else if (req.user && req.user.role === "teacher") {
      // Teacher: specific group if selected
      if (userGroup) {
        sectionFilter.group = userGroup;
      }
    } else if (group) {
      // Admin: specific group if requested
      sectionFilter.group = group;
    }

    // Filter by month and year
    if (month && year) {
      const monthNum = parseInt(month);
      const yearNum = parseInt(year);

      // Create date range for the entire month
      const startDate = new Date(yearNum, monthNum - 1, 1); // First day of month
      const endDate = new Date(yearNum, monthNum, 0, 23, 59, 59, 999); // Last day of month

      sectionFilter.date = {
        $gte: startDate,
        $lte: endDate,
      };

      console.log("📅 Date filter:", {
        month: monthNum,
        year: yearNum,
        startDate,
        endDate,
      });
    } else if (year) {
      // Only year filter (all months of that year)
      const yearNum = parseInt(year);
      const startDate = new Date(yearNum, 0, 1); // Jan 1st
      const endDate = new Date(yearNum, 11, 31, 23, 59, 59, 999); // Dec 31st

      sectionFilter.date = {
        $gte: startDate,
        $lte: endDate,
      };

      console.log("📅 Year filter:", { year: yearNum, startDate, endDate });
    }

    // Search in reviewSection or memorizationSection
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), "i"); // Case-insensitive search
      sectionFilter.$or = [
        { reviewSection: searchRegex },
        { memorizationSection: searchRegex },
      ];
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
        filters: { month, year, search, group, studentId },
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

/**
 * Get filtered sections with month, year, search, and group filters
 * @route GET /api/daily-marks/filtered-sections
 * @query {number} month - Filter by month (1-12)
 * @query {number} year - Filter by year (e.g., 2024)
 * @query {string} search - Search in reviewSection or memorizationSection
 * @query {string} group - Filter by group name
 */
exports.getFilteredSections = async (req, res) => {
  try {
    console.log("🔍 ========== FILTERED SECTIONS REQUEST ==========");
    const startTime = Date.now();

    const { month, year, search, group } = req.query;

    console.log("📋 Filters received:", { month, year, search, group });

    // Get user's group(s) based on role
    let userGroup = group || null;
    let teacherGroups = null;

    if (req.user) {
      if (req.user.role === "student") {
        // Student: fetch current group from database
        const Student = require("../../schema/Student");
        const studentData = await Student.findById(req.user._id).select('group');
        userGroup = studentData ? studentData.group : null;
      } else if (req.user.role === "teacher") {
        // Teacher: get assigned groups that have students
        const allTeacherGroups = await getTeacherGroups(req.user._id);
        
        if (allTeacherGroups && allTeacherGroups.length > 0) {
          // Get only groups that have students
          const Student = require("../../schema/Student");
          const groupsWithStudents = await Student.distinct('group', {
            group: { $in: allTeacherGroups }
          });
          teacherGroups = groupsWithStudents;
          
          // If specific group requested, check if it has students
          if (userGroup) {
            if (!teacherGroups.includes(userGroup)) {
              return res.status(403).json({
                success: false,
                message: "ليس لديك صلاحية للوصول إلى هذه الحلقة أو الحلقة لا تحتوي على طلاب",
              });
            }
          } else if (teacherGroups.length > 0) {
            // If no specific group requested, use first group with students
            userGroup = teacherGroups[0];
          }
        }
      }
      // Admin can see all groups
    }

    // Build section filter
    const sectionFilter = {};

    // Filter by group
    if (req.user && req.user.role === "student") {
      // Student: only their group
      sectionFilter.group = userGroup;
    } else if (req.user && req.user.role === "teacher") {
      // Teacher: specific group if selected
      if (userGroup) {
        sectionFilter.group = userGroup;
      }
    } else if (group) {
      // Admin: specific group if requested
      sectionFilter.group = group;
    }

    // Filter by month and year
    if (month && year) {
      const monthNum = parseInt(month);
      const yearNum = parseInt(year);

      const startDate = new Date(yearNum, monthNum - 1, 1);
      const endDate = new Date(yearNum, monthNum, 0, 23, 59, 59, 999);

      sectionFilter.date = {
        $gte: startDate,
        $lte: endDate,
      };
    } else if (year) {
      const yearNum = parseInt(year);
      const startDate = new Date(yearNum, 0, 1);
      const endDate = new Date(yearNum, 11, 31, 23, 59, 59, 999);

      sectionFilter.date = {
        $gte: startDate,
        $lte: endDate,
      };
    }

    // Search in reviewSection or memorizationSection
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), "i");
      sectionFilter.$or = [
        { reviewSection: searchRegex },
        { memorizationSection: searchRegex },
      ];
    }

    console.log("🔧 Section filter:", sectionFilter);

    // Find sections
    const sections = await Section.find(sectionFilter)
      .populate("teacher", "firstName lastName")
      .sort({ date: -1 })
      .lean();

    const duration = Date.now() - startTime;
    console.log(`✅ Fetched ${sections.length} sections in ${duration}ms`);
    console.log("🔍 ========== FILTERED SECTIONS COMPLETE ==========\n");

    res.json({
      success: true,
      data: sections,
      count: sections.length,
      filters: {
        month: month ? parseInt(month) : null,
        year: year ? parseInt(year) : null,
        search: search || null,
        group: userGroup || null,
      },
      teacherGroups: teacherGroups || null,
      message: `تم تحميل ${sections.length} مقطع بنجاح`,
    });
  } catch (error) {
    console.error("❌ Error fetching filtered sections:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

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

    // Get user's group(s) based on role
    let userGroup = group || null;

    if (req.user) {
      if (req.user.role === "student") {
        // Student: fetch current group from database
        const Student = require("../../schema/Student");
        const studentData = await Student.findById(req.user._id).select('group');
        userGroup = studentData ? studentData.group : null;
      } else if (req.user.role === "teacher") {
        // Teacher: get assigned groups that have students
        const allTeacherGroups = await getTeacherGroups(req.user._id);
        
        if (allTeacherGroups && allTeacherGroups.length > 0) {
          // Get only groups that have students
          const Student = require("../../schema/Student");
          const groupsWithStudents = await Student.distinct('group', {
            group: { $in: allTeacherGroups }
          });
          
          if (!userGroup) {
            userGroup = groupsWithStudents[0];
          } else if (!groupsWithStudents.includes(userGroup)) {
            return res.status(403).json({
              success: false,
              message: "ليس لديك صلاحية للوصول إلى هذه الحلقة",
            });
          }
        }
      }
      // Admin can see all groups
    }

    // Build section filter
    const sectionFilter = {};

    if (userGroup) {
      sectionFilter.group = userGroup;
    }

    // Filter by month and year
    if (month && year) {
      const monthNum = parseInt(month);
      const yearNum = parseInt(year);

      const startDate = new Date(yearNum, monthNum - 1, 1);
      const endDate = new Date(yearNum, monthNum, 0, 23, 59, 59, 999);

      sectionFilter.date = {
        $gte: startDate,
        $lte: endDate,
      };
    } else if (year) {
      const yearNum = parseInt(year);
      const startDate = new Date(yearNum, 0, 1);
      const endDate = new Date(yearNum, 11, 31, 23, 59, 59, 999);

      sectionFilter.date = {
        $gte: startDate,
        $lte: endDate,
      };
    }

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
