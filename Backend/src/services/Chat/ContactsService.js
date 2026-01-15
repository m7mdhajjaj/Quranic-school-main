// ============================================================================
// ContactsService.js - Contacts & Permissions Management
// ============================================================================

const Student = require("../../schema/Student/Student");
const Teacher = require("../../schema/Teacher");
const Admin = require("../../schema/Admin");
const Secretary = require("../../schema/Secretary");
const Group = require("../../schema/Group");

class ContactsService {
  /**
   * Get allowed contacts for a user based on their role
   * Returns both individuals AND groups
   */
  async getContacts(userId, role, search) {
    const normalizedRole = role.charAt(0).toUpperCase() + role.slice(1);
    
    let result = { contacts: [], groups: [] };

    switch (normalizedRole) {
      case "Student":
        result = await this._getStudentContacts(userId, search);
        break;
      case "Teacher":
        result = await this._getTeacherContacts(userId, search);
        break;
      case "Admin":
        result = await this._getAdminContacts(userId, search);
        break;
      case "Secretary":
        result = await this._getSecretaryContacts(userId, search);
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
  async _getStudentContacts(studentId, search) {
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

    // Filter by search if provided
    const searchRegex = search ? new RegExp(search, 'i') : null;

    // 1. Add teacher as contact
    if (group.teacher) {
      const teacher = await Teacher.findById(group.teacher)
        .select("firstName lastName avatar teacherId")
        .lean();
      
      if (teacher) {
        const fullName = `${teacher.firstName} ${teacher.lastName}`;
        if (!searchRegex || searchRegex.test(fullName)) {
          contacts.push({ ...teacher, role: "teacher" });
        }
      }
    }

    // 2. Add student's group
    if (!searchRegex || searchRegex.test(group.name)) {
      groups.push({
        _id: group._id,
        name: group.name,
        description: group.description,
        image: group.image,
        teacher: group.teacher
      });
    }

    return { contacts, groups };
  }

  /**
   * Private: Get Teacher Contacts
   * - All students from their groups
   * - All admins
   * - All their groups
   */
  async _getTeacherContacts(teacherId, search) {
    const teacher = await Teacher.findById(teacherId);
    if (!teacher || !teacher.groups || teacher.groups.length === 0) {
      return { contacts: [], groups: [] };
    }

    const contacts = [];
    const groupIds = teacher.groups.map(g => g.id);
    const searchRegex = search ? new RegExp(search, 'i') : null;

    // 1. Get all students from teacher's groups
    const groupNames = teacher.groups.map(g => g.name);
    const students = await Student.find({ group: { $in: groupNames } })
      .select("firstName lastName avatar studentId group")
      .lean();
    
    students.forEach(s => {
      const fullName = `${s.firstName} ${s.lastName}`;
      if (!searchRegex || searchRegex.test(fullName)) {
        contacts.push({ ...s, role: "student" });
      }
    });

    // 2. Get all admins
    const admins = await Admin.find({})
      .select("firstName lastName avatar adminId")
      .lean();
    
    admins.forEach(a => {
      const fullName = `${a.firstName} ${a.lastName}`;
      if (!searchRegex || searchRegex.test(fullName)) {
        contacts.push({ ...a, role: "admin" });
      }
    });

    // 3. Get all teacher's groups
    const teacherGroups = await Group.find({ _id: { $in: groupIds } })
      .select("name description image teacher")
      .lean();

    const groups = [];
    teacherGroups.forEach(g => {
      if (!searchRegex || searchRegex.test(g.name)) {
        groups.push({
          _id: g._id,
          name: g.name,
          description: g.description,
          image: g.image,
          teacher: g.teacher
        });
      }
    });

    return { contacts, groups };
  }

  /**
   * Private: Get Admin Contacts
   * - All students
   * - All teachers
   * - Other admins
   * - All groups
   */
  async _getAdminContacts(adminId, search) {
    const searchRegex = search ? new RegExp(search, 'i') : null;
    const query = searchRegex ? {
      $or: [
        { firstName: searchRegex },
        { lastName: searchRegex }
      ]
    } : {};

    // For Admin, we can filter at DB level since we fetch everyone
    const [students, teachers, admins] = await Promise.all([
      Student.find(query).select("firstName lastName avatar studentId group").sort({ firstName: 1, lastName: 1 }).lean(),
      Teacher.find(query).select("firstName lastName avatar teacherId").sort({ firstName: 1, lastName: 1 }).lean(),
      Admin.find({ ...query, _id: { $ne: adminId } }).select("firstName lastName avatar adminId").sort({ firstName: 1, lastName: 1 }).lean()
    ]);
    
    const contacts = [
      ...students.map(s => ({ ...s, role: "student" })),
      ...teachers.map(t => ({ ...t, role: "teacher" })),
      ...admins.map(a => ({ ...a, role: "admin" }))
    ];
    
    // Admin sees NO groups
    const groups = [];

    return { contacts, groups };
  }

  /**
   * Private: Get Secretary Contacts
   * - All students
   * - All teachers
   * - All admins
   * - No groups (like Admin)
   */
  async _getSecretaryContacts(secretaryId, search) {
    const searchRegex = search ? new RegExp(search, 'i') : null;
    const query = searchRegex ? {
      $or: [
        { firstName: searchRegex },
        { lastName: searchRegex }
      ]
    } : {};

    // Secretary can see everyone
    const [students, teachers, admins, secretaries] = await Promise.all([
      Student.find(query).select("firstName lastName avatar studentId group").sort({ firstName: 1, lastName: 1 }).lean(),
      Teacher.find(query).select("firstName lastName avatar teacherId").sort({ firstName: 1, lastName: 1 }).lean(),
      Admin.find(query).select("firstName lastName avatar adminId").sort({ firstName: 1, lastName: 1 }).lean(),
      Secretary.find({ ...query, _id: { $ne: secretaryId } }).select("firstName lastName avatar secretaryId").sort({ firstName: 1, lastName: 1 }).lean()
    ]);
    
    const contacts = [
      ...students.map(s => ({ ...s, role: "student" })),
      ...teachers.map(t => ({ ...t, role: "teacher" })),
      ...admins.map(a => ({ ...a, role: "admin" })),
      ...secretaries.map(s => ({ ...s, role: "secretary" }))
    ];
    
    // Secretary sees NO groups
    const groups = [];

    return { contacts, groups };
  }

  /**
   * Check if user can chat with target
   */
  async canChat(senderId, senderRole, targetId, targetRole) {
    const normalizedSenderRole = senderRole.charAt(0).toUpperCase() + senderRole.slice(1);
    const normalizedTargetRole = targetRole.charAt(0).toUpperCase() + targetRole.slice(1);

    // Admin/Secretary can chat with anyone
    if (normalizedSenderRole === "Admin" || normalizedSenderRole === "Secretary") return true;
    
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
    if (await Secretary.exists({ _id: recipientId })) return "Secretary";
    return null;
  }
}

module.exports = new ContactsService();
