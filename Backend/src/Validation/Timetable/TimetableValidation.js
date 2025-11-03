// ============================================
// TIMETABLE VALIDATION
// ============================================
// Validation middleware for timetable/session scheduling

/**
 * Check if a value exists and is not empty
 */
const isRequired = (value) => {
  return value !== undefined && value !== null && value.toString().trim() !== '';
};

/**
 * Validate day name (Arabic or English)
 */
const validateDay = (day) => {
  if (!isRequired(day)) {
    return { isValid: false, message: 'اليوم مطلوب' };
  }

  const dayStr = day.toString().trim();
  
  // Valid Arabic days
  const validArabicDays = [
    'السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 
    'الأربعاء', 'الخميس', 'الجمعة'
  ];
  
  // Valid English days
  const validEnglishDays = [
    'Saturday', 'Sunday', 'Monday', 'Tuesday', 
    'Wednesday', 'Thursday', 'Friday'
  ];

  if (!validArabicDays.includes(dayStr) && !validEnglishDays.includes(dayStr)) {
    return { 
      isValid: false, 
      message: 'اليوم غير صحيح. يجب أن يكون أحد أيام الأسبوع' 
    };
  }

  return { isValid: true, value: dayStr };
};

/**
 * Validate start hour (time format HH:MM or H:MM)
 */
const validateStartHour = (startHour) => {
  if (!isRequired(startHour)) {
    return { isValid: false, message: 'ساعة البداية مطلوبة' };
  }

  const timeStr = startHour.toString().trim();
  
  // Validate time format (HH:MM or H:MM)
  if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(timeStr)) {
    return { 
      isValid: false, 
      message: 'ساعة البداية غير صحيحة (يجب أن تكون بصيغة HH:MM مثل 09:00)' 
    };
  }

  return { isValid: true, value: timeStr };
};

/**
 * Validate end hour (time format HH:MM or H:MM)
 */
const validateEndHour = (endHour) => {
  if (!isRequired(endHour)) {
    return { isValid: false, message: 'ساعة النهاية مطلوبة' };
  }

  const timeStr = endHour.toString().trim();
  
  // Validate time format (HH:MM or H:MM)
  if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(timeStr)) {
    return { 
      isValid: false, 
      message: 'ساعة النهاية غير صحيحة (يجب أن تكون بصيغة HH:MM مثل 11:00)' 
    };
  }

  return { isValid: true, value: timeStr };
};

/**
 * Validate note (group name or description)
 */
const validateNote = (note) => {
  if (!note || note.trim() === '') {
    return { isValid: true, value: '' }; // Optional field
  }

  const noteStr = note.toString().trim();
  
  if (noteStr.length > 200) {
    return { 
      isValid: false, 
      message: 'الملاحظة يجب أن تكون 200 حرف أو أقل' 
    };
  }

  return { isValid: true, value: noteStr };
};

/**
 * Validate time logic (start should be before end)
 */
const validateTimeLogic = (startHour, endHour) => {
  const [startH, startM] = startHour.split(':').map(Number);
  const [endH, endM] = endHour.split(':').map(Number);
  
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;
  
  if (startMinutes >= endMinutes) {
    return { 
      isValid: false, 
      message: 'ساعة البداية يجب أن تكون قبل ساعة النهاية' 
    };
  }

  return { isValid: true };
};

/**
 * Sanitize timetable data
 */
const sanitizeTimetableData = (data) => {
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
 * Main validation middleware for timetable data
 */
const validateTimetableData = async (req, res, next) => {
  try {
    console.log('🔍 بدء التحقق من بيانات الجدول الزمني...');
    
    const isUpdate = req.method === 'PUT';
    const rawData = req.body;
    
    // Sanitize input data
    const data = sanitizeTimetableData(rawData);
    
    const errors = [];
    const validatedData = {};
    
    // Validate required fields for creation, optional for updates
    if (!isUpdate || data.day !== undefined) {
      const dayValidation = validateDay(data.day);
      if (!dayValidation.isValid) {
        errors.push(dayValidation.message);
      } else {
        validatedData.day = dayValidation.value;
      }
    }
    
    if (!isUpdate || data.startHour !== undefined) {
      const startHourValidation = validateStartHour(data.startHour);
      if (!startHourValidation.isValid) {
        errors.push(startHourValidation.message);
      } else {
        validatedData.startHour = startHourValidation.value;
      }
    }
    
    if (!isUpdate || data.endHour !== undefined) {
      const endHourValidation = validateEndHour(data.endHour);
      if (!endHourValidation.isValid) {
        errors.push(endHourValidation.message);
      } else {
        validatedData.endHour = endHourValidation.value;
      }
    }
    
    // Validate optional note field
    if (data.note !== undefined) {
      const noteValidation = validateNote(data.note);
      if (!noteValidation.isValid) {
        errors.push(noteValidation.message);
      } else {
        validatedData.note = noteValidation.value;
      }
    }
    
    // Validate time logic (start should be before end)
    if (validatedData.startHour && validatedData.endHour) {
      const timeLogicValidation = validateTimeLogic(
        validatedData.startHour, 
        validatedData.endHour
      );
      if (!timeLogicValidation.isValid) {
        errors.push(timeLogicValidation.message);
      }
    }
    
    // Check for validation errors
    if (errors.length > 0) {
      console.log('❌ أخطاء في التحقق من بيانات الجدول الزمني:', errors);
      return res.status(400).json({
        success: false,
        message: 'بيانات الجدول الزمني غير صحيحة',
        errors: errors
      });
    }
    
    // Add validated data to request
    req.validatedData = validatedData;
    
    console.log('✅ تم التحقق من بيانات الجدول الزمني بنجاح');
    next();
    
  } catch (error) {
    console.error('❌ خطأ في التحقق من بيانات الجدول الزمني:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في خادم التحقق من البيانات',
      error: error.message
    });
  }
};

module.exports = {
  validateTimetableData,
  sanitizeTimetableData,
  validateDay,
  validateStartHour,
  validateEndHour,
  validateNote,
  validateTimeLogic
};
