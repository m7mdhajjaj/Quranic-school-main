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
    .when('$isNewStudent', {
      is: true,
      then: (schema) => schema.required('اسم المعلم مطلوب'),
      otherwise: (schema) => schema.nullable().notRequired(),
    })
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
    .test('valid-phone', 'الرقم يجب أن يبدأ بـ 05 ويتكوّن من 10 أرقام', function(value) {
      if (!value) return true; // Allow empty
      const cleanValue = value.replace(/\s+/g, '');
      return /^05\d{8}$/.test(cleanValue);
    })
    .test('unique-phone', 'رقم الهاتف موجود بالفعل', function() {
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
      otherwise: (schema) => schema.nullable().notRequired(),
    })
    .test('password-strength', 'كلمة المرور لا تلبي المتطلبات', function(value) {
      const { isNewStudent } = this.options.context || {};
      
      // إذا كان طالب جديد يجب التحقق من قوة كلمة المرور
      if (isNewStudent && value) {
        // التحقق من الطول الأدنى
        if (value.length < 4) {
          return this.createError({ message: 'كلمة المرور يجب أن تكون 4 أحرف على الأقل' });
        }
        
        // عد الأرقام والحروف (يدعم الأرقام العربية والإنجليزية)
        const numbers = (value.match(/[\d٠-٩]/g) || []).length;
        const letters = (value.match(/[a-zA-Z\u0600-\u06FF]/g) || []).length;
        
        // التحقق من القواعد الجديدة
        const hasMinimumNumbers = numbers >= 4;
        const hasMinimumLettersWithNumbers = letters >= 3 && numbers >= 1;
        
        if (!hasMinimumNumbers && !hasMinimumLettersWithNumbers) {
          return this.createError({ 
            message: 'كلمة المرور يجب أن تحتوي على 4 أرقام على الأقل، أو 3 حروف مع أرقام' 
          });
        }
      }
      
      return true;
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
    console.log('🔍 التحقق من البيانات - isNewStudent:', isNewStudent);
    console.log('🔍 البيانات المُدخلة:', JSON.stringify(data, null, 2));
    
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