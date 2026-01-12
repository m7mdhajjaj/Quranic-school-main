// ============================================
// TIMETABLE VALIDATION - Mobile
// ============================================
// Validation للجدول الزمني (TimeTable) بنفس منطق Backend

import * as yup from "yup";

// تخصيص رسائل Yup بالعربية
yup.setLocale({
  mixed: {
    required: "${path} مطلوب",
    notType: "${path} يجب أن يكون من نوع ${type}",
    oneOf: "${path} يجب أن يكون أحد القيم: ${values}",
  },
  string: {
    min: "${path} يجب أن يحتوي على ${min} أحرف على الأقل",
    max: "${path} يجب ألا يتجاوز ${max} حرف",
    matches: "${path} لا يطابق التنسيق المطلوب",
  },
});

/**
 * أيام الأسبوع الصحيحة (يجب أن تطابق Backend enum)
 */
const VALID_DAYS = [
  "السبت",
  "الأحد",
  "الاثنين",
  "الثلاثاء",
  "الأربعاء",
  "الخميس",
  "الجمعة",
] as const;

/**
 * أنواع الحصص الصحيحة
 */
export type SessionType = "hifz" | "murajaah" | "both";
const VALID_SESSION_TYPES: SessionType[] = ["hifz", "murajaah", "both"];

/**
 * التحقق من صيغة الوقت (HH:MM AM/PM)
 */
const TIME_FORMAT_REGEX = /^(1[0-2]|[1-9]):[0-5][0-9]\s?(AM|PM|am|pm)$/i;

/**
 * تحديد إذا كان التوقيت صيفي أو شتوي (تلقائي)
 * الصيفي: من مايو (5) إلى سبتمبر (9)
 * الشتوي: من أكتوبر (10) إلى أبريل (4)
 */
const isSummerTime = (): boolean => {
  const now = new Date();
  const month = now.getMonth() + 1; // 1-12
  return month >= 5 && month <= 9;
};

/**
 * التحقق من أن الوقت ضمن أوقات العمل حسب التوقيت الحالي (تلقائي)
 * صيفي: 12:00 PM - 9:00 PM
 * شتوي: 11:00 AM - 8:00 PM
 */
const isValidWorkingHour = (timeStr: string): boolean => {
  const match = timeStr.match(/^([0-9]{1,2}):([0-5][0-9])\s?(AM|PM|am|pm)$/i);
  if (!match) return false;

  const hour = parseInt(match[1]);
  const period = match[3].toLowerCase();
  const isSummer = isSummerTime();

  if (isSummer) {
    // ☀️ صيفي: 12:00 PM - 9:00 PM فقط
    if (period === "pm") {
      return hour === 12 || (hour >= 1 && hour <= 9);
    } else if (period === "am") {
      // AM غير مسموح في الصيف
      return false;
    }
  } else {
    // ❄️ شتوي: 11:00 AM - 8:00 PM
    if (period === "pm") {
      return hour === 12 || (hour >= 1 && hour <= 8);
    } else if (period === "am") {
      return hour === 11; // 11:00 AM و 11:30 AM فقط
    }
  }

  return false;
};

/**
 * التحقق من أن وقت الانتهاء بعد وقت البداية
 */
const isEndTimeAfterStartTime = (
  startHour: string,
  endHour: string
): boolean => {
  // تحويل الوقت إلى دقائق للمقارنة
  const timeToMinutes = (timeStr: string): number => {
    const match = timeStr.match(/^([0-9]{1,2}):([0-5][0-9])\s?(AM|PM|am|pm)$/i);
    if (!match) return -1;

    let hour = parseInt(match[1]);
    const minutes = parseInt(match[2]);
    const period = match[3].toLowerCase();

    // تحويل إلى 24 ساعة
    if (period === "pm" && hour !== 12) {
      hour += 12;
    } else if (period === "am" && hour === 12) {
      hour = 0;
    } else if (period === "pm" && hour === 12) {
      hour = 12;
    }

    return hour * 60 + minutes;
  };

  const startMinutes = timeToMinutes(startHour);
  const endMinutes = timeToMinutes(endHour);

  return startMinutes < endMinutes;
};

/**
 * Interface للبيانات
 */
export interface SessionFormData {
  day: string;
  startHour: string;
  endHour: string;
  note: string;
  teacherId: string;
  sessionType?: SessionType;
  sectionId?: string; // معرف المقطع المرتبط
  sessionDate?: string; // التاريخ المحدد للحصة
  isRecurring?: boolean; // true = متكرر أسبوعياً، false = محدد بتاريخ
}

/**
 * Yup Schema للـ TimeTable
 */
