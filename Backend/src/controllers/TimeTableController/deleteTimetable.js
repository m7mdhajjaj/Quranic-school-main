// ============================================
// DELETE TIMETABLE OPERATIONS
// ============================================

const TimeTable = require("../../schema/TimeTable");
const { removeTimetableFromGroup } = require("./Helper/groupHelpers");

/**
 * حذف موعد
 */
exports.deleteTimetable = async (req, res) => {
  try {
    // ✅ المعلم يمكنه الحذف لحلقاته فقط - يتم التحقق من teacherId لاحقاً

    const { id } = req.params;
    const timetable = await TimeTable.findById(id);

    if (!timetable) {
      return res.status(404).json({
        success: false,
        error: "Not found",
        message: "لم يتم العثور على الموعد",
      });
    }

    // ✅ فحص الصلاحيات: المعلم يمكنه حذف مواعيده فقط (بناءً على teacherId)
    const currentUser = req.user;
    if (currentUser && currentUser.role === 'teacher') {
      console.log(`👨‍🏫 محاولة حذف من المعلم ${currentUser._id} - موعد ${id} - teacherId في الموعد: ${timetable.teacherId}`);
      // التحقق من أن الموعد يخص هذا المعلم
      if (!timetable.teacherId || timetable.teacherId.toString() !== currentUser._id.toString()) {
        console.log(`🚫 محاولة حذف غير مصرح بها: teacherId لا يطابق`);
        return res.status(403).json({
          success: false,
          error: "Forbidden",
          message: "غير مسموح لك بحذف هذا الموعد - يمكنك فقط حذف مواعيدك الخاصة",
        });
      }
      console.log(`✅ الصلاحيات صحيحة - يحذف المعلم موعده الخاص`);
    }

    // إزالة الموعد من جدول الحلقة
    if (timetable.note && timetable.note.trim()) {
      await removeTimetableFromGroup(timetable.note, id);
    }

    // حذف الموعد من قاعدة البيانات
    await TimeTable.findByIdAndDelete(id);

    res.json({ 
      success: true, 
      message: "تم حذف الموعد بنجاح" 
    });
  } catch (err) {
    console.error("Error deleting timetable:", err);
    res.status(400).json({
      success: false,
      error: "Invalid data",
      message: err.message || "حدث خطأ أثناء حذف الموعد",
    });
  }
};
