const Teacher = require("../../../schema/Teacher");
const Group = require("../../../schema/Group");
const Student = require("../../../schema/Student");
const bcrypt = require("bcryptjs");
const { 
  calculateAge, 
  generateTeacherId, 
  detectTeacherChanges, 
  buildNotificationMessage 
} = require("./utils.controller");
const { checkDuplicateFields } = require("../../../Validation/validators/duplicateChecker");

/**
 * دالة مساعدة لإزالة teacherId من البيانات للسكرتير
 * السكرتير ممنوع يشوف teacherId بغض النظر عن صلاحياته
 */
const removeTeacherIdForSecretary = (teachers, userRole) => {
  if (userRole === 'secretary') {
    return teachers.map(teacher => {
      const { teacherId, ...rest } = teacher;
      return rest;
    });
  }
  return teachers;
};

/**
 * جلب جميع المعلمين مع فلترة، بحث، ترتيب و pagination
 */
exports.getAllTeachers = async (req, res) => {
  try {
    const {
      gender,
      minAge,
      maxAge,
      search,
      group,
      sortBy = 'teacherId',
      sortOrder = 'asc',
      page = 1,
      limit = 1000
    } = req.query;

    // بناء query object للفلترة
    let query = {};

    // Gender filter
    if (gender && gender !== 'all') {
      query.gender = gender === 'ذكر' ? 'ذكر' : 'أنثى';
    }

    // Age range filter
    if (minAge || maxAge) {
      query.age = {};
      if (minAge && parseInt(minAge) > 0) {
        query.age.$gte = parseInt(minAge);
      }
      if (maxAge && parseInt(maxAge) < 100) {
        query.age.$lte = parseInt(maxAge);
      }
    }

    // Search filter المحسّن - البحث في جميع الحقول المهمة
    if (search && search.trim()) {
      const searchTerm = search.trim();
      const searchRegex = new RegExp(searchTerm, 'i');
      
      // البحث باستخدام $or في جميع الحقول النصية
      query.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { fatherName: searchRegex },
        { grandFatherName: searchRegex },
        { motherName: searchRegex },
        { email: searchRegex },
        { phoneNumber: searchRegex },
        { idNumber: searchRegex },
        { residence: searchRegex },
        // البحث في اسم الحلقة ضمن groups array
        { 'groups.name': searchRegex },
        // البحث في الاسم الكامل (firstName + lastName)
        { $expr: {
          $regexMatch: {
            input: { $concat: ['$firstName', ' ', '$lastName'] },
            regex: searchTerm,
            options: 'i'
          }
        }},
        // البحث في الاسم الثلاثي (firstName + fatherName + lastName)
        { $expr: {
          $regexMatch: {
            input: { 
              $concat: [
                '$firstName', ' ', 
                { $ifNull: ['$fatherName', ''] }, ' ',
                '$lastName'
              ] 
            },
            regex: searchTerm,
            options: 'i'
          }
        }},
        // البحث في الاسم الرباعي الكامل
        { $expr: {
          $regexMatch: {
            input: { 
              $concat: [
                '$firstName', ' ',
                { $ifNull: ['$fatherName', ''] }, ' ',
                { $ifNull: ['$grandFatherName', ''] }, ' ',
                '$lastName'
              ] 
            },
            regex: searchTerm,
            options: 'i'
          }
        }}
      ];
      
      // إذا كان البحث رقمي، ابحث في teacherId أيضاً
      if (!isNaN(searchTerm)) {
        query.$or.push({ teacherId: parseInt(searchTerm) });
      }
      
      console.log(`🔍 البحث عن: "${searchTerm}" في جميع الحقول (الاسم، الاسم الثلاثي، الرباعي، رقم الهوية، الحلقة...)`);
    }

    // بناء sort object
    let sort = {};
    const validSortFields = ['teacherId', 'firstName', 'lastName', 'age', 'email', 'createdAt'];
    if (validSortFields.includes(sortBy)) {
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    } else {
      sort.teacherId = 1; // default sort
    }

    // Pagination
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(1000, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    // تنفيذ الاستعلامات بالتوازي
    const [teachers, totalCount, allGroups] = await Promise.all([
      Teacher.find(query)
        .select("-password")
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Teacher.countDocuments(query),
      Group.find({}).select("name teacher _id").lean()
    ]);

    // فلترة حسب الحلقات إذا تم تحديد group filter
    let filteredTeachers = teachers;
    
    // إذا كان هناك بحث عن حلقة محددة في group filter
    if (group && group !== 'all') {
      if (group === 'withGroups') {
        // المعلمين الذين لديهم حلقات
        const teacherIdsWithGroups = new Set(
          allGroups.filter(g => g.teacher).map(g => g.teacher.toString())
        );
        filteredTeachers = teachers.filter(t => 
          teacherIdsWithGroups.has(t._id.toString()) ||
          (t.groups && Array.isArray(t.groups) && t.groups.length > 0)
        );
      } else if (group === 'withoutGroups') {
        // المعلمين الذين ليس لديهم حلقات
        const teacherIdsWithGroups = new Set(
          allGroups.filter(g => g.teacher).map(g => g.teacher.toString())
        );
        filteredTeachers = teachers.filter(t => 
          !teacherIdsWithGroups.has(t._id.toString()) &&
          (!t.groups || !Array.isArray(t.groups) || t.groups.length === 0)
        );
      } else {
        // البحث عن اسم حلقة محددة
        const groupRegex = new RegExp(group, 'i');
        const groupsMatchingSearch = allGroups.filter(g => 
          groupRegex.test(g.name)
        );
        const teacherIdsForGroups = new Set(
          groupsMatchingSearch.filter(g => g.teacher).map(g => g.teacher.toString())
        );
        
        filteredTeachers = teachers.filter(t => {
          const teacherId = t._id.toString();
          // إذا كان المعلم مرتبط بحلقة من الحلقات المطابقة
          if (teacherIdsForGroups.has(teacherId)) return true;
          
          // أو إذا كان لديه حلقة في البيانات القديمة تطابق البحث
          if (t.groups && Array.isArray(t.groups)) {
            return t.groups.some(g => {
              const groupName = typeof g === 'string' ? g : g.name;
              return groupRegex.test(groupName);
            });
          }
          
          return false;
        });
        
        console.log(`🔍 البحث عن حلقة "${group}" - وجد ${filteredTeachers.length} معلم`);
      }
    }

    // إنشاء Map للحلقات حسب المعلم (للبحث السريع)
    const groupsByTeacher = new Map();
    allGroups.forEach(group => {
      const teacherId = group.teacher?.toString();
      if (teacherId) {
        if (!groupsByTeacher.has(teacherId)) {
          groupsByTeacher.set(teacherId, []);
        }
        groupsByTeacher.get(teacherId).push({
          name: group.name,
          id: group._id,
        });
      }
    });

    // إضافة الحلقات لكل معلم
    const teachersWithGroups = filteredTeachers.map(teacher => {
      const teacherId = teacher._id.toString();
      const teacherGroups = groupsByTeacher.get(teacherId) || [];
      
      // دمج الحلقات من الـ Groups collection والـ groups field في المعلم
      let allGroups = [...teacherGroups];
      
      // إضافة الحلقات القديمة إذا كانت موجودة
      if (teacher.groups && Array.isArray(teacher.groups)) {
        teacher.groups.forEach(g => {
          const groupName = typeof g === 'string' ? g : g.name;
          // تجنب التكرار
          if (!allGroups.some(ag => ag.name === groupName)) {
            allGroups.push({
              name: groupName,
              id: typeof g === 'object' ? g.id : null,
            });
          }
        });
      }
      
      return {
        ...teacher,
        groups: allGroups.map((g, index) => ({
          ...g,
          number: index + 1
        }))
      };
    });

    // حساب عدد الصفحات
    const totalPages = Math.ceil(totalCount / limitNum);

    // إزالة teacherId للسكرتير
    const userRole = req.user?.role;
    const finalTeachers = removeTeacherIdForSecretary(teachersWithGroups, userRole);

    console.log(`✅ جلب ${finalTeachers.length} معلم من ${totalCount} - صفحة ${pageNum}/${totalPages}`);

    return res.status(200).json({
      success: true,
      data: finalTeachers,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalCount,
        pages: totalPages,
        hasMore: pageNum < totalPages
      },
      filters: {
        gender,
        minAge,
        maxAge,
        search,
        group,
        sortBy,
        sortOrder
      }
    });
  } catch (error) {
    console.error("Error fetching teachers:", error);
    return res
      .status(500)
      .json({ success: false, message: "حدث خطأ أثناء جلب المعلمين" });
  }
};

