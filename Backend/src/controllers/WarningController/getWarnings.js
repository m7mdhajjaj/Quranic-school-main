// ============================================================================
// WarningController/getWarnings.js - Get Warning Operations
// ============================================================================

const Warning = require("../../schema/Warning");
const Group = require("../../schema/Group");

/**
 * جلب إنذارات طالب معين
 * @route GET /api/warnings/student/:studentId
 */
exports.getStudentWarnings = async (req, res) => {
  try {
    const { studentId } = req.params;

    const warnings = await Warning.find({ studentId })
      .populate("studentId", "firstName lastName")
      .populate("teacherId", "firstName lastName")
      .populate("groupId", "name")
      .sort({ createdAt: -1 });

    res.json(warnings);
  } catch (error) {
    console.error("Error fetching student warnings:", error);
    res.status(500).json({ message: "حدث خطأ أثناء جلب الإنذارات" });
  }
};

/**
 * جلب إنذارات حلقة معينة (للمعلم فقط)
 * @route GET /api/warnings/group/:groupId
 */
exports.getGroupWarnings = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { teacherId } = req.query;

    // التحقق من أن المعلم يدرس في هذه الحلقة
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "الحلقة غير موجودة" });
    }

    if (teacherId && group.teacher.toString() !== teacherId) {
      return res.status(403).json({
        message: "غير مصرح لك بعرض إنذارات هذه الحلقة",
      });
    }

    const warnings = await Warning.find({ groupId })
      .populate("studentId", "firstName lastName")
      .populate("teacherId", "firstName lastName")
      .populate("groupId", "name")
      .sort({ createdAt: -1 });

    res.json(warnings);
  } catch (error) {
    console.error("Error fetching group warnings:", error);
    res.status(500).json({ message: "حدث خطأ أثناء جلب الإنذارات" });
  }
};

/**
 * جلب طلاب الحلقة مع عدد الإنذارات
 * @route GET /api/warnings/group/:groupId/students
 */
exports.getGroupStudentsWithWarnings = async (req, res) => {
  try {
    const { groupId } = req.params;

    const group = await Group.findById(groupId).populate(
      "students",
      "firstName lastName"
    );

    if (!group) {
      return res.status(404).json({ message: "الحلقة غير موجودة" });
    }

    // جلب عدد الإنذارات لكل طالب
    const studentsWithWarnings = await Promise.all(
      group.students.map(async (student) => {
        const warningsCount = await Warning.countDocuments({
          studentId: student._id,
        });

        return {
          _id: student._id,
          firstName: student.firstName,
          lastName: student.lastName,
          warningsCount,
        };
      })
    );

    res.json(studentsWithWarnings);
  } catch (error) {
    console.error("Error fetching students with warnings:", error);
    res.status(500).json({ message: "حدث خطأ أثناء جلب الطلاب" });
  }
};
