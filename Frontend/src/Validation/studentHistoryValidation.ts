import { z } from "zod";

// ============================================================================
// Student History Validation - التحقق من بيانات تاريخ الطالب
// ============================================================================

/**
 * Schema للتحقق من خيارات جلب التاريخ
 */
export const studentHistoryOptionsSchema = z.object({
  eventType: z
    .enum(["WARNING", "GROUP_CHANGE", "GROUP_REMOVAL", "EXPULSION", "RESTORATION"])
    .optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  limit: z.number().int().min(1).max(1000).optional(),
});

/**
 * Schema للتحقق من معرف الطالب
 */
export const studentIdSchema = z.string().min(1, "معرف الطالب مطلوب");

/**
 * دالة للتحقق من خيارات جلب التاريخ
 */
export const validateHistoryOptions = (options: unknown) => {
  return studentHistoryOptionsSchema.parse(options);
};

/**
 * دالة للتحقق من معرف الطالب
 */
export const validateStudentId = (studentId: unknown) => {
  return studentIdSchema.parse(studentId);
};

// Types
export type StudentHistoryOptions = z.infer<typeof studentHistoryOptionsSchema>;
