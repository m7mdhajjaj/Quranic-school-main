// Validation/AttendanceValidation.js

/**
 * Attendance data validation middleware with comprehensive rules
 * Validates and sanitizes attendance data to ensure data integrity
 */

/**
 * Check if a value exists and is not empty
 */
const isRequired = (value) => {
  return value !== undefined && value !== null && value.toString().trim() !== '';
};

/**
 * Validate student ID
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
 * Validate group/class ID
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
 * Validate attendance date
 */
const validateAttendanceDate = (date) => {
  if (!isRequired(date)) {
    return { isValid: true, value: new Date() }; // Default to current date
  }
  
  const attendanceDate = new Date(date);
  if (isNaN(attendanceDate.getTime())) {
    return { isValid: false, message: 'تاريخ الحضور غير صحيح' };
  }
  
  // Don't allow dates too far in the future (more than 1 week)
  const oneWeekFromNow = new Date();
  oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);
  
  if (attendanceDate > oneWeekFromNow) {
    return { isValid: false, message: 'تاريخ الحضور لا يمكن أن يكون أكثر من أسبوع في المستقبل' };
  }
  
  // Don't allow dates too far in the past (more than 1 year)
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  
  if (attendanceDate < oneYearAgo) {
    return { isValid: false, message: 'تاريخ الحضور لا يمكن أن يكون أكثر من سنة في الماضي' };
  }
  
  return { isValid: true, value: attendanceDate };
};

/**
 * Validate attendance status
 */
const validateAttendanceStatus = (status) => {
  if (!isRequired(status)) {
    return { isValid: false, message: 'حالة الحضور مطلوبة' };
  }
  
  const statusStr = status.toString().trim();
  const validStatuses = [
    'حاضر', 'غائب', 'متأخر', 'انصرف مبكراً', 'إجازة', 'مريض', 'عذر'
  ];
  
  if (!validStatuses.includes(statusStr)) {
    return { isValid: false, message: 'حالة الحضور غير صحيحة' };
  }
  
  return { isValid: true, value: statusStr };
};

/**
 * Validate session/period
 */
const validateSession = (session) => {
  if (!session || session.toString().trim() === '') {
    return { isValid: true, value: 'الحصة الأولى' }; // Default session
  }
  
  const sessionStr = session.toString().trim();
  const validSessions = [
    'الحصة الأولى', 'الحصة الثانية', 'الحصة الثالثة', 
    'الحصة الرابعة', 'الحصة الخامسة', 'الحصة السادسة',
    'حصة الصباح', 'حصة المساء', 'الفترة الصباحية', 'الفترة المسائية'
  ];
  
  if (!validSessions.includes(sessionStr)) {
    return { isValid: true, value: sessionStr }; // Allow custom sessions
  }
  
  return { isValid: true, value: sessionStr };
};

/**
 * Validate arrival time
 */
const validateArrivalTime = (time) => {
  if (!time || time.toString().trim() === '') {
    return { isValid: true, value: null }; // Optional field
  }
  
  const timeStr = time.toString().trim();
  
  // Validate time format (HH:MM)
  if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(timeStr)) {
    return { isValid: false, message: 'وقت الوصول غير صحيح (يجب أن يكون بصيغة HH:MM)' };
  }
  
  return { isValid: true, value: timeStr };
};

/**
 * Validate departure time
 */
const validateDepartureTime = (time) => {
  if (!time || time.toString().trim() === '') {
    return { isValid: true, value: null }; // Optional field
  }
  
  const timeStr = time.toString().trim();
  
  // Validate time format (HH:MM)
  if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(timeStr)) {
    return { isValid: false, message: 'وقت المغادرة غير صحيح (يجب أن يكون بصيغة HH:MM)' };
  }
  
  return { isValid: true, value: timeStr };
};

/**
 * Validate excuse/reason
 */
