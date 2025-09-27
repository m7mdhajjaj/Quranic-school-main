const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    studentId: {
      type: Number,
      required: true,
      unique: true,
    },
    idNumber: {
      type: String,
      required: [true, 'رقم الهوية مطلوب'],
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
    fatherName: {
      type: String,
      required: [true, 'اسم الأب مطلوب'],
    },
    grandFatherName: {
      type: String,
      required: [true, 'اسم الجد مطلوب'],
    },
    motherName: {
      type: String,
      required: [true, 'اسم الأم مطلوب'],
    },
    lastName: {
      type: String,
      required: [true, 'اسم العائلة مطلوب'],
    },
    birthDate: {
      type: String,
      required: [true, 'تاريخ الميلاد مطلوب'],
    },
    age: {
      type: Number,
      required: [true, 'العمر مطلوب'],
      min: [0, 'العمر يجب أن يكون رقماً موجباً'],
    },
    gender: {
      type: String,
      enum: {
        values: ['ذكر', 'انثى'],
        message: 'الجنس يجب أن يكون ذكر أو انثى',
      },
      required: [true, 'الجنس مطلوب'],
    },
    residence: {
      type: String,
      required: [true, 'مكان السكن مطلوب'],
    },
    teacher: {
      type: String,
      required: [true, 'اسم المعلم مطلوب'],
    },
    group: {
      type: String,
      required: [true, 'اسم الحلقة مطلوب'],
    },
    email: {
      type: String,
      required: false,
      unique: false,
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
    avatar: {
      type: String,
      required: false,
    },
    isActive: { type: Boolean, default: true },
  },
 {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_, ret) => {
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (_, ret) => {
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// فهرس فريد للبريد عند وجوده فقط
studentSchema.index({ email: 1 }, { unique: true, sparse: true });

// Virtual لحساب العمر عند القراءة
studentSchema.virtual("calculatedAge").get(function () {
  if (!this.birthDate) return undefined;
  const today = new Date();
  let age = today.getFullYear() - this.birthDate.getFullYear();
  const m = today.getMonth() - this.birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < this.birthDate.getDate())) age--;
  return age;
});

// قبل الحفظ: إن تم تمرير age كسلسلة، نحوله إلى رقم
studentSchema.pre("save", function (next) {
  // تطبيع العمر إن أُرسل كسلسلة
  if (typeof this.age === "string") {
    this.age = parseInt(this.age, 10);
    if (Number.isNaN(this.age)) this.age = undefined;
  }
  next();
});

// قبل الحفظ: تشفير كلمة المرور إذا كانت جديدة أو تم تعديلها
studentSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    return next();
  } catch (err) {
    return next(err);
  }
});

// طريقة للمقارنة عند تسجيل الدخول
studentSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

const Student = mongoose.model("Student", studentSchema);
module.exports = Student;
