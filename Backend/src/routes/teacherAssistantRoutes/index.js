// routes/teacherAssistantRoutes/index.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const TeacherAssistant = require('../../schema/TeacherAssistant');
const { protect } = require('../../middleware/auth/protect.middleware');
const { adminProtect } = require('../../middleware/auth/role.middleware');

/**
 * @route   GET /api/teacher-assistants
 * @desc    الحصول على جميع مساعدي المدرسين
 * @access  Admin only
 */
router.get('/', adminProtect, async (req, res) => {
  try {
    const assistants = await TeacherAssistant.find()
      .select('-password')
      .populate('assignedTeacher', 'firstName lastName teacherId')
      .populate('allowedGroups', 'name');

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
    const {
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
      age,
      gender,
      residence,
      assignedTeacher,
      allowedGroups,
    } = req.body;

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
    const { password, ...updateData } = req.body;

    // إذا تم إرسال كلمة مرور جديدة، قم بتشفيرها
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
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
