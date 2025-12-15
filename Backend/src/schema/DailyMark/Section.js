const mongoose = require("mongoose");

const sectionSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: [true, "تاريخ المقطع مطلوب"],
      default: Date.now,
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
      required: false, // Optional for backward compatibility
      index: true, // Index for faster queries
    },
    teacher: {
      type: String,
      required: false, // Optional for backward compatibility
    },
    marksStatus: {
      type: String,
      enum: ["completed", "in_progress", "not_started"],
      default: "not_started",
      index: true, // Index for faster queries
    },
    marksProgress: {
      totalStudents: {
        type: Number,
        default: 0,
      },
      studentsWithMarks: {
        type: Number,
        default: 0,
      },
      percentage: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
    },
  },
  { timestamps: true }
);

const Section = mongoose.model("Section", sectionSchema);

module.exports = Section;