/**
 * جلب معلم واحد بواسطة ID
 */
exports.getTeacherById = async (req, res) => {
  try {
    console.log('🔍 getTeacherById - ID:', req.params.id);
    const teacher = await Teacher.findById(req.params.id).select("-password");
    console.log('🔍 getTeacherById - Teacher found:', teacher ? 'Yes' : 'No');
    if (!teacher) {
      return res
        .status(404)
        .json({ success: false, message: "المعلم غير موجود" });
    }
    return res.status(200).json({ success: true, data: teacher });
  } catch (error) {
    console.error("Error fetching teacher:", error);
    return res
      .status(500)
      .json({ success: false, message: "حدث خطأ أثناء جلب المعلم" });
  }
};

/**
 * إنشاء معلم جديد
 * البيانات تأتي مُتحققة من middleware (validateTeacherData)
 */
exports.createTeacher = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phoneNumber,
      fatherName,
      grandFatherName,
      motherName,
      idNumber,
      birthDate,
      gender,
      residence,
      groups = [],
      role = "teacher",
      password,
    } = req.body;

    // teacherId + password
    let teacherId;
    try {
      teacherId = await generateTeacherId();
      console.log(`✅ Generated sequential teacherId: ${teacherId}`);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message || "خطأ في إنشاء رقم المعلم",
      });
    }

    // تشفير كلمة المرور - استخدام teacherId كقيمة افتراضية
    const rawPass = password || idNumber || String(teacherId);
    const hashed = await bcrypt.hash(rawPass, 10);

    // age
    const age = calculateAge(birthDate);

    // التحقق من أن الحلقات المضافة للمعلم الجديد لا تحتوي على معلمين آخرين (محسّن)
    if (Array.isArray(groups) && groups.length > 0) {
      const groupIds = groups
        .map(groupItem => typeof groupItem === "object" ? groupItem.id : null)
        .filter(Boolean);
      
      if (groupIds.length > 0) {
        // جلب جميع الحلقات دفعة واحدة
        const existingGroups = await Group.find({
          _id: { $in: groupIds },
          teacher: { $exists: true, $ne: null, $ne: "" },
        }).select('name teacher');
        
        if (existingGroups.length > 0) {
          const groupName = existingGroups[0].name;
          return res.status(400).json({
            success: false,
            message: `الحلقة "${groupName}" مرتبطة بالفعل بمعلم آخر. لا يمكن للحلقة الواحدة أن يكون لها أكثر من معلم.`,
            field: "groups",
          });
        }
      }
    }

    const doc = await Teacher.create({
      teacherId,
      password: hashed,
      firstName,
      lastName,
      fatherName,
      grandFatherName,
      motherName,
      idNumber,
      birthDate,
      age,
      gender,
      residence,
      email,
      phoneNumber,
      groups: Array.isArray(groups)
        ? groups.map((group) => {
            // دعم البيانات القديمة والجديدة
            if (typeof group === "string") {
              return {
                id: null,
                name: group,
                number: 1,
              };
            }
            return group;
          })
        : [],
      role,
    });

    console.log("Teacher created successfully:", doc._id);

    // تحديث الحلقات لربطها بالمعلم الجديد (محسّن - عمليات متوازية)
    if (Array.isArray(groups) && groups.length > 0) {
      const teacherFullName = `${firstName} ${lastName}`;
      const groupIds = groups
        .map(groupItem => typeof groupItem === "object" ? groupItem.id : null)
        .filter(Boolean);

      if (groupIds.length > 0) {
        // تحديث جميع الحلقات بشكل متوازي
        const updatePromises = groupIds.map(groupId =>
          Group.findByIdAndUpdate(groupId, {
            teacher: doc._id,
            teacherName: teacherFullName,
          })
        );
        
        await Promise.all(updatePromises);
        
        // تحديث activeStatus للحلقات الجديدة
        const updatedGroups = await Group.find({ _id: { $in: groupIds } }).select('name');
        const groupNames = updatedGroups.map(g => g.name);
        if (groupNames.length > 0) {
          await Group.recalculateMultipleActiveStatus(groupNames).catch(err =>
            console.error('⚠️ خطأ في تحديث activeStatus:', err)
          );
        }
        
        console.log(
          `✅ تم ربط ${groupIds.length} حلقة بالمعلم ${doc._id} (${teacherFullName})`
        );
      }
    }

    return res
      .status(201)
      .json({ success: true, message: "تم إنشاء المعلم بنجاح", data: doc });
  } catch (error) {
    console.error("Error creating teacher:", error);
    return handleTeacherError(error, res, "إنشاء");
  }
};

