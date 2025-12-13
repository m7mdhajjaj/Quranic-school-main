/**
 * Change Password Validation using Yup
 * التحقق من تغيير كلمة المرور باستخدام Yup
 */

import * as yup from 'yup';

// تخصيص رسائل Yup بالعربية
yup.setLocale({
  mixed: {
    required: '${path} مطلوب',
    notType: '${path} يجب أن يكون من نوع ${type}',
  },
  string: {
    min: '${path} يجب أن يحتوي على ${min} أحرف على الأقل',
    max: '${path} يجب ألا يتجاوز ${max} حرف',
    matches: '${path} لا يطابق التنسيق المطلوب',
  },
});

/**
 * Calculate password strength
 * حساب قوة كلمة المرور
 * @param password - The password to evaluate
 * @returns Object with strength level and score
 */
export const calculatePasswordStrength = (
  password: string
): { strength: 'weak' | 'medium' | 'strong'; score: number } => {
  if (!password) {
    return { strength: 'weak', score: 0 };
  }

  let score = 0;
  const numberCount = (password.match(/[\d٠-٩]/g) || []).length;
  const letterCount = (password.match(/[a-zA-Z\u0600-\u06FF]/g) || []).length;
  const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  // Length scoring
  if (password.length >= 4) score += 25;
  if (password.length >= 8) score += 15;
  if (password.length >= 12) score += 10;

  // Letters and numbers
  if (letterCount >= 3 && numberCount >= 1) score += 25;
  if (numberCount >= 4) score += 15;

  // Diversity
  if (letterCount > 0 && numberCount > 0) score += 10;
  if (hasSpecialChars) score += 15;

  // Determine strength level
  if (score >= 75) return { strength: 'strong', score };
  if (score >= 50) return { strength: 'strong', score };
  if (score >= 25) return { strength: 'medium', score };
  return { strength: 'weak', score };
};

/**
 * Password validation schema using Yup
 * مخطط التحقق من كلمة المرور باستخدام Yup
 * Password must be at least 4 characters and contain either:
 * - At least 4 numbers, OR
 * - At least 3 letters with some numbers
 */
const passwordSchema = yup
  .string()
  .required('كلمة المرور مطلوبة')
  .min(4, 'كلمة المرور يجب أن تكون 4 أحرف على الأقل')
  .max(50, 'كلمة المرور يجب ألا تتجاوز 50 حرف')
  .test(
    'password-strength',
    'كلمة المرور يجب أن تحتوي على 4 أرقام على الأقل، أو 3 حروف مع أرقام',
    function (value) {
      if (!value) return false;

      // Count numbers (supports Arabic and English numbers)
      const numbers = value.match(/[\d٠-٩]/g) || [];
      const letters = value.match(/[a-zA-Z\u0600-\u06FF]/g) || [];

      const numberCount = numbers.length;
      const letterCount = letters.length;

      // Scenario 1: At least 4 numbers
      const hasMinimumNumbers = numberCount >= 4;

      // Scenario 2: At least 3 letters with some numbers
      const hasMinimumLettersWithNumbers = letterCount >= 3 && numberCount >= 1;

      return hasMinimumNumbers || hasMinimumLettersWithNumbers;
    }
  );

/**
 * Change Password Form Data Interface
 */
export interface ChangePasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * Change Password Validation Schema
 * مخطط التحقق من تغيير كلمة المرور
 */
export const changePasswordSchema = yup.object({
  currentPassword: yup
    .string()
    .required('كلمة المرور الحالية مطلوبة')
    .min(1, 'كلمة المرور الحالية مطلوبة'),

  newPassword: passwordSchema.test(
    'different-from-current',
    'يجب أن تكون مختلفة عن كلمة المرور الحالية',
    function (value) {
      const { currentPassword } = this.parent;
      return value !== currentPassword;
    }
  ),

  confirmPassword: yup
    .string()
    .required('تأكيد كلمة المرور مطلوب')
    .oneOf([yup.ref('newPassword')], 'كلمة المرور غير متطابقة'),
});

/**
 * Validate password using Yup schema (async)
 * التحقق من كلمة المرور باستخدام مخطط Yup (غير متزامن)
 * @param password - The password to validate
 * @returns Validation result with isValid flag and optional error message
 */
export const validatePasswordAsync = async (
  password: string
): Promise<{ isValid: boolean; error?: string }> => {
  try {
    await passwordSchema.validate(password);
    return { isValid: true };
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      return { isValid: false, error: error.message };
    }
    return { isValid: false, error: 'كلمة المرور غير صالحة' };
  }
};

/**
 * Validate password synchronously (for real-time validation)
 * التحقق من كلمة المرور بشكل متزامن (للتحقق في الوقت الفعلي)
 * @param password - The password to validate
 * @returns Validation result with isValid flag and optional error message
 */
export const validatePassword = (
  password: string
): { isValid: boolean; error?: string } => {
  try {
    passwordSchema.validateSync(password);
    return { isValid: true };
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      return { isValid: false, error: error.message };
    }
    return { isValid: false, error: 'كلمة المرور غير صالحة' };
  }
};

/**
 * Validate change password form data
 * التحقق من بيانات نموذج تغيير كلمة المرور
 * @param data - The form data to validate
 * @returns Validation result with isValid flag and errors object
 */
export const validateChangePassword = async (
  data: ChangePasswordFormData
): Promise<{ isValid: boolean; errors?: { [key: string]: string } }> => {
  try {
    await changePasswordSchema.validate(data, { abortEarly: false });
    return { isValid: true };
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      const errors: { [key: string]: string } = {};
      error.inner.forEach((err) => {
        if (err.path) {
          errors[err.path] = err.message;
        }
      });
      return { isValid: false, errors };
    }
    return { isValid: false, errors: { general: 'حدث خطأ في التحقق' } };
  }
};
