/**
 * ============================================================================
 * Section Validation - Frontend UI Layer (V7)
 * ============================================================================
 * 
 * تحقق المقاطع - يطابق Backend DailyMarksSectionValidation.js
 * 
 * Backend Endpoints:
 * - POST /api/daily-marks/sections       → validateDailyMarksSectionData
 * - PUT  /api/daily-marks/sections/:id   → validateDailyMarksSectionData
 * - POST /api/daily-marks/sections/complete-surah    → validateActiveSurahData
 * - POST /api/daily-marks/sections/reset-active-surah → validateActiveSurahData
 * 
 * V7 Features:
 * ✅ UI Validation Only: Quick feedback before API call
 * ✅ Backend validates via SectionSequenceService:
 *    - Current week only (Sat-Fri)
 *    - Daily/Weekly quotas
 *    - Flexible review ranges (1-50 ayahs)
 *    - Review cannot exceed last memorized
 *    - Active Surah enforcement
 */

import * as yup from 'yup';
import { isValidObjectId, sanitizeText, isRequired } from './helpers';

// ============================================================================
// TYPES - الأنواع
// ============================================================================

export interface QuranSegmentData {
  surahNumber?: number;
  surahNameCanonical?: string;
  ayahStart?: number;
  ayahEnd?: number;
}

export interface SectionFormData {
  date: string;
  
  // Legacy Strings (Display)
  reviewSection?: string;
  memorizationSection?: string;

  // New Structured Data (Source of Truth)
  memorizationMeta?: QuranSegmentData[];
  reviewMeta?: QuranSegmentData[];

  group?: string;
  teacher?: string;
}

export interface ActiveSurahFormData {
  groupId: string;
  type: 'memorization' | 'review';
}

// ============================================================================
// HELPERS - دوال مساعدة
// ============================================================================

/**
 * Sanitize section data
 * Matches Backend sanitizeSectionData function
 */
export const sanitizeSectionData = (data: Partial<SectionFormData>): Partial<SectionFormData> => {
  const sanitized: Partial<SectionFormData> = {};

  if (data.date !== undefined) sanitized.date = sanitizeText(data.date);
  if (data.reviewSection !== undefined) sanitized.reviewSection = sanitizeText(data.reviewSection);
  if (data.memorizationSection !== undefined) sanitized.memorizationSection = sanitizeText(data.memorizationSection);
  if (data.memorizationMeta !== undefined) sanitized.memorizationMeta = data.memorizationMeta;
  if (data.reviewMeta !== undefined) sanitized.reviewMeta = data.reviewMeta;
  if (data.group !== undefined) sanitized.group = sanitizeText(data.group);
  if (data.teacher !== undefined) sanitized.teacher = sanitizeText(data.teacher);

  return sanitized;
};

/**
 * Validate section data before submission
 */
export const validateSectionData = (data: SectionFormData): {
  isValid: boolean;
  errors: string[];
  sanitizedData: Partial<SectionFormData>;
} => {
  const errors: string[] = [];
  const sanitizedData = sanitizeSectionData(data);

  // ✅ V7: Date validation moved to useAutoValidateSchedule hook
  // No need to duplicate here - just check if present
  if (!isRequired(data.date)) {
    errors.push('التاريخ مطلوب');
  }

  // Check at least one section
  const hasMem = isRequired(data.memorizationSection) || 
    (data.memorizationMeta && data.memorizationMeta.length > 0);
  const hasRev = isRequired(data.reviewSection) || 
    (data.reviewMeta && data.reviewMeta.length > 0);
  
  if (!hasMem && !hasRev) {
    errors.push('يجب إدخال مقطع حفظ أو مقطع مراجعة على الأقل');
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedData,
  };
};

// ============================================================================
// VALIDATION SCHEMAS - مخططات التحقق
// ============================================================================

/**
 * Validation for a single Quran Segment
 */
export const quranSegmentSchema = yup.object<QuranSegmentData>({
  surahNumber: yup
    .number()
    .required('رقم السورة مطلوب')
    .min(1, 'رقم السورة يجب أن يكون 1 أو أكثر')
    .max(114, 'رقم السورة يجب أن يكون 114 أو أقل'),

  surahNameCanonical: yup.string().optional(),

  ayahStart: yup
    .number()
    .required('آية البداية مطلوبة')
    .min(1, 'آية البداية يجب أن تكون 1 أو أكثر'),

  ayahEnd: yup
    .number()
    .required('آية النهاية مطلوبة')
    .min(yup.ref('ayahStart'), 'نهاية المقطع يجب أن تكون بعد بدايته'),
});

/**
 * Validation schema for creating/updating sections
 * Matches Backend validateDailyMarksSectionData middleware
 * 
 * ✅ V7: UI-layer validation only (format checks + basic UX)
 * - Date format validation moved to useAutoValidateSchedule hook
 * - Basic consistency checks for immediate UX feedback
 */