export const timetableValidationSchema = yup.object({
  // اليوم - مطلوب ويجب أن يكون أحد أيام الأسبوع
  day: yup
    .string()
    .required("اليوم مطلوب")
    .oneOf(VALID_DAYS as unknown as string[], "اليوم غير صحيح")
    .label("اليوم"),

  // ساعة البداية - مطلوبة وضمن أوقات العمل
  startHour: yup
    .string()
    .required("ساعة البداية مطلوبة")
    .matches(
      TIME_FORMAT_REGEX,
      "ساعة البداية يجب أن تكون بصيغة HH:MM AM/PM (مثل: 12:00 PM)"
    )
    .test(
      "is-valid-working-hour",
      "أوقات العمل من 12:00 PM إلى 9:00 PM فقط",
      (value) => {
        if (!value) return false;
        return isValidWorkingHour(value);
      }
    )
    .label("ساعة البداية"),

  // ساعة النهاية - مطلوبة وضمن أوقات العمل وبعد ساعة البداية
  endHour: yup
    .string()
    .required("ساعة النهاية مطلوبة")
    .matches(
      TIME_FORMAT_REGEX,
      "ساعة النهاية يجب أن تكون بصيغة HH:MM AM/PM (مثل: 1:00 PM)"
    )
    .test(
      "is-valid-working-hour",
      () => {
        const isSummer = isSummerTime();
        return isSummer
          ? "☀️ التوقيت الصيفي الحالي: 12:00 PM - 9:00 PM فقط"
          : "❄️ التوقيت الشتوي الحالي: 11:00 AM - 8:00 PM فقط";
      },
      (value) => {
        if (!value) return false;
        return isValidWorkingHour(value);
      }
    )
    .test(
      "is-after-start",
      "ساعة النهاية يجب أن تكون بعد ساعة البداية",
      function (value) {
        const { startHour } = this.parent;
        if (!value || !startHour) return true;
        return isEndTimeAfterStartTime(startHour, value);
      }
    )
    .label("ساعة النهاية"),

  // اسم الحلقة (note) - مطلوب
  note: yup
    .string()
    .required("اسم الحلقة مطلوب")
    .min(2, "اسم الحلقة يجب أن يحتوي على حرفين على الأقل")
    .max(200, "اسم الحلقة يجب ألا يتجاوز 200 حرف")
    .label("اسم الحلقة"),

  // معرف المعلم - مطلوب
  teacherId: yup
    .string()
    .required("معرف المعلم مطلوب")
    .matches(/^[a-fA-F0-9]{24}$/, "معرف المعلم غير صحيح")
    .label("معرف المعلم"),

  // نوع الحصة - اختياري
  sessionType: yup
    .mixed<SessionType>()
    .oneOf(
      [...VALID_SESSION_TYPES, undefined] as SessionType[],
      "نوع الحصة يجب أن يكون: hifz (حفظ) أو murajaah (مراجعة) أو both (الاثنين)"
    )
    .label("نوع الحصة"),

  // معرف المقطع - اختياري
  sectionId: yup
    .string()
    .matches(/^[a-fA-F0-9]{24}$/, "معرف المقطع غير صحيح")
    .label("معرف المقطع"),

  // تاريخ الحصة - اختياري
  sessionDate: yup.string().label("تاريخ الحصة"),

  // متكرر أسبوعياً - اختياري
  isRecurring: yup.boolean().label("متكرر أسبوعياً"),
});

/**
 * دالة للتحقق من بيانات TimeTable
 */
export const validateTimetableData = async (
  data: SessionFormData
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
    return {
      isValid: false,
      errors: { general: "حدث خطأ في التحقق من البيانات" },
    };
  }
};

/**
 * دالة مساعدة للتحقق من حقل معين
 */
export const validateField = async (
  fieldName: keyof SessionFormData,
  value: unknown
): Promise<{ isValid: boolean; error?: string }> => {
  try {
    const schema = yup.reach(
      timetableValidationSchema,
      fieldName
    ) as yup.Schema;
    await schema.validate(value);
    return { isValid: true };
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      return { isValid: false, error: error.message };
    }
    return { isValid: false, error: "خطأ في التحقق من الحقل" };
  }
};

/**
 * دالة مساعدة لتنظيف البيانات (XSS protection)
 */
export const sanitizeTimetableData = (
  data: SessionFormData
): SessionFormData => {
  return {
    ...data,
    note: data.note
      .trim()
      .replace(/[<>]/g, "") // إزالة علامات HTML
      .replace(/javascript:/gi, ""), // إزالة javascript protocols
    startHour: data.startHour.trim(),
    endHour: data.endHour.trim(),
    day: data.day.trim(),
  };
};

export default timetableValidationSchema;
