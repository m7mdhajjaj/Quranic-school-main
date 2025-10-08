// Validation/GoalValidation.js

/**
 * Goal data validation middleware with comprehensive rules
 * Validates and sanitizes goal/objective data to ensure data integrity
 */

/**
 * Check if a value exists and is not empty
 */
const isRequired = (value) => {
  return value !== undefined && value !== null && value.toString().trim() !== '';
};

/**
 * Validate goal title (Arabic text)
 */
const validateGoalTitle = (title) => {
  if (!isRequired(title)) {
    return { isValid: false, message: 'عنوان الهدف مطلوب' };
  }
  
  const titleStr = title.toString().trim();
  if (titleStr.length < 5) {
    return { isValid: false, message: 'عنوان الهدف يجب أن يكون 5 أحرف على الأقل' };
  }
  
  if (titleStr.length > 200) {
    return { isValid: false, message: 'عنوان الهدف يجب أن يكون 200 حرف أو أقل' };
  }
  
  return { isValid: true, value: titleStr };
};

/**
 * Validate goal description
 */
const validateDescription = (description) => {
  if (!isRequired(description)) {
    return { isValid: false, message: 'وصف الهدف مطلوب' };
  }
  
  const descStr = description.toString().trim();
  if (descStr.length < 10) {
    return { isValid: false, message: 'وصف الهدف يجب أن يكون 10 أحرف على الأقل' };
  }
  
  if (descStr.length > 1000) {
    return { isValid: false, message: 'وصف الهدف يجب أن يكون 1000 حرف أو أقل' };
  }
  
  return { isValid: true, value: descStr };
};

/**
 * Validate goal type/category
 */
const validateGoalType = (type) => {
  if (!isRequired(type)) {
    return { isValid: true, value: 'أكاديمي' }; // Default type
  }
  
  const typeStr = type.toString().trim();
  const validTypes = [
    'أكاديمي', 'حفظ', 'تلاوة', 'تجويد', 'سلوكي', 
    'شخصي', 'اجتماعي', 'مهاري', 'إبداعي', 'تطويري'
  ];
  
  if (!validTypes.includes(typeStr)) {
    return { isValid: true, value: typeStr }; // Allow custom types
  }
  
  return { isValid: true, value: typeStr };
};

/**
 * Validate goal priority
 */
const validatePriority = (priority) => {
  if (!priority || priority.toString().trim() === '') {
    return { isValid: true, value: 'متوسط' }; // Default priority
  }
  
  const validPriorities = ['منخفض', 'متوسط', 'مرتفع', 'عاجل'];
  const priorityStr = priority.toString().trim();
  
  if (!validPriorities.includes(priorityStr)) {
    return { isValid: false, message: 'مستوى الأولوية غير صحيح' };
  }
  
  return { isValid: true, value: priorityStr };
};

/**
 * Validate student ID
 */
const validateStudentId = (studentId) => {
  if (!studentId || studentId.toString().trim() === '') {
    return { isValid: true, value: null }; // Optional for general goals
  }
  
  const studentIdStr = studentId.toString().trim();
  
  // If it's an ObjectId string
  if (/^[0-9a-fA-F]{24}$/.test(studentIdStr)) {
    return { isValid: true, value: studentIdStr };
  }
  
  // If it's a student ID (8 digits)
  if (/^\d{8}$/.test(studentIdStr)) {
    return { isValid: true, value: studentIdStr };
  }
  
  return { isValid: false, message: 'معرف الطالب غير صحيح' };
};

/**
 * Validate teacher ID
 */
const validateTeacherId = (teacherId) => {
  if (!isRequired(teacherId)) {
    return { isValid: false, message: 'معرف المعلم مطلوب' };
  }
  
  const teacherIdStr = teacherId.toString().trim();
  
  // If it's an ObjectId string
  if (/^[0-9a-fA-F]{24}$/.test(teacherIdStr)) {
    return { isValid: true, value: teacherIdStr };
  }
  
  // If it's a teacher ID (8 digits)
  if (/^\d{8}$/.test(teacherIdStr)) {
    return { isValid: true, value: teacherIdStr };
  }
  
  return { isValid: false, message: 'معرف المعلم غير صحيح' };
};

