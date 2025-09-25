const mongoose = require("mongoose");

const examSchema = new mongoose.Schema({
  name: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  result: { type: String },
});

module.exports = mongoose.model("Exam", examSchema);
