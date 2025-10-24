/**
 * دوال مساعدة للتعامل مع التواريخ
 */

/**
 * تحويل التاريخ إلى صيغة yyyy-mm-dd للاستخدام في input[type="date"]
 * @param date - التاريخ المراد تحويله
 * @returns التاريخ بصيغة yyyy-mm-dd
 */
export const formatDateForInput = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * تحويل التاريخ إلى صيغة عربية قابلة للقراءة
 * @param date - التاريخ المراد تحويله
 * @returns التاريخ بالعربية (مثال: 24 أكتوبر 2025)
 */
export const formatArabicDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * تحويل التاريخ إلى صيغة dd/mm/yyyy
 * @param date - التاريخ المراد تحويله
 * @returns التاريخ بصيغة dd/mm/yyyy
 */
export const formatDateDDMMYYYY = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-GB');
};

/**
 * حساب العمر من تاريخ الميلاد
 * @param birthDate - تاريخ الميلاد
 * @returns العمر بالسنوات
 */
export const calculateAge = (birthDate: string | Date): number => {
  const today = new Date();
  const birth = typeof birthDate === 'string' ? new Date(birthDate) : birthDate;
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};

/**
 * توليد قائمة بالسنوات (للاستخدام في Select)
 * @param range - المدى من السنة الحالية (قبل وبعد)
 * @returns مصفوفة بالسنوات
 */
export const generateYearRange = (range: number = 2): number[] => {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: range * 2 + 1 }, (_, i) => currentYear - range + i);
};

/**
 * الحصول على اليوم الحالي بصيغة yyyy-mm-dd
 */
export const getTodayDate = (): string => {
  return formatDateForInput(new Date());
};

/**
 * التحقق من أن التاريخ في المستقبل
 * @param date - التاريخ المراد التحقق منه
 * @returns true إذا كان التاريخ في المستقبل
 */
export const isFutureDate = (date: Date | string): boolean => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d > new Date();
};

/**
 * التحقق من أن التاريخ في الماضي
 * @param date - التاريخ المراد التحقق منه
 * @returns true إذا كان التاريخ في الماضي
 */
export const isPastDate = (date: Date | string): boolean => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d < today;
};
