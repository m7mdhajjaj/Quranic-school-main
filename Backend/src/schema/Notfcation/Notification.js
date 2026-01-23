const mongoose = require("mongoose");

// ============================================================================
// أنواع الإشعارات المدعومة - مُصنّفة حسب الفئة
// ============================================================================

const NOTIFICATION_TYPES = {
  // إشعارات عامة
  GENERAL: ["general", "system", "success", "alert", "warning", "message", "mention", "news", "chat", "reminder"],
  
  // إشعارات الطلاب والمعلمين
  ACADEMIC: ["grade", "daily_marks", "exam", "exam_scheduled", "mark_added", "attendance", "quran_progress", "memorization", "review", "test_result", "student_update", "timetable"],
  
  // إشعارات الإدارة
  ADMIN: [
    "teacher_added", "teacher_updated", "teacher_deleted",
    "student_added", "student_updated", "student_deleted",
    "group_assigned", "group_updated", "group_deleted", "group_transferred",
    "secretary_added", "secretary_updated", "secretary_deleted",
    "admin_action", "user_approval", "role_change", "system_update",
  ],
  
  // إشعارات أخرى
  OTHER: ["prayer_time", "goal", "achievement", "points", "ranking", "other"],
};

// جمع كل الأنواع في مصفوفة واحدة
const ALL_NOTIFICATION_TYPES = [
  ...NOTIFICATION_TYPES.GENERAL,
  ...NOTIFICATION_TYPES.ACADEMIC,
  ...NOTIFICATION_TYPES.ADMIN,
  ...NOTIFICATION_TYPES.OTHER,
];

// ============================================================================
// Sub-Schema للبيانات المختصرة (تُعرض في القائمة)
// ============================================================================
const notificationSummarySchema = new mongoose.Schema(
  {
    action: {
      type: String,
      trim: true,
    },
    entityType: {
      type: String,
      enum: ["student", "teacher", "group", "section", "mark", "exam", "exam_mark", "news", "timetable", "other"],
    },
    entityId: mongoose.Schema.Types.ObjectId,
    entityName: String,
  },
  { _id: false }
);

// ============================================================================
// Main Notification Schema - البيانات الأساسية فقط
// ============================================================================
const notificationSchema = new mongoose.Schema(
  {
    // المستلم
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "المستلم مطلوب"],
      refPath: "recipientModel",
      index: true,
    },
    recipientModel: {
      type: String,
      required: [true, "نوع المستلم مطلوب"],
      enum: ["Student", "Teacher", "Admin", "Secretary", "TeacherAssistant"],
    },

    // نوع الإشعار
    type: {
      type: String,
      required: [true, "نوع الإشعار مطلوب"],
      enum: ALL_NOTIFICATION_TYPES,
      index: true,
    },

    // الفئة (للتصفية السريعة)
    category: {
      type: String,
      enum: ["general", "academic", "admin", "other"],
      default: "general",
      index: true,
    },

    // العنوان (قصير للعرض السريع)
    title: {
      type: String,
      required: [true, "عنوان الإشعار مطلوب"],
      trim: true,
      maxlength: [100, "عنوان الإشعار لا يمكن أن يزيد عن 100 حرف"],
    },

    // ملخص الرسالة (قصير للعرض في القائمة)
    messageSummary: {
      type: String,
      trim: true,
      maxlength: [150, "ملخص الرسالة لا يمكن أن يزيد عن 150 حرف"],
    },

    // الرسالة الكاملة (للإشعارات البسيطة)
    message: {
      type: String,
      trim: true,
      maxlength: [500, "نص الإشعار لا يمكن أن يزيد عن 500 حرف"],
    },

    // الأولوية
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },

    // بيانات مختصرة للعرض السريع
    summary: notificationSummarySchema,

    // مرجع للتفاصيل الكاملة (Sub-Schema)
    details: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NotificationDetails",
    },

    // بيانات سريعة (للتوافقية مع الكود الحالي)
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    // رابط سريع
    link: {
      type: String,
      trim: true,
    },

    // حالة القراءة
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },

    // التواريخ
    sentAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
    readAt: {
      type: Date,
    },

    // TTL - حذف تلقائي بعد 90 يوم
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      index: { expireAfterSeconds: 0 },
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ============================================================================
// الفهارس المُحسّنة للأداء العالي
// ============================================================================

// فهرس مركب للاستعلامات الأكثر شيوعاً
notificationSchema.index({ recipient: 1, isRead: 1, sentAt: -1 });
notificationSchema.index({ recipient: 1, category: 1, sentAt: -1 });
notificationSchema.index({ recipient: 1, type: 1, sentAt: -1 });

// فهرس للتصفح (Pagination)
notificationSchema.index({ recipient: 1, sentAt: -1 });

