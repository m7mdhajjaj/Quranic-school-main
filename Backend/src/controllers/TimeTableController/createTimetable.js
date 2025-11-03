// ============================================
// CREATE TIMETABLE OPERATIONS
// ============================================

const Session = require("../../schema/Session");
const { addTimetableToGroup, emitSocketEvent } = require("./helpers");

/**
 * إضافة موعد جديد
 */
exports.createTimetable = async (req, res) => {
  try {
    console.log("📝 البيانات الأصلية:", req.body);
    console.log("✅ البيانات المتحقق منها:", req.validatedData);

    const timetableData = req.validatedData || req.body;
    const { day, startHour, endHour, note } = timetableData;

    // إنشاء موعد جديد
    const timetable = new Session({ 
      day, 
      startHour, 
      endHour, 
      note: note || "" 
    });
    await timetable.save();

    // إضافة الموعد إلى جدول الحلقة إذا كان هناك اسم حلقة
    if (note && note.trim()) {
      await addTimetableToGroup(note, {
        day,
        startHour,
        endHour,
        sessionId: timetable._id,
      });
    }

    // إرسال حدث Socket
    const io = req.app.get("io");
    emitSocketEvent(io, "sessionCreated", { session: timetable });

    res.status(201).json(timetable);
  } catch (err) {
    console.error("Error creating timetable:", err);
    res.status(400).json({
      error: "Invalid data",
      message: err.message || "حدث خطأ أثناء إضافة الموعد",
    });
  }
};
