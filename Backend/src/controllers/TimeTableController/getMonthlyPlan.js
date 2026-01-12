// ============================================
// GET MONTHLY PLAN
// ============================================

const TimeTable = require("../../schema/TimeTable");
const { getTeacherGroups } = require("../basicController/teacherController/utils.controller");

// Helper: Arabic Days Map
const ARABIC_DAYS = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

/**
 * توليد خطة شهرية بناءً على الجدول الأسبوعي الثابت
 * @route GET /api/timetables/monthly?month=1&year=2026
 */
exports.getMonthlyPlan = async (req, res) => {
  try {
    const { month, year } = req.query;
    
    if (!month || !year) {
      return res.status(400).json({ 
        success: false, 
        message: "يجب تحديد الشهر والسنة" 
      });
    }

    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0);

    // 1. جلب الجدول الأسبوعي الثابت (نفس منطق getAllTimetables)
    const user = req.user;
    let baseTimetables = [];

    let query = {};
    if (user.role === 'student' && user.group) {
        query.note = user.group;
    } else if (user.role === 'teacher') {
        query.teacherId = user._id;
    }

    baseTimetables = await TimeTable.find(query)
      .populate('groupId', 'name')
      .populate('teacherId', 'firstName lastName')
      .lean();

    // 2. توليد الحصص لكل يوم في الشهر
    const monthlySessions = [];

    // Loop through every day in the month
    for (let d = new Date(startOfMonth); d <= endOfMonth; d.setDate(d.getDate() + 1)) {
        const currentDayIndex = d.getDay(); // 0 = Sunday, 1 = Monday ... 6 = Saturday
        const arabicDayName = ARABIC_DAYS[currentDayIndex];
        
        // Find sessions that happen on this day of week
        const daySessions = baseTimetables.filter(t => t.day === arabicDayName);
        
        const formattedDate = new Date(d).toISOString(); // Keep it as full date string
        
        daySessions.forEach(session => {
            monthlySessions.push({
                ...session,
                _id: `${session._id}_${d.getDate()}`, // Virtual ID unique for this instance
                originalId: session._id,
                date: formattedDate, // Add specific date
                isRecurringInstance: true // Flag to know this is generated
            });
        });
    }

    res.json({
      success: true,
      data: monthlySessions,
      meta: {
        total: monthlySessions.length,
        month,
        year
      }
    });

  } catch (error) {
    console.error("Error generating monthly plan:", error);
    res.status(500).json({ success: false, message: "فشل في توليد الخطة الشهرية" });
  }
};
