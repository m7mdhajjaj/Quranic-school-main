const Student = require("../models/Student");
const Teacher = require("../models/Teacher");
const Admin = require("../models/Admin");

// Get user status (isActive, isOnline)
exports.getUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    let user = null;
    let userType = '';

    // Try to find user in different models with better caching
    const findUserPromises = [
      Student.findById(userId).lean(),
      Teacher.findById(userId).lean(),
      Admin.findById(userId).lean()
    ];

    const [student, teacher, admin] = await Promise.allSettled(findUserPromises);
    
    if (student.status === 'fulfilled' && student.value) {
      user = student.value;
      userType = 'student';
    } else if (teacher.status === 'fulfilled' && teacher.value) {
      user = teacher.value;
      userType = 'teacher';
    } else if (admin.status === 'fulfilled' && admin.value) {
      user = admin.value;
      userType = 'admin';
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "المستخدم غير موجود",
      });
    }

    // Check if user is online (in memory) with safer access
    const onlineUsers = global.onlineUsers || new Map();
    const isOnline = onlineUsers.has(userId);
    
    // استخدام منطق أفضل لتحديد الحالة النشطة
    const isActive = user.isActive !== false; // افتراضياً نشط إلا إذا كان محدد صراحة كغير نشط
    const isReallyOnline = isOnline && isActive;

    // Cache control headers لتحسين الأداء
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });

    // استجابة محسنة ومتوافقة
    res.status(200).json({
      success: true,
      // حقول عليا مطلوبة من الواجهة الحالية
      userId: user._id,
      isActive: isActive,
      isOnline: isReallyOnline,
      userType: userType,
      lastSeen: user.updatedAt,
      // كائن data المفصل للاستخدام المستقبلي
      data: {
        userId: user._id,
        isActive: isActive,
        isOnline: isReallyOnline,
        userType: userType,
        lastSeen: user.updatedAt,
        serverTimestamp: new Date().toISOString(),
      }
    });
  } catch (error) {
    console.error("Get user status error:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء جلب حالة المستخدم",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get all active users
exports.getActiveUsers = async (req, res) => {
  try {
    const activeStudents = await Student.find({ isActive: true }).select('_id firstName lastName studentId');
    const activeTeachers = await Teacher.find({ isActive: true }).select('_id firstName lastName teacherId');
    const activeAdmins = await Admin.find({ isActive: true }).select('_id firstName lastName adminId');

    const activeUsers = [
      ...activeStudents.map(user => ({ ...user.toObject(), role: 'student' })),
      ...activeTeachers.map(user => ({ ...user.toObject(), role: 'teacher' })),
      ...activeAdmins.map(user => ({ ...user.toObject(), role: 'admin' }))
    ];

    res.status(200).json({
      success: true,
      data: activeUsers,
      total: activeUsers.length
    });
  } catch (error) {
    console.error("Get active users error:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء جلب المستخدمين النشطين",
    });
  }
};

// Set user status manually (admin only)
exports.setUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: "حالة المستخدم يجب أن تكون true أو false",
      });
    }

    let user = null;
    let updateResult = null;

    // Try to update user in different models
    updateResult = await Student.findByIdAndUpdate(userId, { isActive }, { new: true });
    if (updateResult) {
      user = updateResult;
    } else {
      updateResult = await Teacher.findByIdAndUpdate(userId, { isActive }, { new: true });
      if (updateResult) {
        user = updateResult;
      } else {
        updateResult = await Admin.findByIdAndUpdate(userId, { isActive }, { new: true });
        if (updateResult) {
          user = updateResult;
        }
      }
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "المستخدم غير موجود",
      });
    }

    res.status(200).json({
      success: true,
      message: `تم ${isActive ? 'تفعيل' : 'إلغاء تفعيل'} المستخدم بنجاح`,
      data: {
        userId: user._id,
        isActive: user.isActive,
      }
    });
  } catch (error) {
    console.error("Set user status error:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء تعديل حالة المستخدم",
    });
  }
};