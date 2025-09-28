// Backend API Route لحالة المستخدم
// routes/userStatusRoutes.js

const express = require('express');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// GET /api/users/online - جلب قائمة المستخدمين النشطين (يجب أن يأتي قبل /:userId)
router.get('/online', protect, async (req, res) => {
  try {
    // جلب الطلاب النشطين
    const activeStudents = await Student.find({ isActive: true })
      .select('firstName lastName _id')
      .limit(50);

    // جلب المعلمين النشطين
    const activeTeachers = await Teacher.find({ isActive: true })
      .select('firstName lastName _id')
      .limit(50);

    const onlineUsers = [
      ...activeStudents.map(s => ({ ...s.toObject(), role: 'student' })),
      ...activeTeachers.map(t => ({ ...t.toObject(), role: 'teacher' }))
    ];

    res.json({
      success: true,
      count: onlineUsers.length,
      data: onlineUsers
    });

  } catch (error) {
    console.error('خطأ في جلب المستخدمين النشطين:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم',
      error: error.message
    });
  }
});

// GET /api/users/:userId/status - جلب حالة المستخدم
router.get('/:userId/status', protect, async (req, res) => {
  try {
    const { userId } = req.params;
    let user = null;

    // البحث في جدول الطلاب أولاً
    user = await Student.findById(userId).select('isActive firstName');
    
    // إذا لم يوجد، ابحث في جدول المعلمين
    if (!user) {
      user = await Teacher.findById(userId).select('isActive firstName');
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'المستخدم غير موجود'
      });
    }

    // إرسال حالة المستخدم
    res.json({
      success: true,
      data: {
        userId: user._id,
        isActive: user.isActive || false,
        isOnline: user.isActive || false, // يمكن تطويرها لاحقاً لـ realtime
        lastSeen: user.updatedAt,
        firstName: user.firstName
      }
    });

  } catch (error) {
    console.error('خطأ في جلب حالة المستخدم:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم',
      error: error.message
    });
  }
});

// PUT /api/users/:userId/status - تحديث حالة المستخدم
router.put('/:userId/status', protect, async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;

    // التحقق من الصلاحيات - فقط المدير أو المستخدم نفسه
    if (req.user.role !== 'admin' && req.user._id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'ليس لديك صلاحية لتحديث هذا المستخدم'
      });
    }

    let user = null;
    let model = null;

    // البحث في جدول الطلاب أولاً
    user = await Student.findById(userId);
    model = Student;
    
    // إذا لم يوجد، ابحث في جدول المعلمين
    if (!user) {
      user = await Teacher.findById(userId);
      model = Teacher;
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'المستخدم غير موجود'
      });
    }

    // تحديث الحالة
    user.isActive = isActive;
    await user.save();

    res.json({
      success: true,
      message: 'تم تحديث حالة المستخدم بنجاح',
      data: {
        userId: user._id,
        isActive: user.isActive,
        updatedAt: user.updatedAt
      }
    });

  } catch (error) {
    console.error('خطأ في تحديث حالة المستخدم:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم',
      error: error.message
    });
  }
});

module.exports = router;