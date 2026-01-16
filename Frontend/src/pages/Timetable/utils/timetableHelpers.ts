// ============================================================================
// Timetable Helpers - دوال مساعدة لجدول الحصص
// ============================================================================
// ⚠️ النظام الجديد: يعتمد على sessionDate (التاريخ المحدد) وليس day (اسم اليوم)
// ✅ يستخدم توقيت فلسطين (Asia/Jerusalem) الموحد

import type { User } from "../types/timetable.types";
import {
  WEEK_DAYS,
  type ArabicDay,
  isSummerTime as isSummerTimeFromTimezone,
  getWeekDates as getWeekDatesFromTimezone,
  formatDateForAPI as formatDateForAPIFromTimezone,
  getTodayDate as getTodayDateFromTimezone,
  isSameDay as isSameDayFromTimezone,
  getArabicDayFromDate,
  TIMEZONE,
  formatDateArabic as formatDateArabicFromTimezone,
  formatDateShort as formatDateShortFromTimezone
} from "@/utils/timezone";

// Re-export من timezone.ts للتوافق مع الاستخدامات الحالية
export { WEEK_DAYS, TIMEZONE };
export type { ArabicDay };

/**
 * تحديد إذا كان التوقيت صيفي أو شتوي
 * ✅ يستخدم timezone.ts
 */
export const isSummerTime = isSummerTimeFromTimezone;

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
// ⏰ دوال تطبيع الأوقات - لحل مشاكل المطابقة
// ============================================================================

/**
 * تحويل الوقت لدقائق منذ منتصف الليل
 * مثال: "1:30 PM" -> 810
 */
export const timeToMinutes = (timeStr: string): number => {
  if (!timeStr) return -1;
  
  const normalized = timeStr.trim().toUpperCase();
  const match = normalized.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);
  
  if (!match) return -1;
  
  let hour = parseInt(match[1], 10);
  const minute = parseInt(match[2], 10);
  const period = match[3];
  
  // تحويل لـ 24 ساعة
  if (period === 'PM' && hour !== 12) {
    hour += 12;
  } else if (period === 'AM' && hour === 12) {
    hour = 0;
  }
  
  return hour * 60 + minute;
};

/**
 * تطبيع صيغة الوقت
 * "01:00 PM" -> "1:00 PM"
 * "1:00  pm" -> "1:00 PM"
 */
export const normalizeTimeFormat = (timeStr: string): string => {
  if (!timeStr) return "";
  
  const normalized = timeStr.trim().toUpperCase();
  const match = normalized.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);
  
  if (!match) return timeStr;
  
  const hour = parseInt(match[1], 10);
  const minute = match[2];
  const period = match[3];
  
  return `${hour}:${minute} ${period}`;
};

/**
 * مقارنة وقتين بتحويلهما للدقائق
 */
export const areTimesEqual = (time1: string, time2: string): boolean => {
  return timeToMinutes(time1) === timeToMinutes(time2);
};

/**
 * البحث عن index الوقت في قائمة باستخدام الدقائق
 * يتجنب مشاكل الـ format المختلفة
 */
export const findTimeIndex = (hoursArray: string[], targetTime: string): number => {
  const targetMinutes = timeToMinutes(targetTime);
  if (targetMinutes === -1) return -1;
  
  return hoursArray.findIndex(h => timeToMinutes(h) === targetMinutes);
};

/**
 * التحقق إذا كان الوقت موجود في القائمة
 */
export const isTimeInArray = (hoursArray: string[], targetTime: string): boolean => {
  return findTimeIndex(hoursArray, targetTime) !== -1;
};

// ============================================================================
// 📅 دوال التاريخ الجديدة (بدلاً من day)
// ============================================================================

/**
 * الحصول على اسم اليوم العربي من التاريخ
 * ✅ يستخدم timezone.ts
 * @param dateStr - التاريخ (ISO أو YYYY-MM-DD)
 */
export const getDayNameFromDate = getArabicDayFromDate;

/**
 * تنسيق التاريخ للإرسال للـ API
 * ✅ يستخدم timezone.ts
 * @param date - كائن Date أو string (ISO/YYYY-MM-DD)
 * @returns YYYY-MM-DD
 */
export const formatDateForAPI = formatDateForAPIFromTimezone;

/**
 * تنسيق التاريخ للعرض بالعربية
 * ✅ يستخدم timezone.ts
 * @param dateStr - التاريخ (ISO أو YYYY-MM-DD)
 */
export const formatDateForDisplay = (dateStr: string): string => {
  return formatDateArabicFromTimezone(dateStr);
};

