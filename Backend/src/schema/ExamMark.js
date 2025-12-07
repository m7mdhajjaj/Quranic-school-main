const mongoose = require("mongoose");

const examMarkSchema = new mongoose.Schema({
  exam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ExamSchedule",
    required: true,
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },
  mark: {
    type: Number,
    required: true,
  },
  detail: {
    type: String,
    default: "",
  },
}, {
  timestamps: true
});

// Index for faster queries
examMarkSchema.index({ exam: 1, student: 1 }, { unique: true });

module.exports = mongoose.model("ExamMark", examMarkSchema);
