// ============================================
// DELETE TIMETABLE OPERATIONS
// ============================================

const TimeTable = require("../../schema/TimeTable");
const { removeTimetableFromGroup, emitSocketEvent } = require("./helpers");

/**
 * حذف موعد
 */
exports.deleteTimetable = async (req, res) => {
  try {
    const { id } = req.params;
    const timetable = await TimeTable.findById(id);

    if (!timetable) {
      return res.status(404).json({
        success: false,
        error: "Not found",
        message: "لم يتم العثور على الموعد",
      });
    }

    // إزالة الموعد من جدول الحلقة
    if (timetable.note && timetable.note.trim()) {
      await removeTimetableFromGroup(timetable.note, id);
    }

    // حذف الموعد من قاعدة البيانات
    await TimeTable.findByIdAndDelete(id);

    // إرسال حدث Socket
    const io = req.app.get("io");
    emitSocketEvent(io, "timetableDeleted", { timetableId: id });

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
