// ============================================================================
// ConversationService.js - Conversation Management
// ============================================================================

const Conversation = require("../../schema/Chat/Conversation");

class ConversationService {
  /**
   * Get or Create DM Conversation
   */
  async getOrCreateDMConversation(userId1, userRole1, userId2, userRole2) {
    // Try to find existing conversation with these exact participants
    // We use $and to ensure both users are present
    let conversation = await Conversation.findOne({
      type: "DM",
      $and: [
        { "participants.userId": userId1 },
        { "participants.userId": userId2 }
      ]
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
  async getConversations(userId, role, search) {
    const normalizedRole = role.charAt(0).toUpperCase() + role.slice(1);
    
    let query = { "participants.userId": userId };

    // ✅ Admin sees ONLY DMs (No Groups)
    if (normalizedRole === 'Admin') {
      query = {
        "participants.userId": userId,
        type: "DM"
      };
    }

    let conversations = await Conversation.find(query)
    .populate("lastMessage")
    .populate("participants.userId", "firstName lastName avatar")
    .populate({
      path: "groupId",
      select: "name description image"
    })
    .sort({ updatedAt: -1 })
    .lean();

    // ✅ Filter by search term (if provided)
    if (search) {
      const searchLower = search.toLowerCase();
      conversations = conversations.filter(conv => {
        if (conv.type === 'GROUP' && conv.groupId) {
          return conv.groupId.name.toLowerCase().includes(searchLower);
        } else if (conv.type === 'DM') {
          const other = conv.participants.find(p => 
            p.userId && p.userId._id && p.userId._id.toString() !== userId.toString()
          );
          if (other && other.userId) {
            const fullName = `${other.userId.firstName} ${other.userId.lastName}`.toLowerCase();
            return fullName.includes(searchLower);
          }
        }
        return false;
      });
    }

    // ✅ Deduplicate conversations (Backend fix)
    // This handles cases where bad data might have created duplicate conversations
    const uniqueMap = new Map();
    
    for (const conv of conversations) {
      let key = conv._id.toString();

      if (conv.type === 'GROUP' && conv.groupId) {
        key = `GROUP_${conv.groupId._id}`;
      } else if (conv.type === 'DM') {
        // Find the other participant
        const other = conv.participants.find(p => 
          p.userId && p.userId._id && p.userId._id.toString() !== userId.toString()
        );
        
        if (other && other.userId) {
          key = `DM_${other.userId._id}`;
        } else {
          // Handle "Chat with Self" or "Other Deleted"
          // If I am a participant, treat it as "Chat with Self" for deduplication
          const me = conv.participants.find(p => 
            p.userId && p.userId._id && p.userId._id.toString() === userId.toString()
          );
          if (me) {
            key = `DM_${userId}`;
          }
        }
      }

      if (uniqueMap.has(key)) {
        const existing = uniqueMap.get(key);
        // Keep the one with more recent update
        if (new Date(conv.updatedAt) > new Date(existing.updatedAt)) {
          uniqueMap.set(key, conv);
        }
      } else {
        uniqueMap.set(key, conv);
      }
    }

    conversations = Array.from(uniqueMap.values());

    // ✅ Filter: Only show conversations that have a lastMessage (actual conversation history)
    // This applies to both DMs and Groups as requested
    conversations = conversations.filter(c => !!c.lastMessage);

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

  /**
   * Delete Conversation (Hard Delete)
   * - Deletes the conversation document
   * - Deletes all messages in this conversation
   */
  async deleteConversation(userId, conversationId) {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      throw new Error("Conversation not found");
    }

    // Verify participation
    const isParticipant = conversation.participants.some(
      p => p.userId.toString() === userId.toString()
    );

    if (!isParticipant) {
      throw new Error("Not authorized to delete this conversation");
    }

    // Hard Delete: Remove conversation and all its messages
    // Note: In a real app, you might want to just remove the user from participants
    // or use 'deletedFor' on conversation. But user asked for "completely deleted from database".
    
    // However, for DM, if one deletes, should it delete for other?
    // User said: "delete chat between them... chat must be completely deleted between them in database"
    // This implies deleting the data itself.
    
    await Chat.deleteMany({ 
      $or: [
        { chatType: "DM", $and: [{ sender: conversation.participants[0].userId }, { recipient: conversation.participants[1].userId }] },
        { chatType: "DM", $and: [{ sender: conversation.participants[1].userId }, { recipient: conversation.participants[0].userId }] },
        { chatType: "GROUP", groupId: conversation.groupId }
      ]
    });

    // Actually, Chat schema doesn't have conversationId directly for DMs usually, 
    // but let's check how we link them.
    // The Chat schema uses sender/recipient for DM and groupId for Group.
    // It does NOT seem to have a conversationId field.
    // So we must delete based on participants or groupId.
    
    if (conversation.type === "GROUP") {
      await Chat.deleteMany({ groupId: conversation.groupId });
    } else {
      // For DM, we need to match messages between these two users
      const p1 = conversation.participants[0].userId;
      const p2 = conversation.participants[1].userId;
      
      await Chat.deleteMany({
        chatType: "DM",
        $or: [
          { sender: p1, recipient: p2 },
          { sender: p2, recipient: p1 }
        ]
      });
    }

    await Conversation.findByIdAndDelete(conversationId);

    return { success: true };
  }
}

module.exports = new ConversationService();
