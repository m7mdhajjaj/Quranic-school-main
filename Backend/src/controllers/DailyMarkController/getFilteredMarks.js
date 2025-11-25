// ============================================================================
// getFilteredMarks.js - Get Filtered Marks with Advanced Filters
// ============================================================================

const Mark = require("../../schema/DailyMark");
const Section = require("../../schema/Section");

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

    // Build section filter
    const sectionFilter = {};

    // Filter by group
    if (group) {
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
        group: group || null,
        studentId: studentId || null,
      },
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

    // Build section filter
    const sectionFilter = {};

    // Filter by group
    if (group) {
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
        group: group || null,
      },
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
