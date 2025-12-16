/**
 * Student Helper Functions
 * دوال مساعدة لتجنب التكرار في Student Controller
 */

const Group = require('../../../schema/Group');
const Student = require('../../../schema/Student');
const { invalidateCache } = require('../../../middleware/cacheMiddleware');
const { getTeacherInfo } = require('../groupController/helpers');

/**
 * تطبيع اسم المعلم للمقارنة
 */
const normalizeTeacherName = (name) => {
  if (!name || typeof name !== 'string') return '';
  return name.trim().toLowerCase().replace(/\s+/g, ' ');
};

/**
 * التحقق من توافق المعلم مع الحلقة
 * @param {string} teacher - اسم المعلم
 * @param {string} group - اسم الحلقة
 * @returns {Promise<{valid: boolean, error?: string, groupData?: object}>}
 */
const validateTeacherGroupMatch = async (teacher, group) => {
  if (!teacher || !group) {
    return { valid: true }; // Skip validation if either is missing
  }

  // البحث عن الحلقة بطرق مختلفة
  let groupData = await Group.findOne({ name: group });

  if (!groupData) {
    groupData = await Group.findOne({
      name: { $regex: group.replace(/\s+/g, '\\s*'), $options: 'i' },
    });
  }

  if (!groupData) {
    groupData = await Group.findOne({
      name: { $regex: group, $options: 'i' },
    });
  }

  if (!groupData) {
    return {
      valid: false,
      error: `الحلقة "${group}" غير موجودة. يجب إنشاء الحلقة أولاً من صفحة إدارة الحلقات`,
    };
  }

  // جلب اسم المعلم الفعلي من الحلقة (إذا كان ObjectId)
  const groupTeacherData = await getTeacherInfo(groupData.teacher);
  const groupTeacherName = groupTeacherData.name || groupData.teacherName || '';

  // التحقق من تطابق المعلم
  const normalizedStudentTeacher = normalizeTeacherName(teacher);
  const normalizedGroupTeacher = normalizeTeacherName(groupTeacherName);

  const teacherMatches =
    normalizedStudentTeacher === normalizedGroupTeacher ||
    normalizedGroupTeacher.includes(normalizedStudentTeacher) ||
    normalizedStudentTeacher.includes(normalizedGroupTeacher);

  if (!teacherMatches) {
    return {
      valid: false,
      error: `المعلم "${teacher}" لا يطابق معلم الحلقة "${groupTeacherName}". يجب أن يكون الطالب في حلقة تابعة لنفس المعلم.`,
    };
  }

  return { valid: true, groupData };
};

/**
 * التحقق من سعة الحلقة
 * @param {string} groupName - اسم الحلقة
 * @param {string} currentStudentId - معرف الطالب الحالي (للتحديث)
 * @param {object} groupData - بيانات الحلقة (اختياري)
 * @returns {Promise<{valid: boolean, error?: string}>}
 */
const validateGroupCapacity = async (groupName, currentStudentId = null, groupData = null) => {
  if (!groupName) {
    return { valid: true };
  }

  // جلب بيانات الحلقة إذا لم تكن متوفرة
  if (!groupData) {
    groupData = await Group.findOne({ name: groupName });
    if (!groupData) {
      return { valid: true }; // Skip if group not found (will be caught by validateTeacherGroupMatch)
    }
  }

  // حساب عدد الطلاب الحاليين
  const query = { group: groupName };
  if (currentStudentId) {
    query._id = { $ne: currentStudentId }; // Exclude current student for updates
  }

  const currentStudentCount = await Student.countDocuments(query);
  const capacity = groupData.capacity || 30;

  if (currentStudentCount >= capacity) {
    return {
      valid: false,
      error: `الحلقة "${groupName}" ممتلئة! العدد الحالي: ${currentStudentCount}/${capacity}. لا يمكن إضافة المزيد من الطلاب.`,
    };
  }

  return { valid: true };
};

/**
 * بناء query للبحث والفلترة
 * @param {object} filters - معاملات الفلترة
 * @returns {object} - MongoDB query object
 */