/**
 * Validate group ID
 */
const validateGroupId = (groupId) => {
  if (!groupId || groupId.toString().trim() === '') {
    return { isValid: true, value: null }; // Optional field
  }
  
  const groupIdStr = groupId.toString().trim();
  
  // If it's an ObjectId string
  if (/^[0-9a-fA-F]{24}$/.test(groupIdStr)) {
    return { isValid: true, value: groupIdStr };
  }
  
  // If it's a group name
  if (groupIdStr.length >= 2 && groupIdStr.length <= 100) {
    return { isValid: true, value: groupIdStr };
  }
  
  return { isValid: false, message: 'معرف المجموعة غير صحيح' };
};

/**
 * Validate start date
 */
const validateStartDate = (startDate) => {
  if (!isRequired(startDate)) {
    return { isValid: true, value: new Date() }; // Default to current date
  }
  
  const goalStartDate = new Date(startDate);
  if (isNaN(goalStartDate.getTime())) {
    return { isValid: false, message: 'تاريخ بداية الهدف غير صحيح' };
  }
  
  // Don't allow start dates too far in the past (more than 1 year)
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  
  if (goalStartDate < oneYearAgo) {
    return { isValid: false, message: 'تاريخ بداية الهدف لا يمكن أن يكون أكثر من سنة في الماضي' };
  }
  
  return { isValid: true, value: goalStartDate };
};

/**
 * Validate target date
 */
const validateTargetDate = (targetDate) => {
  if (!isRequired(targetDate)) {
    return { isValid: false, message: 'تاريخ الهدف المستهدف مطلوب' };
  }
  
  const goalTargetDate = new Date(targetDate);
  if (isNaN(goalTargetDate.getTime())) {
    return { isValid: false, message: 'تاريخ الهدف المستهدف غير صحيح' };
  }
  
  // Don't allow target dates too far in the future (more than 5 years)
  const fiveYearsFromNow = new Date();
  fiveYearsFromNow.setFullYear(fiveYearsFromNow.getFullYear() + 5);
  
  if (goalTargetDate > fiveYearsFromNow) {
    return { isValid: false, message: 'تاريخ الهدف المستهدف لا يمكن أن يكون أكثر من 5 سنوات في المستقبل' };
  }
  
  return { isValid: true, value: goalTargetDate };
};

/**
 * Validate progress percentage
 */
const validateProgress = (progress) => {
  if (progress === undefined || progress === null) {
    return { isValid: true, value: 0 }; // Default to 0%
  }
  
  const progressNum = parseFloat(progress);
  if (isNaN(progressNum)) {
    return { isValid: false, message: 'نسبة التقدم يجب أن تكون رقم' };
  }
  
  if (progressNum < 0) {
    return { isValid: false, message: 'نسبة التقدم لا يمكن أن تكون أقل من 0%' };
  }
  
  if (progressNum > 100) {
    return { isValid: false, message: 'نسبة التقدم لا يمكن أن تزيد عن 100%' };
  }
  
  // Round to 1 decimal place
  return { isValid: true, value: Math.round(progressNum * 10) / 10 };
};

/**
 * Validate milestones array
 */
const validateMilestones = (milestones) => {
  if (!milestones || !Array.isArray(milestones)) {
    return { isValid: true, value: [] }; // Optional field
  }
  
  if (milestones.length > 20) {
    return { isValid: false, message: 'عدد الإنجازات الفرعية كبير جداً (الحد الأقصى 20)' };
  }
  
  const validatedMilestones = [];
  
  for (let i = 0; i < milestones.length; i++) {
    const milestone = milestones[i];
    
    if (!milestone.title || milestone.title.toString().trim() === '') {
      return { isValid: false, message: `عنوان الإنجاز الفرعي ${i + 1} مطلوب` };
    }
    
    const title = milestone.title.toString().trim();
    if (title.length > 200) {
      return { isValid: false, message: `عنوان الإنجاز الفرعي ${i + 1} طويل جداً` };
    }
    
    const validatedMilestone = {
      title: title,
      description: milestone.description ? milestone.description.toString().trim() : '',
      isCompleted: Boolean(milestone.isCompleted),
      completedDate: milestone.completedDate ? new Date(milestone.completedDate) : null
    };
    
    validatedMilestones.push(validatedMilestone);
  }
  
  return { isValid: true, value: validatedMilestones };
};

