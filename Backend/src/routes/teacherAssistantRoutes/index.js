// routes/teacherAssistantRoutes/index.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const TeacherAssistant = require('../../schema/TeacherAssistant');
const Student = require('../../schema/Student');
const { protect } = require('../../middleware/auth/protect.middleware');
const { adminProtect } = require('../../middleware/auth/role.middleware');

/**
 * @route   GET /api/teacher-assistants/my-groups
 * @desc    الحصول على حلقات مساعد المدرس المسموح له بها
 * @access  TeacherAssistant only
 */
router.get('/my-groups', protect, async (req, res) => {
  try {
    // التحقق من أن المستخدم هو مساعد مدرس
    if (req.user.role !== 'teacherAssistant') {
      return res.status(403).json({
        success: false,
        message: 'هذا الـ endpoint مخصص لمساعدي المدرسين فقط',
      });
    }

    // جلب بيانات المساعد مع الحلقات المسموح بها
    const assistant = await TeacherAssistant.findById(req.user._id)
      .populate('allowedGroups', '_id name');

    if (!assistant) {
      return res.status(404).json({
        success: false,
        message: 'مساعد المدرس غير موجود',
      });
    }

    // تجهيز البيانات بنفس شكل getActiveGroups
    const groupsData = await Promise.all(
      (assistant.allowedGroups || []).map(async (group) => {
        const studentsCount = await Student.countDocuments({ group: group.name });
        return {
          _id: group._id,
          name: group.name,
          studentsCount,
        };
      })
    );

    res.status(200).json({
      success: true,
      message: 'تم جلب حلقات مساعد المدرس بنجاح',
      data: groupsData,
      count: groupsData.length,
    });
  } catch (error) {
    console.error('❌ خطأ في جلب حلقات مساعد المدرس:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب الحلقات',
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/teacher-assistants/my-students
 * @desc    الحصول على طلاب الحلقات المسموح لمساعد المدرس بالوصول إليها
 * @access  TeacherAssistant only
 */
router.get('/my-students', protect, async (req, res) => {
  try {
    // التحقق من أن المستخدم هو مساعد مدرس
    if (req.user.role !== 'teacherAssistant') {
      return res.status(403).json({
        success: false,
        message: 'هذا الـ endpoint مخصص لمساعدي المدرسين فقط',
      });
    }

    // جلب بيانات المساعد مع الحلقات المسموح بها
    const assistant = await TeacherAssistant.findById(req.user._id)
      .populate('allowedGroups', '_id name');

    if (!assistant) {
      return res.status(404).json({
        success: false,
        message: 'مساعد المدرس غير موجود',
      });
    }

    // جلب أسماء الحلقات المسموح بها
    const allowedGroupNames = (assistant.allowedGroups || []).map(g => g.name);

    if (allowedGroupNames.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'لا توجد حلقات مسموح بها',
        data: [],
        count: 0,
      });
    }

    // جلب طلاب هذه الحلقات
    const students = await Student.find({ 
      group: { $in: allowedGroupNames } 
    }).select('_id studentId firstName fatherName lastName group teacher avatar isActive');

    res.status(200).json({
      success: true,
      message: 'تم جلب طلاب الحلقات المسموح بها بنجاح',
      data: students,
      count: students.length,
    });
  } catch (error) {
    console.error('❌ خطأ في جلب طلاب مساعد المدرس:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب الطلاب',
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/teacher-assistants/stats
 * @desc    الحصول على إحصائيات مساعدي المدرسين
 * @access  Admin only
 */
router.get('/stats', adminProtect, async (req, res) => {
  try {
    const assistants = await TeacherAssistant.find().select('gender age');
    
    const total = assistants.length;
    const male = assistants.filter(a => a.gender === 'male' || a.gender === 'ذكر').length;
    const female = assistants.filter(a => a.gender === 'female' || a.gender === 'أنثى').length;
    
    const ages = assistants.filter(a => a.age).map(a => a.age);
    const avgAge = ages.length > 0 ? Math.round(ages.reduce((sum, age) => sum + age, 0) / ages.length) : 0;

    res.status(200).json({
      success: true,
      data: {
        total,
        male,
        female,
        avgAge,
        malePercentage: total > 0 ? Math.round((male / total) * 100) : 0,
        femalePercentage: total > 0 ? Math.round((female / total) * 100) : 0,
      },
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب الإحصائيات',
    });
  }
});

/**
 * @route   GET /api/teacher-assistants/next-id
 * @desc    الحصول على الرقم التالي لمساعد المدرس
 * @access  Admin only
 */
router.get('/next-id', adminProtect, async (req, res) => {
  try {
    const lastAssistant = await TeacherAssistant.findOne()
      .sort({ assistantId: -1 })
      .select('assistantId');
    
    const nextId = lastAssistant ? lastAssistant.assistantId + 1 : 601;

    res.status(200).json({
      success: true,
      data: { nextId },
    });
  } catch (error) {
    console.error('Error fetching next ID:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب الرقم التالي',
    });
  }
});

/**
 * @route   GET /api/teacher-assistants/check-duplicate
 * @desc    التحقق من تكرار القيم
 * @access  Admin only
 */
router.get('/check-duplicate', adminProtect, async (req, res) => {
  try {
    const { field, value, excludeId } = req.query;
    
    if (!field || !value) {
      return res.status(400).json({
        success: false,
        message: 'يجب تحديد الحقل والقيمة',
      });
    }

    const query = { [field]: value };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }

    const exists = await TeacherAssistant.findOne(query);

    res.status(200).json({
      success: true,
      data: { isDuplicate: !!exists },
    });
  } catch (error) {
    console.error('Error checking duplicate:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء التحقق من التكرار',
    });
  }
});

/**
 * @route   GET /api/teacher-assistants
 * @desc    الحصول على جميع مساعدي المدرسين
 * @access  Admin only
 */
router.get('/', adminProtect, async (req, res) => {
  try {
    const { search, gender, minAge, maxAge, sortBy, sortOrder } = req.query;
    
    // Build query
    const query = {};
    
    // Search filter
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phoneNumber: { $regex: search, $options: 'i' } },
      ];
      // Try to search by assistantId if it's a number
      const numSearch = parseInt(search);
      if (!isNaN(numSearch)) {
        query.$or.push({ assistantId: numSearch });
      }
    }
    
    // Gender filter
    if (gender) {
      query.gender = { $in: [gender, gender === 'ذكر' ? 'male' : 'female'] };
    }
    
    // Age filter
    if (minAge || maxAge) {
      query.age = {};
      if (minAge) query.age.$gte = parseInt(minAge);
      if (maxAge) query.age.$lte = parseInt(maxAge);
    }
    
    // Build sort
    const sort = {};
    if (sortBy) {
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    } else {
      sort.assistantId = -1;
    }

    const assistants = await TeacherAssistant.find(query)
      .select('-password')
      .populate('assignedTeacher', 'firstName lastName teacherId')
      .populate('allowedGroups', 'name')
      .sort(sort);

    res.status(200).json({
      success: true,
      count: assistants.length,
      data: assistants,
    });
  } catch (error) {
    console.error('Error fetching teacher assistants:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب بيانات مساعدي المدرسين',
    });
  }
});

