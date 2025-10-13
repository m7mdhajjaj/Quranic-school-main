/**
 * Forgot Password Validation
 * Frontend validation for forgot password and reset password
 */

export interface ForgotPasswordData {
  firstName: string;
  fatherName: string;
  grandFatherName: string;
  lastName: string;
  motherName: string;
  idNumber: string;
  birthDate: string;
}

export interface ResetPasswordData extends ForgotPasswordData {
  password: string;
  confirmPassword: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: { [key: string]: string };
}

/**
 * Validate Arabic name (allows Arabic letters, spaces, hyphens, apostrophes, and dots)
 */
const isValidArabicName = (name: string): boolean => {
  const arabicNameRegex = /^[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\s\-'.]+$/;
  return arabicNameRegex.test(name);
};

/**
 * Validate ID number (9 digits)
 */
const isValidIdNumber = (idNumber: string): boolean => {
  const idRegex = /^\d{9}$/;
  return idRegex.test(idNumber);
};

/**
 * Validate birth date
 */
const isValidBirthDate = (birthDate: string): boolean => {
  if (!birthDate) return false;
  
  const date = new Date(birthDate);
  if (isNaN(date.getTime())) return false;
  
  // Check if age is between 5 and 100 years
  const today = new Date();
  const age = today.getFullYear() - date.getFullYear();
  return age >= 5 && age <= 100;
};

/**
 * Validate password strength
 * Password must be at least 4 characters and contain either:
 * - At least 4 numbers, OR
 * - At least 3 letters with some numbers
 */
const isValidPassword = (password: string): { isValid: boolean; error?: string } => {
  if (!password) {
    return { isValid: false, error: 'كلمة المرور مطلوبة' };
  }

  if (password.length < 4) {
    return { isValid: false, error: 'كلمة المرور يجب أن تكون 4 أحرف على الأقل' };
  }

  if (password.length > 50) {
    return { isValid: false, error: 'كلمة المرور يجب ألا تتجاوز 50 حرف' };
  }

  // Count numbers (supports Arabic and English numbers)
  const numbers = password.match(/[\d٠-٩]/g) || [];
  const letters = password.match(/[a-zA-Z\u0600-\u06FF]/g) || [];

  const numberCount = numbers.length;
  const letterCount = letters.length;

  // Scenario 1: At least 4 numbers
  const hasMinimumNumbers = numberCount >= 4;

  // Scenario 2: At least 3 letters with some numbers
  const hasMinimumLettersWithNumbers = letterCount >= 3 && numberCount >= 1;

  if (!hasMinimumNumbers && !hasMinimumLettersWithNumbers) {
    return {
      isValid: false,
      error: 'كلمة المرور يجب أن تحتوي على 4 أرقام على الأقل، أو 3 حروف مع أرقام',
    };
  }

  return { isValid: true };
};

/**
 * Validate forgot password data (Step 1 - Identity Verification)
 */
export const validateForgotPasswordData = (
  data: ForgotPasswordData
): ValidationResult => {
  const errors: { [key: string]: string } = {};

  // First name validation
  if (!data.firstName || data.firstName.trim() === '') {
    errors.firstName = 'الاسم الأول مطلوب';
  } else if (data.firstName.trim().length < 2) {
    errors.firstName = 'الاسم الأول يجب أن يكون حرفين على الأقل';
  } else if (!isValidArabicName(data.firstName)) {
    errors.firstName = 'الاسم الأول يجب أن يحتوي على أحرف عربية فقط';
  }

  // Father name validation
  if (!data.fatherName || data.fatherName.trim() === '') {
    errors.fatherName = 'اسم الأب مطلوب';
  } else if (data.fatherName.trim().length < 2) {
    errors.fatherName = 'اسم الأب يجب أن يكون حرفين على الأقل';
  } else if (!isValidArabicName(data.fatherName)) {
    errors.fatherName = 'اسم الأب يجب أن يحتوي على أحرف عربية فقط';
  }

  // Grandfather name validation
  if (!data.grandFatherName || data.grandFatherName.trim() === '') {
    errors.grandFatherName = 'اسم الجد مطلوب';
  } else if (data.grandFatherName.trim().length < 2) {
    errors.grandFatherName = 'اسم الجد يجب أن يكون حرفين على الأقل';
  } else if (!isValidArabicName(data.grandFatherName)) {
    errors.grandFatherName = 'اسم الجد يجب أن يحتوي على أحرف عربية فقط';
  }

  // Last name validation
  if (!data.lastName || data.lastName.trim() === '') {
    errors.lastName = 'اسم العائلة مطلوب';
  } else if (data.lastName.trim().length < 2) {
    errors.lastName = 'اسم العائلة يجب أن يكون حرفين على الأقل';
  } else if (!isValidArabicName(data.lastName)) {
    errors.lastName = 'اسم العائلة يجب أن يحتوي على أحرف عربية فقط';
  }

  // Mother name validation
  if (!data.motherName || data.motherName.trim() === '') {
    errors.motherName = 'اسم الأم مطلوب';
  } else if (data.motherName.trim().length < 2) {
    errors.motherName = 'اسم الأم يجب أن يكون حرفين على الأقل';
  } else if (!isValidArabicName(data.motherName)) {
    errors.motherName = 'اسم الأم يجب أن يحتوي على أحرف عربية فقط';
  }

  // ID number validation
  if (!data.idNumber || data.idNumber.trim() === '') {
    errors.idNumber = 'رقم الهوية مطلوب';
  } else if (!isValidIdNumber(data.idNumber)) {
    errors.idNumber = 'رقم الهوية يجب أن يكون 9 أرقام';
  }

  // Birth date validation
  if (!data.birthDate || data.birthDate.trim() === '') {
    errors.birthDate = 'تاريخ الميلاد مطلوب';
  } else if (!isValidBirthDate(data.birthDate)) {
    errors.birthDate = 'تاريخ الميلاد غير صحيح';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validate reset password data (Step 2 - New Password)
 */
export const validateResetPasswordData = (
  data: ResetPasswordData
): ValidationResult => {
  const errors: { [key: string]: string } = {};

  // Validate identity data first
  const identityValidation = validateForgotPasswordData(data);
  if (!identityValidation.isValid) {
    Object.assign(errors, identityValidation.errors);
  }

  // Password validation
  if (!data.password || data.password.trim() === '') {
    errors.password = 'كلمة المرور الجديدة مطلوبة';
  } else {
    const passwordValidation = isValidPassword(data.password);
    if (!passwordValidation.isValid) {
      errors.password = passwordValidation.error || 'كلمة المرور غير صالحة';
    }
  }

  // Confirm password validation
  if (!data.confirmPassword || data.confirmPassword.trim() === '') {
    errors.confirmPassword = 'تأكيد كلمة المرور مطلوب';
  } else if (data.password !== data.confirmPassword) {
    errors.confirmPassword = 'كلمة المرور وتأكيدها غير متطابقتين';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validate single field
 */
export const validateField = (
  fieldName: keyof ForgotPasswordData | 'password' | 'confirmPassword',
  value: string,
  allData?: Partial<ResetPasswordData>
): string | null => {
  switch (fieldName) {
    case 'firstName':
    case 'fatherName':
    case 'grandFatherName':
    case 'lastName':
    case 'motherName':
      if (!value || value.trim() === '') {
        return `${getFieldLabel(fieldName)} مطلوب`;
      }
      if (value.trim().length < 2) {
        return `${getFieldLabel(fieldName)} يجب أن يكون حرفين على الأقل`;
      }
      if (!isValidArabicName(value)) {
        return `${getFieldLabel(fieldName)} يجب أن يحتوي على أحرف عربية فقط`;
      }
      return null;

    case 'idNumber':
      if (!value || value.trim() === '') {
        return 'رقم الهوية مطلوب';
      }
      if (!isValidIdNumber(value)) {
        return 'رقم الهوية يجب أن يكون 9 أرقام';
      }
      return null;

    case 'birthDate':
      if (!value || value.trim() === '') {
        return 'تاريخ الميلاد مطلوب';
      }
      if (!isValidBirthDate(value)) {
        return 'تاريخ الميلاد غير صحيح';
      }
      return null;

    case 'password': {
      if (!value || value.trim() === '') {
        return 'كلمة المرور مطلوبة';
      }
      const passwordValidation = isValidPassword(value);
      return passwordValidation.isValid ? null : passwordValidation.error || null;
    }

    case 'confirmPassword': {
      if (!value || value.trim() === '') {
        return 'تأكيد كلمة المرور مطلوب';
      }
      if (allData?.password && value !== allData.password) {
        return 'كلمة المرور وتأكيدها غير متطابقتين';
      }
      return null;
    }

    default:
      return null;
  }
};

/**
 * Get field label in Arabic
 */
const getFieldLabel = (fieldName: string): string => {
  const labels: { [key: string]: string } = {
    firstName: 'الاسم الأول',
    fatherName: 'اسم الأب',
    grandFatherName: 'اسم الجد',
    lastName: 'اسم العائلة',
    motherName: 'اسم الأم',
    idNumber: 'رقم الهوية',
    birthDate: 'تاريخ الميلاد',
    password: 'كلمة المرور',
    confirmPassword: 'تأكيد كلمة المرور',
  };
  return labels[fieldName] || fieldName;
};
