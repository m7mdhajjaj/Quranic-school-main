// Validation/MarkValidation.js

/**
 * Mark data validation middleware with comprehensive rules
 * Validates and sanitizes mark/grade data to ensure data integrity
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
 * Validate section ID
 */
const validateSectionId = (sectionId) => {
  if (!isRequired(sectionId)) {
    return { isValid: false, message: 'معرف القسم مطلوب' };
  }
  
  const sectionIdStr = sectionId.toString().trim();
  
  // If it's an ObjectId string
  if (/^[0-9a-fA-F]{24}$/.test(sectionIdStr)) {
    return { isValid: true, value: sectionIdStr };
  }
  
  // If it's a section name/identifier
  if (sectionIdStr.length >= 2 && sectionIdStr.length <= 100) {
    return { isValid: true, value: sectionIdStr };
  }
  
  return { isValid: false, message: 'معرف القسم غير صحيح' };
};

/**
 * Validate mark value
 */
const validateMarkValue = (mark, maxMark = 100) => {
  if (!isRequired(mark)) {
    return { isValid: false, message: 'الدرجة مطلوبة' };
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
 * Validate maximum mark
 */
const validateMaxMark = (maxMark) => {
  if (!maxMark) {
    return { isValid: true, value: 100 }; // Default max mark
  }
  
  const maxMarkNum = parseFloat(maxMark);
  if (isNaN(maxMarkNum) || maxMarkNum <= 0) {
    return { isValid: false, message: 'الدرجة العظمى يجب أن تكون رقم أكبر من صفر' };
  }
  
  if (maxMarkNum > 1000) {
    return { isValid: false, message: 'الدرجة العظمى لا يمكن أن تزيد عن 1000' };
  }
  
  return { isValid: true, value: maxMarkNum };
};

/**
 * Validate mark type/subject
 */
const validateMarkType = (type) => {
  if (!isRequired(type)) {
    return { isValid: false, message: 'نوع الدرجة مطلوب' };
  }
  
  const typeStr = type.toString().trim();
  const validTypes = [
    'قرآن كريم', 'تلاوة', 'حفظ', 'تجويد', 'تفسير', 
    'حديث شريف', 'فقه', 'عقيدة', 'سيرة نبوية', 
    'أخلاق', 'أدب إسلامي', 'لغة عربية', 'نشاط',
    'امتحان شهري', 'امتحان نصفي', 'امتحان نهائي',
    'واجب', 'مشاركة', 'سلوك', 'حضور'
  ];
  
  if (!validTypes.includes(typeStr)) {
    return { isValid: true, value: typeStr }; // Allow custom types
  }
  
  return { isValid: true, value: typeStr };
};

/**
 * Validate date
 */
const validateDate = (date) => {
  if (!isRequired(date)) {
    return { isValid: true, value: new Date() }; // Default to current date
  }
  
  const markDate = new Date(date);
  if (isNaN(markDate.getTime())) {
    return { isValid: false, message: 'تاريخ الدرجة غير صحيح' };
  }
  
  // Don't allow dates too far in the future (more than 1 month)
  const oneMonthFromNow = new Date();
  oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);
  
  if (markDate > oneMonthFromNow) {
    return { isValid: false, message: 'تاريخ الدرجة لا يمكن أن يكون أكثر من شهر في المستقبل' };
  }
  
  // Don't allow dates too far in the past (more than 2 years)
  const twoYearsAgo = new Date();
  twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
  
  if (markDate < twoYearsAgo) {
    return { isValid: false, message: 'تاريخ الدرجة لا يمكن أن يكون أكثر من سنتين في الماضي' };
  }
  
  return { isValid: true, value: markDate };
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
 * Validate semester/term
 */
const validateSemester = (semester) => {
  if (!semester || semester.toString().trim() === '') {
    return { isValid: true, value: 'الفصل الأول' }; // Default semester
  }
  
  const semesterStr = semester.toString().trim();
  const validSemesters = [
    'الفصل الأول', 'الفصل الثاني', 'الفصل الصيفي',
    'الربع الأول', 'الربع الثاني', 'الربع الثالث', 'الربع الرابع'
  ];
  
  if (!validSemesters.includes(semesterStr)) {
    return { isValid: true, value: semesterStr }; // Allow custom semesters
  }
  
  return { isValid: true, value: semesterStr };
};

/**
 * Validate academic year
 */
const validateAcademicYear = (year) => {
  if (!year || year.toString().trim() === '') {
    const currentYear = new Date().getFullYear();
    return { isValid: true, value: `${currentYear}-${currentYear + 1}` }; // Default current academic year
  }
  
  const yearStr = year.toString().trim();
  
  // Validate format like "2024-2025"
  if (!/^\d{4}-\d{4}$/.test(yearStr)) {
    return { isValid: false, message: 'السنة الدراسية يجب أن تكون بصيغة YYYY-YYYY' };
  }
  
  const [startYear, endYear] = yearStr.split('-').map(Number);
  
  if (endYear !== startYear + 1) {
    return { isValid: false, message: 'السنة الدراسية غير صحيحة (يجب أن تكون سنوات متتالية)' };
  }
  
  const currentYear = new Date().getFullYear();
  if (startYear < currentYear - 10 || startYear > currentYear + 5) {
    return { isValid: false, message: 'السنة الدراسية خارج النطاق المسموح' };
  }
  
  return { isValid: true, value: yearStr };
};

/**
 * Sanitize mark data
 */
const sanitizeMarkData = (data) => {
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
 * Main validation middleware for mark data
 */
const validateMarkData = async (req, res, next) => {
  try {
    console.log('🔍 بدء التحقق من بيانات الدرجة...');
    
    const isUpdate = req.method === 'PUT';
    const rawData = req.body;
    
    // Sanitize input data
    const data = sanitizeMarkData(rawData);
    
    const errors = [];
    const validatedData = {};
    
    // Validate required fields for creation, optional for updates
    if (!isUpdate || data.studentId !== undefined) {
      const studentValidation = validateStudentId(data.studentId);
      if (!studentValidation.isValid) {
        errors.push(studentValidation.message);
      } else {
        validatedData.studentId = studentValidation.value;
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
    
    if (!isUpdate || data.sectionId !== undefined) {
      const sectionValidation = validateSectionId(data.sectionId);
      if (!sectionValidation.isValid) {
        errors.push(sectionValidation.message);
      } else {
        validatedData.sectionId = sectionValidation.value;
      }
    }
    
    if (!isUpdate || data.type !== undefined) {
      const typeValidation = validateMarkType(data.type);
      if (!typeValidation.isValid) {
        errors.push(typeValidation.message);
      } else {
        validatedData.type = typeValidation.value;
      }
    }
    
    // Validate max mark first (needed for mark validation)
    if (data.maxMark !== undefined) {
      const maxMarkValidation = validateMaxMark(data.maxMark);
      if (!maxMarkValidation.isValid) {
        errors.push(maxMarkValidation.message);
      } else {
        validatedData.maxMark = maxMarkValidation.value;
      }
    }
    
    if (!isUpdate || data.mark !== undefined) {
      const maxMark = validatedData.maxMark || data.maxMark || 100;
      const markValidation = validateMarkValue(data.mark, maxMark);
      if (!markValidation.isValid) {
        errors.push(markValidation.message);
      } else {
        validatedData.mark = markValidation.value;
      }
    }
    
    // Validate optional fields
    if (data.date !== undefined) {
      const dateValidation = validateDate(data.date);
      if (!dateValidation.isValid) {
        errors.push(dateValidation.message);
      } else {
        validatedData.date = dateValidation.value;
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
    
    if (data.semester !== undefined) {
      const semesterValidation = validateSemester(data.semester);
      if (!semesterValidation.isValid) {
        errors.push(semesterValidation.message);
      } else {
        validatedData.semester = semesterValidation.value;
      }
    }
    
    if (data.academicYear !== undefined) {
      const yearValidation = validateAcademicYear(data.academicYear);
      if (!yearValidation.isValid) {
        errors.push(yearValidation.message);
      } else {
        validatedData.academicYear = yearValidation.value;
      }
    }
    
    // Boolean fields
    if (data.isExtraCredit !== undefined) {
      validatedData.isExtraCredit = Boolean(data.isExtraCredit);
    }
    
    if (data.isAbsent !== undefined) {
      validatedData.isAbsent = Boolean(data.isAbsent);
    }
    
    // Calculate percentage if not provided
    if (validatedData.mark !== undefined && validatedData.maxMark !== undefined) {
      validatedData.percentage = Math.round((validatedData.mark / validatedData.maxMark) * 100 * 100) / 100;
    }
    
    // Determine grade based on percentage
    if (validatedData.percentage !== undefined) {
      if (validatedData.percentage >= 90) validatedData.grade = 'ممتاز';
      else if (validatedData.percentage >= 80) validatedData.grade = 'جيد جداً';
      else if (validatedData.percentage >= 70) validatedData.grade = 'جيد';
      else if (validatedData.percentage >= 60) validatedData.grade = 'مقبول';
      else validatedData.grade = 'راسب';
    }
    
    // Check for validation errors
    if (errors.length > 0) {
      console.log('❌ أخطاء في التحقق من بيانات الدرجة:', errors);
      return res.status(400).json({
        success: false,
        message: 'بيانات الدرجة غير صحيحة',
        errors: errors
      });
    }
    
    // Add validated data to request
    req.validatedData = validatedData;
    
    console.log('✅ تم التحقق من بيانات الدرجة بنجاح');
    next();
    
  } catch (error) {
    console.error('❌ خطأ في التحقق من بيانات الدرجة:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في خادم التحقق من البيانات',
      error: error.message
    });
  }
};

module.exports = {
  validateMarkData,
  sanitizeMarkData,
  validateStudentId,
  validateTeacherId,
  validateSectionId,
  validateMarkValue,
  validateMaxMark,
  validateMarkType,
  validateDate,
  validateNotes,
  validateSemester,
  validateAcademicYear
};