/**
 * @route   GET /api/teacher-assistants/:id
 * @desc    الحصول على مساعد مدرس بواسطة ID
 * @access  Admin or Self
 */
router.get('/:id', protect, async (req, res) => {
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
});

/**
 * @route   POST /api/teacher-assistants
 * @desc    إنشاء مساعد مدرس جديد
 * @access  Admin only
 */
router.post('/', adminProtect, async (req, res) => {
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
      const lastAssistant = await TeacherAssistant.findOne()
        .sort({ assistantId: -1 })
        .select('assistantId');
      assistantId = lastAssistant ? lastAssistant.assistantId + 1 : 601;
    }

    // حساب العمر من تاريخ الميلاد
    let age;
    if (birthDate) {
      const birth = new Date(birthDate);
      const today = new Date();
      age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
    }

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

    // تشفير كلمة المرور
    const hashedPassword = await bcrypt.hash(password, 10);

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

    // إزالة كلمة المرور من الاستجابة
    const assistantResponse = assistant.toObject();
    delete assistantResponse.password;

    res.status(201).json({
      success: true,
      message: 'تم إنشاء مساعد المدرس بنجاح',
      data: assistantResponse,
    });
  } catch (error) {
    console.error('Error creating teacher assistant:', error);
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `هذا ${field === 'email' ? 'البريد الإلكتروني' : field === 'phoneNumber' ? 'رقم الهاتف' : 'المعرف'} مستخدم بالفعل`,
      });
    }

    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء إنشاء مساعد المدرس',
      error: error.message,
    });
  }
});

/**
 * @route   PUT /api/teacher-assistants/:id
 * @desc    تحديث بيانات مساعد مدرس
 * @access  Admin only
 */
router.put('/:id', adminProtect, async (req, res) => {
  try {
    const { password, birthDate, ...updateData } = req.body;

    // إذا تم إرسال كلمة مرور جديدة، قم بتشفيرها
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    // حساب العمر من تاريخ الميلاد إذا تم تحديثه
    if (birthDate) {
      updateData.birthDate = birthDate;
      const birth = new Date(birthDate);
      const today = new Date();
      let age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
      updateData.age = age;
    }

    const assistant = await TeacherAssistant.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!assistant) {
      return res.status(404).json({
        success: false,
        message: 'مساعد المدرس غير موجود',
      });
    }

    res.status(200).json({
      success: true,
      message: 'تم تحديث بيانات مساعد المدرس بنجاح',
      data: assistant,
    });
  } catch (error) {
    console.error('Error updating teacher assistant:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء تحديث بيانات مساعد المدرس',
    });
  }
});

/**
 * @route   POST /api/teacher-assistants/bulk-delete
 * @desc    حذف مجموعة من مساعدي المدرسين
 * @access  Admin only
 */
router.post('/bulk-delete', adminProtect, async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'يجب تحديد المساعدين المراد حذفهم',
      });
    }

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
});

/**
 * @route   DELETE /api/teacher-assistants/:id
 * @desc    حذف مساعد مدرس
 * @access  Admin only
 */
router.delete('/:id', adminProtect, async (req, res) => {
  try {
    const assistant = await TeacherAssistant.findByIdAndDelete(req.params.id);

    if (!assistant) {
      return res.status(404).json({
        success: false,
        message: 'مساعد المدرس غير موجود',
      });
    }

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
});

module.exports = router;
