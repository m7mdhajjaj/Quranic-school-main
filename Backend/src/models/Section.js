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
    // إضافة حقل الحلقة لربط المقطع بحلقة معينة
    group: {
      type: String,
      required: [true, "اسم الحلقة مطلوب"],
    },
    // إضافة حقل المعلم للتأكد من أن المعلم ينشئ مقاطع لحلقته فقط
    teacher: {
      type: String,
      required: [true, "اسم المعلم مطلوب"],
    },
  },
  { timestamps: true }
);

const Section = mongoose.model("Section", sectionSchema);

module.exports = Section;
