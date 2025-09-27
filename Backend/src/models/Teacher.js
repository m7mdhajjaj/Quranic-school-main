// models/Teacher.js
const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema(
  {
    teacherId: {
      type: Number,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: [true, 'كلمة المرور مطلوبة'],
    },

    // الاسماء
    firstName: { type: String, required: [true, 'الاسم الأول مطلوب'] },
    lastName: { type: String, required: [true, 'اسم العائلة مطلوب'] },
    fatherName: { type: String },
    grandFatherName: { type: String },
    motherName: { type: String },

    // هوية/تواصل
    idNumber: { type: String },
    email: {
      type: String,
      required: [true, 'البريد الإلكتروني مطلوب'],
      unique: true,
    },
    phoneNumber: {
      type: String,
      required: [true, 'رقم الهاتف مطلوب'],
      unique: true,
      match: [/^09\d{8}$/, 'رقم الهاتف يجب أن يبدأ بـ 09 ويتكون من 10 أرقام'],
    },

    // معلومات شخصية
    birthDate: { type: String }, // أبقيناها String لتوافق الكود لديك
    age: { type: Number, min: [0, 'العمر يجب أن يكون رقماً موجباً'] },
    gender: {
      type: String,
      enum: ['male', 'female', 'ذكر', 'أنثى'],
      required: false,
    },
    residence: { type: String },

    // الحلقات
    groups: { type: [String], default: [] }, // كان required ويسبب فشل عند عدم الإرسال
    groupName: { type: String }, // يستخدمه الكونترولر لتعبئة groups

    // خبرة/دور
    yearsOfExperience: { type: Number, default: 0 },
    role: { type: String, enum: ['teacher', 'admin'], default: 'teacher' },

    // الصورة
    avatar: { type: String }, // مسار نسبي مثل avatars/file.jpg

    // حالة التفعيل (يستخدمها الكونترولر في getAll/stats/delete)
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Teacher = mongoose.model('Teacher', teacherSchema);
module.exports = Teacher;


/////okkkk