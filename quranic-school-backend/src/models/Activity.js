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
      required: [true, "تصنيف النشاط مطلوب"],
      enum: ["درس", "رحلة", "مسابقة", "محاضرة", "فعالية"],
      default: "درس",
    },
    image: {
      type: String,
      default: "https://placehold.co/600x400/e9f5f2/1f6357?text=صورة+نشاط",
    },
  },
  { timestamps: true }
);

const Activity = mongoose.model("Activity", activitySchema);

module.exports = Activity;
