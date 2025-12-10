/**
 * دوال مساعدة لإدارة المعلمين
 */

/**
 * دالة للحصول على اسم الحلقة بشكل آمن
 */
export const getGroupDisplayName = (
  group:
    | string
    | { name?: string; id?: string; number?: number }
    | null
    | undefined
): string => {
  if (!group) return "حلقة غير محددة";
  if (typeof group === "string") return group;
  return group.name || "حلقة غير محددة";
};

/**
 * دالة لتنسيق الاسم الكامل للمعلم
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
    .join(" ");
};

/**
 * دالة لتنسيق التاريخ بصيغة عربية
 */
export const formatDateArabic = (date: string | Date | null | undefined): string => {
  if (!date) return "غير محدد";
  try {
    return new Date(date).toLocaleDateString("ar-EG");
  } catch {
    return "غير محدد";
  }
};

/**
 * دالة لتنسيق التاريخ والوقت بصيغة عربية
 */
export const formatDateTimeArabic = (date: string | Date | null | undefined): string => {
  if (!date) return "غير محدد";
  try {
    return new Date(date).toLocaleString("ar-EG");
  } catch {
    return "غير محدد";
  }
};

/**
 * دالة للتحقق من وجود بيانات التواصل
 */
export const hasContactInfo = (teacher: {
  phoneNumber?: string;
  email?: string;
  residence?: string;
}): boolean => {
  return !!(teacher.phoneNumber || teacher.email || teacher.residence);
};

/**
 * دالة لحساب عدد الحلقات
 */
export const getGroupsCount = (groups: any[] | null | undefined): number => {
  if (!groups || !Array.isArray(groups)) return 0;
  return groups.length;
};

/**
 * دالة للحصول على حالة نشاط المعلم
 */
export const getActivityStatus = (isActive?: boolean): {
  label: string;
  className: string;
} => {
  if (isActive) {
    return {
      label: "نشط",
      className: "bg-green-100 text-green-800",
    };
  }
  return {
    label: "غير نشط",
    className: "bg-gray-100 text-gray-800",
  };
};

/**
 * دالة للحصول على نمط الجنس
 */
export const getGenderStyle = (gender?: string): {
  className: string;
  icon: "male" | "female" | null;
} => {
  if (gender === "ذكر" || gender === "male") {
    return {
      className: "bg-blue-50 text-blue-700 border border-blue-200",
      icon: "male",
    };
  }
  if (gender === "أنثى" || gender === "female") {
    return {
      className: "bg-pink-50 text-pink-700 border border-pink-200",
      icon: "female",
    };
  }
  return {
    className: "bg-gray-50 text-gray-700 border border-gray-200",
    icon: null,
  };
};
