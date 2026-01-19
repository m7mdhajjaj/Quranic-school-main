// controllers/basicController/teacherAssistantController/crud.controller.js
const TeacherAssistant = require("../../../schema/TeacherAssistant");
const Group = require("../../../schema/Group");
const bcrypt = require("bcryptjs");
const { calculateAge, generateAssistantId } = require("./utils.controller");

/**
 * جلب جميع مساعدي المدرسين مع فلترة وبحث وترتيب
 * @route GET /api/teacher-assistants
 * @access Admin only
 */
const getAllAssistants = async (req, res) => {
  try {
    const { 
      search, 
      gender, 
      minAge, 
      maxAge,
      hasGroups, // فلتر الحلقات: 'all', 'with-groups', 'without-groups'
      sortBy = 'assistantId', 
      sortOrder = 'desc',
      page = 1,
      limit = 1000
    } = req.query;
    
    // Build query
    const query = {};
    
    // Search filter - البحث في جميع الحقول المهمة
    if (search && search.trim()) {
      const searchTerm = search.trim();
      const searchRegex = new RegExp(searchTerm, 'i');
      
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
      ];
      
      // Try to search by assistantId if it's a number
      const numSearch = parseInt(searchTerm);
      if (!isNaN(numSearch)) {
        query.$or.push({ assistantId: numSearch });
      }
      
      console.log(`🔍 البحث عن مساعد: "${searchTerm}"`);
    }
    
    // Gender filter
    if (gender && gender !== 'all') {
      query.gender = { $in: [gender, gender === 'ذكر' ? 'male' : 'female'] };
    }
    
    // Groups filter - فلتر الحلقات
    if (hasGroups && hasGroups !== 'all') {
      if (hasGroups === 'with-groups') {
        query.allowedGroups = { $exists: true, $ne: [], $not: { $size: 0 } };
      } else if (hasGroups === 'without-groups') {
        query.$or = [
          { allowedGroups: { $exists: false } },
          { allowedGroups: { $eq: [] } },
          { allowedGroups: { $size: 0 } }
        ];
      }
    }
    
    // Age filter
    if (minAge || maxAge) {
      query.age = {};
      if (minAge && parseInt(minAge) > 0) query.age.$gte = parseInt(minAge);
      if (maxAge && parseInt(maxAge) < 100) query.age.$lte = parseInt(maxAge);
    }
    
    // Build sort
    const sort = {};
    const validSortFields = ['assistantId', 'firstName', 'lastName', 'age', 'email', 'createdAt'];
    if (validSortFields.includes(sortBy)) {
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    } else {
      sort.assistantId = -1;
    }

    // Pagination
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(1000, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    // Execute query
    const [assistants, totalCount] = await Promise.all([
      TeacherAssistant.find(query)
        .select('-password')
        .populate('assignedTeacher', 'firstName lastName teacherId')
        .populate('allowedGroups', 'name')
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      TeacherAssistant.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      count: assistants.length,
      total: totalCount,
      page: pageNum,
      pages: Math.ceil(totalCount / limitNum),
      data: assistants,
    });
  } catch (error) {
    console.error('Error fetching teacher assistants:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب بيانات مساعدي المدرسين',
    });
  }
};

/**
 * جلب مساعد مدرس بواسطة ID
 * @route GET /api/teacher-assistants/:id
 * @access Admin or Self
 */
const getAssistantById = async (req, res) => {
  try {
    const assistant = await TeacherAssistant.findById(req.params.id)
      .select('-password')
      .populate('assignedTeacher', 'firstName lastName teacherId')
      .populate('allowedGroups', 'name');

    if (!assistant) {
      return res.status(404).json({
        success: false,
        message: 'مساعد المدرس غير موجود',
      });
    }

    // التحقق من الصلاحية (أدمن أو نفس المستخدم)
    if (req.user.role !== 'admin' && req.user._id.toString() !== assistant._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'غير مصرح لك بالوصول إلى هذه البيانات',
      });
    }

    res.status(200).json({
      success: true,
      data: assistant,
    });
  } catch (error) {
    console.error('Error fetching teacher assistant:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب بيانات مساعد المدرس',
    });
  }
};

