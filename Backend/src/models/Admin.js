// models/Admin.js
const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
  {
    adminId: {
      type: Number,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: [true, "كلمة المرور مطلوبة"],
    },

    // الاسماء
    firstName: { type: String, required: [true, "الاسم الأول مطلوب"] },
    lastName: { type: String, required: [true, "اسم العائلة مطلوب"] },
    fatherName: { type: String },
    grandFatherName: { type: String },
    motherName: { type: String },

    // هوية/تواصل
    idNumber: { type: String },
    email: {
      type: String,
      required: [true, "البريد الإلكتروني مطلوب"],
      unique: true,
    },
    phoneNumber: {
      type: String,
      required: [true, "رقم الهاتف مطلوب"],
      match: [/^05\d{8}$/, "الرقم يجب أن يبدأ بـ 05 ويتكوّن من 10 أرقام"],
      unique: true,
    },

    // معلومات شخصية
    birthDate: { type: String }, // أبقيناها String لتوافق الكود لديك

    age: { type: Number, min: [0, "العمر يجب أن يكون رقماً موجباً"] },
    gender: {
      type: String,
      enum: ["male", "female", "ذكر", "أنثى"],
      required: false,
    },

    residence: { type: String },

    // الصورة
    avatar: { data: Buffer, contentType: String },

    isActive: { type: Boolean, default: false },
    lastSeen: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Admin = mongoose.model("Admin", adminSchema);
module.exports = Admin;
