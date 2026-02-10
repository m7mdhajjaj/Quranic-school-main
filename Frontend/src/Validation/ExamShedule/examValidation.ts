// ============================================================================
// examValidation.ts - Frontend Validation for Exam Schedule using Yup
// ============================================================================

import * as yup from "yup";

/**
 * Custom validation: Date must be at least 2 days in the future
 */
const minDateInFuture = yup
  .date()
  .test(
    "min-date-future",
    "يجب أن يكون تاريخ الامتحان بعد يومين على الأقل من اليوم",
    function (value) {
      if (!value) return false;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const minDate = new Date(today);
      minDate.setDate(minDate.getDate() + 2);

      const examDate = new Date(value);
      examDate.setHours(0, 0, 0, 0);

      return examDate >= minDate;
    },
  );

/**
 * Exam Schedule Validation Schema
 */
export const examScheduleSchema = yup.object().shape({
  // Title validation (3-200 characters)
  title: yup
    .string()
    .required("عنوان الامتحان مطلوب")
    .min(3, "عنوان الامتحان يجب أن يكون 3 أحرف على الأقل")
    .max(200, "عنوان الامتحان يجب أن يكون 200 حرف أو أقل")
    .trim(),

  // Alternative name field (for backward compatibility)
  name: yup
    .string()
    .min(3, "عنوان الامتحان يجب أن يكون 3 أحرف على الأقل")
    .max(200, "عنوان الامتحان يجب أن يكون 200 حرف أو أقل")
    .trim(),

  // Subject validation (optional)
  subject: yup.string().trim().nullable(),

  // Type validation (شفهي، كتابي، تقييم شامل)
  type: yup
    .string()
    .oneOf(
      ["شفهي", "كتابي", "تقييم شامل"],
      "نوع الامتحان يجب أن يكون: شفهي، كتابي، أو تقييم شامل",
    )
    .default("شفهي"),

  // Group validation (optional)
  group: yup.string().trim().nullable(),

  // Date validation (must be at least 2 days in future)
  date: minDateInFuture.required("تاريخ الامتحان مطلوب"),

  // Time validation (HH:MM format, 12:00-21:00)
  time: yup
    .string()
    .matches(
      /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
      "صيغة الوقت غير صحيحة (يجب أن تكون HH:MM)",
    )
    .test(
      "time-range",
      "الوقت المسموح من 12:00 ظهراً إلى 9:00 مساءً",
      function (value) {
        if (!value) return true; // Optional field
        const [hours, minutes] = value.split(":").map(Number);
        if (hours < 12 || hours > 21) return false;
        if (hours === 21 && minutes > 0) return false; // 21:00 is max
        return true;
      },
    )
    .nullable(),

  // Duration validation (5-120 minutes = max 2 hours)
  duration: yup
    .number()
    .min(5, "مدة الامتحان يجب أن تكون 5 دقائق على الأقل")
    .max(120, "مدة الامتحان لا يمكن أن تزيد عن ساعتين (120 دقيقة)")
    .default(60)
    .nullable(),

  // Total marks validation (10-100)
  totalMarks: yup
    .number()
    .min(10, "مجموع الدرجات يجب أن يكون 10 على الأقل")
    .max(100, "مجموع الدرجات لا يمكن أن يزيد عن 100")
    .default(20)
    .nullable(),

  // Passing marks validation (5 to totalMarks)
  passingMarks: yup
    .number()
    .min(5, "درجة النجاح يجب أن تكون 5 على الأقل")
    .test(
      "max-passing-marks",
      "درجة النجاح لا يمكن أن تزيد عن مجموع الدرجات",
      function (value) {
        const { totalMarks } = this.parent;
        if (!value) return true;
        return value <= (totalMarks || 20);
      },
    )
    .nullable(),

  // Teacher ID
  teacher: yup.string().nullable(),

  // Description (optional, max 1000 characters)
  description: yup
    .string()
    .max(1000, "وصف الامتحان يجب أن يكون 1000 حرف أو أقل")
    .nullable(),
});

/**
 * Validate exam data using Yup schema
 */
export const validateExamData = async (
  data: any,
): Promise<{ isValid: boolean; errors: string[] }> => {
  try {
    await examScheduleSchema.validate(data, { abortEarly: false });
    return { isValid: true, errors: [] };
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      return {
        isValid: false,
        errors: error.errors,
      };
    }
    return {
      isValid: false,
      errors: ["حدث خطأ في التحقق من البيانات"],
    };
  }
};

/**
 * Validate a single field
 */
export const validateField = async (
  fieldName: string,
  value: any,
): Promise<{ isValid: boolean; error?: string }> => {
  try {
    await yup.reach(examScheduleSchema, fieldName).validate(value);
    return { isValid: true };
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      return {
        isValid: false,
        error: error.message,
      };
    }
    return {
      isValid: false,
      error: "حدث خطأ في التحقق",
    };
  }
};
