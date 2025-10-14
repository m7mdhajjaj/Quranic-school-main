/**
 * Profile Validation for Frontend
 * Validates user profile data before sending to backend
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export interface FieldErrors {
  firstName?: string;
  fatherName?: string;
  grandFatherName?: string;
  lastName?: string;
  motherName?: string;
  email?: string;
  phoneNumber?: string;
  birthDate?: string;
  gender?: string;
  residence?: string;
  idNumber?: string;
}

/**
 * Validate Arabic or English name
 */
export const isValidName = (name: string | undefined): boolean => {
  if (!name || name.trim() === '') return false;
  const trimmed = name.trim();
  
  // Length validation
  if (trimmed.length < 2 || trimmed.length > 50) return false;
  
  // Only Arabic, English letters, spaces, hyphens, and apostrophes
  const nameRegex = /^[\u0600-\u06FFa-zA-Z\s\-']+$/;
  return nameRegex.test(trimmed);
};

/**
 * Validate name with detailed error message
 */
export const validateName = (name: string | undefined, fieldName: string): ValidationResult => {
  if (!name || name.trim() === '') {
    return { isValid: false, error: `${fieldName} مطلوب` };
  }
  
  const trimmed = name.trim();
  
  if (trimmed.length < 2) {
    return { isValid: false, error: `${fieldName} يجب أن يكون حرفين على الأقل` };
  }
  
  if (trimmed.length > 50) {
    return { isValid: false, error: `${fieldName} يجب أن يكون 50 حرف أو أقل` };
  }
  
  const nameRegex = /^[\u0600-\u06FFa-zA-Z\s\-']+$/;
  if (!nameRegex.test(trimmed)) {
    return { isValid: false, error: `${fieldName} يحتوي على أحرف غير صالحة` };
  }
  
  return { isValid: true };
};

/**
 * Validate email address
 */
export const isValidEmail = (email: string | undefined): boolean => {
  if (!email || email.trim() === '') return true; // Optional field
  
  const trimmed = email.trim();
  if (trimmed.length > 255) return false;
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(trimmed);
};

/**
 * Validate email with detailed error message
 */
export const validateEmail = (email: string | undefined): ValidationResult => {
  if (!email || email.trim() === '') {
    return { isValid: true }; // Optional field
  }
  
  const trimmed = email.trim();
  
  if (trimmed.length > 255) {
    return { isValid: false, error: 'عنوان الإيميل طويل جداً' };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) {
    return { isValid: false, error: 'عنوان الإيميل غير صحيح' };
  }
  
  return { isValid: true };
};

/**
 * Validate phone number (10 digits for Saudi Arabia)
 */
export const isValidPhoneNumber = (phone: string | undefined): boolean => {
  if (!phone || phone.trim() === '') return true; // Optional field
  
  // Remove common separators
  const cleaned = phone.replace(/[\s\-()]/g, '');
  
  // Saudi phone number format (10 digits)
  const phoneRegex = /^(05|5)\d{8}$/;
  return phoneRegex.test(cleaned);
};

/**
 * Validate phone number with detailed error message (10 digits)
 */
export const validatePhoneNumber = (phone: string | undefined): ValidationResult => {
  if (!phone || phone.trim() === '') {
    return { isValid: true }; // Optional field
  }
  
  // Remove common separators
  const cleaned = phone.replace(/[\s\-()]/g, '');
  
  // Must be 10 digits starting with 05 or 5
  const phoneRegex = /^(05|5)\d{8}$/;
  if (!phoneRegex.test(cleaned)) {
    return { isValid: false, error: 'رقم الهاتف يجب أن يكون 10 أرقام ويبدأ بـ 05' };
  }
  
  return { isValid: true };
};

/**
 * Validate birth date
 */
export const isValidBirthDate = (birthDate: string | undefined): boolean => {
  if (!birthDate || birthDate.trim() === '') return true; // Optional field
  
  const date = new Date(birthDate);
  if (isNaN(date.getTime())) return false;
  
  const today = new Date();
  const age = today.getFullYear() - date.getFullYear();
  
  // Age between 3 and 120 years
  if (age < 3 || age > 120) return false;
  
  // Not in the future
  if (date > today) return false;
  
  return true;
};

/**
 * Validate birth date with detailed error message
 */
export const validateBirthDate = (birthDate: string | undefined): ValidationResult => {
  if (!birthDate || birthDate.trim() === '') {
    return { isValid: true }; // Optional field
  }
  
  const date = new Date(birthDate);
  if (isNaN(date.getTime())) {
    return { isValid: false, error: 'تاريخ الميلاد غير صحيح' };
  }
  
  const today = new Date();
  
  if (date > today) {
    return { isValid: false, error: 'تاريخ الميلاد لا يمكن أن يكون في المستقبل' };
  }
  
  const age = today.getFullYear() - date.getFullYear();
  if (age < 3 || age > 120) {
    return { isValid: false, error: 'تاريخ الميلاد غير معقول' };
  }
  
  return { isValid: true };
};

/**
 * Validate gender
 */
export const isValidGender = (gender: string | undefined): boolean => {
  if (!gender || gender.trim() === '') return true; // Optional field
  
  const validGenders = ['male', 'female', 'ذكر', 'أنثى', 'm', 'f'];
  return validGenders.includes(gender.trim().toLowerCase());
};

/**
 * Validate gender with detailed error message
 */
export const validateGender = (gender: string | undefined): ValidationResult => {
  if (!gender || gender.trim() === '') {
    return { isValid: true }; // Optional field
  }
  
  const validGenders = ['male', 'female', 'ذكر', 'أنثى', 'm', 'f'];
  if (!validGenders.includes(gender.trim().toLowerCase())) {
    return { isValid: false, error: 'الجنس غير صحيح' };
  }
  
  return { isValid: true };
};

/**
 * Validate residence/address
 */
export const isValidResidence = (residence: string | undefined): boolean => {
  if (!residence || residence.trim() === '') return true; // Optional field
  
  const trimmed = residence.trim();
  if (trimmed.length < 5 || trimmed.length > 500) return false;
  
  return true;
};

/**
 * Validate residence with detailed error message
 */
export const validateResidence = (residence: string | undefined): ValidationResult => {
  if (!residence || residence.trim() === '') {
    return { isValid: true }; // Optional field
  }
  
  const trimmed = residence.trim();
  
  if (trimmed.length < 5) {
    return { isValid: false, error: 'العنوان يجب أن يكون 5 أحرف على الأقل' };
  }
  
  if (trimmed.length > 500) {
    return { isValid: false, error: 'العنوان يجب أن يكون 500 حرف أو أقل' };
  }
  
  return { isValid: true };
};

/**
 * Validate ID number (9 digits)
 */
export const isValidIdNumber = (idNumber: string | undefined): boolean => {
  if (!idNumber || idNumber.trim() === '') return true; // Optional field
  
  const cleaned = idNumber.trim();
  // 9 digits for Saudi Arabia ID
  return /^\d{9}$/.test(cleaned);
};

/**
 * Validate ID number with detailed error message
 */
export const validateIdNumber = (idNumber: string | undefined): ValidationResult => {
  if (!idNumber || idNumber.trim() === '') {
    return { isValid: true }; // Optional field
  }
  
  const cleaned = idNumber.trim();
  
  if (!/^\d{9}$/.test(cleaned)) {
    return { isValid: false, error: 'رقم الهوية يجب أن يكون 9 أرقام' };
  }
  
  return { isValid: true };
};

/**
 * Validate a single field
 */
export const validateField = (fieldName: string, value: string | undefined): ValidationResult => {
  switch (fieldName) {
    case 'firstName':
      return validateName(value, 'الاسم الأول');
    case 'fatherName':
      return validateName(value, 'اسم الأب');
    case 'grandFatherName':
      return validateName(value, 'اسم الجد');
    case 'lastName':
      return validateName(value, 'اسم العائلة');
    case 'motherName':
      return validateName(value, 'اسم الأم');
    case 'email':
      return validateEmail(value);
    case 'phoneNumber':
      return validatePhoneNumber(value);
    case 'birthDate':
      return validateBirthDate(value);
    case 'gender':
      return validateGender(value);
    case 'residence':
      return validateResidence(value);
    case 'idNumber':
      return validateIdNumber(value);
    default:
      return { isValid: true };
  }
};

/**
 * Validate entire profile data
 */
export const validateProfileData = (data: {
  firstName?: string;
  fatherName?: string;
  grandFatherName?: string;
  lastName?: string;
  motherName?: string;
  email?: string;
  phoneNumber?: string;
  birthDate?: string;
  gender?: string;
  residence?: string;
  idNumber?: string;
}): { isValid: boolean; errors: FieldErrors } => {
  const errors: FieldErrors = {};
  let isValid = true;

  // Validate first name (required)
  if (data.firstName !== undefined) {
    const result = validateName(data.firstName, 'الاسم الأول');
    if (!result.isValid) {
      errors.firstName = result.error;
      isValid = false;
    }
  }

  // Validate father name
  if (data.fatherName !== undefined && data.fatherName.trim() !== '') {
    const result = validateName(data.fatherName, 'اسم الأب');
    if (!result.isValid) {
      errors.fatherName = result.error;
      isValid = false;
    }
  }

  // Validate grandfather name
  if (data.grandFatherName !== undefined && data.grandFatherName.trim() !== '') {
    const result = validateName(data.grandFatherName, 'اسم الجد');
    if (!result.isValid) {
      errors.grandFatherName = result.error;
      isValid = false;
    }
  }

  // Validate last name
  if (data.lastName !== undefined && data.lastName.trim() !== '') {
    const result = validateName(data.lastName, 'اسم العائلة');
    if (!result.isValid) {
      errors.lastName = result.error;
      isValid = false;
    }
  }

  // Validate mother name
  if (data.motherName !== undefined && data.motherName.trim() !== '') {
    const result = validateName(data.motherName, 'اسم الأم');
    if (!result.isValid) {
      errors.motherName = result.error;
      isValid = false;
    }
  }

  // Validate email
  if (data.email !== undefined && data.email.trim() !== '') {
    const result = validateEmail(data.email);
    if (!result.isValid) {
      errors.email = result.error;
      isValid = false;
    }
  }

  // Validate phone number
  if (data.phoneNumber !== undefined && data.phoneNumber.trim() !== '') {
    const result = validatePhoneNumber(data.phoneNumber);
    if (!result.isValid) {
      errors.phoneNumber = result.error;
      isValid = false;
    }
  }

  // Validate birth date
  if (data.birthDate !== undefined && data.birthDate.trim() !== '') {
    const result = validateBirthDate(data.birthDate);
    if (!result.isValid) {
      errors.birthDate = result.error;
      isValid = false;
    }
  }

  // Validate gender
  if (data.gender !== undefined && data.gender.trim() !== '') {
    const result = validateGender(data.gender);
    if (!result.isValid) {
      errors.gender = result.error;
      isValid = false;
    }
  }

  // Validate residence
  if (data.residence !== undefined && data.residence.trim() !== '') {
    const result = validateResidence(data.residence);
    if (!result.isValid) {
      errors.residence = result.error;
      isValid = false;
    }
  }

  // Validate ID number
  if (data.idNumber !== undefined && data.idNumber.trim() !== '') {
    const result = validateIdNumber(data.idNumber);
    if (!result.isValid) {
      errors.idNumber = result.error;
      isValid = false;
    }
  }

  return { isValid, errors };
};
