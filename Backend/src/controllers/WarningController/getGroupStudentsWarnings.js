// ============================================================================
// WarningController/getGroupStudentsWarnings.js - Get Group Students with Warnings
// ============================================================================

const Warning = require("../../schema/Warning");
const Group = require("../../schema/Group");
const Student = require("../../schema/Student");

/**
 * جلب طلاب الحلقة مع تفاصيل إنذاراتهم الكاملة
 * @route GET /api/warnings/group/:groupId/students-with-warnings
 */
exports.getGroupWithStudentsWarnings = async (req, res) => {
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

    // جلب طلاب الحلقة النشطين
    const activeStudents = await Student.find({ group: group.name })
      .select("_id firstName lastName avatar")
      .lean();

    // جلب الطلاب المفصولين من هذه الحلقة بالتحديد (originalGroup)
    // ✅ فقط الإنذارات النشطة (status: "active") تُعتبر فصل فعلي
    const expulsionWarnings = await Warning.find({
      originalGroup: group.name,
      type: { $in: ["third", "expulsion"] },
      status: "active"
    })
      .select("studentId")
      .lean();

    const expelledStudentIds = expulsionWarnings.map((w) => w.studentId);

    // جلب بيانات الطلاب المفصولين
    const expelledStudents = await Student.find({
      _id: { $in: expelledStudentIds },
      group: null // التأكد من أنهم فعلاً مفصولين (group = null)
    })
      .select("_id firstName lastName avatar")
      .lean();

    // دمج الطلاب النشطين والمفصولين
    const students = [...activeStudents, ...expelledStudents];

    if (students.length === 0) {
      return res.json({
        _id: group._id,
        name: group.name,
        students: [],
        suspendedStudents: [],
      });
    }

    // ✅ OPTIMIZED: جلب جميع الإنذارات النشطة دفعة واحدة
    const studentIds = students.map((s) => s._id);
    const warnings = await Warning.find({ 
      studentId: { $in: studentIds },
      status: "active" // فقط الإنذارات النشطة
    })
      .select("studentId type reason createdAt status")
      .lean();

    // تجميع الإنذارات حسب الطالب
    const warningsByStudent = new Map();
    warnings.forEach((warning) => {
      const studentId = warning.studentId.toString();
      if (!warningsByStudent.has(studentId)) {
        warningsByStudent.set(studentId, []);
      }
      warningsByStudent.get(studentId).push(warning);
    });

    // إضافة معلومات الإنذارات لكل طالب وتحديد الطلاب المفصولين
    const studentsWithWarnings = [];
    const suspendedStudents = [];

    students.forEach((student) => {
      const studentWarnings = warningsByStudent.get(student._id.toString()) || [];
      
      // استخراج أنواع الإنذارات (ما عدا التنبيه)
      const existingTypes = studentWarnings
        .map((w) => w.type)
        .filter((type) => type !== "warning");

      // حساب عدد التنبيهات فقط
      const warningsOnlyCount = studentWarnings.filter((w) => w.type === "warning").length;

      // التحقق إذا كان الطالب مفصول (has active "third" or "expulsion" warning)
      const isSuspended = studentWarnings.some(w => 
        (w.type === "third" || w.type === "expulsion") && 
        w.status === "active"
      );

      const studentData = {
        _id: student._id,
        firstName: student.firstName,
        lastName: student.lastName,
        // ✅ isActive removed - use PresenceService on frontend for online status
        avatar: student.avatar, // صورة الطالب
        warningsCount: studentWarnings.length, // إجمالي كل الإنذارات
        warningsOnlyCount, // عدد التنبيهات فقط
        existingWarningTypes: existingTypes,
        allWarnings: studentWarnings,
      };

      // تقسيم الطلاب: المفصولين vs العاديين
      if (isSuspended) {
        suspendedStudents.push(studentData);
      } else {
        studentsWithWarnings.push(studentData);
      }
    });

    res.json({
      _id: group._id,
      name: group.name,
      students: studentsWithWarnings,
      suspendedStudents: suspendedStudents,
      currentStudents: studentsWithWarnings.length,
      totalStudents: students.length,
    });
  } catch (error) {
    console.error("Error fetching group students with warnings:", error);
    res.status(500).json({ message: "حدث خطأ أثناء جلب بيانات الطلاب" });
  }
};
