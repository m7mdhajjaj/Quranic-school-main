// Validation/ExamValidation.js

/**
 * Exam data validation middleware with comprehensive rules
 * Validates and sanitizes exam data to ensure data integrity
 */

/**
 * Check if a value exists and is not empty
 */
const isRequired = (value) => {
  return value !== undefined && value !== null && value.toString().trim() !== '';
};

/**
 * Validate exam title (Arabic text)
 */
const validateExamTitle = (title) => {
  if (!isRequired(title)) {
    return { isValid: false, message: 'عنوان الامتحان مطلوب' };
  }
  
  const titleStr = title.toString().trim();
  if (titleStr.length < 3) {
    return { isValid: false, message: 'عنوان الامتحان يجب أن يكون 3 أحرف على الأقل' };
  }
  
  if (titleStr.length > 200) {
    return { isValid: false, message: 'عنوان الامتحان يجب أن يكون 200 حرف أو أقل' };
  }
  
  return { isValid: true, value: titleStr };
};

/**
 * Validate exam description
 */
const validateDescription = (description) => {
  if (!description || description.trim() === '') {
    return { isValid: true, value: '' }; // Optional field
  }
  
  const descStr = description.toString().trim();
  if (descStr.length > 1000) {
    return { isValid: false, message: 'وصف الامتحان يجب أن يكون 1000 حرف أو أقل' };
  }
  
  return { isValid: true, value: descStr };
};

/**
 * Validate exam subject
 */
const validateSubject = (subject) => {
  if (!isRequired(subject)) {
    return { isValid: false, message: 'مادة الامتحان مطلوبة' };
  }
  
  const subjectStr = subject.toString().trim();
  const validSubjects = [
    'القرآن الكريم', 'التجويد', 'التفسير', 'الحديث الشريف', 
    'الفقه', 'العقيدة', 'السيرة النبوية', 'التربية الإسلامية',
    'اللغة العربية', 'الأخلاق الإسلامية'
  ];
  
  if (!validSubjects.includes(subjectStr)) {
    return { isValid: true, value: subjectStr }; // Allow custom subjects
  }
  
  return { isValid: true, value: subjectStr };
};

/**
 * Validate exam type
 */
const validateExamType = (type) => {
  if (!isRequired(type)) {
    return { isValid: true, value: 'شفهي' }; // Default type
  }
  
  const validTypes = ['شفهي', 'كتابي', 'عملي', 'مشروع', 'تقييم شامل'];
  const typeStr = type.toString().trim();
  
  if (!validTypes.includes(typeStr)) {
    return { isValid: true, value: typeStr }; // Allow custom types
  }
  
  return { isValid: true, value: typeStr };
};

/**
 * Validate group assignment
 */
const validateGroup = (group) => {
  if (!isRequired(group)) {
    return { isValid: false, message: 'مجموعة الامتحان مطلوبة' };
  }
  
  const groupStr = group.toString().trim();
  
  // If it's an ObjectId string
  if (/^[0-9a-fA-F]{24}$/.test(groupStr)) {
    return { isValid: true, value: groupStr };
  }
  
  // If it's a group name
  if (groupStr.length >= 2 && groupStr.length <= 100) {
    return { isValid: true, value: groupStr };
  }
  
  return { isValid: false, message: 'معرف المجموعة غير صحيح' };
};

/**
 * Validate teacher assignment
 */
const validateTeacher = (teacher) => {
  if (!isRequired(teacher)) {
    return { isValid: false, message: 'معلم الامتحان مطلوب' };
  }
  
  const teacherStr = teacher.toString().trim();
  
  // If it's an ObjectId string
  if (/^[0-9a-fA-F]{24}$/.test(teacherStr)) {
    return { isValid: true, value: teacherStr };
  }
  
  // If it's a teacher ID (8 digits)
  if (/^\d{8}$/.test(teacherStr)) {
    return { isValid: true, value: teacherStr };
  }
  
  return { isValid: false, message: 'معرف المعلم غير صحيح' };
};

/**
 * Validate exam date
 */
const validateExamDate = (date) => {
  if (!isRequired(date)) {
    return { isValid: false, message: 'تاريخ الامتحان مطلوب' };
  }
  
  const examDate = new Date(date);
  if (isNaN(examDate.getTime())) {
    return { isValid: false, message: 'تاريخ الامتحان غير صحيح' };
  }
  
  // Check if date is not too far in the past
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  
  if (examDate < oneYearAgo) {
    return { isValid: false, message: 'تاريخ الامتحان لا يمكن أن يكون أكثر من سنة في الماضي' };
  }
  
  return { isValid: true, value: examDate };
};

/**
 * Validate exam duration in minutes
 */
const validateDuration = (duration) => {
  if (!duration) {
    return { isValid: true, value: 60 }; // Default 60 minutes
  }
  
  const durationNum = parseInt(duration);
  if (isNaN(durationNum) || durationNum < 5) {
    return { isValid: false, message: 'مدة الامتحان يجب أن تكون 5 دقائق على الأقل' };
  }
  
  if (durationNum > 480) { // 8 hours max
    return { isValid: false, message: 'مدة الامتحان لا يمكن أن تزيد عن 8 ساعات' };
  }
  
  return { isValid: true, value: durationNum };
};

/**
 * Validate total marks
 */
