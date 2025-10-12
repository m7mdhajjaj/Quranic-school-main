// Validation/ProfileValidation.js

/**
 * Profile data validation middleware with comprehensive rules
 * Validates and sanitizes user profile data to ensure data integrity and security
 */

const bcrypt = require('bcryptjs');

/**
 * Check if a value exists and is not empty
 */
const isRequired = (value) => {
  return (
    value !== undefined && value !== null && value.toString().trim() !== ''
  );
};

/**
 * Validate user name (first name, last name, full name)
 */
const validateUserName = (name, fieldName = 'الاسم') => {
  if (!isRequired(name)) {
    return { isValid: false, message: `${fieldName} مطلوب` };
  }

  const nameStr = name.toString().trim();

  if (nameStr.length < 2) {
    return {
      isValid: false,
      message: `${fieldName} يجب أن يكون حرفين على الأقل`,
    };
  }

  if (nameStr.length > 50) {
    return {
      isValid: false,
      message: `${fieldName} يجب أن يكون 50 حرف أو أقل`,
    };
  }

  // Check for valid name characters (Arabic, English, spaces, hyphens)
  if (!/^[\u0600-\u06FFa-zA-Z\s\-']+$/.test(nameStr)) {
    return { isValid: false, message: `${fieldName} يحتوي على أحرف غير صالحة` };
  }

  return { isValid: true, value: nameStr };
};

/**
 * Validate email address
 */
const validateEmail = (email) => {
  if (!email || email.toString().trim() === '') {
    return { isValid: true, value: null }; // Optional field
  }

  const emailStr = email.toString().trim().toLowerCase();

  // Email regex pattern
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
 * Validate phone number
 */
const validatePhoneNumber = (phone) => {
  if (!phone || phone.toString().trim() === '') {
    return { isValid: true, value: null }; // Optional field
  }

  const phoneStr = phone.toString().trim();

  // Remove common separators
  const cleanPhone = phoneStr.replace(/[\s\-\(\)]/g, '');

  // Check for valid phone number (international or local format)
  if (!/^(\+?\d{1,3})?[0-9]{8,15}$/.test(cleanPhone)) {
    return { isValid: false, message: 'رقم الهاتف غير صحيح' };
  }

  return { isValid: true, value: cleanPhone };
};

/**
 * Validate date of birth
 */
const validateDateOfBirth = (dateOfBirth) => {
  if (!dateOfBirth || dateOfBirth.toString().trim() === '') {
    return { isValid: true, value: null }; // Optional field
  }

  const birthDate = new Date(dateOfBirth);
  if (isNaN(birthDate.getTime())) {
    return { isValid: false, message: 'تاريخ الميلاد غير صحيح' };
  }

  const today = new Date();
  const age = today.getFullYear() - birthDate.getFullYear();

  // Check if age is reasonable (between 3 and 120 years)
  if (age < 3 || age > 120) {
    return { isValid: false, message: 'تاريخ الميلاد غير معقول' };
  }

  // Check if birth date is not in the future
  if (birthDate > today) {
    return {
      isValid: false,
      message: 'تاريخ الميلاد لا يمكن أن يكون في المستقبل',
    };
  }

  return { isValid: true, value: birthDate };
};

/**
 * Validate gender
 */
const validateGender = (gender) => {
  if (!gender || gender.toString().trim() === '') {
    return { isValid: true, value: null }; // Optional field
  }

  const genderStr = gender.toString().trim().toLowerCase();
  const validGenders = ['male', 'female', 'ذكر', 'أنثى', 'm', 'f'];

  if (!validGenders.includes(genderStr)) {
    return { isValid: false, message: 'الجنس غير صحيح' };
  }

  // Normalize gender value
  let normalizedGender = genderStr;
  if (['male', 'ذكر', 'm'].includes(genderStr)) {
    normalizedGender = 'male';
  } else if (['female', 'أنثى', 'f'].includes(genderStr)) {
    normalizedGender = 'female';
  }

  return { isValid: true, value: normalizedGender };
};

/**
 * Validate address
 */
const validateAddress = (address) => {
  if (!address || address.toString().trim() === '') {
    return { isValid: true, value: null }; // Optional field
  }

  const addressStr = address.toString().trim();

  if (addressStr.length < 5) {
    return { isValid: false, message: 'العنوان يجب أن يكون 5 أحرف على الأقل' };
  }

  if (addressStr.length > 500) {
    return { isValid: false, message: 'العنوان يجب أن يكون 500 حرف أو أقل' };
  }

  // Sanitize address
  const sanitizedAddress = addressStr
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/javascript:/gi, ''); // Remove javascript: protocols

  return { isValid: true, value: sanitizedAddress };
};

/**
 * Validate password for profile updates
 */
const validatePassword = async (password, confirmPassword = null) => {
  if (!password || password.toString().trim() === '') {
    return { isValid: true, value: null }; // Optional for profile updates
  }

  const passwordStr = password.toString();

  // استخدام validatePasswordStrength من AuthValidation
  const { validatePasswordStrength } = require('./AuthValidation');
  const strengthValidation = validatePasswordStrength(passwordStr);
  
  if (!strengthValidation.isValid) {
    return {
      isValid: false,
      message: strengthValidation.error,
    };
  }

  if (passwordStr.length > 128) {
    return { isValid: false, message: 'كلمة المرور طويلة جداً' };
  }

  // Check for at least one letter and one number
  if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(passwordStr)) {
    return {
      isValid: false,
      message: 'كلمة المرور يجب أن تحتوي على حروف وأرقام',
    };
  }

  // Check password confirmation if provided
  if (confirmPassword !== null && passwordStr !== confirmPassword) {
    return { isValid: false, message: 'تأكيد كلمة المرور غير متطابق' };
  }

  // Hash the password
  const saltRounds = 12;
  const hashedPassword = await bcrypt.hash(passwordStr, saltRounds);

  return { isValid: true, value: hashedPassword };
};

