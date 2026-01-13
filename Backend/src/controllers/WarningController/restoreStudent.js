// ============================================================================
// WarningController/restoreStudent.js - Restore Student Functionality
// ============================================================================

const Warning = require("../../schema/Warning");
const Student = require("../../schema/Student/Student");
const Group = require("../../schema/Group");
const StudentHistory = require("../../schema/Student/StudentHistory");
const { cache } = require("../../utils/cache/cacheClient");

/**
 * إعادة طالب مفصول إلى حلقة (نفس الحلقة أو جديدة)
 * Changes Warning status -> 'inactive'
 * Updates Student -> group: targetGroup
 * Logs to StudentHistory
 * 
 * @route POST /api/warnings/restore
 */
exports.restoreStudentToGroup = async (req, res) => {
  try {
    const { studentId, targetGroupId, reason, adminId } = req.body;

    // 1. التحقق من وجود الحلقة المستهدفة
    const group = await Group.findById(targetGroupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: "الحلقة غير موجودة",
      });
    }

    // 2. التحقق من الطالب
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "الطالب غير موجود",
      });
    }

    // 3. العثور على الإنذار النشط (فصل) وتحديثه
    // نبحث عن أي إنذار نشط من نوع فصل أو إنذار ثالث أدى للفصل
    const activeWarning = await Warning.findOne({
      studentId: studentId,
      status: "active",
      type: { $in: ["expulsion", "third"] }
    });

    if (activeWarning) {
      activeWarning.status = "inactive";
      await activeWarning.save();
    }

    // 4. تحديث حالة الطالب وإعادته للحلقة
    const oldGroup = student.group; // المفترض أن يكون null أو الحلقة القديمة
    student.group = group.name;
    await student.save();

    // 5. تسجيل في السجل (History)
    await StudentHistory.create({
      studentId: studentId,
      eventType: "RESTORATION",
      actionBy: req.user._id, // مشرف
      details: {
        reason: reason || "إعادة بقرار إداري",
        previousGroup: oldGroup || "مفصول",
        newGroup: group.name,
        relatedWarningId: activeWarning ? activeWarning._id : null
      },
      metadata: {
        adminId: req.user._id,
        targetGroupId,
      }
    });

    // 6. مسح الكاش المرتبط
    // (اختياري: نمسح كاش الحلقة وكاش الطالب)
    await cache.delPattern(`cache:/api/groups/${targetGroupId}*`);
    if(oldGroup) await cache.delPattern(`cache:/api/groups*`); // General cleanup

    return res.status(200).json({
      success: true,
      message: "تمت إعادة الطالب للحلقة بنجاح، وإلغاء تفعيل الإنذار السابق",
      data: {
        studentName: `${student.firstName} ${student.lastName}`,
        newGroup: group.name
      }
    });

  } catch (error) {
    console.error("Error in restoreStudentToGroup:", error);
    return res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء استعادة الطالب",
      error: error.message,
    });
  }
};
