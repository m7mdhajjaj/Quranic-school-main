// ============================================================================
// suspension.ts - DEPRECATED - استخدم warnings.ts و Constans.ts بدلاً من ذلك
// ============================================================================

/**
 * ⚠️ هذا الملف قديم ولم يعد مستخدماً
 * 
 * جميع الأنواع والدوال متوفرة في:
 * - types/warnings.ts - للأنواع والـ interfaces
 * - types/Constans.ts - للدوال المساعدة والـ constants
 * 
 * الرجاء استخدام الملفات الجديدة بدلاً من هذا الملف
 */

// Re-export من الملفات الجديدة للتوافق المؤقت
export type { 
  WarningType,
  Student,
  Group,
  Warning
} from './warnings';

export { 
  getWarningLabel as getWarningTypeLabel,
  canGiveWarningBySequence as canGiveWarning
} from './Constans';
