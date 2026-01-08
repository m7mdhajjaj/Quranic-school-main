// const mongoose = require("mongoose");

// const sectionSchema = new mongoose.Schema(
//   {
//     date: {
//       type: Date,
//       required: [true, "تاريخ المقطع مطلوب"],
//       default: Date.now,
//     },
//     reviewSection: {
//       type: String,
//       required: [true, "مقطع المراجعة مطلوب"],
//     },
//     memorizationSection: {
//       type: String,
//       required: [true, "مقطع الحفظ مطلوب"],
//     },
//     group: {
//       type: String,
//       required: false, // Optional for backward compatibility
//       index: true, // Index for faster queries
//     },
//     teacher: {
//       type: String,
//       required: false, // Optional for backward compatibility
//     },
//     marksStatus: {
//       type: String,
//       enum: ["completed", "in_progress", "not_started"],
//       default: "not_started",
//       index: true, // Index for faster queries
//     },
//     marksProgress: {
//       totalStudents: {
//         type: Number,
//         default: 0,
//       },
//       studentsWithMarks: {
//         type: Number,
//         default: 0,
//       },
//       percentage: {
//         type: Number,
//         default: 0,
//         min: 0,
//         max: 100,
//       },
//     },
//   },
//   { timestamps: true }
// );

// const Section = mongoose.model("Section", sectionSchema);

// module.exports = Section;

const mongoose = require("mongoose");

const sectionSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: [true, "تاريخ المقطع مطلوب"],
      default: Date.now,
      index: true, // ✅ مفيد للفلترة حسب التاريخ
    },
    reviewSection: {
      type: String,
      required: [true, "مقطع المراجعة مطلوب"],
    },
    memorizationSection: {
      type: String,
      required: [true, "مقطع الحفظ مطلوب"],
    },

    group: {
      type: String,
      required: false,
      index: true,
    },
    teacher: {
      type: String,
      required: false,
    },

    marksStatus: {
      type: String,
      enum: ["completed", "in_progress", "not_started"],
      default: "not_started",
      index: true,
    },
    marksProgress: {
      totalStudents: { type: Number, default: 0 },
      studentsWithMarks: { type: Number, default: 0 },
      percentage: { type: Number, default: 0, min: 0, max: 100 },
    },

    // =========================
    // ✅ إضافات مطلوبة للموعد
    // =========================

    hasSchedule: {
      type: Boolean,
      default: false,
      index: true,
    },

    scheduleStatus: {
      type: String,
      enum: ["scheduled", "needs_schedule"],
      default: "needs_schedule",
      index: true,
    },

    timetableId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TimeTable",
      required: false,
      index: true,
    },
  },
  { timestamps: true }
);

// ✅ عند حذف Section: احذف TimeTable المرتبط تلقائيًا
sectionSchema.pre("findOneAndDelete", async function (next) {
  const section = await this.model.findOne(this.getFilter());
  if (section?.timetableId) {
    await mongoose.model("TimeTable").findByIdAndDelete(section.timetableId);
  }
  next();
});

const Section = mongoose.model("Section", sectionSchema);
module.exports = Section;

