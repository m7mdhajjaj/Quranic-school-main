const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "اسم الحلقة مطلوب"],
      unique: true,
      trim: true,
    },
    teacher: {
      type: String,
      required: [true, "اسم المعلم مطلوب"],
    },
    description: {
      type: String,
      required: false,
    },
    level: {
      type: String,
      required: false,
      enum: ["مبتدئ", "متوسط", "متقدم"],
    },
    capacity: {
      type: Number,
      required: false,
      min: [1, "السعة يجب أن تكون على الأقل 1"],
    },
    schedule: {
      type: String,
      required: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Group = mongoose.model("Group", groupSchema);

module.exports = Group;
