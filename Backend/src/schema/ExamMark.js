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

// يضمن أن الطالب ما ياخذش أكثر من علامة لنفس الامتحان
examMarkSchema.index({ exam: 1, student: 1 }, { unique: true });

module.exports = mongoose.model("ExamMark", examMarkSchema);
