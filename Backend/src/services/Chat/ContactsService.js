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
   * - Teacher of their group
   * - Group chat of their group
   * - Teacher Assistant of their group
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

    // 2. Add teacher assistants of this group
    const assistants = await TeacherAssistant.find({
      allowedGroups: group._id
    })
      .select("firstName lastName avatar assistantId")
      .lean();
    
    assistants.forEach(assistant => {
      const fullName = `${assistant.firstName} ${assistant.lastName}`;
      if (!searchRegex || searchRegex.test(fullName)) {
        contacts.push({ ...assistant, role: "teacherAssistant" });
      }
    });

    // 3. Add student's group
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
   * - All secretaries
   * - All their groups
   * - Teacher assistants assigned to their groups
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

    // 3. Get all secretaries
    const secretaries = await Secretary.find({})
      .select("firstName lastName avatar secretaryId")
      .lean();
    
    secretaries.forEach(s => {
      const fullName = `${s.firstName} ${s.lastName}`;
      if (!searchRegex || searchRegex.test(fullName)) {
        contacts.push({ ...s, role: "secretary" });
      }
    });

    // 4. Get teacher assistants assigned to this teacher's groups only
    const assistants = await TeacherAssistant.find({
      allowedGroups: { $in: groupIds }
    })
      .select("firstName lastName avatar assistantId")
      .lean();
    
    assistants.forEach(assistant => {
      const fullName = `${assistant.firstName} ${assistant.lastName}`;
      if (!searchRegex || searchRegex.test(fullName)) {
        contacts.push({ ...assistant, role: "teacherAssistant" });
      }
    });

    // 5. Get all teacher's groups
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
   * - All secretaries
   * - All teacher assistants
   * - NO groups (Admin cannot access groups)
   */
  async _getAdminContacts(adminId, search) {
    const searchRegex = search ? new RegExp(search, 'i') : null;
    const query = searchRegex ? {
      $or: [
        { firstName: searchRegex },
        { lastName: searchRegex }
      ]
    } : {};

    // Admin can see everyone EXCEPT groups
    const [students, teachers, admins, secretaries, assistants] = await Promise.all([
      Student.find(query).select("firstName lastName avatar studentId group").sort({ firstName: 1, lastName: 1 }).lean(),
      Teacher.find(query).select("firstName lastName avatar teacherId").sort({ firstName: 1, lastName: 1 }).lean(),
      Admin.find({ ...query, _id: { $ne: adminId } }).select("firstName lastName avatar adminId").sort({ firstName: 1, lastName: 1 }).lean(),
      Secretary.find(query).select("firstName lastName avatar secretaryId").sort({ firstName: 1, lastName: 1 }).lean(),
      TeacherAssistant.find(query).select("firstName lastName avatar assistantId").sort({ firstName: 1, lastName: 1 }).lean()
    ]);
    
    const contacts = [
      ...students.map(s => ({ ...s, role: "student" })),
      ...teachers.map(t => ({ ...t, role: "teacher" })),
      ...admins.map(a => ({ ...a, role: "admin" })),
      ...secretaries.map(s => ({ ...s, role: "secretary" })),
      ...assistants.map(a => ({ ...a, role: "teacherAssistant" }))
    ];
    
    // Admin sees NO groups
    const groups = [];

    return { contacts, groups };
  }

  /**
   * Private: Get Secretary Contacts
   * - All admins
   * - All students
   * - All teachers
   * - No groups, no teacher assistants, no other secretaries
   */
  async _getSecretaryContacts(secretaryId, search) {
    const searchRegex = search ? new RegExp(search, 'i') : null;
    const query = searchRegex ? {
      $or: [
        { firstName: searchRegex },
        { lastName: searchRegex }
      ]
    } : {};

    // Secretary can see: admins, students, teachers only
    const [students, teachers, admins] = await Promise.all([
      Student.find(query).select("firstName lastName avatar studentId group").sort({ firstName: 1, lastName: 1 }).lean(),
      Teacher.find(query).select("firstName lastName avatar teacherId").sort({ firstName: 1, lastName: 1 }).lean(),
      Admin.find(query).select("firstName lastName avatar adminId").sort({ firstName: 1, lastName: 1 }).lean()
    ]);
    
    const contacts = [
      ...admins.map(a => ({ ...a, role: "admin" })),
      ...students.map(s => ({ ...s, role: "student" })),
      ...teachers.map(t => ({ ...t, role: "teacher" }))
    ];
    
    // Secretary sees NO groups
    const groups = [];

    return { contacts, groups };
  }

  /**
   * Private: Get Teacher Assistant Contacts
   * - Students of their allowed groups
   * - Teachers of their allowed groups
   * - Their allowed groups (group chats)
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
    const groups = [];
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

    // 2. Find teachers and students by allowed groups
    if (assistant.allowedGroups && assistant.allowedGroups.length > 0) {
      console.log('🔍 Looking for teachers with groups:', assistant.allowedGroups);
      
      // Get all groups that the assistant has access to
      const allowedGroupIds = assistant.allowedGroups.map(g => g.toString());
      
      // Find all groups
      const allowedGroups = await Group.find({ _id: { $in: allowedGroupIds } })
        .select('teacher name description image')
        .lean();
      
      console.log('📚 Found groups:', allowedGroups);
      
      // Add groups to result
      allowedGroups.forEach(g => {
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

      // Get group names for student query
      const groupNames = allowedGroups.map(g => g.name);
      
      // 2a. Get students from allowed groups
      const students = await Student.find({ group: { $in: groupNames } })
        .select("firstName lastName avatar studentId group")
        .lean();
      
      students.forEach(s => {
        const fullName = `${s.firstName} ${s.lastName}`;
        if (!searchRegex || searchRegex.test(fullName)) {
          contacts.push({ ...s, role: "student" });
        }
      });
      
      console.log('👨‍🎓 Found students:', students.length);

      // 2b. Extract unique teacher IDs from groups
      const teacherIds = allowedGroups
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
    console.log('📤 Final groups for assistant:', groups.length);

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
    
    // Can chat with any secretary
    if (targetRole === "Secretary") return true;
    
    // Can chat with students in their groups
    if (targetRole === "Student") {
      const teacher = await Teacher.findById(teacherId);
      const student = await Student.findById(targetId);
      
      if (!teacher || !student) return false;
      
      return teacher.groups.some(g => g.name === student.group);
    }

    // Can chat with teacher assistants of their groups only
    if (targetRole === "TeacherAssistant") {
      const assistant = await TeacherAssistant.findById(targetId);
      if (!assistant) return false;
      
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

    // Get student's group
    const group = await Group.findOne({ name: student.group });
    if (!group) return false;

    // Can chat with teacher of their group
    if (targetRole === "Teacher") {
      return group.teacher.toString() === targetId.toString();
    }

    // Can chat with teacher assistant of their group
    if (targetRole === "TeacherAssistant") {
      const assistant = await TeacherAssistant.findById(targetId);
      if (!assistant || !assistant.allowedGroups) return false;
      
      // Check if assistant has access to student's group
      return assistant.allowedGroups.some(g => g.toString() === group._id.toString());
    }

    // Cannot chat with other students directly (group chat only)
    // Cannot chat with admins directly
    // Cannot chat with secretaries directly
    return false;
  }

  /**
   * Private: Check Teacher Assistant Permissions
   * - Can chat with students of their allowed groups
   * - Can chat with teachers of their allowed groups
   */
  async _checkTeacherAssistantPermissions(assistantId, targetId, targetRole) {
    const assistant = await TeacherAssistant.findById(assistantId);
    
    if (!assistant) return false;

    // Can chat with teachers of their groups
    if (targetRole === "Teacher") {
      // Check if target is the assigned teacher
      if (assistant.assignedTeacher && assistant.assignedTeacher.toString() === targetId.toString()) {
        return true;
      }

      // Check if target teacher is from one of the allowed groups
      if (assistant.allowedGroups && assistant.allowedGroups.length > 0) {
        const groups = await Group.find({ _id: { $in: assistant.allowedGroups } })
          .select('teacher')
          .lean();
        
        return groups.some(
          g => g.teacher && g.teacher.toString() === targetId.toString()
        );
      }
      return false;
    }

    // Can chat with students of their groups
    if (targetRole === "Student") {
      if (!assistant.allowedGroups || assistant.allowedGroups.length === 0) return false;
      
      // Get group names from allowed groups
      const groups = await Group.find({ _id: { $in: assistant.allowedGroups } })
        .select('name')
        .lean();
      const groupNames = groups.map(g => g.name);
      
      // Check if student is in one of the allowed groups
      const student = await Student.findById(targetId).select('group').lean();
      return student && groupNames.includes(student.group);
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
