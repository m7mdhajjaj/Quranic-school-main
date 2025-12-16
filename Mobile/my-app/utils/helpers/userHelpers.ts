/**
 * دوال مساعدة للتعامل مع بيانات المستخدمين في React Native
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
  return (
    [user.firstName, user.fatherName, user.grandFatherName, user.lastName]
      .filter(Boolean)
      .join(" ")
      .trim() || "-"
  );
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
  return (
    [
      teacher.firstName,
      teacher.fatherName,
      teacher.grandFatherName,
      teacher.lastName,
    ]
      .filter(Boolean)
      .join(" ")
      .trim() || "غير محدد"
  );
};

/**
 * الحصول على الاسم المختصر (الاسم الأول والأخير فقط)
 * @param user - كائن المستخدم
 * @returns الاسم المختصر
 */
export const getShortName = (user: {
  firstName?: string;
  lastName?: string;
}): string => {
  return (
    [user.firstName, user.lastName].filter(Boolean).join(" ").trim() || "-"
  );
};

/**
 * الحصول على الحروف الأولى من الاسم (للأفاتار)
 * @param name - الاسم الكامل أو كائن المستخدم
 * @returns الحروف الأولى (حرفين)
 */
export const getInitials = (
  name: string | { firstName?: string; lastName?: string }
): string => {
  if (typeof name === "string") {
    const parts = name.split(" ").filter(Boolean);
    if (parts.length === 0) return "؟";
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (
      parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
    ).toUpperCase();
  } else {
    const firstName = name.firstName?.charAt(0) || "";
    const lastName = name.lastName?.charAt(0) || "";
    return (firstName + lastName).toUpperCase() || "؟";
  }
};
