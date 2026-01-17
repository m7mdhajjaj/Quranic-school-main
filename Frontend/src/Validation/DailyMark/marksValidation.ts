/**
 * ============================================================================
 * Marks Validation - Frontend UI Layer
 * ============================================================================
 * 
 * تحقق العلامات - يطابق Backend DailyMarksValidation.js
 * 
 * Backend Endpoints:
 * - POST /api/daily-marks        → validateDailyMarksData
 * - POST /api/daily-marks/bulk   → validateBulkMarks
 * - PUT  /api/daily-marks/:id    → validateUpdateMark
 * - PUT  /api/daily-marks/bulk   → validateBulkUpdateMarks
 */

import * as yup from 'yup';
import { isValidObjectId, sanitizeText } from './helpers';

// ============================================================================
// TYPES - الأنواع
// ============================================================================

export interface MarkFormData {
  studentId: string;
  sectionId: string;
  reviewMark?: number | null;
  memorizationMark?: number | null;
  note?: string;
}

export interface BulkMarkFormData {
  marks: MarkFormData[];
}

export interface UpdateMarkFormData {
  markId: string;
  reviewMark?: number | null;
  memorizationMark?: number | null;
  note?: string;
}

// ============================================================================
// HELPERS - دوال مساعدة
// ============================================================================

/**
 * Validate mark value (0-100)
 * Matches Backend validateMarkValue function
 */
export const validateMarkValue = (
  mark: number | string | null | undefined,
  fieldName: string,
  maxMark: number = 100
): { isValid: boolean; message?: string; value?: number | null } => {
  // Allow null values
  if (mark === null || mark === undefined || mark === '') {
    return { isValid: true, value: null };
  }

  const markNum = parseFloat(String(mark));
  if (isNaN(markNum)) {
    return { isValid: false, message: `${fieldName} يجب أن تكون رقم` };
  }

  if (markNum < 0) {
    return { isValid: false, message: `${fieldName} لا يمكن أن تكون أقل من صفر` };
  }

  if (markNum > maxMark) {
    return { isValid: false, message: `${fieldName} لا يمكن أن تزيد عن ${maxMark}` };
  }

  return { isValid: true, value: markNum };
};

/**
 * Sanitize mark data
 * Matches Backend sanitizeMarkData function
 */
export const sanitizeMarkData = (data: Partial<MarkFormData>): Partial<MarkFormData> => {
  const sanitized: Partial<MarkFormData> = {};

  if (data.studentId !== undefined) sanitized.studentId = data.studentId;
  if (data.sectionId !== undefined) sanitized.sectionId = data.sectionId;
  if (data.reviewMark !== undefined) sanitized.reviewMark = data.reviewMark;
  if (data.memorizationMark !== undefined) sanitized.memorizationMark = data.memorizationMark;
  if (data.note !== undefined) sanitized.note = sanitizeText(data.note);

  return sanitized;
};

// ============================================================================
// VALIDATION SCHEMAS - مخططات التحقق
// ============================================================================

/**
 * Validation schema for creating/updating a single mark
 * Matches Backend validateDailyMarksData middleware
 */
export const markValidationSchema = yup.object<MarkFormData>({
  studentId: yup
    .string()
    .required('معرف الطالب مطلوب')
    .test('valid-objectid', 'معرف الطالب غير صحيح', (value) => 
      isValidObjectId(value)
    ),

  sectionId: yup
    .string()
    .required('معرف المقطع مطلوب')
    .test('valid-objectid', 'معرف المقطع غير صحيح', (value) => 
      isValidObjectId(value)
    ),

  reviewMark: yup
    .number()
    .nullable()
    .transform((value, originalValue) => 
      String(originalValue).trim() === '' ? null : value
    )
    .min(0, 'علامة المراجعة لا يمكن أن تكون أقل من صفر')
    .max(100, 'علامة المراجعة لا يمكن أن تزيد عن 100'),

  memorizationMark: yup
    .number()
    .nullable()
    .transform((value, originalValue) => 
      String(originalValue).trim() === '' ? null : value
    )
    .min(0, 'علامة الحفظ لا يمكن أن تكون أقل من صفر')
    .max(100, 'علامة الحفظ لا يمكن أن تزيد عن 100'),

  note: yup
    .string()
    .nullable()
    .max(200, 'الملاحظة يجب ألا تتجاوز 200 حرف'),
});

/**
 * Validation schema for bulk marks
 * Matches Backend validateBulkMarks middleware
 */
export const bulkMarksValidationSchema = yup.object<BulkMarkFormData>({
  marks: yup
    .array()
    .of(markValidationSchema)
    .required('قائمة العلامات مطلوبة')
    .min(1, 'قائمة العلامات لا يمكن أن تكون فارغة')
    .max(1000, 'الحد الأقصى للعلامات المتعددة هو 1000 علامة'),
});

/**
 * Validation schema for updating a mark
 * Matches Backend validateUpdateMark middleware
 */
export const updateMarkValidationSchema = yup.object<UpdateMarkFormData>({
  markId: yup
    .string()
    .required('معرف العلامة مطلوب')
    .test('valid-objectid', 'معرف العلامة غير صحيح', (value) => 
      isValidObjectId(value)
    ),

  reviewMark: yup
    .number()
    .nullable()
    .transform((value, originalValue) => 
      String(originalValue).trim() === '' ? null : value
    )
    .min(0, 'علامة المراجعة لا يمكن أن تكون أقل من صفر')
    .max(100, 'علامة المراجعة لا يمكن أن تزيد عن 100'),

  memorizationMark: yup
    .number()
    .nullable()
    .transform((value, originalValue) => 
      String(originalValue).trim() === '' ? null : value
    )
    .min(0, 'علامة الحفظ لا يمكن أن تكون أقل من صفر')
    .max(100, 'علامة الحفظ لا يمكن أن تزيد عن 100'),

  note: yup
    .string()
    .nullable()
    .max(200, 'الملاحظة يجب ألا تتجاوز 200 حرف'),
});
