// schema/Student.js
const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    studentId: { type: Number, required: true, unique: true },
    idNumber: {
      type: String,
      required: [true, 'رقم الهوية مطلوب'],
      unique: true,
      trim: true,
      validate: [
        {
          validator: function(value) {
            // التحقق من أن القيمة تحتوي على أرقام فقط
            return /^\d+$/.test(value);
          },
          message: 'رقم الهوية يجب أن يحتوي على أرقام فقط'
        },
        {
          validator: function(value) {
            // التحقق من أن الطول 9 أرقام بالضبط
            return value && value.length === 9;
          },
          message: 'رقم الهوية يجب أن يتكون من 9 أرقام بالضبط'
        }
      ],
      match: [/^\d{9}$/, 'رقم الهوية يجب أن يتكون من 9 أرقام فقط'],
    },

    // لا تخزن كلمة المرور نصًا عاديًا
    password: { type: String, required: [true, 'كلمة المرور مطلوبة'] },

    firstName: { type: String, required: [true, 'الاسم الأول مطلوب'] },
    fatherName: { type: String, required: [true, 'اسم الأب مطلوب'] },
    grandFatherName: { type: String, required: [true, 'اسم الجد مطلوب'] },
    motherName: { type: String, required: [true, 'اسم الأم مطلوب'] },
    lastName: { type: String, required: [true, 'اسم العائلة مطلوب'] },

    birthDate: { type: Date, required: [true, 'تاريخ الميلاد مطلوب'] },

    // إما تخليه اختياري:
    age: {
      type: Number,
      required: false,
      min: [0, 'العمر يجب أن يكون رقماً موجباً'],
    },

    gender: {
      type: String,
      enum: {
        values: ['ذكر', 'انثى', 'أنثى', 'male', 'female', 'Male', 'Female'],
        message:
          'الجنس يجب أن يكون ذكر أو أنثى (Arabic) or male/female (English)',
      },
      required: [true, 'الجنس مطلوب'],
      // تطبيع تسوية تلقائية للقيم
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

    residence: { type: String, required: [true, 'مكان السكن مطلوب'] },
    teacher: { 
      type: String, 
      required: [true, 'اسم المعلم مطلوب']
    },
    group: { 
      type: String, 
      required: [true, 'اسم الحلقة مطلوب']
    },

    email: {
      type: String,
      required: false,
      match: [/\S+@\S+\.\S+/, 'البريد الإلكتروني غير صالح'],
    },
    phoneNumber: {
      type: String,
      required: [true, 'رقم الهاتف مطلوب'],
      match: [/^05\d{8}$/, 'الرقم يجب أن يبدأ بـ 05 ويتكوّن من 10 أرقام'],
      unique: true,
    },
    avatar: { data: Buffer, contentType: String },
    isActive: { type: Boolean, default: false },
    lastSeen: { type: Date, default: Date.now },
  },

  { timestamps: true }
);

// إضافة فهارس مركبة لتحسين أداء البحث
studentSchema.index({ teacher: 1, group: 1 }); // فهرس مركب للمعلم والحلقة

// مثال Virtual لعمر محسوب (اختياري)
studentSchema.virtual('computedAge').get(function () {
  if (!this.birthDate) return undefined;
  const today = new Date();
  let age = today.getFullYear() - this.birthDate.getFullYear();
  const m = today.getMonth() - this.birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < this.birthDate.getDate())) age--;
  return age;
});

module.exports = mongoose.model('Student', studentSchema);
