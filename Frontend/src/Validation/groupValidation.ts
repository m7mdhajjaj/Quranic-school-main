// Group Validation using Yup
// التحقق من صحة بيانات الحلقات باستخدام مكتبة Yup

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
    matches: '${path} لا يطابق التنسيق المطلوب',
  },
  number: {
    min: '${path} يجب أن يكون ${min} أو أكثر',
    max: '${path} يجب أن يكون ${max} أو أقل',
    positive: '${path} يجب أن يكون رقماً موجباً',
    integer: '${path} يجب أن يكون رقماً صحيحاً',
  },
});

/* ----------------------- Helper Functions ----------------------- */

// تطبيع اسم الحلقة (إزالة المسافات الزائدة وتوحيد التنسيق)
const normalizeGroupName = (value: string): string => {
  if (!value) return '';
  return value.toString().trim()
    .replace(/\s+/g, ' ') // استبدال المسافات المتعددة بمسافة واحدة
    .replace(/^\s+|\s+$/g, ''); // إزالة المسافات من البداية والنهاية
};

// تطبيع الوصف
const normalizeDescription = (value: string): string => {
  if (!value) return '';
  return value.toString().trim();
};

// تطبيع الجدول الزمني
const normalizeSchedule = (value: string): string => {
  if (!value) return '';
  return value.toString().trim();
};

/* ----------------------- Interface ----------------------- */

export interface GroupFormData {
  _id?: string;
  name: string;
  teacher: string;
  description?: string;
  capacity?: number;
  schedule?: string;
  isActive?: boolean;
  currentStudents?: number; // عدد الطلاب المشتركين (للعرض فقط)
}

export interface GroupValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/* ----------------------- Validation Schema ----------------------- */

// Yup Schema - متطابق مع Backend validation
export const groupValidationSchema = yup.object({
  // معرف الحلقة - اختياري في حالة التعديل
  _id: yup
    .string()
    .optional()
    .nullable(),

  // اسم الحلقة - مطلوب وفريد (متطابق مع Backend)
  name: yup
    .string()
    .required('اسم الحلقة مطلوب')
    .trim()
    .transform(normalizeGroupName),

  // المعلم - مطلوب ويجب أن يكون ObjectId صحيح (متطابق مع Backend)
  teacher: yup
    .string()
    .required('اسم المعلم مطلوب')
    .trim()
    .test('is-valid-id', 'معرف المعلم غير صحيح', function(value) {
      if (!value) return false;
      // التحقق من أن القيمة ليست فارغة أو "اختر المعلم"
      return value !== '' && value !== 'اختر المعلم' && value.length > 0;
    }),

  // الوصف - اختياري (متطابق مع Backend)
  description: yup
    .string()
    .optional()
    .nullable()
    .max(500, 'الوصف يجب ألا يتجاوز 500 حرف')
    .trim()
    .transform(normalizeDescription),

  // السعة - اختياري مع حدود (متطابق مع Backend)
  capacity: yup
    .number()
    .optional()
    .nullable()
    .min(0, 'السعة يجب أن تكون 0 أو أكثر')
    .integer('السعة يجب أن تكون رقماً صحيحاً')
    .max(200, 'السعة يجب ألا تتجاوز 200 طالب')
    .transform((value) => {
      if (value === null || value === undefined || value === '') return 20; // القيمة الافتراضية
      return Number(value);
    }),

  // الجدول الزمني - اختياري مع تنسيق محدد (متطابق مع Backend)
  schedule: yup
    .string()
    .optional()
    .nullable()
    .max(100, 'الجدول الزمني يجب ألا يتجاوز 100 حرف')
    .matches(/^[\u0600-\u06FF\s0-9:-]*$/, 'الجدول الزمني يحتوي على أحرف غير مسموحة')
    .trim()
    .transform(normalizeSchedule),

  // isActive - يُستخدم في الـ backend (افتراضياً true)
  isActive: yup
    .boolean()
    .optional()
    .default(true),
});

/* ----------------------- Validation Functions ----------------------- */

