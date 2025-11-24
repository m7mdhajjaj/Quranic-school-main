/**
 * الأشهر العربية - ثوابت
 * يُستخدم في فلترة التواريخ والتقارير الشهرية
 */

export const ARABIC_MONTHS = [
  { value: 1, label: 'يناير', fullLabel: 'كانون الثاني' },
  { value: 2, label: 'فبراير', fullLabel: 'شباط' },
  { value: 3, label: 'مارس', fullLabel: 'آذار' },
  { value: 4, label: 'أبريل', fullLabel: 'نيسان' },
  { value: 5, label: 'مايو', fullLabel: 'أيار' },
  { value: 6, label: 'يونيو', fullLabel: 'حزيران' },
  { value: 7, label: 'يوليو', fullLabel: 'تموز' },
  { value: 8, label: 'أغسطس', fullLabel: 'آب' },
  { value: 9, label: 'سبتمبر', fullLabel: 'أيلول' },
  { value: 10, label: 'أكتوبر', fullLabel: 'تشرين الأول' },
  { value: 11, label: 'نوفمبر', fullLabel: 'تشرين الثاني' },
  { value: 12, label: 'ديسمبر', fullLabel: 'كانون الأول' },
] as const;

/**
 * الحصول على اسم الشهر بالعربية
 * @param month - رقم الشهر (1-12)
 * @param format - نوع التنسيق ('short' | 'full')
 * @returns اسم الشهر بالعربية
 */
export const getMonthLabel = (
  month: number | string,
  format: 'short' | 'full' = 'short'
): string => {
  const monthNum = typeof month === 'string' ? parseInt(month) : month;
  const monthData = ARABIC_MONTHS.find((m) => m.value === monthNum);
  
  if (!monthData) return '';
  
  return format === 'full' ? monthData.fullLabel : monthData.label;
};

/**
 * الحصول على قائمة بخيارات الأشهر لـ Select Component
 */
export const getMonthOptions = () => {
  return ARABIC_MONTHS.map((month) => ({
    value: month.value,
    label: `${month.label} (${month.value})`,
  }));
};

/**
 * أسماء الأشهر بالتنسيق العربي مع الأرقام (للاستخدام في arrays)
 */
export const AR_MONTHS = ARABIC_MONTHS.map(
  (month) => `${month.label} (${month.value.toString().padStart(2, '0')})`
);