/**
 * تنسيق التاريخ المختصر للعرض
 * ✅ يستخدم timezone.ts
 * @param dateStr - التاريخ (ISO أو YYYY-MM-DD)
 */
export const formatDateShort = (dateStr: string): string => {
  return formatDateShortFromTimezone(dateStr);
};

/**
 * الحصول على تاريخ اليوم بصيغة YYYY-MM-DD
 * ✅ يستخدم timezone.ts
 */
export const getTodayDate = getTodayDateFromTimezone;

/**
 * التحقق إذا كان تاريخان في نفس اليوم
 * ✅ يستخدم timezone.ts
 */
export const isSameDay = isSameDayFromTimezone;

/**
 * إنشاء تواريخ أسبوع من تاريخ معين (السبت - الجمعة)
 * ✅ يستخدم timezone.ts
 */
export const getWeekDates = getWeekDatesFromTimezone;

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

// ✅ timeToMinutes معرفة أعلاه في السطر 75 - لا نحتاج لتكرارها

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

// ============================================================================
// ✅ Data Validation - التحقق من صحة البيانات قبل الإرسال
// ============================================================================

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

interface SessionFormDataForValidation {
  sessionDate?: string;
  startHour?: string;
  endHour?: string;
  note?: string;
  teacherId?: string;
}

/**
 * التحقق من صحة بيانات الموعد
 * @param data - بيانات النموذج
 * @returns نتيجة التحقق مع الأخطاء إن وجدت
 */
export const validateSessionData = (data: SessionFormDataForValidation): ValidationResult => {
  const errors: string[] = [];

  // ✅ 1. التحقق من التاريخ
  if (!data.sessionDate) {
    errors.push('التاريخ مطلوب');
  } else {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    const isValidFormat = dateRegex.test(data.sessionDate) || 
                         !isNaN(Date.parse(data.sessionDate));
    if (!isValidFormat) {
      errors.push('صيغة التاريخ غير صحيحة');
    } else {
      const sessionDate = new Date(data.sessionDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // السماح بالتواريخ السابقة فقط لمدة أسبوع
      const oneWeekAgo = new Date(today);
      oneWeekAgo.setDate(today.getDate() - 7);
      
      if (sessionDate < oneWeekAgo) {
        errors.push('لا يمكن إضافة موعد لتاريخ قبل أسبوع من اليوم');
      }
    }
  }

  // ✅ 2. التحقق من وقت البداية
  if (!data.startHour) {
    errors.push('وقت البداية مطلوب');
  } else {
    const timeRegex = /^(0?[1-9]|1[0-2]):(00|30)\s?(AM|PM)$/i;
    if (!timeRegex.test(data.startHour.trim())) {
      errors.push('صيغة وقت البداية غير صحيحة (مثال: 2:00 PM)');
    }
  }

  // ✅ 3. التحقق من وقت النهاية
  if (!data.endHour) {
    errors.push('وقت النهاية مطلوب');
  } else {
    const timeRegex = /^(0?[1-9]|1[0-2]):(00|30)\s?(AM|PM)$/i;
    if (!timeRegex.test(data.endHour.trim())) {
      errors.push('صيغة وقت النهاية غير صحيحة (مثال: 3:30 PM)');
    }
  }

  // ✅ 4. التحقق من ترتيب الأوقات
  if (data.startHour && data.endHour) {
    const startMinutes = timeToMinutes(data.startHour);
    const endMinutes = timeToMinutes(data.endHour);
    
    if (startMinutes >= endMinutes) {
      errors.push('وقت النهاية يجب أن يكون بعد وقت البداية');
    }
    
    // التحقق من أن المدة معقولة (30 دقيقة - 4 ساعات)
    const duration = endMinutes - startMinutes;
    if (duration < 30) {
      errors.push('مدة الحصة يجب أن تكون 30 دقيقة على الأقل');
    }
    if (duration > 240) {
      errors.push('مدة الحصة لا يمكن أن تتجاوز 4 ساعات');
    }
  }

  // ✅ 5. التحقق من اسم الحلقة (اختياري لكن إذا موجود يجب أن يكون صحيح)
  if (data.note && data.note.trim().length > 100) {
    errors.push('اسم الحلقة طويل جداً (الحد الأقصى 100 حرف)');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * تنظيف وتنسيق بيانات الموعد
 * @param data - البيانات الخام
 * @returns البيانات المنظفة
 */
export const sanitizeSessionData = <T extends SessionFormDataForValidation>(data: T): T => {
  return {
    ...data,
    sessionDate: data.sessionDate?.trim(),
    startHour: data.startHour?.trim(),
    endHour: data.endHour?.trim(),
    note: data.note?.trim(),
  };
};
