// ============================================
// TIMETABLE VALIDATION - Frontend (NEW)
// ============================================
// Validation للجدول الزمني (TimeTable) بنفس منطق Backend
// ⚠️ التعارض يعتمد على التاريخ المحدد (sessionDate) وليس اليوم

import * as yup from 'yup';

// ============================================================================
// TYPES
// ============================================================================

export type SessionType = 'hifz' | 'murajaah' | 'both';

export interface TimetableFormData {
  sessionDate: string;      // ⚠️ مطلوب! (YYYY-MM-DD)
  startHour: string;
  endHour: string;
  teacherId: string;
  groupId?: string;
  sectionId?: string;
  note?: string;
  description?: string;
  sessionType?: SessionType;
}

export interface CheckConflictData {
  teacherId: string;
  sessionDate: string;      // ⚠️ مطلوب!
  startHour: string;
  endHour: string;
  excludeId?: string;
}

// تخصيص رسائل Yup بالعربية
yup.setLocale({
  mixed: {
    required: '${path} مطلوب',
    notType: '${path} يجب أن يكون من نوع ${type}',
    oneOf: '${path} يجب أن يكون أحد القيم: ${values}',
  },
  string: {
    min: '${path} يجب أن يحتوي على ${min} أحرف على الأقل',
    max: '${path} يجب ألا يتجاوز ${max} حرف',
    matches: '${path} لا يطابق التنسيق المطلوب',
  },
});

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * أيام الأسبوع الصحيحة (للعرض فقط - اليوم يُشتق من التاريخ)
 */
const VALID_DAYS = [
  'السبت',
  'الأحد',
  'الاثنين',
  'الثلاثاء',
  'الأربعاء',
  'الخميس',
  'الجمعة',
] as const;

/**
 * أنواع الحصص الصحيحة
 */
const VALID_SESSION_TYPES: SessionType[] = ['hifz', 'murajaah', 'both'];

/**
 * التحقق من صيغة الوقت (HH:MM AM/PM)
 */
const TIME_FORMAT_REGEX = /^(1[0-2]|[1-9]):[0-5][0-9]\s?(AM|PM|am|pm)$/i;

/**
 * التحقق من صيغة التاريخ (YYYY-MM-DD)
 */
const DATE_FORMAT_REGEX = /^\d{4}-\d{2}-\d{2}$/;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * تحديد إذا كان التوقيت صيفي أو شتوي (تلقائي)
 * الصيفي: من مايو (5) إلى سبتمبر (9)
 * الشتوي: من أكتوبر (10) إلى أبريل (4)
 */
export const isSummerTime = (): boolean => {
  const now = new Date();
  const month = now.getMonth() + 1; // 1-12
  return month >= 5 && month <= 9;
};

/**
 * التحقق من أن الوقت ضمن أوقات العمل حسب التوقيت الحالي (تلقائي)
 * صيفي: 12:00 PM - 9:00 PM
 * شتوي: 11:00 AM - 8:00 PM
 */
export const isValidWorkingHour = (timeStr: string): boolean => {
  const match = timeStr.match(/^([0-9]{1,2}):([0-5][0-9])\s?(AM|PM|am|pm)$/i);
  if (!match) return false;

  const hour = parseInt(match[1]);
  const period = match[3].toLowerCase();
  const isSummer = isSummerTime();

  if (isSummer) {
    // ☀️ صيفي: 12:00 PM - 9:00 PM فقط
    if (period === 'pm') {
      return hour === 12 || (hour >= 1 && hour <= 9);
    } else if (period === 'am') {
      // AM غير مسموح في الصيف
      return false;
    }
  } else {
    // ❄️ شتوي: 11:00 AM - 9:00 PM
    if (period === 'pm') {
      return hour === 12 || (hour >= 1 && hour <= 9);
    } else if (period === 'am') {
      return hour === 11; // 11:00 AM و 11:30 AM فقط
    }
  }

  return false;
};

/**
 * تحويل الوقت إلى دقائق للمقارنة
 */
export const timeToMinutes = (timeStr: string): number => {
  const match = timeStr.match(/^([0-9]{1,2}):([0-5][0-9])\s?(AM|PM|am|pm)$/i);
  if (!match) return -1;

  let hour = parseInt(match[1]);
  const minutes = parseInt(match[2]);
  const period = match[3].toLowerCase();

  // تحويل إلى 24 ساعة
  if (period === 'pm' && hour !== 12) {
    hour += 12;
  } else if (period === 'am' && hour === 12) {
    hour = 0;
  }

  return hour * 60 + minutes;
};

