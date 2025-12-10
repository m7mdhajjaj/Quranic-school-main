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
 * جلب الأوقات المحجوزة للمعلم في يوم معين
 * @param {String} teacherId - معرف المعلم
 * @param {String} day - اليوم
 * @param {String} excludeSessionId - معرف الجلسة المستثناة
 * @returns {Promise<Object>} - كائن يحتوي على الأوقات المتاحة والمحجوزة
 */
const getBookedHoursForTeacher = async (teacherId, day, excludeSessionId = null) => {
  try {
    console.log(`🔍 [getBookedHoursForTeacher] البحث عن جلسات المعلم ${teacherId} في يوم ${day}`);
    
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
    
    const bookedSessions = await TimeTable.find(query).lean();
    console.log(`   📋 عدد الجلسات المحجوزة: ${bookedSessions.length}`);
    
    if (bookedSessions.length > 0) {
      console.log(`   📝 تفاصيل الجلسات المحجوزة:`);
      bookedSessions.forEach((s, idx) => {
        console.log(`      ${idx + 1}. ${s.note}: ${s.startHour} - ${s.endHour}`);
      });
    }
    
    // جلب جميع الأوقات المتاحة
    const allHours = generateAllAvailableHours();
    console.log(`   ⏰ إجمالي الأوقات في اليوم: ${allHours.length}`);
    
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
    
    console.log(`   🚫 الأوقات المحجوزة: ${bookedHours.length}`);
    if (bookedHours.length > 0) {
      console.log(`   📍 الأوقات المحجوزة بالتفصيل:`, bookedHours);
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
    
    console.log(`   ✅ النتيجة النهائية: ${result.availableSlots} متاحة من ${result.totalSlots}`);
    
    return result;
  } catch (error) {
    console.error("❌ Error getting booked hours:", error);
    throw error;
  }
};

module.exports = {
  getBookedHoursForTeacher,
};
