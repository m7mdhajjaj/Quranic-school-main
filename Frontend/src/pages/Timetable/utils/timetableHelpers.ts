// ============================================================================
// Timetable Helpers - دوال مساعدة لجدول الحصص
// ============================================================================
// ⚠️ النظام الجديد: يعتمد على sessionDate (التاريخ المحدد) وليس day (اسم اليوم)

import type { User } from "../types/timetable.types";

/**
 * أيام الأسبوع بالعربية
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

// ============================================================================
// 📅 دوال التاريخ الجديدة (بدلاً من day)
// ============================================================================

/**
 * الحصول على اسم اليوم العربي من التاريخ
 * @param dateStr - التاريخ (ISO أو YYYY-MM-DD)
 */
export const getDayNameFromDate = (dateStr: string): ArabicDay => {
  const date = new Date(dateStr);
  const jsDay = date.getDay(); // 0 = Sunday, 6 = Saturday
  // تحويل: Sunday(0) -> الأحد(1), Saturday(6) -> السبت(0)
  const arabicIndex = (jsDay + 1) % 7;
  return WEEK_DAYS[arabicIndex];
};

/**
 * تنسيق التاريخ للإرسال للـ API
 * @param date - كائن Date
 * @returns YYYY-MM-DD
 */
export const formatDateForAPI = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * تنسيق التاريخ للعرض بالعربية
 * @param dateStr - التاريخ (ISO أو YYYY-MM-DD)
 */
export const formatDateForDisplay = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('ar-SA', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * تنسيق التاريخ المختصر للعرض
 * @param dateStr - التاريخ (ISO أو YYYY-MM-DD)
 */
export const formatDateShort = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('ar-SA', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
};

/**
 * الحصول على تاريخ اليوم بصيغة YYYY-MM-DD
 */
export const getTodayDate = (): string => {
  return formatDateForAPI(new Date());
};

/**
 * التحقق إذا كان تاريخان في نفس اليوم
 */
export const isSameDay = (date1: string, date2: string): boolean => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};

/**
 * إنشاء تواريخ أسبوع من تاريخ معين (السبت - الجمعة)
 */
export const getWeekDates = (referenceDate: Date = new Date()): Date[] => {
  const dates: Date[] = [];
  const currentDay = referenceDate.getDay();
  // حساب بداية الأسبوع (السبت)
  const daysToSaturday = currentDay === 6 ? 0 : currentDay + 1;
  const saturday = new Date(referenceDate);
  saturday.setDate(referenceDate.getDate() - daysToSaturday);
  saturday.setHours(0, 0, 0, 0);
  
  for (let i = 0; i < 7; i++) {
    const day = new Date(saturday);
    day.setDate(saturday.getDate() + i);
    dates.push(day);
  }
  
  return dates;
};

// ============================================================================
// دوال المستخدم والمعلم
// ============================================================================

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

// ============================================================================
// دوال الوقت
// ============================================================================

/**
 * تحويل الوقت من صيغة 12 ساعة إلى دقائق للمقارنة
 */
export const timeToMinutes = (timeStr: string): number => {
  if (!timeStr) return 0;
  
  const cleanTime = timeStr.trim().toLowerCase();
  const timePart = cleanTime.replace(/\s*(am|pm)\s*/i, '');
  const [hoursStr, minutesStr] = timePart.split(':');
  const hours = parseInt(hoursStr) || 0;
  const minutes = parseInt(minutesStr) || 0;
  
  const isPM = cleanTime.includes('pm');
  const isAM = cleanTime.includes('am');
  
  let totalHours = hours;
  
  if (isPM && hours !== 12) {
    totalHours = hours + 12;
  } else if (isAM && hours === 12) {
    totalHours = 0;
  } else if (isPM && hours === 12) {
    totalHours = 12;
  } else if (isAM) {
    totalHours = hours;
  }
  
  return totalHours * 60 + minutes;
};

/**
 * فحص إذا كان الوقت يقع ضمن جلسة محجوزة
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
    return !summer && hour === 11;
  }
  
  if (isPM) {
    if (summer) {
      return hour === 12 || (hour >= 1 && hour <= 9);
    } else {
      return hour === 12 || (hour >= 1 && hour <= 8);
    }
  }
  
  return false;
};
