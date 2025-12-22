// ============================================================================
// groupHandlers.js - Socket Handlers for Group Operations
// ============================================================================

const Student = require("../../schema/Student/Student");
const Teacher = require("../../schema/Teacher");
const Group = require("../../schema/Group");

module.exports = (io, socket, userId, userRole) => {
  /**
   * Auto-join Group Rooms based on user role
   */
  const autoJoinGroups = async () => {
    try {
      if (userRole === "student") {
        const student = await Student.findById(userId);
        if (student && student.group) {
          const group = await Group.findOne({ name: student.group });
          if (group) {
            socket.join(`group:${group._id}`);
            console.log(`✅ Student ${userId} auto-joined group:${group._id}`);
          }
        }
      } else if (userRole === "teacher") {
        const teacher = await Teacher.findById(userId);
        if (teacher && teacher.groups) {
          for (const group of teacher.groups) {
            socket.join(`group:${group.id}`);
            console.log(`✅ Teacher ${userId} auto-joined group:${group.id}`);
          }
        }
      } else if (userRole === "admin") {
        const allGroups = await Group.find({});
        for (const group of allGroups) {
          socket.join(`group:${group._id}`);
        }
        console.log(`✅ Admin ${userId} auto-joined all groups`);
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
