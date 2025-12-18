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

    // 🔒 التحقق من الصلاحيات (إلا إذا كان مدير)
    if (req.user.role !== 'admin') {
      const isOwnWarnings = req.user._id.toString() === studentId;
      
      // إذا لم يكن الطالب نفسه، تحقق من أنه معلمه
      if (!isOwnWarnings) {
        const Student = require("../../schema/Student");
        const student = await Student.findById(studentId);
        
        if (!student) {
          return res.status(404).json({ message: "الطالب غير موجود" });
        }

        // التحقق من أن المستخدم هو معلم الطالب
        if (req.user.role === 'teacher') {
          const Group = require("../../schema/Group");
          const group = await Group.findOne({ name: student.group });
          
          if (!group || group.teacher.toString() !== req.user._id.toString()) {
            console.warn(`⚠️ Unauthorized access attempt - Teacher: ${req.user._id}, Student: ${studentId}`);
            return res.status(403).json({ 
              message: "غير مصرح لك بعرض إنذارات هذا الطالب" 
            });
          }
        } else {
          return res.status(403).json({ 
            message: "غير مصرح لك بعرض إنذارات هذا الطالب" 
          });
        }
      }
    }

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

    // التحقق من أن المعلم يدرس في هذه الحلقة
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "الحلقة غير موجودة" });
    }

    // 🔒 التحقق من الصلاحيات (إلا إذا كان مدير)
    if (req.user.role !== 'admin') {
      const isTeacherOfGroup = group.teacher.toString() === req.user._id.toString();
      
      if (!isTeacherOfGroup) {
        console.warn(`⚠️ Unauthorized access attempt - User: ${req.user._id}, Group: ${groupId}`);
        return res.status(403).json({
          message: "غير مصرح لك بعرض إنذارات هذه الحلقة",
        });
      }
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
