/**
 * دوال التحقق من صحة كلمة المرور
 * يمكن استخدامها في أي صفحة تحتاج للتحقق من كلمة المرور
 */

export interface PasswordValidationResult {
  isValid: boolean;
  error?: string;
}

export interface PasswordStrengthResult {
  strength: 'weak' | 'medium' | 'strong';
  score: number;
}

/**
 * التحقق من صحة كلمة المرور
 */
export const validatePassword = (password: string): PasswordValidationResult => {
  if (!password) {
    return { isValid: false, error: 'كلمة المرور مطلوبة' };
  }

  if (password.length < 4) {
    return { isValid: false, error: 'كلمة المرور يجب أن تكون 4 أحرف على الأقل' };
  }

  if (password.length > 50) {
    return { isValid: false, error: 'كلمة المرور يجب ألا تتجاوز 50 حرف' };
  }

  const numbers = password.match(/[\d٠-٩]/g) || [];
  const letters = password.match(/[a-zA-Z\u0600-\u06FF]/g) || [];

  const numberCount = numbers.length;
  const letterCount = letters.length;

  const hasMinimumNumbers = numberCount >= 4;
  // 3 حروف مع أرقام أو 3 أرقام مع حروف
  const hasMinimumLettersWithNumbers = 
    (letterCount >= 3 && numberCount >= 1) || 
    (numberCount >= 3 && letterCount >= 1);

  if (!hasMinimumNumbers && !hasMinimumLettersWithNumbers) {
    return {
      isValid: false,
      error: 'كلمة المرور يجب أن تحتوي على 4 أرقام على الأقل، أو 3 حروف مع أرقام، أو 3 أرقام مع حروف',
    };
  }

  return { isValid: true };
};

/**
 * حساب قوة كلمة المرور
 */
export const calculatePasswordStrength = (password: string): PasswordStrengthResult => {
  if (!password) return { strength: 'weak', score: 0 };

  const validation = validatePassword(password);
  if (!validation.isValid) {
    return { strength: 'weak', score: 25 };
  }

  const numberCount = (password.match(/[\d٠-٩]/g) || []).length;
  const letterCount = (password.match(/[a-zA-Z\u0600-\u06FF]/g) || []).length;

  // Strong: 6+ characters with mix
  if (password.length >= 6 && numberCount >= 2 && letterCount >= 2) {
    return { strength: 'strong', score: 100 };
  }

  // Medium: meets minimum requirements
  return { strength: 'medium', score: 75 };
};
