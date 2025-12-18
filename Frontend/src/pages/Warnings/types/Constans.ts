// ============================================================================
// Warning Utils - دوال مساعدة للإنذارات
// ============================================================================

import type { WarningType } from "./warnings";

/**
 * الحصول على عنوان الإنذار
 */
export const getWarningTitle = (type: WarningType): string => {
  const titles: Record<WarningType, string> = {
    warning: "⚠️ إعطاء تنبيه",
    first: "🔴 الإنذار الأول",
    second: "🔴🔴 الإنذار الثاني",
    third: "🔴🔴🔴 الإنذار الثالث",
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
    warning: "⚠️ تنبيه فقط - تحذير من الإنذار في المرة القادمة",
    first: "� الإنذار الأول",
    second: "🔴 الإنذار الثاني",
    third: "🔴 الإنذار الثالث",
  };
  return descriptions[type];
};

/**
 * الحصول على لون gradient الإنذار
 */
export const getWarningColor = (type: string): string => {
  const colors: Record<string, string> = {
    warning: "from-yellow-400 to-orange-500",
    first: "from-orange-500 to-red-500",
    second: "from-red-500 to-red-600",
    third: "from-red-600 to-red-700",
  };
  return colors[type] || "from-gray-400 to-gray-600";
};

/**
 * الحصول على أيقونة الإنذار
 */
export const getWarningIcon = (type: string): string => {
  const icons: Record<string, string> = {
    warning: "⚠️",
    first: "🔴",
    second: "🔴🔴",
    third: "🔴🔴🔴",
  };
  return icons[type] || "⚠️";
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
