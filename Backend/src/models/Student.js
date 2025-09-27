// models/Student.js
const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    studentId: { type: Number, required: true, unique: true },
    idNumber:  { type: String, required: [true, "رقم الهوية مطلوب"], unique: true },

    // لا تخزن كلمة المرور نصًا عاديًا
    password: { type: String, required: [true, "كلمة المرور مطلوبة"] },

    firstName: { type: String, required: [true, "الاسم الأول مطلوب"] },
    fatherName: { type: String, required: [true, "اسم الأب مطلوب"] },
    grandFatherName: { type: String, required: [true, "اسم الجد مطلوب"] },
    motherName: { type: String, required: [true, "اسم الأم مطلوب"] },
    lastName:  { type: String, required: [true, "اسم العائلة مطلوب"] },

    birthDate: { type: Date, required: [true, "تاريخ الميلاد مطلوب"] },

    // إما تخليه اختياري:
    age: { type: Number, required: false, min: [0, "العمر يجب أن يكون رقماً موجباً"] },

    gender: {
      type: String,
      enum: { values: ["ذكر", "انثى", "أنثى", "male", "female"], message: "الجنس يجب أن يكون ذكر أو انثى" },
      required: [true, "الجنس مطلوب"],
    },

    residence: { type: String, required: [true, "مكان السكن مطلوب"] },
    teacher:   { type: String, required: [true, "اسم المعلم مطلوب"] },
    group:     { type: String, required: [true, "اسم الحلقة مطلوب"] },

    email: { type: String, required: false },
    phoneNumber: { type: String, required: false },

    avatar: { type: String, required: false }, // avatars/xxx.jpg
  },
  { timestamps: true }
);

// مثال Virtual لعمر محسوب (اختياري)
studentSchema.virtual("computedAge").get(function () {
  if (!this.birthDate) return undefined;
  const today = new Date();
  let age = today.getFullYear() - this.birthDate.getFullYear();
  const m = today.getMonth() - this.birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < this.birthDate.getDate())) age--;
  return age;
});

module.exports = mongoose.model("Student", studentSchema);
