// ============================================================================
// ContactsService.js - Contacts & Permissions Management
// ============================================================================

const Student = require("../../schema/Student/Student");
const Teacher = require("../../schema/Teacher");
const Admin = require("../../schema/Admin");
const Secretary = require("../../schema/Secretary");
const TeacherAssistant = require("../../schema/TeacherAssistant");
const Group = require("../../schema/Group");

class ContactsService {
  /**
   * Get allowed contacts for a user based on their role
   * Returns both individuals AND groups
   */
  async getContacts(userId, role, search) {
    // Normalize role - handle camelCase like "teacherAssistant"
    let normalizedRole = role;
    if (role === 'teacherAssistant') {
      normalizedRole = 'TeacherAssistant';
    } else {
      normalizedRole = role.charAt(0).toUpperCase() + role.slice(1);
    }
    
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
      case "TeacherAssistant":
        result = await this._getTeacherAssistantContacts(userId, search);
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
   * - Teacher assistants assigned to them or their groups
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

    // 3. Get teacher assistants assigned to this teacher or their groups
    const assistants = await TeacherAssistant.find({
      $or: [
        { assignedTeacher: teacherId },
        { allowedGroups: { $in: groupIds } }
      ]
    })
      .select("firstName lastName avatar assistantId")
      .lean();
    
    assistants.forEach(assistant => {
      const fullName = `${assistant.firstName} ${assistant.lastName}`;
      if (!searchRegex || searchRegex.test(fullName)) {
        contacts.push({ ...assistant, role: "teacherAssistant" });
      }
    });

    // 4. Get all teacher's groups
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
   * Private: Get Teacher Assistant Contacts
   * - Teacher assigned to them (assignedTeacher) OR
   * - Teachers of their allowed groups (by comparing group IDs)
   * - NO students, NO admins, NO groups (DM only with their teacher)
   */
  async _getTeacherAssistantContacts(assistantId, search) {
    const assistant = await TeacherAssistant.findById(assistantId)
      .populate('assignedTeacher', 'firstName lastName avatar teacherId');
    
    if (!assistant) {
      console.log('❌ Assistant not found:', assistantId);
      return { contacts: [], groups: [] };
    }

    console.log('📋 Assistant data:', {
      id: assistant._id,
      assignedTeacher: assistant.assignedTeacher,
      allowedGroups: assistant.allowedGroups
    });

    const contacts = [];
    const searchRegex = search ? new RegExp(search, 'i') : null;
    const addedTeacherIds = new Set();

    // 1. Add assigned teacher if exists
    if (assistant.assignedTeacher) {
      const teacher = assistant.assignedTeacher;
      const fullName = `${teacher.firstName} ${teacher.lastName}`;
      if (!searchRegex || searchRegex.test(fullName)) {
        contacts.push({
          _id: teacher._id,
          firstName: teacher.firstName,
          lastName: teacher.lastName,
          avatar: teacher.avatar,
          teacherId: teacher.teacherId,
          role: "teacher"
        });
        addedTeacherIds.add(teacher._id.toString());
        console.log('✅ Added assigned teacher:', teacher.firstName, teacher.lastName);
      }
    }

    // 2. Find teachers by comparing allowed groups
    if (assistant.allowedGroups && assistant.allowedGroups.length > 0) {
      console.log('🔍 Looking for teachers with groups:', assistant.allowedGroups);
      
      // Get all groups that the assistant has access to
      const allowedGroupIds = assistant.allowedGroups.map(g => g.toString());
      
      // Find all groups and get their teachers
      const groups = await Group.find({ _id: { $in: allowedGroupIds } })
        .select('teacher name')
        .lean();
      
      console.log('📚 Found groups:', groups);
      
      // Extract unique teacher IDs from groups
      const teacherIds = groups
        .filter(g => g.teacher)
        .map(g => g.teacher.toString())
        .filter(id => !addedTeacherIds.has(id));
      
      const uniqueTeacherIds = [...new Set(teacherIds)];
      
      console.log('👨‍🏫 Teacher IDs to fetch:', uniqueTeacherIds);
      
      if (uniqueTeacherIds.length > 0) {
        const teachers = await Teacher.find({ _id: { $in: uniqueTeacherIds } })
          .select('firstName lastName avatar teacherId')
          .lean();
        
        console.log('✅ Found teachers:', teachers.map(t => `${t.firstName} ${t.lastName}`));
        
        teachers.forEach(teacher => {
          const fullName = `${teacher.firstName} ${teacher.lastName}`;
          if (!searchRegex || searchRegex.test(fullName)) {
            contacts.push({ ...teacher, role: "teacher" });
          }
        });
      }
    }

    console.log('📤 Final contacts for assistant:', contacts.length);

    // Teacher Assistant sees NO groups (DM only with teacher)
    const groups = [];

    return { contacts, groups };
  }

  /**
   * Check if user can chat with target
   */
  async canChat(senderId, senderRole, targetId, targetRole) {
    // Normalize roles - handle camelCase like "teacherAssistant"
    let normalizedSenderRole = senderRole;
    let normalizedTargetRole = targetRole;
    
    if (senderRole === 'teacherAssistant') {
      normalizedSenderRole = 'TeacherAssistant';
    } else {
      normalizedSenderRole = senderRole.charAt(0).toUpperCase() + senderRole.slice(1);
    }
    
    if (targetRole === 'teacherAssistant') {
      normalizedTargetRole = 'TeacherAssistant';
    } else {
      normalizedTargetRole = targetRole.charAt(0).toUpperCase() + targetRole.slice(1);
    }

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

    // Teacher Assistant permissions
    if (normalizedSenderRole === "TeacherAssistant") {
      return this._checkTeacherAssistantPermissions(senderId, targetId, normalizedTargetRole);
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

    // Can chat with their assigned teacher assistant
    if (targetRole === "TeacherAssistant") {
      const assistant = await TeacherAssistant.findById(targetId);
      if (!assistant) return false;
      
      // Check if this teacher is assigned to the assistant
      if (assistant.assignedTeacher && assistant.assignedTeacher.toString() === teacherId.toString()) {
        return true;
      }
      
      // Check if teacher has any group that assistant is allowed to access
      const teacher = await Teacher.findById(teacherId);
      if (!teacher || !teacher.groups) return false;
      
      const teacherGroupIds = teacher.groups.map(g => g.id.toString());
      const assistantGroupIds = (assistant.allowedGroups || []).map(g => g.toString());
      
      return teacherGroupIds.some(id => assistantGroupIds.includes(id));
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
    // Cannot chat with teacher assistants directly
    return false;
  }

  /**
   * Private: Check Teacher Assistant Permissions
   * - Can only chat with their assigned teacher OR teachers of their allowed groups
   */
  async _checkTeacherAssistantPermissions(assistantId, targetId, targetRole) {
    // Can only chat with teachers
    if (targetRole !== "Teacher") return false;

    const assistant = await TeacherAssistant.findById(assistantId);
    
    if (!assistant) return false;

    // Check if target is the assigned teacher
    if (assistant.assignedTeacher && assistant.assignedTeacher.toString() === targetId.toString()) {
      return true;
    }

    // Check if target teacher is from one of the allowed groups
    if (assistant.allowedGroups && assistant.allowedGroups.length > 0) {
      // Get groups and check their teachers
      const groups = await Group.find({ _id: { $in: assistant.allowedGroups } })
        .select('teacher')
        .lean();
      
      return groups.some(
        g => g.teacher && g.teacher.toString() === targetId.toString()
      );
    }

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
    if (await TeacherAssistant.exists({ _id: recipientId })) return "TeacherAssistant";
    return null;
  }
}

module.exports = new ContactsService();