/**
 * تحديث بيانات معلم
 * البيانات تأتي مُتحققة من middleware (validateTeacherData)
 */
exports.updateTeacher = async (req, res) => {
  try {
    const id = req.params.id;
    const updates = { ...req.body };

    // 1. جلب النسخة القديمة (قبل التعديل)
    const currentTeacher = await Teacher.findById(id);
    if (!currentTeacher) {
      return res.status(404).json({ success: false, message: "المعلم غير موجود" });
    }

    // Check if birthDate is being changed - apply edit limits
    if (updates.birthDate) {
      // We already fetched currentTeacher, so we can use it directly
      // const currentTeacher = await Teacher.findById(id).select(
      //   "birthDate birthDateEditHistory"
      // );

      if (currentTeacher) {
        // Check if birthDate is actually changing
        // Teacher schema uses String type (YYYY-MM-DD format)
        const currentBirthDate = currentTeacher.birthDate
          ? currentTeacher.birthDate.split("T")[0].trim()
          : null;
        const newBirthDateStr = updates.birthDate
          ? (typeof updates.birthDate === 'string'
              ? updates.birthDate.split("T")[0].trim()
              : new Date(updates.birthDate).toISOString().split("T")[0])
          : null;

        if (currentBirthDate !== newBirthDateStr && newBirthDateStr) {
          // BirthDate is being changed - check edit limits
          const oneMonthAgo = new Date();
          oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

          // Count recent edits (within last month)
          const recentEdits =
            currentTeacher.birthDateEditHistory?.filter(
              (edit) => new Date(edit.editDate) >= oneMonthAgo
            ) || [];

          const editCount = recentEdits.length;
          const allowed = editCount < 2;

          if (!allowed) {
            return res.status(400).json({
              success: false,
              message:
                "لا يمكنك تعديل تاريخ الميلاد أكثر من مرتين خلال شهر كامل من آخر تعديلاتك",
              editLimit: {
                allowed: false,
                remaining: 0,
                count: editCount,
              },
            });
          }

          // Add new edit to history (will be saved with the update)
          if (!updates.birthDateEditHistory) {
            updates.birthDateEditHistory =
              currentTeacher.birthDateEditHistory || [];
          }
          updates.birthDateEditHistory.push({ editDate: new Date() });
        }
      }
    }

    // معالجة كلمة المرور
    if (!updates.password || updates.password.trim() === "") {
      delete updates.password;
    } else {
      // Check if already hashed
      if (!updates.password.startsWith('$2')) {
        updates.password = await bcrypt.hash(updates.password, 10);
      }
    }

    // Handle age calculation
    if (updates.birthDate) {
      updates.age = calculateAge(updates.birthDate);
    }

    // --- إدارة الحلقات ---
    // Note: currentTeacher is already fetched at the top
    const teacherFullName = `${currentTeacher.firstName} ${currentTeacher.lastName}`;

    if (Array.isArray(updates.groups)) {
      try {
        // 1. جلب الحلقات الحالية للمعلم (مع التحقق من وجودها)
        const currentGroupIds = (currentTeacher.groups || [])
          .map((g) => g && g.id ? g.id : null)
          .filter(Boolean);

        // 2. جلب الحلقات الجديدة من الطلب (مع التحقق من وجودها)
        const newGroupIds = updates.groups
          .map((g) => g && g.id ? g.id : null)
          .filter(Boolean);

        // 3. تحديد الحلقات التي يجب إزالة المعلم منها
        const groupsToRemove = currentGroupIds.filter(
          (id) => id && !newGroupIds.some(newId => newId && newId.toString() === id.toString())
        );
      if (groupsToRemove.length > 0) {
        const removedGroups = await Group.find({ _id: { $in: groupsToRemove } }).select('name');
        
        await Group.updateMany(
          { _id: { $in: groupsToRemove } },
          { $unset: { teacher: "" } }
        );
        
        // تحديث activeStatus للحلقات التي تم إزالة المعلم منها
        const removedGroupNames = removedGroups.map(g => g.name);
        if (removedGroupNames.length > 0) {
          await Group.recalculateMultipleActiveStatus(removedGroupNames).catch(err =>
            console.error('⚠️ خطأ في تحديث activeStatus:', err)
          );
        }
      }

        // 4. التحقق من الحلقات الجديدة وتعيينها (محسّن - عمليات متوازية)
        const groupIds = updates.groups
          .map(g => g && g.id ? g.id : null)
          .filter(Boolean);
        
        if (groupIds.length > 0) {
          // جلب جميع الحلقات دفعة واحدة
          const groups = await Group.find({ _id: { $in: groupIds } });
          
          if (groups.length === 0) {
            // إذا لم يتم العثور على أي حلقة، إرجاع خطأ
            return res.status(400).json({
              success: false,
              message: 'لم يتم العثور على الحلقات المحددة',
              field: "groups",
            });
          }
          
          // التحقق من أن الحلقات غير مرتبطة بمعلمين آخرين
          for (const group of groups) {
            if (
              group.teacher &&
              group.teacher.toString() !== currentTeacher._id.toString()
            ) {
              return res.status(400).json({
                success: false,
                message: `الحلقة "${group.name}" مرتبطة بالفعل بمعلم آخر.`,
                field: "groups",
              });
            }
          }
          
          // تحديث جميع الحلقات بشكل متوازي
          const updatePromises = groups.map(group =>
            Group.updateOne(
              { _id: group._id },
              {
                teacher: currentTeacher._id,
                teacherName: teacherFullName,
              }
            )
          );
          
          await Promise.all(updatePromises);
          
          const processedGroups = groups.map(group => ({
            id: group._id,
            name: group.name
          }));
          const newGroupNames = groups.map(g => g.name).filter(Boolean);
          
          // تحديث القائمة بالبيانات الكاملة (لتجنب مشاكل الـ Schema والـ Notifications)
          updates.groups = processedGroups;
          
          // تحديث activeStatus للحلقات الجديدة
          if (newGroupNames.length > 0) {
            await Group.recalculateMultipleActiveStatus(newGroupNames).catch(err =>
              console.error('⚠️ خطأ في تحديث activeStatus:', err)
            );
          }
        } else {
          // إذا لم تكن هناك حلقات، تأكد من أن القائمة فارغة
          updates.groups = [];
        }
      } catch (groupsError) {
        console.error('❌ خطأ في معالجة الحلقات:', groupsError);
        return res.status(500).json({
          success: false,
          message: 'حدث خطأ أثناء معالجة الحلقات',
          error: process.env.NODE_ENV === 'development' ? groupsError.message : undefined,
        });
      }
    } else {
      // إذا لم تكن groups مصفوفة، تأكد من أنها مصفوفة فارغة
      updates.groups = [];
    }

    const updatedTeacher = await Teacher.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedTeacher) {
      return res
        .status(404)
        .json({ success: false, message: "المعلم غير موجود" });
    }

    // Cleanup old edit history entries (older than 2 months) for birthDate
    if (
      updatedTeacher.birthDateEditHistory &&
      updatedTeacher.birthDateEditHistory.length > 0
    ) {
      const twoMonthsAgo = new Date();
      twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);

      const cleanedHistory = updatedTeacher.birthDateEditHistory.filter(
        (edit) => new Date(edit.editDate) >= twoMonthsAgo
      );

      // Only update if we removed old entries
      if (cleanedHistory.length !== updatedTeacher.birthDateEditHistory.length) {
        await Teacher.findByIdAndUpdate(id, {
          birthDateEditHistory: cleanedHistory,
        });
        updatedTeacher.birthDateEditHistory = cleanedHistory;
      }
    }

    // 🔔 إرسال إشعارات بالتغييرات (فقط للحلقات)
    try {
      const notificationService = req.app.get('notificationService');
      if (notificationService) {
        const changes = detectTeacherChanges(currentTeacher, updates, updatedTeacher);
        const adminName = req.user ? `${req.user.firstName} ${req.user.lastName}` : "الإدارة";

        for (const change of changes) {
          // 1. إشعار للمعلم
          const notificationData = buildNotificationMessage(change);
          if (notificationData) {
            await notificationService.createNotification({
              recipient: updatedTeacher._id,
              recipientModel: 'Teacher',
              title: notificationData.title,
              message: notificationData.message,
              type: notificationData.type,
              link: notificationData.link,
              data: {
                groupId: change.meta?.groupId,
                groupName: change.meta?.groupName,
                action: change.type === 'GROUP_ADDED' ? 'group_assigned' : 'group_removed',
                senderName: adminName,
                createdBy: req.user ? req.user._id : null
              }
            });
          }

          // 2. إشعار لطلاب الحلقة
          if (change.meta?.groupName) {
            const students = await Student.find({ group: change.meta.groupName }).select('_id');
            if (students.length > 0) {
              const studentIds = students.map(s => s._id);
              const actionType = change.type === 'GROUP_ADDED' ? 'assigned' : 'removed';
              const teacherName = `${updatedTeacher.firstName} ${updatedTeacher.lastName}`;
              
              await notificationService.notifyGroupStudentsTeacherChanged(
                studentIds,
                change.meta.groupName,
                teacherName,
                actionType
              );
            }
          }
        }
      }
    } catch (notifyError) {
      console.error("❌ فشل إرسال إشعارات تحديث المعلم:", notifyError);
    }

    return res.status(200).json({
      success: true,
      message: "تم تحديث بيانات المعلم بنجاح",
      data: updatedTeacher,
    });
  } catch (error) {
    console.error("Error updating teacher:", error);
    return handleTeacherError(error, res, "تحديث");
  }
};

