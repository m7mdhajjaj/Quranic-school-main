// ============================================
// DATE TIME HELPER
// ============================================
// دوال مساعدة للتاريخ والوقت

/**
 * تحديد إذا كان التوقيت صيفي
 * صيفي: مايو (5) - سبتمبر (9)
 */
const isSummerTime = () => {
  const month = new Date().getMonth() + 1;
  return month >= 5 && month <= 9;
};

/**
 * توليد الأوقات المتاحة حسب الموسم
 */
const generateAvailableHours = () => {
  const hours = [];
  const summer = isSummerTime();

  if (summer) {
    // صيفي: 12:00 PM - 9:00 PM
    for (let h = 12; h <= 21; h++) {
      const display = h === 12 ? 12 : h > 12 ? h - 12 : h;
      hours.push(`${display}:00 PM`);
      if (h < 21) hours.push(`${display}:30 PM`);
    }
  } else {
    // شتوي: 11:00 AM - 8:00 PM
    hours.push('11:00 AM', '11:30 AM');
    for (let h = 12; h <= 20; h++) {
      const display = h === 12 ? 12 : h > 12 ? h - 12 : h;
      hours.push(`${display}:00 PM`);
      if (h < 20) hours.push(`${display}:30 PM`);
    }
  }

  return hours;
};

/**
 * تحويل الوقت إلى دقائق
 */
const timeToMinutes = (timeStr) => {
  if (!timeStr) return 0;
  
  const clean = timeStr.trim().toLowerCase();
  const timePart = clean.replace(/\s*(am|pm)\s*/i, '');
  const [hours, minutes] = timePart.split(':').map(v => parseInt(v) || 0);
  
  const isPM = clean.includes('pm');
  const isAM = clean.includes('am');
  
  let totalHours = hours;
  
  if (isPM && hours !== 12) {
    totalHours = hours + 12;
  } else if (isAM && hours === 12) {
    totalHours = 0;
  }
  
  return totalHours * 60 + minutes;
};

/**
 * اشتقاق اليوم بالعربية من تاريخ
 */
const getArabicDayFromDate = (date) => {
  const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  const d = new Date(date);
  return days[d.getDay()];
};

/**
 * حساب بداية ونهاية الأسبوع (السبت - الجمعة) بتوقيت UTC
 */
const getWeekRange = (date = new Date()) => {
  const d = new Date(date);
  const currentDay = d.getUTCDay(); // 0 = الأحد، 6 = السبت
  
  // حساب المسافة للسبت
  const daysToSaturday = currentDay === 6 ? 0 : currentDay + 1;
  
  const startOfWeek = new Date(d);
  startOfWeek.setUTCDate(d.getUTCDate() - daysToSaturday);
  startOfWeek.setUTCHours(0, 0, 0, 0);
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setUTCDate(startOfWeek.getUTCDate() + 6);
  endOfWeek.setUTCHours(23, 59, 59, 999);
  
  return { startOfWeek, endOfWeek };
};

/**
 * حساب تاريخ يوم معين في الأسبوع الحالي بتوقيت UTC
 * @param {String} dayName - اسم اليوم بالعربية
 * @param {Date} weekStart - بداية الأسبوع (السبت)
 * @returns {Date} - التاريخ الكامل لذلك اليوم
 */
const getDateForDayInWeek = (dayName, weekStart = null) => {
  const daysMap = {
    'السبت': 0,
    'الأحد': 1,
    'الاثنين': 2,
    'الثلاثاء': 3,
    'الأربعاء': 4,
    'الخميس': 5,
    'الجمعة': 6
  };
  
  const dayIndex = daysMap[dayName];
  if (dayIndex === undefined) return null;
  
  // إذا لم يتم تمرير بداية الأسبوع، احسبها
  const { startOfWeek } = weekStart ? { startOfWeek: new Date(weekStart) } : getWeekRange();
  
  const targetDate = new Date(startOfWeek);
  targetDate.setUTCDate(startOfWeek.getUTCDate() + dayIndex);
  
  return targetDate;
};

/**
 * فحص إذا كان الوقت ضمن نطاق
 */
const isTimeInRange = (time, start, end) => {
  const t = timeToMinutes(time);
  const s = timeToMinutes(start);
  const e = timeToMinutes(end);
  return t >= s && t < e;
};

/**
 * تنسيق التاريخ للعرض
 * @param {Date|String} date 
 * @returns {String} - "12 يناير 2026"
 */
const formatDateArabic = (date) => {
  const d = new Date(date);
  return d.toLocaleDateString('ar-SA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

/**
 * تنسيق التاريخ القصير
 * @param {Date|String} date 
 * @returns {String} - "12/1/2026"
 */
const formatDateShort = (date) => {
  const d = new Date(date);
  return d.toLocaleDateString('ar-SA');
};

/**
 * اشتقاق اليوم من التاريخ مع التنسيق
 * @param {Date|String} date 
 * @returns {Object} - {dayName, dayIndex, dateFormatted}
 */
const extractDayInfo = (date) => {
  const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  const d = new Date(date);
  return {
    dayName: days[d.getDay()],
    dayIndex: d.getDay(),
    dateFormatted: formatDateArabic(d),
    dateShort: formatDateShort(d)
  };
};

module.exports = {
  isSummerTime,
  generateAvailableHours,
  timeToMinutes,
  getArabicDayFromDate,
  getWeekRange,
  getDateForDayInWeek,
  isTimeInRange,
  formatDateArabic,
  formatDateShort,
  extractDayInfo
};
