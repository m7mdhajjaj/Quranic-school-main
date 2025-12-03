// ============================================================================
// WarningController/createWarning.js - Create Warning Operations
// ============================================================================

const Warning = require("../../schema/Warning");
const Student = require("../../schema/Student");
const Group = require("../../schema/Group");

/**
 * إنشاء إنذار جديد (للمعلم فقط)
 * @route POST /api/warnings
 */
exports.createWarning = async (req, res) => {
  try {
    const { studentId, teacherId, groupId, groupName, type, reason } = req.body;

    // البحث عن الحلقة إما بالـ ID أو بالاسم
    let group;
    if (groupId) {
      group = await Group.findById(groupId);
    } else if (groupName) {
      group = await Group.findOne({ name: groupName });
    }

    if (!group) {
      return res.status(404).json({ message: "الحلقة غير موجودة" });
    }

    // التحقق من أن الطالب موجود
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "الطالب غير موجود" });
    }

    // التحقق من أن الطالب في هذه الحلقة (مقارنة بالاسم)
    if (student.group !== group.name) {
      return res.status(400).json({
        message: "الطالب غير مسجل في هذه الحلقة",
        studentGroup: student.group,
        expectedGroup: group.name,
      });
    }

    // التحقق من عدم وجود إنذار سابق من نفس النوع (ما عدا التنبيه)
    if (type !== "warning") {
      const existingWarning = await Warning.findOne({
        studentId,
        type,
      });

      if (existingWarning) {
        const warningTypeNames = {
          first: "الإنذار الأول",
          second: "الإنذار الثاني",
          third: "الإنذار الثالث",
          expulsion: "الفصل النهائي",
        };

        return res.status(400).json({
          message: `الطالب حاصل على ${warningTypeNames[type]} مسبقاً. لا يمكن إعطاء نفس الإنذار مرتين.`,
          existingWarning: {
            type: existingWarning.type,
            date: existingWarning.createdAt,
            reason: existingWarning.reason,
          },
        });
      }
    }

    // التحقق من تسلسل الإنذارات - يجب أن يكون هناك ترتيب
    if (type !== "warning") {
      const studentWarnings = await Warning.find({ studentId });
      const warningTypes = {
        first: 1,
        second: 2,
        third: 3,
        expulsion: 4
      };

      const currentLevel = warningTypes[type];
      
      // إذا كان إنذار ثاني أو أعلى، تحقق من وجود الإنذار السابق
      if (type === "second") {
        const hasFirst = studentWarnings.some(w => w.type === "first");
        if (!hasFirst) {
          return res.status(400).json({
            message: "لا يمكن إعطاء إنذار ثاني قبل إعطاء الإنذار الأول",
            requiredWarning: "الإنذار الأول"
          });
        }
      }
      
      if (type === "third") {
        const hasFirst = studentWarnings.some(w => w.type === "first");
        const hasSecond = studentWarnings.some(w => w.type === "second");
        if (!hasFirst || !hasSecond) {
          return res.status(400).json({
            message: "لا يمكن إعطاء إنذار ثالث قبل إعطاء الإنذار الأول والثاني",
            requiredWarnings: ["الإنذار الأول", "الإنذار الثاني"]
          });
        }
      }
      
      if (type === "expulsion") {
        const hasFirst = studentWarnings.some(w => w.type === "first");
        const hasSecond = studentWarnings.some(w => w.type === "second");
        const hasThird = studentWarnings.some(w => w.type === "third");
        if (!hasFirst || !hasSecond || !hasThird) {
          return res.status(400).json({
            message: "لا يمكن فصل الطالب قبل إعطائه الإنذارات الثلاثة",
            requiredWarnings: ["الإنذار الأول", "الإنذار الثاني", "الإنذار الثالث"]
          });
        }
      }
    }

    // إنشاء الإنذار
    const warning = new Warning({
      studentId,
      teacherId,
      groupId: group._id, // استخدم الـ ID الحقيقي للحلقة
      type,
      reason,
    });

    await warning.save();

    // إذا كان فصل نهائي، قم بإزالة الطالب من الحلقة
    if (type === "expulsion") {
      student.group = null;
      student.isActive = false;
      await student.save();

      // إزالة الطالب من قائمة طلاب الحلقة إذا كانت موجودة
      if (group.students && Array.isArray(group.students)) {
        group.students = group.students.filter(
          (id) => id.toString() !== studentId
        );
        await group.save();
      }
    }

    // إرجاع الإنذار مع البيانات المرتبطة
    const populatedWarning = await Warning.findById(warning._id)
      .populate("studentId", "firstName lastName")
      .populate("teacherId", "firstName lastName")
      .populate("groupId", "name");

    // إرسال تحديث Socket للمستخدمين المتصلين
    const io = req.app.get("io");
    if (io) {
      io.to("warnings").emit("warningCreated", populatedWarning);
      console.log(`⚠️ Warning created event emitted to warnings room`);
      
      // إرسال تحديث الإحصائيات أيضاً
      io.to("warnings").emit("statisticsUpdated", {
        trigger: "warningCreated",
        timestamp: new Date().toISOString()
      });
      console.log(`📊 Statistics update triggered`);
    }

    res.status(201).json(populatedWarning);
  } catch (error) {
    console.error("Error creating warning:", error);
    res.status(500).json({ message: "حدث خطأ أثناء إنشاء الإنذار" });
  }
};
