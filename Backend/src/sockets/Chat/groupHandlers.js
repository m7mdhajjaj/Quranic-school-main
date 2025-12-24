// ============================================================================
// groupHandlers.js - Socket Handlers for Group Operations
// ============================================================================

const Student = require("../../schema/Student/Student");
const Teacher = require("../../schema/Teacher");
const Group = require("../../schema/Group");
const Conversation = require("../../schema/Chat/Conversation");

module.exports = (io, socket, userId, userRole) => {
  /**
   * Auto-join Group Rooms based on user role
   */
  const autoJoinGroups = async () => {
    try {
      // 1. Join based on Conversations (Source of Truth for Chat)
      // This ensures that if a user is a participant in a group chat, they receive updates
      const conversations = await Conversation.find({
        type: "GROUP",
        "participants.userId": userId
      }).select("groupId");

      for (const conv of conversations) {
        if (conv.groupId) {
          socket.join(`group:${conv.groupId}`);
          if (process.env.NODE_ENV === 'development') {
            console.log(`✅ User ${userId} auto-joined group:${conv.groupId} (via Conversation)`);
          }
        }
      }

      // 2. Fallback / Legacy Logic (based on Schema relations)
      // This helps if Conversation document is missing or not yet created
      const normalizedRole = userRole ? userRole.toLowerCase() : "";

      if (normalizedRole === "student") {
        const student = await Student.findById(userId);
        if (student && student.group) {
          const group = await Group.findOne({ name: student.group });
          if (group) {
            socket.join(`group:${group._id}`);
            if (process.env.NODE_ENV === 'development') {
              console.log(`✅ Student ${userId} auto-joined group:${group._id} (via Group Name)`);
            }
          }
        }
      } else if (normalizedRole === "teacher") {
        const teacher = await Teacher.findById(userId);
        if (teacher && teacher.groups) {
          for (const group of teacher.groups) {
            socket.join(`group:${group.id}`);
            if (process.env.NODE_ENV === 'development') {
              console.log(`✅ Teacher ${userId} auto-joined group:${group.id} (via Teacher Groups)`);
            }
          }
        }
      } else if (normalizedRole === "admin") {
        const allGroups = await Group.find({});
        for (const group of allGroups) {
          socket.join(`group:${group._id}`);
        }
        if (process.env.NODE_ENV === 'development') {
          console.log(`✅ Admin ${userId} auto-joined all groups`);
        }
      }
    } catch (err) {
      console.error("Error auto-joining groups:", err);
    }
  };

  // Auto-join on connection
  autoJoinGroups();

  /**
   * Manual Join Group Room
   */
  socket.on("join:group", async (groupId) => {
    try {
      socket.join(`group:${groupId}`);
      console.log(`✅ User ${userId} joined group:${groupId}`);
    } catch (err) {
      console.error("Join group error:", err);
    }
  });

  /**
   * Leave Group Room
   */
  socket.on("leave:group", (groupId) => {
    try {
      socket.leave(`group:${groupId}`);
      console.log(`✅ User ${userId} left group:${groupId}`);
    } catch (err) {
      console.error("Leave group error:", err);
    }
  });
};
