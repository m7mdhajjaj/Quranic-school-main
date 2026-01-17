// ============================================================================
// NotificationDetails Schema - Sub-Schema للبيانات الكبيرة
// ============================================================================
// يستخدم لتخزين البيانات الثقيلة منفصلة عن الإشعار الرئيسي لتحسين الأداء

const mongoose = require("mongoose");

const notificationDetailsSchema = new mongoose.Schema(
  {
    // رسالة الإشعار (قد تكون طويلة)
    message: {
      type: String,
      required: [true, "نص الإشعار مطلوب"],
      trim: true,
      maxlength: [2000, "نص الإشعار لا يمكن أن يزيد عن 2000 حرف"],
    },

    // البيانات الإضافية المرتبطة بالإشعار
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    // رابط الإشعار (اختياري)
    link: {
      type: String,
      trim: true,
    },

    // بيانات إضافية للعرض (أيقونة، لون، إلخ)
    displayData: {
      icon: String,
      color: String,
      image: String,
      actionText: String,
      actionUrl: String,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// فهرس للبحث السريع
notificationDetailsSchema.index({ createdAt: -1 });

const NotificationDetails = mongoose.model(
  "NotificationDetails",
  notificationDetailsSchema
);

module.exports = NotificationDetails;
