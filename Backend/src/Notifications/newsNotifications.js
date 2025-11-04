// ============================================================================
// newsNotifications.js - News Socket.IO Events
// ============================================================================

/**
 * Notify when new news is created
 */
exports.notifyNewsCreated = (io, newsData) => {
  try {
    console.log("📢 Broadcasting news created event:", newsData._id);

    io.emit("news:created", {
      id: newsData._id,
      title: newsData.title,
      image: newsData.image,
      category: newsData.category,
      timestamp: newsData.createdAt,
      message: `تم نشر خبر جديد: ${newsData.title}`,
    });
  } catch (error) {
    console.error("❌ Error notifying news created:", error);
  }
};

/**
 * Notify when news is updated
 */
exports.notifyNewsUpdated = (io, newsData) => {
  try {
    console.log("📢 Broadcasting news updated event:", newsData._id);

    io.emit("news:updated", {
      id: newsData._id,
      title: newsData.title,
      image: newsData.image,
      category: newsData.category,
      timestamp: newsData.updatedAt,
      message: `تم تحديث الخبر: ${newsData.title}`,
    });
  } catch (error) {
    console.error("❌ Error notifying news updated:", error);
  }
};

/**
 * Notify when news is deleted
 */
exports.notifyNewsDeleted = (io, newsId, title) => {
  try {
    console.log("📢 Broadcasting news deleted event:", newsId);

    io.emit("news:deleted", {
      id: newsId,
      title: title,
      timestamp: new Date(),
      message: `تم حذف الخبر: ${title}`,
    });
  } catch (error) {
    console.error("❌ Error notifying news deleted:", error);
  }
};

/**
 * Notify when news is published
 */
exports.notifyNewsPublished = (io, newsData) => {
  try {
    console.log("📢 Broadcasting news published event:", newsData._id);

    io.emit("news:published", {
      id: newsData._id,
      title: newsData.title,
      image: newsData.image,
      category: newsData.category,
      publishedAt: newsData.publishedAt,
      timestamp: new Date(),
      message: `تم نشر الخبر: ${newsData.title}`,
    });
  } catch (error) {
    console.error("❌ Error notifying news published:", error);
  }
};

/**
 * Notify when news is archived
 */
exports.notifyNewsArchived = (io, newsId, title) => {
  try {
    console.log("📢 Broadcasting news archived event:", newsId);

    io.emit("news:archived", {
      id: newsId,
      title: title,
      timestamp: new Date(),
      message: `تم أرشفة الخبر: ${title}`,
    });
  } catch (error) {
    console.error("❌ Error notifying news archived:", error);
  }
};

/**
 * Notify bulk news creation
 */
exports.notifyBulkNewsCreated = (io, count) => {
  try {
    console.log("📢 Broadcasting bulk news created event");

    io.emit("news:bulkCreated", {
      count: count,
      timestamp: new Date(),
      message: `تم إنشاء ${count} خبر جديد`,
    });
  } catch (error) {
    console.error("❌ Error notifying bulk news created:", error);
  }
};

/**
 * Notify bulk news update
 */
exports.notifyBulkNewsUpdated = (io, count) => {
  try {
    console.log("📢 Broadcasting bulk news updated event");

    io.emit("news:bulkUpdated", {
      count: count,
      timestamp: new Date(),
      message: `تم تحديث ${count} خبر`,
    });
  } catch (error) {
    console.error("❌ Error notifying bulk news updated:", error);
  }
};

/**
 * Notify bulk news deletion
 */
exports.notifyBulkNewsDeleted = (io, count) => {
  try {
    console.log("📢 Broadcasting bulk news deleted event");

    io.emit("news:bulkDeleted", {
      count: count,
      timestamp: new Date(),
      message: `تم حذف ${count} خبر`,
    });
  } catch (error) {
    console.error("❌ Error notifying bulk news deleted:", error);
  }
};

/**
 * Notify news view count update
 */
exports.notifyViewsIncremented = (io, newsId, viewCount) => {
  try {
    io.emit("news:viewsUpdated", {
      id: newsId,
      views: viewCount,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error("❌ Error notifying views incremented:", error);
  }
};
