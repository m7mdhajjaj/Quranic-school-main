// ============================================================================
// Warning Utils - دوال مساعدة للإنذارات
// ============================================================================

import type { WarningType } from "./warnings";

/**
 * الحصول على عنوان الإنذار
 */
export const getWarningTitle = (type: WarningType): string => {
  const titles: Record<WarningType, string> = {
    warning: "إعطاء تنبيه",
    first: "الإنذار الأول",
    second: "الإنذار الثاني",
    third: "الإنذار الثالث",
  };
  return titles[type];
};

/**
 * الحصول على تسمية الإنذار
 */
export const getWarningLabel = (type: string): string => {
  const labels: Record<string, string> = {
    warning: "تنبيه",
    first: "الإنذار الأول",
    second: "الإنذار الثاني",
    third: "الإنذار الثالث",
  };
  return labels[type] || type;
};

/**
 * الحصول على وصف الإنذار
 */
export const getWarningDescription = (type: WarningType): string => {
  const descriptions: Record<WarningType, string> = {
    warning: "تنبيه بسيط - تحذير من الإنذار في المرة القادمة",
    first: "إنذار رسمي أول",
    second: "إنذار رسمي ثانٍ",
    third: "إنذار نهائي - قد يؤدي للفصل",
  };
  return descriptions[type];
};

/**
 * الحصول على لون gradient الإنذار
 */
export const getWarningColor = (type: string): string => {
  const colors: Record<string, string> = {
    warning: "from-amber-400 via-yellow-500 to-orange-500",
    first: "from-orange-500 via-red-400 to-rose-500",
    second: "from-red-500 via-rose-500 to-pink-600",
    third: "from-rose-600 via-red-700 to-red-800",
  };
  return colors[type] || "from-gray-400 to-gray-600";
};

/**
 * الحصول على نوع الإنذار من Badge variant
 */
export const getWarningVariant = (
  type: string
): "warning" | "danger" => {
  switch (type) {
    case "warning":
      return "warning";
    default:
      return "danger";
  }
};

/**
 * التحقق إذا كان الإنذار يمكن تكراره
 */
export const canRepeatWarning = (type: WarningType): boolean => {
  return type === "warning";
};

// إعادة تصدير من utils/helpers
export { formatArabicDate } from "@/utils/helpers/dateHelpers";
