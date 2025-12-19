// ============================================================================
// WarningController/deleteWarningByType.js - Delete Warning by Type
// ============================================================================

const Warning = require("../../schema/Warning");
const { restoreStudentToGroup } = require("./helpers");
const { logRestorationEvent } = require("../basicController/studentController/history/helpers/restorationHistory");

/**
 * حذف إنذار حسب النوع
 * @route DELETE /api/warnings/student/:studentId/type/:warningType
 */
exports.deleteWarningByType = async (req, res) => {
  try {
    const { studentId, warningType } = req.params;

    // البحث عن الإنذار
    const warning = await Warning.findOne({
      studentId,
      type: warningType,
    }).populate('groupId');

    if (!warning) {
      return res.status(404).json({ message: "الإنذار غير موجود" });
    }

    // 🔒 التحقق من الصلاحيات (إلا إذا كان مدير)
    if (req.user.role !== 'admin') {
      // التحقق من أن المستخدم هو معلم الحلقة
      if (!warning.groupId || warning.groupId.teacher.toString() !== req.user._id.toString()) {
        console.warn(`⚠️ Unauthorized delete attempt - User: ${req.user._id}, Student: ${studentId}, Type: ${warningType}`);
        return res.status(403).json({
          message: "غير مصرح لك بحذف هذا الإنذار"
        });
      }
    }

    // إعادة الطالب للحلقة إذا كان فصل
    const restored = await restoreStudentToGroup(warning);

    // 📚 تسجيل الإعادة في التاريخ إذا تمت
    if (restored && restored.restoredTo) {
      logRestorationEvent(
        warning.studentId,
        {
          groupId: warning.groupId._id,
          groupName: warning.groupId.name,
          teacherId: warning.groupId.teacher,
          teacherName: restored.restoredTo
        },
        `إعادة بعد حذف إنذار: ${warning.type}`,
        req.user
      ).catch(err => console.error("❌ History logging error:", err));
    }

    // حذف الإنذار
    await Warning.findByIdAndDelete(warning._id);

    // 🔔 إرسال إشعار Socket.IO لتحديث الواجهة فوراً
    if (global.io) {
      global.io.emit('warningDeleted', { warningId: warning._id });
      global.io.emit('warningStatisticsUpdated', { timestamp: new Date() });
      console.log('📡 Socket.IO: Warning deleted by type event emitted');
    }

    res.json({
      message: "تم حذف الإنذار بنجاح",
      restoredStudent: restored,
    });
  } catch (error) {
    console.error("Error deleting warning by type:", error);
    res.status(500).json({ message: "حدث خطأ أثناء حذف الإنذار" });
  }
};
