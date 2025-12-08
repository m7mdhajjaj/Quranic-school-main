// schema/Teacher.js
const mongoose = require("mongoose");

// Sub-schema for groups that a teacher has
const groupSubSchema = new mongoose.Schema(
  {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: [true, "معرف الحلقة مطلوب"],
    },
    name: {
      type: String,
      required: [true, "اسم الحلقة مطلوب"],
      trim: true,
    },
    number: {
      type: Number,
      required: [true, "رقم الحلقة مطلوب"],
      min: [1, "رقم الحلقة يجب أن يكون أكبر من 0"],
    },
  },
  { _id: false } // don’t create _id for each sub-document
);

const teacherSchema = new mongoose.Schema(
  {
    teacherId: {
      type: Number,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: [true, "كلمة المرور مطلوبة"],
    },

    // Names
    firstName: {
      type: String,
      required: [true, "الاسم الأول مطلوب"],
    },
    lastName: {
      type: String,
      required: [true, "اسم العائلة مطلوب"],
    },
    fatherName: {
      type: String,
    },
    grandFatherName: {
      type: String,
    },
    motherName: {
      type: String,
    },

    // Identity / Contact
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

    phoneNumber: {
      type: String,
      required: [true, "رقم الهاتف مطلوب"],
      match: [/^05\d{8}$/, "الرقم يجب أن يبدأ بـ 05 ويتكوّن من 10 أرقام"],
      unique: true,
    },

    // You had it as string with regex, I keep same behavior
    birthDate: {
      type: String,
      required: [true, "تاريخ الميلاد مطلوب"],
      match: [/^\d{4}-\d{2}-\d{2}$/, "صيغة التاريخ يجب أن تكون YYYY-MM-DD"],
    },

    email: {
      type: String,
      required: [true, "البريد الإلكتروني مطلوب"],
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "صيغة البريد الإلكتروني غير صحيحة",
      ],
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

    // Groups this teacher is responsible for
    groups: {
      type: [groupSubSchema],
      default: [],
      validate: [
        {
          validator(arr) {
            return (
              Array.isArray(arr) &&
              arr.every((g) => g && g.name && g.number && g.id)
            );
          },
          message: "كل حلقة يجب أن تحتوي على اسم ورقم ومعرف صالح.",
        },
      ],
    },

    role: {
      type: String,
      enum: ["teacher"],
      default: "teacher",
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
  },
  { timestamps: true }
);

const Teacher = mongoose.model("Teacher", teacherSchema);
module.exports = Teacher;
