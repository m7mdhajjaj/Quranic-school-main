// ============================================================================
// Validation/Warning/warningValidation.ts - Client-Side Warning Validation
// ============================================================================

import type { WarningType } from '@/pages/Warnings/types/warnings';

/**
 * نتيجة التحقق من الصحة
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * بيانات إنشاء الإنذار
 */
export interface CreateWarningData {
  studentId: string;
  teacherId: string;
  groupName: string;
  type: WarningType;
  reason: string;
}

/**
 * التحقق من صحة معرف MongoDB
 */
const isValidMongoId = (id: string): boolean => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

/**
 * التحقق من صحة نوع الإنذار
 */
const isValidWarningType = (type: string): boolean => {
  const validTypes = ['warning', 'first', 'second', 'third', 'expulsion'];
  return validTypes.includes(type);
};

/**
 * التحقق من صحة بيانات إنشاء الإنذار
 */
export const validateCreateWarning = (data: CreateWarningData): ValidationResult => {
  const errors: string[] = [];

  // التحقق من معرف الطالب
  if (!data.studentId || data.studentId.trim() === '') {
    errors.push('معرف الطالب مطلوب');
  } else if (!isValidMongoId(data.studentId)) {
    errors.push('معرف الطالب غير صحيح');
  }

  // التحقق من معرف المعلم
  if (!data.teacherId || data.teacherId.trim() === '') {
    errors.push('معرف المعلم مطلوب');
  } else if (!isValidMongoId(data.teacherId)) {
    errors.push('معرف المعلم غير صحيح');
  }

  // التحقق من اسم الحلقة
  if (!data.groupName || data.groupName.trim() === '') {
    errors.push('اسم الحلقة مطلوب');
  } else if (typeof data.groupName !== 'string') {
    errors.push('اسم الحلقة يجب أن يكون نص');
  }

  // التحقق من نوع الإنذار
  if (!data.type || data.type.trim() === '') {
    errors.push('نوع الإنذار مطلوب');
  } else if (!isValidWarningType(data.type)) {
    errors.push('نوع الإنذار غير صحيح');
  }

  // التحقق من سبب الإنذار
  if (!data.reason || data.reason.trim() === '') {
    errors.push('سبب الإنذار مطلوب');
  } else if (typeof data.reason !== 'string') {
    errors.push('سبب الإنذار يجب أن يكون نص');
  } else {
    const reasonLength = data.reason.trim().length;
    if (reasonLength < 3) {
      errors.push('سبب الإنذار يجب أن يكون على الأقل 3 أحرف');
    } else if (reasonLength > 500) {
      errors.push('سبب الإنذار يجب أن لا يتجاوز 500 حرف');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * التحقق من صحة معرف الإنذار للحذف
 */
export const validateDeleteWarning = (warningId: string): ValidationResult => {
  const errors: string[] = [];

  if (!warningId || warningId.trim() === '') {
    errors.push('معرف الإنذار مطلوب');
  } else if (!isValidMongoId(warningId)) {
    errors.push('معرف الإنذار غير صحيح');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * التحقق من صحة حذف إنذار بالنوع
 */
export const validateDeleteWarningByType = (
  studentId: string,
  warningType: string
): ValidationResult => {
  const errors: string[] = [];

  // التحقق من معرف الطالب
  if (!studentId || studentId.trim() === '') {
    errors.push('معرف الطالب مطلوب');
  } else if (!isValidMongoId(studentId)) {
    errors.push('معرف الطالب غير صحيح');
  }

  // التحقق من نوع الإنذار
  if (!warningType || warningType.trim() === '') {
    errors.push('نوع الإنذار مطلوب');
  } else if (!isValidWarningType(warningType)) {
    errors.push('نوع الإنذار غير صحيح');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
