// Validation/ProfileValidation.js
// Profile validation middleware that uses role-based validation
// يستخدم validation من TeacherValidation, StudentValidation, AdminValidation حسب الـ role

const { validateTeacherData } = require('../Teacher/TeacherValidation');
const { validateStudentData } = require('../Student/StudentValidation');
const { validateAdminData } = require('../Admin/AdminValidation');

/**
 * Main validation middleware for profile data based on user role
 * يتحقق من بيانات الملف الشخصي حسب نوع المستخدم
 * 
 * للمعلمين: يستخدم validateTeacherData
 * للطلاب: يستخدم validateStudentData
 * للأدمن: يستخدم validateAdminData
 */
const validateProfileData = async (req, res, next) => {
  try {
    // Get user role from authenticated user
    const userRole = req.user?.role;
    
    console.log('🔍 validateProfileData - User Role:', userRole);
    console.log('🔍 validateProfileData - Request Body:', req.body);

    // If no role found, return error
    if (!userRole) {
      return res.status(401).json({
        success: false,
        message: 'غير مصرح، يرجى تسجيل الدخول',
      });
    }

    // Choose validation based on role
    if (userRole === 'teacher') {
      console.log('📚 Using Teacher Validation');
      return validateTeacherData(req, res, next);
    } else if (userRole === 'student') {
      console.log('📚 Using Student Validation');
      return validateStudentData(req, res, next);
    } else if (userRole === 'admin') {
      console.log('📚 Using Admin Validation');
      return validateAdminData(req, res, next);
    } else {
      // Unknown role - pass through without validation
      console.log('⚠️ Unknown role, passing through without validation');
      return next();
    }
  } catch (error) {
    console.error('❌ خطأ في validateProfileData:', error);
    return res.status(500).json({
      success: false,
      message: 'خطأ في التحقق من بيانات الملف الشخصي',
      error: error.message,
    });
  }
};

/**
 * Validate profile image/avatar data
 * التحقق من صحة بيانات صورة الملف الشخصي
 */
const validateProfileImage = (image) => {
  if (!image) {
    return { isValid: true, value: null }; // Optional field
  }

  const errors = [];
  const validatedImage = {};

  // Validate image URL/path
  if (image.url || image.path) {
    const imagePath = (image.url || image.path).toString().trim();
    if (imagePath.length > 0 && imagePath.length <= 500) {
      validatedImage.url = imagePath;
    } else {
      errors.push('مسار الصورة غير صحيح');
    }
  }

  // Validate image file name
  if (image.fileName) {
    const fileName = image.fileName.toString().trim();
    if (fileName.length > 0 && fileName.length <= 255) {
      const safeFileName = fileName.replace(
        /[^a-zA-Z0-9\u0600-\u06FF._-]/g,
        '_'
      );
      validatedImage.fileName = safeFileName;
    } else {
      errors.push('اسم ملف الصورة غير صحيح');
    }
  }

  // Validate image size
  if (image.size) {
    const imageSize = parseInt(image.size);
    if (isNaN(imageSize) || imageSize <= 0) {
      errors.push('حجم الصورة غير صحيح');
    } else if (imageSize > 5 * 1024 * 1024) {
      // 5MB limit
      errors.push('حجم الصورة كبير جداً (الحد الأقصى 5 ميجابايت)');
    } else {
      validatedImage.size = imageSize;
    }
  }

  // Validate image type
  if (image.type || image.mimeType) {
    const imageType = (image.type || image.mimeType)
      .toString()
      .trim()
      .toLowerCase();
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

    if (allowedTypes.includes(imageType)) {
      validatedImage.type = imageType;
    } else {
      errors.push(
        'نوع الصورة غير مدعوم (يجب أن تكون JPG, PNG, GIF, أو WEBP)'
      );
    }
  }

  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  return { isValid: true, value: validatedImage };
};

/**
 * Sanitize profile data before validation
 * تنظيف بيانات الملف الشخصي قبل التحقق
 */