const validateTotalMarks = (totalMarks) => {
  if (!totalMarks) {
    return { isValid: true, value: 100 }; // Default 100 marks
  }
  
  const marksNum = parseFloat(totalMarks);
  if (isNaN(marksNum) || marksNum <= 0) {
    return { isValid: false, message: 'مجموع الدرجات يجب أن يكون أكبر من صفر' };
  }
  
  if (marksNum > 1000) {
    return { isValid: false, message: 'مجموع الدرجات لا يمكن أن يزيد عن 1000' };
  }
  
  return { isValid: true, value: marksNum };
};

/**
 * Validate passing marks
 */
const validatePassingMarks = (passingMarks, totalMarks = 100) => {
  if (!passingMarks) {
    return { isValid: true, value: totalMarks * 0.5 }; // Default 50% of total
  }
  
  const passingNum = parseFloat(passingMarks);
  if (isNaN(passingNum) || passingNum < 0) {
    return { isValid: false, message: 'درجة النجاح يجب أن تكون صفر أو أكثر' };
  }
  
  if (passingNum > totalMarks) {
    return { isValid: false, message: 'درجة النجاح لا يمكن أن تزيد عن مجموع الدرجات' };
  }
  
  return { isValid: true, value: passingNum };
};

/**
 * Sanitize exam data
 */
const sanitizeExamData = (data) => {
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
 * Main validation middleware for exam data
 */
const validateExamData = async (req, res, next) => {
  try {
    console.log('🔍 بدء التحقق من بيانات الامتحان...');
    
    const isUpdate = req.method === 'PUT';
    const rawData = req.body;
    
    // Sanitize input data
    const data = sanitizeExamData(rawData);
    
    const errors = [];
    const validatedData = {};
    
    // Validate required fields for creation, optional for updates
    if (!isUpdate || data.title !== undefined) {
      const titleValidation = validateExamTitle(data.title);
      if (!titleValidation.isValid) {
        errors.push(titleValidation.message);
      } else {
        validatedData.title = titleValidation.value;
      }
    }
    
    if (!isUpdate || data.subject !== undefined) {
      const subjectValidation = validateSubject(data.subject);
      if (!subjectValidation.isValid) {
        errors.push(subjectValidation.message);
      } else {
        validatedData.subject = subjectValidation.value;
      }
    }
    
    if (!isUpdate || data.group !== undefined) {
      const groupValidation = validateGroup(data.group);
      if (!groupValidation.isValid) {
        errors.push(groupValidation.message);
      } else {
        validatedData.group = groupValidation.value;
      }
    }
    
    if (!isUpdate || data.teacher !== undefined) {
      const teacherValidation = validateTeacher(data.teacher);
      if (!teacherValidation.isValid) {
        errors.push(teacherValidation.message);
      } else {
        validatedData.teacher = teacherValidation.value;
      }
    }
    
    if (!isUpdate || data.date !== undefined) {
      const dateValidation = validateExamDate(data.date);
      if (!dateValidation.isValid) {
        errors.push(dateValidation.message);
      } else {
        validatedData.date = dateValidation.value;
      }
    }
    
    // Validate optional fields
    if (data.description !== undefined) {
      const descValidation = validateDescription(data.description);
      if (!descValidation.isValid) {
        errors.push(descValidation.message);
      } else {
        validatedData.description = descValidation.value;
      }
    }
    
    if (data.type !== undefined) {
      const typeValidation = validateExamType(data.type);
      if (!typeValidation.isValid) {
        errors.push(typeValidation.message);
      } else {
        validatedData.type = typeValidation.value;
      }
    }
    
    if (data.duration !== undefined) {
      const durationValidation = validateDuration(data.duration);
      if (!durationValidation.isValid) {
        errors.push(durationValidation.message);
      } else {
        validatedData.duration = durationValidation.value;
      }
    }
    
    if (data.totalMarks !== undefined) {
      const totalMarksValidation = validateTotalMarks(data.totalMarks);
      if (!totalMarksValidation.isValid) {
        errors.push(totalMarksValidation.message);
      } else {
        validatedData.totalMarks = totalMarksValidation.value;
      }
    }
    
    if (data.passingMarks !== undefined) {
      const passingMarksValidation = validatePassingMarks(
        data.passingMarks, 
        validatedData.totalMarks || data.totalMarks || 100
      );
      if (!passingMarksValidation.isValid) {
        errors.push(passingMarksValidation.message);
      } else {
        validatedData.passingMarks = passingMarksValidation.value;
      }
    }
    
    // Boolean fields
    if (data.isActive !== undefined) {
      validatedData.isActive = Boolean(data.isActive);
    }
    
    if (data.isPublished !== undefined) {
      validatedData.isPublished = Boolean(data.isPublished);
    }
    
    // Check for validation errors
    if (errors.length > 0) {
      console.log('❌ أخطاء في التحقق من بيانات الامتحان:', errors);
      return res.status(400).json({
        success: false,
        message: 'بيانات الامتحان غير صحيحة',
        errors: errors
      });
    }
    
    // Add validated data to request
    req.validatedData = validatedData;
    
    console.log('✅ تم التحقق من بيانات الامتحان بنجاح');
    next();
    
  } catch (error) {
    console.error('❌ خطأ في التحقق من بيانات الامتحان:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في خادم التحقق من البيانات',
      error: error.message
    });
  }
};

module.exports = {
  validateExamData,
  sanitizeExamData,
  validateExamTitle,
  validateDescription,
  validateSubject,
  validateExamType,
  validateGroup,
  validateTeacher,
  validateExamDate,
  validateDuration,
  validateTotalMarks,
  validatePassingMarks
};