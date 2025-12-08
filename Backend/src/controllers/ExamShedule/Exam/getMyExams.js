// ============================================================================
// getMyExams.js - Get User's Exams (Role-Based Filtering on Backend)
// ============================================================================

const ExamSchedule = require("../../../schema/ExamSchedule");
const Student = require("../../../schema/Student");
const Teacher = require("../../../schema/Teacher");
const Group = require("../../../schema/Group");

/**
 * Get exams for current user based on their role
 * @route GET /api/exams/my-exams
 * @query {string} search - Search in exam name
 * @query {string} marksStatus - Filter by marks status (graded, not-graded)
 * @access Private (requires authentication)
 */
const getMyExams = async (req, res) => {
  try {
    const { role, userId } = req.user;
    const { search = "", date = "", type = "", marksStatus = "" } = req.query;

    // Validate marksStatus
    if (marksStatus && !['graded', 'not-graded'].includes(marksStatus)) {
      return res.status(400).json({ 
        success: false,
        message: 'قيمة marksStatus غير صحيحة',
        error: 'marksStatus must be either "graded" or "not-graded"'
      });
    }

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

    // Marks status filter
    if (marksStatus) {
      if (marksStatus === 'graded') {
        filter.marks = { $exists: true, $ne: [] };
      } else if (marksStatus === 'not-graded') {
        filter.$or = [
          { marks: { $exists: false } },
          { marks: { $size: 0 } }
        ];
      }
    }

    // Role-based filtering
    // عرض جميع الامتحانات لجميع المستخدمين (طلاب، معلمين، إداريين)
    // لا نضيف أي فلتر حسب الحلقة أو المعلم

    // Execute query with filters
    const exams = await ExamSchedule.find(filter)
      .sort({ date: 1, name: 1 })
      .populate("marks.student", "firstName lastName name")
      .lean();

    // إضافة القيم الافتراضية للبيانات القديمة (الوقت يبقى بصيغة 24 ساعة)
    const examsWithFormattedTime = exams.map(exam => {
      return {
        ...exam,
        subject: exam.subject || '',
        type: exam.type || 'شفهي',
        duration: exam.duration ?? 60,
        totalMarks: exam.totalMarks ?? 20,
        passingMarks: exam.passingMarks ?? 10,
      };
    });

    console.log(`📚 Retrieved ${exams.length} exams for ${role} (userId: ${userId})`);

    res.json(examsWithFormattedTime);
  } catch (err) {
    console.error("Error fetching my exams:", err);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = getMyExams;
