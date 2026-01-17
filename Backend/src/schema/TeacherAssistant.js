// schema/TeacherAssistant.js
const mongoose = require('mongoose');

/* ----------------------- Regex Patterns ----------------------- */
// Email pattern عام، بدون مسافات
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
// رقم يبدأ بـ05 ويتكوّن من 10 أرقام
const phoneRegex = /^05\d{8}$/;
// رقم الهوية: 9 أرقام بالضبط
const idNumberRegex = /^\d{9}$/;

const teacherAssistantSchema = new mongoose.Schema(
  {
    assistantId: {
      type: Number,
      required: [true, 'رقم مساعد المدرس مطلوب'],
      unique: true,
      min: [601, 'رقم مساعد المدرس يجب أن يكون 601 فأكثر'],
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
      min: [18, 'يجب أن يكون عمر مساعد المدرس 18 عام على الأقل'] 
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

    // المعلم المرتبط به (اختياري)
    assignedTeacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
    },

    // الحلقات المسموح له بالوصول إليها
    allowedGroups: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
    }],

    // حالة الحساب
    lastSeen: { type: Date, default: Date.now },

    // الدور الثابت
    role: {
      type: String,
      default: 'teacherAssistant',
      immutable: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
teacherAssistantSchema.index({ assistantId: 1 }, { unique: true });
teacherAssistantSchema.index({ email: 1 }, { unique: true });
teacherAssistantSchema.index({ phoneNumber: 1 }, { unique: true });
teacherAssistantSchema.index({ idNumber: 1 });
teacherAssistantSchema.index({ assignedTeacher: 1 });

module.exports = mongoose.model('TeacherAssistant', teacherAssistantSchema);
