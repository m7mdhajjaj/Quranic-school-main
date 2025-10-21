const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    isPresent: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Create a compound index on studentId and date to prevent duplicate records
attendanceSchema.index({ studentId: 1, date: 1 }, { unique: true });

// ⚡ Performance indexes for optimized queries
attendanceSchema.index({ studentId: 1, isPresent: 1 }); // لجلب الغيابات بسرعة
attendanceSchema.index({ date: -1 }); // للبحث حسب التاريخ
attendanceSchema.index({ studentId: 1, date: -1 }); // للبحث المركب

console.log(
  "✅ Attendance schema indexes created for performance optimization"
);

module.exports = mongoose.model("Attendance", attendanceSchema);
