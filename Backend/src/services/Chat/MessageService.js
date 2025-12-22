// ============================================================================
// MessageService.js - Message Operations (Send, Read, Edit, Delete)
// ============================================================================

const Chat = require("../../schema/Chat/Chat");
const { sendMessageSchema } = require("../../Validation/Chat/chatValidation");
const { sendPushNotification } = require("../../Notifications/Core/PushSender");
const ContactsService = require("./ContactsService");
const ConversationService = require("./ConversationService");
const GroupService = require("./GroupService");

class MessageService {
  /**
   * Send Message (DM or GROUP)
   */
  async sendMessage(senderId, senderRole, data) {
    const normalizedSenderRole = senderRole.charAt(0).toUpperCase() + senderRole.slice(1);
    
    // Validate input
    const validated = sendMessageSchema.parse(data);

    if (validated.chatType === "DM") {
      return this._sendDMMessage(senderId, normalizedSenderRole, validated);
    } else if (validated.chatType === "GROUP") {
      return this._sendGroupMessage(senderId, normalizedSenderRole, validated);
    }
  }

  /**
   * Private: Send DM Message
   */
  async _sendDMMessage(senderId, senderRole, data) {
    // Get recipient role
    const recipientRole = await ContactsService.getRecipientRole(data.recipientId);
    if (!recipientRole) {
      throw new Error("Recipient not found");
    }

    // Check permissions
    const allowed = await ContactsService.canChat(senderId, senderRole, data.recipientId, recipientRole);
    if (!allowed) {
      throw new Error("Not authorized to chat with this user");
    }

    // Get or create conversation
    const conversation = await ConversationService.getOrCreateDMConversation(
      senderId,
      senderRole,
      data.recipientId,
      recipientRole
    );

    // Create message
    const message = await Chat.create({
      chatType: "DM",
      sender: senderId,
      senderModel: senderRole,
      recipient: data.recipientId,
      recipientModel: recipientRole,
      text: data.text,
      attachments: data.attachments,
      replyTo: data.replyTo,
      clientTempId: data.clientTempId,
      deliveredAt: null,
      readAt: null
    });

    // Populate sender info
    await message.populate("sender", "firstName lastName avatar");
    await message.populate("replyTo");

    // Update conversation
    await ConversationService.updateConversationAfterMessage(
      conversation._id,
      message._id,
      data.recipientId
    );

    // Emit Socket Events
    this._emitDMEvents(senderId, data.recipientId, message, data.clientTempId);

    // Send Push Notification if offline
    await this._sendPushIfOffline(data.recipientId, senderId, senderRole, data.text);

    return message;
  }

  /**
   * Private: Send Group Message
   */
  async _sendGroupMessage(senderId, senderRole, data) {
    // Check group membership and permissions
    const allowed = await GroupService.canSendToGroup(senderId, senderRole, data.groupId);
    if (!allowed) {
      throw new Error("Not authorized to send to this group");
    }

    // Create message
    const message = await Chat.create({
      chatType: "GROUP",
      sender: senderId,
      senderModel: senderRole,
      groupId: data.groupId,
      text: data.text,
      attachments: data.attachments,
      replyTo: data.replyTo,
      clientTempId: data.clientTempId,
    });

    // Populate sender info
    await message.populate("sender", "firstName lastName avatar");
    await message.populate("replyTo");

    // Emit to Group Room
    this._emitGroupEvents(senderId, data.groupId, message, data.clientTempId);

    return message;
  }

  /**
   * Get Messages (with pagination)
   */
  async getMessages(userId, role, query) {
    const { chatType, targetId, limit = 50, before } = query;
    
    const filter = { 
      chatType, 
      deletedForAll: false, 
      deletedFor: { $ne: userId } 
    };
    
    if (chatType === "DM") {
      filter.$or = [
        { sender: userId, recipient: targetId },
        { sender: targetId, recipient: userId }
      ];
    } else {
      filter.groupId = targetId;
    }

    if (before) {
      filter.createdAt = { $lt: new Date(before) };
    }

    const messages = await Chat.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .populate("sender", "firstName lastName avatar")
      .populate("replyTo")
      .lean();

    return messages.reverse();
  }

  /**
   * Mark all undelivered messages for user as delivered
   */
  async markAllUndeliveredAsDelivered(userId) {
    try {
      const messages = await Chat.find({
        chatType: "DM",
        recipient: userId,
        deliveredAt: null
      });

      if (messages.length === 0) return;

      const now = new Date();
      
      for (const msg of messages) {
        msg.deliveredAt = now;
        await msg.save();
        
        if (global.io) {
          global.io.to(msg.sender.toString()).emit("message:delivered", {
            messageId: msg._id,
            deliveredAt: now
          });
        }
      }
    } catch (error) {
      console.error("Error marking messages as delivered:", error);
    }
  }

  /**
   * Mark Message as Delivered
   */
  async markDelivered(userId, messageId) {
    const message = await Chat.findById(messageId);
    if (!message) {
      throw new Error("Message not found");
    }

    if (message.chatType === "DM") {
      if (message.recipient.toString() === userId.toString() && !message.deliveredAt) {
        message.deliveredAt = new Date();
        await message.save();
        
        // Notify sender
        if (global.io) {
          global.io.to(message.sender.toString()).emit("message:delivered", {
            messageId: message._id,
            deliveredAt: message.deliveredAt
          });
        }
      }
    } else if (message.chatType === "GROUP") {
      const alreadyDelivered = message.deliveredTo.find(
        d => d.userId.toString() === userId.toString()
      );
      
      if (!alreadyDelivered) {
        message.deliveredTo.push({ userId, deliveredAt: new Date() });
        await message.save();
      }
    }

    return message;
  }

