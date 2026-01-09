import * as yup from "yup";

/**
 * ============================================================================
 * DailyMarks Validation Schema
 * ============================================================================
 * 
 * Validation schemas for DailyMarks forms using Yup
 * - Section validation (for creating/updating sections)
 * - Mark validation (for creating/updating marks)
 * - Arabic error messages
 */

// ============================================================================
// LOCALIZATION - عربي
// ============================================================================

yup.setLocale({
  mixed: {
    required: "${path} مطلوب",
    notType: "${path} يجب أن يكون من نوع ${type}",
  },
  string: {
    min: "${path} يجب أن يحتوي على ${min} أحرف على الأقل",
    max: "${path} يجب ألا يتجاوز ${max} حرف",
    matches: "${path} لا يطابق التنسيق المطلوب",
  },
  number: {
    min: "${path} يجب أن يكون ${min} أو أكثر",
    max: "${path} يجب أن يكون ${max} أو أقل",
    positive: "${path} يجب أن يكون رقماً موجباً",
  },
  date: {
    min: "التاريخ يجب أن يكون بعد ${min}",
    max: "التاريخ يجب أن يكون قبل ${max}",
  },
});

// ============================================================================
// SECTION VALIDATION
// ============================================================================

export interface QuranSegmentData {
  surahNumber?: number;
  surahNameCanonical?: string;
  ayahStart?: number;
  ayahEnd?: number;
}

export interface SectionFormData {
  date: string;
  
  // Legacy Strings (Managed/Auto-filled by UI)
  reviewSection?: string;
  memorizationSection?: string;

  // New Structured Data
  memorizationMeta?: QuranSegmentData[];
  reviewMeta?: QuranSegmentData[];

  group?: string;
  teacher?: string;
}

/**
 * Validation for a single Quran Segment
 */
export const quranSegmentSchema = yup.object({
  surahNumber: yup.number().required("رقم السورة مطلوب").min(1).max(114),
  surahNameCanonical: yup.string().optional(),
  ayahStart: yup.number().required("الآية من").min(1),
  ayahEnd: yup.number().required("الآية إلى")
     .min(yup.ref('ayahStart'), "نهاية المقطع يجب أن تكون بعد بدايته")
});

/**
 * Validation schema for creating/updating sections
 */
export const sectionValidationSchema = yup.object<SectionFormData>({
  date: yup
    .string()
    .required("التاريخ مطلوب")
    .matches(
      /^\d{4}-\d{2}-\d{2}$/,
      "صيغة التاريخ غير صحيحة (YYYY-MM-DD)"
    ),
  
  memorizationMeta: yup.array().of(quranSegmentSchema).optional(),
  reviewMeta: yup.array().of(quranSegmentSchema).optional(),

  reviewSection: yup.string().optional(),
  memorizationSection: yup.string().optional(),
  
  group: yup
    .string()
    .optional()
    .min(2, "اسم الحلقة يجب أن يكون 2 أحرف على الأقل")
    .max(50, "اسم الحلقة يجب ألا يتجاوز 50 حرف"),
  
  teacher: yup
    .string()
    .optional()
    .min(2, "اسم المعلم يجب أن يكون 2 أحرف على الأقل")
    .max(50, "اسم المعلم يجب ألا يتجاوز 50 حرف"),
}).test(
  'at-least-one-section',
  'يجب إدخال مقطع حفظ أو مقطع مراجعة على الأقل',
  (value: any) => {
    // Safety check with optional chaining
    const hasMem = (value?.memorizationSection?.trim()) || (value?.memorizationMeta?.length > 0);
    const hasRev = (value?.reviewSection?.trim()) || (value?.reviewMeta?.length > 0);
    return Boolean(hasMem || hasRev);
  }
).test(
  'consistency-check',
  'خطأ في اتساق البيانات المنطقي',
  function(value: any) {
    // ==========================================================
    // Strict Consistency Check (Frontend Mirror of Backend Rules)
    // ==========================================================
    if (!value?.memorizationMeta || !value?.reviewMeta) return true;
    
    // Explicitly casting to avoid TypeErrors
    const mems = (value.memorizationMeta || []) as QuranSegmentData[];
    const revs = (value.reviewMeta || []) as QuranSegmentData[];

    if (mems.length === 0 || revs.length === 0) return true;

    for (const rev of revs) {
       // Find memorization for the SAME Surah in THIS request
       // (This mimics the "Cross-Consistency" check in Backend)
       const matchingMems = mems.filter(m => m.surahNumber === rev.surahNumber);
       
       for (const mem of matchingMems) {
          
          // Rule 1: No Review if Memorization Starts at 1
          // (Can't review a Surah you just started)
          if (mem.ayahStart === 1) {
             return this.createError({
                path: 'reviewMeta',
                message: `🚫 غير منطقي: لا يمكن مراجعة سورة ${rev.surahNameCanonical || ''} لأنك بدأت حفظها الآن (من الآية 1).`
             });
          }

          // Rule 2: Strict Temporal Separation (Review must be strictly BEFORE New Memorization)
          // Review is for the PAST. Memorization is for the FUTURE.
          // They cannot overlap.
          if (rev.ayahEnd !== undefined && mem.ayahStart !== undefined) {
             if (rev.ayahEnd >= mem.ayahStart) {
                return this.createError({
                  path: 'reviewMeta',
                  message: `🚫 تداخل زمني: المراجعة (${rev.ayahStart}-${rev.ayahEnd}) تتداخل مع نطاق الحفظ الجديد (${mem.ayahStart}-${mem.ayahEnd}). المراجعة تكون للمحفوظات القديمة فقط. (حد المراجعة الأقصى: ${mem.ayahStart - 1})`
                });
             }
          }
       }
    }

    return true;
  }
);

// ============================================================================
// MARK VALIDATION
// ============================================================================

export interface MarkFormData {
  studentId: string;
  sectionId: string;
  reviewMark?: number | null;
  memorizationMark?: number | null;
  note?: string;
}

/**
 * Validation schema for creating/updating marks
 */
export const markValidationSchema = yup.object<MarkFormData>({
  studentId: yup.string().required("يجب اختيار الطالب"),
  sectionId: yup.string().required("يجب تحديد المقطع"),
  
  reviewMark: yup
    .number()
    .nullable()
    .transform((value, originalValue) => (String(originalValue).trim() === "" ? null : value))
    .min(0, "العلامة يجب أن تكون 0 أو أكثر")
    .max(100, "العلامة يجب أن تكون 100 أو أقل"),
    
  memorizationMark: yup
    .number()
    .nullable()
    .transform((value, originalValue) => (String(originalValue).trim() === "" ? null : value))
    .min(0, "العلامة يجب أن تكون 0 أو أكثر")
    .max(100, "العلامة يجب أن تكون 100 أو أقل"),
    
  note: yup
    .string()
    .nullable()
    .max(200, "الملاحظة يجب ألا تتجاوز 200 حرف"),
});
