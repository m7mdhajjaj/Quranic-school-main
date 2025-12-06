// ============================================================================
// WarningController/deleteWarning.js - Delete Warning Operations
// ============================================================================

const Warning = require("../../schema/Warning");
const { restoreStudentToGroup } = require("./helpers");

/**
 * حذف إنذار (للمعلم أو المدير)
 * @route DELETE /api/warnings/:warningId
 */
exports.deleteWarning = async (req, res) => {
  try {
    const { warningId } = req.params;

    // جلب الإنذار قبل الحذف للتحقق
    const warning = await Warning.findById(warningId);

    if (!warning) {
      return res.status(404).json({ message: "الإنذار غير موجود" });
    }

    // إعادة الطالب للحلقة إذا كان فصل
    const restored = await restoreStudentToGroup(warning);

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
