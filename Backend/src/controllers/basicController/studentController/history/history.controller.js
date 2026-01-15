// ============================================================================
// studentController/history/history.controller.js - Student History Controller
// ============================================================================

const { getStudentHistory, getStudentHistoryStats } = require("./helpers/queryHistory");
const Student = require("../../../../schema/Student/Student");
const StudentHistory = require("../../../../schema/Student/StudentHistory");
const Group = require("../../../../schema/Group");

/**
 * جلب الطلاب المفصولين من حلقة معينة عبر البحث في التاريخ
 * @route GET /api/students/history/group/:groupId/expelled
 */
exports.getExpelledStudentsFromGroupHistory = async (req, res) => {
  try {
    const { groupId } = req.params;

    // جلب الحلقة
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "الحلقة غير موجودة" });
    }

    // 🔒 التحقق من أن المعلم يملك هذه الحلقة (إلا إذا كان مدير أو سكرتير)
    if (req.user.role !== 'admin' && req.user.role !== 'secretary') {
      const isTeacherOfGroup = group.teacher.toString() === req.user._id.toString();
      
      if (!isTeacherOfGroup) {
        return res.status(403).json({ 
          message: "غير مصرح لك بالوصول لهذه الحلقة" 
        });
      }
    }

    // البحث في التاريخ عن جميع أحداث الفصل من هذه الحلقة
    // ملاحظة: نستخدم $or للبحث بالـ ID أو الاسم لضمان التوافق مع البيانات القديمة والجديدة
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

    // التحقق من الطلاب الذين تم إرجاعهم (RESTORATION بعد EXPULSION)
    const restorationEvents = await StudentHistory.find({
      eventType: "RESTORATION",
      studentId: { $in: studentIds }
    })
      .select("studentId createdAt")
      .sort({ createdAt: -1 })
      .lean();

    // إنشاء خريطة للطلاب المُرجعين مع تاريخ الإرجاع
    const restoredStudentsMap = new Map();
    restorationEvents.forEach((restoration) => {
      const studentId = restoration.studentId.toString();
      if (!restoredStudentsMap.has(studentId)) {
        restoredStudentsMap.set(studentId, restoration.createdAt);
      }
    });

    // جلب بيانات الطلاب
    const students = await Student.find({
      _id: { $in: studentIds }
    })
      .select("_id firstName lastName avatar group gender")
      .lean();

    // دمج بيانات الطلاب مع آخر حدث فصل لهم
    const studentsMap = new Map(students.map((s) => [s._id.toString(), s]));

    const expelledStudents = expulsionEvents
      .map((event) => {
        const student = studentsMap.get(event.studentId.toString());
        if (!student) return null;

        const studentId = event.studentId.toString();
        const restorationDate = restoredStudentsMap.get(studentId);
        
        // إذا كان هناك حدث إرجاع بعد الفصل، لا نُضيف الطالب للقائمة
        if (restorationDate && new Date(restorationDate) > new Date(event.createdAt)) {
          return null;
        }

        return {
          _id: student._id,
          firstName: student.firstName,
          lastName: student.lastName,
          avatar: student.avatar,
          gender: student.gender,
          currentGroup: student.group, // null إذا كان مفصول حالياً
          expulsionDate: event.createdAt,
          expulsionReason: event.reason,
          warningLevel: event.warningLevel,
          expelledBy: event.teacherName,
          expelledFrom: event.groupName,
        };
      })
      .filter((s) => s !== null);

    // إزالة التكرارات (الاحتفاظ بآخر فصل فقط لكل طالب)
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
    console.error("Error fetching expelled students history:", error);
    res.status(500).json({ message: "حدث خطأ أثناء جلب سجلات الفصل" });
  }
};

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
    // الأدمن والسكرتير لديهم صلاحية كاملة
    if (req.user.role !== 'admin' && req.user.role !== 'secretary') {
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
    // الأدمن والسكرتير لديهم صلاحية كاملة
    if (req.user.role !== 'admin' && req.user.role !== 'secretary') {
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
