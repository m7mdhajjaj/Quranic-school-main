// ============================================
// UPDATE TIMETABLE OPERATIONS
// ============================================

const Session = require("../../schema/Session");
const {
  removeTimetableFromGroup,
  updateTimetableInGroup,
  emitSocketEvent,
} = require("./helpers");

/**
 * تحديث موعد
 */
exports.updateTimetable = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log("📝 البيانات الأصلية:", req.body);
    console.log("✅ البيانات المتحقق منها:", req.validatedData);

    const timetableData = req.validatedData || req.body;
    const { day, startHour, endHour, note } = timetableData;

    // احصل على الموعد القديم قبل التحديث
    const oldTimetable = await Session.findById(id);
    if (!oldTimetable) {
      return res.status(404).json({
        error: "Not found",
        message: "لم يتم العثور على الموعد",
      });
    }

    // تحديث الموعد
    const timetable = await Session.findByIdAndUpdate(
      id,
      { day, startHour, endHour, note: note || "" },
      { new: true }
    );

    // إزالة الموعد من جدول الحلقة القديمة
    if (oldTimetable.note && oldTimetable.note.trim()) {
      await removeTimetableFromGroup(oldTimetable.note, id);
    }

    // إضافة/تحديث الموعد في جدول الحلقة الجديدة
    if (note && note.trim()) {
      await updateTimetableInGroup(note, id, { day, startHour, endHour });
    }

    // إرسال حدث Socket
    const io = req.app.get("io");
    emitSocketEvent(io, "sessionUpdated", { session: timetable });

    res.json(timetable);
  } catch (err) {
    console.error("Error updating timetable:", err);
    res.status(400).json({
      error: "Invalid data",
      message: err.message || "حدث خطأ أثناء تحديث الموعد",
    });
  }
};
