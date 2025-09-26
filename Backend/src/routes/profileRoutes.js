// routes/profileRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const jwt = require('jsonwebtoken');

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'رمز الوصول مطلوب' 
    });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ 
        success: false, 
        message: 'رمز وصول غير صحيح' 
      });
    }
    req.user = user;
    next();
  });
};

// Storage configuration for avatar uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../../public/uploads/avatars');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, `avatar-${uniqueSuffix}${extension}`);
  }
});

const fileFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('يُسمح فقط بملفات الصور'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Get current user profile
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const userType = req.user.role || 'student';
    
    let user;
    if (userType === 'student') {
      user = await Student.findById(userId).select('-password');
    } else {
      user = await Teacher.findById(userId).select('-password');
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'المستخدم غير موجود'
      });
    }

    res.json({
      success: true,
      user: user
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
});

// Update user profile
router.put('/me', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const userType = req.user.role || 'student';
    const updateData = req.body;

    // Remove sensitive fields that shouldn't be updated via this endpoint
    delete updateData.password;
    delete updateData._id;
    delete updateData.studentId;
    delete updateData.teacherId;

    let updatedUser;
    if (userType === 'student') {
      updatedUser = await Student.findByIdAndUpdate(
        userId, 
        updateData, 
        { new: true, runValidators: true }
      ).select('-password');
    } else {
      updatedUser = await Teacher.findByIdAndUpdate(
        userId, 
        updateData, 
        { new: true, runValidators: true }
      ).select('-password');
    }

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'المستخدم غير موجود'
      });
    }

    res.json({
      success: true,
      message: 'تم تحديث البيانات بنجاح',
      data: updatedUser
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'بيانات غير صحيحة',
        errors: errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
});

// Upload profile avatar
router.post('/avatar', authenticateToken, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'لم يتم رفع أي ملف'
      });
    }

    const userId = req.user.id || req.user._id;
    const userType = req.user.role || 'student';
    const avatarFileName = `avatars/${req.file.filename}`;

    let user;
    if (userType === 'student') {
      // Remove old avatar if exists
      const existingUser = await Student.findById(userId);
      if (existingUser && existingUser.avatar) {
        const oldAvatarPath = path.join(__dirname, '../../public/uploads', existingUser.avatar);
        if (fs.existsSync(oldAvatarPath)) {
          fs.unlinkSync(oldAvatarPath);
        }
      }

      user = await Student.findByIdAndUpdate(
        userId,
        { avatar: avatarFileName },
        { new: true }
      ).select('-password');
    } else {
      // Remove old avatar if exists
      const existingUser = await Teacher.findById(userId);
      if (existingUser && existingUser.avatar) {
        const oldAvatarPath = path.join(__dirname, '../../public/uploads', existingUser.avatar);
        if (fs.existsSync(oldAvatarPath)) {
          fs.unlinkSync(oldAvatarPath);
        }
      }

      user = await Teacher.findByIdAndUpdate(
        userId,
        { avatar: avatarFileName },
        { new: true }
      ).select('-password');
    }

    res.json({
      success: true,
      message: 'تم تحديث الصورة الشخصية بنجاح',
      avatar: avatarFileName,
      user: user
    });
  } catch (error) {
    console.error('Error uploading avatar:', error);
    
    // Clean up uploaded file if there was an error
    if (req.file) {
      const filePath = req.file.path;
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    res.status(500).json({
      success: false,
      message: 'خطأ في رفع الصورة'
    });
  }
});

// Delete profile avatar
router.delete('/avatar', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const userType = req.user.role || 'student';

    let user;
    if (userType === 'student') {
      const existingUser = await Student.findById(userId);
      if (existingUser && existingUser.avatar) {
        const avatarPath = path.join(__dirname, '../../public/uploads', existingUser.avatar);
        if (fs.existsSync(avatarPath)) {
          fs.unlinkSync(avatarPath);
        }
      }

      user = await Student.findByIdAndUpdate(
        userId,
        { $unset: { avatar: 1 } },
        { new: true }
      ).select('-password');
    } else {
      const existingUser = await Teacher.findById(userId);
      if (existingUser && existingUser.avatar) {
        const avatarPath = path.join(__dirname, '../../public/uploads', existingUser.avatar);
        if (fs.existsSync(avatarPath)) {
          fs.unlinkSync(avatarPath);
        }
      }

      user = await Teacher.findByIdAndUpdate(
        userId,
        { $unset: { avatar: 1 } },
        { new: true }
      ).select('-password');
    }

    res.json({
      success: true,
      message: 'تم حذف الصورة الشخصية بنجاح',
      user: user
    });
  } catch (error) {
    console.error('Error deleting avatar:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في حذف الصورة'
    });
  }
});

// Get user by ID (for teachers/admins to view other profiles)
router.get('/user/:id', authenticateToken, async (req, res) => {
  try {
    const requestingUserRole = req.user.role;
    
    // Only teachers and admins can view other profiles
    if (requestingUserRole !== 'teacher' && requestingUserRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'غير مسموح لك بعرض هذه البيانات'
      });
    }

    const userId = req.params.id;
    
    // Try to find in students first, then teachers
    let user = await Student.findById(userId).select('-password');
    let userType = 'student';
    
    if (!user) {
      user = await Teacher.findById(userId).select('-password');
      userType = 'teacher';
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'المستخدم غير موجود'
      });
    }

    res.json({
      success: true,
      user: user,
      userType: userType
    });
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
});

module.exports = router;