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
    phoneNumber: {
      type: String,
      required: [true, 'رقم الهاتف مطلوب'],
      match: [/^05\d{8}$/, 'الرقم يجب أن يبدأ بـ 05 ويتكوّن من 10 أرقام'],
      unique: true,
    },

    // 👇 kept as String, but with regex check to ensure format (YYYY-MM-DD for example)
    birthDate: {
      type: String,
      required: [true, 'تاريخ الميلاد مطلوب'],
      match: [/^\d{4}-\d{2}-\d{2}$/, 'صيغة التاريخ يجب أن تكون YYYY-MM-DD'],
    },

    email: {
      type: String,
      required: [true, 'البريد الإلكتروني مطلوب'],
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'صيغة البريد الإلكتروني غير صحيحة',
      ],
    },

    // معلومات شخصية

    age: { type: Number, min: [0, 'العمر يجب أن يكون رقماً موجباً'] },
    gender: {
      type: String,
      enum: {
        values: ['ذكر', 'انثى', 'أنثى', 'male', 'female', 'Male', 'Female'],
        message:
          'الجنس يجب أن يكون ذكر أو أنثى (Arabic) or male/female (English)',
      },
      required: false,
      // تطبيق تسوية تلقائية للقيم
      set: function (value) {
        if (!value) return value;
        const normalized = value.toString().toLowerCase().trim();
        if (normalized === 'male' || normalized === 'ذكر') return 'ذكر';
        if (
          normalized === 'female' ||
          normalized === 'أنثى' ||
          normalized === 'انثى'
        )
          return 'أنثى';
        return value;
      },
    },

    residence: { type: String },

    // الحلقات
    groups: { type: [String], default: [] }, // كان required ويسبب فشل عند عدم الإرسال
    groupName: { type: String }, // يستخدمه الكونترولر لتعبئة groups

    // خبرة/دور
    role: { type: String, enum: ['teacher'], default: 'teacher' },

    // الصورة
    avatar: { data: Buffer, contentType: String },

    isActive: { type: Boolean, default: false },
    lastSeen: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Teacher = mongoose.model('Teacher', teacherSchema);
module.exports = Teacher;
