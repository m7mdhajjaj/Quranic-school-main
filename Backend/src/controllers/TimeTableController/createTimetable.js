// ============================================
// CREATE TIMETABLE OPERATIONS
// ============================================

const TimeTable = require("../../schema/TimeTable");
const Group = require("../../schema/Group");
const { 
  addTimetableToGroup, 
  emitSocketEvent,
  checkTimetableConflict,
  checkTeacherTimetableConflict
} = require("./helpers");

/**
 * إضافة موعد جديد
 */
exports.createTimetable = async (req, res) => {
  try {
    const timetableData = req.validatedData || req.body;
    const { day, startHour, endHour, note, sessionType, teacherId } = timetableData;

    // 1. فحص التعارب لجميع حلقات المعلم - الفحص الأساسي والأهم
    if (teacherId) {
      const teacherConflictCheck = await checkTeacherTimetableConflict(
        teacherId,
        timetableData
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
      const conflictCheck = await checkTimetableConflict(timetableData);
      if (conflictCheck.hasConflict) {
        return res.status(409).json({
          success: false,
          error: "Time conflict",
          message: `الحلقة (${note}) لديها موعد آخر في نفس الوقت يوم ${conflictCheck.conflictDetails.day} من ${conflictCheck.conflictDetails.startHour} إلى ${conflictCheck.conflictDetails.endHour}`,
          conflictDetails: conflictCheck.conflictDetails
        });
      }
    }

    // البحث عن الحلقة للحصول على groupId
    let groupId = null;
    if (note && note.trim()) {
      const group = await Group.findOne({ name: note.trim() });
      if (group) {
        groupId = group._id;
      }
    }

    // إنشاء موعد جديد مع groupId و sessionType و teacherId
    const timetable = new TimeTable({ 
      day, 
      startHour, 
      endHour, 
      note: note || "",
      groupId,
      teacherId, // ✅ معرف المعلم مطلوب
      sessionType: sessionType || undefined // ✅ إضافة sessionType إذا كان موجود
    });
    await timetable.save();

    // إضافة الموعد إلى جدول الحلقة إذا كان هناك اسم حلقة
    if (note && note.trim() && groupId) {
      await addTimetableToGroup(note, {
        day,
        startHour,
        endHour,
        timetableId: timetable._id,
      });
    }

    // جلب الموعد مع populate لبيانات المعلم
    const populatedTimetable = await TimeTable.findById(timetable._id)
      .populate('groupId', 'name')
      .populate('teacherId', 'firstName lastName');

    // إرسال حدث Socket
    const io = req.app.get("io");
    emitSocketEvent(io, "timetableCreated", { timetable: populatedTimetable });

    res.status(201).json(populatedTimetable);
  } catch (err) {
    console.error("Error creating timetable:", err);
    res.status(400).json({
      success: false,
      error: "Invalid data",
      message: err.message || "حدث خطأ أثناء إضافة الموعد",
    });
  }
};
