// ============================================
// GET TIMETABLE OPERATIONS
// ============================================

const TimeTable = require("../../schema/TimeTable");
const Group = require("../../schema/Group");
const { getTeacherGroups } = require("../basicController/teacherController/utils.controller");

/**
 * حساب بداية ونهاية الأسبوع (السبت - الجمعة)
 * @param {Date} date - التاريخ المرجعي (افتراضي: اليوم)
 * @returns {{ startOfWeek: Date, endOfWeek: Date }}
 */
const getWeekRange = (date = new Date()) => {
  const currentDay = date.getDay(); // 0 = الأحد، 6 = السبت
  
  // حساب بداية الأسبوع (السبت)
  const daysToSaturday = currentDay === 6 ? 0 : currentDay + 1;
  const startOfWeek = new Date(date);
  startOfWeek.setDate(date.getDate() - daysToSaturday);
  startOfWeek.setHours(0, 0, 0, 0);
  
  // نهاية الأسبوع (الجمعة)
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);
  
  return { startOfWeek, endOfWeek };
};

/**
 * الحصول على جميع المواعيد مع الفلترة حسب المستخدم
 * Query Parameters:
 * - weekFilter: 'current' | 'all' - فلترة حسب الأسبوع الحالي (افتراضي: 'current')
 * - weekStart: ISO date string - بداية الأسبوع للفلترة
 */
exports.getAllTimetables = async (req, res) => {
  try {
    const user = req.user;
    const { weekFilter = 'current', weekStart } = req.query;
    
    let timetables = [];
    let teacherGroups = [];

    // بناء الـ query الأساسي حسب دور المستخدم
    let baseQuery = {};

    if (!user) {
      // إذا لم يكن هناك مستخدم، إرجاع جميع المواعيد (للإدارة)
      baseQuery = {};
    } else if (user.role === 'student' && user.group) {
      // الطالب: فقط مواعيد حلقته
      baseQuery = { note: user.group };
    } else if (user.role === 'teacher') {
      // جلب أسماء جميع حلقات المعلم
      teacherGroups = await getTeacherGroups(user._id);
      // المعلم: فقط حلقاته المرتبطة بـ teacherId
      baseQuery = { teacherId: user._id };
    }
    // الإداري: baseQuery يبقى فارغ = جميع المواعيد

    // ✅ فلترة حسب الأسبوع
    if (weekFilter === 'current' || weekStart) {
      const referenceDate = weekStart ? new Date(weekStart) : new Date();
      const { startOfWeek, endOfWeek } = getWeekRange(referenceDate);
      
      console.log(`📅 فلترة الأسبوع: ${startOfWeek.toISOString()} - ${endOfWeek.toISOString()}`);
      
      // الجلب: المواعيد المتكررة + المواعيد المحددة بتاريخ ضمن الأسبوع
      timetables = await TimeTable.find({
        ...baseQuery,
        $or: [
          { isRecurring: true }, // المواعيد المتكررة تظهر دائماً
          { isRecurring: { $ne: true }, sessionDate: null }, // مواعيد قديمة بدون sessionDate
          { 
            isRecurring: false, 
            sessionDate: { $gte: startOfWeek, $lte: endOfWeek } 
          } // المواعيد المحددة بتاريخ ضمن الأسبوع
        ]
      })
        .populate('groupId', 'name')
        .populate('teacherId', 'firstName lastName')
        .sort({ day: 1, startHour: 1 });
    } else {
      // weekFilter === 'all' - جلب جميع المواعيد
      timetables = await TimeTable.find(baseQuery)
        .populate('groupId', 'name')
        .populate('teacherId', 'firstName lastName')
        .sort({ day: 1, startHour: 1 });
    }

    console.log(`✅ تم جلب ${timetables.length} موعد`);

    res.json({ 
      success: true, 
      timetables, 
      teacherGroups,
      meta: {
        total: timetables.length,
        filter: weekFilter
      }
    });
  } catch (err) {
    console.error("Error fetching timetables:", err);
    res.status(500).json({ 
      success: false,
      error: "Server error",
      message: "حدث خطأ أثناء جلب المواعيد"
    });
  }
};
