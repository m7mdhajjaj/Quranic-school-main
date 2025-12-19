// ============================================================================
// WarningController/getExpelledStudentsFromGroup.js - Get Expelled Students by History
// ============================================================================

const StudentHistory = require("../../schema/Student/StudentHistory");
const Student = require("../../schema/Student");
const Group = require("../../schema/Group");

/**
 * جلب جميع الطلاب المفصولين من حلقة معينة عبر البحث في التاريخ
 * @route GET /api/warnings/group/:groupId/expelled-students
 */
exports.getExpelledStudentsFromGroup = async (req, res) => {
  try {
    const { groupId } = req.params;

    // جلب الحلقة
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "الحلقة غير موجودة" });
    }

    // 🔒 التحقق من أن المعلم يملك هذه الحلقة (إلا إذا كان مدير)
    if (req.user.role !== 'admin') {
      const isTeacherOfGroup = group.teacher.toString() === req.user._id.toString();
      
      if (!isTeacherOfGroup) {
        console.warn(`⚠️ Unauthorized access attempt - User: ${req.user._id}, Group: ${groupId}`);
        return res.status(403).json({ 
          message: "غير مصرح لك بالوصول لهذه الحلقة" 
        });
      }
    }

    // البحث في التاريخ عن جميع أحداث الفصل من هذه الحلقة
    const expulsionEvents = await StudentHistory.find({
      eventType: "EXPULSION",
      $or: [
        { groupId: group._id },
        { groupName: group.name }
      ]
    })
      .select("studentId createdAt reason warningLevel teacherName groupName")
      .sort({ createdAt: -1 })
      .lean();

    if (expulsionEvents.length === 0) {
      return res.json({
        group: {
          _id: group._id,
          name: group.name,
        },
        expelledStudents: [],
        count: 0,
      });
    }

    // استخراج معرفات الطلاب الفريدة
    const studentIds = [...new Set(expulsionEvents.map((e) => e.studentId))];

    // جلب بيانات الطلاب
    const students = await Student.find({
      _id: { $in: studentIds }
    })
      .select("_id firstName lastName avatar group")
      .lean();

    // دمج بيانات الطلاب مع آخر حدث فصل لهم
    const studentsMap = new Map(students.map((s) => [s._id.toString(), s]));

    const expelledStudents = expulsionEvents
      .map((event) => {
        const student = studentsMap.get(event.studentId.toString());
        if (!student) return null;

        return {
          _id: student._id,
          firstName: student.firstName,
          lastName: student.lastName,
          avatar: student.avatar,
          currentGroup: student.group, // null إذا كان مفصول حالياً
          expulsionDate: event.createdAt,
          expulsionReason: event.reason,
          warningLevel: event.warningLevel,
          expelledBy: event.teacherName,
          expelledFrom: event.groupName,
        };
      })
      .filter((s) => s !== null);

    // إزالة التكرارات (الاحتفاظ بآخر فصل فقط)
    const uniqueStudents = [];
    const seenStudents = new Set();

    expelledStudents.forEach((student) => {
      const studentId = student._id.toString();
      if (!seenStudents.has(studentId)) {
        seenStudents.add(studentId);
        uniqueStudents.push(student);
      }
    });

    res.json({
      group: {
        _id: group._id,
        name: group.name,
      },
      expelledStudents: uniqueStudents,
      count: uniqueStudents.length,
    });
  } catch (error) {
    console.error("Error fetching expelled students from group:", error);
    res.status(500).json({ message: "حدث خطأ أثناء جلب الطلاب المفصولين" });
  }
};
