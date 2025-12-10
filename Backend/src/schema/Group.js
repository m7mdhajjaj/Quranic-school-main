const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "اسم الحلقة مطلوب"],
      unique: true,
      trim: true,
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
      required: [true, "معرف المعلم مطلوب"],
      index: true, // فهرس للبحث السريع
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "الوصف يجب ألا يتجاوز 500 حرف"],
    },

    capacity: {
      type: Number,
      min: [0, "السعة يجب أن تكون 0 أو أكثر"],
      max: [50, "السعة يجب ألا تتجاوز 50 طالب"],
      default: 30,
    },

    schedule: {
      type: String,
      match: [/^[\u0600-\u06FF\s0-9:,،|-]*$/, "صيغة الجدول غير صحيحة"],
      trim: true,
      maxlength: [200, "الجدول الزمني يجب ألا يتجاوز 200 حرف"],
    },

    // إحصائيات الحضور للشهر الحالي
    currentMonthStats: {
      month: {
        type: String, // بصيغة "YYYY-MM" مثل "2025-10"
      },
      absenceRate: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
      attendanceRate: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
      totalDays: {
        type: Number,
        default: 0,
      },
      totalAbsences: {
        type: Number,
        default: 0,
      },
      totalPresences: {
        type: Number,
        default: 0,
      },
    },
  },
  { timestamps: true }
);

// فهرس لاسم الحلقة فقط - لضمان التفرد
// اسم الحلقة يجب أن يكون فريداً بغض النظر عن المعلم
groupSchema.index({ name: 1 }, { unique: true });

// فهرس للمعلم للبحث السريع عن حلقاته
groupSchema.index({ teacher: 1 });

// middleware للتحقق من تفرد اسم الحلقة قبل الحفظ
groupSchema.pre("save", async function (next) {
  if (this.isNew || this.isModified("name")) {
    // التحقق من وجود حلقة بنفس الاسم
    const existingGroup = await this.constructor.findOne({
      name: this.name,
      _id: { $ne: this._id },
    });

    if (existingGroup) {
      const error = new Error(
        `الحلقة "${this.name}" موجودة بالفعل. اسم الحلقة يجب أن يكون فريداً.`
      );
      error.code = "DUPLICATE_GROUP_NAME";
      return next(error);
    }
  }

  // التحقق من صحة معرف المعلم
  if (this.isNew || this.isModified("teacher")) {
    const Teacher = mongoose.model('Teacher');
    const teacherExists = await Teacher.findById(this.teacher);
    
    if (!teacherExists) {
      const error = new Error(
        `المعلم غير موجود. يرجى التحقق من معرف المعلم.`
      );
      error.code = "TEACHER_NOT_FOUND";
      return next(error);
    }
  }
  
  next();
});

const Group = mongoose.model("Group", groupSchema);

module.exports = Group;
