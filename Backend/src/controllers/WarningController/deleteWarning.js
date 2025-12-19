// ============================================================================
// WarningController/deleteWarning.js - Delete Warning Operations
// ============================================================================

const Warning = require("../../schema/Warning");
const { restoreStudentToGroup } = require("./helpers");
const { invalidateCache } = require("../../middleware/cacheMiddleware");
const { invalidateStudentCountsCache } = require("../basicController/groupController/cache");
const { logRestorationEvent } = require("../basicController/studentController/history/helpers/restorationHistory");

/**
 * حذف إنذار (للمعلم أو المدير)
 * @route DELETE /api/warnings/:warningId
 */
exports.deleteWarning = async (req, res) => {
  try {
    const { warningId } = req.params;

    // جلب الإنذار قبل الحذف للتحقق
    const warning = await Warning.findById(warningId).populate('groupId');

    if (!warning) {
      return res.status(404).json({ message: "الإنذار غير موجود" });
    }

    // 🔒 التحقق من الصلاحيات (إلا إذا كان مدير)
    if (req.user.role !== 'admin') {
      // التحقق من أن المستخدم هو معلم الحلقة
      if (!warning.groupId || warning.groupId.teacher.toString() !== req.user._id.toString()) {
        console.warn(`⚠️ Unauthorized delete attempt - User: ${req.user._id}, Warning: ${warningId}`);
        return res.status(403).json({
          message: "غير مصرح لك بحذف هذا الإنذار"
        });
      }
    }

    // إعادة الطالب للحلقة إذا كان فصل
    const restored = await restoreStudentToGroup(warning);

    // �️ إبطال الكاش إذا تم استعادة الطالب
    if (restored) {
      const teacherId = warning.groupId?.teacher;
      if (teacherId) {
        const cachePattern = `cache:/api/groups/teacher-id/${teacherId}*`;
        await invalidateCache(cachePattern);
        invalidateStudentCountsCache();
      }
    }

    // �📚 تسجيل الإعادة في التاريخ إذا تمت
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
    await Warning.findByIdAndDelete(warningId);

    // 🔔 إرسال إشعار Socket.IO لتحديث الواجهة فوراً
    if (global.io) {
      global.io.emit('warningDeleted', { warningId });
      global.io.emit('warningStatisticsUpdated', { timestamp: new Date() });
      console.log('📡 Socket.IO: Warning deleted event emitted');
    }

    res.json({
      message: "تم حذف الإنذار بنجاح",
      restoredStudent: restored,
    });
  } catch (error) {
    console.error("Error deleting warning:", error);
    res.status(500).json({ message: "حدث خطأ أثناء حذف الإنذار" });
  }
};
