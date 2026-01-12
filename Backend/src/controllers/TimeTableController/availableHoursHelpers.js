// ============================================================================
// Available Hours Helpers - منطق الأوقات المتاحة والجلسات المحجوزة
// ============================================================================

const TimeTable = require("../../schema/TimeTable");
const { 
  isSummerTime, 
  generateAllAvailableHours, 
  timeToMinutes, 
  isTimeInBookedRange 
} = require("./Helper/timeHelpers");
const { hasTimeConflict, checkSessionConflict } = require("./Helper/conflictChecker");

/**
 * جلب الأوقات المحجوزة للمعلم في يوم معين (يدعم التواريخ المحددة)
 * @param {String} teacherId - معرف المعلم
 * @param {String} day - اليوم (نصي: الأحد، الاثنين...)
 * @param {String} excludeSessionId - معرف الجلسة المستثناة
 * @param {Date} dateToCheck - التاريخ المحدد للفحص (اختياري)
 * @returns {Promise<Object>} - كائن يحتوي على الأوقات المتاحة والمحجوزة
 */
const getBookedHoursForTeacher = async (teacherId, day, excludeSessionId = null, dateToCheck = null) => {
  try {
    console.log(`🔍 [getBookedHoursForTeacher] البحث عن جلسات المعلم ${teacherId} في يوم ${day} (تاريخ: ${dateToCheck})`);
    
    // بناء استعلام ذكي
    const query = {
      teacherId,
      day,
    };

    // ✅ المنطق الجديد: كل المواعيد محددة بتاريخ
    // الأوقات المحجوزة تكون فقط للمواعيد في نفس التاريخ
    if (dateToCheck) {
      const targetDate = new Date(dateToCheck);
      targetDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);

      // البحث عن مواعيد في نفس التاريخ بالضبط
      query.sessionDate = { $gte: targetDate, $lt: nextDay };
      
      console.log(`📅 فحص الأوقات المحجوزة للتاريخ ${targetDate.toLocaleDateString('ar-EG')} فقط`);
    } else {
      // إذا لم يُحدد تاريخ، لا نُرجع أي أوقات محجوزة
      console.log(`📅 لا يوجد تاريخ محدد - كل الأوقات متاحة`);
      const allHours = generateAllAvailableHours();
      return {
        allHours,
        bookedHours: [],
        availableHours: allHours,
        bookedSessions: [],
        totalSlots: allHours.length,
        bookedSlots: 0,
        availableSlots: allHours.length,
      };
    }
    
    // استثناء الجلسة الحالية عند التعديل
    if (excludeSessionId) {
      query._id = { $ne: excludeSessionId };
    }
    
    const bookedSessions = await TimeTable.find(query).lean();
    
    // جلب جميع الأوقات المتاحة
    const allHours = generateAllAvailableHours();
    
    // تحديد الأوقات المحجوزة
    const bookedHours = [];
    
    for (const hour of allHours) {
      // فحص إذا كان هذا الوقت يقع ضمن أي جلسة محجوزة
      const isBooked = bookedSessions.some(session => 
        isTimeInBookedRange(hour, session.startHour, session.endHour)
      );
      
      if (isBooked) {
        bookedHours.push(hour);
      }
    }
    
    const result = {
      allHours,
      bookedHours,
      availableHours: allHours.filter(h => !bookedHours.includes(h)),
      bookedSessions,
      totalSlots: allHours.length,
      bookedSlots: bookedHours.length,
      availableSlots: allHours.length - bookedHours.length,
    };
    
    return result;
  } catch (error) {
    console.error("❌ Error getting booked hours:", error);
    throw error;
  }
};

module.exports = {
  getBookedHoursForTeacher,
};
