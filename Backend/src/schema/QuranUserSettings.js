// ============================================================================
// QuranUserSettings.js - Schema for User Reading Settings & Bookmarks
// ============================================================================

const mongoose = require("mongoose");

const quranUserSettingsSchema = new mongoose.Schema(
  {
    // المستخدم (يمكن أن يكون طالب أو معلم أو إداري)
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    userType: {
      type: String,
      enum: ["Student", "Teacher", "Admin"],
      required: true,
    },

    // إعدادات القراءة
    readingSettings: {
      fontSize: {
        type: Number,
        default: 18,
        min: 12,
        max: 40,
      },
      theme: {
        type: String,
        enum: ["light", "dark", "sepia"],
        default: "light",
      },
      ayahsPerPage: {
        type: Number,
        default: 10,
        min: 5,
        max: 50,
      },
    },

    // الإشارة المرجعية (آخر موضع قراءة)
    bookmark: {
      surahNumber: {
        type: Number,
        min: 1,
        max: 114,
      },
      ayahNumber: {
        type: Number,
        min: 1,
      },
      lastUpdated: {
        type: Date,
        default: Date.now,
      },
    },

    // إشارات مرجعية متعددة (للمستقبل)
    bookmarks: [
      {
        surahNumber: {
          type: Number,
          min: 1,
          max: 114,
        },
        ayahNumber: {
          type: Number,
          min: 1,
        },
        label: {
          type: String,
          maxlength: 100,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// فهرس مركب لضمان وجود سجل واحد لكل مستخدم
quranUserSettingsSchema.index({ userId: 1, userType: 1 }, { unique: true });

module.exports = mongoose.model("QuranUserSettings", quranUserSettingsSchema);
