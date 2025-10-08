// Validation/SessionValidation.js

/**
 * Session data validation middleware with comprehensive rules
 * Validates and sanitizes session/lesson data to ensure data integrity
 */

/**
 * Check if a value exists and is not empty
 */
const isRequired = (value) => {
  return value !== undefined && value !== null && value.toString().trim() !== '';
};

/**
 * Validate session title (Arabic text)
 */
const validateSessionTitle = (title) => {
  if (!isRequired(title)) {
    return { isValid: false, message: 'عنوان الجلسة مطلوب' };
  }
  
  const titleStr = title.toString().trim();
  if (titleStr.length < 3) {
    return { isValid: false, message: 'عنوان الجلسة يجب أن يكون 3 أحرف على الأقل' };
  }
  
  if (titleStr.length > 200) {
    return { isValid: false, message: 'عنوان الجلسة يجب أن يكون 200 حرف أو أقل' };
  }
  
  return { isValid: true, value: titleStr };
};

/**
 * Validate session description
 */
const validateDescription = (description) => {
  if (!description || description.trim() === '') {
    return { isValid: true, value: '' }; // Optional field
  }
  
  const descStr = description.toString().trim();
  if (descStr.length > 1000) {
    return { isValid: false, message: 'وصف الجلسة يجب أن يكون 1000 حرف أو أقل' };
  }
  
  return { isValid: true, value: descStr };
};

/**
 * Validate session type/subject
 */
const validateSessionType = (type) => {
  if (!isRequired(type)) {
    return { isValid: false, message: 'نوع الجلسة مطلوب' };
  }
  
  const typeStr = type.toString().trim();
  const validTypes = [
    'قرآن كريم', 'تلاوة', 'حفظ', 'تجويد', 'تفسير', 
    'حديث شريف', 'فقه', 'عقيدة', 'سيرة نبوية', 
    'أخلاق', 'أدب إسلامي', 'لغة عربية', 'مراجعة',
    'امتحان', 'نشاط', 'ورشة عمل', 'حوار ومناقشة'
  ];
  
  if (!validTypes.includes(typeStr)) {
    return { isValid: true, value: typeStr }; // Allow custom types
  }
  
  return { isValid: true, value: typeStr };
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
  if (!isRequired(groupId)) {
    return { isValid: false, message: 'معرف المجموعة مطلوب' };
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
 * Validate session date
 */
const validateSessionDate = (date) => {
  if (!isRequired(date)) {
    return { isValid: false, message: 'تاريخ الجلسة مطلوب' };
  }
  
  const sessionDate = new Date(date);
  if (isNaN(sessionDate.getTime())) {
    return { isValid: false, message: 'تاريخ الجلسة غير صحيح' };
  }
  
  // Don't allow dates too far in the future (more than 1 year)
  const oneYearFromNow = new Date();
  oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
  
  if (sessionDate > oneYearFromNow) {
    return { isValid: false, message: 'تاريخ الجلسة لا يمكن أن يكون أكثر من سنة في المستقبل' };
  }
  
  // Don't allow dates too far in the past (more than 2 years)
  const twoYearsAgo = new Date();
  twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
  
  if (sessionDate < twoYearsAgo) {
    return { isValid: false, message: 'تاريخ الجلسة لا يمكن أن يكون أكثر من سنتين في الماضي' };
  }
  
  return { isValid: true, value: sessionDate };
};

/**
 * Validate start time
 */
const validateStartTime = (time) => {
  if (!isRequired(time)) {
    return { isValid: false, message: 'وقت بداية الجلسة مطلوب' };
  }
  
  const timeStr = time.toString().trim();
  
  // Validate time format (HH:MM)
  if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(timeStr)) {
    return { isValid: false, message: 'وقت بداية الجلسة غير صحيح (يجب أن يكون بصيغة HH:MM)' };
  }
  
  return { isValid: true, value: timeStr };
};

/**
 * Validate end time
 */
const validateEndTime = (time) => {
  if (!isRequired(time)) {
    return { isValid: false, message: 'وقت نهاية الجلسة مطلوب' };
  }
  
  const timeStr = time.toString().trim();
  
  // Validate time format (HH:MM)
  if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(timeStr)) {
    return { isValid: false, message: 'وقت نهاية الجلسة غير صحيح (يجب أن يكون بصيغة HH:MM)' };
  }
  
  return { isValid: true, value: timeStr };
};

/**
 * Validate duration in minutes
 */