// فهرس للبحث النصي
notificationSchema.index({ title: "text", messageSummary: "text" });

// Virtual للحصول على عمر الإشعار
notificationSchema.virtual("age").get(function () {
  if (!this.createdAt) return 0;
  return Date.now() - this.createdAt.getTime();
});

// Virtual لمعرفة إذا كان الإشعار جديد (أقل من 5 دقائق)
notificationSchema.virtual("isNew").get(function () {
  if (!this.createdAt) return false;
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
  // تحديد الفئة تلقائياً
  let category = "general";
  if (NOTIFICATION_TYPES.ACADEMIC.includes(type)) category = "academic";
  else if (NOTIFICATION_TYPES.ADMIN.includes(type)) category = "admin";
  else if (NOTIFICATION_TYPES.OTHER.includes(type)) category = "other";

  return this.create({
    recipient: recipientId,
    recipientModel: recipientModel,
    type: type,
    category: category,
    title: title,
    message: message,
    messageSummary: message.length > 150 ? message.substring(0, 147) + "..." : message,
    data: data,
  });
};

// Static method لإنشاء إشعار مع تفاصيل منفصلة
notificationSchema.statics.createWithDetails = async function (
  recipientId,
  recipientModel,
  type,
  title,
  message,
  detailedData = {},
  summaryData = {}
) {
  const NotificationDetails = require("./NotificationDetails");
  
  // تحديد الفئة تلقائياً
  let category = "general";
  if (NOTIFICATION_TYPES.ACADEMIC.includes(type)) category = "academic";
  else if (NOTIFICATION_TYPES.ADMIN.includes(type)) category = "admin";
  else if (NOTIFICATION_TYPES.OTHER.includes(type)) category = "other";

  // إنشاء التفاصيل أولاً
  const details = await NotificationDetails.create({
    message: message,
    data: detailedData,
    link: detailedData.link,
    displayData: detailedData.displayData || {},
  });

  // إنشاء الإشعار الرئيسي
  return this.create({
    recipient: recipientId,
    recipientModel: recipientModel,
    type: type,
    category: category,
    title: title,
    messageSummary: message.length > 150 ? message.substring(0, 147) + "..." : message,
    details: details._id,
    summary: summaryData,
    data: { action: detailedData.action }, // فقط الـ action للتوافقية
  });
};

// Static method للحصول على إشعارات خفيفة (للقائمة) - محسّن للأعداد الكبيرة
notificationSchema.statics.getLightweight = async function (
  recipientId,
  page = 1,
  limit = 20,
  filters = {}
) {
  const skip = (page - 1) * limit;
  const query = { recipient: recipientId, ...filters };

  // استخدام Promise.all للاستعلامات المتوازية
  const [notifications, totalCount, unreadCount] = await Promise.all([
    // جلب البيانات الأساسية فقط مع hint للفهرس
    this.find(query)
      .select("_id type category title messageSummary message priority isRead sentAt data.action summary link")
      .sort({ sentAt: -1 })
      .skip(skip)
      .limit(limit)
      .hint({ recipient: 1, sentAt: -1 }) // استخدام الفهرس المحدد
      .lean(),
    
    // العدد الكلي - استخدام estimatedDocumentCount للأداء إذا لم يكن هناك فلاتر
    Object.keys(filters).length === 0
      ? this.countDocuments({ recipient: recipientId })
      : this.countDocuments(query),
    
    // عدد غير المقروءة
    this.countDocuments({ recipient: recipientId, isRead: false }),
  ]);

  return {
    notifications,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      totalCount,
      hasNextPage: page * limit < totalCount,
    },
    stats: {
      unreadCount,
      totalCount,
    },
    hasMore: page * limit < totalCount,
  };
};

// Static method للحصول على إشعار مع التفاصيل الكاملة
notificationSchema.statics.getWithDetails = async function (notificationId) {
  return this.findById(notificationId)
    .populate("details")
    .lean();
};

// Static method للحصول على عدد الإشعارات غير المقروءة
notificationSchema.statics.getUnreadCount = async function (recipientId) {
  return this.countDocuments({
    recipient: recipientId,
    isRead: false,
  });
};

// Static method للحصول على إحصائيات سريعة
notificationSchema.statics.getQuickStats = async function (recipientId) {
  const [unreadCount, todayCount] = await Promise.all([
    this.countDocuments({ recipient: recipientId, isRead: false }),
    this.countDocuments({
      recipient: recipientId,
      sentAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
    }),
  ]);

  return { unreadCount, todayCount };
};

// Static method لتحديد جميع الإشعارات كمقروءة
notificationSchema.statics.markAllAsRead = async function (recipientId) {
  return this.updateMany(
    { recipient: recipientId, isRead: false },
    { $set: { isRead: true, readAt: new Date() } }
  );
};

