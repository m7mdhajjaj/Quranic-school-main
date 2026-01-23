// ============================================================================
// getMyExams.js - Get User's Exams (Role-Based Filtering on Backend)
// ============================================================================

const ExamSchedule = require("../../../schema/ExamShedule/ExamSchedule");
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
    // req.user هو الكائن الكامل للمستخدم من الـ middleware
    const role = req.user.role;
    const userId = req.user._id?.toString() || req.user.id;
    const { search = "", date = "", type = "", marksStatus = "" } = req.query;

    console.log(`📋 getMyExams called - role: ${role}, userId: ${userId}`);

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
    const andConditions = [];

    // Search filter
    if (search && search.trim()) {
      andConditions.push({
        $or: [
          { name: { $regex: search.trim(), $options: "i" } },
          { title: { $regex: search.trim(), $options: "i" } },
          { subject: { $regex: search.trim(), $options: "i" } },
        ]
      });
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
        andConditions.push({ marks: { $exists: true, $ne: [] } });
      } else if (marksStatus === 'not-graded') {
        andConditions.push({
          $or: [
            { marks: { $exists: false } },
            { marks: { $size: 0 } }
          ]
        });
      }
    }

    // Role-based filtering - فلترة حسب الدور
    if (role === 'student') {
      // req.user هو الطالب نفسه (من middleware)
      // الطالب يرى فقط امتحانات حلقته
      const studentGroup = req.user.group;
      console.log(`🎓 Student group from req.user: "${studentGroup}"`);
      
      // student.group هو String (اسم الحلقة) وليس ObjectId
      if (!studentGroup || studentGroup === 'غير محدد') {
        console.log(`⚠️ Student ${userId} has no group assigned`);
        return res.json([]);
      }
      
      // استخدام اسم الحلقة مباشرة للفلترة
      filter.group = studentGroup;
      console.log(`🎓 Filtering exams for student in group: "${studentGroup}"`);
    }
    // المعلم والإداري يرون جميع الامتحانات

    // Combine all conditions
    if (andConditions.length > 0) {
      filter.$and = andConditions;
    }

    console.log(`🔍 Final filter:`, JSON.stringify(filter, null, 2));

    // Execute query with filters
    const exams = await ExamSchedule.find(filter)
      .sort({ date: 1, name: 1 })
      .populate("marks.student", "firstName lastName name")
      .lean();

    console.log(`📊 Found ${exams.length} exams matching filter`);

    // للطالب: فلترة العلامات لتظهر فقط علامته الخاصة
    let processedExams = exams;
    if (role === 'student') {
      processedExams = exams.map(exam => {
        // فقط أبقِ علامة هذا الطالب
        const studentMark = exam.marks?.find(m => 
          m.student?._id?.toString() === userId || 
          m.student?.toString() === userId
        );
        return {
          ...exam,
          marks: studentMark ? [studentMark] : [],
          myMark: studentMark?.mark ?? null // إضافة علامة الطالب مباشرة
        };
      });
    }

    // إضافة القيم الافتراضية للبيانات القديمة (الوقت يبقى بصيغة 24 ساعة)
    const examsWithFormattedTime = processedExams.map(exam => {
      return {
        ...exam,
        subject: exam.subject || '',
        type: exam.type || 'شفهي',
        duration: exam.duration ?? 60,
        totalMarks: exam.totalMarks ?? 20,
        passingMarks: exam.passingMarks ?? 10,
      };
    });

    console.log(`📚 Retrieved ${processedExams.length} exams for ${role} (userId: ${userId})`);

    res.json(examsWithFormattedTime);
  } catch (err) {
    console.error("Error fetching my exams:", err);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = getMyExams;
