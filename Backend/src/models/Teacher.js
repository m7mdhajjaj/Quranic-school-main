// models/Teacher.js
const mongoose = require("mongoose");

const teacherSchema = new mongoose.Schema(
  {
    teacherId: { type: Number, required: true, unique: true },

    // سيتم حفظها مُشفّرة في الـ controller
    password: { type: String, required: [true, "كلمة المرور مطلوبة"] },

    firstName: { type: String, required: [true, "الاسم الأول مطلوب"] },
    lastName:  { type: String, required: [true, "اسم العائلة مطلوب"] },
    fatherName: { type: String, required: false },
    grandFatherName: { type: String, required: false },

    email: { type: String, required: [true, "البريد الإلكتروني مطلوب"], unique: true },

    // اختر واحدًا من النمطين حسب مشروعك:
    // فلسطين (جوال/الوطنية): يبدأ بـ 05
    phoneNumber: {
      type: String,
      required: [true, "رقم الهاتف مطلوب"],
      match: [/^05\d{8}$/, "رقم الهاتف يجب أن يبدأ بـ 05 ويتكون من 10 أرقام"],
      unique: true,
    },
    // أو إذا تريد 09:
    // phoneNumber: {
    //   type: String,
    //   required: [true, "رقم الهاتف مطلوب"],
    //   match: [/^09\d{8}$/, "رقم الهاتف يجب أن يبدأ بـ 09 ويتكون من 10 أرقام"],
    //   unique: true,
    // },

    idNumber: { type: String, required: false },
    motherName: { type: String, required: false },

    birthDate: { type: String, required: false },
    age: { type: Number, required: false, min: [0, "العمر يجب أن يكون رقماً موجباً"] },

    // حقول كانت مستخدمة في الـ controller
    gender: { type: String, enum: ["ذكر", "أنثى", "male", "female"], required: false },
    residence: { type: String, required: false },
    yearsOfExperience: { type: Number, required: false, default: 0, min: 0 },

    groupName: { type: String, required: false }, // اسم حلقة واحدة (اختياري)
    groups: { type: [String], required: [true, "يجب تحديد الحلقات التي يدرسها المعلم"], default: [] },

    role: { type: String, enum: ["teacher", "admin"], default: "teacher" },

    avatar: { type: String, required: false }, // نخزن مسارًا نسبيًا مثل: avatars/xxx.jpg

    // لدعم الحذف الناعم
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Teacher", teacherSchema);
