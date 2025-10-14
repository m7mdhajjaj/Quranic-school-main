import * as Yup from 'yup';

/**
 * Login validation schema
 * Simple validation for login - only checks if fields exist
 * Backend will handle detailed authentication validation
 */
export const loginValidationSchema = Yup.object().shape({
  userId: Yup.string()
    .required('رقم المستخدم مطلوب')
    .trim()
    .min(1, 'رقم المستخدم لا يمكن أن يكون فارغاً'),
  
  password: Yup.string()
    .required('كلمة المرور مطلوبة')
    .min(1, 'كلمة المرور لا يمكن أن تكون فارغة'),
});

/**
 * Validate login form data
 * @param data - Login form data
 * @returns Promise with validation result
 */
export const validateLoginForm = async (data: {
  userId: string;
  password: string;
}) => {
  try {
    await loginValidationSchema.validate(data, { abortEarly: false });
    return { isValid: true, errors: {} };
  } catch (err) {
    if (err instanceof Yup.ValidationError) {
      const errors: Record<string, string> = {};
      err.inner.forEach((error) => {
        if (error.path) {
          errors[error.path] = error.message;
        }
      });
      return { isValid: false, errors };
    }
    return { isValid: false, errors: { general: 'حدث خطأ في التحقق من البيانات' } };
  }
};