/**
 * حذف معلم (حذف نهائي)
 */
exports.deleteTeacher = async (req, res) => {
  try {
    const id = req.params.id;
    const teacher = await Teacher.findById(id);
    if (!teacher) {
      return res
        .status(404)
        .json({ success: false, message: "المعلم غير موجود" });
    }

    const teacherName = `${teacher.firstName} ${teacher.lastName}`;
    console.log(`🗑️ جاري حذف المعلم: ${teacherName}`);

    // 1. إزالة المعلم من الحلقات (باستخدام _id فقط)
    const relatedGroups = await Group.find({ teacher: teacher._id });

    if (relatedGroups.length > 0) {
      await Group.updateMany(
        { teacher: teacher._id },
        { $unset: { teacher: "", teacherName: "" } }
      );
      console.log(`✅ تم إزالة المعلم من ${relatedGroups.length} حلقة`);
      
      // تحديث activeStatus للحلقات التي تم إزالة المعلم منها
      const groupNames = relatedGroups.map(g => g.name);
      await Group.recalculateMultipleActiveStatus(groupNames).catch(err =>
        console.error('⚠️ خطأ في تحديث activeStatus:', err)
      );
    }

    // 2. إزالة المعلم من الطلاب
    const relatedStudents = await Student.find({
      teacher: teacherName,
    });

    if (relatedStudents.length > 0) {
      await Student.updateMany(
        { teacher: teacherName },
        { $unset: { teacher: "" } }
      );
      console.log(`✅ تم إزالة المعلم من ${relatedStudents.length} طالب`);
    }

    // 3. تحديث امتحانات المعلم - تحويلها للنظام بدلاً من حذفها
    const ExamSchedule = require("../../../schema/ExamShedule/ExamSchedule");
    const examUpdate = await ExamSchedule.updateMany(
      { teacher: teacherName },
      { $set: { teacher: "[معلم محذوف]" } }
    );
    console.log(`📝 تم تحديث ${examUpdate.modifiedCount} امتحان للمعلم المحذوف`);
    
    // 4. حذف المعلم نهائياً
    await Teacher.findByIdAndDelete(id);
    console.log(`🗑️ تم حذف المعلم ${teacherName} نهائياً من قاعدة البيانات`);

    return res.status(200).json({
      success: true,
      message: `تم حذف المعلم بنجاح. تم إزالته من ${relatedGroups.length} حلقة و ${relatedStudents.length} طالب.`,
      details: {
        groupsUpdated: relatedGroups.length,
        studentsUpdated: relatedStudents.length,
      },
    });
  } catch (error) {
    console.error("Error deleting teacher:", error);
    return res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء حذف المعلم",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * معالجة أخطاء المعلمين (دالة مساعدة)
 */
function handleTeacherError(error, res, operation) {
  if (error.name === "ValidationError") {
    const validationErrors = {};
    const errorMessages = [];

    Object.keys(error.errors).forEach((field) => {
      const fieldError = error.errors[field];
      validationErrors[field] = fieldError.message;

      if (field === "idNumber") {
        errorMessages.push("رقم الهوية يجب أن يتكون من 9 أرقام فقط");
      } else if (field === "phoneNumber") {
        errorMessages.push("رقم الهاتف يجب أن يبدأ بـ 05 ويتكون من 10 أرقام");
      } else if (field === "email") {
        errorMessages.push("البريد الإلكتروني غير صحيح");
      } else {
        errorMessages.push(`${field}: ${fieldError.message}`);
      }
    });

    return res.status(400).json({
      success: false,
      message: `خطأ في التحقق من البيانات: ${errorMessages.join(", ")}`,
      errors: validationErrors,
      validationErrors: errorMessages,
    });
  }

  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern)[0];
    const arabicFields = {
      idNumber: "رقم الهوية",
      phoneNumber: "رقم الهاتف",
      email: "البريد الإلكتروني"
    };

    return res.status(400).json({
      success: false,
      message: `${arabicFields[field] || field} موجود بالفعل في النظام`,
      field: field,
    });
  }

  return res.status(500).json({
    success: false,
    message: `حدث خطأ غير متوقع أثناء ${operation} بيانات المعلم`,
    error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
  });
}