/**
 * Validate notes
 */
const validateNotes = (notes) => {
  if (!notes || notes.trim() === '') {
    return { isValid: true, value: '' }; // Optional field
  }
  
  const notesStr = notes.toString().trim();
  if (notesStr.length > 1000) {
    return { isValid: false, message: 'الملاحظات يجب أن تكون 1000 حرف أو أقل' };
  }
  
  return { isValid: true, value: notesStr };
};

/**
 * Validate goal status
 */
const validateStatus = (status) => {
  if (!status || status.toString().trim() === '') {
    return { isValid: true, value: 'قيد التنفيذ' }; // Default status
  }
  
  const statusStr = status.toString().trim();
  const validStatuses = ['قيد التنفيذ', 'مكتمل', 'متأخر', 'ملغى', 'مؤجل'];
  
  if (!validStatuses.includes(statusStr)) {
    return { isValid: false, message: 'حالة الهدف غير صحيحة' };
  }
  
  return { isValid: true, value: statusStr };
};

/**
 * Sanitize goal data
 */
const sanitizeGoalData = (data) => {
  const sanitized = {};
  
  // Remove potential XSS and clean up data
  Object.keys(data).forEach(key => {
    if (typeof data[key] === 'string') {
      sanitized[key] = data[key].trim()
        .replace(/[<>]/g, '') // Remove potential HTML tags
        .replace(/javascript:/gi, '') // Remove javascript: protocols
        .replace(/on\w+=/gi, ''); // Remove event handlers
    } else {
      sanitized[key] = data[key];
    }
  });
  
  return sanitized;
};

/**
 * Main validation middleware for goal data
 */
