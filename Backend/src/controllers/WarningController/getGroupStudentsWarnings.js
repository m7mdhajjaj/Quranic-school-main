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

    // جلب طلاب الحلقة
    const students = await Student.find({ group: group.name })
      .select("_id firstName lastName isActive avatar")
      .lean();

    if (students.length === 0) {
      return res.json({
        _id: group._id,
        name: group.name,
        students: [],
      });
    }

    // جلب جميع الإنذارات للطلاب دفعة واحدة
    const studentIds = students.map((s) => s._id);
    const warnings = await Warning.find({ studentId: { $in: studentIds } })
      .select("studentId type reason createdAt")
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

    // إضافة معلومات الإنذارات لكل طالب
    const studentsWithWarnings = students.map((student) => {
      const studentWarnings = warningsByStudent.get(student._id.toString()) || [];
      
      // استخراج أنواع الإنذارات (ما عدا التنبيه)
      const existingTypes = studentWarnings
        .map((w) => w.type)
        .filter((type) => type !== "warning");

      // حساب عدد التنبيهات فقط
      const warningsOnlyCount = studentWarnings.filter((w) => w.type === "warning").length;

      return {
        _id: student._id,
        firstName: student.firstName,
        lastName: student.lastName,
        isActive: student.isActive || false, // حالة الطالب (أونلاين/أوفلاين)
        avatar: student.avatar, // صورة الطالب
        warningsCount: studentWarnings.length, // إجمالي كل الإنذارات
        warningsOnlyCount, // عدد التنبيهات فقط
        existingWarningTypes: existingTypes,
        allWarnings: studentWarnings,
      };
    });

    res.json({
      _id: group._id,
      name: group.name,
      students: studentsWithWarnings,
    });
  } catch (error) {
    console.error("Error fetching group students with warnings:", error);
    res.status(500).json({ message: "حدث خطأ أثناء جلب بيانات الطلاب" });
  }
};
