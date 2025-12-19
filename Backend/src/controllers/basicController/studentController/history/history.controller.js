// ============================================================================
// studentController/history/history.controller.js - Student History Controller
// ============================================================================

const { getStudentHistory, getStudentHistoryStats } = require("./helpers/queryHistory");
const Student = require("../../../../schema/Student/Student");

/**
 * جلب تاريخ طالب كامل
 * @route GET /api/students/:studentId/history
 */
exports.getStudentCompleteHistory = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { eventType, startDate, endDate, limit } = req.query;

    // التحقق من وجود الطالب
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "الطالب غير موجود" });
    }

    // 🔒 التحقق من الصلاحيات
    if (req.user.role !== 'admin') {
      // المعلم يمكنه رؤية تاريخ طلابه (حتى المفصولين من حلقاته)
      if (req.user.role === 'teacher') {
        const Group = require("../../../../schema/Group");
        const Warning = require("../../../../schema/Warning");
        
        // البحث في الحلقة الحالية
        let hasAccess = false;
        
        if (student.group && student.group !== 'غير محدد') {
          const currentGroup = await Group.findOne({ 
            name: student.group, 
            teacher: req.user._id 
          });
          if (currentGroup) hasAccess = true;
        }
        
        // إذا لم يكن في حلقة حالية، ابحث في الإنذارات (للطلاب المفصولين)
        if (!hasAccess) {
          const warning = await Warning.findOne({
            studentId: studentId,
            teacherId: req.user._id
          });
          if (warning) hasAccess = true;
        }
        
        if (!hasAccess) {
          return res.status(403).json({ 
            message: "غير مصرح لك بعرض تاريخ هذا الطالب" 
          });
        }
      } else {
        // الطالب يمكنه رؤية تاريخه فقط
        if (req.user._id.toString() !== studentId) {
          return res.status(403).json({ 
            message: "غير مصرح لك بعرض هذا التاريخ" 
          });
        }
      }
    }

    // بناء الخيارات
    const options = {};
    if (eventType) options.eventType = eventType;
    if (startDate) options.startDate = new Date(startDate);
    if (endDate) options.endDate = new Date(endDate);
    if (limit) options.limit = parseInt(limit);

    // جلب التاريخ
    const history = await getStudentHistory(studentId, options);

    // جلب الإحصائيات
    const stats = await getStudentHistoryStats(studentId);

    res.json({
      student: {
        _id: student._id,
        firstName: student.firstName,
        lastName: student.lastName,
        group: student.group,
      },
      history,
      stats,
      count: history.length,
    });
  } catch (error) {
    console.error("Error fetching student history:", error);
    res.status(500).json({ message: "حدث خطأ أثناء جلب التاريخ" });
  }
};

/**
 * جلب إحصائيات تاريخ الطالب فقط
 * @route GET /api/students/:studentId/history/stats
 */
exports.getStudentHistoryStatistics = async (req, res) => {
  try {
    const { studentId } = req.params;

    // التحقق من وجود الطالب
    const student = await Student.findById(studentId).select('firstName lastName group');
    if (!student) {
      return res.status(404).json({ message: "الطالب غير موجود" });
    }

    // 🔒 التحقق من الصلاحيات
    if (req.user.role !== 'admin') {
      if (req.user.role === 'teacher') {
        const Group = require("../../../../schema/Group");
        const Warning = require("../../../../schema/Warning");
        
        // البحث في الحلقة الحالية
        let hasAccess = false;
        
        if (student.group && student.group !== 'غير محدد') {
          const currentGroup = await Group.findOne({ 
            name: student.group, 
            teacher: req.user._id 
          });
          if (currentGroup) hasAccess = true;
        }
        
        // إذا لم يكن في حلقة حالية، ابحث في الإنذارات (للطلاب المفصولين)
        if (!hasAccess) {
          const warning = await Warning.findOne({
            studentId: studentId,
            teacherId: req.user._id
          });
          if (warning) hasAccess = true;
        }
        
        if (!hasAccess) {
          return res.status(403).json({ 
            message: "غير مصرح لك بعرض إحصائيات هذا الطالب" 
          });
        }
      } else if (req.user._id.toString() !== studentId) {
        return res.status(403).json({ 
          message: "غير مصرح لك بعرض هذه الإحصائيات" 
        });
      }
    }

    const stats = await getStudentHistoryStats(studentId);

    res.json({
      student: {
        _id: student._id,
        firstName: student.firstName,
        lastName: student.lastName,
        group: student.group,
      },
      stats,
    });
  } catch (error) {
    console.error("Error fetching history stats:", error);
    res.status(500).json({ message: "حدث خطأ أثناء جلب الإحصائيات" });
  }
};
