// schema/Student.js
const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    studentId: { type: Number, required: true, unique: true },
    idNumber: {
      type: String,
      required: [true, "رقم الهوية مطلوب"],
      unique: true,
      trim: true,
      validate: [
        {
          validator: function (value) {
            // التحقق من أن القيمة تحتوي على أرقام فقط
            return /^\d+$/.test(value);
          },
          message: "رقم الهوية يجب أن يحتوي على أرقام فقط",
        },
        {
          validator: function (value) {
            // التحقق من أن الطول 9 أرقام بالضبط
            return value && value.length === 9;
          },
          message: "رقم الهوية يجب أن يتكون من 9 أرقام بالضبط",
        },
      ],
      match: [/^\d{9}$/, "رقم الهوية يجب أن يتكون من 9 أرقام فقط"],
    },

    // لا تخزن كلمة المرور نصًا عاديًا
    password: { type: String, required: [true, "كلمة المرور مطلوبة"] },

    firstName: { type: String, required: [true, "الاسم الأول مطلوب"], default: "" },
    fatherName: { type: String, required: [true, "اسم الأب مطلوب"], default: "" },
    grandFatherName: { type: String, required: [true, "اسم الجد مطلوب"], default: "" },
    motherName: { type: String, required: [true, "اسم الأم مطلوب"], default: "" },
    lastName: { type: String, required: [true, "اسم العائلة مطلوب"], default: "" },

    birthDate: { type: Date, required: [true, "تاريخ الميلاد مطلوب"] },

    // إما تخليه اختياري:
    age: {
      type: Number,
      required: false,
      min: [0, "العمر يجب أن يكون رقماً موجباً"],
      default: 0,
    },

    gender: {
      type: String,
      default: "غير محدد",
      enum: {
        values: ["ذكر", "انثى", "أنثى", "male", "female", "Male", "Female"],
        message:
          "الجنس يجب أن يكون ذكر أو أنثى (Arabic) or male/female (English)",
      },
      required: [true, "الجنس مطلوب"],
      // تطبيع تسوية تلقائية للقيم
      set: function (value) {
        if (!value) return value;
        const normalized = value.toString().toLowerCase().trim();
        if (normalized === "male" || normalized === "ذكر") return "ذكر";
        if (
          normalized === "female" ||
          normalized === "أنثى" ||
          normalized === "انثى"
        )
          return "أنثى";
        return value;
      },
    },

    residence: { type: String, required: [true, "مكان السكن مطلوب"], default: "" },
    teacher: {
      type: String,
      required: false, // اختياري - يُحدد تلقائياً من الحلقة
      default: "غير محدد",
    },
    group: {
      type: String,
      required: false, // اختياري - يمكن إضافة طالب بلا حلقة
      default: "غير محدد",
    },

    email: {
      type: String,
      required: false,
      match: [/\S+@\S+\.\S+/, "البريد الإلكتروني غير صالح"],
    },
    phoneNumber: {
      type: String,
      required: [true, "رقم الهاتف مطلوب"],
      match: [/^05\d{8}$/, "الرقم يجب أن يبدأ بـ 05 ويتكوّن من 10 أرقام"],
      unique: true,
    },
    avatar: {
      url: { type: String },
      publicId: { type: String },
    },
    isActive: { type: Boolean, default: false },
    lastSeen: { type: Date, default: Date.now },

    // تاريخ تعديلات birthDate (للتحكم بعدد التعديلات)
    birthDateEditHistory: [
      {
        editDate: { type: Date, required: true, default: Date.now },
      },
    ],

    // المعدلات الشهرية للطالب
    monthlyAverages: [
      {
        month: { type: Number, required: true, min: 1, max: 12 }, // رقم الشهر (1-12)
        year: { type: Number, required: true }, // السنة
        reviewAverage: { type: Number, min: 0, max: 100, default: null }, // معدل المراجعة من 100
        memorizationAverage: { type: Number, min: 0, max: 100, default: null }, // معدل الحفظ من 100
        overallAverage: { type: Number, min: 0, max: 100, default: null }, // المعدل الإجمالي من 100
        totalMarks: { type: Number, default: 0 }, // عدد العلامات المسجلة
        lastUpdated: { type: Date, default: Date.now }, // آخر تحديث
      },
    ],
  },

  { timestamps: true }
);

