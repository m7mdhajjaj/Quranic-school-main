const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "عنوان النشاط مطلوب"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "وصف النشاط مطلوب"],
    },
    date: {
      type: String,
      required: [true, "تاريخ النشاط مطلوب"],
    },
    category: {
      type: String,
      default: "درس",
    },
    image: {
      type: String,
      default: "https://placehold.co/600x400/f3e8ff/6b21a8?text=صورة+نشاط",
    },
    imagePublicId: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

const Activity = mongoose.model("Activity", activitySchema);

module.exports = Activity;