export const sectionValidationSchema = yup.object<SectionFormData>({
  date: yup
    .string()
    .required('التاريخ مطلوب'),
    // ✅ V7: Format validation handled by useAutoValidateSchedule hook

  memorizationMeta: yup.array().of(quranSegmentSchema).optional(),
  reviewMeta: yup.array().of(quranSegmentSchema).optional(),

  reviewSection: yup
    .string()
    .optional()
    .max(200, 'اسم المقطع يجب أن يكون 200 حرف أو أقل'),

  memorizationSection: yup
    .string()
    .optional()
    .max(200, 'اسم المقطع يجب أن يكون 200 حرف أو أقل'),

  group: yup
    .string()
    .optional()
    .max(200, 'اسم الحلقة يجب أن يكون 200 حرف أو أقل'),

  teacher: yup
    .string()
    .optional()
    .max(200, 'اسم المعلم يجب أن يكون 200 حرف أو أقل'),
}).test(
  'at-least-one-section',
  'يجب إدخال مقطع حفظ أو مقطع مراجعة على الأقل',
  (value) => {
    const v = value as SectionFormData;
    const hasMem = v?.memorizationSection?.trim() || 
      (v?.memorizationMeta && Array.isArray(v.memorizationMeta) && v.memorizationMeta.length > 0);
    const hasRev = v?.reviewSection?.trim() || 
      (v?.reviewMeta && Array.isArray(v.reviewMeta) && v.reviewMeta.length > 0);
    return Boolean(hasMem || hasRev);
  }
).test(
  'consistency-check',
  'خطأ في اتساق البيانات المنطقي',
  function(value) {
    // ============================================================================
    // ✅ V9: UI-Layer Consistency Check (Quick UX Feedback)
    // ============================================================================
    const v = value as SectionFormData;
    if (!v?.memorizationMeta || !v?.reviewMeta) return true;
    
    const mems = (v.memorizationMeta || []) as QuranSegmentData[];
    const revs = (v.reviewMeta || []) as QuranSegmentData[];

    if (mems.length === 0 || revs.length === 0) return true;

    for (const rev of revs) {
      const matchingMems = mems.filter(m => m.surahNumber === rev.surahNumber);
      
      for (const mem of matchingMems) {
        // ✅ V9: Rule 1 - No Review if Memorization Starts at 1 (first time memorizing)
        if (mem.ayahStart === 1) {
          return this.createError({
            path: 'reviewMeta',
            message: `🚫 غير منطقي: لا يمكن مراجعة سورة ${rev.surahNameCanonical || ''} لأنك بدأت حفظها الآن (من الآية 1). يجب حفظها أولاً ثم مراجعتها في يوم لاحق.`
          });
        }

        // ✅ V9: Rule 2 - Review end must be < Memorization start (same surah)
        if (rev.ayahEnd !== undefined && mem.ayahStart !== undefined) {
          if (rev.ayahEnd >= mem.ayahStart) {
            return this.createError({
              path: 'reviewMeta',
              message: `🚫 نهاية المراجعة (${rev.ayahEnd}) يجب أن تكون أقل من بداية الحفظ (${mem.ayahStart}). المراجعة تكون للمحفوظات السابقة فقط (1 إلى ${mem.ayahStart - 1}).`
            });
          }
        }
      }
    }

    return true;
  }
);

/**
 * Validation schema for Active Surah operations
 * Matches Backend validateActiveSurahData middleware
 */
export const activeSurahValidationSchema = yup.object<ActiveSurahFormData>({
  groupId: yup
    .string()
    .required('معرف الحلقة مطلوب')
    .test('valid-objectid', 'معرف الحلقة غير صحيح', (value) => 
      isValidObjectId(value)
    ),

  type: yup
    .string()
    .required('نوع السورة مطلوب')
    .oneOf(['memorization', 'review'], 'النوع يجب أن يكون memorization أو review'),
});

// ============================================================================
// CONSISTENCY VALIDATION - التحقق من الاتساق (V7)
// ============================================================================

/**
 * UI Segment type (with error field)
 */
export interface QuranSegmentUI extends QuranSegmentData {
  error?: string;
}

/**
 * Validates the consistency between memorization and review segments.
 * Uses the shared Yup schema but returns a clean array of error messages.
 * 
 * ✅ V7: This is UI-layer validation only (quick feedback)
 * Backend performs deeper date-aware validation in SectionSequenceService
 */
export const validateSectionConsistency = (
  memorizationMeta: QuranSegmentUI[] = [],
  reviewMeta: QuranSegmentUI[] = []
): string[] => {
  const errors: string[] = [];

  // 1. Run Yup Schema Validation for Consistency
  try {
    sectionValidationSchema.validateSync(
      {
        date: '2023-01-01', // Dummy date to clear the date check
        memorizationMeta,
        reviewMeta,
      },
      { abortEarly: false }
    );
  } catch (err: unknown) {
    if (err instanceof yup.ValidationError) {
      err.inner.forEach((validationError) => {
        // We filter for reviewMeta errors or general consistency checks
        if (
          validationError.path === 'reviewMeta' ||
          validationError.type === 'consistency-check'
        ) {
           // Avoid duplicates if possible
           if (!errors.includes(validationError.message)) {
               errors.push(validationError.message);
           }
        }
      });
    }
  }

  // 2. Aggregate internal segment-specific errors
  const collectSegmentErrors = (segments: QuranSegmentUI[], label: string) => {
    segments.forEach((seg, idx) => {
        if (seg.error && !errors.includes(seg.error)) {
            errors.push(`${label} (${idx + 1}): ${seg.error}`);
        }
    });
  };

  collectSegmentErrors(reviewMeta, 'المراجعة');
  collectSegmentErrors(memorizationMeta, 'الحفظ');

  return errors;
};