const validateDuration = (duration) => {
  if (!duration) {
    return { isValid: true, value: 60 }; // Default 60 minutes
  }
  
  const durationNum = parseInt(duration);
  if (isNaN(durationNum) || durationNum < 15) {
    return { isValid: false, message: 'مدة الجلسة يجب أن تكون 15 دقيقة على الأقل' };
  }
  
  if (durationNum > 480) { // 8 hours max
    return { isValid: false, message: 'مدة الجلسة لا يمكن أن تزيد عن 8 ساعات' };
  }
  
  return { isValid: true, value: durationNum };
};

/**
 * Validate location/room
 */
const validateLocation = (location) => {
  if (!location || location.trim() === '') {
    return { isValid: true, value: '' }; // Optional field
  }
  
  const locationStr = location.toString().trim();
  if (locationStr.length > 100) {
    return { isValid: false, message: 'مكان الجلسة يجب أن يكون 100 حرف أو أقل' };
  }
  
  return { isValid: true, value: locationStr };
};

/**
 * Validate learning objectives array
 */
const validateObjectives = (objectives) => {
  if (!objectives || !Array.isArray(objectives)) {
    return { isValid: true, value: [] }; // Optional field
  }
  
  if (objectives.length > 10) {
    return { isValid: false, message: 'عدد الأهداف التعليمية كبير جداً (الحد الأقصى 10)' };
  }
  
  const validatedObjectives = [];
  for (const objective of objectives) {
    if (typeof objective === 'string' && objective.trim().length > 0) {
      const objStr = objective.trim();
      if (objStr.length <= 200) {
        validatedObjectives.push(objStr);
      }
    }
  }
  
  return { isValid: true, value: validatedObjectives };
};

/**
 * Validate materials/resources array
 */
const validateMaterials = (materials) => {
  if (!materials || !Array.isArray(materials)) {
    return { isValid: true, value: [] }; // Optional field
  }
  
  if (materials.length > 20) {
    return { isValid: false, message: 'عدد المواد التعليمية كبير جداً (الحد الأقصى 20)' };
  }
  
  const validatedMaterials = [];
  for (const material of materials) {
    if (typeof material === 'string' && material.trim().length > 0) {
      const matStr = material.trim();
      if (matStr.length <= 100) {
        validatedMaterials.push(matStr);
      }
    }
  }
  
  return { isValid: true, value: validatedMaterials };
};

/**
 * Validate homework/assignments
 */
const validateHomework = (homework) => {
  if (!homework || homework.trim() === '') {
    return { isValid: true, value: '' }; // Optional field
  }
  
  const homeworkStr = homework.toString().trim();
  if (homeworkStr.length > 500) {
    return { isValid: false, message: 'الواجب المنزلي يجب أن يكون 500 حرف أو أقل' };
  }
  
  return { isValid: true, value: homeworkStr };
};

/**
 * Validate session status
 */
