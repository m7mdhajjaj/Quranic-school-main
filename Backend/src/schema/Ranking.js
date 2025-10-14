const mongoose = require("mongoose");

const rankingSchema = new mongoose.Schema(
  {
    month: {
      type: Number,
      required: [true, "الشهر مطلوب"],
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      required: [true, "السنة مطلوبة"],
      min: 2020,
    },
    group: {
      type: String,
      required: [true, "اسم الحلقة مطلوب"],
      trim: true,
    },
    topThree: [
      {
        studentId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Student",
          required: [true, "معرف الطالب مطلوب"],
        },
        rank: {
          type: Number,
          required: [true, "الترتيب مطلوب"],
          min: 1,
          max: 3,
        },
        score: {
          type: Number,
          required: [true, "الدرجة مطلوبة"],
          min: 0,
          max: 100,
        },
      },
    ],
    topTen: [
      {
        studentId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Student",
          required: [true, "معرف الطالب مطلوب"],
        },
        rank: {
          type: Number,
          required: [true, "الترتيب مطلوب"],
          min: 1,
          max: 10,
        },
        score: {
          type: Number,
          required: [true, "الدرجة مطلوبة"],
          min: 0,
          max: 100,
        },
      },
    ],
  },
  { timestamps: true }
);

// Create a compound index for month, year, and group to ensure uniqueness per group
rankingSchema.index({ month: 1, year: 1, group: 1 }, { unique: true });

const Ranking = mongoose.model("Ranking", rankingSchema);

module.exports = Ranking;
