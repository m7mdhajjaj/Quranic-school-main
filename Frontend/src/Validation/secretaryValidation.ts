import * as yup from 'yup';

// Regex Patterns - متطابقة مع الباك اند
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const phoneRegex = /^05\d{8}$/;     // 10 أرقام يبدأ بـ 05
const idNumberRegex = /^\d{9}$/;    // 9 أرقام بالضبط

// Access Level Type
export type AccessLevel = 'none' | 'view' | 'manage';

// Secretary Permissions Interface
export interface SecretaryPermissions {
  // صلاحية الحلقات: none = بدون وصول, view = عرض فقط, manage = إدارة كاملة
  groupsAccess?: AccessLevel;
  // صلاحية المعلمين: none = بدون وصول, view = عرض فقط, manage = إدارة كاملة
  teachersAccess?: AccessLevel;
  // صلاحية الطلاب: none = بدون وصول, view = عرض فقط, manage = إدارة كاملة
  studentsAccess?: AccessLevel;
}

// Secretary Form Data Interface
export interface SecretaryFormData {
  secretaryId?: number;
  password?: string;
  firstName: string;
  lastName: string;
  fatherName?: string;
  grandFatherName?: string;
  motherName?: string;
  idNumber: string;
  email: string;
  phoneNumber: string;
  birthDate: string;
  age?: number;
  gender: 'male' | 'female' | 'ذكر' | 'أنثى';
  residence: string;
  permissions?: SecretaryPermissions;
}

// Secretary Interface - متطابقة مع نموذج الباك اند
export interface Secretary {
  _id: string;
  secretaryId: number;
  password: string;
  firstName: string;
  lastName: string;
  fatherName?: string;
  grandFatherName?: string;
  motherName?: string;
  idNumber: string;
  email: string;
  phoneNumber: string;
  birthDate: string;
  age?: number;
  gender: 'male' | 'female' | 'ذكر' | 'أنثى';
  residence: string;
  avatar?: {
    url?: string;
    publicId?: string;
  };
  hasAvatar?: boolean;
  lastSeen: Date;
  permissions: SecretaryPermissions;
  fullName?: string;
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

// Secretary Validation Schema - متطابقة مع الباك اند
export const secretaryValidationSchema = yup.object().shape({
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

  residence: yup
    .string()
    .required('مكان السكن مطلوب')
    .trim()
    .max(100, 'مكان السكن يجب أن يكون 100 حرف على الأكثر'),

  // كلمة المرور (مطلوبة للإنشاء، اختيارية للتحديث)
  password: yup
    .string()
    .when('$isUpdate', {
      is: false,
      then: (schema) => schema.required('كلمة المرور مطلوبة'),
      otherwise: (schema) => schema.notRequired(),
    })
    .test('password-strength', 'كلمة المرور لا تلبي المتطلبات', function(value) {
      const { isUpdate } = this.options.context || {};
      
      // إذا لم يكن تحديث (إنشاء جديد) يجب التحقق من قوة كلمة المرور
      if (!isUpdate && value) {
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
    .required('رقم الهوية مطلوب')
    .trim()
    .matches(idNumberRegex, 'رقم الهوية يجب أن يتكون من 9 أرقام بالضبط'),

  birthDate: yup
    .string()
    .required('تاريخ الميلاد مطلوب')
    .matches(/^\d{4}-\d{2}-\d{2}$/, 'صيغة التاريخ يجب أن تكون YYYY-MM-DD')
    .test('not-future', 'تاريخ الميلاد لا يمكن أن يكون في المستقبل', (value) => {
      if (!value) return false;
      return new Date(value) <= new Date();
    })
    .test('age-validation', 'يجب أن يكون عمر السكرتير 21 عام على الأقل', function(value) {
      if (!value) return false;
      const age = calculateAge(value);
      return age >= 21;
    }),

  gender: yup
    .string()
    .required('الجنس مطلوب')
    .oneOf(['male', 'female', 'ذكر', 'أنثى'], 'القيمة المسموحة للحقل gender هي male/female/ذكر/أنثى'),

  secretaryId: yup
    .number()
    .positive('رقم السكرتير يجب أن يكون رقم موجب')
    .integer('رقم السكرتير يجب أن يكون رقم صحيح')
    .min(501, 'رقم السكرتير يجب أن يكون 501 فأكثر')
    .nullable(),

  permissions: yup.object().shape({
    groupsAccess: yup.string().oneOf(['none', 'view', 'manage'], 'قيمة غير صالحة لصلاحية الحلقات').nullable(),
    teachersAccess: yup.string().oneOf(['none', 'view', 'manage'], 'قيمة غير صالحة لصلاحية المعلمين').nullable(),
  }).nullable(),
});

// دالة التحقق من السكرتير مع Yup
export const validateSecretaryWithYup = async (
  data: SecretaryFormData,
  isUpdate = false
): Promise<{ isValid: boolean; errors: Record<string, string> }> => {
  try {
    await secretaryValidationSchema.validate(data, { 
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
export const sanitizeSecretaryData = (data: SecretaryFormData): SecretaryFormData => {
  const normalize = (value: string | undefined) => 
    typeof value === 'string' ? value.replace(/\s+/g, ' ').trim() : value;

  return {
    ...data,
    firstName: normalize(data.firstName) || '',
    lastName: normalize(data.lastName) || '',
    fatherName: normalize(data.fatherName),
    grandFatherName: normalize(data.grandFatherName),
    motherName: normalize(data.motherName),
    residence: normalize(data.residence) || '',
    idNumber: normalize(data.idNumber),
    email: typeof data.email === 'string' ? data.email.toLowerCase().trim() : data.email,
    phoneNumber: normalize(data.phoneNumber) || '',
  };
};

// دالة التحقق من الصلاحيات
export const validateSecretaryPermissions = (permissions: SecretaryPermissions): boolean => {
  const validKeys = ['groupsAccess', 'teachersAccess'];
  const validValues = ['none', 'view', 'manage'];
  
  return Object.entries(permissions).every(([key, value]) => 
    validKeys.includes(key) && (value === undefined || validValues.includes(value as string))
  );
};

// دالة التحقق من صلاحية معينة
export const hasPermission = (permissions: SecretaryPermissions | undefined, permission: 'groupsAccess' | 'teachersAccess', level: 'view' | 'manage' = 'view'): boolean => {
  if (!permissions || !permissions[permission]) return false;
  
  const accessLevel = permissions[permission];
  
  if (level === 'view') {
    return accessLevel === 'view' || accessLevel === 'manage';
  }
  
  if (level === 'manage') {
    return accessLevel === 'manage';
  }
  
  return false;
};
