// Validation/Secretary/SecretaryValidation.js
const bcrypt = require('bcryptjs');
const { checkDuplicateFields } = require('../validators/duplicateChecker');

/**
 * Secretary data validation middleware with comprehensive rules
 * Validates and sanitizes secretary data to ensure data integrity and security
 */

/**
 * Check if a value exists and is not empty
 */
const isRequired = (value) => {
  return value !== undefined && value !== null && value.toString().trim() !== '';
};

/**
 * Validate secretary ID format
 * Should be 3+ digit number starting from 501
 */
const validateSecretaryId = (secretaryId) => {
  if (!isRequired(secretaryId)) {
    return { isValid: false, message: 'رقم السكرتير مطلوب' };
  }
  
  const id = parseInt(secretaryId);
  if (isNaN(id) || id < 501) {
    return { isValid: false, message: 'رقم السكرتير يجب أن يكون 501 فأكثر' };
  }
  
  return { isValid: true, value: id };
};

/**
 * Validate secretary name (Arabic text)
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
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  
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
 * Validate search query
 */
const validateSearchQuery = (search) => {
  if (!search || typeof search !== 'string') {
    return { isValid: true, value: '' };
  }
  
  const searchStr = search.trim();
  
  // Maximum search length
  if (searchStr.length > 100) {
    return { isValid: false, message: 'نص البحث يجب أن يكون 100 حرف أو أقل' };
  }
  
  return { isValid: true, value: searchStr };
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
  if (!isRequired(idNumber)) {
    return { isValid: false, message: 'رقم الهوية مطلوب' };
  }

  const idStr = idNumber.toString().trim();

  // Check for Saudi ID number (9 digits)
  if (!/^\d{9}$/.test(idStr)) {
    return { isValid: false, message: 'رقم الهوية يجب أن يتكون من 9 أرقام' };
  }

  return { isValid: true, value: idStr };
};

/**
 * Validate birth date
 */
const validateBirthDate = (birthDate) => {
  if (!isRequired(birthDate)) {
    return { isValid: false, message: 'تاريخ الميلاد مطلوب' };
  }

  const dateStr = birthDate.toString().trim();
  const date = new Date(dateStr);

  if (isNaN(date.getTime())) {
    return { isValid: false, message: 'صيغة التاريخ غير صحيحة' };
  }

  // Check if date is not in the future
  if (date > new Date()) {
    return { isValid: false, message: 'تاريخ الميلاد لا يمكن أن يكون في المستقبل' };
  }

  // Check minimum age (21 years for secretary)
  const today = new Date();
  let age = today.getFullYear() - date.getFullYear();
  const monthDiff = today.getMonth() - date.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
    age--;
  }
  
  if (age < 21) {
    return { isValid: false, message: 'يجب أن يكون عمر السكرتير 21 عام على الأقل' };
  }

  return { isValid: true, value: dateStr };
};

/**
 * Validate residence
 */
const validateResidence = (residence) => {
  if (!isRequired(residence)) {
    return { isValid: false, message: 'مكان السكن مطلوب' };
  }
  
  const residenceStr = residence.toString().trim();
  if (residenceStr.length > 100) {
    return { isValid: false, message: 'مكان السكن يجب أن يكون 100 حرف أو أقل' };
  }
  
  return { isValid: true, value: residenceStr };
};

/**
 * Validate gender
 */
const validateGender = (gender) => {
  if (!isRequired(gender)) {
    return { isValid: false, message: 'الجنس مطلوب' };
  }
  
  const validGenders = ['male', 'female', 'ذكر', 'أنثى'];
  const genderStr = gender.toString().trim().toLowerCase();
  
  // Map Arabic to English
  const genderMap = {
    'ذكر': 'male',
    'أنثى': 'female'
  };
  
  const normalizedGender = genderMap[gender] || genderStr;
  
  if (!validGenders.includes(gender) && !['male', 'female'].includes(normalizedGender)) {
    return { isValid: false, message: 'القيمة المسموحة للحقل gender هي male/female/ذكر/أنثى' };
  }
  
  return { isValid: true, value: normalizedGender };
};

/**
 * Validate permissions object
 */
