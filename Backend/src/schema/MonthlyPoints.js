// schema/MonthlyPoints.js
const mongoose = require("mongoose");

const monthlyPointsSchema = new mongoose.Schema(
  {
    // معلومات الطالب
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },

    // الشهر والسنة الحالية
    month: {
      type: Number, // 1-12
      required: true,
    },
    year: {
      type: Number, // 2025
      required: true,
    },

    // النقاط المتراكمة هذا الشهر
    totalPoints: {
      type: Number,
      default: 0,
    },

    // عدد الأيام النشطة
    activeDays: {
      type: Number,
      default: 0,
    },

    // معلومات المعلم والحلقة
    teacher: {
      type: String, // اسم المعلم (نص)
    },
    group: {
      type: String,
    },

    // آخر تحديث
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index فريد لكل طالب/شهر/سنة
monthlyPointsSchema.index(
  { studentId: 1, year: 1, month: 1 },
  { unique: true }
);
monthlyPointsSchema.index({ year: 1, month: 1, group: 1 });
monthlyPointsSchema.index({ teacher: 1, group: 1, year: 1, month: 1 });

// Pre-save middleware لتحديث lastUpdated
monthlyPointsSchema.pre("save", function (next) {
  this.lastUpdated = new Date();
  next();
});

module.exports = mongoose.model("MonthlyPoints", monthlyPointsSchema);
