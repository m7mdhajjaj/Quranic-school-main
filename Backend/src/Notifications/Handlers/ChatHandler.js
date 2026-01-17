const Notification = require("../../schema/Notfcation/Notification");
const { sendRealTimeNotification } = require("../Core/SocketSender");

/**
 * Notify user about a new message
 * @param {string} recipientId - The ID of the recipient
 * @param {string} recipientModel - The model of the recipient (Student, Teacher, Admin)
 * @param {string} senderName - The name of the sender
 * @param {string} text - The message text
 * @param {string} conversationId - The ID of the conversation
 * @param {string} chatType - The type of chat (DM or GROUP)
 * @param {string} [groupName] - The name of the group (optional, for GROUP chat)
 */
const notifyNewMessage = async (recipientId, recipientModel, senderName, text, conversationId, chatType, groupName) => {
  try {
    let title = senderName;
    if (chatType === 'GROUP' && groupName) {
      title = `${senderName} - ${groupName}`;
    }

    const message = text.length > 50 ? text.substring(0, 50) + "..." : text;
    
    const notificationData = {
      recipient: recipientId,
      recipientModel: recipientModel,
      type: "message",
      category: "general",
      title: title,
      message: text,
      messageSummary: message,
      link: "/chat",
      data: {
        conversationId: conversationId.toString(),
        chatType: chatType,
        action: "new_message",
        entityType: "message",
        senderName: senderName
      },
      isRead: false,
      sentAt: new Date()
    };

    // Create notification in DB
    const notification = await Notification.create(notificationData);

    // Send Real-time (Socket)
    if (global.io) {
      await sendRealTimeNotification(global.io, notification);
    } else {
      console.warn("Socket.io instance (global.io) not found, skipping real-time notification");
    }

    return notification;
  } catch (error) {
    console.error("Error creating chat notification:", error);
  }
};

/**
 * Notify user about a mention
 */
const notifyMention = async (recipientId, recipientModel, senderName, text, conversationId, chatType, groupName) => {
  try {
    let title = `إشارة من ${senderName}`;
    if (chatType === 'GROUP' && groupName) {
      title = `إشارة - ${groupName}`;
    }

    const message = text.length > 50 ? text.substring(0, 50) + "..." : text;
    
    const notificationData = {
      recipient: recipientId,
      recipientModel: recipientModel,
      type: "mention",
      category: "general",
      title: title,
      message: text,
      messageSummary: message,
      link: "/chat",
      data: {
        conversationId: conversationId.toString(),
        chatType: chatType,
        action: "mentioned",
        entityType: "message",
        senderName: senderName
      },
      isRead: false,
      sentAt: new Date()
    };

    const notification = await Notification.create(notificationData);

    if (global.io) {
      await sendRealTimeNotification(global.io, notification);
    }

    return notification;
  } catch (error) {
    console.error("Error creating mention notification:", error);
  }
};

module.exports = {
  notifyNewMessage,
  notifyMention
};
