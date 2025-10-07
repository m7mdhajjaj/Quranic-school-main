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
      type: mongoose.Schema.Types.Mixed, // يدعم ObjectId أو String
      required: false, // اختياري لدعم البيانات القديمة
    },
    teacherName: {
      type: String,
      trim: true,
      // حقل مؤقت لدعم البيانات القديمة
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
      match: [/^[\u0600-\u06FF\s0-9:-]*$/, "صيغة الجدول غير صحيحة"],
      trim: true,
      maxlength: [100, "الجدول الزمني يجب ألا يتجاوز 100 حرف"],
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// إضافة فهرس مركب للتأكد من أن كل حلقة لها معلم واحد فقط
// هذا الفهرس يضمن عدم تكرار (اسم الحلقة + المعلم)
groupSchema.index({ name: 1, teacher: 1 }, { unique: true });

// middleware للتحقق من أن الحلقة لها معلم واحد فقط قبل الحفظ
groupSchema.pre("save", async function (next) {
  if (this.isNew || this.isModified("name") || this.isModified("teacher")) {
    // التحقق من وجود حلقة بنفس الاسم مع معلم مختلف
    const existingGroup = await this.constructor.findOne({
      name: this.name,
      teacher: { $ne: this.teacher, $exists: true, $ne: null, $ne: "" },
      _id: { $ne: this._id },
    });

    if (existingGroup) {
      const error = new Error(
        `الحلقة "${this.name}" مرتبطة بالفعل بمعلم آخر. لا يمكن للحلقة الواحدة أن يكون لها أكثر من معلم.`
      );
      error.code = "DUPLICATE_GROUP_TEACHER";
      return next(error);
    }
  }
  next();
});

const Group = mongoose.model("Group", groupSchema);

module.exports = Group;
