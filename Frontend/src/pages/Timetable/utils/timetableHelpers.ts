// ============================================================================
// Timetable Helpers - دوال مساعدة لجدول الحصص
// ============================================================================

import type { User } from "../types/timetable.types";

/**
 * تحديد إذا كان التوقيت صيفي أو شتوي
 * الصيفي: من مايو (5) إلى سبتمبر (9)
 * الشتوي: من أكتوبر (10) إلى أبريل (4)
 */
export const isSummerTime = (): boolean => {
  const now = new Date();
  const month = now.getMonth() + 1; // 1-12
  return month >= 5 && month <= 9;
};

/**
 * توليد جميع الأوقات المتاحة حسب الموسم
 * الصيفي: 12:00 PM - 9:00 PM
 * الشتوي: 11:00 AM - 8:00 PM
 */
export const generateHours = (isSummer?: boolean): string[] => {
  const hours: string[] = [];
  const summer = isSummer !== undefined ? isSummer : isSummerTime();
  
  if (summer) {
    // التوقيت الصيفي: 12:00 PM - 9:00 PM
    for (let h = 12; h <= 21; h++) {
      const display12 = h === 12 ? 12 : h > 12 ? h - 12 : h;
      hours.push(`${display12}:00 PM`);
      if (h < 21) {
        hours.push(`${display12}:30 PM`);
      }
    }
  } else {
    // التوقيت الشتوي: 11:00 AM - 8:00 PM
    hours.push('11:00 AM', '11:30 AM');
    for (let h = 12; h <= 20; h++) {
      const display12 = h === 12 ? 12 : h > 12 ? h - 12 : h;
      hours.push(`${display12}:00 PM`);
      if (h < 20) {
        hours.push(`${display12}:30 PM`);
      }
    }
  }
  
  return hours;
};

/**
 * أيام الأسبوع بالعربية - يجب أن تطابق schema enum في Backend
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

/**
 * الحصول على أسماء المعلم المحتملة للمطابقة
 */
export const getTeacherPossibleNames = (user: User): string[] => {
  const firstLast = `${user.firstName} ${user.lastName}`.trim();
  const firstFatherLast = `${user.firstName} ${user.fatherName || ""} ${
    user.lastName || ""
  }`
    .trim()
    .replace(/\s+/g, " ");
  return [firstLast, firstFatherLast, user.firstName].filter(
    (name) => name.length > 0
  );
};

/**
 * التحقق من تطابق اسم المعلم
 */
export const isTeacherMatch = (
  studentTeacher: string,
  possibleNames: string[]
): boolean => {
  const studentTeacherNormalized = studentTeacher
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
  return possibleNames.some((possibleName) => {
    const normalizedPossible = possibleName.toLowerCase();
    return (
      studentTeacherNormalized === normalizedPossible ||
      studentTeacherNormalized.includes(normalizedPossible) ||
      normalizedPossible.includes(studentTeacherNormalized)
    );
  });
};

/**
 * الحصول على مستخدم من localStorage
 */
export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem("user");
  if (!userStr) return null;

  try {
    return JSON.parse(userStr);
  } catch {
    console.error("Error parsing user from localStorage");
    return null;
  }
};

/**
 * الحصول على دور المستخدم
 */
export const getUserRole = (): "student" | "teacher" | "admin" => {
  const user = getCurrentUser();
  return user?.role || "student";
};

/**
 * تحويل الوقت من صيغة 12 ساعة إلى دقائق للمقارنة
 * يدعم صيغة 12-hour مع AM/PM
 * النطاق الزمني المدعوم:
 * - صيفي: 12:00 PM (الظهر) إلى 9:00 PM
 * - شتوي: 11:00 AM إلى 8:00 PM
 */
export const timeToMinutes = (timeStr: string): number => {
  if (!timeStr) return 0;
  
  // إزالة المسافات وتحويل لصيغة موحدة
  const cleanTime = timeStr.trim().toLowerCase();
  
  // استخراج الساعات والدقائق
  const timePart = cleanTime.replace(/\s*(am|pm)\s*/i, '');
  const [hoursStr, minutesStr] = timePart.split(':');
  const hours = parseInt(hoursStr) || 0;
  const minutes = parseInt(minutesStr) || 0;
  
  // التحقق من AM أو PM
  const isPM = cleanTime.includes('pm');
  const isAM = cleanTime.includes('am');
  
  let totalHours = hours;
  
  if (isPM && hours !== 12) {
    // PM: أضف 12 ساعة (ما عدا 12 PM)
    totalHours = hours + 12;
  } else if (isAM && hours === 12) {
    // 12 AM = 0 (منتصف الليل)
    totalHours = 0;
  } else if (isPM && hours === 12) {
    // 12 PM = 12 (الظهر)
    totalHours = 12;
  } else if (isAM) {
    // AM: 11 AM يبقى 11
    totalHours = hours;
  }
  
  return totalHours * 60 + minutes;
};

/**
 * فحص إذا كان الوقت يقع ضمن جلسة محجوزة
 * الوقت يعتبر محجوز إذا كان >= وقت البداية و < وقت النهاية
 */
export const isTimeInBookedRange = (
  timeToCheck: string,
  sessionStart: string,
  sessionEnd: string
): boolean => {
  const checkMinutes = timeToMinutes(timeToCheck);
  const startMinutes = timeToMinutes(sessionStart);
  const endMinutes = timeToMinutes(sessionEnd);
  
  return checkMinutes >= startMinutes && checkMinutes < endMinutes;
};

/**
 * التحقق من صحة الوقت حسب التوقيت الحالي
 */
export const isValidTime = (timeStr: string): boolean => {
  const cleanTime = timeStr.trim().toLowerCase();
  const hour = parseInt(timeStr.split(':')[0]);
  const isAM = cleanTime.includes('am');
  const isPM = cleanTime.includes('pm');
  const summer = isSummerTime();
  
  if (isAM) {
    // AM مسموح فقط في الشتاء (11:00 AM - 11:30 AM)
    return !summer && hour === 11;
  }
  
  if (isPM) {
    // PM مسموح في الصيف والشتاء
    if (summer) {
      // صيفي: 12:00 PM - 9:00 PM
      return hour === 12 || (hour >= 1 && hour <= 9);
    } else {
      // شتوي: 12:00 PM - 9:00 PM
      return hour === 12 || (hour >= 1 && hour <= 9);
    }
  }
  
  return false;
};
