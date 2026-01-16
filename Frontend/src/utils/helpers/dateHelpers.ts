/**
 * دوال مساعدة للتعامل مع التواريخ
 * ✅ يستخدم توقيت فلسطين (Asia/Jerusalem) الموحد
 */

import { TIMEZONE, toDateKey } from '@/utils/timezone';

/**
 * تحويل التاريخ إلى صيغة yyyy-mm-dd للاستخدام في input[type="date"]
 * ✅ يستخدم timezone.ts
 * @param date - التاريخ المراد تحويله
 * @returns التاريخ بصيغة yyyy-mm-dd
 */
export const formatDateForInput = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return toDateKey(d);
};

/**
 * تحويل التاريخ إلى صيغة عربية قابلة للقراءة
 * ✅ يستخدم توقيت فلسطين (Asia/Jerusalem)
 * @param date - التاريخ المراد تحويله
 * @returns التاريخ بالعربية (مثال: 24 أكتوبر 2025)
 */
export const formatArabicDate = (date: Date | string | null | undefined): string => {
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
 * تحويل التاريخ والوقت إلى صيغة عربية
 * ✅ يستخدم توقيت فلسطين (Asia/Jerusalem)
 * @param date - التاريخ والوقت المراد تحويله
 * @returns التاريخ والوقت بالعربية
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
 * تحويل الوقت إلى صيغة 12 ساعة عربية (من سلسلة نصية HH:MM)
 * @param timeStr - الوقت بصيغة HH:MM
 * @returns الوقت بصيغة 12 ساعة مع الفترة (صباحاً/ظهراً/مساءً)
 */
export const formatTime12Arabic = (timeStr: string): string => {
  if (!timeStr) return '-';
  try {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    
    // تحديد الفترة (ظهراً/مساءً/صباحاً)
    let period = '';
    if (hour === 12) {
      period = 'ظهراً';
    } else if (hour > 12) {
      period = 'مساءً';
    } else {
      period = 'صباحاً';
    }
    
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${period}`;
  } catch {
    return '-';
  }
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
