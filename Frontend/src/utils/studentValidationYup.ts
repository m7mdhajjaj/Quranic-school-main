// Student Validation using Yup
// بديل للـ validation المخصوص باستخدام مكتبة Yup

import * as yup from 'yup';

// تخصيص رسائل Yup بالعربية
yup.setLocale({
  mixed: {
    required: '${path} مطلوب',
    notType: '${path} يجب أن يكون من نوع ${type}',
  },
  string: {
    min: '${path} يجب أن يحتوي على ${min} أحرف على الأقل',
    max: '${path} يجب ألا يتجاوز ${max} حرف',
    email: 'البريد الإلكتروني غير صحيح',
    matches: '${path} لا يطابق التنسيق المطلوب',
  },
  number: {
    min: '${path} يجب أن يكون ${min} أو أكثر',
    max: '${path} يجب أن يكون ${max} أو أقل',
    positive: '${path} يجب أن يكون رقماً موجباً',
  },
});

// تطبيع الجنس - نفس المنطق السابق
const normalizeGender = (value: string): string => {
  if (!value) return '';
  const normalized = value.toString().toLowerCase().trim();
  if (normalized === 'male' || normalized === 'ذكر') return 'ذكر';
  if (normalized === 'female' || normalized === 'أنثى' || normalized === 'انثى') return 'أنثى';
  return value;
};

// حساب العمر - نفس المنطق السابق
const calculateAge = (birthDate: string): number => {
  if (!birthDate) return 0;
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

// Yup Schema - متطابق مع Backend validation
export const studentValidationSchema = yup.object({
  // studentId - يتم توليده تلقائياً في الباك اند
  studentId: yup
    .number()
    .positive('رقم الطالب يجب أن يكون رقماً موجباً')
    .nullable(),
    
  // الحقول المطلوبة
  firstName: yup
    .string()
    .required('الاسم الأول مطلوب')
    .trim(),
    
  fatherName: yup
    .string()
    .required('اسم الأب مطلوب')
    .trim(),
    
  grandFatherName: yup
    .string()
    .required('اسم الجد مطلوب')
    .trim(),
    
  motherName: yup
    .string()
    .required('اسم الأم مطلوب')
    .trim(),
    
  lastName: yup
    .string()
    .required('اسم العائلة مطلوب')
    .trim(),
    
  idNumber: yup
    .string()
    .required('رقم الهوية مطلوب')
    .matches(/^\d{9}$/, 'رقم الهوية يجب أن يتكون من 9 أرقام فقط')
    .test('unique-id', 'رقم الهوية موجود بالفعل', function(_value) {
      // هذا التحقق يتم في الباك اند - unique constraint
      return true;
    }),
    
  birthDate: yup
    .string()
    .required('تاريخ الميلاد مطلوب')
    .test('not-future', 'تاريخ الميلاد لا يمكن أن يكون في المستقبل', (value) => {
      if (!value) return true;
      return new Date(value) <= new Date();
    }),
    
  gender: yup
    .string()
    .required('الجنس مطلوب')
    .oneOf(['ذكر', 'أنثى', 'male', 'female', 'Male', 'Female'], 
           'الجنس يجب أن يكون ذكر أو أنثى')
    .transform((value) => normalizeGender(value)),
    
  residence: yup
    .string()
    .required('مكان السكن مطلوب')
    .trim(),
    
  teacher: yup
    .string()
    .required('اسم المعلم مطلوب')
    .trim(),
    
  group: yup
    .string()
    .required('اسم الحلقة مطلوب')
    .trim(),
    
  phoneNumber: yup
    .string()
    .required('رقم الهاتف مطلوب')
    .matches(/^05\d{8}$/, 'الرقم يجب أن يبدأ بـ 05 ويتكوّن من 10 أرقام')
    .test('unique-phone', 'رقم الهاتف موجود بالفعل', function(_value) {
      // هذا التحقق يتم في الباك اند - unique constraint
      return true;
    }),
    
  // الحقول الاختيارية
  email: yup
    .string()
    .matches(/\S+@\S+\.\S+/, 'البريد الإلكتروني غير صالح')
    .nullable()
    .transform((value) => value === '' ? null : value),
    
  password: yup
    .string()
    .when('$isNewStudent', {
      is: true,
      then: (schema) => schema.required('كلمة المرور مطلوبة'),
      otherwise: (schema) => schema.nullable(),
    }),
    
  age: yup
    .number()
    .min(0, 'العمر يجب أن يكون رقماً موجباً')
    .nullable()
    .transform((value) => isNaN(value) ? null : value),
    
  // حقول إضافية من الباك اند
  avatar: yup
    .object({
      data: yup.mixed().nullable(),
      contentType: yup.string().nullable(),
    })
    .nullable(),
    
  isActive: yup
    .boolean()
    .default(false),
    
  lastSeen: yup
    .date()
    .default(() => new Date()),
}).transform((data) => ({
  ...data,
  // حساب العمر تلقائياً من تاريخ الميلاد (مثل computedAge virtual في Backend)
  age: data.birthDate ? calculateAge(data.birthDate) : data.age,
  // تطبيع الجنس (مثل set function في Backend)
  gender: normalizeGender(data.gender),
  // إضافة timestamps (مثل Backend)
  ...(data.isActive === undefined && { isActive: false }),
  ...(data.lastSeen === undefined && { lastSeen: new Date() }),
}));

// Type للبيانات بعد التحقق
export type StudentFormData = yup.InferType<typeof studentValidationSchema>;

// دالة للتحقق من صحة البيانات
export const validateStudentWithYup = async (
  data: Record<string, unknown>, 
  isNewStudent: boolean = false
): Promise<{ isValid: boolean; errors: Record<string, string>; data?: StudentFormData }> => {
  try {
    const validData = await studentValidationSchema.validate(data, {
      abortEarly: false,
      context: { isNewStudent },
    });
    
    return {
      isValid: true,
      errors: {},
      data: validData,
    };
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      const errors: Record<string, string> = {};
      
      error.inner.forEach((err) => {
        if (err.path) {
          errors[err.path] = err.message;
        }
      });
      
      return {
        isValid: false,
        errors,
      };
    }
    
    throw error;
  }
};

// دالة للتحقق من حقل واحد
export const validateFieldWithYup = async (
  fieldName: string,
  value: unknown,
  allData: Record<string, unknown> = {},
  isNewStudent: boolean = false
): Promise<string | null> => {
  try {
    const schema = yup.reach(studentValidationSchema, fieldName) as yup.Schema;
    await schema.validate(value, {
      context: { isNewStudent, ...allData },
    });
    return null;
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      return error.message;
    }
    return 'خطأ في التحقق';
  }
};

// Schema مبسط للاستخدام مع React Hook Form
export const studentSchemaForHookForm = studentValidationSchema;

export { normalizeGender, calculateAge };