/**
 * Validate profile image/avatar
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
      // Check for safe file name
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

    if (!allowedTypes.includes(imageType)) {
      errors.push('نوع الصورة غير مدعوم (JPEG, PNG, GIF, WebP فقط)');
    } else {
      validatedImage.type = imageType;
    }
  }

  if (errors.length > 0) {
    return {
      isValid: false,
      message: 'معلومات الصورة غير صحيحة',
      errors: errors,
    };
  }

  return { isValid: true, value: validatedImage };
};

/**
 * Validate social media links
 */
const validateSocialLinks = (socialLinks) => {
  if (!socialLinks) {
    return { isValid: true, value: {} }; // Optional field
  }

  if (typeof socialLinks !== 'object') {
    return {
      isValid: false,
      message: 'روابط المواقع الاجتماعية يجب أن تكون كائن',
    };
  }

  const validatedLinks = {};
  const errors = [];
  const allowedPlatforms = [
    'facebook',
    'twitter',
    'instagram',
    'linkedin',
    'youtube',
    'telegram',
  ];

  Object.keys(socialLinks).forEach((platform) => {
    if (allowedPlatforms.includes(platform.toLowerCase())) {
      const link = socialLinks[platform];
      if (link && typeof link === 'string') {
        const linkStr = link.trim();
        if (linkStr.length > 0) {
          // Basic URL validation
          try {
            new URL(linkStr);
            validatedLinks[platform.toLowerCase()] = linkStr;
          } catch {
            errors.push(`رابط ${platform} غير صحيح`);
          }
        }
      }
    }
  });

  if (errors.length > 0) {
    return {
      isValid: false,
      message: 'روابط المواقع الاجتماعية غير صحيحة',
      errors: errors,
    };
  }

  return { isValid: true, value: validatedLinks };
};

/**
 * Validate bio/about section
 */
const validateBio = (bio) => {
  if (!bio || bio.toString().trim() === '') {
    return { isValid: true, value: null }; // Optional field
  }

  const bioStr = bio.toString().trim();

  if (bioStr.length > 1000) {
    return {
      isValid: false,
      message: 'النبذة الشخصية يجب أن تكون 1000 حرف أو أقل',
    };
  }

  // Sanitize bio content
  const sanitizedBio = bioStr
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .replace(/vbscript:/gi, ''); // Remove vbscript: protocols

  return { isValid: true, value: sanitizedBio };
};

/**
 * Validate emergency contact information
 */
const validateEmergencyContact = (contact) => {
  if (!contact) {
    return { isValid: true, value: null }; // Optional field
  }

  if (typeof contact !== 'object') {
    return {
      isValid: false,
      message: 'بيانات جهة الاتصال الطارئة يجب أن تكون كائن',
    };
  }

  const validatedContact = {};
  const errors = [];

  // Validate contact name
  if (contact.name) {
    const nameValidation = validateUserName(
      contact.name,
      'اسم جهة الاتصال الطارئة'
    );
    if (!nameValidation.isValid) {
      errors.push(nameValidation.message);
    } else {
      validatedContact.name = nameValidation.value;
    }
  }

  // Validate contact phone
  if (contact.phone) {
    const phoneValidation = validatePhoneNumber(contact.phone);
    if (!phoneValidation.isValid) {
      errors.push('رقم هاتف جهة الاتصال الطارئة غير صحيح');
    } else {
      validatedContact.phone = phoneValidation.value;
    }
  }

  // Validate relationship
  if (contact.relationship) {
    const relationshipStr = contact.relationship.toString().trim();
    if (relationshipStr.length > 0 && relationshipStr.length <= 50) {
      validatedContact.relationship = relationshipStr;
    } else {
      errors.push('صلة القرابة غير صحيحة');
    }
  }

  if (errors.length > 0) {
    return {
      isValid: false,
      message: 'بيانات جهة الاتصال الطارئة غير صحيحة',
      errors: errors,
    };
  }

  return {
    isValid: true,
    value: Object.keys(validatedContact).length > 0 ? validatedContact : null,
  };
};