const validateExcuse = (excuse) => {
  if (!excuse || excuse.trim() === '') {
    return { isValid: true, value: '' }; // Optional field
  }
  
  const excuseStr = excuse.toString().trim();
  if (excuseStr.length > 300) {
    return { isValid: false, message: 'العذر يجب أن يكون 300 حرف أو أقل' };
  }
  
  return { isValid: true, value: excuseStr };
};

/**
 * Validate notes
 */
const validateNotes = (notes) => {
  if (!notes || notes.trim() === '') {
    return { isValid: true, value: '' }; // Optional field
  }
  
  const notesStr = notes.toString().trim();
  if (notesStr.length > 500) {
    return { isValid: false, message: 'الملاحظات يجب أن تكون 500 حرف أو أقل' };
  }
  
  return { isValid: true, value: notesStr };
};

/**
 * Validate attendance records array (for bulk operations)
 */
const validateAttendanceRecords = (records) => {
  if (!records || !Array.isArray(records)) {
    return { isValid: false, message: 'سجلات الحضور يجب أن تكون مصفوفة' };
  }
  
  if (records.length === 0) {
    return { isValid: false, message: 'سجلات الحضور فارغة' };
  }
  
  if (records.length > 100) {
    return { isValid: false, message: 'عدد سجلات الحضور كبير جداً (الحد الأقصى 100)' };
  }
  
  const validatedRecords = [];
  const errors = [];
  
  for (let i = 0; i < records.length; i++) {
    const record = records[i];
    const recordErrors = [];
    
    // Validate each record
    const studentValidation = validateStudentId(record.studentId);
    if (!studentValidation.isValid) {
      recordErrors.push(`السجل ${i + 1}: ${studentValidation.message}`);
    }
    
    const statusValidation = validateAttendanceStatus(record.status);
    if (!statusValidation.isValid) {
      recordErrors.push(`السجل ${i + 1}: ${statusValidation.message}`);
    }
    
    if (recordErrors.length === 0) {
      validatedRecords.push({
        studentId: studentValidation.value,
        status: statusValidation.value,
        arrivalTime: record.arrivalTime || null,
        departureTime: record.departureTime || null,
        excuse: record.excuse || '',
        notes: record.notes || ''
      });
    } else {
      errors.push(...recordErrors);
    }
  }
  
  if (errors.length > 0) {
    return { isValid: false, message: 'أخطاء في سجلات الحضور', errors: errors };
  }
  
  return { isValid: true, value: validatedRecords };
};

/**
 * Sanitize attendance data
 */
