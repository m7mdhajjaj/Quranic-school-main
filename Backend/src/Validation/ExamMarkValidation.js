// Validation/ExamMarkValidation.js

/**
 * Exam Mark data validation middleware with comprehensive rules
 * Validates and sanitizes exam mark data to ensure data integrity
 */

/**
 * Check if a value exists and is not empty
 */
const isRequired = (value) => {
  return value !== undefined && value !== null && value.toString().trim() !== '';
};

/**
 * Validate exam ID
 */
const validateExamId = (examId) => {
  if (!isRequired(examId)) {
    return { isValid: false, message: 'معرف الامتحان مطلوب' };
  }
  
  const examIdStr = examId.toString().trim();
  
  // If it's an ObjectId string (24 hex characters)
  if (/^[0-9a-fA-F]{24}$/.test(examIdStr)) {
    return { isValid: true, value: examIdStr };
  }
  
  return { isValid: false, message: 'معرف الامتحان غير صحيح' };
};

/**
 * Validate student ID
 */
const validateStudentId = (studentId) => {
  if (!isRequired(studentId)) {
    return { isValid: false, message: 'معرف الطالب مطلوب' };
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
 * Validate mark value
 */
const validateMarkValue = (mark, maxMark = 100) => {
  if (mark === null || mark === undefined) {
    return { isValid: true, value: null }; // Allow null marks for absent students
  }
  
  const markNum = parseFloat(mark);
  if (isNaN(markNum)) {
    return { isValid: false, message: 'الدرجة يجب أن تكون رقم' };
  }
  
  if (markNum < 0) {
    return { isValid: false, message: 'الدرجة لا يمكن أن تكون أقل من صفر' };
  }
  
  if (markNum > maxMark) {
    return { isValid: false, message: `الدرجة لا يمكن أن تزيد عن ${maxMark}` };
  }
  
  // Round to 2 decimal places
  return { isValid: true, value: Math.round(markNum * 100) / 100 };
};

/**
 * Validate exam status
 */
const validateExamStatus = (status) => {
  if (!status || status.toString().trim() === '') {
    return { isValid: true, value: 'حاضر' }; // Default status
  }
  
  const statusStr = status.toString().trim();
  const validStatuses = ['حاضر', 'غائب', 'متأخر', 'غش', 'عذر', 'مريض'];
  
  if (!validStatuses.includes(statusStr)) {
    return { isValid: false, message: 'حالة الطالب في الامتحان غير صحيحة' };
  }
  
  return { isValid: true, value: statusStr };
};

/**
 * Validate submission time
 */
const validateSubmissionTime = (time) => {
  if (!time || time.toString().trim() === '') {
    return { isValid: true, value: null }; // Optional field
  }
  
  const submissionDate = new Date(time);
  if (isNaN(submissionDate.getTime())) {
    return { isValid: false, message: 'وقت تسليم الامتحان غير صحيح' };
  }
  
  return { isValid: true, value: submissionDate };
};

/**
 * Validate attempt number
 */
const validateAttemptNumber = (attempt) => {
  if (!attempt) {
    return { isValid: true, value: 1 }; // Default first attempt
  }
  
  const attemptNum = parseInt(attempt);
  if (isNaN(attemptNum) || attemptNum < 1) {
    return { isValid: false, message: 'رقم المحاولة يجب أن يكون رقم أكبر من صفر' };
  }
  
  if (attemptNum > 5) {
    return { isValid: false, message: 'عدد المحاولات لا يمكن أن يزيد عن 5' };
  }
  
  return { isValid: true, value: attemptNum };
};

/**
 * Validate notes/comments
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
 * Validate teacher ID (grader)
 */
const validateTeacherId = (teacherId) => {
  if (!teacherId || teacherId.toString().trim() === '') {
    return { isValid: true, value: null }; // Optional field
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
 * Validate exam marks for multiple students (bulk operation)
 */
const validateExamMarks = (marks, maxMark = 100) => {
  if (!marks || !Array.isArray(marks)) {
    return { isValid: false, message: 'درجات الامتحان يجب أن تكون مصفوفة' };
  }
  
  if (marks.length === 0) {
    return { isValid: false, message: 'درجات الامتحان فارغة' };
  }
  
  if (marks.length > 100) {
    return { isValid: false, message: 'عدد درجات الامتحان كبير جداً (الحد الأقصى 100)' };
  }
  
  const validatedMarks = [];
  const errors = [];
  
  for (let i = 0; i < marks.length; i++) {
    const mark = marks[i];
    const markErrors = [];
    
    // Validate each mark record
    const studentValidation = validateStudentId(mark.studentId);
    if (!studentValidation.isValid) {
      markErrors.push(`الدرجة ${i + 1}: ${studentValidation.message}`);
    }
    
    const markValidation = validateMarkValue(mark.mark, maxMark);
    if (!markValidation.isValid) {
      markErrors.push(`الدرجة ${i + 1}: ${markValidation.message}`);
    }
    
    const statusValidation = validateExamStatus(mark.status);
    if (!statusValidation.isValid) {
      markErrors.push(`الدرجة ${i + 1}: ${statusValidation.message}`);
    }
    
    if (markErrors.length === 0) {
      const validatedMark = {
        studentId: studentValidation.value,
        mark: markValidation.value,
        status: statusValidation.value,
        notes: mark.notes ? validateNotes(mark.notes).value : '',
        submissionTime: mark.submissionTime || null,
        attemptNumber: mark.attemptNumber ? validateAttemptNumber(mark.attemptNumber).value : 1
      };
      
      // Calculate percentage and grade
      if (validatedMark.mark !== null) {
        validatedMark.percentage = Math.round((validatedMark.mark / maxMark) * 100 * 100) / 100;
        
        // Determine grade based on percentage
        if (validatedMark.percentage >= 90) validatedMark.grade = 'ممتاز';
        else if (validatedMark.percentage >= 80) validatedMark.grade = 'جيد جداً';
        else if (validatedMark.percentage >= 70) validatedMark.grade = 'جيد';
        else if (validatedMark.percentage >= 60) validatedMark.grade = 'مقبول';
        else validatedMark.grade = 'راسب';
      } else {
        validatedMark.percentage = null;
        validatedMark.grade = validatedMark.status === 'غائب' ? 'غائب' : 'غير مكتمل';
      }
      
      validatedMarks.push(validatedMark);
    } else {
      errors.push(...markErrors);
    }
  }
  
  if (errors.length > 0) {
    return { isValid: false, message: 'أخطاء في درجات الامتحان', errors: errors };
  }
  
  return { isValid: true, value: validatedMarks };
};

/**
 * Sanitize exam mark data
 */
const sanitizeExamMarkData = (data) => {
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
 * Main validation middleware for exam mark data
 */
const validateExamMarkData = async (req, res, next) => {
  try {
    console.log('🔍 بدء التحقق من بيانات درجات الامتحان...');
    
    const rawData = req.body;
    const examId = req.params.examId;
    
    // Sanitize input data
    const data = sanitizeExamMarkData(rawData);
    
    const errors = [];
    const validatedData = {};
    
    // Validate exam ID from URL params
    if (examId) {
      const examIdValidation = validateExamId(examId);
      if (!examIdValidation.isValid) {
        errors.push(examIdValidation.message);
      } else {
        validatedData.examId = examIdValidation.value;
      }
    }
    
    // Check if it's bulk marks (array of marks) or single mark
    if (data.marks && Array.isArray(data.marks)) {
      // Bulk exam marks validation
      const maxMark = data.maxMark || 100;
      const marksValidation = validateExamMarks(data.marks, maxMark);
      if (!marksValidation.isValid) {
        errors.push(marksValidation.message);
        if (marksValidation.errors) {
          errors.push(...marksValidation.errors);
        }
      } else {
        validatedData.marks = marksValidation.value;
        validatedData.maxMark = maxMark;
      }
      
      // Validate grader/teacher
      if (data.gradedBy !== undefined) {
        const teacherValidation = validateTeacherId(data.gradedBy);
        if (!teacherValidation.isValid) {
          errors.push(teacherValidation.message);
        } else {
          validatedData.gradedBy = teacherValidation.value;
        }
      }
      
      // Add grading date
      validatedData.gradedAt = new Date();
      
    } else {
      // Single exam mark validation
      const studentId = req.params.studentId || data.studentId;
      
      if (studentId) {
        const studentValidation = validateStudentId(studentId);
        if (!studentValidation.isValid) {
          errors.push(studentValidation.message);
        } else {
          validatedData.studentId = studentValidation.value;
        }
      }
      
      if (data.mark !== undefined) {
        const maxMark = data.maxMark || 100;
        const markValidation = validateMarkValue(data.mark, maxMark);
        if (!markValidation.isValid) {
          errors.push(markValidation.message);
        } else {
          validatedData.mark = markValidation.value;
          validatedData.maxMark = maxMark;
          
          // Calculate percentage and grade
          if (validatedData.mark !== null) {
            validatedData.percentage = Math.round((validatedData.mark / maxMark) * 100 * 100) / 100;
            
            // Determine grade based on percentage
            if (validatedData.percentage >= 90) validatedData.grade = 'ممتاز';
            else if (validatedData.percentage >= 80) validatedData.grade = 'جيد جداً';
            else if (validatedData.percentage >= 70) validatedData.grade = 'جيد';
            else if (validatedData.percentage >= 60) validatedData.grade = 'مقبول';
            else validatedData.grade = 'راسب';
          }
        }
      }
      
      if (data.status !== undefined) {
        const statusValidation = validateExamStatus(data.status);
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
      
      if (data.submissionTime !== undefined) {
        const submissionValidation = validateSubmissionTime(data.submissionTime);
        if (!submissionValidation.isValid) {
          errors.push(submissionValidation.message);
        } else {
          validatedData.submissionTime = submissionValidation.value;
        }
      }
      
      if (data.attemptNumber !== undefined) {
        const attemptValidation = validateAttemptNumber(data.attemptNumber);
        if (!attemptValidation.isValid) {
          errors.push(attemptValidation.message);
        } else {
          validatedData.attemptNumber = attemptValidation.value;
        }
      }
      
      if (data.gradedBy !== undefined) {
        const teacherValidation = validateTeacherId(data.gradedBy);
        if (!teacherValidation.isValid) {
          errors.push(teacherValidation.message);
        } else {
          validatedData.gradedBy = teacherValidation.value;
        }
      }
      
      // Add grading date for single marks
      if (data.mark !== undefined) {
        validatedData.gradedAt = new Date();
      }
    }
    
    // Check for validation errors
    if (errors.length > 0) {
      console.log('❌ أخطاء في التحقق من بيانات درجات الامتحان:', errors);
      return res.status(400).json({
        success: false,
        message: 'بيانات درجات الامتحان غير صحيحة',
        errors: errors
      });
    }
    
    // Add validated data to request
    req.validatedData = validatedData;
    
    console.log('✅ تم التحقق من بيانات درجات الامتحان بنجاح');
    next();
    
  } catch (error) {
    console.error('❌ خطأ في التحقق من بيانات درجات الامتحان:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في خادم التحقق من البيانات',
      error: error.message
    });
  }
};

module.exports = {
  validateExamMarkData,
  sanitizeExamMarkData,
  validateExamId,
  validateStudentId,
  validateMarkValue,
  validateExamStatus,
  validateSubmissionTime,
  validateAttemptNumber,
  validateNotes,
  validateTeacherId,
  validateExamMarks
};