const mongoose = require("mongoose");

const examMarkSchema = new mongoose.Schema({
  exam: { type: mongoose.Schema.Types.ObjectId, ref: "Exam", required: true },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },
  mark: { type: String, required: true },
  detail: { type: String },
});

module.exports = mongoose.model("ExamMark", examMarkSchema);
