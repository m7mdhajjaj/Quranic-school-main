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
 * فحص التعارب مع المواعيد الموجودة لنفس الحلقة مع مراعاة التاريخ (sessionDate)
 * @param {Object} timetableData - بيانات الموعد الجديد
 * @param {String} currentTimetableId - معرف الموعد الحالي (للتحديث)
 * @returns {Promise<Object>} - {hasConflict: boolean, conflictDetails: Object}
 */
const checkTimetableConflict = async (timetableData, currentTimetableId = null) => {
  try {
    const { day, startHour, endHour, note, sessionDate, isRecurring } = timetableData;

    console.log("🔍 فحص التعارب للحلقة:", { day, startHour, endHour, note, sessionDate, isRecurring });

    // تحديد نوع الموعد الجديد
    const isNewSessionRecurring = isRecurring !== false && !sessionDate;
    const newDate = sessionDate ? new Date(sessionDate) : null;
    
    // بناء الـ query بناءً على نوع الموعد
    let query = { day };
    
    if (!isNewSessionRecurring && newDate) {
      // الموعد الجديد محدد بتاريخ - نبحث عن:
      // 1. المواعيد المتكررة في نفس اليوم (ستتعارض مع أي تاريخ في هذا اليوم)
      // 2. المواعيد المحددة بنفس التاريخ
      const targetDate = new Date(newDate);
      targetDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);
      
      query.$or = [
        { day, isRecurring: true },
        { day, isRecurring: false, sessionDate: { $gte: targetDate, $lt: nextDay } }
      ];
      delete query.day; // لأننا نستخدمه في $or
    }
    
    const existingTimetables = await TimeTable.find(query);
    console.log("📋 عدد المواعيد الموجودة:", existingTimetables.length);

    for (const existing of existingTimetables) {
      // تجاهل الموعد الحالي عند التحديث
      if (currentTimetableId && existing._id.toString() === currentTimetableId.toString()) {
        console.log("⏭️ تجاهل الموعد الحالي");
        continue;
      }

      // فحص التعارب فقط مع مواعيد نفس الحلقة (note)
      if (!note || !note.trim() || !existing.note || !existing.note.trim()) {
        console.log("⏭️ تجاهل موعد بدون حلقة");
        continue;
      }

      // التحقق من التطابق في الحلقة
      if (existing.note.trim() === note.trim()) {
        const existingDate = existing.sessionDate ? new Date(existing.sessionDate) : null;
        const isExistingRecurring = existing.isRecurring !== false && !existingDate;

        console.log(`🔎 فحص مع موعد: ${existing.note} (${existing.startHour}-${existing.endHour}), متكرر: ${isExistingRecurring}, تاريخ: ${existingDate?.toDateString()}`);

        // منطق التعارض المُحسّن:
        let shouldCheckTimeConflict = false;

        // 1. كلاهما متكرر
        if (isNewSessionRecurring && isExistingRecurring) {
          shouldCheckTimeConflict = true;
          console.log("   📌 كلاهما متكرر - فحص الوقت");
        }
        // 2. كلاهما محدد بتاريخ - تعارض فقط إذا نفس التاريخ
        else if (!isNewSessionRecurring && !isExistingRecurring) {
          if (newDate && existingDate && newDate.toDateString() === existingDate.toDateString()) {
            shouldCheckTimeConflict = true;
            console.log("   📌 كلاهما بنفس التاريخ - فحص الوقت");
          } else {
            console.log("   ⏭️ تواريخ مختلفة - لا تعارض");
          }
        }
        // 3. واحد متكرر والثاني محدد بتاريخ
        else {
          shouldCheckTimeConflict = true;
          console.log("   📌 أحدهما متكرر - فحص الوقت");
        }

        if (shouldCheckTimeConflict) {
          const conflict = hasTimeConflict(startHour, endHour, existing.startHour, existing.endHour);
          if (conflict) {
            return {
              hasConflict: true,
              conflictDetails: {
                day: existing.day,
                startHour: existing.startHour,
                endHour: existing.endHour,
                note: existing.note,
                timetableId: existing._id,
                sessionDate: existing.sessionDate,
                isRecurring: isExistingRecurring
              }
            };
          }
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
 * @param {Date} dateToCheck - التاريخ المحدد للفحص (اختياري)
 * @returns {Promise<Object>} - {hasConflict: boolean, conflictingSession: Object}
 */
const checkSessionConflict = async (teacherId, day, startHour, endHour, excludeSessionId = null, dateToCheck = null) => {
  try {
    console.log(`🔍 [checkSessionConflict] فحص تضارب للمعلم ${teacherId} في ${day} (تاريخ: ${dateToCheck})`);
    
    // جلب جميع الجلسات المحجوزة للمعلم في هذا اليوم
    const query = {
      teacherId,
      day, // يجب أن يتطابق اليوم الأسبوعي دائماً
    };
    
    // ✅ تطبيق نفس منطق getBookedHoursForTeacher
    if (dateToCheck) {
      const targetDate = new Date(dateToCheck);
      targetDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);

      query.$or = [
        { isRecurring: true }, // الجلسات المتكررة تحجز في كل الأسابيع
        { 
          isRecurring: false, 
          sessionDate: { $gte: targetDate, $lt: nextDay } 
        } // الجلسة المحددة لهذا التاريخ فقط
      ];
      
      console.log(`   📅 فحص مع مراعاة التاريخ ${targetDate.toLocaleDateString('ar-EG')}`);
    } else {
      // إذا لم يتم تحديد تاريخ، نفحص فقط الجلسات المتكررة
      query.isRecurring = true;
      console.log(`   📅 فحص الجلسات المتكررة فقط`);
    }
    
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
