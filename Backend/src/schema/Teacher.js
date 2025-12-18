// schema/Teacher.js
const mongoose = require('mongoose');

// تعريف sub-schema للحلقات
const groupSubSchema = new mongoose.Schema({
  id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: [true, 'معرف الحلقة مطلوب']
  },
  name: {
    type: String,
    required: [true, 'اسم الحلقة مطلوب'],
    trim: true
  },
  number: {
    type: Number,
    required: false, // جعله اختيارياً
    min: [1, 'رقم الحلقة يجب أن يكون أكبر من 0']
  }
}, { _id: false }); // منع إنشاء _id تلقائي للعناصر الفرعية

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
      match: [/^\d{9}$/, 'رقم الهوية يجب أن يتكون من 9 أرقام فقط']
    },
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

    // الحلقات التي يدرسها المعلم
    groups: {
      type: [groupSubSchema],
      default: [],
      validate: [
        {
          validator: arr => Array.isArray(arr) && arr.every(g => g && g.name && g.id),
          message: 'كل حلقة يجب أن تحتوي على اسم ومعرف صالح.',
        }
      ]
    },

    // خبرة/دور
    role: { type: String, enum: ['teacher'], default: 'teacher' },

    // الصورة
    avatar: {
      url: { type: String },
      publicId: { type: String },
    },

    // ✅ isActive removed - use PresenceService for Online/Offline
    lastSeen: { type: Date, default: Date.now },

    // تاريخ تعديلات birthDate (للتحكم بعدد التعديلات)
    birthDateEditHistory: [
      {
        editDate: { type: Date, required: true, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

// ====================================
// Indexes للأداء الأفضل
// ====================================

// Index للبحث السريع
// ملاحظة: الفهارس على email, phoneNumber, idNumber تم إنشاؤها تلقائياً عبر unique: true
teacherSchema.index({ firstName: 1, lastName: 1 });

// Index للفلترة
teacherSchema.index({ gender: 1 });
teacherSchema.index({ age: 1 });
// ✅ isActive index removed

// Compound index للترتيب والفلترة معاً
teacherSchema.index({ gender: 1, age: 1 });

// Index للحلقات - للبحث السريع عن المعلمين حسب الحلقة
teacherSchema.index({ 'groups.name': 1 });
teacherSchema.index({ 'groups.id': 1 });

// Text index للبحث النصي الكامل (يشمل جميع الحقول النصية)
teacherSchema.index({
  firstName: 'text',
  lastName: 'text',
  fatherName: 'text',
  grandFatherName: 'text',
  motherName: 'text',
  email: 'text',
  residence: 'text',
  'groups.name': 'text'
}, {
  weights: {
    firstName: 10,
    lastName: 10,
    fatherName: 5,
    email: 5,
    'groups.name': 8
  },
  name: 'teacher_text_search'
});

const Teacher = mongoose.model('Teacher', teacherSchema);
module.exports = Teacher;
