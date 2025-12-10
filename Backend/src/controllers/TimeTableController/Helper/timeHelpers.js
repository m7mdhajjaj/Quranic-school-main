// ============================================================================
// TIME HELPERS - دوال مساعدة للوقت والتحويلات
// ============================================================================

/**
 * تحديد إذا كان التوقيت صيفي أو شتوي
 * الصيفي: من مايو (5) إلى سبتمبر (9)
 */
const isSummerTime = () => {
  const now = new Date();
  const month = now.getMonth() + 1; // 1-12
  return month >= 5 && month <= 9;
};

/**
 * توليد جميع الأوقات المتاحة حسب الموسم
 * الصيفي: 12:00 PM - 9:00 PM
 * الشتوي: 11:00 AM - 8:00 PM
 */
const generateAllAvailableHours = () => {
  const allHours = [];
  const summer = isSummerTime();

  if (summer) {
    // التوقيت الصيفي: 12:00 PM - 9:00 PM
    for (let h = 12; h <= 21; h++) {
      const display12 = h === 12 ? 12 : h > 12 ? h - 12 : h;
      allHours.push(`${display12}:00 PM`);
      if (h < 21) allHours.push(`${display12}:30 PM`);
    }
  } else {
    // التوقيت الشتوي: 11:00 AM - 8:00 PM
    allHours.push('11:00 AM', '11:30 AM');
    for (let h = 12; h <= 20; h++) {
      const display12 = h === 12 ? 12 : h > 12 ? h - 12 : h;
      allHours.push(`${display12}:00 PM`);
      if (h < 20) allHours.push(`${display12}:30 PM`);
    }
  }

  return allHours;
};

/**
 * تحويل الوقت من صيغة 12 ساعة إلى دقائق للمقارنة
 * يدعم صيغة 12-hour مع AM/PM
 * النطاق الزمني المدعوم:
 * - صيفي: 12:00 PM (الظهر) إلى 9:00 PM
 * - شتوي: 11:00 AM إلى 8:00 PM
 * 
 * @param {String} timeStr - الوقت بصيغة "11:00 AM" أو "2:30 PM"
 * @returns {Number} - عدد الدقائق من منتصف الليل
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
    // مثال: 1 PM = 13, 2 PM = 14, ..., 9 PM = 21
    totalHours = hours + 12;
  } else if (isAM && hours === 12) {
    // 12 AM = 0 (منتصف الليل - غير مستخدم في نطاقنا)
    totalHours = 0;
  } else if (isPM && hours === 12) {
    // 12 PM = 12 (الظهر)
    totalHours = 12;
  } else if (isAM) {
    // AM: 11 AM يبقى 11 (للتوقيت الشتوي)
    totalHours = hours;
  }
  
  const totalMinutes = totalHours * 60 + minutes;
  
  console.log(`🕐 تحويل الوقت: ${timeStr} → ${totalHours}:${minutes.toString().padStart(2, '0')} → ${totalMinutes} دقيقة`);
  
  return totalMinutes;
};

/**
 * فحص إذا كان الوقت يقع ضمن جلسة محجوزة
 * الوقت يعتبر محجوز إذا كان >= وقت البداية و < وقت النهاية
 */
const isTimeInBookedRange = (timeToCheck, sessionStart, sessionEnd) => {
  const checkMinutes = timeToMinutes(timeToCheck);
  const startMinutes = timeToMinutes(sessionStart);
  const endMinutes = timeToMinutes(sessionEnd);
  
  // الوقت محجوز إذا كان داخل النطاق (>= start و < end)
  return checkMinutes >= startMinutes && checkMinutes < endMinutes;
};

module.exports = {
  isSummerTime,
  generateAllAvailableHours,
  timeToMinutes,
  isTimeInBookedRange,
};
