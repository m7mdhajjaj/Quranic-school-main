// ============================================
// GET AVAILABLE HOURS FOR TEACHER - الأوقات المتاحة للمعلم
// ============================================

const { getBookedHoursForTeacher } = require("./availableHoursHelpers");
const { isSummerTime } = require("./Helper/timeHelpers");

/**
 * إرجاع الأوقات المتاحة للمعلم في يوم معين (بعد استثناء الأوقات المحجوزة)
 */
exports.getAvailableHoursForTeacher = async (req, res) => {
  try {
    const { teacherId, day, excludeSessionId, date } = req.query; // استلام التاريخ المحدد (date)
    
    console.log('🔍 جلب الأوقات المتاحة للمعلم:', { teacherId, day, excludeSessionId, date });
    
    if (!teacherId || !day) {
      return res.status(400).json({
        success: false,
        error: "Missing parameters",
        message: "يرجى تحديد معرف المعلم واليوم"
      });
    }
    
    // تمرير التاريخ للوظيفة المساعدة
    const result = await getBookedHoursForTeacher(teacherId, day, excludeSessionId, date);
    const summer = isSummerTime();
    
    console.log(`✅ نتائج المعلم في ${day}:`);
    console.log(`   📊 إجمالي: ${result.totalSlots} | متاحة: ${result.availableSlots} | محجوزة: ${result.bookedSlots}`);
    console.log(`   📋 عدد الجلسات المحجوزة: ${result.bookedSessions.length}`);
    if (result.bookedSessions.length > 0) {
      console.log(`   📝 الجلسات:`, result.bookedSessions.map(s => `${s.note} (${s.startHour}-${s.endHour})`));
    }
    if (result.bookedHours.length > 0) {
      console.log(`   🚫 الأوقات المحجوزة:`, result.bookedHours);
    }
    
    return res.status(200).json({
      success: true,
      data: {
        isSummerTime: summer,
        season: summer ? 'summer' : 'winter',
        seasonAr: summer ? 'صيفي' : 'شتوي',
        teacherId,
        day,
        availableHours: result.availableHours,
        bookedSessions: result.bookedSessions.map(s => ({
          _id: s._id,
          startHour: s.startHour,
          endHour: s.endHour,
          note: s.note,
        })),
        totalSlots: result.totalSlots,
        bookedSlots: result.bookedSlots,
        availableSlots: result.availableSlots,
      }
    });
  } catch (error) {
    console.error("❌ خطأ في جلب أوقات المعلم:", error);
    return res.status(500).json({
      success: false,
      error: "Server error",
      message: error.message
    });
  }
};
