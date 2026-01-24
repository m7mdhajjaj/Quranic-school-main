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
    .when('$isNewStudent', {
      is: true,
      then: (schema) => schema.required('اسم الأب مطلوب'),
      otherwise: (schema) => schema.nullable().notRequired(),
    })
    .trim(),
    
  grandFatherName: yup
    .string()
    .when('$isNewStudent', {
      is: true,
      then: (schema) => schema.required('اسم الجد مطلوب'),
      otherwise: (schema) => schema.nullable().notRequired(),
    })
    .trim(),
    
  motherName: yup
    .string()
    .when('$isNewStudent', {
      is: true,
      then: (schema) => schema.required('اسم الأم مطلوب'),
      otherwise: (schema) => schema.nullable().notRequired(),
    })
    .trim(),
    
  lastName: yup
    .string()
    .when('$isNewStudent', {
      is: true,
      then: (schema) => schema.required('اسم العائلة مطلوب'),
      otherwise: (schema) => schema.nullable().notRequired(),
    })
    .trim(),
    
  idNumber: yup
    .string()
    .when('$isNewStudent', {
      is: true,
      then: (schema) => schema.required('رقم الهوية مطلوب'),
      otherwise: (schema) => schema.nullable().notRequired(),
    })
    .trim()
    .test('valid-id-number', 'رقم الهوية يجب أن يتكون من 9 أرقام فقط', function(value) {
      if (!value) return true; // Allow empty for updates
      const cleanValue = value.replace(/\s+/g, '');
      return /^\d{9}$/.test(cleanValue);
    }),
    
  birthDate: yup
    .string()
    .nullable()
    .test('not-future', 'تاريخ الميلاد لا يمكن أن يكون في المستقبل', (value) => {
      if (!value) return true;
      return new Date(value) <= new Date();
    }),
    
  gender: yup
    .string()
    .nullable()
    .oneOf([null, 'ذكر', 'أنثى', 'male', 'female', 'Male', 'Female'], 
           'الجنس يجب أن يكون ذكر أو أنثى')
    .transform((value) => value ? normalizeGender(value) : null),
    
  residence: yup
    .string()
    .nullable()
    .trim(),
    
  teacher: yup
    .string()
    .nullable()
    .notRequired()
    .trim(),
    
  group: yup
    .string()
    .when('$isNewStudent', {
      is: true,
      then: (schema) => schema.required('اسم الحلقة مطلوب'),
      otherwise: (schema) => schema.nullable().notRequired(),
    })
    .trim(),
    
  phoneNumber: yup
    .string()
    .nullable()
    .transform((value) => value === '' ? null : value)
    .test('valid-phone', 'الرقم يجب أن يبدأ بـ 05 ويتكوّن من 10 أرقام', function(value) {
      if (!value || value === null) return true; // Allow empty
      const cleanValue = value.replace(/\s+/g, '');
      // التحقق من أن الرقم يبدأ بـ 05 ويتكون من 10 أرقام بالضبط
      if (!/^05\d{8}$/.test(cleanValue)) {
        return this.createError({ 
          message: `الرقم يجب أن يبدأ بـ 05 ويتكوّن من 10 أرقام (أدخلت ${cleanValue.length} رقم)` 
        });
      }
      return true;
    }),
    
  // الحقول الاختيارية
  email: yup
    .string()
    .matches(/\S+@\S+\.\S+/, 'البريد الإلكتروني غير صالح')
    .nullable()
    .transform((value) => value === '' ? null : value),
    
  age: yup
    .number()
    .min(0, 'العمر يجب أن يكون رقماً موجباً')
    .nullable()
    .transform((value) => isNaN(value) ? null : value),
}).transform((data) => ({
  ...data,
  // حساب العمر تلقائياً من تاريخ الميلاد (مثل computedAge virtual في Backend)
  age: data.birthDate ? calculateAge(data.birthDate) : data.age,
  // تطبيع الجنس (مثل set function في Backend)
  gender: normalizeGender(data.gender),
}));

// Type للبيانات بعد التحقق
export type StudentFormData = yup.InferType<typeof studentValidationSchema>;

// دالة للتحقق من صحة البيانات
export const validateStudentWithYup = async (
  data: Record<string, unknown>, 
  isNewStudent: boolean = true
): Promise<StudentFormData> => {
  const validData = await studentValidationSchema.validate(data, {
    abortEarly: false,
    context: { isNewStudent },
  });
  
  return validData;
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