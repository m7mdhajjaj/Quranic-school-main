// ============================================================================
// ConversationService.js - Conversation Management
// ============================================================================

const Conversation = require("../../schema/Chat/Conversation");
const Chat = require("../../schema/Chat/Chat");

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
    
    // ✅ Unhide conversation if it was deleted by any participant
    conversation.deletedFor = [];
    
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
   * Update Group Conversation After Message
   */
  async updateGroupConversationAfterMessage(groupId, messageId, senderId) {
    const conversation = await Conversation.findOne({ type: 'GROUP', groupId: groupId });
    if (!conversation) return;

    conversation.lastMessage = messageId;
    conversation.updatedAt = new Date();
    conversation.deletedFor = []; // Unhide for everyone

    // Increment unread for all participants EXCEPT sender
    conversation.unreadCounts.forEach(entry => {
      if (entry.userId.toString() !== senderId.toString()) {
        entry.count += 1;
      }
    });

    await conversation.save();
  }

  /**
   * Mute Conversation
   */
  async muteConversation(userId, chatType, targetId, duration) {
    let conversation;
    
    if (chatType === 'DM') {
      conversation = await Conversation.findOne({
        type: 'DM',
        $and: [
          { "participants.userId": userId },
          { "participants.userId": targetId }
        ]
      });
    } else {
      conversation = await Conversation.findOne({
        type: 'GROUP',
        groupId: targetId
      });
    }

    if (!conversation) throw new Error("Conversation not found");

    let mutedUntil = null;
    if (duration === -1) {
      // Mute indefinitely (e.g., for 100 years)
      mutedUntil = new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000);
    } else if (duration > 0) {
      mutedUntil = new Date(Date.now() + duration * 60 * 1000);
    } else {
      // Unmute
      mutedUntil = null;
    }

    // Update participant's mutedUntil
    const participantIndex = conversation.participants.findIndex(
      p => p.userId.toString() === userId.toString()
    );

    if (participantIndex !== -1) {
      conversation.participants[participantIndex].mutedUntil = mutedUntil;
      await conversation.save();
    }
  }

  /**
   * Check if conversation is muted for user
   */
  async isMuted(userId, conversationId) {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) return false;

    const participant = conversation.participants.find(
      p => p.userId.toString() === userId.toString()
    );

    if (participant && participant.mutedUntil) {
      return new Date(participant.mutedUntil) > new Date();
    }
    return false;
  }

  /**
   * Get All Conversations for User
   */
  async getConversations(userId, role, search) {
    const normalizedRole = role.charAt(0).toUpperCase() + role.slice(1);
    
    let query = { 
      "participants.userId": userId,
      deletedFor: { $ne: userId }
    };

    // ✅ Admin/Secretary sees ONLY DMs (No Groups)
    if (normalizedRole === 'Admin' || normalizedRole === 'Secretary') {
      query = {
        "participants.userId": userId,
        type: "DM",
        deletedFor: { $ne: userId }
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
   * Delete Conversation (Soft Delete for User)
   * - Hides the conversation from the user
   * - Hides all existing messages from the user
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

    // ✅ Soft Delete Messages: Add userId to deletedFor array of all messages
    if (conversation.type === "GROUP") {
      await Chat.updateMany(
        { groupId: conversation.groupId },
        { $addToSet: { deletedFor: userId } }
      );
    } else {
      // For DM, match messages between participants
      const p1 = conversation.participants[0].userId;
      const p2 = conversation.participants[1].userId;
      
      await Chat.updateMany(
        {
          chatType: "DM",
          $or: [
            { sender: p1, recipient: p2 },
            { sender: p2, recipient: p1 }
          ]
        },
        { $addToSet: { deletedFor: userId } }
      );
    }

    // ✅ Soft Delete Conversation: Add userId to deletedFor array
    conversation.deletedFor.addToSet(userId);
    
    // Reset unread count for this user
    const unreadEntry = conversation.unreadCounts.find(
      u => u.userId.toString() === userId.toString()
    );
    if (unreadEntry) {
      unreadEntry.count = 0;
    }

    await conversation.save();

    return { success: true };
  }
}

module.exports = new ConversationService();