const buildStudentQuery = (filters) => {
  const query = {};
  const { gender, minAge, maxAge, group, search } = filters;

  // Gender filter
  if (gender && gender !== 'all') {
    query.gender = gender;
  }

  // Age range filter
  if (minAge || maxAge) {
    query.age = {};
    if (minAge) query.age.$gte = parseInt(minAge);
    if (maxAge) query.age.$lte = parseInt(maxAge);
  }

  // Group filter
  if (group) {
    if (group === 'withGroups') {
      query.group = { $exists: true, $ne: null, $ne: '', $ne: 'غير محدد' };
    } else if (group === 'withoutGroups') {
      query.$or = [
        { group: { $exists: false } },
        { group: null },
        { group: '' },
        { group: 'غير محدد' },
      ];
    } else {
      query.group = group;
    }
  }

  // Search filter (across multiple fields)
  if (search) {
    const searchRegex = new RegExp(search, 'i');
    
    // Create variant with space after "عبد" or "عبد ال" patterns
    // Example: "عبدالله" → also search for "عبد الله"
    let searchWithSpace = search;
    if (search.match(/عبد[اأإ]/i)) {
      searchWithSpace = search.replace(/عبد([اأإ])/gi, 'عبد $1');
    }
    const searchWithSpaceRegex = searchWithSpace !== search ? new RegExp(searchWithSpace, 'i') : null;
    
    const searchConditions = [
      { firstName: searchRegex },
      { lastName: searchRegex },
      { fatherName: searchRegex },
      { grandFatherName: searchRegex },
      { motherName: searchRegex },
      { idNumber: searchRegex },
      { teacher: searchRegex },
      { group: searchRegex }, // البحث في اسم الحلقة
      // Search in full name
      {
        $expr: {
          $regexMatch: {
            input: {
              $concat: [
                { $ifNull: ['$firstName', ''] },
                ' ',
                { $ifNull: ['$fatherName', ''] },
                ' ',
                { $ifNull: ['$grandFatherName', ''] },
                ' ',
                { $ifNull: ['$lastName', ''] },
              ],
            },
            regex: search,
            options: 'i',
          },
        },
      },
    ];

    // Add search with space variants if applicable
    if (searchWithSpaceRegex) {
      searchConditions.push(
        { firstName: searchWithSpaceRegex },
        { lastName: searchWithSpaceRegex },
        { fatherName: searchWithSpaceRegex },
        { grandFatherName: searchWithSpaceRegex },
        { motherName: searchWithSpaceRegex },
        { teacher: searchWithSpaceRegex },
        { group: searchWithSpaceRegex },
        {
          $expr: {
            $regexMatch: {
              input: {
                $concat: [
                  { $ifNull: ['$firstName', ''] },
                  ' ',
                  { $ifNull: ['$fatherName', ''] },
                  ' ',
                  { $ifNull: ['$grandFatherName', ''] },
                  ' ',
                  { $ifNull: ['$lastName', ''] },
                ],
              },
              regex: searchWithSpace,
              options: 'i',
            },
          },
        }
      );
    }

    query.$or = searchConditions;
  }

  return query;
};

/**
 * إبطال جميع caches المتعلقة بالطلاب
 */
const invalidateStudentCaches = async () => {
  await invalidateCache('cache:/api/students*');
  
  // إبطال cache عدد الطلاب في الحلقات
  const { invalidateStudentCountsCache } = require('../groupController');
  invalidateStudentCountsCache();
};

/**
 * إرسال socket events للتحديثات
 * @param {string} eventType - نوع الحدث (created, updated, deleted)
 * @param {object} data - البيانات المرسلة
 */
const emitStudentEvent = (eventType, data) => {
  if (global.io) {
    const eventMap = {
      created: 'studentCreated',
      updated: 'studentUpdated',
      deleted: 'studentDeleted',
    };

    const eventName = eventMap[eventType];
    if (eventName) {
      console.log(`📡 Broadcasting ${eventName} event`);
      global.io.emit(eventName, data);
    }
  }
};

/**
 * إرسال إشعارات وتحديثات بعد تعديل الطالب
 * @param {object} io - Socket.io instance
 * @param {string} studentId - معرف الطالب
 */
const notifyStudentUpdate = async (io, studentId) => {
  // Invalidate caches
  await invalidateStudentCaches();

  // Notify dashboard

  // Emit profile update event
  if (io) {
    const updatedStudent = await Student.findById(studentId);
    io.to('profile').emit('profileUpdated', {
      user: updatedStudent,
      userId: studentId,
      userRole: 'student',
      timestamp: Date.now(),
    });
    console.log('✅ profileUpdated event emitted to profile room');
  }
};

/**
 * معالجة أخطاء الطلاب (دالة موحدة)
 * @param {Error} error - الخطأ
 * @param {object} res - Express response
 * @param {string} operation - اسم العملية (إضافة، تحديث، حذف)
 */
const handleStudentError = (error, res, operation) => {
  // Validation errors
  if (error.name === 'ValidationError') {
    const validationErrors = Object.keys(error.errors)
      .map((field) => `${field}: ${error.errors[field].message}`)
      .join(', ');

    return res.status(400).json({
      success: false,
      message: `خطأ في التحقق من البيانات: ${validationErrors}`,
      error: validationErrors,
    });
  }

  // Duplicate key errors
  if (error.code === 11000) {
    console.log('Duplicate detected - ignoring error');
    return res.status(201).json({
      success: true,
      message: 'تمت العملية بنجاح',
    });
  }

  // Generic errors
  return res.status(500).json({
    success: false,
    message: `حدث خطأ أثناء ${operation} بيانات الطالب`,
    error: error.message,
  });
};

