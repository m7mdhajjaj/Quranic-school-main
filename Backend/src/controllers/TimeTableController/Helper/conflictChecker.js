// ============================================================================
// CONFLICT CHECKER - فحص التضارب في المواعيد
// ============================================================================

const TimeTable = require("../../../schema/TimeTable");
const { timeToMinutes } = require("./timeHelpers");

/**
 * فحص التعارب بين موعدين
 * يعمل مع كل من التوقيت الصيفي (12 PM - 9 PM) والشتوي (11 AM - 8 PM)
 * 
 * @param {String} start1 - وقت البداية للموعد الأول
 * @param {String} end1 - وقت النهاية للموعد الأول
 * @param {String} start2 - وقت البداية للموعد الثاني
 * @param {String} end2 - وقت النهاية للموعد الثاني
 * @returns {Boolean} - true إذا كان هناك تعارب
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
  
  // يوجد تعارب إذا كان هناك تداخل زمني:
  // - بداية الموعد الأول أقل من نهاية الموعد الثاني
  // - نهاية الموعد الأول أكبر من بداية الموعد الثاني
  const hasConflict = s1 < e2 && e1 > s2;
  
  console.log(`📊 النتيجة: ${hasConflict ? '❌ يوجد تعارب' : '✅ لا يوجد تعارب'}`);
  
  return hasConflict;
};

/**
 * فحص التعارب مع المواعيد الموجودة لنفس الحلقة
 * @param {Object} timetableData - بيانات الموعد الجديد
 * @param {String} currentTimetableId - معرف الموعد الحالي (للتحديث)
 * @returns {Promise<Object>} - {hasConflict: boolean, conflictDetails: Object}
 */
const checkTimetableConflict = async (timetableData, currentTimetableId = null) => {
  try {
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
 * @param {String} day - اليوم
 * @param {String} startHour - وقت البداية
 * @param {String} endHour - وقت النهاية
 * @param {String} currentTimetableId - معرف الموعد الحالي (للتحديث)
 * @returns {Promise<Object>} - {hasConflict: boolean, conflictDetails: Object}
 */
const checkTeacherTimetableConflict = async (teacherId, day, startHour, endHour, currentTimetableId = null) => {
  try {
    console.log(`🔍 فحص تعارب حلقات المعلم ${teacherId} في ${day} من ${startHour} إلى ${endHour}`);

    // البحث عن جميع مواعيد المعلم في نفس اليوم
    const existingTimetables = await TimeTable.find({
      day,
      teacherId: teacherId
    });

    console.log(`📋 عدد مواعيد المعلم في ${day}: ${existingTimetables.length}`);

    for (const existing of existingTimetables) {
      // تجاهل الموعد الحالي عند التحديث
      if (currentTimetableId && existing._id.toString() === currentTimetableId.toString()) {
        console.log("⏭️ تجاهل الموعد الحالي");
        continue;
      }

      console.log(`🔎 فحص مع: ${existing.note} (${existing.startHour} - ${existing.endHour})`);

      // فحص التعارب الزمني
      if (hasTimeConflict(startHour, endHour, existing.startHour, existing.endHour)) {
        console.log("❌ يوجد تعارب!");
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

    console.log("✅ لا يوجد تعارض");
    return { hasConflict: false };
  } catch (error) {
    console.error("خطأ في فحص تعارب حلقات المعلم:", error);
    throw error;
  }
};

/**
 * فحص التضارب عند إضافة أو تعديل جلسة (دالة موحدة)
 * @param {String} teacherId - معرف المعلم
 * @param {String} day - اليوم
 * @param {String} startHour - وقت البداية
 * @param {String} endHour - وقت النهاية
 * @param {String} excludeSessionId - معرف الجلسة المستثناة (للتحديث)
 * @returns {Promise<Object>} - {hasConflict: boolean, conflictingSession: Object}
 */
const checkSessionConflict = async (teacherId, day, startHour, endHour, excludeSessionId = null) => {
  try {
    console.log(`🔍 [checkSessionConflict] فحص تضارب للمعلم ${teacherId} في ${day}`);
    
    // جلب جميع الجلسات المحجوزة للمعلم في هذا اليوم
    const query = {
      teacherId,
      day,
    };
    
    // استثناء الجلسة الحالية عند التعديل
    if (excludeSessionId) {
      query._id = { $ne: excludeSessionId };
      console.log(`   ⚠️ استثناء الجلسة: ${excludeSessionId}`);
    }
    
    const existingSessions = await TimeTable.find(query).lean();
    console.log(`   📋 عدد الجلسات: ${existingSessions.length}`);
    
    // فحص التضارب مع كل جلسة موجودة
    for (const session of existingSessions) {
      console.log(`   🔎 فحص مع: ${session.note} (${session.startHour}-${session.endHour})`);
      
      if (hasTimeConflict(startHour, endHour, session.startHour, session.endHour)) {
        console.log(`   ❌ يوجد تضارب مع ${session.note}`);
        return {
          hasConflict: true,
          conflictingSession: {
            _id: session._id,
            day: session.day,
            startHour: session.startHour,
            endHour: session.endHour,
            note: session.note,
          }
        };
      }
    }
    
    console.log(`   ✅ لا يوجد تضارب`);
    return { hasConflict: false };
  } catch (error) {
    console.error("❌ Error checking conflict:", error);
    throw error;
  }
};

module.exports = {
  hasTimeConflict,
  checkTimetableConflict,
  checkTeacherTimetableConflict,
  checkSessionConflict,
};
