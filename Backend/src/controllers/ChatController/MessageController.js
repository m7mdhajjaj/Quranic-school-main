// ============================================================================
// MessageController.js - Handle Message Operations
// ============================================================================

const { MessageService } = require("../../services/Chat");

class MessageController {
  /**
   * POST /api/chat/messages
   * Send a new message
   */
  async sendMessage(req, res) {
    try {
      const message = await MessageService.sendMessage(
        req.user.id, 
        req.user.role, 
        req.body
      );
      return res.status(201).json(message);
    } catch (error) {
      console.error("Error in sendMessage:", error);
      return res.status(400).json({ 
        success: false,
        message: error.message 
      });
    }
  }

  /**
   * GET /api/chat/messages
   * Get messages for a conversation
   */
  async getMessages(req, res) {
    try {
      const messages = await MessageService.getMessages(
        req.user.id, 
        req.user.role, 
        req.query
      );
      return res.json(messages);
    } catch (error) {
      console.error("Error in getMessages:", error);
      return res.status(400).json({ 
        success: false,
        message: error.message 
      });
    }
  }

  /**
   * GET /api/chat/messages/:id/context
   * Get message with surrounding context
   */
  async getMessageContext(req, res) {
    try {
      const { id } = req.params;
      const messages = await MessageService.getMessageContext(req.user.id, id);
      return res.json(messages);
    } catch (error) {
      console.error("Error in getMessageContext:", error);
      return res.status(400).json({ 
        success: false,
        message: error.message 
      });
    }
  }

  /**
   * POST /api/chat/messages/mark-seen
   * Mark message as read
   */
  async markSeen(req, res) {
    try {
      const { messageId } = req.body;
      const result = await MessageService.markSeen(req.user.id, messageId);
      return res.status(200).json(result);
    } catch (error) {
      console.error("Error in markSeen:", error);
      return res.status(500).json({ 
        success: false,
        message: error.message 
      });
    }
  }

  /**
   * PUT /api/chat/messages/:id
   * Edit a message
   */
  async editMessage(req, res) {
    try {
      const { id } = req.params;
      const { text } = req.body;
      const result = await MessageService.editMessage(req.user.id, id, text);
      return res.status(200).json(result);
    } catch (error) {
      console.error("Error in editMessage:", error);
      return res.status(403).json({ 
        success: false,
        message: error.message 
      });
    }
  }

  /**
   * DELETE /api/chat/messages/:id
   * Delete a message
   */
  async deleteMessage(req, res) {
    try {
      const { id } = req.params;
      const { deleteForAll } = req.body;
      const result = await MessageService.deleteMessage(req.user.id, id, deleteForAll);
      return res.status(200).json(result);
    } catch (error) {
      console.error("Error in deleteMessage:", error);
      return res.status(403).json({ 
        success: false,
        message: error.message 
      });
    }
  }

  /**
   * POST /api/chat/upload
   * Upload attachment for chat
   */
  async uploadAttachment(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ 
          success: false,
          message: 'لم يتم رفع ملف' 
        });
      }

      const attachment = {
        url: req.file.path,
        type: req.file.mimetype.startsWith('image/') ? 'image' : 'file',
        name: req.file.originalname,
        size: req.file.size
      };

      return res.status(200).json(attachment);
    } catch (error) {
      console.error("Error in uploadAttachment:", error);
      return res.status(500).json({ 
        success: false,
        message: error.message 
      });
    }
  }
}

module.exports = new MessageController();
