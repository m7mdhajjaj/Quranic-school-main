const FCMService = require("../../config/FCMService");
const DeviceToken = require("../../../schema/DeviceToken");

/**
 * Push Notifications Module
 * Handles FCM (Firebase Cloud Messaging) push notifications
 */

/**
 * Send push notification via FCM
 */
async function sendPushNotification(recipient, notificationData) {
  try {
    if (!FCMService || !FCMService.initialized) {
      console.warn("⚠️ FCM not initialized, skipping push notification");
      return null;
    }

    const devices = await DeviceToken.find({ user: recipient }).lean();
    const tokenList = devices.map((d) => d.token).filter(Boolean);
    
    if (tokenList.length === 0) {
      console.log(`📱 No device tokens found for user ${recipient}`);
      return null;
    }

    const payload = {
      notification: {
        title: notificationData.title,
        body: notificationData.message,
      },
      data: {
        notificationId: notificationData._id?.toString() || "",
        type: notificationData.type,
        priority: notificationData.priority || "medium",
        ...notificationData.data,
      },
    };

    const response = await FCMService.sendToTokens(tokenList, payload);
    console.log(`📣 Push notification sent via FCM to ${tokenList.length} devices`);
    return response;
  } catch (error) {
    console.error("❌ Error sending FCM push:", error.message || error);
    return null;
  }
}

/**
 * Send push notification to multiple devices
 * @param {Array<String>} userIds - Array of user IDs
 * @param {String} title - Notification title
 * @param {String} message - Notification message body
 * @param {Object} data - Additional data payload
 * @returns {Promise<Object>} FCM response
 */
async function sendNotificationToDevices(userIds, title, message, data = {}) {
  try {
    if (!FCMService || !FCMService.initialized) {
      console.warn("⚠️ FCM Service not initialized. Skipping push notification.");
      return { success: false, message: "FCM not initialized" };
    }

    if (!Array.isArray(userIds) || userIds.length === 0) {
      console.warn("⚠️ No user IDs provided for notification");
      return { success: false, message: "No user IDs" };
    }

    // Get all device tokens for the provided user IDs
    const deviceTokens = await DeviceToken.find({
      user: { $in: userIds },
    })
      .lean()
      .select("token user");

    if (!deviceTokens || deviceTokens.length === 0) {
      console.warn(`⚠️ No device tokens found for ${userIds.length} users`);
      return { success: false, message: "No device tokens found" };
    }

    const tokens = deviceTokens.map((d) => d.token).filter(Boolean);

    if (tokens.length === 0) {
      console.warn("⚠️ No valid tokens found after filtering");
      return { success: false, message: "No valid tokens" };
    }

    // Prepare FCM payload
    const payload = {
      notification: {
        title: title,
        body: message,
      },
      data: {
        ...data,
        sentAt: new Date().toISOString(),
      },
    };

    // Send notification via FCM
    const response = await FCMService.sendToTokens(tokens, payload);

    if (response) {
      console.log(
        `✅ Push notification sent to ${tokens.length} devices for ${userIds.length} users`
      );
      console.log(`   📊 Success: ${response.successCount}, Failed: ${response.failureCount}`);

      return {
        success: true,
        successCount: response.successCount,
        failureCount: response.failureCount,
        totalTokens: tokens.length,
      };
    }

    return { success: false, message: "FCM sendToTokens returned null" };
  } catch (error) {
    console.error("❌ Error sending notification to devices:", error);
    throw error;
  }
}

module.exports = {
  sendPushNotification,
  sendNotificationToDevices,
};
