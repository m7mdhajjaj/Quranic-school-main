// ============================================================================
// GroupService.js - Group Chat Management
// ============================================================================

const Group = require("../../schema/Group");
const Teacher = require("../../schema/Teacher");
const Student = require("../../schema/Student");
const Conversation = require("../../schema/Chat/Conversation");

class GroupService {
  /**
   * Initialize Group Conversations for Teacher
   */
  async initializeTeacherGroupConversations(teacherId) {
    try {
      const teacher = await Teacher.findById(teacherId);
      if (!teacher || !teacher.groups || teacher.groups.length === 0) {
        return { success: false, message: "No groups found for teacher" };
      }

      const groupIds = teacher.groups.map(g => g.id);
      const teacherGroups = await Group.find({ _id: { $in: groupIds } });

      // Remove any duplicate conversations first
      await this._removeDuplicateGroupConversations();

      const createdConversations = [];
      
      for (const group of teacherGroups) {
        let existing = await Conversation.findOne({
          type: "GROUP",
          groupId: group._id
        });
        
        if (!existing) {
          const conversation = await this._createGroupConversation(group, teacherId);
          if (conversation) {
            createdConversations.push({
              conversationId: conversation._id,
              groupName: group.name,
              participantsCount: conversation.participants.length
            });
          }
        }
      }
      
      return { 
        success: true, 
        message: `Created ${createdConversations.length} group conversations`,
        conversations: createdConversations
      };
    } catch (error) {
      console.error("Error initializing teacher group conversations:", error);
      throw error;
    }
  }

  /**
   * Initialize Group Conversations for Admin (All Groups)
   */
  async initializeAdminGroupConversations(adminId) {
    try {
      const allGroups = await Group.find({}).populate('teacher');
      if (!allGroups || allGroups.length === 0) {
        return { success: false, message: "No groups found in system" };
      }

      // Remove any duplicate conversations first
      await this._removeDuplicateGroupConversations();

      const createdConversations = [];
      
      for (const group of allGroups) {
        let existing = await Conversation.findOne({
          type: "GROUP",
          groupId: group._id
        });
        
        if (!existing && group.teacher) {
          const conversation = await this._createGroupConversation(group, group.teacher._id);
          if (conversation) {
            createdConversations.push({
              conversationId: conversation._id,
              groupName: group.name,
              participantsCount: conversation.participants.length
            });
          }
        }
      }
      
      return { 
        success: true, 
        message: `Created ${createdConversations.length} group conversations`,
        conversations: createdConversations
      };
    } catch (error) {
      console.error("Error initializing admin group conversations:", error);
      throw error;
    }
  }

  /**
   * Check if User Can Send to Group
   */
  async canSendToGroup(userId, userRole, groupId) {
    const normalizedRole = userRole.charAt(0).toUpperCase() + userRole.slice(1);
    const group = await Group.findById(groupId);
    
    if (!group) return false;

    // Admin can send to any group
    if (normalizedRole === "Admin") return true;

    // Teacher can send to their groups
    if (normalizedRole === "Teacher") {
      return group.teacher.toString() === userId.toString();
    }

    // Student can send to their group
    if (normalizedRole === "Student") {
      const student = await Student.findById(userId);
      return student && student.group === group.name;
    }

    return false;
  }

  /**
   * Ensure Group Conversation Exists
   */
  async ensureGroupConversationExists(groupId) {
    const existing = await Conversation.findOne({ type: 'GROUP', groupId: groupId });
    if (existing) return existing;

    const group = await Group.findById(groupId);
    if (!group) return null;

    return this._createGroupConversation(group, group.teacher);
  }

  /**
   * Private: Create Group Conversation
   */
  async _createGroupConversation(group, teacherId) {
    try {
      const students = await Student.find({ group: group.name }).select('_id');
      const studentIds = students.map(s => s._id);
      
      const participants = [
        { userId: teacherId, userModel: "Teacher" },
        ...studentIds.map(sid => ({ userId: sid, userModel: "Student" }))
      ];
      
      // ✅ Use findOneAndUpdate with upsert to prevent duplicates (Atomic Operation)
      const conversation = await Conversation.findOneAndUpdate(
        { type: "GROUP", groupId: group._id },
        {
          $setOnInsert: {
            type: "GROUP",
            groupId: group._id,
            participants,
            lastMessage: null,
            unreadCounts: participants.map(p => ({ userId: p.userId, count: 0 }))
          }
        },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );
      
      return conversation;
    } catch (error) {
      console.error(`Error creating group conversation for ${group.name}:`, error);
      return null;
    }
  }

  /**
   * Private: Remove Duplicate Group Conversations
   */
  async _removeDuplicateGroupConversations() {
    try {
      const allGroupConversations = await Conversation.find({ type: "GROUP" });
      
      const groupMap = new Map();
      const duplicates = [];
      
      for (const conv of allGroupConversations) {
        const groupId = conv.groupId.toString();
        
        if (groupMap.has(groupId)) {
          // Keep the newer one (or one with more data)
          const existing = groupMap.get(groupId);
          if (conv.lastMessage || conv.updatedAt > existing.updatedAt) {
            duplicates.push(existing._id);
            groupMap.set(groupId, conv);
          } else {
            duplicates.push(conv._id);
          }
        } else {
          groupMap.set(groupId, conv);
        }
      }
      
      if (duplicates.length > 0) {
        await Conversation.deleteMany({ _id: { $in: duplicates } });
        console.log(`Removed ${duplicates.length} duplicate group conversations`);
      }
    } catch (error) {
      console.error("Error removing duplicate conversations:", error);
    }
  }
}

module.exports = new GroupService();
