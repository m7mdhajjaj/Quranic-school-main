// ============================================================================
// ContactsService.js - Contacts & Permissions Management
// ============================================================================

const Student = require("../../schema/Student/Student");
const Teacher = require("../../schema/Teacher");
const Admin = require("../../schema/Admin");
const Group = require("../../schema/Group");

class ContactsService {
  /**
   * Get allowed contacts for a user based on their role
   * Returns both individuals AND groups
   */
  async getContacts(userId, role) {
    const normalizedRole = role.charAt(0).toUpperCase() + role.slice(1);
    
    let result = { contacts: [], groups: [] };

    switch (normalizedRole) {
      case "Student":
        result = await this._getStudentContacts(userId);
        break;
      case "Teacher":
        result = await this._getTeacherContacts(userId);
        break;
      case "Admin":
        result = await this._getAdminContacts(userId);
        break;
    }

    // ✅ Deduplicate contacts by ID to ensure clean list
    if (result.contacts && result.contacts.length > 0) {
      const uniqueContacts = new Map();
      result.contacts.forEach(c => {
        if (c && c._id) {
          uniqueContacts.set(c._id.toString(), c);
        }
      });
      result.contacts = Array.from(uniqueContacts.values());
    }

    return result;
  }

  /**
   * Private: Get Student Contacts
   * - Teacher of their group ONLY
   * - Group chat ONLY (no individual student DM)
   */
  async _getStudentContacts(studentId) {
    const student = await Student.findById(studentId);
    if (!student || !student.group) {
      return { contacts: [], groups: [] };
    }

    const contacts = [];
    const groups = [];

    // Get student's group
    const group = await Group.findOne({ name: student.group });
    if (!group) {
      return { contacts: [], groups: [] };
    }

    // 1. Add teacher as contact
    if (group.teacher) {
      const teacher = await Teacher.findById(group.teacher)
        .select("firstName lastName avatar teacherId")
        .lean();
      
      if (teacher) {
        contacts.push({ ...teacher, role: "teacher" });
      }
    }

    // 2. Add student's group
    groups.push({
      _id: group._id,
      name: group.name,
      description: group.description,
      image: group.image,
      teacher: group.teacher
    });

    return { contacts, groups };
  }

  /**
   * Private: Get Teacher Contacts
   * - All students from their groups
   * - All admins
   * - All their groups
   */
  async _getTeacherContacts(teacherId) {
    const teacher = await Teacher.findById(teacherId);
    if (!teacher || !teacher.groups || teacher.groups.length === 0) {
      return { contacts: [], groups: [] };
    }

    const contacts = [];
    const groupIds = teacher.groups.map(g => g.id);

    // 1. Get all students from teacher's groups
    const groupNames = teacher.groups.map(g => g.name);
    const students = await Student.find({ group: { $in: groupNames } })
      .select("firstName lastName avatar studentId group")
      .lean();
    
    contacts.push(...students.map(s => ({ ...s, role: "student" })));

    // 2. Get all admins
    const admins = await Admin.find({})
      .select("firstName lastName avatar adminId")
      .lean();
    
    contacts.push(...admins.map(a => ({ ...a, role: "admin" })));

    // 3. Get all teacher's groups
    const teacherGroups = await Group.find({ _id: { $in: groupIds } })
      .select("name description image teacher")
      .lean();

    const groups = teacherGroups.map(g => ({
      _id: g._id,
      name: g.name,
      description: g.description,
      image: g.image,
      teacher: g.teacher
    }));

    return { contacts, groups };
  }

  /**
   * Private: Get Admin Contacts
   * - All students
   * - All teachers
   * - Other admins
   * - All groups
   */
  async _getAdminContacts(adminId) {
    const [students, teachers, admins, allGroups] = await Promise.all([
      Student.find({}).select("firstName lastName avatar studentId group").lean(),
      Teacher.find({}).select("firstName lastName avatar teacherId").lean(),
      Admin.find({ _id: { $ne: adminId } }).select("firstName lastName avatar adminId").lean(),
      Group.find({}).select("name description image teacher").lean()
    ]);
    
    const contacts = [
      ...students.map(s => ({ ...s, role: "student" })),
      ...teachers.map(t => ({ ...t, role: "teacher" })),
      ...admins.map(a => ({ ...a, role: "admin" }))
    ];
    
    const groups = allGroups.map(g => ({
      _id: g._id,
      name: g.name,
      description: g.description,
      image: g.image,
      teacher: g.teacher
    }));

    return { contacts, groups };
  }

  /**
   * Check if user can chat with target
   */
  async canChat(senderId, senderRole, targetId, targetRole) {
    const normalizedSenderRole = senderRole.charAt(0).toUpperCase() + senderRole.slice(1);
    const normalizedTargetRole = targetRole.charAt(0).toUpperCase() + targetRole.slice(1);

    // Admin can chat with anyone
    if (normalizedSenderRole === "Admin") return true;
    
    // Can't chat with self
    if (senderId.toString() === targetId.toString()) return false;

    // Teacher permissions
    if (normalizedSenderRole === "Teacher") {
      return this._checkTeacherPermissions(senderId, targetId, normalizedTargetRole);
    }

    // Student permissions
    if (normalizedSenderRole === "Student") {
      return this._checkStudentPermissions(senderId, targetId, normalizedTargetRole);
    }

    return false;
  }

  /**
   * Private: Check Teacher Permissions
   */
  async _checkTeacherPermissions(teacherId, targetId, targetRole) {
    // Can chat with any admin
    if (targetRole === "Admin") return true;
    
    // Can chat with students in their groups
    if (targetRole === "Student") {
      const teacher = await Teacher.findById(teacherId);
      const student = await Student.findById(targetId);
      
      if (!teacher || !student) return false;
      
      return teacher.groups.some(g => g.name === student.group);
    }

    return false;
  }

  /**
   * Private: Check Student Permissions
   */
  async _checkStudentPermissions(studentId, targetId, targetRole) {
    const student = await Student.findById(studentId);
    if (!student || !student.group) return false;

    // Can chat with teacher of their group
    if (targetRole === "Teacher") {
      const group = await Group.findOne({ name: student.group });
      return group && group.teacher.toString() === targetId.toString();
    }

    // Cannot chat with other students directly (group chat only)
    // Cannot chat with admins directly
    return false;
  }

  /**
   * Get recipient role from ID (Helper)
   */
  async getRecipientRole(recipientId) {
    if (await Student.exists({ _id: recipientId })) return "Student";
    if (await Teacher.exists({ _id: recipientId })) return "Teacher";
    if (await Admin.exists({ _id: recipientId })) return "Admin";
    return null;
  }
}

module.exports = new ContactsService();
