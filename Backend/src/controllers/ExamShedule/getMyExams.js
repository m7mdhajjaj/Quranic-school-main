// ============================================================================
// getMyExams.js - Get User's Exams (Role-Based Filtering on Backend)
// ============================================================================

const ExamSchedule = require("../../schema/ExamSchedule");
const Student = require("../../schema/Student");
const Teacher = require("../../schema/Teacher");
const Group = require("../../schema/Group");

/**
 * Get exams for current user based on their role
 * @route GET /api/exams/my-exams
 * @query {string} search - Search in exam name
 * @access Private (requires authentication)
 */
const getMyExams = async (req, res) => {
  try {
    const { role, userId } = req.user;
    const { search = "", date = "", type = "" } = req.query;

    // Build base filter
    const filter = {};

    // Search filter
    if (search && search.trim()) {
      filter.$or = [
        { name: { $regex: search.trim(), $options: "i" } },
        { title: { $regex: search.trim(), $options: "i" } },
        { subject: { $regex: search.trim(), $options: "i" } },
      ];
    }

    // Date filter
    if (date && date.trim()) {
      const selectedDate = new Date(date);
      const nextDay = new Date(selectedDate);
      nextDay.setDate(nextDay.getDate() + 1);
      filter.date = {
        $gte: selectedDate,
        $lt: nextDay,
      };
    }

    // Type filter
    if (type && type.trim()) {
      filter.type = type.trim();
    }

    // Role-based filtering
    if (role === "student") {
      // Get student's group
      const student = await Student.findById(userId).select("group").lean();
      if (student && student.group) {
        filter.group = student.group;
      } else {
        // Student has no group, return empty
        filter.group = null;
      }
    } else if (role === "teacher") {
      // Get all groups where this teacher is assigned
      const teacher = await Teacher.findById(userId)
        .select("firstName lastName name")
        .lean();

      if (teacher) {
        // Build possible teacher name variations
        const possibleNames = [];
        if (teacher.firstName && teacher.lastName) {
          possibleNames.push(`${teacher.firstName} ${teacher.lastName}`);
        }
        if (teacher.name) {
          possibleNames.push(teacher.name);
        }

        // Find groups by teacher ObjectId or by name matching
        const groups = await Group.find({
          $or: [
            { teacher: userId },
            { teacherName: { $in: possibleNames } },
          ],
        })
          .select("name")
          .lean();

        if (groups.length > 0) {
          const groupNames = groups.map((g) => g.name);
          filter.group = { $in: groupNames };
        } else {
          // Teacher has no groups, return empty
          filter.group = null;
        }
      } else {
        filter.group = null;
      }
    }
    // Admin sees all exams (no additional filter)

    // Execute query with filters
    const exams = await ExamSchedule.find(filter)
      .sort({ date: 1, name: 1 })
      .populate("marks.student", "firstName lastName name")
      .lean();

    console.log(`📚 Retrieved ${exams.length} exams for ${role} (userId: ${userId})`);

    res.json(exams);
  } catch (err) {
    console.error("Error fetching my exams:", err);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = getMyExams;
