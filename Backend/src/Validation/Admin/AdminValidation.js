// Validation/AdminValidation.js
const bcrypt = require('bcryptjs');
const { checkDuplicateFields } = require('../../utils/validators/duplicateChecker');

/**
 * Admin data validation middleware with comprehensive rules
 * Validates and sanitizes admin data to ensure data integrity and security
 */

/**
 * Check if a value exists and is not empty
 */
const isRequired = (value) => {
  return value !== undefined && value !== null && value.toString().trim() !== '';
};

/**
 * Validate admin ID format
 * Should be 8-digit number or string
 */
const validateAdminId = (adminId) => {
  if (!isRequired(adminId)) {
    return { isValid: false, message: 'رقم المشرف مطلوب' };
  }
  
  const idStr = adminId.toString().trim();
  if (!/^\d{8}$/.test(idStr)) {
    return { isValid: false, message: 'رقم المشرف يجب أن يكون 8 أرقام' };
  }
  
  return { isValid: true, value: idStr };
};

/**
 * Validate admin name (Arabic text)
 */
const validateName = (name, fieldName) => {
  if (!isRequired(name)) {
    return { isValid: false, message: `${fieldName} مطلوب` };
  }
  
  const nameStr = name.toString().trim();
  if (nameStr.length < 2) {
    return { isValid: false, message: `${fieldName} يجب أن يكون حرفين على الأقل` };
  }
  
  if (nameStr.length > 50) {
    return { isValid: false, message: `${fieldName} يجب أن يكون 50 حرف أو أقل` };
  }
  
  // Allow Arabic letters, spaces, and common punctuation
  if (!/^[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\s\-'\.]+$/.test(nameStr)) {
    return { isValid: false, message: `${fieldName} يجب أن يحتوي على أحرف عربية فقط` };
  }
  
  return { isValid: true, value: nameStr };
};

/**
 * Validate email format
 */
const validateEmail = (email) => {
  if (!isRequired(email)) {
    return { isValid: false, message: 'البريد الإلكتروني مطلوب' };
  }
  
  const emailStr = email.toString().trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(emailStr)) {
    return { isValid: false, message: 'البريد الإلكتروني غير صحيح' };
  }
  
  return { isValid: true, value: emailStr };
};

/**
 * Validate phone number format (Saudi Arabia)
 */
const validatePhone = (phone) => {
  if (!isRequired(phone)) {
    return { isValid: false, message: 'رقم الهاتف مطلوب' };
  }
  
  let phoneStr = phone.toString().trim();
  
  // Remove common separators
  phoneStr = phoneStr.replace(/[\s\-\(\)\.]/g, '');
  
  // Validate format (Saudi numbers - 10 digits starting with 05)
  if (!/^(05|5)\d{8}$/.test(phoneStr)) {
    return { isValid: false, message: 'الرقم يجب أن يبدأ بـ 05 ويتكوّن من 10 أرقام' };
  }
  
  // Normalize format to start with 0
  if (phoneStr.startsWith('5') && phoneStr.length === 9) {
    phoneStr = '0' + phoneStr;
  }
  
  return { isValid: true, value: phoneStr };
};

/**
 * Validate password strength
 */
const validatePassword = (password, isUpdate = false) => {
  // For updates, password is optional
  if (isUpdate && (!password || password.trim() === '')) {
    return { isValid: true, value: null }; // No password change
  }
  
  if (!isRequired(password)) {
    return { isValid: false, message: 'كلمة المرور مطلوبة' };
  }
  
  const passwordStr = password.toString();
  
  // استخدام validatePasswordStrength من AuthValidation
  const { validatePasswordStrength } = require('../Auth/AuthValidation');
  const strengthValidation = validatePasswordStrength(passwordStr);
  
  if (!strengthValidation.isValid) {
    return { isValid: false, message: strengthValidation.error };
  }
  
  if (passwordStr.length > 100) {
    return { isValid: false, message: 'كلمة المرور طويلة جداً' };
  }
  
  return { isValid: true, value: passwordStr };
};

/**
 * Validate ID number (9 digits for Saudi Arabia)
 */
const validateIdNumber = (idNumber) => {
  if (!idNumber || idNumber.toString().trim() === '') {
    return { isValid: true, value: null }; // Optional field
  }

  const idStr = idNumber.toString().trim();

  // Check for Saudi ID number (9 digits)
  if (!/^\d{9}$/.test(idStr)) {
    return { isValid: false, message: 'رقم الهوية يجب أن يتكون من 9 أرقام' };
  }

  return { isValid: true, value: idStr };
};

/**
 * Validate admin role
 */
const validateRole = (role) => {
  if (!isRequired(role)) {
    return { isValid: true, value: 'admin' }; // Default role
  }
  
  const validRoles = ['admin', 'superadmin', 'moderator'];
  const roleStr = role.toString().trim().toLowerCase();
  
  if (!validRoles.includes(roleStr)) {
    return { isValid: false, message: 'نوع المشرف غير صحيح' };
  }
  
  return { isValid: true, value: roleStr };
};

/**
 * Validate permissions array
 */
const validatePermissions = (permissions) => {
  if (!permissions || !Array.isArray(permissions)) {
    return { isValid: true, value: [] }; // Default empty permissions
  }
  
  const validPermissions = [
    'manage_users', 'manage_students', 'manage_teachers', 
    'manage_groups', 'manage_exams', 'view_reports',
    'manage_news', 'manage_activities', 'system_settings'
  ];
  
  const invalidPermissions = permissions.filter(perm => !validPermissions.includes(perm));
  
  if (invalidPermissions.length > 0) {
    return { 
      isValid: false, 
      message: `الصلاحيات غير صحيحة: ${invalidPermissions.join(', ')}` 
    };
  }
  
  return { isValid: true, value: [...new Set(permissions)] }; // Remove duplicates
};

