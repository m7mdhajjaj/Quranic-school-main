// ============================================
// GET AVAILABLE HOURS - إرجاع الأوقات المتاحة
// ============================================

const { isSummerTime, generateAllAvailableHours } = require("./Helper/timeHelpers");

/**
 * إرجاع الأوقات المتاحة حسب التوقيت الحالي
 */
exports.getAvailableHours = async (req, res) => {
  try {
    const summer = isSummerTime();
    const hours = generateAllAvailableHours();
    
    const response = {
      success: true,
      data: {
        isSummerTime: summer,
        season: summer ? 'summer' : 'winter',
        seasonAr: summer ? 'صيفي' : 'شتوي',
        range: summer ? '12:00 PM - 9:00 PM' : '11:00 AM - 8:00 PM',
        hours: hours,
        totalSlots: hours.length,
        currentMonth: new Date().getMonth() + 1,
        currentDate: new Date().toISOString()
      }
    };
    
    console.log(`📅 تم إرجاع الأوقات المتاحة - ${response.data.seasonAr} (${response.data.totalSlots} فترة)`);
    
    return res.status(200).json(response);
  } catch (error) {
    console.error("❌ خطأ في جلب الأوقات المتاحة:", error);
    return res.status(500).json({
      success: false,
      error: "Server error",
      message: "حدث خطأ أثناء جلب الأوقات المتاحة"
    });
  }
};