/**
 * جلب المعلم مع جميع حلقاته وطلابه مع إحصائيات الغياب
 * هذا endpoint محسّن خصيصاً لصفحة الحضور والغياب
 * يستخدم الـ functions الموجودة في studentController
 */
exports.getTeacherWithGroupsAndStudents = async (req, res) => {
  try {
    const { id: teacherId } = req.params;
    console.log(`⚡ جلب بيانات المعلم مع الحلقات والطلاب - ID: ${teacherId}`);
    const startTime = Date.now();

    // 1. جلب المعلم
    const teacher = await Teacher.findById(teacherId).select(
      "teacherId firstName lastName fatherName groups"
    );

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "المعلم غير موجود",
      });
    }

    const teacherFullName = `${teacher.firstName} ${teacher.lastName}`;
    console.log(`👨‍🏫 المعلم: ${teacherFullName}`);

    // 2. جلب جميع حلقات المعلم من جدول Group
    const groups = await Group.find({
      $or: [
        { teacher: teacher._id },
        { teacher: teacher._id.toString() },
        { teacherName: teacherFullName },
      ],
    })
      .select("name _id")
      .lean();

    console.log(`📚 عدد الحلقات: ${groups.length}`);
    if (groups.length > 0) {
      console.log(`   الحلقات: ${groups.map((g) => g.name).join(", ")}`);
    }

    // 3. استخدام الـ function الموجودة في studentController للحصول على الطلاب مع إحصائيات الغياب
    const { getStudentsWithAbsenceStats } = require("../studentController/absence.controller");
    
    // محاكاة request object
    const mockReq = {
      query: {
        teacher: teacherFullName,
      },
    };

    // محاكاة response object
    let studentsWithStats = [];
    const mockRes = {
      json: (data) => {
        studentsWithStats = data;
        return mockRes;
      },
      status: (code) => mockRes,
    };

    // استدعاء الـ function الموجودة
    await getStudentsWithAbsenceStats(mockReq, mockRes);

    const duration = Date.now() - startTime;
    console.log(
      `✅ تم جلب بيانات المعلم مع ${groups.length} حلقة و ${studentsWithStats.length} طالب في ${duration}ms`
    );

    res.json({
      success: true,
      data: {
        teacher: {
          _id: teacher._id,
          teacherId: teacher.teacherId,
          name: teacherFullName,
        },
        groups: groups.map((g) => ({ _id: g._id, name: g.name })),
        students: studentsWithStats,
      },
    });
  } catch (error) {
    console.error("❌ خطأ في جلب بيانات المعلم مع الحلقات والطلاب:", error);
    res.status(500).json({
      success: false,
      message: error.message || "حدث خطأ أثناء جلب البيانات",
    });
  }
};