const validateStatus = (status) => {
  if (!status || status.toString().trim() === '') {
    return { isValid: true, value: 'مجدولة' }; // Default status
  }
  
  const statusStr = status.toString().trim();
  const validStatuses = ['مجدولة', 'جارية', 'مكتملة', 'ملغاة', 'مؤجلة'];
  
  if (!validStatuses.includes(statusStr)) {
    return { isValid: false, message: 'حالة الجلسة غير صحيحة' };
  }
  
  return { isValid: true, value: statusStr };
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
 * Validate attendance tracking
 */
const validateAttendanceRequired = (required) => {
  if (required === undefined || required === null) {
    return { isValid: true, value: true }; // Default to required
  }
  
  return { isValid: true, value: Boolean(required) };
};

/**
 * Sanitize session data
 */
const sanitizeSessionData = (data) => {
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
 * Main validation middleware for session data
 */
const validateSessionData = async (req, res, next) => {
  try {
    console.log('🔍 بدء التحقق من بيانات الجلسة...');
    
    const isUpdate = req.method === 'PUT';
    const rawData = req.body;
    
    // Sanitize input data
    const data = sanitizeSessionData(rawData);
    
    const errors = [];
    const validatedData = {};
    
    // Validate required fields for creation, optional for updates
    if (!isUpdate || data.title !== undefined) {
      const titleValidation = validateSessionTitle(data.title);
      if (!titleValidation.isValid) {
        errors.push(titleValidation.message);
      } else {
        validatedData.title = titleValidation.value;
      }
    }
    
    if (!isUpdate || data.type !== undefined) {
      const typeValidation = validateSessionType(data.type);
      if (!typeValidation.isValid) {
        errors.push(typeValidation.message);
      } else {
        validatedData.type = typeValidation.value;
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
    
    if (!isUpdate || data.groupId !== undefined) {
      const groupValidation = validateGroupId(data.groupId);
      if (!groupValidation.isValid) {
        errors.push(groupValidation.message);
      } else {
        validatedData.groupId = groupValidation.value;
      }
    }
    
    if (!isUpdate || data.date !== undefined) {
      const dateValidation = validateSessionDate(data.date);
      if (!dateValidation.isValid) {
        errors.push(dateValidation.message);
      } else {
        validatedData.date = dateValidation.value;
      }
    }
    
    if (!isUpdate || data.startTime !== undefined) {
      const startTimeValidation = validateStartTime(data.startTime);
      if (!startTimeValidation.isValid) {
        errors.push(startTimeValidation.message);
      } else {
        validatedData.startTime = startTimeValidation.value;
      }
    }
    
    if (!isUpdate || data.endTime !== undefined) {
      const endTimeValidation = validateEndTime(data.endTime);
      if (!endTimeValidation.isValid) {
        errors.push(endTimeValidation.message);
      } else {
        validatedData.endTime = endTimeValidation.value;
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
    
    if (data.duration !== undefined) {
      const durationValidation = validateDuration(data.duration);
      if (!durationValidation.isValid) {
        errors.push(durationValidation.message);
      } else {
        validatedData.duration = durationValidation.value;
      }
    }
    
    if (data.location !== undefined) {
      const locationValidation = validateLocation(data.location);
      if (!locationValidation.isValid) {
        errors.push(locationValidation.message);
      } else {
        validatedData.location = locationValidation.value;
      }
    }
    
    if (data.objectives !== undefined) {
      const objectivesValidation = validateObjectives(data.objectives);
      if (!objectivesValidation.isValid) {
        errors.push(objectivesValidation.message);
      } else {
        validatedData.objectives = objectivesValidation.value;
      }
    }
    
    if (data.materials !== undefined) {
      const materialsValidation = validateMaterials(data.materials);
      if (!materialsValidation.isValid) {
        errors.push(materialsValidation.message);
      } else {
        validatedData.materials = materialsValidation.value;
      }
    }
    
    if (data.homework !== undefined) {
      const homeworkValidation = validateHomework(data.homework);
      if (!homeworkValidation.isValid) {
        errors.push(homeworkValidation.message);
      } else {
        validatedData.homework = homeworkValidation.value;
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
    
    if (data.notes !== undefined) {
      const notesValidation = validateNotes(data.notes);
      if (!notesValidation.isValid) {
        errors.push(notesValidation.message);
      } else {
        validatedData.notes = notesValidation.value;
      }
    }
    
    if (data.attendanceRequired !== undefined) {
      const attendanceValidation = validateAttendanceRequired(data.attendanceRequired);
      if (!attendanceValidation.isValid) {
        errors.push(attendanceValidation.message);
      } else {
        validatedData.attendanceRequired = attendanceValidation.value;
      }
    }
    
    // Validate time logic (start time should be before end time)
    if (validatedData.startTime && validatedData.endTime) {
      const [startHour, startMin] = validatedData.startTime.split(':').map(Number);
      const [endHour, endMin] = validatedData.endTime.split(':').map(Number);
      
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;
      
      if (startMinutes >= endMinutes) {
        errors.push('وقت البداية يجب أن يكون قبل وقت النهاية');
      } else {
        // Calculate duration if not provided
        if (!validatedData.duration) {
          validatedData.duration = endMinutes - startMinutes;
        }
      }
    }
    
    // Boolean fields
    if (data.isRecurring !== undefined) {
      validatedData.isRecurring = Boolean(data.isRecurring);
    }
    
    if (data.isActive !== undefined) {
      validatedData.isActive = Boolean(data.isActive);
    }
    
    // Check for validation errors
    if (errors.length > 0) {
      console.log('❌ أخطاء في التحقق من بيانات الجلسة:', errors);
      return res.status(400).json({
        success: false,
        message: 'بيانات الجلسة غير صحيحة',
        errors: errors
      });
    }
    
    // Add validated data to request
    req.validatedData = validatedData;
    
    console.log('✅ تم التحقق من بيانات الجلسة بنجاح');
    next();
    
  } catch (error) {
    console.error('❌ خطأ في التحقق من بيانات الجلسة:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في خادم التحقق من البيانات',
      error: error.message
    });
  }
};

module.exports = {
  validateSessionData,
  sanitizeSessionData,
  validateSessionTitle,
  validateDescription,
  validateSessionType,
  validateTeacherId,
  validateGroupId,
  validateSessionDate,
  validateStartTime,
  validateEndTime,
  validateDuration,
  validateLocation,
  validateObjectives,
  validateMaterials,
  validateHomework,
  validateStatus,
  validateNotes,
  validateAttendanceRequired
};