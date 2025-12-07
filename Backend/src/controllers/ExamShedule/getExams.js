// ============================================================================
// getExams.js - Get All Exams with Filtering, Sorting, and Pagination
// ============================================================================

const ExamSchedule = require("../../schema/ExamSchedule");

/**
 * Get all exams with advanced filtering and sorting
 * @route GET /api/exams
 * @query {string} search - Search in exam name
 * @query {string} sortBy - Sort field (date, name)
 * @query {string} sortDir - Sort direction (asc, desc)
 * @query {string} dateFrom - Filter from date (YYYY-MM-DD)
 * @query {string} dateTo - Filter to date (YYYY-MM-DD)
 * @query {string} group - Filter by group
 * @query {string} teacher - Filter by teacher
 */
const getExams = async (req, res) => {
  try {
    const {
      search = "",
      sortBy = "date",
      sortDir = "asc",
      dateFrom,
      dateTo,
      group,
      teacher,
    } = req.query;

    // Build filter query
    const filter = {};

    // Search filter
    if (search && search.trim()) {
      filter.$or = [
        { name: { $regex: search.trim(), $options: "i" } },
        { title: { $regex: search.trim(), $options: "i" } },
        { subject: { $regex: search.trim(), $options: "i" } },
      ];
    }

    // Date range filter
    if (dateFrom || dateTo) {
      filter.date = {};
      if (dateFrom) {
        filter.date.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        // Add one day to include the end date
        const endDate = new Date(dateTo);
        endDate.setDate(endDate.getDate() + 1);
        filter.date.$lt = endDate;
      }
    }

    // Group filter
    if (group) {
      filter.group = group;
    }

    // Teacher filter
    if (teacher) {
      filter.teacher = teacher;
    }

    // Build sort object
    const sortField = sortBy === "name" ? "name" : "date";
    const sortDirection = sortDir === "desc" ? -1 : 1;
    const sort = { [sortField]: sortDirection };

    // If sorting by date, add name as secondary sort
    if (sortField === "date") {
      sort.name = sortDirection;
    }

    // Execute query with filters and sorting
    const exams = await ExamSchedule.find(filter)
      .sort(sort)
      .populate("marks.student", "firstName lastName name")
      .lean();

    console.log(`📚 Retrieved ${exams.length} exams with filters:`, {
      search,
      sortBy,
      sortDir,
      dateFrom,
      dateTo,
      group,
      teacher,
    });

    res.json(exams);
  } catch (err) {
    console.error("Error fetching exams:", err);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = getExams;
