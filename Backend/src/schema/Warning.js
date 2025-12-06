const mongoose = require("mongoose");

const warningSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: true,
    },
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true,
    },
    // الحلقة الأصلية للطالب (قبل الفصل)
    originalGroup: {
      type: String, // اسم الحلقة
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
    // نوع الفصل - مؤقت أو دائم
    suspensionType: {
      type: String,
      enum: ["temporary", "permanent", "none"],
      default: "none", // "none" للتنبيهات فقط
    },
    // تفاصيل العقوبة حسب نوع الإنذار
    penalties: {
      suspensionDays: {
        type: Number,
        default: 0,
      },
      activitiesBanMonths: {
        type: Number,
        default: 0,
      },
      permanentActivitiesBan: {
        type: Boolean,
        default: false,
      },
      permanentExpulsion: {
        type: Boolean,
        default: false,
      },
    },
    // تاريخ بداية ونهاية العقوبة
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // تم إلغاء الفصل مبكراً؟
    cancelledEarly: {
      type: Boolean,
      default: false,
    },
    cancelledAt: {
      type: Date,
    },
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
  },
  {
    timestamps: true,
  }
);

// دالة لحساب العقوبة بناءً على نوع الإنذار
warningSchema.pre("save", function (next) {
  const startDate = new Date();

  switch (this.type) {
    case "warning":
      // تنبيه فقط - لا عقوبات
      this.suspensionType = "none";
      this.penalties = {
        suspensionDays: 0,
        activitiesBanMonths: 0,
        permanentActivitiesBan: false,
        permanentExpulsion: false,
      };
      break;

    case "first":
      // الإنذار الأول: فصل مؤقت لـ 3 ساعات
      this.suspensionType = "temporary";
      this.penalties = {
        suspensionDays: 0.125, // 3 ساعات = 3/24 يوم
        activitiesBanMonths: 0,
        permanentActivitiesBan: false,
        permanentExpulsion: false,
      };
      this.startDate = startDate;
      this.endDate = new Date(startDate.getTime() + 3 * 60 * 60 * 1000); // 3 ساعات
      break;

    case "second":
      // الإنذار الثاني: فصل مؤقت ليوم واحد
      this.suspensionType = "temporary";
      this.penalties = {
        suspensionDays: 1,
        activitiesBanMonths: 0,
        permanentActivitiesBan: false,
        permanentExpulsion: false,
      };
      this.startDate = startDate;
      this.endDate = new Date(startDate.getTime() + 1 * 24 * 60 * 60 * 1000); // يوم واحد
      break;

    case "third":
      // الإنذار الثالث: فصل مؤقت لأسبوعين (14 يوم)
      this.suspensionType = "temporary";
      this.penalties = {
        suspensionDays: 14,
        activitiesBanMonths: 0,
        permanentActivitiesBan: false,
        permanentExpulsion: false,
      };
      this.startDate = startDate;
      this.endDate = new Date(startDate.getTime() + 14 * 24 * 60 * 60 * 1000); // أسبوعين
      break;

    case "expulsion":
      // الإنذار الرابع: فصل دائم
      this.suspensionType = "permanent";
      this.penalties = {
        suspensionDays: 0,
        activitiesBanMonths: 0,
        permanentActivitiesBan: true,
        permanentExpulsion: true,
      };
      this.startDate = startDate;
      this.endDate = null; // فصل دائم - لا يوجد تاريخ انتهاء
      this.isActive = true; // دائماً نشط
      break;
  }

  next();
});

module.exports = mongoose.model("Warning", warningSchema);
