import * as Yup from 'yup';

// Validation schema for adding favorite
export const addFavoriteSchema = Yup.object().shape({
  question: Yup.string()
    .required('السؤال مطلوب')
    .min(3, 'السؤال يجب أن يكون 3 أحرف على الأقل')
    .max(1000, 'السؤال يجب ألا يتجاوز 1000 حرف')
    .matches(/^[\u0600-\u06FF\s\w\d.,!?؟]+$/, 'السؤال يحتوي على أحرف غير مسموحة'),
  
  answer: Yup.string()
    .required('الجواب مطلوب')
    .min(10, 'الجواب يجب أن يكون 10 أحرف على الأقل'),
  
  tags: Yup.array()
    .of(
      Yup.string()
        .min(2, 'كل علامة يجب أن تكون حرفين على الأقل')
        .max(30, 'كل علامة يجب ألا تتجاوز 30 حرف')
        .matches(/^[\u0600-\u06FF\s\w]+$/, 'العلامة تحتوي على أحرف غير مسموحة')
    )
    .max(10, 'لا يمكن إضافة أكثر من 10 علامات')
    .optional(),
  
  note: Yup.string()
    .max(500, 'الملاحظة يجب ألا تتجاوز 500 حرف')
    .optional()
});

// Validation schema for updating favorite
export const updateFavoriteSchema = Yup.object().shape({
  tags: Yup.array()
    .of(
      Yup.string()
        .min(2, 'كل علامة يجب أن تكون حرفين على الأقل')
        .max(30, 'كل علامة يجب ألا تتجاوز 30 حرف')
        .matches(/^[\u0600-\u06FF\s\w]+$/, 'العلامة تحتوي على أحرف غير مسموحة')
    )
    .max(10, 'لا يمكن إضافة أكثر من 10 علامات')
    .optional(),
  
  note: Yup.string()
    .max(500, 'الملاحظة يجب ألا تتجاوز 500 حرف')
    .optional()
});

// Validation schema for chat message
export const chatMessageSchema = Yup.object().shape({
  message: Yup.string()
    .required('الرسالة مطلوبة')
    .min(3, 'الرسالة يجب أن تكون 3 أحرف على الأقل')
    .max(2000, 'الرسالة يجب ألا تتجاوز 2000 حرف')
    .test('no-english', 'يرجى الكتابة باللغة العربية فقط', (value) => {
      return !/[a-zA-Z]/.test(value || '');
    })
});

// Validation schema for get favorites query
export const getFavoritesQuerySchema = Yup.object().shape({
  search: Yup.string()
    .min(2, 'البحث يجب أن يكون حرفين على الأقل')
    .max(200, 'البحث يجب ألا يتجاوز 200 حرف')
    .optional(),
  
  tag: Yup.string()
    .min(2, 'العلامة يجب أن تكون حرفين على الأقل')
    .max(30, 'العلامة يجب ألا تتجاوز 30 حرف')
    .optional(),
  
  page: Yup.number()
    .integer('رقم الصفحة يجب أن يكون رقماً صحيحاً')
    .min(1, 'رقم الصفحة يجب أن يكون أكبر من 0')
    .optional(),
  
  limit: Yup.number()
    .integer('الحد يجب أن يكون رقماً صحيحاً')
    .min(1, 'الحد يجب أن يكون أكبر من 0')
    .max(100, 'الحد يجب ألا يتجاوز 100')
    .optional()
});

// Helper function to validate data
export const validateData = async (schema: Yup.AnySchema, data: any) => {
  try {
    await schema.validate(data, { abortEarly: false });
    return { isValid: true, errors: null };
  } catch (error) {
    if (error instanceof Yup.ValidationError) {
      const errors: Record<string, string> = {};
      error.inner.forEach((err) => {
        if (err.path) {
          errors[err.path] = err.message;
        }
      });
      return { isValid: false, errors };
    }
    return { isValid: false, errors: { general: 'حدث خطأ في التحقق من البيانات' } };
  }
};
