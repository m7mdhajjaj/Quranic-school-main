// ============================================================================
// Date Helpers - دوال مساعدة للتعامل مع التواريخ والأشهر
// ============================================================================

/**
 * الحصول على اسم الشهر بالعربية
 */
const getMonthName = (monthNumber) => {
  const months = [
    "يناير",
    "فبراير",
    "مارس",
    "أبريل",
    "مايو",
    "يونيو",
    "يوليو",
    "أغسطس",
    "سبتمبر",
    "أكتوبر",
    "نوفمبر",
    "ديسمبر",
  ];
  return months[monthNumber - 1];
};

/**
 * الحصول على معلومات الشهر الحالي
 */
const getCurrentMonth = () => {
  const now = new Date();
  return {
    month: now.getMonth() + 1, // 1-12
    year: now.getFullYear(),
    monthName: getMonthName(now.getMonth() + 1),
  };
};

/**
 * الحصول على بداية ونهاية الشهر
 */
const getMonthRange = (month, year) => {
  const startOfMonth = new Date(year, month - 1, 1);
  const endOfMonth = new Date(year, month, 0, 23, 59, 59);
  return { startOfMonth, endOfMonth };
};

module.exports = {
  getMonthName,
  getCurrentMonth,
  getMonthRange,
};
