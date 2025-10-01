// // models/Admin.js
// const mongoose = require("mongoose");

// const adminSchema = new mongoose.Schema(
//   {
//     adminId: {
//       type: Number,
//       required: true,
//       unique: true,
//     },
//     password: {
//       type: String,
//       required: [true, "كلمة المرور مطلوبة"],
//     },

//     // الاسماء
//     firstName: { type: String, required: [true, "الاسم الأول مطلوب"] },
//     lastName: { type: String, required: [true, "اسم العائلة مطلوب"] },
//     fatherName: { type: String },
//     grandFatherName: { type: String },
//     motherName: { type: String },

//     // هوية/تواصل
//     idNumber: { type: String },
//     email: {
//       type: String,
//       required: [true, "البريد الإلكتروني مطلوب"],
//       unique: true,
//     },
//     phoneNumber: {
//       type: String,
//       required: [true, "رقم الهاتف مطلوب"],
//       match: [/^05\d{8}$/, "الرقم يجب أن يبدأ بـ 05 ويتكوّن من 10 أرقام"],
//       unique: true,
//     },

//     // معلومات شخصية
//     birthDate: { type: String }, // أبقيناها String لتوافق الكود لديك

//     age: { type: Number, min: [0, "العمر يجب أن يكون رقماً موجباً"] },
//     gender: {
//       type: String,
//       enum: ["male", "female", "ذكر", "أنثى"],
//       required: false,
//     },

//     residence: { type: String },

//     // الصورة
//     avatar: { data: Buffer, contentType: String },

//     isActive: { type: Boolean, default: false },
//     lastSeen: { type: Date, default: Date.now },
//   },
//   { timestamps: true }
// );

// const Admin = mongoose.model("Admin", adminSchema);
// module.exports = Admin;



// models/Admin.js
const mongoose = require("mongoose");

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const phoneRegex = /^05\d{8}$/;

const adminSchema = new mongoose.Schema(
  {
    adminId: {
      type: Number,
      required: [true, "رقم المشرف مطلوب"],
      unique: true,
      index: true,
      min: [1, "رقم المشرف يجب أن يكون 1 فأكثر"],
    },

    // كلمة المرور (بدون أي تشفير هنا)
    password: {
      type: String,
      required: [true, "كلمة المرور مطلوبة"],
      minlength: [6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"],
      // ملاحظة: إذا لا تريد ظهورها في الاستعلامات الافتراضية، فعّل السطر التالي
      // select: false,
    },

    // الأسماء
    firstName: { type: String, required: [true, "الاسم الأول مطلوب"], trim: true },
    lastName: { type: String, required: [true, "اسم العائلة مطلوب"], trim: true },
    fatherName: { type: String, trim: true },
    grandFatherName: { type: String, trim: true },
    motherName: { type: String, trim: true },

    // هوية/تواصل
    idNumber: { type: String, trim: true },
    email: {
      type: String,
      required: [true, "البريد الإلكتروني مطلوب"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [emailRegex, "صيغة البريد الإلكتروني غير صحيحة"],
      index: true,
    },
    phoneNumber: {
      type: String,
      required: [true, "رقم الهاتف مطلوب"],
      match: [phoneRegex, "الرقم يجب أن يبدأ بـ 05 ويتكوّن من 10 أرقام"],
      unique: true,
      trim: true,
      index: true,
    },

    // معلومات شخصية
    birthDate: { type: String }, // تبقى String للتوافق مع بقية الكود
    age: { type: Number, min: [0, "العمر يجب أن يكون رقماً موجباً"] },
    gender: {
      type: String,
      enum: {
        values: ["male", "female", "ذكر", "أنثى"],
        message: "القيمة المسموحة للحقل gender هي male/female/ذكر/أنثى",
      },
    },

    residence: { type: String, trim: true },

    // الصورة
    avatar: {
      data: Buffer,
      contentType: { type: String, enum: ["image/png", "image/jpeg", "image/webp"], default: undefined },
    },

    isActive: { type: Boolean, default: false },
    lastSeen: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        // اخفاء بيانات الصورة الثقيلة وإرجاع فلاغ بسيط
        if (ret.avatar && ret.avatar.data) delete ret.avatar.data;
        ret.hasAvatar = !!ret.avatar?.contentType;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

/* ------------------------ فهارس مساعدة للبحث ------------------------ */
// فهرس نصي للأسماء لتسهيل البحث
adminSchema.index(
  { firstName: "text", lastName: "text", fatherName: "text", grandFatherName: "text", motherName: "text" },
  { name: "admin_name_text_index", weights: { firstName: 5, lastName: 5 } }
);

/* ------------------------- Virtuals / مشتقات ------------------------ */
adminSchema.virtual("fullName").get(function () {
  return [this.firstName, this.fatherName, this.grandFatherName, this.lastName]
    .filter(Boolean)
    .join(" ");
});

/* --------------------- تنسيق/تنظيف قبل التحقق ---------------------- */
// تطبيع المسافات: تحويل المسافات المتعددة إلى مسافة واحدة + trim
adminSchema.pre("validate", function () {
  const normalize = (v) => (typeof v === "string" ? v.replace(/\s+/g, " ").trim() : v);
  this.firstName = normalize(this.firstName);
  this.lastName = normalize(this.lastName);
  this.fatherName = normalize(this.fatherName);
  this.grandFatherName = normalize(this.grandFatherName);
  this.motherName = normalize(this.motherName);
  this.residence = normalize(this.residence);
  this.idNumber = normalize(this.idNumber);
  this.email = typeof this.email === "string" ? this.email.toLowerCase().trim() : this.email;
  this.phoneNumber = normalize(this.phoneNumber);
});

/* --------------------------- دوال مساعدة --------------------------- */
// تحديث آخر ظهور بدون التحقق الكامل
adminSchema.methods.touchLastSeen = function () {
  this.lastSeen = new Date();
  return this.save({ validateBeforeSave: false });
};

const Admin = mongoose.model("Admin", adminSchema);
module.exports = Admin;
