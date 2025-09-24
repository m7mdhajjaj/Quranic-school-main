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
        "general",
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
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    isSystemNotification: {
      type: Boolean,
      default: false,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    readAt: {
      type: Date,
    },
    expiresAt: {
      type: Date,
      // الإشعارات تنتهي صلاحيتها بعد 30 يوم افتراضياً
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// إنشاء فهارس للاستعلامات السريعة
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

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