const sanitizeProfileData = (data) => {
  const sanitized = {};

  // منع تعديل رقم الهوية - حذفه من البيانات
  if (data.idNumber !== undefined) {
    delete data.idNumber;
  }

  // Sanitize text fields
  const textFields = [
    'firstName',
    'lastName',
    'email',
    'phoneNumber',
    'residence',
    'fatherName',
    'grandFatherName',
    'motherName',
    'adminId',
  ];

  textFields.forEach((field) => {
    if (data[field] !== undefined && data[field] !== null) {
      sanitized[field] = data[field].toString().trim();
    }
  });

  // Sanitize date fields
  if (data.birthDate) {
    sanitized.birthDate = data.birthDate.toString().trim();
  }

  // Sanitize gender (normalize values)
  if (data.gender) {
    const gender = data.gender.toString().toLowerCase().trim();
    if (gender === 'male' || gender === 'ذكر') {
      sanitized.gender = 'ذكر';
    } else if (gender === 'female' || gender === 'أنثى' || gender === 'انثى') {
      sanitized.gender = 'أنثى';
    } else {
      sanitized.gender = data.gender;
    }
  }

  // Keep other fields as is
  Object.keys(data).forEach((key) => {
    if (!sanitized.hasOwnProperty(key) && data[key] !== undefined) {
      sanitized[key] = data[key];
    }
  });

  return sanitized;
};

/**
 * Middleware to sanitize profile data
 */
const sanitizeProfile = (req, res, next) => {
  try {
    if (req.body) {
      req.body = sanitizeProfileData(req.body);
      console.log('✅ Profile data sanitized');
    }
    next();
  } catch (error) {
    console.error('❌ خطأ في sanitizeProfile:', error);
    return res.status(500).json({
      success: false,
      message: 'خطأ في معالجة البيانات',
      error: error.message,
    });
  }
};

/**
 * Check if value exists and is not empty
 */
const isRequired = (value) => {
  return (
    value !== undefined && value !== null && value.toString().trim() !== ''
  );
};

/**
 * Validate email format
 */
const validateEmail = (email) => {
  if (!email || email.toString().trim() === '') {
    return { isValid: true, value: null }; // Optional field
  }

  const emailStr = email.toString().trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(emailStr)) {
    return { isValid: false, message: 'عنوان الإيميل غير صحيح' };
  }

  if (emailStr.length > 255) {
    return { isValid: false, message: 'عنوان الإيميل طويل جداً' };
  }

  return { isValid: true, value: emailStr };
};

/**
 * Validate phone number (Saudi format)
 */
const validatePhoneNumber = (phone) => {
  if (!phone || phone.toString().trim() === '') {
    return { isValid: true, value: null }; // Optional field
  }

  const phoneStr = phone.toString().trim();
  const cleanPhone = phoneStr.replace(/[\s\-\(\)]/g, '');

  // Check for Saudi phone number (10 digits starting with 05)
  if (!/^05\d{8}$/.test(cleanPhone)) {
    return {
      isValid: false,
      message: 'رقم الهاتف يجب أن يبدأ بـ 05 ويتكوّن من 10 أرقام',
    };
  }

  return { isValid: true, value: cleanPhone };
};

/**
 * Validate ID number (9 digits)
 */
const validateIdNumber = (idNumber) => {
  if (!idNumber || idNumber.toString().trim() === '') {
    return { isValid: true, value: null }; // Optional field
  }

  const idStr = idNumber.toString().trim();
  const cleanId = idStr.replace(/\s+/g, '');

  if (!/^\d{9}$/.test(cleanId)) {
    return {
      isValid: false,
      message: 'رقم الهوية يجب أن يتكون من 9 أرقام فقط',
    };
  }

  return { isValid: true, value: cleanId };
};

module.exports = {
  validateProfileData,
  validateProfileImage,
  sanitizeProfileData,
  sanitizeProfile,
  isRequired,
  validateEmail,
  validatePhoneNumber,
  validateIdNumber,
};
