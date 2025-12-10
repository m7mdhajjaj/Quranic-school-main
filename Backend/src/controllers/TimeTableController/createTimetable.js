// ============================================
// CREATE TIMETABLE OPERATIONS
// ============================================

const TimeTable = require("../../schema/TimeTable");
const Group = require("../../schema/Group");
const { addTimetableToGroup } = require("./Helper/groupHelpers");
const { checkTimetableConflict, checkSessionConflict } = require("./Helper/conflictChecker");

/**
 * إضافة موعد جديد
 */
exports.createTimetable = async (req, res) => {
  try {
    const timetableData = req.validatedData || req.body;
    const { day, startHour, endHour, note, description, sessionType, teacherId } = timetableData;

    // ✅ فحص الصلاحيات: المعلم يمكنه إضافة مواعيد لنفسه فقط (بناءً على teacherId)
    const currentUser = req.user;
    if (currentUser && currentUser.role === 'teacher') {
      console.log(`👨‍🏫 محاولة إضافة من المعلم ${currentUser._id} - teacherId في البيانات: ${teacherId}`);
      // التأكد من أن teacherId في البيانات يطابق ID المعلم الحالي
      if (!teacherId || teacherId.toString() !== currentUser._id.toString()) {
        console.log(`🚫 محاولة إضافة غير مصرح بها: teacherId لا يطابق`);
        return res.status(403).json({
          success: false,
          error: "Forbidden",
          message: "غير مسموح لك بإضافة مواعيد لمعلمين آخرين - يمكنك فقط إضافة مواعيدك الخاصة",
        });
      }
      console.log(`✅ الصلاحيات صحيحة - يضيف المعلم موعده الخاص`);
    }

    // 1. فحص التعارب لجميع حلقات المعلم - الفحص الأساسي والأهم
    if (teacherId) {
      const conflictCheck = await checkSessionConflict(teacherId, day, startHour, endHour);
      
      if (conflictCheck.hasConflict) {
        const conflictSession = conflictCheck.conflictingSession;
        return res.status(409).json({
          success: false,
          error: "Teacher time conflict",
          message: `المعلم لديه موعد آخر في نفس الوقت (${conflictSession.note}) يوم ${conflictSession.day} من ${conflictSession.startHour} إلى ${conflictSession.endHour}`,
          conflictDetails: conflictSession
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

    // إنشاء موعد جديد مع groupId و sessionType و teacherId و description
    const timetable = new TimeTable({ 
      day, 
      startHour, 
      endHour, 
      note: note || "",
      description: description || "", // ✅ إضافة حقل الوصف/الملاحظات
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
