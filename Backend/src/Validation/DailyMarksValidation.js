// Validation/DailyMarksValidation.js

/**
 * Daily Marks validation middleware
 * Validates mark data for daily marks (reviewMark and memorizationMark)
 */

/**
 * Check if a value exists and is not empty
 */
const isRequired = (value) => {
  return value !== undefined && value !== null;
};

/**
 * Validate student ID (MongoDB ObjectId)
 */
const validateStudentId = (studentId) => {
  if (!isRequired(studentId)) {
    return { isValid: false, message: 'معرف الطالب مطلوب' };
  }
  
  const studentIdStr = studentId.toString().trim();
  
  // If it's an ObjectId string (24 hex characters)
  if (/^[0-9a-fA-F]{24}$/.test(studentIdStr)) {
    return { isValid: true, value: studentIdStr };
  }
  
  return { isValid: false, message: 'معرف الطالب غير صحيح' };
};

/**
 * Validate section ID (MongoDB ObjectId)
 */
const validateSectionId = (sectionId) => {
  if (!isRequired(sectionId)) {
    return { isValid: false, message: 'معرف المقطع مطلوب' };
  }
  
  const sectionIdStr = sectionId.toString().trim();
  
  // If it's an ObjectId string (24 hex characters)
  if (/^[0-9a-fA-F]{24}$/.test(sectionIdStr)) {
    return { isValid: true, value: sectionIdStr };
  }
  
  return { isValid: false, message: 'معرف المقطع غير صحيح' };
};

/**
 * Validate mark value (0-10)
 */
const validateMarkValue = (mark, fieldName) => {
  // Allow null values
  if (mark === null || mark === undefined) {
    return { isValid: true, value: null };
  }
  
  const markNum = parseFloat(mark);
  if (isNaN(markNum)) {
    return { isValid: false, message: `${fieldName} يجب أن تكون رقم` };
  }
  
  if (markNum < 0) {
    return { isValid: false, message: `${fieldName} لا يمكن أن تكون أقل من صفر` };
  }
  
  if (markNum > 10) {
    return { isValid: false, message: `${fieldName} لا يمكن أن تزيد عن 10` };
  }
  
  return { isValid: true, value: markNum };
};

/**
 * Sanitize mark data
 */
const sanitizeMarkData = (data) => {
  const sanitized = {};
  
  // Copy allowed fields only
  const allowedFields = ['studentId', 'sectionId', 'reviewMark', 'memorizationMark'];
  
  allowedFields.forEach(field => {
    if (data[field] !== undefined) {
      sanitized[field] = data[field];
    }
  });
  
  return sanitized;
};

/**
 * Main validation middleware for daily marks data
 */
const validateDailyMarksData = async (req, res, next) => {
  try {
    console.log('🔍 بدء التحقق من بيانات العلامة اليومية...');
    console.log('📦 البيانات المستلمة:', req.body);
    
    const rawData = req.body;
    
    // Sanitize input data
    const data = sanitizeMarkData(rawData);
    
    const errors = [];
    const validatedData = {};
    
    // Validate student ID (required)
    const studentValidation = validateStudentId(data.studentId);
    if (!studentValidation.isValid) {
      errors.push(studentValidation.message);
    } else {
      validatedData.studentId = studentValidation.value;
    }
    
    // Validate section ID (required)
    const sectionValidation = validateSectionId(data.sectionId);
    if (!sectionValidation.isValid) {
      errors.push(sectionValidation.message);
    } else {
      validatedData.sectionId = sectionValidation.value;
    }
    
    // Validate review mark (optional, 0-10)
    if (data.reviewMark !== undefined) {
      const reviewValidation = validateMarkValue(data.reviewMark, 'علامة المراجعة');
      if (!reviewValidation.isValid) {
        errors.push(reviewValidation.message);
      } else {
        validatedData.reviewMark = reviewValidation.value;
      }
    }
    
    // Validate memorization mark (optional, 0-10)
    if (data.memorizationMark !== undefined) {
      const memorizationValidation = validateMarkValue(data.memorizationMark, 'علامة الحفظ');
      if (!memorizationValidation.isValid) {
        errors.push(memorizationValidation.message);
      } else {
        validatedData.memorizationMark = memorizationValidation.value;
      }
    }
    
    // Check for validation errors
    if (errors.length > 0) {
      console.log('❌ أخطاء في التحقق من بيانات العلامة:', errors);
      return res.status(400).json({
        success: false,
        message: 'بيانات العلامة غير صحيحة',
        errors: errors
      });
    }
    
    // Add validated data to request
    req.validatedData = validatedData;
    
    console.log('✅ تم التحقق من بيانات العلامة بنجاح');
    console.log('✅ البيانات المتحقق منها:', validatedData);
    next();
    
  } catch (error) {
    console.error('❌ خطأ في التحقق من بيانات العلامة:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في خادم التحقق من البيانات',
      error: error.message
    });
  }
};

module.exports = {
  validateDailyMarksData,
  sanitizeMarkData,
  validateStudentId,
  validateSectionId,
  validateMarkValue
};
