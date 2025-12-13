/**
 * دوال مساعدة للتعامل مع بيانات المستخدمين
 */

/**
 * الحصول على الاسم الكامل للمستخدم
 * @param user - كائن المستخدم
 * @returns الاسم الكامل
 */
export const getFullName = (user: {
  firstName?: string;
  fatherName?: string;
  grandFatherName?: string;
  lastName?: string;
}): string => {
  return [
    user.firstName,
    user.fatherName,
    user.grandFatherName,
    user.lastName,
  ]
    .filter(Boolean)
    .join(" ")
    .trim() || "-";
};

/**
 * الحصول على الاسم الكامل للمعلم (بدون grandFatherName)
 * @param teacher - كائن المعلم
 * @returns الاسم الكامل
 */
export const getTeacherFullName = (teacher: {
  firstName?: string;
  fatherName?: string;
  grandFatherName?: string;
  lastName?: string;
}): string => {
  return [
    teacher.firstName,
    teacher.fatherName,
    teacher.grandFatherName,
    teacher.lastName,
  ]
    .filter(Boolean)
    .join(" ")
    .trim() || "غير محدد";
};