/**
 * التحقق من أن وقت الانتهاء بعد وقت البداية
 */
export const isEndTimeAfterStartTime = (startHour: string, endHour: string): boolean => {
  const startMinutes = timeToMinutes(startHour);
  const endMinutes = timeToMinutes(endHour);
  return startMinutes < endMinutes;
};

/**
 * اشتقاق اليوم بالعربية من تاريخ
 */
export const getDayFromDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return VALID_DAYS[date.getDay() === 0 ? 0 : date.getDay()];
};

/**
 * تنسيق التاريخ للعرض
 */
export const formatDateArabic = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('ar-SA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

/**
 * Yup Schema للـ TimeTable الجديد
 * ⚠️ sessionDate مطلوب!
 */
export const timetableValidationSchema = yup.object({
  // ⚠️ التاريخ - مطلوب!
  sessionDate: yup
    .string()
    .required('التاريخ مطلوب')
    .matches(DATE_FORMAT_REGEX, 'التاريخ يجب أن يكون بصيغة YYYY-MM-DD (مثل: 2026-01-12)')
    .test(
      'is-valid-date',
      'التاريخ غير صحيح',
      (value) => {
        if (!value) return false;
        const date = new Date(value);
        return !isNaN(date.getTime());
      }
    )
    .label('التاريخ'),

  // ساعة البداية - مطلوبة وضمن أوقات العمل
  startHour: yup
    .string()
    .required('ساعة البداية مطلوبة')
    .matches(TIME_FORMAT_REGEX, 'ساعة البداية يجب أن تكون بصيغة HH:MM AM/PM (مثل: 12:00 PM)')
    .test(
      'is-valid-working-hour',
      () => {
        const isSummer = isSummerTime();
        return isSummer 
          ? '☀️ التوقيت الصيفي: 12:00 PM - 9:00 PM فقط'
          : '❄️ التوقيت الشتوي: 11:00 AM - 8:00 PM فقط';
      },
      (value) => {
        if (!value) return false;
        return isValidWorkingHour(value);
      }
    )
    .label('ساعة البداية'),

  // ساعة النهاية - مطلوبة وضمن أوقات العمل وبعد ساعة البداية
  endHour: yup
    .string()
    .required('ساعة النهاية مطلوبة')
    .matches(TIME_FORMAT_REGEX, 'ساعة النهاية يجب أن تكون بصيغة HH:MM AM/PM (مثل: 1:00 PM)')
    .test(
      'is-valid-working-hour',
      () => {
        const isSummer = isSummerTime();
        return isSummer 
          ? '☀️ التوقيت الصيفي: 12:00 PM - 9:00 PM فقط'
          : '❄️ التوقيت الشتوي: 11:00 AM - 8:00 PM فقط';
      },
      (value) => {
        if (!value) return false;
        return isValidWorkingHour(value);
      }
    )
    .test(
      'is-after-start',
      'ساعة النهاية يجب أن تكون بعد ساعة البداية',
      function (value) {
        const { startHour } = this.parent;
        if (!value || !startHour) return true;
        return isEndTimeAfterStartTime(startHour, value);
      }
    )
    .label('ساعة النهاية'),

  // معرف المعلم - مطلوب
  teacherId: yup
    .string()
    .required('معرف المعلم مطلوب')
    .matches(/^[a-fA-F0-9]{24}$/, 'معرف المعلم غير صحيح')
    .label('معرف المعلم'),

  // معرف الحلقة - اختياري
  groupId: yup
    .string()
    .test('is-valid-id', 'معرف الحلقة غير صحيح', value => !value || /^[a-fA-F0-9]{24}$/.test(value))
    .nullable()
    .label('معرف الحلقة'),

  // معرف المقطع - اختياري
  sectionId: yup
    .string()
    .test('is-valid-id', 'معرف المقطع غير صحيح', value => !value || /^[a-fA-F0-9]{24}$/.test(value))
    .nullable()
    .label('معرف المقطع'),

  // اسم الحلقة (note) - اختياري
  note: yup
    .string()
    .max(200, 'اسم الحلقة يجب ألا يتجاوز 200 حرف')
    .label('اسم الحلقة'),

  // وصف الحصة - اختياري
  description: yup
    .string()
    .max(500, 'الوصف يجب ألا يتجاوز 500 حرف')
    .label('الوصف'),

  // نوع الحصة - اختياري
  sessionType: yup
    .mixed<SessionType>()
    .oneOf(
      [...VALID_SESSION_TYPES, undefined] as SessionType[],
      'نوع الحصة يجب أن يكون: hifz (حفظ) أو murajaah (مراجعة) أو both (الاثنين)'
    )
    .label('نوع الحصة'),
});

/**
 * Schema للتحقق من التعارض
 * ⚠️ sessionDate مطلوب!
 */
export const checkConflictSchema = yup.object({
  teacherId: yup
    .string()
    .required('معرف المعلم مطلوب')
    .matches(/^[a-fA-F0-9]{24}$/, 'معرف المعلم غير صحيح'),
  
  sessionDate: yup
    .string()
    .required('التاريخ مطلوب للتحقق من التعارض')
    .matches(DATE_FORMAT_REGEX, 'التاريخ يجب أن يكون بصيغة YYYY-MM-DD'),
  
  startHour: yup
    .string()
    .required('ساعة البداية مطلوبة')
    .matches(TIME_FORMAT_REGEX, 'صيغة الوقت غير صحيحة'),
  
  endHour: yup
    .string()
    .required('ساعة النهاية مطلوبة')
    .matches(TIME_FORMAT_REGEX, 'صيغة الوقت غير صحيحة'),
  
  excludeId: yup
    .string()
    .matches(/^[a-fA-F0-9]{24}$/, 'معرف الموعد غير صحيح'),
});

/**
 * Schema لإنشاء موعد لمقطع (التاريخ من المقطع)
 */
export const createForSectionSchema = yup.object({
  startHour: yup
    .string()
    .required('ساعة البداية مطلوبة')
    .matches(TIME_FORMAT_REGEX, 'ساعة البداية يجب أن تكون بصيغة HH:MM AM/PM')
    .test('is-valid-working-hour', 'الوقت خارج أوقات العمل', isValidWorkingHour),
  
  endHour: yup
    .string()
    .required('ساعة النهاية مطلوبة')
    .matches(TIME_FORMAT_REGEX, 'ساعة النهاية يجب أن تكون بصيغة HH:MM AM/PM')
    .test('is-valid-working-hour', 'الوقت خارج أوقات العمل', isValidWorkingHour)
    .test(
      'is-after-start',
      'ساعة النهاية يجب أن تكون بعد ساعة البداية',
      function (value) {
        const { startHour } = this.parent;
        if (!value || !startHour) return true;
        return isEndTimeAfterStartTime(startHour, value);
      }
    ),
  
  teacherId: yup
    .string()
    .matches(/^[a-fA-F0-9]{24}$/, 'معرف المعلم غير صحيح'),
  
  sessionType: yup
    .mixed<SessionType>()
    .oneOf([...VALID_SESSION_TYPES, undefined] as SessionType[]),
});

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * دالة للتحقق من بيانات TimeTable
 */
export const validateTimetableData = async (
  data: TimetableFormData
): Promise<{ isValid: boolean; errors?: Record<string, string> }> => {
  try {
    await timetableValidationSchema.validate(data, { abortEarly: false });
    return { isValid: true };
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

/**
 * دالة للتحقق من بيانات فحص التعارض
 */
export const validateCheckConflict = async (
  data: CheckConflictData
): Promise<{ isValid: boolean; errors?: Record<string, string> }> => {
  try {
    await checkConflictSchema.validate(data, { abortEarly: false });
    return { isValid: true };
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

/**
 * دالة مساعدة للتحقق من حقل معين
 */
export const validateField = async (
  fieldName: keyof TimetableFormData,
  value: unknown
): Promise<{ isValid: boolean; error?: string }> => {
  try {
    const schema = yup.reach(timetableValidationSchema, fieldName) as yup.Schema;
    await schema.validate(value);
    return { isValid: true };
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      return { isValid: false, error: error.message };
    }
    return { isValid: false, error: 'خطأ في التحقق من الحقل' };
  }
};

/**
 * دالة مساعدة لتنظيف البيانات (XSS protection)
 */
export const sanitizeTimetableData = (data: TimetableFormData): TimetableFormData => {
  return {
    ...data,
    sessionDate: data.sessionDate.trim(),
    startHour: data.startHour.trim(),
    endHour: data.endHour.trim(),
    note: data.note
      ? data.note.trim().replace(/[<>]/g, '').replace(/javascript:/gi, '')
      : undefined,
    description: data.description
      ? data.description.trim().replace(/[<>]/g, '').replace(/javascript:/gi, '')
      : undefined,
  };
};

export default timetableValidationSchema;