/**
 * التحقق من تكرار البيانات (للتحقق الفوري في الفرونت إند)
 */
exports.checkDuplicate = async (req, res) => {
  try {
    const { field, value, excludeId } = req.query;

    if (!field || !value) {
      return res.status(400).json({
        success: false,
        message: "يجب تحديد الحقل والقيمة",
      });
    }

    const data = { [field]: value };
    const duplicateError = await checkDuplicateFields(data, excludeId, 'teacher');

    if (duplicateError) {
      return res.json({
        success: false,
        isDuplicate: true,
        message: duplicateError.message,
        field: duplicateError.field,
        existingUserType: duplicateError.existingUserType,
      });
    }

    return res.json({
      success: true,
      isDuplicate: false,
      message: "القيمة متاحة",
    });
  } catch (error) {
    console.error("خطأ في التحقق من التكرار:", error);
    return res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء التحقق من البيانات",
    });
  }
};

/**
 * حذف مجموعة من المعلمين (Bulk Delete)
 */
exports.bulkDeleteTeachers = async (req, res) => {
  try {
    const { teacherIds } = req.body;

    if (!teacherIds || !Array.isArray(teacherIds) || teacherIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "يجب تحديد معرفات المعلمين المراد حذفهم",
      });
    }

    console.log(`🗑️ محاولة حذف ${teacherIds.length} معلم...`);

    // التحقق من وجود طلاب أو حلقات مرتبطة بأي معلم
    const teachersToDelete = await Teacher.find({
      _id: { $in: teacherIds }
    }).select('_id firstName lastName');

    const teachersWithGroups = await Group.countDocuments({
      teacher: { $in: teacherIds }
    });

    const teachersWithStudents = await Student.countDocuments({
      teacher: { $in: teachersToDelete.map(t => `${t.firstName} ${t.lastName}`) }
    });

    if (teachersWithGroups > 0 || teachersWithStudents > 0) {
      return res.status(400).json({
        success: false,
        message: `لا يمكن حذف المعلمين. بعضهم مرتبط بـ ${teachersWithGroups} حلقة و ${teachersWithStudents} طالب`,
        details: {
          groupsCount: teachersWithGroups,
          studentsCount: teachersWithStudents
        }
      });
    }

    const result = await Teacher.deleteMany({
      _id: { $in: teacherIds },
    });

    console.log(`✅ تم حذف ${result.deletedCount} معلم من أصل ${teacherIds.length}`);

    // Emit events if socket.io is available
    if (global.io) {
      console.log("📡 Broadcasting bulk teachers deleted event");
      global.io.emit("teachers:bulk-deleted", { 
        deletedCount: result.deletedCount,
        teacherIds 
      });
    }

    res.status(200).json({
      success: true,
      message: `تم حذف ${result.deletedCount} معلم بنجاح`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("❌ خطأ في حذف المعلمين:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء حذف المعلمين",
      error: error.message,
    });
  }
};

