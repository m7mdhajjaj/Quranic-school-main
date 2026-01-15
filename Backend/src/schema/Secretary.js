// schema/Secretary.js
const mongoose = require('mongoose');

/* ----------------------- Regex Patterns ----------------------- */
// Email pattern عام، بدون مسافات
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
// رقم يبدأ بـ05 ويتكوّن من 10 أرقام
const phoneRegex = /^05\d{8}$/;
// رقم الهوية: 9 أرقام بالضبط
const idNumberRegex = /^\d{9}$/;

const secretarySchema = new mongoose.Schema(
  {
    secretaryId: {
      type: Number,
      required: [true, 'رقم السكرتير مطلوب'],
      unique: true,
      min: [501, 'رقم السكرتير يجب أن يكون 501 فأكثر'],
    },

    password: {
      type: String,
      required: [true, 'كلمة المرور مطلوبة'],
      minlength: [6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'],
    },

    // أسماء
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    fatherName: { type: String, trim: true },
    grandFatherName: { type: String, trim: true },
    motherName: { type: String, trim: true },

    // هوية/تواصل
    idNumber: { 
      type: String, 
      required: [true, 'رقم الهوية مطلوب'],
      trim: true,
      match: [idNumberRegex, 'رقم الهوية يجب أن يتكون من 9 أرقام بالضبط'],
    },
    email: {
      type: String,
      required: [true, 'البريد الإلكتروني مطلوب'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [emailRegex, 'صيغة البريد الإلكتروني غير صحيحة'],
    },
    phoneNumber: {
      type: String,
      required: [true, 'رقم الهاتف مطلوب'],
      unique: true,
      match: [phoneRegex, 'الرقم يجب أن يبدأ بـ 05 ويتكوّن من 10 أرقام'],
      trim: true,
    },

    birthDate: { 
      type: String, 
      required: [true, 'تاريخ الميلاد مطلوب'] 
    },
    age: { 
      type: Number, 
      min: [21, 'يجب أن يكون عمر السكرتير 21 عام على الأقل'] 
    },
    gender: {
      type: String,
      required: [true, 'الجنس مطلوب'],
      enum: {
        values: ['male', 'female', 'ذكر', 'أنثى'],
        message: 'القيمة المسموحة للحقل gender هي male/female/ذكر/أنثى',
      },
    },

    residence: { type: String, required: [true, "مكان السكن مطلوب"] },

    // صورة
    avatar: {
      url: { type: String },
      publicId: { type: String },
    },

    // ✅ isActive removed - use PresenceService for Online/Offline
    lastSeen: { type: Date, default: Date.now },

    // صلاحيات السكرتير
    permissions: {
      // إدارة الطلاب
      canManageStudents: { type: Boolean, default: true },
      // إدارة الحضور
      canManageAttendance: { type: Boolean, default: true },
      // إدارة الأخبار
      canManageNews: { type: Boolean, default: true },
      // عرض التقارير
      canViewReports: { type: Boolean, default: true },
      // إدارة الجداول
      canManageTimetable: { type: Boolean, default: false },
      // إدارة الرسائل
      canManageMessages: { type: Boolean, default: true },
    },

    // تاريخ تعديلات birthDate (للتحكم بعدد التعديلات)
    birthDateEditHistory: [
      {
        editDate: { type: Date, required: true, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        ret.hasAvatar = !!ret.avatar?.url;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

/* ------------------- Unique Indexes ------------------- */
// Note: secretaryId, email, and phoneNumber already have unique: true in their field definitions
// which automatically creates indexes, so no need for explicit index() calls

// مثال اختياري: لو بدك idNumber يكون unique فقط إذا موجود
secretarySchema.index(
  { idNumber: 1 },
  {
    unique: true,
    partialFilterExpression: { idNumber: { $exists: true, $ne: null, $ne: "" } },
  }
);

/* ------------------- Virtual Fields ------------------- */
// الاسم الكامل
secretarySchema.virtual('fullName').get(function () {
  const parts = [this.firstName, this.fatherName, this.lastName].filter(Boolean);
  return parts.join(' ');
});

/* ------------------- Instance Methods ------------------- */
// التحقق من صلاحية معينة
secretarySchema.methods.hasPermission = function (permission) {
  return this.permissions && this.permissions[permission] === true;
};

/* ------------------- Pre-save Hooks ------------------- */
// حساب العمر تلقائياً من تاريخ الميلاد
secretarySchema.pre('save', function (next) {
  if (this.birthDate && this.isModified('birthDate')) {
    const birthYear = new Date(this.birthDate).getFullYear();
    const currentYear = new Date().getFullYear();
    this.age = currentYear - birthYear;
  }
  next();
});

module.exports = mongoose.model('Secretary', secretarySchema);
