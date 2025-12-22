// ============================================================================
// ContactsController.js - Handle Contact & Permission Requests
// ============================================================================

const { ContactsService } = require("../../services/Chat");

class ContactsController {
  /**
   * GET /api/chat/contacts
   * Get allowed contacts and groups for current user
   */
  async getContacts(req, res) {
    try {
      const result = await ContactsService.getContacts(req.user.id, req.user.role);
      return res.json(result);
    } catch (error) {
      console.error("Error in getContacts:", error);
      return res.status(500).json({ 
        success: false,
        message: error.message 
      });
    }
  }
}

module.exports = new ContactsController();