// التحقق من صحة بيانات الحلقة كاملة
export const validateGroupWithYup = async (
  data: GroupFormData,
  isNewGroup: boolean = true
): Promise<GroupValidationResult> => {
  try {
    await groupValidationSchema.validate(data, { 
      abortEarly: false,
      context: { isNewGroup }
    });
    
    return {
      isValid: true,
      errors: {},
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
export const validateGroupFieldWithYup = async (
  fieldName: string,
  value: unknown,
  allData: Record<string, unknown> = {},
  isNewGroup: boolean = true
): Promise<string | null> => {
  try {
    const schema = yup.reach(groupValidationSchema, fieldName) as yup.Schema;
    await schema.validate(value, {
      context: { isNewGroup, ...allData },
    });
    return null;
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      return error.message;
    }
    return 'خطأ في التحقق';
  }
};

/* ----------------------- Additional Validation Rules ----------------------- */

// قواعد تحقق إضافية للحلقات
export const groupBusinessRules = {
  // التحقق من عدم تضارب الأوقات
  validateScheduleConflict: (schedule: string, existingGroups: GroupFormData[] = []): string | null => {
    if (!schedule) return null;
    
    // هنا يمكن إضافة منطق للتحقق من تضارب الأوقات
    // مثال: إذا كان هناك مجموعات أخرى في نفس الوقت
    const conflictingGroup = existingGroups.find(group => 
      group.schedule === schedule
    );
    
    if (conflictingGroup) {
      return `يوجد تضارب في الجدول مع الحلقة: ${conflictingGroup.name}`;
    }
    
    return null;
  },

  // التحقق من سعة المعلم
  validateTeacherCapacity: (teacherId: string, existingGroups: GroupFormData[] = []): string | null => {
    if (!teacherId) return null;
    
    // عدد المجموعات التي يدرسها نفس المعلم
    const teacherGroups = existingGroups.filter(group => 
      group.teacher === teacherId
    );
    
    // حد أقصى 3 مجموعات لكل معلم
    if (teacherGroups.length >= 3) {
      return 'المعلم المحدد يدرس بالفعل الحد الأقصى من المجموعات (3 مجموعات)';
    }
    
    return null;
  },

  // التحقق من تفرد اسم الحلقة
  validateUniqueGroupName: (name: string, existingGroups: GroupFormData[] = [], currentGroupId?: string): string | null => {
    if (!name) return null;
    
    const normalizedName = normalizeGroupName(name);
    const duplicateGroup = existingGroups.find(group => 
      normalizeGroupName(group.name) === normalizedName && 
      group._id !== currentGroupId
    );
    
    if (duplicateGroup) {
      return 'اسم الحلقة موجود بالفعل، يرجى اختيار اسم آخر';
    }
    
    return null;
  },
};

/* ----------------------- Comprehensive Validation ----------------------- */

// تحقق شامل يتضمن قواعد العمل
export const validateGroupComprehensive = async (
  data: GroupFormData,
  existingGroups: GroupFormData[] = [],
  isNewGroup: boolean = true
): Promise<GroupValidationResult> => {
  // التحقق الأساسي باستخدام Yup
  const basicValidation = await validateGroupWithYup(data, isNewGroup);
  
  if (!basicValidation.isValid) {
    return basicValidation;
  }
  
  // التحقق من قواعد العمل
  const businessErrors: Record<string, string> = {};
  
  // تحقق تفرد اسم الحلقة
  const nameError = groupBusinessRules.validateUniqueGroupName(
    data.name, 
    existingGroups, 
    data._id
  );
  if (nameError) businessErrors.name = nameError;
  
  // تحقق سعة المعلم
  const teacherError = groupBusinessRules.validateTeacherCapacity(
    data.teacher, 
    existingGroups
  );
  if (teacherError) businessErrors.teacher = teacherError;
  
  // تحقق تضارب الجداول
  if (data.schedule) {
    const scheduleError = groupBusinessRules.validateScheduleConflict(
      data.schedule, 
      existingGroups
    );
    if (scheduleError) businessErrors.schedule = scheduleError;
  }
  
  return {
    isValid: Object.keys(businessErrors).length === 0,
    errors: businessErrors,
  };
};

/* ----------------------- Export ----------------------- */

// Schema مبسط للاستخدام مع React Hook Form
export const groupSchemaForHookForm = groupValidationSchema;

// تصدير الدوال المساعدة
export { 
  normalizeGroupName, 
  normalizeDescription, 
  normalizeSchedule 
};