const sanitizeAttendanceData = (data) => {
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
 * Main validation middleware for attendance data
 */
const validateAttendanceData = async (req, res, next) => {
  try {
    console.log('🔍 بدء التحقق من بيانات الحضور...');
    
    const rawData = req.body;
    
    // Sanitize input data
    const data = sanitizeAttendanceData(rawData);
    
    const errors = [];
    const validatedData = {};
    
    // Check if it's bulk attendance (array of records) or single record
    if (data.attendanceRecords && Array.isArray(data.attendanceRecords)) {
      // Bulk attendance validation
      const recordsValidation = validateAttendanceRecords(data.attendanceRecords);
      if (!recordsValidation.isValid) {
        errors.push(recordsValidation.message);
        if (recordsValidation.errors) {
          errors.push(...recordsValidation.errors);
        }
      } else {
        validatedData.attendanceRecords = recordsValidation.value;
      }
      
      // Validate common fields for bulk attendance
      if (data.date !== undefined) {
        const dateValidation = validateAttendanceDate(data.date);
        if (!dateValidation.isValid) {
          errors.push(dateValidation.message);
        } else {
          validatedData.date = dateValidation.value;
        }
      }
      
      if (data.teacherId !== undefined) {
        const teacherValidation = validateTeacherId(data.teacherId);
        if (!teacherValidation.isValid) {
          errors.push(teacherValidation.message);
        } else {
          validatedData.teacherId = teacherValidation.value;
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
      
      if (data.session !== undefined) {
        const sessionValidation = validateSession(data.session);
        if (!sessionValidation.isValid) {
          errors.push(sessionValidation.message);
        } else {
          validatedData.session = sessionValidation.value;
        }
      }
      
    } else {
      // Single attendance record validation
      const studentValidation = validateStudentId(data.studentId);
      if (!studentValidation.isValid) {
        errors.push(studentValidation.message);
      } else {
        validatedData.studentId = studentValidation.value;
      }
      
      const statusValidation = validateAttendanceStatus(data.status);
      if (!statusValidation.isValid) {
        errors.push(statusValidation.message);
      } else {
        validatedData.status = statusValidation.value;
      }
      
      // Optional fields for single record
      if (data.date !== undefined) {
        const dateValidation = validateAttendanceDate(data.date);
        if (!dateValidation.isValid) {
          errors.push(dateValidation.message);
        } else {
          validatedData.date = dateValidation.value;
        }
      }
      
      if (data.teacherId !== undefined) {
        const teacherValidation = validateTeacherId(data.teacherId);
        if (!teacherValidation.isValid) {
          errors.push(teacherValidation.message);
        } else {
          validatedData.teacherId = teacherValidation.value;
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
      
      if (data.session !== undefined) {
        const sessionValidation = validateSession(data.session);
        if (!sessionValidation.isValid) {
          errors.push(sessionValidation.message);
        } else {
          validatedData.session = sessionValidation.value;
        }
      }
      
      if (data.arrivalTime !== undefined) {
        const arrivalValidation = validateArrivalTime(data.arrivalTime);
        if (!arrivalValidation.isValid) {
          errors.push(arrivalValidation.message);
        } else {
          validatedData.arrivalTime = arrivalValidation.value;
        }
      }
      
      if (data.departureTime !== undefined) {
        const departureValidation = validateDepartureTime(data.departureTime);
        if (!departureValidation.isValid) {
          errors.push(departureValidation.message);
        } else {
          validatedData.departureTime = departureValidation.value;
        }
      }
      
      if (data.excuse !== undefined) {
        const excuseValidation = validateExcuse(data.excuse);
        if (!excuseValidation.isValid) {
          errors.push(excuseValidation.message);
        } else {
          validatedData.excuse = excuseValidation.value;
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
    }
    
    // Validate time logic (arrival should be before departure)
    if (validatedData.arrivalTime && validatedData.departureTime) {
      const [arrHour, arrMin] = validatedData.arrivalTime.split(':').map(Number);
      const [depHour, depMin] = validatedData.departureTime.split(':').map(Number);
      
      const arrivalMinutes = arrHour * 60 + arrMin;
      const departureMinutes = depHour * 60 + depMin;
      
      if (arrivalMinutes >= departureMinutes) {
        errors.push('وقت الوصول يجب أن يكون قبل وقت المغادرة');
      }
    }
    
    // Check for validation errors
    if (errors.length > 0) {
      console.log('❌ أخطاء في التحقق من بيانات الحضور:', errors);
      return res.status(400).json({
        success: false,
        message: 'بيانات الحضور غير صحيحة',
        errors: errors
      });
    }
    
    // Add validated data to request
    req.validatedData = validatedData;
    
    console.log('✅ تم التحقق من بيانات الحضور بنجاح');
    next();
    
  } catch (error) {
    console.error('❌ خطأ في التحقق من بيانات الحضور:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في خادم التحقق من البيانات',
      error: error.message
    });
  }
};

module.exports = {
  validateAttendanceData,
  sanitizeAttendanceData,
  validateStudentId,
  validateTeacherId,
  validateGroupId,
  validateAttendanceDate,
  validateAttendanceStatus,
  validateSession,
  validateArrivalTime,
  validateDepartureTime,
  validateExcuse,
  validateNotes,
  validateAttendanceRecords
};