const mongoose = require("mongoose");

const markSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: [true, "معرف الطالب مطلوب"],
    },
    sectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Section",
      required: [true, "معرف المقطع مطلوب"],
    },
    reviewMark: {
      type: Number,
      min: [0, "علامة المراجعة يجب أن تكون على الأقل 0"],
      max: [10, "علامة المراجعة يجب أن تكون على الأكثر 10"],
      default: null,
    },
    memorizationMark: {
      type: Number,
      min: [0, "علامة الحفظ يجب أن تكون على الأقل 0"],
      max: [10, "علامة الحفظ يجب أن تكون على الأكثر 10"],
      default: null,
    },
  },
  { timestamps: true }
);

// Ensure each student has only one mark per section (unique index)
markSchema.index({ studentId: 1, sectionId: 1 }, { unique: true });

// ⚡ Performance indexes for optimized queries
markSchema.index({ studentId: 1, createdAt: -1 }); // للبحث حسب الطالب مع الترتيب
markSchema.index({ sectionId: 1 }); // للبحث حسب Section

const Mark = mongoose.model("Mark", markSchema);

module.exports = Mark;
