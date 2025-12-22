// ============================================================================
// GroupController.js - Handle Group Chat Operations
// ============================================================================

const { GroupService } = require("../../services/Chat");

class GroupController {
  /**
   * POST /api/chat/groups/initialize
   * Initialize group conversations for teacher/admin
   */
  async initializeGroupConversations(req, res) {
    try {
      const { role, id } = req.user;
      const normalizedRole = role.charAt(0).toUpperCase() + role.slice(1);
      
      let result;
      if (normalizedRole === "Teacher") {
        result = await GroupService.initializeTeacherGroupConversations(id);
      } else if (normalizedRole === "Admin") {
        result = await GroupService.initializeAdminGroupConversations(id);
      } else {
        return res.status(403).json({ 
          success: false,
          message: "Only teachers and admins can initialize group conversations" 
        });
      }
      
      return res.json(result);
    } catch (error) {
      console.error("Error in initializeGroupConversations:", error);
      return res.status(500).json({ 
        success: false,
        message: error.message 
      });
    }
  }
}

module.exports = new GroupController();
