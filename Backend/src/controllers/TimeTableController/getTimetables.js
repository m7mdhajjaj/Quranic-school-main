// ============================================
// GET TIMETABLE OPERATIONS
// ============================================

const TimeTable = require("../../schema/TimeTable");
const Group = require("../../schema/Group");
const { getTeacherGroups } = require("../basicController/teacherController/utils.controller");

/**
 * الحصول على جميع المواعيد مع الفلترة حسب المستخدم
 */
exports.getAllTimetables = async (req, res) => {
  try {
    const user = req.user; // من middleware المصادقة
    let timetables = [];
    let teacherGroups = [];

    if (!user) {
      // إذا لم يكن هناك مستخدم، إرجاع جميع المواعيد (للإدارة)
      timetables = await TimeTable.find()
        .populate('groupId', 'name')
        .populate('teacherId', 'firstName lastName');
      return res.json({ success: true, timetables, teacherGroups });
    }

    if (user.role === 'student' && user.group) {
      // الطالب: فقط مواعيد حلقته
      timetables = await TimeTable.find({ note: user.group })
        .populate('groupId', 'name')
        .populate('teacherId', 'firstName lastName');
    } else if (user.role === 'teacher') {
      // جلب أسماء جميع حلقات المعلم من Teacher.groups
      teacherGroups = await getTeacherGroups(user._id);

      // المعلم: فقط حلقاته المرتبطة بـ teacherId
      timetables = await TimeTable.find({ teacherId: user._id })
        .populate('groupId', 'name')
        .populate('teacherId', 'firstName lastName');
    } else {
      // الإداري: جميع المواعيد
      timetables = await TimeTable.find()
        .populate('groupId', 'name')
        .populate('teacherId', 'firstName lastName');
    }

    res.json({ 
      success: true, 
      timetables, 
      teacherGroups 
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
