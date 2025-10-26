/**
 * Frontend Activity Validation using Yup
 * Matches backend validation rules for consistency
 */

import * as Yup from 'yup';

/**
 * Activity Form Validation Schema
 * Matches backend validation rules for consistency
 */
export const activityValidationSchema = Yup.object().shape({
  title: Yup.string()
    .required('عنوان النشاط مطلوب')
    .min(5, 'عنوان النشاط يجب أن يكون 5 أحرف على الأقل')
    .max(200, 'عنوان النشاط يجب أن يكون 200 حرف أو أقل')
    .trim(),

  description: Yup.string()
    .required('وصف النشاط مطلوب')
    .min(10, 'وصف النشاط يجب أن يكون 10 أحرف على الأقل')
    .max(2000, 'وصف النشاط يجب أن يكون 2000 حرف أو أقل')
    .trim(),

  date: Yup.string()
    .required('تاريخ النشاط مطلوب')
    .test('is-valid-date', 'تاريخ النشاط غير صحيح', (value) => {
      if (!value) return false;
      const date = new Date(value);
      return !isNaN(date.getTime());
    }),

  category: Yup.string()
    .optional()
    .trim(),

  imageUrl: Yup.string()
    .url('رابط الصورة غير صحيح')
    .optional(),
});

/**
 * Valid activity categories/types
 * Matches backend validation
 */
export const VALID_ACTIVITY_TYPES = [
  'رحلة',
  'رياضي',
  'ثقافي',
  'تعليمي',
  'اجتماعي',
  'ديني',
  'مسابقة',
  'ورشة عمل',
  'محاضرة',
  'درس',
] as const;

/**
 * Image File Validation
 * Matches backend file validation rules
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
 * Validate activity title
 * Standalone function for real-time validation
 */
export const validateActivityTitle = (title: string): {
  isValid: boolean;
  message?: string;
} => {
  if (!title || title.trim() === '') {
    return { isValid: false, message: 'عنوان النشاط مطلوب' };
  }

  const titleStr = title.trim();
  if (titleStr.length < 5) {
    return {
      isValid: false,
      message: 'عنوان النشاط يجب أن يكون 5 أحرف على الأقل',
    };
  }

  if (titleStr.length > 200) {
    return {
      isValid: false,
      message: 'عنوان النشاط يجب أن يكون 200 حرف أو أقل',
    };
  }

  return { isValid: true };
};

/**
 * Validate activity description
 * Standalone function for real-time validation
 */
export const validateDescription = (description: string): {
  isValid: boolean;
  message?: string;
} => {
  if (!description || description.trim() === '') {
    return { isValid: false, message: 'وصف النشاط مطلوب' };
  }

  const descStr = description.trim();
  if (descStr.length < 10) {
    return {
      isValid: false,
      message: 'وصف النشاط يجب أن يكون 10 أحرف على الأقل',
    };
  }

  if (descStr.length > 2000) {
    return {
      isValid: false,
      message: 'وصف النشاط يجب أن يكون 2000 حرف أو أقل',
    };
  }

  return { isValid: true };
};

/**
 * Validate activity date
 * Standalone function for real-time validation
 */
export const validateActivityDate = (date: string): {
  isValid: boolean;
  message?: string;
} => {
  if (!date || date.trim() === '') {
    return { isValid: false, message: 'تاريخ النشاط مطلوب' };
  }

  const activityDate = new Date(date);
  if (isNaN(activityDate.getTime())) {
    return { isValid: false, message: 'تاريخ النشاط غير صحيح' };
  }

  return { isValid: true };
};

/**
 * Validate activity category/type
 * Standalone function for real-time validation
 */
export const validateActivityType = (type: string): {
  isValid: boolean;
  message?: string;
} => {
  if (!type || type.trim() === '') {
    return { isValid: true }; // Optional field, default will be used
  }

  // Allow any category, including custom ones
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
  selectedFile?: File | null;
}): Promise<Record<string, string>> => {
  const errors: Record<string, string> = {};

  // Only validate the required fields (title, description, date)
  // Skip imageUrl validation as it can be a blob URL
  const dataToValidate = {
    title: formData.title,
    description: formData.description,
    date: formData.date,
    category: formData.category || '',
  };

  try {
    // Validate form data with Yup schema
    await activityValidationSchema.validate(dataToValidate, { abortEarly: false });
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
    await activityValidationSchema.validateAt(fieldName, { [fieldName]: value });
    return { isValid: true };
  } catch (err) {
    if (err instanceof Yup.ValidationError) {
      return { isValid: false, message: err.message };
    }
    return { isValid: true };
  }
};

/**
 * Sanitize activity data
 * Remove potential XSS and clean up data
 */
export const sanitizeActivityData = (data: Record<string, unknown>): Record<string, unknown> => {
  const sanitized: Record<string, unknown> = {};

  Object.keys(data).forEach((key) => {
    if (typeof data[key] === 'string') {
      sanitized[key] = (data[key] as string)
        .trim()
        .replace(/[<>]/g, '') // Remove potential HTML tags
        .replace(/javascript:/gi, '') // Remove javascript: protocols
        .replace(/on\w+=/gi, ''); // Remove event handlers
    } else {
      sanitized[key] = data[key];
    }
  });

  return sanitized;
};