/**
 * Validate preferences/settings
 */
const validatePreferences = (preferences) => {
  if (!preferences) {
    return { isValid: true, value: {} }; // Default empty preferences
  }

  if (typeof preferences !== 'object') {
    return { isValid: false, message: 'التفضيلات يجب أن تكون كائن' };
  }

  const validatedPreferences = {};
  const errors = [];

  // Validate language preference
  if (preferences.language !== undefined) {
    const language = preferences.language.toString().trim().toLowerCase();
    const validLanguages = [
      'ar',
      'en',
      'arabic',
      'english',
      'العربية',
      'الإنجليزية',
    ];
    if (validLanguages.includes(language)) {
      // Normalize language
      if (['ar', 'arabic', 'العربية'].includes(language)) {
        validatedPreferences.language = 'ar';
      } else {
        validatedPreferences.language = 'en';
      }
    } else {
      errors.push('لغة التفضيل غير مدعومة');
    }
  }

  // Validate notification preferences
  if (preferences.notifications !== undefined) {
    if (typeof preferences.notifications === 'object') {
      const notifications = {};

      // Email notifications
      if (preferences.notifications.email !== undefined) {
        notifications.email = Boolean(preferences.notifications.email);
      }

      // SMS notifications
      if (preferences.notifications.sms !== undefined) {
        notifications.sms = Boolean(preferences.notifications.sms);
      }

      // Push notifications
      if (preferences.notifications.push !== undefined) {
        notifications.push = Boolean(preferences.notifications.push);
      }

      validatedPreferences.notifications = notifications;
    } else {
      errors.push('تفضيلات الإشعارات يجب أن تكون كائن');
    }
  }

  // Validate theme preference
  if (preferences.theme !== undefined) {
    const theme = preferences.theme.toString().trim().toLowerCase();
    const validThemes = ['light', 'dark', 'auto'];
    if (validThemes.includes(theme)) {
      validatedPreferences.theme = theme;
    } else {
      errors.push('نمط العرض غير مدعوم');
    }
  }

  if (errors.length > 0) {
    return { isValid: false, message: 'التفضيلات غير صحيحة', errors: errors };
  }

  return { isValid: true, value: validatedPreferences };
};

/**
 * Sanitize profile data
 */
const sanitizeProfileData = (data) => {
  const sanitized = {};

  // Remove potential XSS and clean up data
  Object.keys(data).forEach((key) => {
    if (typeof data[key] === 'string') {
      sanitized[key] = data[key]
        .trim()
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
        .replace(/javascript:/gi, '') // Remove javascript: protocols
        .replace(/vbscript:/gi, '') // Remove vbscript: protocols
        .replace(/on\w+\s*=/gi, ''); // Remove event handlers
    } else {
      sanitized[key] = data[key];
    }
  });

  return sanitized;
};

/**
 * Main validation middleware for profile data
 */
