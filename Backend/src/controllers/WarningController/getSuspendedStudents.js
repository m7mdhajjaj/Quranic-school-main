// ============================================================================
// WarningController/getSuspendedStudents.js - Get Suspended Students
// ============================================================================

const Warning = require("../../schema/Warning");
const dayjs = require("dayjs");
const duration = require("dayjs/plugin/duration");
dayjs.extend(duration);

/**
 * الحصول على قائمة الطلاب المفصولين (مؤقت أو دائم)
 * @route GET /api/warnings/suspended-students
 */
exports.getSuspendedStudents = async (req, res) => {
  try {
    const { groupId, type, teacherId } = req.query; // type: 'temporary', 'permanent', or 'all'

    // بناء query للبحث
    let query = {
      isActive: true,
      suspensionType: { $in: ["temporary", "permanent"] },
    };

    // تصفية حسب نوع الفصل
    if (type === "temporary") {
      query.suspensionType = "temporary";
    } else if (type === "permanent") {
      query.suspensionType = "permanent";
    }

    // تصفية حسب الحلقة
    if (groupId) {
      query.groupId = groupId;
    }

    // تصفية حسب المعلم (جلب الطلاب المفصولين من حلقات المعلم)
    if (teacherId) {
      query.teacherId = teacherId;
    }

    // البحث عن الطلاب المفصولين
    const suspendedStudents = await Warning.find(query)
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
    });
  } catch (error) {
    console.error("Error getting suspended students:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء جلب قائمة الطلاب المفصولين",
    });
  }
};

/**
 * الحصول على حالة الفصل لطالب معين
 * @route GET /api/warnings/student-suspension/:studentId
 */
exports.getStudentSuspensionStatus = async (req, res) => {
  try {
    const { studentId } = req.params;

    // البحث عن آخر فصل نشط للطالب
    const activeSuspension = await Warning.findOne({
      studentId,
      isActive: true,
      suspensionType: { $in: ["temporary", "permanent"] },
    })
      .populate("studentId", "firstName lastName username profileImage")
      .populate("teacherId", "firstName lastName")
      .populate("groupId", "name")
      .sort({ createdAt: -1 });

    if (!activeSuspension) {
      return res.status(200).json({
        success: true,
        suspended: false,
        message: "الطالب غير مفصول حالياً",
      });
    }

    // حساب الوقت المتبقي
    let countdown = null;
    let timeRemaining = null;

    if (
      activeSuspension.suspensionType === "temporary" &&
      activeSuspension.endDate
    ) {
      const now = dayjs();
      const end = dayjs(activeSuspension.endDate);
      const diffMs = end.diff(now);

      if (diffMs > 0) {
        const dur = dayjs.duration(diffMs);
        const days = Math.floor(dur.asDays());
        const hours = dur.hours();
        const minutes = dur.minutes();
        const seconds = dur.seconds();

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
      }
    }

    res.status(200).json({
      success: true,
      suspended: true,
      suspension: {
        _id: activeSuspension._id,
        student: activeSuspension.studentId,
        teacher: activeSuspension.teacherId,
        group: activeSuspension.groupId,
        type: activeSuspension.type,
        suspensionType: activeSuspension.suspensionType,
        reason: activeSuspension.reason,
        startDate: activeSuspension.startDate,
        endDate: activeSuspension.endDate,
        countdown,
        timeRemaining,
        penalties: activeSuspension.penalties,
        createdAt: activeSuspension.createdAt,
      },
    });
  } catch (error) {
    console.error("Error getting student suspension status:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء جلب حالة الفصل للطالب",
    });
  }
};
