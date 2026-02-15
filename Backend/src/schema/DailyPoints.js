// schema/DailyPoints.js
const mongoose = require("mongoose");

const dailyPointsSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },

    // الصلوات الفروض
    prayers: {
      fajr: {
        type: String,
        enum: ["mosque", "home", "late", "missed"],
        default: "missed",
      },
      dhuhr: {
        type: String,
        enum: ["mosque", "home", "late", "missed"],
        default: "missed",
      },
      asr: {
        type: String,
        enum: ["mosque", "home", "late", "missed"],
        default: "missed",
      },
      maghrib: {
        type: String,
        enum: ["mosque", "home", "late", "missed"],
        default: "missed",
      },
      isha: {
        type: String,
        enum: ["mosque", "home", "late", "missed"],
        default: "missed",
      },
    },

    // النوافل
    nawafel: {
      duha: { type: Boolean, default: false },
      qiyamAlayl: { type: Boolean, default: false },
      rawatib: { type: Boolean, default: false },
      witr: { type: Boolean, default: false },
    },

    // بر الوالدين (0-10)
    parentRespect: {
      type: Number,
      min: 0,
      max: 10,
      default: 5,
    },

    // الحضور للمدرسة
    schoolAttendance: {
      type: Boolean,
      default: false,
    },

    // ساعات الدراسة اليومية
    dailyStudy: {
      type: Number,
      min: 0,
      default: 0,
    },

    // الأذكار
    adhkar: {
      morning: { type: Boolean, default: false },
      evening: { type: Boolean, default: false },
      sleep: { type: Boolean, default: false },
      afterPrayer: { type: Boolean, default: false },
    },

    // الحلقة (بالدقائق)
    halaqah: {
      memorizedMinutes: { type: Number, min: 0, default: 0 },
      reviewedMinutes: { type: Number, min: 0, default: 0 },
    },

    // أنشطة رمضان
    ramadan: {
      taraweehRakaat: { type: Number, min: 0, max: 20, default: 0 },
      quranPages: { type: Number, min: 0, default: 0 },
      fpiasting: { type: Boolean, default: false },
    },

    // إجمالي النقاط المحسوبة
    totalPoints: {
      type: Number,
      default: 0,
    },

    // الحلقة التي ينتمي لها الطالب
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
  { timestamps: true },
);

// فهرس مركب لضمان عدم تكرار السجل لنفس الطالب في نفس اليوم
dailyPointsSchema.index({ studentId: 1, date: 1 }, { unique: true });

// فهرس للحلقة والتاريخ لتسريع عمليات الترتيب
dailyPointsSchema.index({ group: 1, date: -1 });
dailyPointsSchema.index({ teacher: 1, group: 1, date: -1 });

// دالة لحساب النقاط تلقائياً قبل الحفظ
dailyPointsSchema.pre("save", function (next) {
  let total = 0;

  // حساب نقاط الصلوات
  const prayerPoints = {
    mosque: 12,
    home: 5,
    late: 2,
    missed: 0,
  };

  Object.values(this.prayers).forEach((status) => {
    total += prayerPoints[status] || 0;
  });

  // نقاط النوافل
  if (this.nawafel.duha) total += 5;
  if (this.nawafel.qiyamAlayl) total += 10;
  if (this.nawafel.rawatib) total += 5;
  if (this.nawafel.witr) total += 5;

  // نقاط بر الوالدين
  total += this.parentRespect;

  // نقاط المدرسة
  if (this.schoolAttendance) total += 5;

  // نقاط الدراسة (كل ساعة = نقطتان)
  total += this.dailyStudy * 2;

  // نقاط الأذكار
  if (this.adhkar.morning) total += 5;
  if (this.adhkar.evening) total += 5;
  if (this.adhkar.sleep) total += 3;
  if (this.adhkar.afterPrayer) total += 5;

  // نقاط الحلقة (كل 10 دقائق = نقطة)
  total += Math.floor(this.halaqah.memorizedMinutes / 10) * 1;
  total += Math.floor(this.halaqah.reviewedMinutes / 10) * 1;

  // نقاط رمضان
  if (this.ramadan) {
    // كل ركعة تراويح = نقطة
    total += (this.ramadan.taraweehRakaat || 0) * 1;
    // كل صفحة قرآن = نقطة
    total += (this.ramadan.quranPages || 0) * 1;
    // الصيام = 5 نقاط
    if (this.ramadan.fpiasting) total += 5;
  }

  this.totalPoints = total;
  next();
});

module.exports = mongoose.model("DailyPoints", dailyPointsSchema);
