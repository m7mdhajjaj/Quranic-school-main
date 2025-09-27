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
    firstName: {
      type: String,
      required: [true, 'الاسم الأول مطلوب'],
    },
    lastName: {
      type: String,
      required: [true, 'اسم العائلة مطلوب'],
    },
    fatherName: {
      type: String,
      required: false, // اختياري للمعلمين الحاليين
    },
    grandFatherName: {
      type: String,
      required: false, // اختياري للمعلمين الحاليين
    },
    email: {
      type: String,
      required: [true, 'البريد الإلكتروني مطلوب'],
      unique: true,
    },
    phoneNumber: {
      type: String,
      trim: true,
      // مثال فلسطين/شركات جوال/وطنية: 05XXXXXXXX
      validate: {
        validator: (v) => !v || /^05\d{8}$/.test(v),
        message: 'الرقم يجب أن يبدأ بـ 05 ويتكوّن من 10 أرقام',
      },
    },
    idNumber: {
      type: String,
      required: false, // اختياري للمعلمين الحاليين
    },
    motherName: {
      type: String,
      required: false, // اختياري للمعلمين الحاليين
    },
    birthDate: {
      type: String,
      required: false, // اختياري للمعلمين الحاليين
    },
    age: {
      type: Number,
      required: false, // العمر اختياري للمعلمين الحاليين
      min: [0, 'العمر يجب أن يكون رقماً موجباً'],
    },
    groups: {
      type: [String],
      required: [true, 'يجب تحديد الحلقات التي يدرسها المعلم'],
    },
    role: {
      type: String,
      enum: ['teacher', 'admin'],
      default: 'teacher',
    },
    avatar: {
      type: String,
      required: false,
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Teacher = mongoose.model('Teacher', teacherSchema);

module.exports = Teacher;
