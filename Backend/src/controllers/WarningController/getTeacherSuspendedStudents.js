// ============================================================================
// WarningController/getTeacherSuspendedStudents.js - Get Teacher's Suspended Students
// ============================================================================

const Warning = require("../../schema/Warning");
const Group = require("../../schema/Group");
const dayjs = require("dayjs");
const duration = require("dayjs/plugin/duration");
dayjs.extend(duration);

/**
 * الحصول على قائمة الطلاب المفصولين من حلقات المعلم
 * @route GET /api/warnings/teacher/suspended-students
 */
exports.getTeacherSuspendedStudents = async (req, res) => {
  try {
    const { teacherId } = req.query;

    if (!teacherId) {
      return res.status(400).json({
        success: false,
        message: "معرف المعلم مطلوب",
      });
    }

    // جلب حلقات المعلم
    const teacherGroups = await Group.find({ teacherId }).select("_id name");

    if (!teacherGroups || teacherGroups.length === 0) {
      return res.status(200).json({
        success: true,
        total: 0,
        temporary: { count: 0, students: [] },
        permanent: { count: 0, students: [] },
        all: [],
        message: "لا يوجد حلقات لهذا المعلم",
      });
    }

    const groupIds = teacherGroups.map((g) => g._id);

    // البحث عن الطلاب المفصولين من حلقات المعلم
    // استخدام originalGroup بدل groupId لأن الطالب المفصول group = null
    const suspendedStudents = await Warning.find({
      isActive: true,
      suspensionType: { $in: ["temporary", "permanent"] },
      originalGroup: { $in: groupIds }, // استخدام originalGroup بدلاً من groupId
    })
      .populate("studentId", "firstName lastName username profileImage")
      .populate("teacherId", "firstName lastName")
      .populate("groupId", "name")
      .sort({ createdAt: -1 });

    // حساب الوقت المتبقي لكل طالب مفصول مؤقتاً
    const studentsWithCountdown = suspendedStudents.map((warning) => {
      let countdown = null;
      let timeRemaining = null;

      if (warning.suspensionType === "temporary" && warning.endDate) {
        const now = dayjs();
        const end = dayjs(warning.endDate);
        const diffMs = end.diff(now);

        if (diffMs > 0) {
          const dur = dayjs.duration(diffMs);
          const days = Math.floor(dur.asDays());
          const hours = dur.hours();
          const minutes = dur.minutes();
          const seconds = dur.seconds();

          // تنسيق العداد
          if (days > 0) {
            countdown = `${days}d ${String(hours).padStart(2, "0")}h ${String(
              minutes
            ).padStart(2, "0")}m ${String(seconds).padStart(2, "0")}s`;
          } else {
            countdown = `${String(hours).padStart(2, "0")}:${String(
              minutes
            ).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
          }

          timeRemaining = {
            days,
            hours,
            minutes,
            seconds,
            totalMilliseconds: diffMs,
          };
        } else {
          countdown = "منتهي";
          timeRemaining = {
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: 0,
            totalMilliseconds: 0,
          };
        }
      }

      return {
        _id: warning._id,
        student: warning.studentId,
        teacher: warning.teacherId,
        group: warning.groupId,
        originalGroup: warning.originalGroup, // الحلقة الأصلية
        type: warning.type,
        suspensionType: warning.suspensionType,
        reason: warning.reason,
        startDate: warning.startDate,
        endDate: warning.endDate,
        isActive: warning.isActive,
        countdown,
        timeRemaining,
        penalties: warning.penalties,
        createdAt: warning.createdAt,
      };
    });

    // تصنيف الطلاب
    const temporary = studentsWithCountdown.filter(
      (s) => s.suspensionType === "temporary"
    );
    const permanent = studentsWithCountdown.filter(
      (s) => s.suspensionType === "permanent"
    );

    res.status(200).json({
      success: true,
      total: studentsWithCountdown.length,
      temporary: {
        count: temporary.length,
        students: temporary,
      },
      permanent: {
        count: permanent.length,
        students: permanent,
      },
      all: studentsWithCountdown,
      teacherGroups: teacherGroups.map((g) => ({ _id: g._id, name: g.name })),
    });
  } catch (error) {
    console.error("Error getting teacher's suspended students:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء جلب قائمة الطلاب المفصولين",
    });
  }
};
