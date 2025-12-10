// ============================================
// UPDATE TIMETABLE OPERATIONS
// ============================================

const TimeTable = require("../../schema/TimeTable");
const Group = require("../../schema/Group");
const { removeTimetableFromGroup, updateTimetableInGroup } = require("./Helper/groupHelpers");
const { checkTimetableConflict, checkSessionConflict } = require("./Helper/conflictChecker");

/**
 * تحديث موعد
 */
exports.updateTimetable = async (req, res) => {
  try {
    // ✅ المعلم يمكنه التعديل لحلقاته فقط - يتم التحقق من teacherId لاحقاً

    const { id } = req.params;
    
    console.log("📝 البيانات الأصلية:", req.body);
    console.log("✅ البيانات المتحقق منها:", req.validatedData);

    const timetableData = req.validatedData || req.body;
    const { day, startHour, endHour, note, description, sessionType, teacherId } = timetableData;

    // احصل على الموعد القديم قبل التحديث
    const oldTimetable = await TimeTable.findById(id);
    if (!oldTimetable) {
      return res.status(404).json({
        success: false,
        error: "Not found",
        message: "لم يتم العثور على الموعد",
      });
    }

    // ✅ فحص الصلاحيات: المعلم يمكنه تعديل مواعيده فقط (بناءً على teacherId)
    const currentUser = req.user;
    if (currentUser && currentUser.role === 'teacher') {
      console.log(`👨‍🏫 محاولة تعديل من المعلم ${currentUser._id} - موعد ${id} - teacherId في الموعد: ${oldTimetable.teacherId}`);
      // التحقق من أن الموعد يخص هذا المعلم
      if (!oldTimetable.teacherId || oldTimetable.teacherId.toString() !== currentUser._id.toString()) {
        console.log(`🚫 محاولة تعديل غير مصرح بها: teacherId لا يطابق`);
        return res.status(403).json({
          success: false,
          error: "Forbidden",
          message: "غير مسموح لك بتعديل هذا الموعد - يمكنك فقط تعديل مواعيدك الخاصة",
        });
      }
      console.log(`✅ الصلاحيات صحيحة - يعدّل المعلم موعده الخاص`);
    }

    // 1. فحص التعارب لجميع حلقات المعلم - الفحص الأساسي والأهم
    // استخدام teacherId من البيانات الجديدة أو القديمة
    const currentTeacherId = teacherId || oldTimetable.teacherId;
    if (currentTeacherId) {
      const conflictCheck = await checkSessionConflict(
        currentTeacherId,
        day || oldTimetable.day,
        startHour || oldTimetable.startHour,
        endHour || oldTimetable.endHour,
        id // استثناء الجلسة الحالية
      );
      
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
    if (description !== undefined) {
      updateData.description = description; // ✅ تحديث description فقط إذا تم إرساله
    }
    
    // ✅ منع المعلم من تغيير teacherId (يمكن فقط للإداري تغييره)
    if (teacherId !== undefined) {
      if (currentUser && currentUser.role === 'teacher') {
        // المعلم لا يمكنه تغيير المعلم المسؤول
        if (teacherId !== oldTimetable.teacherId?.toString()) {
          return res.status(403).json({
            success: false,
            error: "Forbidden",
            message: "غير مسموح لك بتغيير المعلم المسؤول عن الموعد",
          });
        }
      } else {
        // الإداري يمكنه تحديث teacherId
        updateData.teacherId = teacherId;
      }
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
