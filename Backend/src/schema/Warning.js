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
    type: {
      type: String,
      enum: ["warning", "first", "second", "third", "expulsion"],
      required: true,
    },
    reason: {
      type: String,
      required: true,
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
      this.penalties = {
        suspensionDays: 0,
        activitiesBanMonths: 0,
        permanentActivitiesBan: false,
        permanentExpulsion: false,
      };
      break;

    case "first":
      // الإنذار الأول: فصل ليوم واحد
      this.penalties = {
        suspensionDays: 1,
        activitiesBanMonths: 0,
        permanentActivitiesBan: false,
        permanentExpulsion: false,
      };
      this.startDate = startDate;
      this.endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000); // يوم واحد
      break;

    case "second":
      // الإنذار الثاني: فصل لأسبوع + حرمان من الأنشطة لشهر
      this.penalties = {
        suspensionDays: 7,
        activitiesBanMonths: 1,
        permanentActivitiesBan: false,
        permanentExpulsion: false,
      };
      this.startDate = startDate;
      this.endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000); // أسبوع
      break;

    case "third":
      // الإنذار الثالث: فصل لأسبوع + حرمان نهائي من الأنشطة
      this.penalties = {
        suspensionDays: 7,
        activitiesBanMonths: 0,
        permanentActivitiesBan: true,
        permanentExpulsion: false,
      };
      this.startDate = startDate;
      this.endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000); // أسبوع
      break;

    case "expulsion":
      // فصل نهائي
      this.penalties = {
        suspensionDays: 0,
        activitiesBanMonths: 0,
        permanentActivitiesBan: true,
        permanentExpulsion: true,
      };
      this.startDate = startDate;
      this.endDate = null; // فصل دائم
      break;
  }

  next();
});

module.exports = mongoose.model("Warning", warningSchema);
