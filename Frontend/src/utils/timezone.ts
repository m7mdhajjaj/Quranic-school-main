// ============================================================================
// timezone.ts - إعدادات التوقيت الموحدة للـ Frontend
// ============================================================================
// توقيت فلسطين (القدس) - Asia/Jerusalem
// UTC+2 (شتاء) / UTC+3 (صيف)
// ============================================================================

/**
 * التوقيت الافتراضي للتطبيق - القدس
 */
export const TIMEZONE = "Asia/Jerusalem";

/**
 * الحصول على التاريخ الحالي بتوقيت فلسطين
 */
export const getNow = (): Date => {
  return new Date();
};

/**
 * تحويل التاريخ إلى YYYY-MM-DD بتوقيت فلسطين
 */
export const toDateKey = (date: Date = new Date()): string => {
  const options: Intl.DateTimeFormatOptions = { 
    timeZone: TIMEZONE, 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit' 
  };
  const parts = new Intl.DateTimeFormat('en-CA', options).formatToParts(date);
  
  const year = parts.find(p => p.type === 'year')?.value || '';
  const month = parts.find(p => p.type === 'month')?.value || '';
  const day = parts.find(p => p.type === 'day')?.value || '';
  
  return `${year}-${month}-${day}`;
};

/**
 * الحصول على يوم الأسبوع بتوقيت فلسطين (0=الأحد, 6=السبت)
 */
export const getDayInTimezone = (date: Date = new Date()): number => {
  const options: Intl.DateTimeFormatOptions = { timeZone: TIMEZONE, weekday: 'short' };
  const dayStr = new Intl.DateTimeFormat('en-US', options).format(date);
  const dayMap: Record<string, number> = { 
    'Sun': 0, 'Mon': 1, 'Tue': 2, 'Wed': 3, 'Thu': 4, 'Fri': 5, 'Sat': 6 
  };
  return dayMap[dayStr] ?? date.getDay();
};

/**
 * حساب نطاق الأسبوع (السبت - الجمعة) بتوقيت فلسطين
 */
export interface WeekRange {
  startOfWeek: Date;
  endOfWeek: Date;
}

export const getWeekRange = (referenceDate: Date = new Date()): WeekRange => {
  // الحصول على التاريخ بتوقيت فلسطين
  const dateKey = toDateKey(referenceDate);
  const localDate = new Date(dateKey + 'T12:00:00'); // منتصف النهار
  
  const currentDay = getDayInTimezone(referenceDate);
  // السبت = 6 في JavaScript، نريد السبت كبداية الأسبوع
  const daysToSaturday = currentDay === 6 ? 0 : currentDay + 1;
  
  const startOfWeek = new Date(localDate);
  startOfWeek.setDate(localDate.getDate() - daysToSaturday);
  startOfWeek.setHours(0, 0, 0, 0);
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);
  
  return { startOfWeek, endOfWeek };
};

/**
 * تنسيق نطاق الأسبوع للعرض
 */
export const formatWeekRange = (weekRange: WeekRange): string => {
  const startStr = weekRange.startOfWeek.toLocaleDateString('ar-SA', { 
    timeZone: TIMEZONE,
    day: 'numeric', 
    month: 'short' 
  });
  const endStr = weekRange.endOfWeek.toLocaleDateString('ar-SA', { 
    timeZone: TIMEZONE,
    day: 'numeric', 
    month: 'short', 
    year: 'numeric' 
  });
  return `${startStr} - ${endStr}`;
};

/**
 * أيام الأسبوع بالعربية (السبت = 0)
 */
export const WEEK_DAYS = [
  "السبت",
  "الأحد",
  "الاثنين",
  "الثلاثاء",
  "الأربعاء",
  "الخميس",
  "الجمعة",
] as const;

export type ArabicDay = typeof WEEK_DAYS[number];

/**
 * الحصول على اسم اليوم العربي من التاريخ
 */
export const getArabicDayFromDate = (date: Date | string): ArabicDay => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const jsDay = getDayInTimezone(d); // 0 = الأحد، 6 = السبت
  // تحويل: السبت(6) -> 0, الأحد(0) -> 1, ...
  const arabicIndex = jsDay === 6 ? 0 : jsDay + 1;
  return WEEK_DAYS[arabicIndex];
};

/**
 * الحصول على تواريخ أيام الأسبوع
 */
export const getWeekDates = (startOfWeek: Date): Date[] => {
  const dates: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(startOfWeek);
    day.setDate(startOfWeek.getDate() + i);
    dates.push(day);
  }
  return dates;
};

/**
 * تنسيق التاريخ للـ API (YYYY-MM-DD)
 * ✅ إصلاح مشكلة الـ timezone عند التحويل من string
 */
export const formatDateForAPI = (date: Date | string): string => {
  if (typeof date === 'string') {
    // ✅ إذا كان التاريخ بتنسيق YYYY-MM-DD بدون وقت، نُرجعه مباشرة
    const dateOnly = date.split('T')[0];
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateOnly)) {
      return dateOnly;
    }
    // إذا كان يحتوي على وقت، نحول للتاريخ ثم نستخرج بالـ timezone
    const d = new Date(date);
    return toDateKey(d);
  }
  return toDateKey(date);
};

/**
 * الحصول على تاريخ اليوم
 */
export const getTodayDate = (): string => {
  return toDateKey(new Date());
};

/**
 * التحقق من تطابق يومين
 */
export const isSameDay = (date1: Date | string, date2: Date | string): boolean => {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2;
  return toDateKey(d1) === toDateKey(d2);
};

/**
 * تحديد الموسم (صيفي/شتوي)
 * صيفي: مايو (5) - سبتمبر (9)
 */
export const isSummerTime = (date: Date = new Date()): boolean => {
  const options: Intl.DateTimeFormatOptions = { timeZone: TIMEZONE, month: 'numeric' };
  const monthStr = new Intl.DateTimeFormat('en-US', options).format(date);
  const month = parseInt(monthStr);
  return month >= 5 && month <= 9;
};

// ============================================================================
// 📅 دوال تنسيق التاريخ للعرض - موحدة
// ============================================================================

/**
 * تنسيق التاريخ بالعربية (مثال: 17 يناير 2026)
 */
export const formatDateArabic = (date: Date | string | null | undefined): string => {
  if (!date) return "غير محدد";
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: TIMEZONE
    });
  } catch {
    return "غير محدد";
  }
};

/**
 * تنسيق التاريخ المختصر (مثال: 17 يناير)
 */
export const formatDateShort = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('ar-EG', {
    day: 'numeric',
    month: 'short',
    timeZone: TIMEZONE
  });
};

/**
 * تنسيق التاريخ والوقت بالعربية
 */
export const formatDateTimeArabic = (date: Date | string | null | undefined): string => {
  if (!date) return "غير محدد";
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleString('ar-EG', { timeZone: TIMEZONE });
  } catch {
    return "غير محدد";
  }
};

/**
 * الحصول على اسم اليوم فقط (مثال: الجمعة)
 */
export const getWeekdayName = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('ar-EG', { 
    weekday: 'long',
    timeZone: TIMEZONE 
  });
};
