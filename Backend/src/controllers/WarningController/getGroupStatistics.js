// ============================================================================
// WarningController/getGroupStatistics.js - Get Group Statistics
// ============================================================================

const Warning = require("../../schema/Warning");
const Group = require("../../schema/Group");
const Student = require("../../schema/Student");
const mongoose = require("mongoose");

/**
 * جلب إحصائيات حلقة معينة
 * @route GET /api/warnings/group/:groupId/statistics
 */
exports.getGroupStatistics = async (req, res) => {
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
          message: "غير مصرح لك بالوصول لإحصائيات هذه الحلقة" 
        });
      }
    }

    // جلب طلاب الحلقة
    const students = await Student.find({ group: group.name })
      .select("_id firstName lastName")
      .lean();

    if (students.length === 0) {
      return res.json({
        groupName: group.name,
        totalStudents: 0,
        studentsWithWarnings: 0,
        totalWarnings: 0,
        expelledStudentsCount: 0, // ✅ إضافة للـ empty state
        warningsByType: {
          warning: 0,
          first: 0,
          second: 0,
          third: 0,
          expulsion: 0,
        },
        topStudents: [],
        studentsDetails: [],
      });
    }

    const studentIds = students.map((s) => s._id);

    // ✅ OPTIMIZED: جلب جميع الإنذارات للطلاب دفعة واحدة
    const warnings = await Warning.find({ studentId: { $in: studentIds } })
      .select("studentId type")
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

    // حساب الإحصائيات
    const warningsByType = {
      warning: 0,
      first: 0,
      second: 0,
      third: 0,
      expulsion: 0,
    };

    let studentsWithWarningsCount = 0;
    const studentsDetails = [];
    const expelledStudentsSet = new Set(); // ✅ لحساب عدد الطلاب المفصولين

    students.forEach((student) => {
      const studentWarnings = warningsByStudent.get(student._id.toString()) || [];
      const warningsCount = studentWarnings.length;

      if (warningsCount > 0) {
        studentsWithWarningsCount++;
      }

      // حساب التنبيهات فقط
      const warningsOnlyCount = studentWarnings.filter((w) => w.type === "warning").length;

      // استخراج أنواع الإنذارات (ما عدا التنبيه)
      const existingTypes = studentWarnings
        .map((w) => w.type)
        .filter((type) => type !== "warning");

      // ✅ تحديد الطلاب المفصولين (unique students)
      const hasExpulsion = studentWarnings.some(w => w.type === "expulsion");
      if (hasExpulsion) {
        expelledStudentsSet.add(student._id.toString());
      }

      // حساب الإنذارات حسب النوع
      studentWarnings.forEach((w) => {
        if (w.type in warningsByType) {
          warningsByType[w.type]++;
        }
      });

      studentsDetails.push({
        _id: student._id,
        name: `${student.firstName} ${student.lastName}`,
        warningsCount,
        warningsOnlyCount,
        existingWarningTypes: existingTypes,
      });
    });

    // ترتيب الطلاب حسب عدد الإنذارات (Top 5)
    const topStudents = studentsDetails
      .filter((s) => s.warningsCount > 0)
      .sort((a, b) => b.warningsCount - a.warningsCount)
      .slice(0, 5)
      .map((s) => ({
        name: s.name,
        warningsCount: s.warningsCount,
      }));

    res.json({
      groupName: group.name,
      totalStudents: students.length,
      studentsWithWarnings: studentsWithWarningsCount,
      totalWarnings: warnings.length,
      expelledStudentsCount: expelledStudentsSet.size, // ✅ عدد الطلاب المفصولين (unique)
      warningsByType,
      topStudents,
      studentsDetails,
    });
  } catch (error) {
    console.error("Error fetching group statistics:", error);
    res.status(500).json({ message: "حدث خطأ أثناء جلب إحصائيات الحلقة" });
  }
};
