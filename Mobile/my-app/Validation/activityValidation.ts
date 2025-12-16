/**
 * Mobile Activity Validation using Yup
 * Matches backend validation rules for consistency
 */

import * as Yup from "yup";

/**
 * Activity Form Validation Schema
 * Matches backend validation rules for consistency
 */
export const activityValidationSchema = Yup.object().shape({
  title: Yup.string()
    .required("عنوان النشاط مطلوب")
    .min(5, "عنوان النشاط يجب أن يكون 5 أحرف على الأقل")
    .max(200, "عنوان النشاط يجب أن يكون 200 حرف أو أقل")
    .trim(),

  description: Yup.string()
    .required("وصف النشاط مطلوب")
    .min(10, "وصف النشاط يجب أن يكون 10 أحرف على الأقل")
    .max(2000, "وصف النشاط يجب أن يكون 2000 حرف أو أقل")
    .trim(),

  date: Yup.string()
    .required("تاريخ النشاط مطلوب")
    .test("is-valid-date", "تاريخ النشاط غير صحيح", (value) => {
      if (!value) return false;
      const date = new Date(value);
      return !isNaN(date.getTime());
    }),

  category: Yup.string().optional().trim(),

  imageUrl: Yup.string().url("رابط الصورة غير صحيح").optional(),
});

/**
 * Valid activity categories/types
 * Matches backend validation
 */
export const VALID_ACTIVITY_TYPES = [
  "رحلة",
  "رياضي",
  "ثقافي",
  "تعليمي",
  "اجتماعي",
  "ديني",
  "مسابقة",
  "ورشة عمل",
  "محاضرة",
  "درس",
] as const;

/**
 * Image File Validation for React Native
 * Matches backend file validation rules
 */
export interface ImageAsset {
  uri: string;
  type?: string;
  fileSize?: number;
  fileName?: string;
}

export const validateImageFile = (
  image: ImageAsset | null
): {
  isValid: boolean;
  message?: string;
} => {
  if (!image) {
    return { isValid: true }; // Optional field
  }

  // Check file type
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  if (image.type && !allowedTypes.includes(image.type)) {
    return {
      isValid: false,
      message: "نوع الصورة غير مدعوم (يُسمح بـ JPEG, PNG, WebP فقط)",
    };
  }

  // Check file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (image.fileSize && image.fileSize > maxSize) {
    return {
      isValid: false,
      message: "حجم الصورة كبير جداً (الحد الأقصى 5 ميجابايت)",
    };
  }

  return { isValid: true };
};

/**
 * Validate activity title
 * Standalone function for real-time validation
 */
export const validateActivityTitle = (
  title: string
): {
  isValid: boolean;
  message?: string;
} => {
  if (!title || title.trim() === "") {
    return { isValid: false, message: "عنوان النشاط مطلوب" };
  }

  if (title.length < 5) {
    return {
      isValid: false,
      message: "عنوان النشاط يجب أن يكون 5 أحرف على الأقل",
    };
  }

  if (title.length > 200) {
    return {
      isValid: false,
      message: "عنوان النشاط يجب أن يكون 200 حرف أو أقل",
    };
  }

  return { isValid: true };
};

/**
 * Validate activity description
 * Standalone function for real-time validation
 */
export const validateActivityDescription = (
  description: string
): {
  isValid: boolean;
  message?: string;
} => {
  if (!description || description.trim() === "") {
    return { isValid: false, message: "وصف النشاط مطلوب" };
  }

  if (description.length < 10) {
    return {
      isValid: false,
      message: "وصف النشاط يجب أن يكون 10 أحرف على الأقل",
    };
  }

  if (description.length > 2000) {
    return {
      isValid: false,
      message: "وصف النشاط يجب أن يكون 2000 حرف أو أقل",
    };
  }

  return { isValid: true };
};

/**
 * Validate activity date
 * Standalone function for real-time validation
 */
export const validateActivityDate = (
  date: string
): {
  isValid: boolean;
  message?: string;
} => {
  if (!date || date.trim() === "") {
    return { isValid: false, message: "تاريخ النشاط مطلوب" };
  }

  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    return { isValid: false, message: "تاريخ النشاط غير صحيح" };
  }

  return { isValid: true };
};

/**
 * Main validation function for activity form
 * Returns object mapping field names to error messages
 */
export const validateActivityForm = async (formData: {
  title: string;
  description: string;
  date: string;
  category?: string;
  imageUrl?: string;
  selectedImage?: ImageAsset | null;
}): Promise<Record<string, string>> => {
  const errors: Record<string, string> = {};

  try {
    await activityValidationSchema.validate(formData, { abortEarly: false });
  } catch (err) {
    if (err instanceof Yup.ValidationError) {
      err.inner.forEach((error) => {
        if (error.path && !errors[error.path]) {
          errors[error.path] = error.message;
        }
      });
    }
  }

  // Validate image file if provided
  if (formData.selectedImage) {
    const fileValidation = validateImageFile(formData.selectedImage);
    if (!fileValidation.isValid && fileValidation.message) {
      errors.image = fileValidation.message;
    }
  }

  return errors;
};

/**
 * Real-time validation for individual field
 */
export const validateField = async (
  fieldName: string,
  value: string
): Promise<{ isValid: boolean; message?: string }> => {
  try {
    await activityValidationSchema.validateAt(fieldName, {
      [fieldName]: value,
    });
    return { isValid: true };
  } catch (err) {
    if (err instanceof Yup.ValidationError) {
      return { isValid: false, message: err.message };
    }
    return { isValid: true };
  }
};