/**
 * إنشاء مساعد مدرس جديد
 * @route POST /api/teacher-assistants
 * @access Admin only
 */
const createAssistant = async (req, res) => {
  try {
    let {
      assistantId,
      password,
      firstName,
      lastName,
      fatherName,
      grandFatherName,
      motherName,
      idNumber,
      email,
      phoneNumber,
      birthDate,
      gender,
      residence,
      assignedTeacher,
      allowedGroups,
    } = req.body;

    // توليد رقم المساعد تلقائياً إذا لم يتم توفيره
    if (!assistantId) {
      assistantId = await generateAssistantId();
    }

    // حساب العمر من تاريخ الميلاد
    const age = calculateAge(birthDate);

    // التحقق من عدم تكرار الـ assistantId
    const existingAssistant = await TeacherAssistant.findOne({ assistantId });
    if (existingAssistant) {
      return res.status(400).json({
        success: false,
        message: 'رقم مساعد المدرس مستخدم بالفعل',
      });
    }

    // التحقق من عدم تكرار البريد الإلكتروني
    const existingEmail = await TeacherAssistant.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: 'البريد الإلكتروني مستخدم بالفعل',
      });
    }

    // التحقق من عدم تكرار رقم الهاتف
    if (phoneNumber) {
      const existingPhone = await TeacherAssistant.findOne({ phoneNumber });
      if (existingPhone) {
        return res.status(400).json({
          success: false,
          message: 'رقم الهاتف مستخدم بالفعل',
        });
      }
    }

    // التحقق من أن كل حلقة لها مساعد واحد فقط
    if (allowedGroups && Array.isArray(allowedGroups) && allowedGroups.length > 0) {
      // التحقق من الحد الأقصى (حلقتين)
      if (allowedGroups.length > 2) {
        return res.status(400).json({
          success: false,
          message: 'يمكن للمساعد أن يشرف على حلقتين كحد أقصى',
        });
      }

      // التحقق من أن الحلقات ليس لها مساعد آخر
      const groupsWithAssistant = await TeacherAssistant.find({
        allowedGroups: { $in: allowedGroups }
      }).select('_id firstName lastName allowedGroups').populate('allowedGroups', 'name');

      if (groupsWithAssistant.length > 0) {
        // جمع أسماء الحلقات المحجوزة
        const takenGroups = [];
        for (const assistant of groupsWithAssistant) {
          for (const group of assistant.allowedGroups) {
            if (allowedGroups.includes(group._id.toString())) {
              takenGroups.push({
                groupName: group.name,
                assistantName: `${assistant.firstName} ${assistant.lastName}`
              });
            }
          }
        }
        
        if (takenGroups.length > 0) {
          const groupNames = takenGroups.map(g => `"${g.groupName}" (${g.assistantName})`).join('، ');
          return res.status(400).json({
            success: false,
            message: `الحلقات التالية لها مساعد بالفعل: ${groupNames}`,
            field: 'allowedGroups',
          });
        }
      }
    }

    // كلمة السر الافتراضية = رقم الهوية (يغيرها المساعد لاحقاً)
    const defaultPassword = idNumber;
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    const assistant = await TeacherAssistant.create({
      assistantId,
      password: hashedPassword,
      firstName,
      lastName,
      fatherName,
      grandFatherName,
      motherName,
      idNumber,
      email,
      phoneNumber,
      birthDate,
      age,
      gender,
      residence,
      assignedTeacher,
      allowedGroups,
    });

    // تحديث الحلقات لربطها بالمساعد
    if (allowedGroups && Array.isArray(allowedGroups) && allowedGroups.length > 0) {
      await Group.updateMany(
        { _id: { $in: allowedGroups } },
        { $set: { teacherAssistant: assistant._id } }
      );
    }

    // جلب البيانات مع populate
    const populatedAssistant = await TeacherAssistant.findById(assistant._id)
      .select('-password')
      .populate('assignedTeacher', 'firstName lastName teacherId')
      .populate('allowedGroups', 'name');

    res.status(201).json({
      success: true,
      message: 'تم إنشاء مساعد المدرس بنجاح',
      data: populatedAssistant,
    });
  } catch (error) {
    console.error('Error creating teacher assistant:', error);
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      const messages = {
        email: 'البريد الإلكتروني مستخدم بالفعل',
        phoneNumber: 'رقم الهاتف مستخدم بالفعل',
        assistantId: 'رقم المساعد مستخدم بالفعل',
        idNumber: 'رقم الهوية مستخدم بالفعل',
      };
      return res.status(400).json({
        success: false,
        message: messages[field] || `هذا ${field} مستخدم بالفعل`,
      });
    }

    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء إنشاء مساعد المدرس',
      error: error.message,
    });
  }
};

