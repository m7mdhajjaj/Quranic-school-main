const mongoose = require("mongoose");

const newsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "عنوان الخبر مطلوب"],
      trim: true,
    },
    content: {
      type: String,
      required: [true, "محتوى الخبر مطلوب"],
    },
    date: {
      type: String,
      default: () => new Date().toLocaleDateString("ar-SA"),
    },
    image: {
      type: String,
      default: "https://placehold.co/600x400/e9f5f2/1f6357?text=صورة+خبر",
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

const News = mongoose.model("News", newsSchema);

module.exports = News;
