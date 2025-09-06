const mongoose = require("mongoose");

const teacherSchema = new mongoose.Schema(
  {
    teacherId: {
      type: Number,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: [true, "كلمة المرور مطلوبة"],
    },
    firstName: {
      type: String,
      required: [true, "الاسم الأول مطلوب"],
    },
    lastName: {
      type: String,
      required: [true, "اسم العائلة مطلوب"],
    },
    email: {
      type: String,
      required: [true, "البريد الإلكتروني مطلوب"],
      unique: true,
    },
    phoneNumber: {
      type: String,
      required: [true, "رقم الهاتف مطلوب"],
    },
    groups: {
      type: [String],
      required: [true, "يجب تحديد الحلقات التي يدرسها المعلم"],
    },
    role: {
      type: String,
      enum: ["teacher", "admin"],
      default: "teacher",
    },
  },
  { timestamps: true }
);

const Teacher = mongoose.model("Teacher", teacherSchema);

module.exports = Teacher;