/**
 * Sanitize admin data
 */
const sanitizeAdminData = (data) => {
  const sanitized = {};
  
  // Remove potential XSS and clean up data
  Object.keys(data).forEach(key => {
    if (typeof data[key] === 'string') {
      sanitized[key] = data[key].trim()
        .replace(/[<>]/g, '') // Remove potential HTML tags
        .replace(/javascript:/gi, ''); // Remove javascript: protocols
    } else {
      sanitized[key] = data[key];
    }
  });
  
  return sanitized;
};

/**
 * Hash password securely
 */
const hashPassword = async (password) => {
  try {
    const salt = await bcrypt.genSalt(12);
    return await bcrypt.hash(password, salt);
  } catch (error) {
    throw new Error('خطأ في تشفير كلمة المرور');
  }
};

/**
 * Main validation middleware for admin data
 */
const validateAdminData = async (req, res, next) => {
  try {
    console.log('🔍 بدء التحقق من بيانات المشرف...');
    
    const isUpdate = req.method === 'PUT';
    const rawData = req.body;
    
    // Sanitize input data
    const data = sanitizeAdminData(rawData);
    
    const errors = [];
    const validatedData = {};
    
    // Validate required fields for creation, optional for updates
    if (!isUpdate || data.firstName !== undefined) {
      const firstNameValidation = validateName(data.firstName, 'الاسم الأول');
      if (!firstNameValidation.isValid) {
        errors.push(firstNameValidation.message);
      } else {
        validatedData.firstName = firstNameValidation.value;
      }
    }
    
    if (!isUpdate || data.lastName !== undefined) {
      const lastNameValidation = validateName(data.lastName, 'الاسم الأخير');
      if (!lastNameValidation.isValid) {
        errors.push(lastNameValidation.message);
      } else {
        validatedData.lastName = lastNameValidation.value;
      }
    }
    
    if (!isUpdate || data.email !== undefined) {
      const emailValidation = validateEmail(data.email);
      if (!emailValidation.isValid) {
        errors.push(emailValidation.message);
      } else {
        validatedData.email = emailValidation.value;
      }
    }
    
    if (!isUpdate || data.phoneNumber !== undefined) {
      const phoneValidation = validatePhone(data.phoneNumber);
      if (!phoneValidation.isValid) {
        errors.push(phoneValidation.message);
      } else {
        validatedData.phoneNumber = phoneValidation.value;
      }
    }
    
    // Validate password (required for creation, optional for updates)
    if (data.password !== undefined) {
      const passwordValidation = validatePassword(data.password, isUpdate);
      if (!passwordValidation.isValid) {
        errors.push(passwordValidation.message);
      } else if (passwordValidation.value) {
        // Hash password before storing
        validatedData.password = await hashPassword(passwordValidation.value);
      }
    } else if (!isUpdate) {
      errors.push('كلمة المرور مطلوبة');
    }
    
    // Validate ID number (optional)
    if (data.idNumber !== undefined) {
      const idValidation = validateIdNumber(data.idNumber);
      if (!idValidation.isValid) {
        errors.push(idValidation.message);
      } else if (idValidation.value) {
        validatedData.idNumber = idValidation.value;
      }
    }
    
    // Additional fields (optional)
    const optionalFields = [
      'fatherName', 'grandFatherName', 'motherName', 
      'birthDate', 'gender', 'residence'
    ];
    
    optionalFields.forEach(field => {
      if (data[field] !== undefined && data[field] !== null && data[field] !== '') {
        validatedData[field] = data[field];
      }
    });
    
    // Check for validation errors
    if (errors.length > 0) {
      console.log('❌ أخطاء في التحقق من بيانات المشرف:', errors);
      return res.status(400).json({
        success: false,
        message: 'بيانات المشرف غير صحيحة',
        errors: errors
      });
    }
    
    // التحقق من التكرار باستخدام duplicateChecker
    // استخدام req.user.id عند التحديث من صفحة البروفايل (/api/me)
    // أو req.params.id عند التحديث من صفحة الإدارة (/api/admins/:id)
    const currentAdminId = isUpdate ? (req.params.id || req.user?.id || req.user?._id) : null;
    const duplicateError = await checkDuplicateFields(
      {
        email: validatedData.email,
        phoneNumber: validatedData.phoneNumber,
        idNumber: validatedData.idNumber
      },
      currentAdminId,
      'admin'
    );
    
    if (duplicateError) {
      console.log('❌ تكرار في البيانات:', duplicateError.message);
      return res.status(400).json(duplicateError);
    }
    
    // Merge validated data into req.body for controller
    req.body = { ...req.body, ...validatedData };
    
    console.log('✅ تم التحقق من بيانات المشرف بنجاح');
    next();
    
  } catch (error) {
    console.error('❌ خطأ في التحقق من بيانات المشرف:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في خادم التحقق من البيانات',
      error: error.message
    });
  }
};

module.exports = {
  validateAdminData,
  sanitizeAdminData,
  validateAdminId,
  validateName,
  validateEmail,
  validatePhone,
  validateIdNumber,
  validatePassword,
  validateRole,
  validatePermissions,
  hashPassword
};