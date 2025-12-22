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
    expulsion: "فصل الطالب",
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
    expulsion: "فصل نهائي من الحلقة",
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
 * الحصول على نوع Badge variant للإنذار
 */
export const getWarningBadgeVariant = (
  type: string
): "warning" | "danger" | "gray" => {
  switch (type) {
    case "warning":
      return "warning";
    case "expulsion":
      return "gray";
    default:
      return "danger";
  }
};

/**
 * الحصول على اسم أيقونة الإنذار
 */
export const getWarningIconType = (type: string): string => {
  switch (type) {
    case 'warning':
      return 'AlertTriangle';
    case 'first':
      return 'AlertCircle';
    case 'second':
    case 'third':
      return 'ShieldAlert';
    case 'expulsion':
      return 'XCircle';
    default:
      return 'AlertTriangle';
  }
};

/**
 * الحصول على ألوان الإنذار للـ Progress Bars والـ Badges
 */
export const getWarningColorClasses = (type: string) => {
  const colors = {
    warning: {
      bg: 'bg-amber-500',
      light: 'bg-amber-100',
      text: 'text-amber-700',
    },
    first: {
      bg: 'bg-yellow-500',
      light: 'bg-yellow-100',
      text: 'text-yellow-700',
    },
    second: {
      bg: 'bg-orange-500',
      light: 'bg-orange-100',
      text: 'text-orange-700',
    },
    third: {
      bg: 'bg-rose-500',
      light: 'bg-rose-100',
      text: 'text-rose-700',
    },
    expulsion: {
      bg: 'bg-red-600',
      light: 'bg-red-100',
      text: 'text-red-700',
    },
  };
  return colors[type as keyof typeof colors] || colors.warning;
};

/**
 * ألوان الميداليات للترتيب (ذهبي، فضي، برونزي)
 */
export const MEDAL_COLORS = [
  'from-amber-400 to-yellow-500',
  'from-gray-300 to-gray-400',
  'from-orange-400 to-amber-600',
] as const;

/**
 * مفاتيح أنواع الإنذارات
 */
export const WARNING_TYPE_KEYS = ['warning', 'first', 'second', 'third'] as const;

export type WarningTypeKey = typeof WARNING_TYPE_KEYS[number];

/**
 * التحقق إذا كان الإنذار يمكن تكراره
 */
export const canRepeatWarning = (type: WarningType): boolean => {
  return type === "warning";
};

/**
 * التحقق من إمكانية إعطاء إنذار معين (حسب الترتيب)
 */
export const canGiveWarningBySequence = (
  type: WarningType,
  existingTypes: string[]
): { canGive: boolean; reason?: string } => {
  if (type === 'warning') {
    return { canGive: true };
  }

  const hasFirst = existingTypes.includes('first');
  const hasSecond = existingTypes.includes('second');
  const hasThird = existingTypes.includes('third');

  switch (type) {
    case 'first':
      return hasFirst
        ? { canGive: false, reason: 'الطالب حاصل على الإنذار الأول مسبقاً' }
        : { canGive: true };

    case 'second':
      if (!hasFirst) {
        return { canGive: false, reason: 'يجب إعطاء الإنذار الأول أولاً' };
      }
      return hasSecond
        ? { canGive: false, reason: 'الطالب حاصل على الإنذار الثاني مسبقاً' }
        : { canGive: true };

    case 'third':
      if (!hasFirst || !hasSecond) {
        return { canGive: false, reason: 'يجب إعطاء الإنذار الأول والثاني أولاً' };
      }
      return hasThird
        ? { canGive: false, reason: 'الطالب حاصل على الإنذار الثالث مسبقاً' }
        : { canGive: true };

    default:
      return { canGive: false, reason: 'نوع إنذار غير صحيح' };
  }
};

// إعادة تصدير من utils/helpers
export { formatArabicDate } from "@/utils/helpers/dateHelpers";

// ============================================================================
// Student History & Expulsion - Constants & Helpers
// ============================================================================

export type StudentEventType = 
  | 'WARNING' 
  | 'WARNING_ESCALATION' 
  | 'WARNING_REMOVAL' 
  | 'SUSPENSION' 
  | 'EXPULSION' 
  | 'RESTORATION';

/**
 * الحصول على تسمية حدث الطالب
 */
export const getEventLabel = (eventType: StudentEventType): string => {
  const labels: Record<StudentEventType, string> = {
    WARNING: 'إنذار',
    WARNING_ESCALATION: 'تصعيد إنذار',
    WARNING_REMOVAL: 'حذف إنذار',
    SUSPENSION: 'تعليق',
    EXPULSION: 'فصل',
    RESTORATION: 'استعادة',
  };
  return labels[eventType] || eventType;
};

/**
 * الحصول على لون CSS لحدث الطالب
 */
export const getEventColor = (eventType: StudentEventType): string => {
  const colors: Record<StudentEventType, string> = {
    WARNING: 'bg-orange-50 border-orange-200',
    WARNING_ESCALATION: 'bg-red-50 border-red-200',
    WARNING_REMOVAL: 'bg-green-50 border-green-200',
    SUSPENSION: 'bg-orange-50 border-orange-200',
    EXPULSION: 'bg-red-50 border-red-200',
    RESTORATION: 'bg-emerald-50 border-emerald-200',
  };
  return colors[eventType] || 'bg-gray-50 border-gray-200';
};

/**
 * الحصول على لون الأيقونة لحدث الطالب
 */
export const getEventIconColor = (eventType: StudentEventType): string => {
  const colors: Record<StudentEventType, string> = {
    WARNING: 'text-orange-600',
    WARNING_ESCALATION: 'text-red-600',
    WARNING_REMOVAL: 'text-green-600',
    SUSPENSION: 'text-orange-600',
    EXPULSION: 'text-red-600',
    RESTORATION: 'text-emerald-600',
  };
  return colors[eventType] || 'text-gray-600';
};

/**
 * تنسيق التاريخ بالعربية مع الوقت
 */
export const formatEventDate = (date: string): string => {
  return new Date(date).toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};
