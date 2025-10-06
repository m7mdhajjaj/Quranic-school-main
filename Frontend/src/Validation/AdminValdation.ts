import * as yup from 'yup';

// Regex Patterns - متطابقة مع الباك اند
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const phoneRegex = /^05\d{8}$/;

// Admin Form Data Interface
export interface AdminFormData {
  adminId?: number;
  password?: string;
  firstName: string;
  lastName: string;
  fatherName?: string;
  grandFatherName?: string;
  motherName?: string;
  idNumber?: string;
  email: string;
  phoneNumber: string;
  birthDate?: string;
  age?: number;
  gender?: 'male' | 'female' | 'ذكر' | 'أنثى';
  residence?: string;
  isActive?: boolean;
}

// Admin Interface - متطابقة مع نموذج الباك اند
export interface Admin {
  _id: string;
  adminId: number;
  password: string;
  firstName: string;
  lastName: string;
  fatherName?: string;
  grandFatherName?: string;
  motherName?: string;
  idNumber?: string;
  email: string;
  phoneNumber: string;
  birthDate?: string;
  age?: number;
  gender?: 'male' | 'female' | 'ذكر' | 'أنثى';
  residence?: string;
  avatar?: {
    data?: Buffer;
    contentType?: 'image/png' | 'image/jpeg' | 'image/webp';
  };
  hasAvatar?: boolean;
  isActive: boolean;
  lastSeen: Date;
  fullName: string; // Virtual field
  createdAt: Date;
  updatedAt: Date;
}

// دالة حساب العمر
const calculateAge = (birthDate: string): number => {
  if (!birthDate) return 0;

  const today = new Date();
  const birthDateObj = new Date(birthDate);

  if (isNaN(birthDateObj.getTime())) return 0;

  let age = today.getFullYear() - birthDateObj.getFullYear();
  const monthDiff = today.getMonth() - birthDateObj.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDateObj.getDate())
  ) {
    age--;
  }

  return age;
};

// Admin Validation Schema - متطابقة مع الباك اند
export const adminValidationSchema = yup.object().shape({
  // الحقول المطلوبة
  firstName: yup
    .string()
    .required('الاسم الأول مطلوب')
    .trim()
    .min(2, 'الاسم الأول يجب أن يكون حرفين على الأقل')
    .max(50, 'الاسم الأول يجب أن يكون 50 حرف على الأكثر'),

  lastName: yup
    .string()
    .required('اسم العائلة مطلوب')
    .trim()
    .min(2, 'اسم العائلة يجب أن يكون حرفين على الأقل')
    .max(50, 'اسم العائلة يجب أن يكون 50 حرف على الأكثر'),

  email: yup
    .string()
    .required('البريد الإلكتروني مطلوب')
    .email('صيغة البريد الإلكتروني غير صحيحة')
    .matches(emailRegex, 'صيغة البريد الإلكتروني غير صحيحة')
    .lowercase()
    .trim(),

  phoneNumber: yup
    .string()
    .required('رقم الهاتف مطلوب')
    .matches(phoneRegex, 'الرقم يجب أن يبدأ بـ 05 ويتكوّن من 10 أرقام')
    .trim(),

  // كلمة المرور (مطلوبة للإنشاء، اختيارية للتحديث)
  password: yup
    .string()
    .min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل')
    .when('$isUpdate', {
      is: false,
      then: (schema) => schema.required('كلمة المرور مطلوبة'),
      otherwise: (schema) => schema.notRequired(),
    }),

  // الحقول الاختيارية
  fatherName: yup
    .string()
    .trim()
    .max(50, 'اسم الأب يجب أن يكون 50 حرف على الأكثر')
    .nullable(),

  grandFatherName: yup
    .string()
    .trim()
    .max(50, 'اسم الجد يجب أن يكون 50 حرف على الأكثر')
    .nullable(),

  motherName: yup
    .string()
    .trim()
    .max(50, 'اسم الأم يجب أن يكون 50 حرف على الأكثر')
    .nullable(),

  idNumber: yup
    .string()
    .trim()
    .min(10, 'رقم الهوية يجب أن يكون 10 أرقام على الأقل')
    .max(15, 'رقم الهوية يجب أن يكون 15 رقم على الأكثر')
    .nullable(),

  birthDate: yup
    .date()
    .nullable()
    .test('age-validation', 'يجب أن يكون عمر الإداري 18 عام على الأقل', function(value) {
      if (!value) return true; // اختياري
      const age = calculateAge(value.toISOString());
      return age >= 18;
    }),

  gender: yup
    .string()
    .oneOf(['male', 'female', 'ذكر', 'أنثى'], 'القيمة المسموحة للحقل gender هي male/female/ذكر/أنثى')
    .nullable(),

  residence: yup
    .string()
    .trim()
    .max(100, 'مكان السكن يجب أن يكون 100 حرف على الأكثر')
    .nullable(),

  adminId: yup
    .number()
    .positive('رقم المشرف يجب أن يكون رقم موجب')
    .integer('رقم المشرف يجب أن يكون رقم صحيح')
    .min(1, 'رقم المشرف يجب أن يكون 1 فأكثر')
    .nullable(),

  isActive: yup.boolean().nullable(),
});

// دالة التحقق من الإداري مع Yup
export const validateAdminWithYup = async (
  data: AdminFormData,
  isUpdate = false
): Promise<{ isValid: boolean; errors: Record<string, string> }> => {
  try {
    await adminValidationSchema.validate(data, { 
      abortEarly: false,
      context: { isUpdate }
    });
    return { isValid: true, errors: {} };
  } catch (error) {
    if (error instanceof yup.ValidationError) {
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

// دالة تنظيف البيانات
export const sanitizeAdminData = (data: AdminFormData): AdminFormData => {
  const normalize = (value: string | undefined) => 
    typeof value === 'string' ? value.replace(/\s+/g, ' ').trim() : value;

  return {
    ...data,
    firstName: normalize(data.firstName) || '',
    lastName: normalize(data.lastName) || '',
    fatherName: normalize(data.fatherName),
    grandFatherName: normalize(data.grandFatherName),
    motherName: normalize(data.motherName),
    residence: normalize(data.residence),
    idNumber: normalize(data.idNumber),
    email: typeof data.email === 'string' ? data.email.toLowerCase().trim() : data.email,
    phoneNumber: normalize(data.phoneNumber) || '',
  };
};