  /**
   * Mark Message as Read
   */
  async markSeen(userId, messageId) {
    const message = await Chat.findById(messageId);
    if (!message) {
      throw new Error("Message not found");
    }

    if (message.chatType === "DM") {
      if (message.recipient.toString() === userId.toString() && !message.readAt) {
        message.readAt = new Date();
        if (!message.deliveredAt) {
          message.deliveredAt = new Date();
        }
        await message.save();
        
        // Reset unread count
        await ConversationService.resetUnreadCount(userId, message.chatType, message.sender);
        
        // Notify sender
        if (global.io) {
          global.io.to(message.sender.toString()).emit("message:read", {
            messageId: message._id,
            readAt: message.readAt
          });
        }
      }
    } else if (message.chatType === "GROUP") {
      const alreadySeen = message.seenBy.find(
        s => s.userId.toString() === userId.toString()
      );
      
      if (!alreadySeen) {
        message.seenBy.push({ userId, seenAt: new Date() });
        if (!message.deliveredTo.find(d => d.userId.toString() === userId.toString())) {
          message.deliveredTo.push({ userId, deliveredAt: new Date() });
        }
        await message.save();
        
        // Reset unread count for group
        await ConversationService.resetUnreadCount(userId, message.chatType, message.groupId);
      }
    }

    return message;
  }

  /**
   * Edit Message
   */
  async editMessage(userId, messageId, newText) {
    const message = await Chat.findById(messageId);
    if (!message) {
      throw new Error("Message not found");
    }
    
    if (message.sender.toString() !== userId.toString()) {
      throw new Error("Not authorized");
    }

    message.text = newText;
    message.edited = true;
    message.editedAt = new Date();
    await message.save();

    // Emit update
    if (global.io) {
      if (message.chatType === "DM") {
        global.io.to(message.recipient.toString()).emit("message:edited", message);
        global.io.to(message.sender.toString()).emit("message:edited", message);
      } else {
        global.io.to(`group:${message.groupId}`).emit("message:edited", message);
      }
    }

    return message;
  }

  /**
   * Delete Message
   */
  async deleteMessage(userId, messageId, deleteForAll = false) {
    const message = await Chat.findById(messageId);
    if (!message) {
      throw new Error("Message not found");
    }

    if (deleteForAll) {
      if (message.sender.toString() !== userId.toString()) {
        throw new Error("Not authorized");
      }
      
      message.deletedForAll = true;
      await message.save();

      // Emit deletion
      if (global.io) {
        if (message.chatType === "DM") {
          global.io.to(message.recipient.toString()).emit("message:deleted", { messageId });
          global.io.to(message.sender.toString()).emit("message:deleted", { messageId });
        } else {
          global.io.to(`group:${message.groupId}`).emit("message:deleted", { messageId });
        }
      }
    } else {
      if (!message.deletedFor.includes(userId)) {
        message.deletedFor.push(userId);
        await message.save();
      }
    }

    return message;
  }

  /**
   * Private: Emit DM Socket Events
   */
  _emitDMEvents(senderId, recipientId, message, clientTempId) {
    if (!global.io) return;

    // Notify recipient
    global.io.to(recipientId.toString()).emit("message:new", {
      ...message.toObject(),
      chatType: "DM",
      from: senderId.toString()
    });
    
    // Confirm to sender
    global.io.to(senderId.toString()).emit("message:sent", { 
      tempId: clientTempId, 
      message: message.toObject()
    });
    
    // ✅ Emit conversation update to both users
    global.io.to(recipientId.toString()).emit("conversation:updated", {
      chatType: "DM",
      targetId: senderId.toString(),
      lastMessage: message.toObject(),
      timestamp: message.createdAt
    });
    
    global.io.to(senderId.toString()).emit("conversation:updated", {
      chatType: "DM",
      targetId: recipientId.toString(),
      lastMessage: message.toObject(),
      timestamp: message.createdAt
    });
  }

  /**
   * Private: Emit Group Socket Events
   */
  _emitGroupEvents(senderId, groupId, message, clientTempId) {
    if (!global.io) return;

    // Broadcast to group
    global.io.to(`group:${groupId}`).emit("message:new", {
      ...message.toObject(),
      chatType: "GROUP",
      from: senderId.toString()
    });
    
    // Confirm to sender
    global.io.to(senderId.toString()).emit("message:sent", { 
      tempId: clientTempId, 
      message: message.toObject()
    });
    
    // ✅ Emit conversation update to group members
    global.io.to(`group:${groupId}`).emit("conversation:updated", {
      chatType: "GROUP",
      targetId: groupId.toString(),
      lastMessage: message.toObject(),
      timestamp: message.createdAt
    });
  }

  /**
   * Private: Send Push Notification if User Offline
   */
  async _sendPushIfOffline(recipientId, senderId, senderRole, messageText) {
    const isOnline = global.isUserOnline ? global.isUserOnline(recipientId) : false;
    
    if (!isOnline) {
      try {
        const senderModel = senderRole === "Student" ? require("../../schema/Student/Student") 
                          : senderRole === "Teacher" ? require("../../schema/Teacher")
                          : require("../../schema/Admin");
        
        const sender = await senderModel.findById(senderId).select("firstName lastName");
        if (sender) {
          await sendPushNotification({
            userId: recipientId,
            title: `رسالة من ${sender.firstName} ${sender.lastName}`,
            body: messageText.substring(0, 100),
            data: {
              type: "chat",
              senderId: senderId.toString(),
              chatType: "DM"
            }
          });
        }
      } catch (err) {
        console.error("Error sending push notification:", err);
      }
    }
  }
}

module.exports = new MessageService();
