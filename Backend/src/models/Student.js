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
    },
    password: {
      type: String,
      required: [true, "كلمة المرور مطلوبة"],
      default: function () {
        return this.idNumber; // استخدام رقم الهوية كـ password افتراضي
      },
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
      type: String,
      required: [true, "تاريخ الميلاد مطلوب"],
    },
    age: {
      type: Number,
      required: [true, "العمر مطلوب"],
      min: [0, "العمر يجب أن يكون رقماً موجباً"],
    },
    gender: {
      type: String,
      enum: {
        values: ["ذكر", "انثى"],
        message: "الجنس يجب أن يكون ذكر أو انثى",
      },
      required: [true, "الجنس مطلوب"],
    },
    residence: {
      type: String,
      required: [true, "مكان السكن مطلوب"],
    },
    teacher: {
      type: String,
      required: [true, "اسم المعلم مطلوب"],
    },
    group: {
      type: String,
      required: [true, "اسم الحلقة مطلوب"],
    },
  },
  { timestamps: true },
);

// Simplified pre-save hook
studentSchema.pre("save", function (next) {
  console.log("Attempting to save student:", {
    _id: this._id,
    studentId: this.studentId,
    name: `${this.firstName} ${this.lastName}`,
    group: this.group,
  });

  // Convert age to number if it's a string
  if (typeof this.age === "string") {
    this.age = parseInt(this.age, 10) || 0;
  }

  next();
});

const Student = mongoose.model("Student", studentSchema);

module.exports = Student;
