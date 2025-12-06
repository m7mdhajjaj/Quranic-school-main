// ============================================================================
// Timetable Helpers - دوال مساعدة لجدول الحصص
// ============================================================================

import type { User } from "../types/timetable.types";

/**
 * توليد ساعات العمل من 12:00 PM إلى 9:00 PM فقط
 * النطاق: 12:00 PM (الظهر) → 9:00 PM (مساءً)
 */
export const generateHours = (): string[] => {

  const hours: string[] = [];
  
  // PM Hours only: 12:00 PM - 9:00 PM
  for (let h = 12; h <= 21; h++) {
    const display12 = h === 12 ? 12 : h > 12 ? h - 12 : h;
    hours.push(`${display12}:00 PM`);
    // Add :30 for all hours except 9 PM (last allowed time is 9:00 PM)
    if (h < 21) {
      hours.push(`${display12}:30 PM`);
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