/**
 * تحديث بيانات مساعد مدرس
 * @route PUT /api/teacher-assistants/:id
 * @access Admin or Self
 */
const updateAssistant = async (req, res) => {
  try {
    const assistantId = req.params.id;
    const currentUserId = req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    const isSelf = currentUserId === assistantId;

    // التحقق من الصلاحية - أدمن أو المساعد نفسه
    if (!isAdmin && !isSelf) {
      return res.status(403).json({
        success: false,
        message: 'غير مصرح لك بتعديل بيانات هذا المساعد',
      });
    }

    const { password, birthDate, assignedTeacher, allowedGroups, ...updateData } = req.body;

    // فقط الأدمن يمكنه تعديل المعلم والحلقات المسموحة
    if (!isAdmin) {
      // المساعد لا يمكنه تعديل هذه الحقول
      delete updateData.assignedTeacher;
      delete updateData.allowedGroups;
    } else {
      // الأدمن يمكنه تعديل كل شيء
      if (assignedTeacher !== undefined) updateData.assignedTeacher = assignedTeacher;
      
      // التحقق من الحلقات قبل التحديث
      if (allowedGroups !== undefined) {
        // التحقق من الحد الأقصى (حلقتين)
        if (Array.isArray(allowedGroups) && allowedGroups.length > 2) {
          return res.status(400).json({
            success: false,
            message: 'يمكن للمساعد أن يشرف على حلقتين كحد أقصى',
          });
        }

        // التحقق من أن الحلقات ليس لها مساعد آخر (باستثناء المساعد الحالي)
        if (Array.isArray(allowedGroups) && allowedGroups.length > 0) {
          const groupsWithAssistant = await TeacherAssistant.find({
            _id: { $ne: assistantId }, // استثناء المساعد الحالي
            allowedGroups: { $in: allowedGroups }
          }).select('_id firstName lastName allowedGroups').populate('allowedGroups', 'name');

          if (groupsWithAssistant.length > 0) {
            const takenGroups = [];
            for (const assistant of groupsWithAssistant) {
              for (const group of assistant.allowedGroups) {
                if (allowedGroups.includes(group._id.toString())) {
                  takenGroups.push({
                    groupName: group.name,
                    assistantName: `${assistant.firstName} ${assistant.lastName}`
                  });
                }
              }
            }
            
            if (takenGroups.length > 0) {
              const groupNames = takenGroups.map(g => `"${g.groupName}" (${g.assistantName})`).join('، ');
              return res.status(400).json({
                success: false,
                message: `الحلقات التالية لها مساعد بالفعل: ${groupNames}`,
                field: 'allowedGroups',
              });
            }
          }
        }

        updateData.allowedGroups = allowedGroups;
      }
    }

    // إذا تم إرسال كلمة مرور جديدة، قم بتشفيرها (للأدمن فقط)
    if (password && isAdmin) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    // حساب العمر من تاريخ الميلاد إذا تم تحديثه
    if (birthDate) {
      updateData.birthDate = birthDate;
      updateData.age = calculateAge(birthDate);
    }

    // جلب الحلقات القديمة قبل التحديث
    const oldAssistant = await TeacherAssistant.findById(assistantId).select('allowedGroups');
    const oldGroups = oldAssistant?.allowedGroups?.map(g => g.toString()) || [];

    const assistant = await TeacherAssistant.findByIdAndUpdate(
      assistantId,
      updateData,
      { new: true, runValidators: true }
    )
      .select('-password')
      .populate('assignedTeacher', 'firstName lastName teacherId')
      .populate('allowedGroups', 'name');

    if (!assistant) {
      return res.status(404).json({
        success: false,
        message: 'مساعد المدرس غير موجود',
      });
    }

    // تحديث الحلقات - إزالة المساعد من الحلقات القديمة وإضافته للجديدة
    if (updateData.allowedGroups !== undefined) {
      const newGroups = Array.isArray(updateData.allowedGroups) ? updateData.allowedGroups.map(g => g.toString()) : [];
      
      // إزالة المساعد من الحلقات التي لم يعد فيها
      const removedGroups = oldGroups.filter(g => !newGroups.includes(g));
      if (removedGroups.length > 0) {
        await Group.updateMany(
          { _id: { $in: removedGroups } },
          { $set: { teacherAssistant: null } }
        );
      }
      
      // إضافة المساعد للحلقات الجديدة
      const addedGroups = newGroups.filter(g => !oldGroups.includes(g));
      if (addedGroups.length > 0) {
        await Group.updateMany(
          { _id: { $in: addedGroups } },
          { $set: { teacherAssistant: assistantId } }
        );
      }
    }

    res.status(200).json({
      success: true,
      message: 'تم تحديث بيانات مساعد المدرس بنجاح',
      data: assistant,
    });
  } catch (error) {
    console.error('Error updating teacher assistant:', error);
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      const messages = {
        email: 'البريد الإلكتروني مستخدم بالفعل',
        phoneNumber: 'رقم الهاتف مستخدم بالفعل',
      };
      return res.status(400).json({
        success: false,
        message: messages[field] || `هذا ${field} مستخدم بالفعل`,
      });
    }

    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء تحديث بيانات مساعد المدرس',
    });
  }
};

