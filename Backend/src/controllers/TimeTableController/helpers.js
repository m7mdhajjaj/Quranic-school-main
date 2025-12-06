// ============================================
// TIMETABLE HELPERS
// ============================================

const Group = require("../../schema/Group");

/**
 * إضافة موعد إلى جدول الحلقة
 */
const addTimetableToGroup = async (groupName, timetableData) => {
  try {
    if (!groupName || !groupName.trim()) {
      console.log("⚠️ لا يوجد اسم حلقة محدد");
      return false;
    }

    const group = await Group.findOne({ name: groupName.trim() });
    if (!group) {
      console.log(`⚠️ لم يتم العثور على حلقة باسم: ${groupName}`);
      return false;
    }

    // تحقق من عدم وجود نفس الموعد مسبقاً
    const existingTimetable = group.timetable || [];
    const alreadyExists = existingTimetable.some(
      (t) =>
        t.day === timetableData.day &&
        t.startHour === timetableData.startHour &&
        t.endHour === timetableData.endHour
    );

    if (alreadyExists) {
      console.log(`ℹ️ الموعد موجود بالفعل في جدول الحلقة: ${groupName}`);
      return false;
    }

    // أضف الموعد إلى جدول الحلقة
    group.timetable = group.timetable || [];
    group.timetable.push({
      day: timetableData.day,
      startHour: timetableData.startHour,
      endHour: timetableData.endHour,
      timetableId: timetableData.timetableId,
    });

    await group.save();
    console.log(`✅ تمت إضافة الموعد تلقائياً إلى جدول الحلقة: ${groupName}`);
    return true;
  } catch (error) {
    console.error("خطأ في إضافة الموعد إلى جدول الحلقة:", error);
    return false;
  }
};

/**
 * إزالة موعد من جدول الحلقة
 */
const removeTimetableFromGroup = async (groupName, sessionId) => {
  try {
    if (!groupName || !groupName.trim()) {
      return false;
    }

    const group = await Group.findOne({ name: groupName.trim() });
    if (!group) {
      return false;
    }

    group.timetable =
      group.timetable?.filter(
        (t) => t.sessionId?.toString() !== sessionId.toString()
      ) || [];

    await group.save();
    console.log(`🗑️ تمت إزالة الموعد من جدول الحلقة: ${groupName}`);
    return true;
  } catch (error) {
    console.error("خطأ في إزالة الموعد من جدول الحلقة:", error);
    return false;
  }
};

/**
 * تحديث موعد في جدول الحلقة
 */
const updateTimetableInGroup = async (groupName, sessionId, sessionData) => {
  try {
    if (!groupName || !groupName.trim()) {
      return false;
    }

    const group = await Group.findOne({ name: groupName.trim() });
    if (!group) {
      return false;
    }

    // تحقق من وجود الموعد
    const timetableIndex = group.timetable?.findIndex(
      (t) => t.sessionId?.toString() === sessionId.toString()
    );

    if (timetableIndex === -1 || timetableIndex === undefined) {
      // إضافة موعد جديد إذا لم يكن موجوداً
      group.timetable = group.timetable || [];
      group.timetable.push({
        day: sessionData.day,
        startHour: sessionData.startHour,
        endHour: sessionData.endHour,
        sessionId: sessionId,
      });
      console.log(`✅ تمت إضافة الموعد المحدث إلى جدول الحلقة: ${groupName}`);
    } else {
      // تحديث الموعد الموجود
      group.timetable[timetableIndex] = {
        day: sessionData.day,
        startHour: sessionData.startHour,
        endHour: sessionData.endHour,
        sessionId: sessionId,
      };
      console.log(`🔄 تم تحديث الموعد في جدول الحلقة: ${groupName}`);
    }

    await group.save();
    return true;
  } catch (error) {
    console.error("خطأ في تحديث جدول الحلقة:", error);
    return false;
  }
};

/**
 * إرسال حدث Socket
 */
const emitSocketEvent = (io, eventName, data) => {
  if (io) {
    io.to("sessions").emit(eventName, {
      ...data,
      timestamp: Date.now(),
    });
    console.log(`✅ ${eventName} event emitted to sessions room`);
  }
};

/**
 * تحويل الوقت إلى دقائق للمقارنة (يدعم صيغة 12-hour مع AM/PM)
 * النطاق الزمني: من 12:00 PM (الظهر) إلى 9:00 AM (الصباح)
 * جميع الأوقات في نفس اليوم
 */
const timeToMinutes = (timeStr) => {
  if (!timeStr) return 0;
  
  // إزالة المسافات وتحويل لصيغة موحدة
  const cleanTime = timeStr.trim().toLowerCase();
  
  // استخراج الساعات والدقائق
  const timePart = cleanTime.replace(/\s*(am|pm)\s*/i, '');
  const [hours, minutes] = timePart.split(':').map(v => parseInt(v) || 0);
  
  // التحقق من AM أو PM
  const isPM = cleanTime.includes('pm');
  const isAM = cleanTime.includes('am');
  
  let totalHours = hours;
  
  if (isPM && hours !== 12) {
    // PM: أضف 12 ساعة (ما عدا 12 PM)
    totalHours = hours + 12;
  } else if (isAM && hours === 12) {
    // 12 AM = 0 (منتصف الليل)
    totalHours = 0;
  } else if (isPM && hours === 12) {
    // 12 PM = 12 (الظهر - بداية النطاق)
    totalHours = 12;
  }
  // AM (1-11) يبقى كما هو
  
  const totalMinutes = totalHours * 60 + minutes;
  
  return totalMinutes;
};