const validatePermissions = (permissions) => {
  if (!permissions || typeof permissions !== 'object') {
    return { isValid: true, value: {} }; // Default empty permissions
  }
  
  const validAccessLevels = ['none', 'view', 'manage'];
  const validPermissionKeys = ['groupsAccess', 'teachersAccess'];
  
  const validatedPermissions = {};
  
  for (const key of validPermissionKeys) {
    if (permissions[key] !== undefined) {
      // التحقق من أن القيمة صالحة
      if (validAccessLevels.includes(permissions[key])) {
        validatedPermissions[key] = permissions[key];
      } else {
        // إذا كانت القيمة غير صالحة، استخدم القيمة الافتراضية
        validatedPermissions[key] = 'none';
      }
    }
  }
  
  return { isValid: true, value: validatedPermissions };
};

/**
 * Sanitize secretary data
 */
const sanitizeSecretaryData = (data) => {
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
 * Main validation middleware for secretary data
 */
const validateSecretaryData = async (req, res, next) => {
  try {
    console.log('🔍 بدء التحقق من بيانات السكرتير...');
    
    const isUpdate = req.method === 'PUT' || req.method === 'PATCH';
    const rawData = req.body;
    
    // Sanitize input data
    const data = sanitizeSecretaryData(rawData);
    
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
    
    // Validate residence (required)
    if (!isUpdate || data.residence !== undefined) {
      const residenceValidation = validateResidence(data.residence);
      if (!residenceValidation.isValid) {
        if (!isUpdate) {
          errors.push(residenceValidation.message);
        }
      } else {
        validatedData.residence = residenceValidation.value;
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
    
    // Validate ID number (required)
    if (!isUpdate || data.idNumber !== undefined) {
      const idValidation = validateIdNumber(data.idNumber);
      if (!idValidation.isValid) {
        errors.push(idValidation.message);
      } else {
        validatedData.idNumber = idValidation.value;
      }
    }
    
    // Validate birthDate (required)
    if (!isUpdate || data.birthDate !== undefined) {
      const birthDateValidation = validateBirthDate(data.birthDate);
      if (!birthDateValidation.isValid) {
        errors.push(birthDateValidation.message);
      } else {
        validatedData.birthDate = birthDateValidation.value;
      }
    }
    
    // Validate gender (required)
    if (!isUpdate || data.gender !== undefined) {
      const genderValidation = validateGender(data.gender);
      if (!genderValidation.isValid) {
        errors.push(genderValidation.message);
      } else {
        validatedData.gender = genderValidation.value;
      }
    }
    
    // Validate permissions (optional)
    if (data.permissions !== undefined) {
      const permissionsValidation = validatePermissions(data.permissions);
      if (!permissionsValidation.isValid) {
        errors.push(permissionsValidation.message);
      } else if (Object.keys(permissionsValidation.value).length > 0) {
        validatedData.permissions = permissionsValidation.value;
      }
    }
    
    // Additional fields (optional)
    const optionalFields = [
      'fatherName', 'grandFatherName', 'motherName', 'age'
    ];
    
    optionalFields.forEach(field => {
      if (data[field] !== undefined && data[field] !== null && data[field] !== '') {
        validatedData[field] = data[field];
      }
    });
    
    // Check for validation errors
    if (errors.length > 0) {
      console.log('❌ أخطاء في التحقق من بيانات السكرتير:', errors);
      return res.status(400).json({
        success: false,
        message: 'بيانات السكرتير غير صحيحة',
        errors: errors
      });
    }
    
    // التحقق من التكرار باستخدام duplicateChecker
    const currentSecretaryId = isUpdate ? (req.params.id || req.user?.id || req.user?._id) : null;
    const duplicateError = await checkDuplicateFields(
      {
        email: validatedData.email,
        phoneNumber: validatedData.phoneNumber,
        idNumber: validatedData.idNumber
      },
      currentSecretaryId,
      'secretary'
    );
    
    if (duplicateError) {
      console.log('❌ تكرار في البيانات:', duplicateError.message);
      return res.status(400).json(duplicateError);
    }
    
    // Merge validated data into req.body for controller
    req.body = { ...req.body, ...validatedData };
    
    console.log('✅ تم التحقق من بيانات السكرتير بنجاح');
    next();
    
  } catch (error) {
    console.error('❌ خطأ في التحقق من بيانات السكرتير:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في خادم التحقق من البيانات',
      error: error.message
    });
  }
};

module.exports = {
  validateSecretaryData,
  sanitizeSecretaryData,
  validateSecretaryId,
  validateName,
  validateEmail,
  validatePhone,
  validateIdNumber,
  validatePassword,
  validateResidence,
  validateGender,
  validatePermissions,
  validateSearchQuery,
  hashPassword
};
