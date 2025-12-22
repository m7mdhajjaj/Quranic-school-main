// ============================================================================
// ConversationService.js - Conversation Management
// ============================================================================

const Conversation = require("../../schema/Chat/Conversation");

class ConversationService {
  /**
   * Get or Create DM Conversation
   */
  async getOrCreateDMConversation(userId1, userRole1, userId2, userRole2) {
    let conversation = await Conversation.findOne({
      type: "DM",
      "participants.userId": { $all: [userId1, userId2] }
    });

    if (!conversation) {
      conversation = await Conversation.create({
        type: "DM",
        participants: [
          { userId: userId1, userModel: userRole1 },
          { userId: userId2, userModel: userRole2 }
        ],
        unreadCounts: [
          { userId: userId1, count: 0 },
          { userId: userId2, count: 0 }
        ]
      });
    }

    return conversation;
  }

  /**
   * Update Conversation After Message
   */
  async updateConversationAfterMessage(conversationId, messageId, recipientId) {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) return;

    conversation.lastMessage = messageId;
    conversation.updatedAt = new Date();
    
    // Increment unread for recipient
    const unreadEntry = conversation.unreadCounts.find(
      u => u.userId.toString() === recipientId.toString()
    );
    
    if (unreadEntry) {
      unreadEntry.count += 1;
    } else {
      conversation.unreadCounts.push({ userId: recipientId, count: 1 });
    }
    
    await conversation.save();
  }

  /**
   * Get All Conversations for User
   */
  async getConversations(userId, role) {
    let conversations = await Conversation.find({
      "participants.userId": userId
    })
    .populate("lastMessage")
    .populate("participants.userId", "firstName lastName avatar")
    .populate({
      path: "groupId",
      select: "name description image"
    })
    .sort({ updatedAt: -1 })
    .lean();

    // Calculate unread count for each
    conversations = conversations.map(conv => {
      const unreadEntry = conv.unreadCounts.find(
        u => u.userId.toString() === userId.toString()
      );
      conv.unreadCount = unreadEntry ? unreadEntry.count : 0;
      return conv;
    });

    return conversations;
  }

  /**
   * Reset Unread Count
   */
  async resetUnreadCount(userId, chatType, targetId) {
    try {
      if (chatType === "DM") {
        await Conversation.updateOne(
          {
            type: "DM",
            "participants.userId": { $all: [userId, targetId] },
            "unreadCounts.userId": userId
          },
          {
            $set: { "unreadCounts.$.count": 0 }
          }
        );
      } else if (chatType === "GROUP") {
        await Conversation.updateOne(
          {
            type: "GROUP",
            groupId: targetId,
            "unreadCounts.userId": userId
          },
          {
            $set: { "unreadCounts.$.count": 0 }
          }
        );
      }
    } catch (err) {
      console.error("Error resetting unread count:", err);
    }
  }

  /**
   * Increment Unread Count for All Participants except Sender
   */
  async incrementUnreadCount(conversationId, excludeUserId) {
    try {
      const conversation = await Conversation.findById(conversationId);
      if (!conversation) return;

      for (const participant of conversation.participants) {
        if (participant.userId.toString() !== excludeUserId.toString()) {
          const unreadEntry = conversation.unreadCounts.find(
            u => u.userId.toString() === participant.userId.toString()
          );
          
          if (unreadEntry) {
            unreadEntry.count += 1;
          } else {
            conversation.unreadCounts.push({
              userId: participant.userId,
              count: 1
            });
          }
        }
      }

      await conversation.save();
    } catch (err) {
      console.error("Error incrementing unread count:", err);
    }
  }
}

module.exports = new ConversationService();
