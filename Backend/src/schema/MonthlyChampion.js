// schema/MonthlyChampion.js
const mongoose = require("mongoose");

const monthlyChampionSchema = new mongoose.Schema(
  {
    // معلومات الطالب
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    studentName: {
      type: String,
      required: true,
    },

    // معلومات الشهر
    month: {
      type: Number, // 1-12
      required: true,
    },
    year: {
      type: Number, // 2025
      required: true,
    },
    monthName: {
      type: String, // "يناير", "فبراير", إلخ
      required: true,
    },

    // النقاط
    totalPoints: {
      type: Number,
      required: true,
      default: 0,
    },

    // معلومات المعلم والحلقة (للفلترة)
    teacher: {
      type: String, // اسم المعلم (نص)
      required: true,
    },
    group: {
      type: String,
      required: true,
    },

    // الترتيب
    rank: {
      type: Number,
      default: 1,
    },

    // شارة البطولة (معلومات إضافية)
    badgeData: {
      icon: { type: String, default: "👑" },
      description: String,
      awardedAt: { type: Date, default: Date.now },
    },
  },
  {
    timestamps: true,
  }
);

// Index للبحث السريع
monthlyChampionSchema.index({ year: 1, month: 1, group: 1 });
monthlyChampionSchema.index(
  { studentId: 1, year: 1, month: 1 },
  { unique: true }
);
monthlyChampionSchema.index({ teacher: 1, group: 1, year: 1, month: 1 });

module.exports = mongoose.model("MonthlyChampion", monthlyChampionSchema);
