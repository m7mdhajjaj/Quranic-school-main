// Teacher Validation using Yup
// Validation للمعلم باستخدام مكتبة Yup - متطابق مع Backend Teacher model

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

// تطبيع الجنس - نفس المنطق في Backend Teacher model
const normalizeGender = (value: string): string => {
  if (!value) return '';
  const normalized = value.toString().toLowerCase().trim();
  if (normalized === 'male' || normalized === 'ذكر') return 'ذكر';
  if (normalized === 'female' || normalized === 'أنثى' || normalized === 'انثى') return 'أنثى';
  return value;
};

// حساب العمر من تاريخ الميلاد
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

// Yup Schema - متطابق مع Backend Teacher validation
export const teacherValidationSchema = yup.object({
  // teacherId - يتم توليده تلقائياً في الباك اند
  teacherId: yup
    .number()
    .positive('رقم المعلم يجب أن يكون رقماً موجباً')
    .nullable(),
    
  // كلمة المرور - مطلوبة
  password: yup
    .string()
    .when('$isNewTeacher', {
      is: true,
      then: (schema) => schema.required('كلمة المرور مطلوبة').min(6, 'كلمة المرور يجب أن تحتوي على 6 أحرف على الأقل'),
      otherwise: (schema) => schema.nullable(),
    }),
    
  // الأسماء - الاسم الأول واسم العائلة مطلوبان
  firstName: yup
    .string()
    .required('الاسم الأول مطلوب')
    .trim(),
    
  lastName: yup
    .string()
    .required('اسم العائلة مطلوب')
    .trim(),
    
  fatherName: yup
    .string()
    .nullable()
    .trim()
    .transform((value) => value === '' ? null : value),
    
  grandFatherName: yup
    .string()
    .nullable()
    .trim()
    .transform((value) => value === '' ? null : value),
    
  motherName: yup
    .string()
    .nullable()
    .trim()
    .transform((value) => value === '' ? null : value),
    
  // رقم الهوية - مطلوب وفريد للمعلم
  idNumber: yup
    .string()
    .required('رقم الهوية مطلوب')
    .trim()
    .test('only-numbers', 'رقم الهوية يجب أن يحتوي على أرقام فقط', function(value) {
      if (!value) return false;
      return /^\d+$/.test(value);
    })
    .test('exactly-nine-digits', 'رقم الهوية يجب أن يتكون من 9 أرقام بالضبط', function(value) {
      if (!value) return false;
      return value.length === 9;
    })
    .matches(/^\d{9}$/, 'رقم الهوية يجب أن يتكون من 9 أرقام فقط')
    .test('unique-id', 'رقم الهوية موجود بالفعل', function() {
      // هذا التحقق يتم في الباك اند - unique constraint
      return true;
    }),
    
  // رقم الهاتف - مطلوب وفريد
  phoneNumber: yup
    .string()
    .required('رقم الهاتف مطلوب')
    .matches(/^05\d{8}$/, 'الرقم يجب أن يبدأ بـ 05 ويتكوّن من 10 أرقام')
    .test('unique-phone', 'رقم الهاتف موجود بالفعل', function() {
      // هذا التحقق يتم في الباك اند - unique constraint
      return true;
    }),
    
  // تاريخ الميلاد - مطلوب بصيغة YYYY-MM-DD
  birthDate: yup
    .string()
    .required('تاريخ الميلاد مطلوب')
    .matches(/^\d{4}-\d{2}-\d{2}$/, 'صيغة التاريخ يجب أن تكون YYYY-MM-DD')
    .test('not-future', 'تاريخ الميلاد لا يمكن أن يكون في المستقبل', (value) => {
      if (!value) return true;
      return new Date(value) <= new Date();
    }),
    
  // البريد الإلكتروني - مطلوب وفريد
  email: yup
    .string()
    .required('البريد الإلكتروني مطلوب')
    .matches(/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'صيغة البريد الإلكتروني غير صحيحة')
    .test('unique-email', 'البريد الإلكتروني موجود بالفعل', function() {
      // هذا التحقق يتم في الباك اند - unique constraint
      return true;
    }),
    
  // العمر - اختياري مع حد أدنى صفر
  age: yup
    .number()
    .min(0, 'العمر يجب أن يكون رقماً موجباً')
    .nullable()
    .transform((value) => isNaN(value) ? null : value),
    
  // الجنس - اختياري مع تطبيع القيم
  gender: yup
    .string()
    .nullable()
    .oneOf([null, 'ذكر', 'أنثى', 'male', 'female', 'Male', 'Female'], 
           'الجنس يجب أن يكون ذكر أو أنثى')
    .transform((value) => value ? normalizeGender(value) : null),
    
  // مكان السكن - اختياري
  residence: yup
    .string()
    .nullable()
    .trim()
    .transform((value) => value === '' ? null : value),
    
  // الحلقات - مصفوفة من النصوص
  groups: yup
    .array()
    .of(yup.string().trim())
    .default([])
    .nullable()
    .transform((value) => value === null || value === undefined ? [] : value),
    
  // اسم الحلقة - يستخدم لتعبئة groups
  groupName: yup
    .string()
    .nullable()
    .trim()
    .transform((value) => value === '' ? null : value),
    
  // الدور - افتراضي teacher
  role: yup
    .string()
    .oneOf(['teacher'], 'الدور يجب أن يكون teacher')
    .default('teacher'),
    
  // الصورة الشخصية
  avatar: yup
    .object({
      data: yup.mixed().nullable(),
      contentType: yup.string().nullable(),
    })
    .nullable(),
    
  // الحالة النشطة - افتراضي false
  isActive: yup
    .boolean()
    .default(false),
    
  // آخر ظهور - افتراضي الوقت الحالي
  lastSeen: yup
    .date()
    .default(() => new Date()),
    
}).transform((data) => ({
  ...data,
  // حساب العمر تلقائياً من تاريخ الميلاد إذا لم يكن موجوداً
  age: data.age !== null && data.age !== undefined ? data.age : 
        (data.birthDate ? calculateAge(data.birthDate) : null),
  // تطبيع الجنس
  gender: data.gender ? normalizeGender(data.gender) : null,
  // ضمان القيم الافتراضية
  groups: Array.isArray(data.groups) ? data.groups : [],
  role: data.role || 'teacher',
  isActive: data.isActive !== undefined ? data.isActive : false,
  lastSeen: data.lastSeen || new Date(),
}));

