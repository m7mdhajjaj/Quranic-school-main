/**
 * Frontend News Validation using Yup
 * Matches backend validation rules for consistency
 */

import * as Yup from 'yup';

/**
 * News Form Validation Schema
 * Matches backend validation rules for consistency
 */
export const newsValidationSchema = Yup.object().shape({
  title: Yup.string()
    .required('عنوان الخبر مطلوب')
    .min(3, 'عنوان الخبر يجب أن يكون 3 أحرف على الأقل')
    .max(200, 'عنوان الخبر يجب أن يكون 200 حرف أو أقل')
    .trim(),

  content: Yup.string()
    .required('محتوى الخبر مطلوب')
    .min(3, 'محتوى الخبر يجب أن يكون 3 أحرف على الأقل')
    .trim(),

  date: Yup.string()
    .required('تاريخ الخبر مطلوب'),

  imageUrl: Yup.string()
    .url('رابط الصورة غير صحيح')
    .optional(),
});

/**
 * Image File Validation
 */
export const validateImageFile = (file: File | null): { 
  isValid: boolean; 
  message?: string 
} => {
  if (!file) {
    return { isValid: true }; // Optional field
  }
  
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return { 
      isValid: false, 
      message: 'نوع الصورة غير مدعوم (يُسمح بـ JPEG, PNG, WebP فقط)' 
    };
  }
  
  // Check file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return { 
      isValid: false, 
      message: 'حجم الصورة كبير جداً (الحد الأقصى 5 ميجابايت)' 
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
  selectedFile?: File | null;
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
    // Validate form data with Yup schema
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
  if (formData.selectedFile) {
    const fileValidation = validateImageFile(formData.selectedFile);
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
    await newsValidationSchema.validateAt(fieldName, { [fieldName]: value });
    return { isValid: true };
  } catch (err) {
    if (err instanceof Yup.ValidationError) {
      return { isValid: false, message: err.message };
    }
    return { isValid: true };
  }
};
