// ============================================================================
// markValidation.ts - Frontend Validation for Exam Marks using Yup
// ============================================================================

import * as yup from 'yup';

/**
 * Create mark validation schema with dynamic max mark
 */
export const createMarkSchema = (maxMark: number = 40) => {
  return yup.object().shape({
    // Student ID validation
    studentId: yup
      .string()
      .required('معرف الطالب مطلوب')
      .trim(),

    // Mark value validation (0 to maxMark, nullable)
    mark: yup
      .number()
      .nullable()
      .min(0, 'العلامة لا يمكن أن تكون سالبة')
      .max(maxMark, `العلامة لا يمكن أن تزيد عن ${maxMark}`)
      .typeError('العلامة يجب أن تكون رقماً'),

    // Detail/notes (optional)
    detail: yup
      .string()
      .max(500, 'الملاحظات يجب أن تكون 500 حرف أو أقل')
      .nullable(),
  });
};

/**
 * Default mark schema (max 40)
 */
export const markSchema = createMarkSchema(40);

/**
 * Validate single mark
 */
export const validateMarkValue = async (
  mark: number | string | null,
  maxMark: number = 40
): Promise<{ isValid: boolean; error?: string }> => {
  try {
    const schema = yup
      .number()
      .nullable()
      .min(0, 'العلامة لا يمكن أن تكون سالبة')
      .max(maxMark, `العلامة لا يمكن أن تزيد عن ${maxMark}`)
      .typeError('العلامة يجب أن تكون رقماً');

    await schema.validate(mark);
    return { isValid: true };
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      return {
        isValid: false,
        error: error.message,
      };
    }
    return {
      isValid: false,
      error: 'حدث خطأ في التحقق',
    };
  }
};

/**
 * Validate student mark data
 */
export const validateStudentMark = async (
  studentId: string,
  mark: number | string | null,
  maxMark: number = 40
): Promise<{ isValid: boolean; errors: string[] }> => {
  try {
    const schema = createMarkSchema(maxMark);
    await schema.validate({ studentId, mark }, { abortEarly: false });
    return { isValid: true, errors: [] };
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      return {
        isValid: false,
        errors: error.errors,
      };
    }
    return {
      isValid: false,
      errors: ['حدث خطأ في التحقق'],
    };
  }
};

/**
 * Validate all marks for an exam
 */
export const validateAllMarks = async (
  marks: Record<string, { mark: string; detail: string }>,
  maxMark: number = 40
): Promise<{ isValid: boolean; errors: Record<string, string[]> }> => {
  const errors: Record<string, string[]> = {};
  const schema = createMarkSchema(maxMark);

  for (const [studentId, data] of Object.entries(marks)) {
    try {
      await schema.validate(
        { studentId, mark: data.mark, detail: data.detail },
        { abortEarly: false }
      );
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        errors[studentId] = error.errors;
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Calculate percentage from mark
 */
export const calculatePercentage = (mark: number, totalMarks: number): number => {
  if (totalMarks === 0) return 0;
  return (mark / totalMarks) * 100;
};

/**
 * Determine grade based on percentage
 */
export const determineGrade = (percentage: number): string => {
  if (percentage >= 90) return 'ممتاز';
  if (percentage >= 80) return 'جيد جداً';
  if (percentage >= 70) return 'جيد';
  if (percentage >= 60) return 'مقبول';
  return 'راسب';
};

/**
 * Check if student passed
 */
export const isPassing = (mark: number, passingMark: number): boolean => {
  return mark >= passingMark;
};