const validateProfileData = async (req, res, next) => {
  try {
    console.log('🔍 بدء التحقق من بيانات الملف الشخصي...');

    const rawData = req.body;

    // Sanitize input data
    const data = sanitizeProfileData(rawData);

    const errors = [];
    const validatedData = {};

    // Validate first name
    if (data.firstName !== undefined) {
      const firstNameValidation = validateUserName(
        data.firstName,
        'الاسم الأول'
      );
      if (!firstNameValidation.isValid) {
        errors.push(firstNameValidation.message);
      } else {
        validatedData.firstName = firstNameValidation.value;
      }
    }

    // Validate last name
    if (data.lastName !== undefined) {
      const lastNameValidation = validateUserName(
        data.lastName,
        'الاسم الأخير'
      );
      if (!lastNameValidation.isValid) {
        errors.push(lastNameValidation.message);
      } else {
        validatedData.lastName = lastNameValidation.value;
      }
    }

    // Validate full name (alternative to first/last name)
    if (data.name !== undefined) {
      const nameValidation = validateUserName(data.name, 'الاسم الكامل');
      if (!nameValidation.isValid) {
        errors.push(nameValidation.message);
      } else {
        validatedData.name = nameValidation.value;
      }
    }

    // Validate email
    if (data.email !== undefined) {
      const emailValidation = validateEmail(data.email);
      if (!emailValidation.isValid) {
        errors.push(emailValidation.message);
      } else {
        validatedData.email = emailValidation.value;
      }
    }

    // Validate phone number
    if (data.phone !== undefined) {
      const phoneValidation = validatePhoneNumber(data.phone);
      if (!phoneValidation.isValid) {
        errors.push(phoneValidation.message);
      } else {
        validatedData.phone = phoneValidation.value;
      }
    }

    // Validate date of birth
    if (data.dateOfBirth !== undefined) {
      const dobValidation = validateDateOfBirth(data.dateOfBirth);
      if (!dobValidation.isValid) {
        errors.push(dobValidation.message);
      } else {
        validatedData.dateOfBirth = dobValidation.value;
      }
    }

    // Validate gender
    if (data.gender !== undefined) {
      const genderValidation = validateGender(data.gender);
      if (!genderValidation.isValid) {
        errors.push(genderValidation.message);
      } else {
        validatedData.gender = genderValidation.value;
      }
    }

    // Validate address
    if (data.address !== undefined) {
      const addressValidation = validateAddress(data.address);
      if (!addressValidation.isValid) {
        errors.push(addressValidation.message);
      } else {
        validatedData.address = addressValidation.value;
      }
    }

    // Validate password (if changing)
    if (data.password !== undefined) {
      const passwordValidation = await validatePassword(
        data.password,
        data.confirmPassword
      );
      if (!passwordValidation.isValid) {
        errors.push(passwordValidation.message);
      } else if (passwordValidation.value) {
        validatedData.password = passwordValidation.value;
      }
    }

    // Validate profile image
    if (data.profileImage !== undefined) {
      const imageValidation = validateProfileImage(data.profileImage);
      if (!imageValidation.isValid) {
        errors.push(imageValidation.message);
        if (imageValidation.errors) {
          errors.push(...imageValidation.errors);
        }
      } else {
        validatedData.profileImage = imageValidation.value;
      }
    }

    // Validate social links
    if (data.socialLinks !== undefined) {
      const socialValidation = validateSocialLinks(data.socialLinks);
      if (!socialValidation.isValid) {
        errors.push(socialValidation.message);
        if (socialValidation.errors) {
          errors.push(...socialValidation.errors);
        }
      } else {
        validatedData.socialLinks = socialValidation.value;
      }
    }

    // Validate bio
    if (data.bio !== undefined) {
      const bioValidation = validateBio(data.bio);
      if (!bioValidation.isValid) {
        errors.push(bioValidation.message);
      } else {
        validatedData.bio = bioValidation.value;
      }
    }

    // Validate emergency contact
    if (data.emergencyContact !== undefined) {
      const contactValidation = validateEmergencyContact(data.emergencyContact);
      if (!contactValidation.isValid) {
        errors.push(contactValidation.message);
        if (contactValidation.errors) {
          errors.push(...contactValidation.errors);
        }
      } else {
        validatedData.emergencyContact = contactValidation.value;
      }
    }

    // Validate preferences
    if (data.preferences !== undefined) {
      const preferencesValidation = validatePreferences(data.preferences);
      if (!preferencesValidation.isValid) {
        errors.push(preferencesValidation.message);
        if (preferencesValidation.errors) {
          errors.push(...preferencesValidation.errors);
        }
      } else {
        validatedData.preferences = preferencesValidation.value;
      }
    }

    // Auto-set updated timestamp
    validatedData.updatedAt = new Date();

    // Check for validation errors
    if (errors.length > 0) {
      console.log('❌ أخطاء في التحقق من بيانات الملف الشخصي:', errors);
      return res.status(400).json({
        success: false,
        message: 'بيانات الملف الشخصي غير صحيحة',
        errors: errors,
      });
    }

    // Add validated data to request
    req.validatedData = validatedData;

    console.log('✅ تم التحقق من بيانات الملف الشخصي بنجاح');
    next();
  } catch (error) {
    console.error('❌ خطأ في التحقق من بيانات الملف الشخصي:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في خادم التحقق من البيانات',
      error: error.message,
    });
  }
};

module.exports = {
  validateProfileData,
  sanitizeProfileData,
  validateUserName,
  validateEmail,
  validatePhoneNumber,
  validateDateOfBirth,
  validateGender,
  validateAddress,
  validatePassword,
  validateProfileImage,
  validateSocialLinks,
  validateBio,
  validateEmergencyContact,
  validatePreferences,
};
