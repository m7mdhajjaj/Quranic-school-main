// Common Validation Rules
// قواعد التحقق المشتركة لكل الجهات

import * as yup from "yup";

/* ----------------------- Password Validation Rules ----------------------- */

/**
 * التحقق من قوة كلمة المرور
 * يجب أن تحتوي على:
 * - أقل شيء 4 أرقام، أو
 * - 3 حروف على الأقل وباقي أرقام
 * - طول لا يقل عن 4 أحرف
 * - طول لا يزيد عن 50 حرف
 */
export const validatePasswordStrength = (password: string): {
  isValid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong';
} => {
  const errors: string[] = [];
  let strength: 'weak' | 'medium' | 'strong' = 'weak';

  // التحقق من الطول الأدنى
  if (!password || password.length < 4) {
    errors.push('كلمة المرور يجب أن تكون 4 أحرف على الأقل');
    return { isValid: false, errors, strength };
  }

  // التحقق من الطول الأقصى
  if (password.length > 50) {
    errors.push('كلمة المرور يجب ألا تتجاوز 50 حرف');
    return { isValid: false, errors, strength };
  }

  // عد الأرقام والحروف (يدعم الأرقام العربية والإنجليزية)
  const numbers = password.match(/[\d٠-٩]/g) || [];
  const letters = password.match(/[a-zA-Z\u0600-\u06FF]/g) || [];
  const specialChars = password.match(/[!@#$%^&*(),.?":{}|<>]/g) || [];

  const numberCount = numbers.length;
  const letterCount = letters.length;
  const specialCount = specialChars.length;

  // قاعدة التحقق الجديدة:
  // السيناريو 1: أقل شيء 4 أرقام
  const hasMinimumNumbers = numberCount >= 4;
  
  // السيناريو 2: 3 حروف على الأقل وباقي أرقام
  const hasMinimumLettersWithNumbers = letterCount >= 3 && numberCount >= 1;

  if (!hasMinimumNumbers && !hasMinimumLettersWithNumbers) {
    errors.push('كلمة المرور يجب أن تحتوي على 4 أرقام على الأقل، أو 3 حروف مع أرقام');
    return { isValid: false, errors, strength };
  }

  // تحديد قوة كلمة المرور
  if (password.length >= 8 && letterCount >= 2 && numberCount >= 2) {
    if (specialCount > 0) {
      strength = 'strong';
    } else {
      strength = 'medium';
    }
  } else if (hasMinimumNumbers || hasMinimumLettersWithNumbers) {
    strength = 'medium';
  }

  return { isValid: true, errors: [], strength };
};

/**
 * Yup schema للتحقق من كلمة المرور
 */
export const passwordValidationSchema = yup
  .string()
  .required('كلمة المرور مطلوبة')
  .min(4, 'كلمة المرور يجب أن تكون 4 أحرف على الأقل')
  .max(50, 'كلمة المرور يجب ألا تتجاوز 50 حرف')
  .test('password-strength', 'كلمة المرور لا تلبي المتطلبات', function(value) {
    if (!value) return false;
    
    const validation = validatePasswordStrength(value);
    if (!validation.isValid) {
      return this.createError({ message: validation.errors[0] });
    }
    
    return true;
  });

/**
 * التحقق من تطابق كلمة المرور
 */
export const confirmPasswordSchema = (passwordField: string = 'password') => 
  yup
    .string()
    .required('تأكيد كلمة المرور مطلوب')
    .oneOf([yup.ref(passwordField)], 'كلمة المرور وتأكيدها غير متطابقان');

/* ----------------------- Common Input Validation ----------------------- */

/**
 * التحقق من اسم المستخدم
 */
export const usernameValidationSchema = yup
  .string()
  .required('اسم المستخدم مطلوب')
  .min(3, 'اسم المستخدم يجب أن يكون 3 أحرف على الأقل')
  .max(30, 'اسم المستخدم يجب ألا يتجاوز 30 حرف')
  .matches(
    /^[a-zA-Z0-9\u0600-\u06FF_-]+$/,
    'اسم المستخدم يجب أن يحتوي على أحرف وأرقام فقط'
  );

/**
 * التحقق من رقم الهوية
 */
export const idNumberValidationSchema = yup
  .string()
  .required('رقم الهوية مطلوب')
  .matches(/^\d{9}$/, 'رقم الهوية يجب أن يكون 9 أرقام');

/**
 * التحقق من رقم الهاتف
 */
export const phoneValidationSchema = yup
  .string()
  .required('رقم الهاتف مطلوب')
  .matches(
    /^(\+970|0)?[59]\d{8}$/,
    'رقم الهاتف غير صحيح (مثال: 0599123456)'
  );

/**
 * التحقق من البريد الإلكتروني
 */
export const emailValidationSchema = yup
  .string()
  .required('البريد الإلكتروني مطلوب')
  .email('البريد الإلكتروني غير صحيح');

/* ----------------------- Change Password Validation ----------------------- */

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const changePasswordValidationSchema = yup.object({
  currentPassword: yup
    .string()
    .required('كلمة المرور الحالية مطلوبة')
    .min(1, 'كلمة المرور الحالية مطلوبة'),
    
  newPassword: passwordValidationSchema,
  
  confirmPassword: confirmPasswordSchema('newPassword'),
}).test(
  'passwords-different',
  'كلمة المرور الجديدة يجب أن تكون مختلفة عن الحالية',
  function(values) {
    const { currentPassword, newPassword } = values as ChangePasswordData;
    if (currentPassword && newPassword && currentPassword === newPassword) {
      return this.createError({
        path: 'newPassword',
        message: 'كلمة المرور الجديدة يجب أن تكون مختلفة عن الحالية'
      });
    }
    return true;
  }
);

/* ----------------------- Validation Helper Functions ----------------------- */

/**
 * التحقق من حقل واحد باستخدام schema محدد
 */
export const validateField = async (
  schema: yup.Schema,
  value: unknown,
  context?: Record<string, unknown>
): Promise<string | null> => {
  try {
    await schema.validate(value, { context });
    return null;
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      return error.message;
    }
    return 'خطأ في التحقق';
  }
};

/**
 * التحقق من كائن كامل
 */
export const validateObject = async (
  schema: yup.ObjectSchema<Record<string, unknown>>,
  data: Record<string, unknown>,
  context?: Record<string, unknown>
): Promise<{ isValid: boolean; errors: Record<string, string>; data?: Record<string, unknown> }> => {
  try {
    const validatedData = await schema.validate(data, {
      abortEarly: false,
      context,
      stripUnknown: true,
    });

    return {
      isValid: true,
      errors: {},
      data: validatedData as Record<string, unknown>,
    };
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      const errors: Record<string, string> = {};

      error.inner.forEach((err) => {
        if (err.path) {
          errors[err.path] = err.message;
        }
      });

      return {
        isValid: false,
        errors,
      };
    }

    throw error;
  }
};

/* ----------------------- Export All ----------------------- */

export {
  yup,
};