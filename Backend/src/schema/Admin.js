// schema/Admin.js
const mongoose = require('mongoose');

/* ----------------------- Regex Patterns ----------------------- */
// Email pattern عام، بدون مسافات
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
// رقم يبدأ بـ05 ويتكوّن من 10 أرقام
const phoneRegex = /^05\d{8}$/;

const adminSchema = new mongoose.Schema(
  {
    adminId: {
      type: Number,
      required: [true, 'رقم المشرف مطلوب'],
      unique: true,
      min: [1, 'رقم المشرف يجب أن يكون 1 فأكثر'],
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
    idNumber: { type: String, trim: true },
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

    birthDate: { type: String },
    age: { type: Number, min: [0, 'العمر يجب أن يكون رقماً موجباً'] },
    gender: {
      type: String,
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
// Note: adminId, email, and phoneNumber already have unique: true in their field definitions
// which automatically creates indexes, so no need for explicit index() calls

// مثال اختياري: لو بدك idNumber يكون unique فقط إذا موجود
adminSchema.index(
  { idNumber: 1 },
  {
    unique: true,
    partialFilterExpression: { idNumber: { $exists: true, $ne: '' } },
  }
);

/* ------------------- نصي للبحث بالأسماء ------------------- */
adminSchema.index(
  {
    firstName: 'text',
    lastName: 'text',
    fatherName: 'text',
    grandFatherName: 'text',
    motherName: 'text',
  },
  { name: 'admin_name_text_index', weights: { firstName: 5, lastName: 5 } }
);

/* ------------------- Virtuals ------------------- */
adminSchema.virtual('fullName').get(function () {
  return [this.firstName, this.fatherName, this.grandFatherName, this.lastName]
    .filter(Boolean)
    .join(' ');
});

/* ------------------- Hooks ------------------- */
// حساب العمر تلقائياً من تاريخ الميلاد
adminSchema.pre('save', function (next) {
  if (this.birthDate && this.isModified('birthDate')) {
    try {
      const birthYear = new Date(this.birthDate).getFullYear();
      const currentYear = new Date().getFullYear();
      this.age = currentYear - birthYear;
    } catch (error) {
      console.error('Error calculating age:', error);
    }
  }
  next();
});

// حساب العمر عند التحديث باستخدام findOneAndUpdate
adminSchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate();
  
  // Check for birthDate in both direct update and $set operator
  const birthDate = update?.birthDate || update?.$set?.birthDate;
  
  if (birthDate) {
    try {
      const birthYear = new Date(birthDate).getFullYear();
      const currentYear = new Date().getFullYear();
      const calculatedAge = currentYear - birthYear;
      
      // Set age in the appropriate location
      if (update.$set) {
        update.$set.age = calculatedAge;
      } else {
        update.age = calculatedAge;
      }
    } catch (error) {
      console.error('Error calculating age:', error);
    }
  }
  
  next();
});

adminSchema.pre('validate', function () {
  const normalize = (v) =>
    typeof v === 'string' ? v.replace(/\s+/g, ' ').trim() : v;
  this.firstName = normalize(this.firstName);
  this.lastName = normalize(this.lastName);
  this.fatherName = normalize(this.fatherName);
  this.grandFatherName = normalize(this.grandFatherName);
  this.motherName = normalize(this.motherName);
  this.residence = normalize(this.residence);
  this.idNumber = normalize(this.idNumber);
  this.email =
    typeof this.email === 'string'
      ? this.email.toLowerCase().trim()
      : this.email;
  this.phoneNumber = normalize(this.phoneNumber);
});

/* ------------------- Methods ------------------- */
adminSchema.methods.touchLastSeen = function () {
  this.lastSeen = new Date();
  return this.save({ validateBeforeSave: false });
};

// ============================================================================
// HOOKS - إعادة تدوير الـ ID عند الحذف
// ============================================================================

/**
 * Hook: بعد حذف مشرف → إعادة تدوير الـ adminId
 */
adminSchema.post("findOneAndDelete", async function (doc) {
  try {
    if (!doc) return;

    // ♻️ إعادة تدوير الـ adminId
    if (doc.adminId) {
      const Counter = mongoose.model("Counter");
      await Counter.recycleId("admin", doc.adminId);
    }
  } catch (error) {
    console.error("❌ [Admin post-delete hook] Error:", error);
  }
});

/**
 * Hook: قبل حذف متعدد → حفظ الـ IDs للتدوير
 */
adminSchema.pre("deleteMany", async function (next) {
  try {
    const docs = await this.model.find(this.getQuery()).select("adminId").lean();
    this._deletedDocs = docs;
    next();
  } catch (error) {
    console.error("❌ [Admin pre-deleteMany hook] Error:", error);
    next();
  }
});

/**
 * Hook: بعد حذف متعدد → إعادة تدوير الـ IDs
 */
adminSchema.post("deleteMany", async function () {
  try {
    const deletedDocs = this._deletedDocs || [];
    if (deletedDocs.length === 0) return;

    const idsToRecycle = deletedDocs
      .map((doc) => doc.adminId)
      .filter((id) => id);

    if (idsToRecycle.length > 0) {
      const Counter = mongoose.model("Counter");
      await Counter.recycleMultipleIds("admin", idsToRecycle);
    }

    console.log(`♻️ [Admin deleteMany hook] Recycled ${idsToRecycle.length} IDs`);
  } catch (error) {
    console.error("❌ [Admin post-deleteMany hook] Error:", error);
  }
});

const Admin = mongoose.model('Admin', adminSchema);
module.exports = Admin;
