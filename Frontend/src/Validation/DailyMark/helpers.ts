/**
 * ============================================================================
 * DailyMark Helpers - Shared Validation Functions
 * ============================================================================
 * 
 * دوال مساعدة مشتركة للتحقق - تطابق Backend validation helpers
 */

// ============================================================================
// ID VALIDATION - التحقق من المعرفات
// ============================================================================

/**
 * Check if value is a valid MongoDB ObjectId
 */
export const isValidObjectId = (value: string | null | undefined): boolean => {
  if (!value) return false;
  return /^[0-9a-fA-F]{24}$/.test(value.toString().trim());
};

/**
 * Validate student ID
 */
export const validateStudentId = (studentId: string | null | undefined): {
  isValid: boolean;
  message?: string;
  value?: string;
} => {
  if (!studentId || studentId.toString().trim() === '') {
    return { isValid: false, message: 'معرف الطالب مطلوب' };
  }

  const idStr = studentId.toString().trim();
  if (!isValidObjectId(idStr)) {
    return { isValid: false, message: 'معرف الطالب غير صحيح' };
  }

  return { isValid: true, value: idStr };
};

/**
 * Validate section ID
 */
export const validateSectionId = (sectionId: string | null | undefined): {
  isValid: boolean;
  message?: string;
  value?: string;
} => {
  if (!sectionId || sectionId.toString().trim() === '') {
    return { isValid: false, message: 'معرف المقطع مطلوب' };
  }

  const idStr = sectionId.toString().trim();
  if (!isValidObjectId(idStr)) {
    return { isValid: false, message: 'معرف المقطع غير صحيح' };
  }

  return { isValid: true, value: idStr };
};

/**
 * Validate group ID
 */
export const validateGroupId = (groupId: string | null | undefined): {
  isValid: boolean;
  message?: string;
  value?: string;
} => {
  if (!groupId || groupId.toString().trim() === '') {
    return { isValid: false, message: 'معرف الحلقة مطلوب' };
  }

  const idStr = groupId.toString().trim();
  if (!isValidObjectId(idStr)) {
    return { isValid: false, message: 'معرف الحلقة غير صحيح' };
  }

  return { isValid: true, value: idStr };
};

// ============================================================================
// DATE VALIDATION - التحقق من التاريخ
// ============================================================================

import * as yup from 'yup';

/**
 * Yup Schema for date format validation (YYYY-MM-DD)
 */
export const dateFormatSchema = yup.string().matches(
  /^\d{4}-\d{2}-\d{2}$/,
  'صيغة التاريخ غير صحيحة (YYYY-MM-DD)'
);

/**
 * Validate date format (YYYY-MM-DD)
 */
export const validateDateFormat = async (date: string): Promise<boolean> => {
  try {
    await dateFormatSchema.validate(date);
    return true;
  } catch {
    return false;
  }
};

/**
 * Check if a value is a valid date
 */
export const isValidDate = (value: string | Date | null | undefined): boolean => {
  if (!value) return false;
  const date = new Date(value);
  return !isNaN(date.getTime());
};

/**
 * Format date for API (YYYY-MM-DD)
 */
export const formatDateForApi = (date: Date | string): string => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Get today's date in YYYY-MM-DD format (local timezone)
 */
export const getTodayDateKey = (): string => {
  const today = new Date();
  return formatDateForApi(today);
};

// ============================================================================
// TEXT VALIDATION - التحقق من النصوص
// ============================================================================

/**
 * Sanitize text input (remove XSS risks)
 */
export const sanitizeText = (text: string | null | undefined): string => {
  if (!text) return '';
  return text
    .toString()
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .replace(/on\w+=/gi, ''); // Remove event handlers
};

/**
 * Check if text contains Arabic characters
 */
export const isArabicText = (text: string): boolean => {
  if (!text) return false;
  const arabicRegex = /[\u0600-\u06FF]/;
  return arabicRegex.test(text);
};

// ============================================================================
// GENERIC HELPERS - دوال عامة
// ============================================================================

/**
 * Check if a value exists and is not empty
 */
export const isRequired = (value: unknown): boolean => {
  if (value === undefined || value === null) return false;
  if (typeof value === 'string') return value.trim() !== '';
  if (Array.isArray(value)) return value.length > 0;
  return true;
};

/**
 * Check if a value is a valid number within range
 */
export const isValidNumber = (
  value: unknown,
  min?: number,
  max?: number
): boolean => {
  if (value === null || value === undefined) return true; // Allow null
  const num = Number(value);
  if (isNaN(num)) return false;
  if (min !== undefined && num < min) return false;
  if (max !== undefined && num > max) return false;
  return true;
};

/**
 * Validate mark value (0-100)
 */
export const isValidMarkValue = (mark: unknown): boolean => {
  return isValidNumber(mark, 0, 100);
};

/**
 * Validate Surah number (1-114)
 */
export const isValidSurahNumber = (surahNumber: unknown): boolean => {
  if (!surahNumber) return false;
  const num = Number(surahNumber);
  return !isNaN(num) && num >= 1 && num <= 114;
};

/**
 * Validate Ayah range
 */
export const isValidAyahRange = (
  ayahStart: number,
  ayahEnd: number,
  maxAyahs?: number
): { isValid: boolean; message?: string } => {
  if (ayahStart < 1) {
    return { isValid: false, message: 'رقم الآية يجب أن يكون 1 أو أكثر' };
  }
  if (ayahEnd < ayahStart) {
    return { isValid: false, message: 'نهاية المقطع يجب أن تكون بعد بدايته' };
  }
  if (maxAyahs && ayahEnd > maxAyahs) {
    return { isValid: false, message: `الآية ${ayahEnd} تتجاوز عدد آيات السورة (${maxAyahs})` };
  }
  return { isValid: true };
};