// Type للبيانات بعد التحقق
export type TeacherFormData = yup.InferType<typeof teacherValidationSchema>;

// دالة للتحقق من صحة البيانات
export const validateTeacherWithYup = async (
  data: Record<string, unknown>, 
  isNewTeacher: boolean = false
): Promise<{ isValid: boolean; errors: Record<string, string>; data?: TeacherFormData }> => {
  try {
    const validData = await teacherValidationSchema.validate(data, {
      abortEarly: false,
      context: { isNewTeacher },
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
export const validateTeacherFieldWithYup = async (
  fieldName: string,
  value: unknown,
  allData: Record<string, unknown> = {},
  isNewTeacher: boolean = false
): Promise<string | null> => {
  try {
    const schema = yup.reach(teacherValidationSchema, fieldName) as yup.Schema;
    await schema.validate(value, {
      context: { isNewTeacher, ...allData },
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
export const teacherSchemaForHookForm = teacherValidationSchema;

// دالة مساعدة لتحويل تاريخ الميلاد إلى صيغة YYYY-MM-DD
export const formatBirthDateForBackend = (dateInput: string | Date): string => {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  
  if (isNaN(date.getTime())) {
    throw new Error('تاريخ غير صالح');
  }
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

// دالة مساعدة لتحويل صيغة YYYY-MM-DD إلى تاريخ للعرض
export const parseBirthDateFromBackend = (dateString: string): Date | null => {
  if (!dateString || !dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return null;
  }
  
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date;
};

// تصدير الدوال المساعدة
export { normalizeGender, calculateAge };

// معاينة schema للأخطاء الشائعة
export const commonTeacherValidationErrors = {
  phoneFormat: 'الرقم يجب أن يبدأ بـ 05 ويتكوّن من 10 أرقام',
  emailFormat: 'صيغة البريد الإلكتروني غير صحيحة',
  birthDateFormat: 'صيغة التاريخ يجب أن تكون YYYY-MM-DD',
  idNumberFormat: 'رقم الهوية يجب أن يتكون من 9 أرقام فقط',
  passwordRequired: 'كلمة المرور مطلوبة للمعلم الجديد',
  uniqueConstraints: {
    phone: 'رقم الهاتف موجود بالفعل',
    email: 'البريد الإلكتروني موجود بالفعل',
  },
};