// ❌ تم حذف getStudentsByTeacherId - مكرر!
// استخدم بدلاً منه: GET /api/students/teacher/:teacher من Student Controller

/**
 * جلب الحلقات للمعلم في نموذج التعديل/الإضافة
 * - عند الإضافة: إرجاع الحلقات غير المرتبطة بأي معلم
 * - عند التعديل: إرجاع حلقات المعلم فقط + الحلقات غير المرتبطة (للإضافة)
 */
exports.getAvailableGroupsForTeacher = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const mongoose = require('mongoose');
    
    if (teacherId && teacherId !== 'new') {
      // عند التعديل: جلب حلقات المعلم الحالي + الحلقات المتاحة
      console.log(`📋 جلب حلقات المعلم ${teacherId} (تعديل)`);
      
      // جلب جميع الحلقات
      const allGroups = await Group.find({})
        .select('name number teacher teacherName description capacity isActive')
        .sort({ name: 1 })
        .lean();

      console.log(`📊 إجمالي الحلقات في النظام: ${allGroups.length}`);
      
      // تصفية الحلقات: المتاحة + حلقات المعلم الحالي
      const filteredGroups = allGroups.filter(group => {
        // إذا كانت الحلقة غير مرتبطة بأي معلم
        if (!group.teacher || group.teacher === '' || group.teacher === null) {
          return true;
        }
        
        // إذا كانت الحلقة مرتبطة بالمعلم الحالي
        const teacherStr = group.teacher.toString();
        if (teacherStr === teacherId || teacherStr === teacherId.toString()) {
          return true;
        }
        
        return false;
      });

      console.log(`✅ تم تصفية ${filteredGroups.length} حلقة`);
      
      // حساب عدد حلقات المعلم والحلقات المتاحة
      const teacherGroups = filteredGroups.filter(g => 
        g.teacher && g.teacher.toString() === teacherId
      );
      const availableGroups = filteredGroups.filter(g => 
        !g.teacher || g.teacher === '' || g.teacher === null
      );
      
      console.log(`   📌 حلقات المعلم: ${teacherGroups.length} - ${teacherGroups.map(g => g.name).join(', ')}`);
      console.log(`   📌 حلقات متاحة: ${availableGroups.length}`);

      return res.status(200).json({
        success: true,
        data: filteredGroups,
        count: filteredGroups.length
      });
    } else {
      // عند الإضافة: الحلقات غير المرتبطة فقط
      console.log('📋 جلب الحلقات المتاحة (إضافة معلم جديد)');
      
      const groups = await Group.find({})
        .select('name number teacher teacherName description capacity isActive')
        .sort({ name: 1 })
        .lean();

      // تصفية الحلقات غير المرتبطة فقط
      const availableGroups = groups.filter(g => 
        !g.teacher || g.teacher === '' || g.teacher === null
      );

      console.log(`✅ تم جلب ${availableGroups.length} حلقة متاحة من ${groups.length} حلقة`);

      return res.status(200).json({
        success: true,
        data: availableGroups,
        count: availableGroups.length
      });
    }
  } catch (error) {
    console.error('❌ خطأ في جلب الحلقات:', error);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب الحلقات',
      error: error.message
    });
  }
};

