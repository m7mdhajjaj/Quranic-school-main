const mongoose = require("mongoose");

const examSchema = new mongoose.Schema({
  name: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  result: { type: String },
  group: { type: String }, // اسم الحلقة التي ينتمي لها الامتحان
});

module.exports = mongoose.model("Exam", examSchema);