/**
 * إضافة اسم المعلم الثلاثي للطلاب
 * @param {Array|Object} students - طالب واحد أو مصفوفة من الطلاب
 * @returns {Promise<Array|Object>} - الطلاب مع إضافة حقل teacherFullName
 */
const populateTeacherFullName = async (students) => {
  try {
    const isArray = Array.isArray(students);
    const studentsList = isArray ? students : [students];
    
    if (studentsList.length === 0) {
      return isArray ? [] : null;
    }

    // جمع أسماء الحلقات الفريدة
    const groupNames = [...new Set(
      studentsList
        .map(s => s && s.group ? s.group : null)
        .filter(g => g && g !== 'غير محدد' && g !== '' && typeof g === 'string')
    )];

    // جلب بيانات الحلقات والمعلمين دفعة واحدة
    const groupsMap = new Map();
    if (groupNames.length > 0) {
      try {
        const groups = await Group.find({ name: { $in: groupNames } })
          .select('name teacher')
          .lean();
        
        // جمع معرفات المعلمين الفريدة (مع الحفاظ على المرجع الأصلي)
        const teacherIdMap = new Map(); // Map from teacherId string to original teacherId
        for (const group of groups) {
          if (group && group.teacher) {
            try {
              const teacherIdStr = group.teacher.toString ? group.teacher.toString() : String(group.teacher);
              if (teacherIdStr && !teacherIdMap.has(teacherIdStr)) {
                teacherIdMap.set(teacherIdStr, group.teacher);
              }
            } catch (err) {
              console.error(`❌ خطأ في معالجة معرف المعلم للحلقة ${group.name}:`, err);
            }
          }
        }
        
        // جلب معلومات المعلمين دفعة واحدة
        const teachersMap = new Map();
        if (teacherIdMap.size > 0) {
          const teacherPromises = Array.from(teacherIdMap.entries()).map(async ([teacherIdStr, teacherId]) => {
            try {
              const teacherData = await getTeacherInfo(teacherId);
              return { teacherIdStr, name: teacherData && teacherData.name ? teacherData.name : 'غير محدد' };
            } catch (err) {
              console.error(`❌ خطأ في جلب معلومات المعلم ${teacherIdStr}:`, err);
              return { teacherIdStr, name: 'غير محدد' };
            }
          });
          const teacherResults = await Promise.all(teacherPromises);
          teacherResults.forEach(({ teacherIdStr, name }) => {
            if (teacherIdStr && name) {
              teachersMap.set(teacherIdStr, name);
            }
          });
        }
        
        // ربط الحلقات بأسماء المعلمين
        for (const group of groups) {
          if (group && group.name && group.teacher) {
            try {
              const teacherIdStr = group.teacher.toString ? group.teacher.toString() : String(group.teacher);
              const teacherName = teachersMap.get(teacherIdStr);
              if (teacherName) {
                groupsMap.set(group.name, teacherName);
              }
            } catch (err) {
              console.error(`❌ خطأ في ربط الحلقة ${group.name} بالمعلم:`, err);
            }
          }
        }
      } catch (err) {
        console.error('❌ خطأ في جلب بيانات الحلقات:', err);
      }
    }

    // إضافة teacherFullName لكل طالب
    const result = studentsList.map(student => {
      if (!student) return student;
      
      const studentObj = { ...student };
      const studentGroup = studentObj.group;
      
      if (studentGroup && studentGroup !== 'غير محدد' && studentGroup !== '' && groupsMap.has(studentGroup)) {
        studentObj.teacherFullName = groupsMap.get(studentGroup);
      } else if (studentObj.teacher && studentObj.teacher !== 'غير محدد' && studentObj.teacher !== '') {
        // إذا لم يكن هناك حلقة أو لم نجد المعلم من الحلقة، استخدم اسم المعلم الموجود في الطالب
        studentObj.teacherFullName = studentObj.teacher;
      } else {
        studentObj.teacherFullName = 'غير محدد';
      }
      
      return studentObj;
    });

    return isArray ? result : result[0];
  } catch (error) {
    console.error('❌ خطأ في populateTeacherFullName:', error);
    // في حالة الخطأ، نعيد البيانات الأصلية مع teacherFullName = teacher
    const isArray = Array.isArray(students);
    const studentsList = isArray ? students : [students];
    const result = studentsList.map(student => {
      if (!student) return student;
      return {
        ...student,
        teacherFullName: student.teacher || 'غير محدد'
      };
    });
    return isArray ? result : result[0];
  }
};

module.exports = {
  normalizeTeacherName,
  validateTeacherGroupMatch,
  validateGroupCapacity,
  buildStudentQuery,
  invalidateStudentCaches,
  emitStudentEvent,
  notifyStudentUpdate,
  handleStudentError,
  getTeacherInfo,
  populateTeacherFullName,
};
