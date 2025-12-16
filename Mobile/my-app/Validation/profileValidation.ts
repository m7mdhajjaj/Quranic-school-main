// Profile Validation - Mobile - يستخدم الـ validation من ملفات المستخدمين المختلفة حسب الـ role
// Uses validation from different user files based on role

import {
  validateTeacherWithYup,
  type TeacherFormData,
} from "./teacherValidation";
import {
  validateStudentWithYup,
  type StudentFormData,
} from "./studentValidation";
import { validateAdminWithYup, type AdminFormData } from "./AdminValdation";

// Union type for all possible field errors
export type FieldErrors = Record<string, string>;

// Profile data type that can represent any user type
export interface ProfileData {
  // Common fields
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  idNumber?: string;
  birthDate?: string;
  gender?: string;
  residence?: string;
  profileImage?: string;

  // Student-specific fields
  fatherName?: string;
  grandFatherName?: string;
  motherName?: string;
  teacher?: string;
  group?: string;

  // Teacher-specific fields
  yearsOfExperience?: number;

  // Admin-specific fields
  adminId?: string;

  // User role
  role?: "student" | "teacher" | "admin";
}

/**
 * Validate profile data based on user role
 * @param data - Profile data to validate
 * @param isUpdate - Whether this is an update operation (true) or create operation (false)
 * @returns Validation result with errors if any
 */
export const validateProfileData = async (
  data: ProfileData,
  isUpdate: boolean = true
): Promise<{
  isValid: boolean;
  errors: FieldErrors;
}> => {
  const role = data.role || "student";

  console.log("🔍 Validating profile data for role:", role);
  console.log("🔍 isUpdate:", isUpdate);

  try {
    // Choose validation based on role
    if (role === "teacher") {
      // validateTeacherWithYup uses isNewTeacher parameter (opposite of isUpdate)
      const validation = await validateTeacherWithYup(data as any, !isUpdate);
      console.log("📚 Teacher validation result:", validation);
      return validation;
    } else if (role === "student") {
      // validateStudentWithYup uses isNewStudent parameter (opposite of isUpdate)
      const validation = await validateStudentWithYup(data as any, !isUpdate);
      console.log("📚 Student validation result:", validation);
      return validation;
    } else if (role === "admin") {
      // validateAdminWithYup uses isUpdate parameter directly
      const validation = await validateAdminWithYup(
        data as AdminFormData,
        isUpdate
      );
      console.log("📚 Admin validation result:", validation);
      return validation;
    }

    // Default: no validation errors
    return { isValid: true, errors: {} };
  } catch (error) {
    console.error("❌ Validation error:", error);
    return {
      isValid: false,
      errors: { general: "حدث خطأ في التحقق من البيانات" },
    };
  }
};

/**
 * Validate a single field based on user role
 * @param fieldName - Name of the field to validate
 * @param value - Value of the field
 * @param role - User role
 * @returns Error message if validation fails, empty string if valid
 */
export const validateField = async (
  fieldName: string,
  value: string | number | boolean | undefined,
  role: "student" | "teacher" | "admin" = "student"
): Promise<string> => {
  // Create a partial profile data object with just this field
  const partialData: ProfileData = {
    [fieldName]: value,
    role: role,
  };

  // Validate using the full validation function
  const validation = await validateProfileData(partialData);

  // Return the error for this specific field, or empty string if valid
  return validation.errors[fieldName] || "";
};

/**
 * Check if profile data has any validation errors
 * @param data - Profile data to check
 * @returns true if data is valid, false otherwise
 */
export const isProfileDataValid = async (
  data: ProfileData
): Promise<boolean> => {
  const validation = await validateProfileData(data);
  return validation.isValid;
};

/**
 * Get validation error message for a specific field
 * @param errors - Validation errors object
 * @param fieldName - Name of the field
 * @returns Error message or empty string
 */
export const getFieldError = (
  errors: FieldErrors,
  fieldName: string
): string => {
  return errors[fieldName] || "";
};

/**
 * Check if a specific field has an error
 * @param errors - Validation errors object
 * @param fieldName - Name of the field
 * @returns true if field has error, false otherwise
 */
export const hasFieldError = (
  errors: FieldErrors,
  fieldName: string
): boolean => {
  return !!errors[fieldName];
};
