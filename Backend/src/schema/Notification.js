const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "المستلم مطلوب"],
      refPath: "recipientModel",
    },
    recipientModel: {
      type: String,
      required: [true, "نوع المستلم مطلوب"],
      enum: ["Student", "Teacher", "User"],
    },
    type: {
      type: String,
      required: [true, "نوع الإشعار مطلوب"],
      enum: [
        "grade",
        "message",
        "prayer_time",
        "activity",
        "attendance",
        "exam",
        "news",
        "general",
        // "assignment",
        "daily_marks",
      ],
    },
    title: {
      type: String,
      required: [true, "عنوان الإشعار مطلوب"],
      trim: true,
      maxlength: [100, "عنوان الإشعار لا يمكن أن يزيد عن 100 حرف"],
    },
    message: {
      type: String,
      required: [true, "نص الإشعار مطلوب"],
      trim: true,
      maxlength: [500, "نص الإشعار لا يمكن أن يزيد عن 500 حرف"],
    },
    data: {
      type: Object,
      default: {},
      /**
       * استخدم data.action للتمييز بين العمليات المختلفة:
       * 
       * للمقاطع: 
       * - { action: "section_added", sectionId: "...", memorizationSection: "البقرة 1-10" }
       * - { action: "section_updated", sectionId: "...", oldSection: {...}, newSection: {...} }
       * - { action: "section_deleted", sectionId: "...", deletedSection: {...} }
       * 
       * للعلامات:
       * - { action: "mark_added", studentId: "...", totalMark: 95, reviewMark: 45 }
       * - { action: "mark_updated", studentId: "...", oldMark: 85, newMark: 95 }
       * - { action: "mark_deleted", studentId: "...", deletedMark: 85 }
       * 
       * مثال كامل:
       * {
       *   type: "daily_marks",
       *   title: "📚 مقطع جديد", 
       *   message: "تم إضافة مقطع جديد: البقرة 1-10",
       *   data: {
       *     action: "section_added",
       *     sectionId: "648a1b2c3d4e5f6789012345",
       *     memorizationSection: "البقرة 1-10",
       *     reviewSection: "البقرة 11-20",
       *     group: "الحلقة الأولى"
       *   }
       * }
       */
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    sentAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
    readAt: {
      type: Date,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// إنشاء فهارس للاستعلامات السريعة
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ type: 1 });

// Virtual للحصول على عمر الإشعار
notificationSchema.virtual("age").get(function () {
  return Date.now() - this.createdAt.getTime();
});

// Virtual لمعرفة إذا كان الإشعار جديد (أقل من 5 دقائق)
notificationSchema.virtual("isNew").get(function () {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  return this.createdAt > fiveMinutesAgo;
});

// إضافة middleware لتحديث readAt تلقائياً
notificationSchema.pre("findOneAndUpdate", function () {
  const update = this.getUpdate();
  if (update.$set && update.$set.isRead === true && !update.$set.readAt) {
    update.$set.readAt = new Date();
  }
});

// Static method لإنشاء إشعار سريع
notificationSchema.statics.createQuick = async function (
  recipientId,
  recipientModel,
  type,
  title,
  message,
  data = {},
) {
  return this.create({
    recipient: recipientId,
    recipientModel: recipientModel,
    type: type,
    title: title,
    message: message,
    data: data,
  });
};

// Static method للحصول على عدد الإشعارات غير المقروءة
notificationSchema.statics.getUnreadCount = async function (recipientId) {
  return this.countDocuments({
    recipient: recipientId,
    isRead: false,
  });
};

// Instance method لتحديد الإشعار كمقروء
notificationSchema.methods.markAsRead = function () {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = Notification;
