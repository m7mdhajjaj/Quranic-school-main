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
 * @param date - كائن Date أو string (ISO/YYYY-MM-DD)
 * @returns YYYY-MM-DD
 */
export const formatDateForAPI = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
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
