// ============================================
// UPDATE TIMETABLE OPERATIONS
// ============================================

const TimeTable = require("../../schema/TimeTable");
const Group = require("../../schema/Group");
const {
  removeTimetableFromGroup,
  updateTimetableInGroup,
  emitSocketEvent,
  checkTimetableConflict,
  checkTeacherTimetableConflict,
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
    const { day, startHour, endHour, note, sessionType, teacherId } = timetableData;

    // احصل على الموعد القديم قبل التحديث
    const oldTimetable = await TimeTable.findById(id);
    if (!oldTimetable) {
      return res.status(404).json({
        success: false,
        error: "Not found",
        message: "لم يتم العثور علموعد",
      });
    }

    // 1. فحص التعارب لجميع حلقات المعلم - الفحص الأساسي والأهم
    // استخدام teacherId من البيانات الجديدة أو القديمة
    const currentTeacherId = teacherId || oldTimetable.teacherId;
    if (currentTeacherId) {
      const teacherConflictCheck = await checkTeacherTimetableConflict(
        currentTeacherId,
        timetableData,
        id
      );
      
      if (teacherConflictCheck.hasConflict) {
        return res.status(409).json({
          success: false,
          error: "Teacher time conflict",
          message: `المعلم لديه موعد آخر في نفس الوقت (${teacherConflictCheck.conflictDetails.note}) يوم ${teacherConflictCheck.conflictDetails.day} من ${teacherConflictCheck.conflictDetails.startHour} إلى ${teacherConflictCheck.conflictDetails.endHour}`,
          conflictDetails: teacherConflictCheck.conflictDetails
        });
      }
    }

    // 2. فحص التعارب مع مواعيد نفس الحلقة (فحص إضافي)
    if (note && note.trim()) {
      const conflictCheck = await checkTimetableConflict(timetableData, id);
      if (conflictCheck.hasConflict) {
        return res.status(409).json({
          success: false,
          error: "Time conflict",
          message: `الحلقة (${note}) لديها موعد آخر في نفس الوقت يوم ${conflictCheck.conflictDetails.day} من ${conflictCheck.conflictDetails.startHour} إلى ${conflictCheck.conflictDetails.endHour}`,
          conflictDetails: conflictCheck.conflictDetails
        });
      }
    }

    // البحث عن groupId الجديد
    let groupId = oldTimetable.groupId;
    if (note && note.trim() && note.trim() !== oldTimetable.note?.trim()) {
      const group = await Group.findOne({ name: note.trim() });
      if (group) {
        groupId = group._id;
      }
    }

    // تحديث الموعد
    const updateData = { day, startHour, endHour, note: note || "", groupId };
    if (sessionType !== undefined) {
      updateData.sessionType = sessionType; // ✅ تحديث sessionType فقط إذا تم إرساله
    }
    if (teacherId !== undefined) {
      updateData.teacherId = teacherId; // ✅ تحديث teacherId فقط إذا تم إرساله
    }
    const timetable = await TimeTable.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    )
      .populate('groupId', 'name')
      .populate('teacherId', 'firstName lastName');

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
    emitSocketEvent(io, "timetableUpdated", { timetable });

    res.json(timetable);
  } catch (err) {
    console.error("Error updating timetable:", err);
    res.status(400).json({
      success: false,
      error: "Invalid data",
      message: err.message || "حدث خطأ أثناء تحديث الموعد",
    });
  }
};
