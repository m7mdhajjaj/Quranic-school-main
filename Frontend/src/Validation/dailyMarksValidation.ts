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

export interface SectionFormData {
  date: string;
  reviewSection: string;
  memorizationSection: string;
  group?: string;
  teacher?: string;
}

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
  
  reviewSection: yup
    .string()
    .required("مقطع المراجعة مطلوب")
    .min(3, "مقطع المراجعة يجب أن يكون 3 أحرف على الأقل")
    .max(100, "مقطع المراجعة يجب ألا يتجاوز 100 حرف"),
  
  memorizationSection: yup
    .string()
    .required("مقطع الحفظ مطلوب")
    .min(3, "مقطع الحفظ يجب أن يكون 3 أحرف على الأقل")
    .max(100, "مقطع الحفظ يجب ألا يتجاوز 100 حرف"),
  
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
});

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
  studentId: yup
    .string()
    .required("الطالب مطلوب"),
  
  sectionId: yup
    .string()
    .required("المقطع مطلوب"),
  
  reviewMark: yup
    .number()
    .nullable()
    .optional()
    .typeError("علامة المراجعة يجب أن تكون رقم")
    .min(0, "علامة المراجعة يجب أن تكون 0 أو أكثر")
    .max(10, "علامة المراجعة يجب ألا تتجاوز 10"),
  
  memorizationMark: yup
    .number()
    .nullable()
    .optional()
    .typeError("علامة الحفظ يجب أن تكون رقم")
    .min(0, "علامة الحفظ يجب أن تكون 0 أو أكثر")
    .max(10, "علامة الحفظ يجب ألا تتجاوز 10"),
  
  note: yup
    .string()
    .optional()
    .max(500, "الملاحظة يجب ألا تتجاوز 500 حرف"),
});

/**
 * Simplified mark validation for slider input
 */
export const markSliderValidationSchema = yup.object({
  reviewMark: yup
    .number()
    .required("علامة المراجعة مطلوبة")
    .min(0, "يجب أن تكون 0 أو أكثر")
    .max(10, "يجب ألا تتجاوز 10"),
  
  memorizationMark: yup
    .number()
    .required("علامة الحفظ مطلوبة")
    .min(0, "يجب أن تكون 0 أو أكثر")
    .max(10, "يجب ألا تتجاوز 10"),
});

// ============================================================================
// UTILITY VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate section data
 */
export const validateSection = async (data: SectionFormData): Promise<{
  valid: boolean;
  errors: { [key: string]: string };
}> => {
  try {
    await sectionValidationSchema.validate(data, { abortEarly: false });
    return { valid: true, errors: {} };
  } catch (error) {
    const yupError = error as yup.ValidationError;
    const errors: { [key: string]: string } = {};
    yupError.inner.forEach((err) => {
      if (err.path) {
        errors[err.path] = err.message;
      }
    });
    return { valid: false, errors };
  }
};

/**
 * Validate mark data
 */
export const validateMark = async (data: MarkFormData): Promise<{
  valid: boolean;
  errors: { [key: string]: string };
}> => {
  try {
    await markValidationSchema.validate(data, { abortEarly: false });
    return { valid: true, errors: {} };
  } catch (error) {
    const yupError = error as yup.ValidationError;
    const errors: { [key: string]: string } = {};
    yupError.inner.forEach((err) => {
      if (err.path) {
        errors[err.path] = err.message;
      }
    });
    return { valid: false, errors };
  }
};

/**
 * Validate marks (slider values)
 */
export const validateMarksSliders = async (data: {
  reviewMark: number;
  memorizationMark: number;
}): Promise<{ valid: boolean; errors: { [key: string]: string } }> => {
  try {
    await markSliderValidationSchema.validate(data, { abortEarly: false });
    return { valid: true, errors: {} };
  } catch (error) {
    const yupError = error as yup.ValidationError;
    const errors: { [key: string]: string } = {};
    yupError.inner.forEach((err) => {
      if (err.path) {
        errors[err.path] = err.message;
      }
    });
    return { valid: false, errors };
  }
};

/**
 * Check if date is valid
 */
export const isValidDate = (dateString: string): boolean => {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
};

/**
 * Check if mark value is valid (0-10)
 */
export const isValidMark = (mark: number | null): boolean => {
  if (mark === null) return true; // null is allowed (no mark yet)
  return typeof mark === "number" && mark >= 0 && mark <= 10;
};

/**
 * Calculate average marks
 */
export const calculateMarkAverage = (
  marks: (number | null)[]
): number => {
  const validMarks = marks.filter((m) => m !== null) as number[];
  if (validMarks.length === 0) return 0;
  const sum = validMarks.reduce((a, b) => a + b, 0);
  return parseFloat((sum / validMarks.length).toFixed(2));
};

/**
 * Calculate overall score (review + memorization) / 2 * 5 = out of 100
 */
export const calculateOverallScore = (
  reviewMark: number | null,
  memorizationMark: number | null
): number => {
  if (reviewMark === null || memorizationMark === null) return 0;
  const average = (reviewMark + memorizationMark) / 2;
  return parseFloat((average * 10).toFixed(2));
};

/**
 * Get mark color based on value
 */
export const getMarkColor = (mark: number | null): "emerald" | "amber" | "red" => {
  if (mark === null) return "red";
  if (mark >= 9) return "emerald";
  if (mark >= 7) return "amber";
  return "red";
};

/**
 * Get mark status text
 */
export const getMarkStatus = (mark: number | null): string => {
  if (mark === null) return "لم تُضف علامة";
  if (mark >= 9) return "ممتاز";
  if (mark >= 7) return "جيد";
  if (mark >= 5) return "مقبول";
  return "ضعيف";
};

// ============================================================================
// EXPORT DEFAULT
// ============================================================================

export default {
  sectionValidationSchema,
  markValidationSchema,
  markSliderValidationSchema,
  validateSection,
  validateMark,
  validateMarksSliders,
  isValidDate,
  isValidMark,
  calculateMarkAverage,
  calculateOverallScore,
  getMarkColor,
  getMarkStatus,
};
