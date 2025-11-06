// schema/StudentBadge.js
const mongoose = require("mongoose");

const studentBadgeSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },

    // تقدم الطالب نحو الشارات
    badgeProgress: {
      mosquePrayerStreak: { type: Number, default: 0 }, // سلسلة الصلاة في المسجد
      adhkarStreak: { type: Number, default: 0 }, // سلسلة الأذكار
      parentRespectPerfect: { type: Number, default: 0 }, // عدد مرات 10/10
      schoolAttendanceStreak: { type: Number, default: 0 }, // سلسلة الحضور (ليوم متتالي)
      overallStreak: { type: Number, default: 0 }, // سلسلة المشاركة (15 يوم متتالي)
      sunanStreak: { type: Number, default: 0 }, // سلسلة السنن
      mosqueTwoPrayersWeek: { type: Number, default: 0 }, // أسابيع صلاتين

      // إضافة جديدة: حضور المدرسة الشهري
      monthlySchoolAttendance: {
        month: { type: String, default: "" }, // مثلاً: "2025-11"
        daysPresent: { type: Number, default: 0 }, // عدد أيام الحضور في هذا الشهر
        lastAttendanceDate: { type: String, default: null }, // آخر تاريخ حضور (لتجنب التكرار)
      },

      // تاريخ آخر مشاركة لحساب التتالي
      lastParticipationDate: { type: Date, default: null },
      
      // تواريخ آخر تحديث لكل شارة (لمنع التكرار في نفس اليوم)
      lastUpdate: {
        mosquePrayer: { type: String, default: null },
        adhkar: { type: String, default: null },
        parentRespect: { type: String, default: null },
        sunan: { type: String, default: null },
        mosqueTwoPrayers: { type: String, default: null },
      },
    },

    // الشارات المكتسبة
    earnedBadges: [
      {
        badgeId: {
          type: String,
          required: true,
          enum: [
            "mosque_30_days",
            "adhkar_7_days",
            "parent_respect_5_times",
            "school_30_days",
            "overall_15_days",
            "sunan_keeper",
            "mosque_two_week",
            "all_badges",
          ],
        },
        name: { type: String, required: true },
        icon: { type: String, required: true },
        description: { type: String, required: true },
        requirement: { type: String, required: true },
        count: { type: Number, default: 1, min: 1 }, // عدد المرات المكتسبة
        firstEarnedAt: { type: Date, default: Date.now }, // أول مرة حصل عليها
        lastEarnedAt: { type: Date, default: Date.now }, // آخر مرة حصل عليها
      },
    ],

    // مجموع تكرارات جميع الشارات (للترتيب)
    totalBadgeRepeats: {
      type: Number,
      default: 0,
    },

    // آخر تحديث
    lastUpdated: {
      type: Date,
      default: Date.now,
    },

    // الحلقة
    group: {
      type: String,
      required: true,
    },

    // المعلم
    teacher: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

// فهرس فريد لكل طالب
studentBadgeSchema.index({ studentId: 1 }, { unique: true });

// فهرس للحلقة (للترتيب)
studentBadgeSchema.index({ group: 1, totalBadgeRepeats: -1 });
studentBadgeSchema.index({ teacher: 1, group: 1, totalBadgeRepeats: -1 });

// دالة لحساب مجموع التكرارات قبل الحفظ
studentBadgeSchema.pre("save", function (next) {
  this.totalBadgeRepeats = this.earnedBadges.reduce(
    (sum, badge) => sum + badge.count,
    0
  );
  this.lastUpdated = Date.now();
  next();
});

module.exports = mongoose.model("StudentBadge", studentBadgeSchema);
