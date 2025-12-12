// ============================================
// GET GROUP TIMETABLE
// ============================================

const TimeTable = require("../../schema/TimeTable");
const Group = require("../../schema/Group");

/**
 * الحصول على جدول أوقات حلقة معينة
 * @route GET /api/timetable/group/:groupId
 */
exports.getGroupTimetable = async (req, res) => {
  try {
    const { groupId } = req.params;

    // التحقق من وجود الحلقة
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: "الحلقة غير موجودة",
      });
    }

    // جلب جميع مواعيد الحلقة مرتبة حسب اليوم والوقت
    const timetable = await TimeTable.find({ groupId: groupId })
      .populate("teacherId", "firstName lastName")
      .sort({ day: 1, startHour: 1 });

    // ترتيب الأيام بشكل صحيح
    const daysOrder = [
      "السبت",
      "الأحد",
      "الاثنين",
      "الثلاثاء",
      "الأربعاء",
      "الخميس",
      "الجمعة",
    ];

    const sortedTimetable = timetable.sort((a, b) => {
      return daysOrder.indexOf(a.day) - daysOrder.indexOf(b.day);
    });

    // تنسيق البيانات
    const formattedTimetable = sortedTimetable.map((entry) => ({
      _id: entry._id,
      day: entry.day,
      startHour: entry.startHour,
      endHour: entry.endHour,
      teacher: entry.teacherId
        ? `${entry.teacherId.firstName} ${entry.teacherId.lastName}`
        : "غير محدد",
      teacherId: entry.teacherId?._id,
      note: entry.note,
    }));

    return res.status(200).json({
      success: true,
      data: {
        groupId: group._id,
        groupName: group.name,
        timetable: formattedTimetable,
        totalSessions: formattedTimetable.length,
      },
    });
  } catch (error) {
    console.error("Error fetching group timetable:", error);
    return res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء جلب جدول الحلقة",
      error: error.message,
    });
  }
};

/**
 * الحصول على جدول حلقة باسمها
 * @route GET /api/timetable/group/name/:groupName
 */
exports.getGroupTimetableByName = async (req, res) => {
  try {
    const { groupName } = req.params;

    // البحث عن الحلقة باسمها
    const group = await Group.findOne({ name: groupName });
    if (!group) {
      return res.status(404).json({
        success: false,
        message: "الحلقة غير موجودة",
      });
    }

    // استخدام نفس الكود لجلب الجدول
    req.params.groupId = group._id;
    return exports.getGroupTimetable(req, res);
  } catch (error) {
    console.error("Error fetching group timetable by name:", error);
    return res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء جلب جدول الحلقة",
      error: error.message,
    });
  }
};