// ============================================================================
// Bulk Operations - عمليات دفعية محسّنة
// ============================================================================

/**
 * إنشاء إشعارات دفعية لعدة مستخدمين (محسّن للأداء)
 * @param {Array} recipients - قائمة المستلمين [{id, model}]
 * @param {String} type - نوع الإشعار
 * @param {String} title - العنوان
 * @param {String} message - الرسالة
 * @param {Object} data - بيانات إضافية
 * @returns {Promise<Array>} - الإشعارات المُنشأة
 */
notificationSchema.statics.createBulk = async function (
  recipients,
  type,
  title,
  message,
  data = {}
) {
  if (!recipients || recipients.length === 0) return [];

  // تحديد الفئة تلقائياً
  let category = "general";
  if (NOTIFICATION_TYPES.ACADEMIC.includes(type)) category = "academic";
  else if (NOTIFICATION_TYPES.ADMIN.includes(type)) category = "admin";
  else if (NOTIFICATION_TYPES.OTHER.includes(type)) category = "other";

  const messageSummary = message.length > 150 
    ? message.substring(0, 147) + "..." 
    : message;

  // إنشاء مصفوفة الإشعارات
  const notifications = recipients.map(recipient => ({
    recipient: recipient.id,
    recipientModel: recipient.model,
    type,
    category,
    title,
    message,
    messageSummary,
    data,
  }));

  // استخدام insertMany مع ordered: false للأداء
  try {
    const result = await this.insertMany(notifications, { 
      ordered: false, // متابعة حتى لو فشل بعضها
      lean: true,
    });
    
    console.log(`✅ Bulk created ${result.length} notifications`);
    return result;
  } catch (error) {
    // في حالة فشل جزئي، استخرج الناجحة
    if (error.insertedDocs) {
      console.log(`⚠️ Partial bulk insert: ${error.insertedDocs.length} succeeded`);
      return error.insertedDocs;
    }
    throw error;
  }
};

/**
 * إنشاء إشعارات دفعية بالتقسيم (للأعداد الكبيرة)
 * @param {Array} recipients - قائمة المستلمين
 * @param {String} type - نوع الإشعار
 * @param {String} title - العنوان
 * @param {String} message - الرسالة
 * @param {Object} data - بيانات إضافية
 * @param {Number} batchSize - حجم الدفعة (افتراضي 500)
 */
notificationSchema.statics.createBulkBatched = async function (
  recipients,
  type,
  title,
  message,
  data = {},
  batchSize = 500
) {
  if (!recipients || recipients.length === 0) return [];

  const results = [];
  
  // تقسيم إلى دفعات
  for (let i = 0; i < recipients.length; i += batchSize) {
    const batch = recipients.slice(i, i + batchSize);
    const batchResult = await this.createBulk(batch, type, title, message, data);
    results.push(...batchResult);
    
    // انتظار قصير بين الدفعات لتجنب الضغط
    if (i + batchSize < recipients.length) {
      await new Promise(resolve => setTimeout(resolve, 10));
    }
  }

  console.log(`✅ Batched bulk created ${results.length} notifications in ${Math.ceil(recipients.length / batchSize)} batches`);
  return results;
};

/**
 * حذف الإشعارات القديمة (للصيانة)
 * @param {Number} daysOld - عمر الإشعارات بالأيام
 */
notificationSchema.statics.deleteOldNotifications = async function (daysOld = 90) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  const result = await this.deleteMany({
    sentAt: { $lt: cutoffDate },
    isRead: true, // فقط المقروءة
  });

  console.log(`🗑️ Deleted ${result.deletedCount} old notifications (older than ${daysOld} days)`);
  return result.deletedCount;
};

/**
 * أرشفة الإشعارات القديمة بدلاً من حذفها
 * @param {Number} daysOld - عمر الإشعارات بالأيام
 */
notificationSchema.statics.archiveOldNotifications = async function (daysOld = 60) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  const result = await this.updateMany(
    {
      sentAt: { $lt: cutoffDate },
      isArchived: { $ne: true },
    },
    { $set: { isArchived: true, archivedAt: new Date() } }
  );

  console.log(`📦 Archived ${result.modifiedCount} old notifications`);
  return result.modifiedCount;
};

// Instance method لتحديد الإشعار كمقروء
notificationSchema.methods.markAsRead = function () {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

const Notification = mongoose.model("Notification", notificationSchema);

// تصدير الأنواع أيضاً للاستخدام في أماكن أخرى
module.exports = Notification;
module.exports.NOTIFICATION_TYPES = NOTIFICATION_TYPES;
module.exports.ALL_NOTIFICATION_TYPES = ALL_NOTIFICATION_TYPES;
