/**
 * Mobile News Validation using Yup
 * Matches backend validation rules for consistency
 */

import * as Yup from "yup";

/**
 * News Form Validation Schema
 * Matches backend validation rules for consistency
 */
export const newsValidationSchema = Yup.object().shape({
  title: Yup.string()
    .required("عنوان الخبر مطلوب")
    .min(3, "عنوان الخبر يجب أن يكون 3 أحرف على الأقل")
    .max(200, "عنوان الخبر يجب أن يكون 200 حرف أو أقل")
    .trim(),

  content: Yup.string()
    .required("محتوى الخبر مطلوب")
    .min(3, "محتوى الخبر يجب أن يكون 3 أحرف على الأقل")
    .trim(),

  date: Yup.string()
    .required("تاريخ الخبر مطلوب")
    .test(
      "not-past-date",
      "لا يمكن اختيار تاريخ في الماضي، يجب أن يكون التاريخ اليوم أو تاريخ مستقبلي",
      function (value) {
        if (!value) return false;

        const selectedDate = new Date(value);
        const today = new Date();

        // Set hours to 0 for accurate date comparison (ignore time)
        selectedDate.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);

        // Date must be today or in the future
        return selectedDate >= today;
      }
    ),

  imageUrl: Yup.string().url("رابط الصورة غير صحيح").optional(),
});

/**
 * Image Asset Validation for React Native
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
 * Main validation function for news form
 * Returns object mapping field names to error messages
 */
export const validateNewsForm = async (formData: {
  title: string;
  content: string;
  date: string;
  imageUrl?: string;
  selectedImage?: ImageAsset | null;
}): Promise<Record<string, string>> => {
  const errors: Record<string, string> = {};

  // Only validate the required fields (title, content, date)
  // Skip imageUrl validation as it can be a blob URL
  const dataToValidate = {
    title: formData.title,
    content: formData.content,
    date: formData.date,
  };

  try {
    // Validate form data with Yup schema (includes date validation)
    await newsValidationSchema.validate(dataToValidate, { abortEarly: false });
  } catch (err) {
    if (err instanceof Yup.ValidationError) {
      // Map validation errors to field names
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
 * Used for showing errors as user types
 */
export const validateField = async (
  fieldName: string,
  value: string
): Promise<{ isValid: boolean; message?: string }> => {
  try {
    // Yup schema already includes date validation (not-past-date test)
    await newsValidationSchema.validateAt(fieldName, { [fieldName]: value });
    return { isValid: true };
  } catch (err) {
    if (err instanceof Yup.ValidationError) {
      return { isValid: false, message: err.message };
    }
    return { isValid: true };
  }
};
