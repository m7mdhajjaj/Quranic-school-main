const { z } = require("zod");
const mongoose = require("mongoose");

// Helper to validate ObjectId
const objectIdValidation = z
  .string()
  .refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: "معرف غير صالح (Invalid ObjectId)",
  });

const createAttendanceSchema = z.object({
  date: z.union([z.string(), z.date()]).refine(
    (val) => !isNaN(new Date(val).getTime()),
    {
      message: "تاريخ غير صالح",
    }
  ),
  records: z
    .array(
      z.object({
        studentId: objectIdValidation,
        isPresent: z.boolean({
          required_error: "حالة الحضور مطلوبة",
          invalid_type_error: "حالة الحضور يجب أن تكون منطقية (صح/خطأ)",
        }),
      })
    )
    .min(1, { message: "سجلات الحضور مطلوبة" }),
});

module.exports = {
  createAttendanceSchema,
};
