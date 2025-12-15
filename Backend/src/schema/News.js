const mongoose = require("mongoose");

const newsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "عنوان الخبر مطلوب"],
      trim: true,
      minlength: [3, "العنوان يجب أن يكون 3 أحرف على الأقل"],
      maxlength: [200, "العنوان لا يجب أن يتجاوز 200 حرف"],
    },
    content: {
      type: String,
      required: [true, "محتوى الخبر مطلوب"],
      minlength: [3, "المحتوى يجب أن يكون 3 أحرف على الأقل"],
    },
    description: {
      type: String,
      default: null,
      maxlength: [500, "الوصف لا يجب أن يتجاوز 500 حرف"],
    },
    images: [
      {
        url: {
          type: String,
          required: true,
        },
        publicId: {
          type: String,
          required: true,
        },
      },
    ],
    // Keep old fields for backward compatibility
    image: {
      type: String,
      default: null,
    },
    imagePublicId: {
      type: String,
      default: null,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "الكاتب مطلوب"],
      refPath: 'authorModel'
    },
    authorModel: {
      type: String,
      required: true,
      enum: ['Teacher', 'Admin'] // الطلاب لا يمكنهم نشر خبر
    },
    // News visibility type
    visibility: {
      type: String,
      enum: ['general', 'group'],
      default: 'group',
      required: true,
    },
    views: {
      type: Number,
      default: 0,
      min: 0,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    publishedAt: {
      type: Date,
      default: null,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    archivedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Index for better query performance
newsSchema.index({ title: "text", content: "text" });
newsSchema.index({ isPublished: 1, createdAt: -1 });
newsSchema.index({ isArchived: 1 });
newsSchema.index({ visibility: 1 });

const News = mongoose.model("News", newsSchema);

module.exports = News;