/**
 * حذف مساعد مدرس
 * @route DELETE /api/teacher-assistants/:id
 * @access Admin only
 */
const deleteAssistant = async (req, res) => {
  try {
    const assistant = await TeacherAssistant.findById(req.params.id);

    if (!assistant) {
      return res.status(404).json({
        success: false,
        message: 'مساعد المدرس غير موجود',
      });
    }

    // إزالة المساعد من الحلقات المرتبطة به
    if (assistant.allowedGroups && assistant.allowedGroups.length > 0) {
      await Group.updateMany(
        { _id: { $in: assistant.allowedGroups } },
        { $set: { teacherAssistant: null } }
      );
    }

    await TeacherAssistant.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'تم حذف مساعد المدرس بنجاح',
    });
  } catch (error) {
    console.error('Error deleting teacher assistant:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء حذف مساعد المدرس',
    });
  }
};

/**
 * حذف مجموعة من مساعدي المدرسين
 * @route POST /api/teacher-assistants/bulk-delete
 * @access Admin only
 */
const bulkDeleteAssistants = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'يجب تحديد المساعدين المراد حذفهم',
      });
    }

    // إزالة المساعدين من الحلقات المرتبطة بهم
    await Group.updateMany(
      { teacherAssistant: { $in: ids } },
      { $set: { teacherAssistant: null } }
    );

    const result = await TeacherAssistant.deleteMany({ _id: { $in: ids } });

    res.status(200).json({
      success: true,
      message: `تم حذف ${result.deletedCount} مساعد مدرس بنجاح`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error('Error bulk deleting teacher assistants:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء حذف مساعدي المدرسين',
    });
  }
};

module.exports = {
  getAllAssistants,
  getAssistantById,
  createAssistant,
  updateAssistant,
  deleteAssistant,
  bulkDeleteAssistants,
};
