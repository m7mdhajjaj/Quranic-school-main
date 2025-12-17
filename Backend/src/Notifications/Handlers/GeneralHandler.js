// ============================================================================
// GeneralHandler.js - General Notification Handlers
// ============================================================================

/**
 * إرسال إشعار عام للنظام
 * @param {Function} createNotification - دالة إنشاء الإشعار من NotificationManager
 * @param {String} userId - معرف المستخدم
 * @param {String} userModel - نوع المستخدم (Student/Teacher/Admin)
 * @param {String} title - عنوان الإشعار
 * @param {String} message - محتوى الإشعار
 * @param {Object} data - بيانات إضافية
 */
exports.notifySystemMessage = async (createNotification, userId, userModel, title, message, data = {}) => {
  try {
    const notification = await createNotification({
      recipient: userId,
      recipientModel: userModel,
      type: 'system',
      title: title,
      message: message,
      priority: 'medium',
      data: data
    });

    console.log(`✅ [GeneralHandler] System notification sent to ${userModel} ${userId}`);
    return notification;
  } catch (error) {
    console.error(`❌ [GeneralHandler] Error sending system notification:`, error);
    throw error;
  }
};

/**
 * إرسال تحذير للمستخدم
 * @param {Function} createNotification - دالة إنشاء الإشعار من NotificationManager
 * @param {String} userId - معرف المستخدم
 * @param {String} userModel - نوع المستخدم (Student/Teacher/Admin)
 * @param {String} title - عنوان التحذير
 * @param {String} message - محتوى التحذير
 * @param {Object} data - بيانات إضافية
 */
exports.notifyWarning = async (createNotification, userId, userModel, title, message, data = {}) => {
  try {
    const notification = await createNotification({
      recipient: userId,
      recipientModel: userModel,
      type: 'warning',
      title: title,
      message: message,
      priority: 'high',
      data: data
    });

    console.log(`✅ [GeneralHandler] Warning notification sent to ${userModel} ${userId}`);
    return notification;
  } catch (error) {
    console.error(`❌ [GeneralHandler] Error sending warning notification:`, error);
    throw error;
  }
};
