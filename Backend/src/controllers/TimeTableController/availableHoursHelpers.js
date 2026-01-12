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
      day, // يجب أن يتطابق اليوم الأسبوعي دائماً
    };

    if (dateToCheck) {
      // ✅ المنطق المحسّن:
      // الجلسة تحجز الوقت في التاريخ المحدد إذا كانت:
      // 1. جلسة متكررة أسبوعياً (isRecurring: true) - تحجز كل أسبوع
      // 2. أو جلسة محددة بهذا التاريخ بالضبط (isRecurring: false && sessionDate == dateToCheck)
      // 3. (مهم) الجلسات المحددة بتواريخ *أخرى* لا تحجز هذا التاريخ
      
      const targetDate = new Date(dateToCheck);
      // ضبط الوقت للصفر للمقارنة الدقيقة
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
      
      console.log(`📅 فحص الأوقات المحجوزة للتاريخ ${targetDate.toLocaleDateString('ar-EG')}`);
    } else {
      // إذا لم يتم تحديد تاريخ، نعرض فقط الجلسات المتكررة (الجدول الأسبوعي العام)
      query.isRecurring = true;
      console.log(`📅 فحص الجلسات المتكررة (الجدول الأسبوعي العام)`);
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
