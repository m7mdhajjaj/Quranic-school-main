// Validation/AdminValidation.js
const bcrypt = require('bcryptjs');

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
 * Validate phone number format
 */
const validatePhone = (phone) => {
  if (!isRequired(phone)) {
    return { isValid: false, message: 'رقم الهاتف مطلوب' };
  }
  
  let phoneStr = phone.toString().trim();
  
  // Remove common separators
  phoneStr = phoneStr.replace(/[\s\-\(\)\.]/g, '');
  
  // Validate format (Palestinian/Jordanian numbers)
  if (!/^(?:\+970|970|0)?[0-9]{9}$/.test(phoneStr)) {
    return { isValid: false, message: 'رقم الهاتف غير صحيح (يجب أن يكون 9 أرقام)' };
  }
  
  // Normalize format
  if (phoneStr.startsWith('+970')) {
    phoneStr = phoneStr.substring(4);
  } else if (phoneStr.startsWith('970')) {
    phoneStr = phoneStr.substring(3);
  } else if (phoneStr.startsWith('0')) {
    phoneStr = phoneStr.substring(1);
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
  
  if (passwordStr.length < 6) {
    return { isValid: false, message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' };
  }
  
  if (passwordStr.length > 100) {
    return { isValid: false, message: 'كلمة المرور طويلة جداً' };
  }
  
  return { isValid: true, value: passwordStr };
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
    if (!isUpdate || data.adminId !== undefined) {
      const adminIdValidation = validateAdminId(data.adminId);
      if (!adminIdValidation.isValid) {
        errors.push(adminIdValidation.message);
      } else {
        validatedData.adminId = adminIdValidation.value;
      }
    }
    
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
    
    if (!isUpdate || data.phone !== undefined) {
      const phoneValidation = validatePhone(data.phone);
      if (!phoneValidation.isValid) {
        errors.push(phoneValidation.message);
      } else {
        validatedData.phone = phoneValidation.value;
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
    
    // Validate optional fields
    if (data.role !== undefined) {
      const roleValidation = validateRole(data.role);
      if (!roleValidation.isValid) {
        errors.push(roleValidation.message);
      } else {
        validatedData.role = roleValidation.value;
      }
    }
    
    if (data.permissions !== undefined) {
      const permissionsValidation = validatePermissions(data.permissions);
      if (!permissionsValidation.isValid) {
        errors.push(permissionsValidation.message);
      } else {
        validatedData.permissions = permissionsValidation.value;
      }
    }
    
    // Additional fields
    if (data.isActive !== undefined) {
      validatedData.isActive = Boolean(data.isActive);
    }
    
    if (data.lastLogin !== undefined) {
      validatedData.lastLogin = new Date(data.lastLogin);
    }
    
    // Check for validation errors
    if (errors.length > 0) {
      console.log('❌ أخطاء في التحقق من بيانات المشرف:', errors);
      return res.status(400).json({
        success: false,
        message: 'بيانات المشرف غير صحيحة',
        errors: errors
      });
    }
    
    // Add validated data to request
    req.validatedData = validatedData;
    
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
  validatePassword,
  validateRole,
  validatePermissions,
  hashPassword
};