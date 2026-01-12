// ============================================
// GET TIMETABLE CONTROLLER (NEW)
// ============================================
// جلب المواعيد مع فلترة متقدمة

const TimeTable = require("../../schema/TimeTable");
const Section = require("../../schema/DailyMark/Section");
const Group = require("../../schema/Group");
const { getWeekRange } = require("./helpers/dateTime.helper");

/**
 * جلب جميع المواعيد مع فلترة
 * @route GET /api/timetable
 * @query weekFilter: 'current' | 'all' | 'week'
 * @query weekStart: ISO date
 * @query teacherId, groupId, day
 */
exports.getTimetables = async (req, res) => {
  try {
    const user = req.user;
    const { 
      weekFilter = 'current', 
      weekStart,
      teacherId,
      groupId,
      day 
    } = req.query;

    // ✅ 1. بناء Query الأساسي حسب الدور
    let query = {};

    if (user?.role === 'student' && user.group) {
      // الطالب: مواعيد حلقته فقط
      query.note = user.group;
    } else if (user?.role === 'teacher') {
      // المعلم: مواعيده فقط
      query.teacherId = user._id;
    }
    // الإداري: كل المواعيد

    // ✅ 2. فلاتر إضافية
    if (teacherId) query.teacherId = teacherId;
    if (groupId) query.groupId = groupId;
    if (day) query.day = day;

    // ✅ 3. فلترة حسب الأسبوع
    if (weekFilter === 'current' || weekStart) {
      const refDate = weekStart ? new Date(weekStart) : new Date();
      const { startOfWeek, endOfWeek } = getWeekRange(refDate);

      query.$or = [
        { isRecurring: true },
        { isRecurring: { $exists: false } },
        { sessionDate: null },
        { 
          isRecurring: false,
          sessionDate: { $gte: startOfWeek, $lte: endOfWeek }
        }
      ];
    }

    // ✅ 4. جلب البيانات
    const timetables = await TimeTable.find(query)
      .populate('teacherId', 'firstName lastName')
      .populate('groupId', 'name')
      .populate('sectionId', 'date group memorizationSection reviewSection marksStatus')
      .sort({ day: 1, startHour: 1 });

    res.json({
      success: true,
      data: timetables,
      meta: {
        total: timetables.length,
        filter: weekFilter
      }
    });

  } catch (error) {
    console.error("❌ Error fetching timetables:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء جلب المواعيد"
    });
  }
};

/**
 * جلب موعد محدد بالـ ID
 * @route GET /api/timetable/:id
 */
exports.getTimetableById = async (req, res) => {
  try {
    const { id } = req.params;

    const timetable = await TimeTable.findById(id)
      .populate('teacherId', 'firstName lastName')
      .populate('groupId', 'name')
      .populate('sectionId', 'date group memorizationSection reviewSection marksStatus');

    if (!timetable) {
      return res.status(404).json({
        success: false,
        message: "الموعد غير موجود"
      });
    }

    res.json({
      success: true,
      data: timetable
    });

  } catch (error) {
    console.error("❌ Error fetching timetable:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ"
    });
  }
};

/**
 * جلب موعد مقطع محدد
 * @route GET /api/timetable/section/:sectionId
 */
exports.getTimetableBySection = async (req, res) => {
  try {
    const { sectionId } = req.params;

    // البحث بـ sectionId مباشرة
    let timetable = await TimeTable.findOne({ sectionId })
      .populate('teacherId', 'firstName lastName')
      .populate('groupId', 'name');

    // أو البحث عبر Section.timetableId
    if (!timetable) {
      const section = await Section.findById(sectionId);
      if (section?.timetableId) {
        timetable = await TimeTable.findById(section.timetableId)
          .populate('teacherId', 'firstName lastName')
          .populate('groupId', 'name');
      }
    }

    if (!timetable) {
      return res.status(404).json({
        success: false,
        message: "لا يوجد موعد لهذا المقطع"
      });
    }

    res.json({
      success: true,
      data: timetable
    });

  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ"
    });
  }
};

/**
 * جلب جدول حلقة معينة
 * @route GET /api/timetable/group/:groupId
 */
exports.getGroupTimetable = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { weekStart } = req.query;

    // ✅ 1. التحقق من الحلقة
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: "الحلقة غير موجودة"
      });
    }

    // ✅ 2. بناء Query
    let query = { groupId };

    if (weekStart) {
      const { startOfWeek, endOfWeek } = getWeekRange(new Date(weekStart));
      query.$or = [
        { isRecurring: true },
        { sessionDate: { $gte: startOfWeek, $lte: endOfWeek } }
      ];
    }

    // ✅ 3. جلب المواعيد
    const timetables = await TimeTable.find(query)
      .populate('teacherId', 'firstName lastName')
      .populate('sectionId', 'date memorizationSection reviewSection')
      .sort({ day: 1, startHour: 1 });

    // ✅ 4. ترتيب حسب الأيام
    const daysOrder = ["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"];
    const sorted = timetables.sort((a, b) => 
      daysOrder.indexOf(a.day) - daysOrder.indexOf(b.day)
    );

    res.json({
      success: true,
      data: {
        group: {
          _id: group._id,
          name: group.name
        },
        timetables: sorted,
        totalSessions: sorted.length
      }
    });

  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ"
    });
  }
};

/**
 * جلب مواعيد معلم معين
 * @route GET /api/timetable/teacher/:teacherId
 */
exports.getTeacherTimetables = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { day, weekStart } = req.query;

    let query = { teacherId };
    if (day) query.day = day;

    if (weekStart) {
      const { startOfWeek, endOfWeek } = getWeekRange(new Date(weekStart));
      query.$or = [
        { isRecurring: true },
        { sessionDate: { $gte: startOfWeek, $lte: endOfWeek } }
      ];
    }

    const timetables = await TimeTable.find(query)
      .populate('groupId', 'name')
      .populate('sectionId', 'date memorizationSection reviewSection')
      .sort({ day: 1, startHour: 1 });

    res.json({
      success: true,
      data: timetables,
      meta: {
        total: timetables.length,
        teacherId
      }
    });

  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ"
    });
  }
};
