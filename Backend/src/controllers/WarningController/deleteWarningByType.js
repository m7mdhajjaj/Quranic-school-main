// ============================================================================
// WarningController/deleteWarningByType.js - Delete Warning by Type
// ============================================================================

const Warning = require("../../schema/Warning");
const { restoreStudentToGroup } = require("./helpers");

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
    });

    if (!warning) {
      return res.status(404).json({ message: "الإنذار غير موجود" });
    }

    // إعادة الطالب للحلقة إذا كان فصل
    const restored = await restoreStudentToGroup(warning);

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
