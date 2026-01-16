// ============================================================================
// Secretary Validation - التحقق من بيانات السكرتير
// ============================================================================

import type { SecretaryFormData } from "@/types/secretary.types";

// Regex Patterns - أنماط التحقق
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const phoneRegex = /^05\d{8}$/; // 10 أرقام يبدأ بـ 05
const idNumberRegex = /^\d{9}$/; // 9 أرقام بالضبط

// Validation Errors Interface
export interface SecretaryValidationErrors {
  firstName?: string;
  lastName?: string;
  fatherName?: string;
  grandFatherName?: string;
  motherName?: string;
  idNumber?: string;
  email?: string;
  phoneNumber?: string;
  birthDate?: string;
  gender?: string;
  residence?: string;
  password?: string;
}

/**
 * Calculate age from birth date
 * حساب العمر من تاريخ الميلاد
 */
export const calculateAge = (birthDate: string): number => {
  if (!birthDate) return 0;

  const today = new Date();
  const birthDateObj = new Date(birthDate);

  if (isNaN(birthDateObj.getTime())) return 0;

  let age = today.getFullYear() - birthDateObj.getFullYear();
  const monthDiff = today.getMonth() - birthDateObj.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDateObj.getDate())
  ) {
    age--;
  }

  return age;
};

/**
 * Validate secretary form data
 * التحقق من بيانات نموذج السكرتير
 */
export const validateSecretaryForm = (
  data: SecretaryFormData,
  isUpdate: boolean = false
): SecretaryValidationErrors => {
  const errors: SecretaryValidationErrors = {};

  // الاسم الأول - مطلوب
  if (!data.firstName?.trim()) {
    errors.firstName = "الاسم الأول مطلوب";
  } else if (data.firstName.trim().length < 2) {
    errors.firstName = "الاسم الأول يجب أن يكون حرفين على الأقل";
  } else if (data.firstName.trim().length > 50) {
    errors.firstName = "الاسم الأول يجب أن يكون 50 حرف على الأكثر";
  }

  // اسم العائلة - مطلوب
  if (!data.lastName?.trim()) {
    errors.lastName = "اسم العائلة مطلوب";
  } else if (data.lastName.trim().length < 2) {
    errors.lastName = "اسم العائلة يجب أن يكون حرفين على الأقل";
  } else if (data.lastName.trim().length > 50) {
    errors.lastName = "اسم العائلة يجب أن يكون 50 حرف على الأكثر";
  }

  // البريد الإلكتروني - مطلوب
  if (!data.email?.trim()) {
    errors.email = "البريد الإلكتروني مطلوب";
  } else if (!emailRegex.test(data.email.trim())) {
    errors.email = "صيغة البريد الإلكتروني غير صحيحة";
  }

  // رقم الهاتف - مطلوب
  if (!data.phoneNumber?.trim()) {
    errors.phoneNumber = "رقم الهاتف مطلوب";
  } else if (!phoneRegex.test(data.phoneNumber.trim())) {
    errors.phoneNumber = "الرقم يجب أن يبدأ بـ 05 ويتكوّن من 10 أرقام";
  }

  // رقم الهوية - مطلوب
  if (!data.idNumber?.trim()) {
    errors.idNumber = "رقم الهوية مطلوب";
  } else if (!idNumberRegex.test(data.idNumber.trim())) {
    errors.idNumber = "رقم الهوية يجب أن يتكون من 9 أرقام بالضبط";
  }

  // تاريخ الميلاد - مطلوب
  if (!data.birthDate) {
    errors.birthDate = "تاريخ الميلاد مطلوب";
  } else {
    const age = calculateAge(data.birthDate);
    if (age < 21) {
      errors.birthDate = "يجب أن يكون عمر السكرتير 21 عام على الأقل";
    }
    if (new Date(data.birthDate) > new Date()) {
      errors.birthDate = "تاريخ الميلاد لا يمكن أن يكون في المستقبل";
    }
  }

  // الجنس - مطلوب
  if (!data.gender) {
    errors.gender = "الجنس مطلوب";
  }

  // مكان السكن - مطلوب
  if (!data.residence?.trim()) {
    errors.residence = "مكان السكن مطلوب";
  } else if (data.residence.trim().length > 100) {
    errors.residence = "مكان السكن يجب أن يكون 100 حرف على الأكثر";
  }

  // كلمة المرور - مطلوبة عند الإنشاء فقط
  if (!isUpdate) {
    if (!data.password) {
      errors.password = "كلمة المرور مطلوبة";
    } else if (data.password.length < 4) {
      errors.password = "كلمة المرور يجب أن تكون 4 أحرف على الأقل";
    } else {
      // عد الأرقام والحروف
      const numbers = (data.password.match(/[\d٠-٩]/g) || []).length;
      const letters = (data.password.match(/[a-zA-Z\u0600-\u06FF]/g) || [])
        .length;

      const hasMinimumNumbers = numbers >= 4;
      const hasMinimumLettersWithNumbers = letters >= 3 && numbers >= 1;

      if (!hasMinimumNumbers && !hasMinimumLettersWithNumbers) {
        errors.password =
          "كلمة المرور يجب أن تحتوي على 4 أرقام على الأقل، أو 3 حروف مع أرقام";
      }
    }
  }

  // الحقول الاختيارية - التحقق من الطول فقط
  if (data.fatherName && data.fatherName.trim().length > 50) {
    errors.fatherName = "اسم الأب يجب أن يكون 50 حرف على الأكثر";
  }

  if (data.grandFatherName && data.grandFatherName.trim().length > 50) {
    errors.grandFatherName = "اسم الجد يجب أن يكون 50 حرف على الأكثر";
  }

  if (data.motherName && data.motherName.trim().length > 50) {
    errors.motherName = "اسم الأم يجب أن يكون 50 حرف على الأكثر";
  }

  return errors;
};

/**
 * Check if form has errors
 * التحقق من وجود أخطاء
 */
export const hasValidationErrors = (
  errors: SecretaryValidationErrors
): boolean => {
  return Object.keys(errors).length > 0;
};
