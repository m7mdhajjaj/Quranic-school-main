// ============================================================================
// ConversationController.js - Handle Conversation Operations
// ============================================================================

const { ConversationService } = require("../../services/Chat");

class ConversationController {
  /**
   * GET /api/chat/conversations
   * Get all conversations for current user
   */
  async getConversations(req, res) {
    try {
      const { search } = req.query;
      const conversations = await ConversationService.getConversations(
        req.user.id, 
        req.user.role,
        search
      );
      return res.json(conversations);
    } catch (error) {
      console.error("Error in getConversations:", error);
      return res.status(500).json({ 
        success: false,
        message: error.message 
      });
    }
  }

  /**
   * POST /api/chat/conversations/reset-unread
   * Reset unread count for a conversation
   */
  async resetUnreadCount(req, res) {
    try {
      const { chatType, targetId } = req.body;
      await ConversationService.resetUnreadCount(
        req.user.id, 
        chatType, 
        targetId
      );
      return res.json({ success: true });
    } catch (error) {
      console.error("Error in resetUnreadCount:", error);
      return res.status(500).json({ 
        success: false,
        message: error.message 
      });
    }
  }
}

module.exports = new ConversationController();
