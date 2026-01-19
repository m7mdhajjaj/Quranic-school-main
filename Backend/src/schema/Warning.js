const mongoose = require("mongoose");

const warningSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true,
    },

    // الربط الحالي (قد يصبح null لاحقاً)
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: true,
      index: true,
    },
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true,
      index: true,
    },

    // 🔐 Snapshot ثابت
    teacherName: {
      type: String,
      required: true,
    },
    groupName: {
      type: String,
      required: true,
    },

    // الحلقة الأصلية للطالب (قبل الفصل)
    originalGroup: {
      type: String,
      required: false,
    },

    type: {
      type: String,
      enum: ["warning", "first", "second", "third", "expulsion"],
      required: true,
    },

    reason: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["active", "student_removed", "inactive"], // أضفنا inactive
      default: "active",
    },
  },
  { timestamps: true }
);

// Indexes for performance
warningSchema.index({ studentId: 1, type: 1 });
warningSchema.index({ groupId: 1, createdAt: -1 });
warningSchema.index({ teacherId: 1, createdAt: -1 });
// ✅ NEW: فهارس إضافية للأداء
warningSchema.index({ studentId: 1, status: 1 }); // للبحث عن الإنذارات النشطة
warningSchema.index({ originalGroup: 1, type: 1, status: 1 }); // للبحث عن المفصولين من حلقة
warningSchema.index({ status: 1, type: 1 }); // للـ WarningJob

module.exports = mongoose.model("Warning", warningSchema);