// إضافة فهارس مركبة لتحسين أداء البحث
studentSchema.index({ teacher: 1, group: 1 }); // فهرس مركب للمعلم والحلقة

// ============================================================================
// HOOKS - تحديث تلقائي لـ activeStatus في الحلقات
// ============================================================================

/**
 * Hook: بعد حفظ طالب جديد → تحديث activeStatus للحلقة
 */
studentSchema.post("save", async function (doc) {
  try {
    if (doc.group && doc.group !== "غير محدد") {
      const Group = mongoose.model("Group");
      await Group.recalculateActiveStatusByName(doc.group);
    }
  } catch (error) {
    console.error("❌ [Student post-save hook] Error:", error);
  }
});

/**
 * Hook: قبل تحديث طالب → حفظ الحلقة القديمة
 */
studentSchema.pre("findOneAndUpdate", async function (next) {
  try {
    // حفظ الحلقة القديمة قبل التحديث
    const docToUpdate = await this.model.findOne(this.getQuery()).select("group");
    this._oldGroup = docToUpdate?.group;
    next();
  } catch (error) {
    console.error("❌ [Student pre-update hook] Error:", error);
    next();
  }
});

/**
 * Hook: بعد تحديث طالب → تحديث activeStatus للحلقات (القديمة والجديدة)
 */
studentSchema.post("findOneAndUpdate", async function (doc) {
  try {
    if (!doc) return;

    const Group = mongoose.model("Group");
    
    // الحصول على التحديث المطبق
    const update = this.getUpdate() || {};
    const newGroup = update.group || (update.$set && update.$set.group) || doc.group;
    
    // استخدام الحلقة القديمة المحفوظة من pre hook
    const oldGroup = this._oldGroup;

    // تحديث الحلقات المتأثرة فقط إذا تغيرت الحلقة
    if (oldGroup !== newGroup) {
      console.log(`🔄 [Student update hook] Updating groups: "${oldGroup}" → "${newGroup}"`);
      await Group.recalculateActiveStatusOnStudentMove(oldGroup, newGroup);
    }
  } catch (error) {
    console.error("❌ [Student post-update hook] Error:", error);
  }
});

/**
 * Hook: بعد حذف طالب → تحديث activeStatus للحلقة
 */
studentSchema.post("findOneAndDelete", async function (doc) {
  try {
    if (!doc) return;
    
    if (doc.group && doc.group !== "غير محدد") {
      const Group = mongoose.model("Group");
      await Group.recalculateActiveStatusByName(doc.group);
    }
  } catch (error) {
    console.error("❌ [Student post-delete hook] Error:", error);
  }
});

/**
 * Hook: بعد حذف متعدد → تحديث activeStatus للحلقات المتأثرة
 */
studentSchema.post("deleteMany", async function () {
  try {
    // للأسف deleteMany لا تعطينا الوثائق المحذوفة
    // لذلك نحتاج للحصول عليها قبل الحذف في middleware "pre"
    // سنتعامل معها في Controllers مباشرة
    console.log("⚠️ [Student deleteMany hook] Consider manual activeStatus update");
  } catch (error) {
    console.error("❌ [Student post-deleteMany hook] Error:", error);
  }
});

// مثال Virtual لعمر محسوب (اختياري)
studentSchema.virtual("computedAge").get(function () {
  if (!this.birthDate) return undefined;
  const today = new Date();
  let age = today.getFullYear() - this.birthDate.getFullYear();
  const m = today.getMonth() - this.birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < this.birthDate.getDate())) age--;
  return age;
});

module.exports = mongoose.model("Student", studentSchema);