const validateGoalData = async (req, res, next) => {
  try {
    console.log('🔍 بدء التحقق من بيانات الهدف...');
    
    const isUpdate = req.method === 'PUT' || req.method === 'PATCH';
    const rawData = req.body;
    
    // Sanitize input data
    const data = sanitizeGoalData(rawData);
    
    const errors = [];
    const validatedData = {};
    
    // Validate required fields for creation, optional for updates
    if (!isUpdate || data.title !== undefined) {
      const titleValidation = validateGoalTitle(data.title);
      if (!titleValidation.isValid) {
        errors.push(titleValidation.message);
      } else {
        validatedData.title = titleValidation.value;
      }
    }
    
    if (!isUpdate || data.description !== undefined) {
      const descValidation = validateDescription(data.description);
      if (!descValidation.isValid) {
        errors.push(descValidation.message);
      } else {
        validatedData.description = descValidation.value;
      }
    }
    
    if (!isUpdate || data.teacherId !== undefined) {
      const teacherValidation = validateTeacherId(data.teacherId);
      if (!teacherValidation.isValid) {
        errors.push(teacherValidation.message);
      } else {
        validatedData.teacherId = teacherValidation.value;
      }
    }
    
    if (!isUpdate || data.targetDate !== undefined) {
      const targetDateValidation = validateTargetDate(data.targetDate);
      if (!targetDateValidation.isValid) {
        errors.push(targetDateValidation.message);
      } else {
        validatedData.targetDate = targetDateValidation.value;
      }
    }
    
    // Validate optional fields
    if (data.type !== undefined) {
      const typeValidation = validateGoalType(data.type);
      if (!typeValidation.isValid) {
        errors.push(typeValidation.message);
      } else {
        validatedData.type = typeValidation.value;
      }
    }
    
    if (data.priority !== undefined) {
      const priorityValidation = validatePriority(data.priority);
      if (!priorityValidation.isValid) {
        errors.push(priorityValidation.message);
      } else {
        validatedData.priority = priorityValidation.value;
      }
    }
    
    if (data.studentId !== undefined) {
      const studentValidation = validateStudentId(data.studentId);
      if (!studentValidation.isValid) {
        errors.push(studentValidation.message);
      } else {
        validatedData.studentId = studentValidation.value;
      }
    }
    
    if (data.groupId !== undefined) {
      const groupValidation = validateGroupId(data.groupId);
      if (!groupValidation.isValid) {
        errors.push(groupValidation.message);
      } else {
        validatedData.groupId = groupValidation.value;
      }
    }
    
    if (data.startDate !== undefined) {
      const startDateValidation = validateStartDate(data.startDate);
      if (!startDateValidation.isValid) {
        errors.push(startDateValidation.message);
      } else {
        validatedData.startDate = startDateValidation.value;
      }
    }
    
    if (data.progress !== undefined) {
      const progressValidation = validateProgress(data.progress);
      if (!progressValidation.isValid) {
        errors.push(progressValidation.message);
      } else {
        validatedData.progress = progressValidation.value;
      }
    }
    
    if (data.milestones !== undefined) {
      const milestonesValidation = validateMilestones(data.milestones);
      if (!milestonesValidation.isValid) {
        errors.push(milestonesValidation.message);
      } else {
        validatedData.milestones = milestonesValidation.value;
      }
    }
    
    if (data.notes !== undefined) {
      const notesValidation = validateNotes(data.notes);
      if (!notesValidation.isValid) {
        errors.push(notesValidation.message);
      } else {
        validatedData.notes = notesValidation.value;
      }
    }
    
    if (data.status !== undefined) {
      const statusValidation = validateStatus(data.status);
      if (!statusValidation.isValid) {
        errors.push(statusValidation.message);
      } else {
        validatedData.status = statusValidation.value;
      }
    }
    
    // Validate date logic
    if (validatedData.startDate && validatedData.targetDate) {
      if (validatedData.startDate >= validatedData.targetDate) {
        errors.push('تاريخ البداية يجب أن يكون قبل تاريخ الهدف المستهدف');
      }
    }
    
    // Boolean fields
    if (data.isActive !== undefined) {
      validatedData.isActive = Boolean(data.isActive);
    }
    
    if (data.isCompleted !== undefined) {
      validatedData.isCompleted = Boolean(data.isCompleted);
    }
    
    // Auto-set completion date if goal is marked as completed
    if (validatedData.isCompleted && !data.completedDate) {
      validatedData.completedDate = new Date();
    } else if (data.completedDate) {
      const completedDate = new Date(data.completedDate);
      if (!isNaN(completedDate.getTime())) {
        validatedData.completedDate = completedDate;
      }
    }
    
    // Auto-update progress if goal is completed
    if (validatedData.isCompleted && validatedData.progress !== 100) {
      validatedData.progress = 100;
    }
    
    // Check for validation errors
    if (errors.length > 0) {
      console.log('❌ أخطاء في التحقق من بيانات الهدف:', errors);
      return res.status(400).json({
        success: false,
        message: 'بيانات الهدف غير صحيحة',
        errors: errors
      });
    }
    
    // Add validated data to request
    req.validatedData = validatedData;
    
    console.log('✅ تم التحقق من بيانات الهدف بنجاح');
    next();
    
  } catch (error) {
    console.error('❌ خطأ في التحقق من بيانات الهدف:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في خادم التحقق من البيانات',
      error: error.message
    });
  }
};

module.exports = {
  validateGoalData,
  sanitizeGoalData,
  validateGoalTitle,
  validateDescription,
  validateGoalType,
  validatePriority,
  validateStudentId,
  validateTeacherId,
  validateGroupId,
  validateStartDate,
  validateTargetDate,
  validateProgress,
  validateMilestones,
  validateNotes,
  validateStatus
};