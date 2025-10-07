const mongoose = require("mongoose");

const SessionSchema = new mongoose.Schema({
  day: { type: String, required: true },
  startHour: { type: String, required: true },
  endHour: { type: String, required: true },
  note: { type: String },
});

module.exports = mongoose.model("Session", SessionSchema);
