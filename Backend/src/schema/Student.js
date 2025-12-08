// schema/Student.js
const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    studentId: {
      type: Number,
      required: true,
      unique: true,
    },

    idNumber: {
      type: String,
      required: [true, "رقم الهوية مطلوب"],
      unique: true,
      trim: true,
      validate: [
        {
          validator(value) {
            return /^\d+$/.test(value);
          },
          message: "رقم الهوية يجب أن يحتوي على أرقام فقط",
        },
        {
          validator(value) {
            return value && value.length === 9;
          },
          message: "رقم الهوية يجب أن يتكون من 9 أرقام بالضبط",
        },
      ],
      match: [/^\d{9}$/, "رقم الهوية يجب أن يتكون من 9 أرقام فقط"],
    },

    password: {
      type: String,
      required: [true, "كلمة المرور مطلوبة"],
    },

    firstName: {
      type: String,
      required: [true, "الاسم الأول مطلوب"],
    },
    fatherName: {
      type: String,
      required: [true, "اسم الأب مطلوب"],
    },
    grandFatherName: {
      type: String,
      required: [true, "اسم الجد مطلوب"],
    },
    motherName: {
      type: String,
      required: [true, "اسم الأم مطلوب"],
    },
    lastName: {
      type: String,
      required: [true, "اسم العائلة مطلوب"],
    },

    birthDate: {
      type: Date,
      required: [true, "تاريخ الميلاد مطلوب"],
    },

    age: {
      type: Number,
      min: [0, "العمر يجب أن يكون رقماً موجباً"],
    },

    gender: {
      type: String,
      enum: {
        values: ["ذكر", "انثى", "أنثى", "male", "female", "Male", "Female"],
        message:
          "الجنس يجب أن يكون ذكر أو أنثى (Arabic) or male/female (English)",
      },
      required: [true, "الجنس مطلوب"],
      set(value) {
        if (!value) return value;
        const normalized = value.toString().toLowerCase().trim();
        if (normalized === "male" || normalized === "ذكر") return "ذكر";
        if (["female", "أنثى", "انثى"].includes(normalized)) return "أنثى";
        return value;
      },
    },

    residence: {
      type: String,
      required: [true, "مكان السكن مطلوب"],
    },

    // ✅ Relation to Teacher (for populate)
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: false, // keep false while migrating, can be true later
    },

    // Optional: keep teacherName as plain string for legacy data
    teacherName: {
      type: String,
      trim: true,
    },

    // ✅ Relation to Group (for populate)
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: false,
      default: null, // null for temporarily suspended students
    },

    // Optional: keep groupName for legacy usages or quick display
    groupName: {
      type: String,
      trim: true,
      default: null,
    },

    email: {
      type: String,
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

    isActive: {
      type: Boolean,
      default: false,
    },

    lastSeen: {
      type: Date,
      default: Date.now,
    },

    // Monthly performance averages
    monthlyAverages: [
      {
        month: {
          type: Number,
          required: true,
          min: 1,
          max: 12, // 1–12
        },
        year: {
          type: Number,
          required: true,
        },
        reviewAverage: {
          type: Number,
          min: 0,
          max: 100,
          default: null,
        },
        memorizationAverage: {
          type: Number,
          min: 0,
          max: 100,
          default: null,
        },
        overallAverage: {
          type: Number,
          min: 0,
          max: 100,
          default: null,
        },
        totalMarks: {
          type: Number,
          default: 0,
        },
        lastUpdated: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

// Compound index to speed up teacher + group queries
studentSchema.index({ teacher: 1, group: 1 });

// Computed age virtual
studentSchema.virtual("computedAge").get(function () {
  if (!this.birthDate) return undefined;

  const today = new Date();
  let age = today.getFullYear() - this.birthDate.getFullYear();
  const monthDiff = today.getMonth() - this.birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < this.birthDate.getDate())
  ) {
    age--;
  }

  return age;
});

const Student = mongoose.model("Student", studentSchema);
module.exports = Student;