/**
 * فحص التعارب بين موعدين
 */
const hasTimeConflict = (start1, end1, start2, end2) => {
  const s1 = timeToMinutes(start1);
  const e1 = timeToMinutes(end1);
  const s2 = timeToMinutes(start2);
  const e2 = timeToMinutes(end2);
  
  console.log("⏰ فحص التعارب الزمني:", {
    موعد1: `${start1} (${s1} دقيقة) - ${end1} (${e1} دقيقة)`,
    موعد2: `${start2} (${s2} دقيقة) - ${end2} (${e2} دقيقة)`
  });
  
  // يوجد تعارب إذا كان:
  // - بداية الموعد الأول قبل نهاية الموعد الثاني
  // - نهاية الموعد الأول بعد بداية الموعد الثاني
  const hasConflict = s1 < e2 && e1 > s2;
  
  console.log(`📊 النتيجة: ${hasConflict ? '❌ يوجد تعارب' : '✅ لا يوجد تعارب'}`);
  
  return hasConflict;
};

/**
 * فحص التعارب مع المواعيد الموجودة
 * @param {Object} timetableData - بيانات الموعد الجديد
 * @param {String} currentTimetableId - معرف الموعد الحالي (للتحديث)
 * @returns {Promise<Object>} - {hasConflict: boolean, conflictDetails: Object}
 */
const checkTimetableConflict = async (timetableData, currentTimetableId = null) => {
  try {
    const TimeTable = require("../../schema/TimeTable");
    const { day, startHour, endHour, note } = timetableData;

    console.log("🔍 فحص التعارب للحلقة:", { day, startHour, endHour, note });

    // البحث عن جميع المواعيد في نفس اليوم
    const existingTimetables = await TimeTable.find({ day });
    console.log("📋 عدد المواعيد الموجودة في نفس اليوم:", existingTimetables.length);

    for (const existing of existingTimetables) {
      // تجاهل الموعد الحالي عند التحديث
      if (currentTimetableId && existing._id.toString() === currentTimetableId.toString()) {
        console.log("⏭️ تجاهل الموعد الحالي");
        continue;
      }

      // فحص التعارب فقط مع مواعيد نفس الحلقة (note)
      // إذا كان note فارغ، لا نفحص التعارب (مواعيد عامة)
      if (!note || !note.trim() || !existing.note || !existing.note.trim()) {
        console.log("⏭️ تجاهل موعد بدون حلقة");
        continue;
      }

      console.log("🔎 مقارنة مع موعد موجود:", { 
        existingNote: existing.note, 
        existingTime: `${existing.startHour} - ${existing.endHour}` 
      });

      // التحقق من التطابق في الحلقة
      if (existing.note.trim() === note.trim()) {
        console.log("✅ نفس الحلقة - فحص التعارب الزمني");
        const conflict = hasTimeConflict(startHour, endHour, existing.startHour, existing.endHour);
        console.log("⏰ نتيجة فحص التعارب:", conflict);
        
        if (conflict) {
          console.log("❌ يوجد تعارب!");
          return {
            hasConflict: true,
            conflictDetails: {
              day: existing.day,
              startHour: existing.startHour,
              endHour: existing.endHour,
              note: existing.note,
              timetableId: existing._id
            }
          };
        }
      }
    }

    console.log("✅ لا يوجد تعارض");
    return { hasConflict: false };
  } catch (error) {
    console.error("خطأ في فحص التعارب:", error);
    throw error;
  }
};

/**
 * فحص التعارب لجميع حلقات المعلم
 * @param {String} teacherId - معرف المعلم
 * @param {Object} timetableData - بيانات الموعد الجديد
 * @param {String} currentTimetableId - معرف الموعد الحالي (للتحديث)
 * @returns {Promise<Object>} - {hasConflict: boolean, conflictDetails: Object}
 */
const checkTeacherTimetableConflict = async (teacherId, timetableData, currentTimetableId = null) => {
  try {
    const TimeTable = require("../../schema/TimeTable");
    const { day, startHour, endHour } = timetableData;

    // البحث عن جميع مواعيد المعلم في نفس اليوم
    const existingTimetables = await TimeTable.find({
      day,
      teacherId: teacherId
    });

    for (const existing of existingTimetables) {
      // تجاهل الموعد الحالي عند التحديث
      if (currentTimetableId && existing._id.toString() === currentTimetableId.toString()) {
        continue;
      }

      // فحص التعارب الزمني
      if (hasTimeConflict(startHour, endHour, existing.startHour, existing.endHour)) {
        return {
          hasConflict: true,
          conflictDetails: {
            day: existing.day,
            startHour: existing.startHour,
            endHour: existing.endHour,
            note: existing.note || 'موعد بدون حلقة',
            timetableId: existing._id
          }
        };
      }
    }

    return { hasConflict: false };
  } catch (error) {
    console.error("خطأ في فحص تعارب حلقات المعلم:", error);
    throw error;
  }
};

module.exports = {
  addTimetableToGroup,
  removeTimetableFromGroup,
  updateTimetableInGroup,
  emitSocketEvent,
  checkTimetableConflict,
  checkTeacherTimetableConflict,
  hasTimeConflict,
  timeToMinutes,
};
