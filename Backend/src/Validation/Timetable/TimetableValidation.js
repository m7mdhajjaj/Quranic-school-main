// ============================================
// TIMETABLE VALIDATION
// ============================================
// Validation middleware for timetable/session scheduling

/**
 * تحديد إذا كان التوقيت صيفي أو شتوي (تلقائي)
 * الصيفي: من مايو (5) إلى سبتمبر (9)
 * الشتوي: من أكتوبر (10) إلى أبريل (4)
 */
const isSummerTime = () => {
  const now = new Date();
  const month = now.getMonth() + 1; // 1-12
  return month >= 5 && month <= 9;
};

/**
 * Check if a value exists and is not empty
 */
const isRequired = (value) => {
  return value !== undefined && value !== null && value.toString().trim() !== '';
};

/**
 * Validate day name (Arabic only - matching schema enum)
 */
const validateDay = (day) => {
  if (!isRequired(day)) {
    // If not provided, return valid (controller will handle derivation or error if context missing)
    return { isValid: true, value: undefined };
  }

  const dayStr = day.toString().trim();
  
  // Valid Arabic days - must match schema enum
  const validArabicDays = [
    'السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 
    'الأربعاء', 'الخميس', 'الجمعة'
  ];

  if (!validArabicDays.includes(dayStr)) {
    return { 
      isValid: false, 
      message: 'اليوم غير صحيح. يجب أن يكون أحد أيام الأسبوع (السبت، الأحد، الاثنين، الثلاثاء، الأربعاء، الخميس، الجمعة)' 
    };
  }

  return { isValid: true, value: dayStr };
};

/**
 * Validate start hour (time format with AM/PM and working hours check)
 */
const validateStartHour = (startHour) => {
  if (!isRequired(startHour)) {
    return { isValid: false, message: 'ساعة البداية مطلوبة' };
  }

  const timeStr = startHour.toString().trim();
  
  // Validate time format (HH:MM AM/PM or H:MM AM/PM)
  if (!/^([0-1]?[0-9]):[0-5][0-9]\s?(AM|PM|am|pm)$/i.test(timeStr)) {
    return { 
      isValid: false, 
      message: 'ساعة البداية غير صحيحة (يجب أن تكون بصيغة HH:MM AM/PM مثل 12:00 PM)' 
    };
  }

  // Check working hours (صيفي: 12:00 PM - 9:00 PM، شتوي: 11:00 AM - 8:00 PM)
  const match = timeStr.match(/^([0-1]?[0-9]):[0-5][0-9]\s?(AM|PM|am|pm)$/i);
  if (match) {
    const hour = parseInt(match[1]);
    const isPM = match[2].toLowerCase() === 'pm';
    const isAM = match[2].toLowerCase() === 'am';
    
    let isValidHour = false;
    if (isPM) {
      // PM: 12:00 PM - 9:00 PM مسموح (صيفي وشتوي)
      isValidHour = hour === 12 || (hour >= 1 && hour <= 9);
    } else if (isAM) {
      // AM: 11:00 AM و 11:30 AM فقط (شتوي)
      isValidHour = hour === 11;
    }
    
    if (!isValidHour) {
      return {
        isValid: false,
        message: 'أوقات العمل: صيفي (12:00 PM - 9:00 PM) أو شتوي (11:00 AM - 8:00 PM)'
      };
    }
  }

  return { isValid: true, value: timeStr };
};

/**
 * Validate end hour (time format with AM/PM and working hours check)
 */
const validateEndHour = (endHour) => {
  if (!isRequired(endHour)) {
    return { isValid: false, message: 'ساعة النهاية مطلوبة' };
  }

  const timeStr = endHour.toString().trim();
  
  // Validate time format (HH:MM AM/PM or H:MM AM/PM)
  if (!/^([0-1]?[0-9]):[0-5][0-9]\s?(AM|PM|am|pm)$/i.test(timeStr)) {
    return { 
      isValid: false, 
      message: 'ساعة النهاية غير صحيحة (يجب أن تكون بصيغة HH:MM AM/PM مثل 11:00 PM)' 
    };
  }

  // ✅ فحص الأوقات حسب التوقيت الحالي (تلقائي)
  const match = timeStr.match(/^([0-1]?[0-9]):[0-5][0-9]\s?(AM|PM|am|pm)$/i);
  if (match) {
    const hour = parseInt(match[1]);
    const isPM = match[2].toLowerCase() === 'pm';
    const isAM = match[2].toLowerCase() === 'am';
    const isSummer = isSummerTime();
    
    let isValidHour = false;
    
    if (isSummer) {
      // ☀️ صيفي: 12:00 PM - 9:00 PM فقط
      if (isPM) {
        isValidHour = hour === 12 || (hour >= 1 && hour <= 9);
      } else if (isAM) {
        // AM غير مسموح في الصيف
        return {
          isValid: false,
          message: '⚠️ التوقيت الصيفي الحالي: 12:00 PM - 9:00 PM فقط'
        };
      }
    } else {
      // ❄️ شتوي: 11:00 AM - 9:00 PM (تمديد لتغطية نهاية الحلقات التي تبدأ 8:00 PM)
      if (isPM) {
        isValidHour = hour === 12 || (hour >= 1 && hour <= 9);
      } else if (isAM) {
        isValidHour = hour === 11;
      }
    }
    
    if (!isValidHour) {
      const seasonMsg = isSummer 
        ? '☀️ التوقيت الصيفي: 12:00 PM - 9:00 PM'
        : '❄️ التوقيت الشتوي: 11:00 AM - 9:00 PM';
      return {
        isValid: false,
        message: `أوقات العمل الحالية: ${seasonMsg}`
      };
    }
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
 * Validate description (detailed notes or report)
 */
const validateDescription = (description) => {
  if (!description || description.trim() === '') {
    return { isValid: true, value: '' }; // Optional field
  }

  const descStr = description.toString().trim();
  
  if (descStr.length > 500) {
    return { 
      isValid: false, 
      message: 'الوصف يجب أن يكون 500 حرف أو أقل' 
    };
  }

  return { isValid: true, value: descStr };
};

/**
 * Validate teacherId (required field)
 */
const validateTeacherId = (teacherId) => {
  if (!isRequired(teacherId)) {
    return { isValid: false, message: 'معرف المعلم مطلوب' };
  }

  const teacherIdStr = teacherId.toString().trim();
  
  // Validate MongoDB ObjectId format (24 hex characters)
  if (!/^[a-fA-F0-9]{24}$/.test(teacherIdStr)) {
    return { 
      isValid: false, 
      message: 'معرف المعلم غير صحيح' 
    };
  }

  return { isValid: true, value: teacherIdStr };
};

/**
 * Validate sessionType (optional field)
 */
const validateSessionType = (sessionType) => {
  if (!sessionType || sessionType.trim() === '') {
    return { isValid: true, value: undefined }; // Optional field
  }

  const validTypes = ['hifz', 'murajaah', 'both'];
  const typeStr = sessionType.toString().trim().toLowerCase();
  
  if (!validTypes.includes(typeStr)) {
    return { 
      isValid: false, 
      message: 'نوع الحصة يجب أن يكون: hifz (حفظ) أو murajaah (مراجعة) أو both (الاثنين)' 
    };
  }

  return { isValid: true, value: typeStr };
};

/**
 * Validate time logic (start should be before end)
 */
const validateTimeLogic = (startHour, endHour) => {
  // تحويل الوقت من 12-hour إلى دقائق
  const timeToMinutes = (timeStr) => {
    const match = timeStr.match(/^([0-9]{1,2}):([0-5][0-9])\s?(AM|PM|am|pm)$/i);
    if (!match) return -1;

    let hour = parseInt(match[1]);
    const minutes = parseInt(match[2]);
    const period = match[3].toLowerCase();

    // تحويل إلى 24 ساعة
    if (period === 'pm' && hour !== 12) {
      // 1 PM = 13, 2 PM = 14, ..., 9 PM = 21
      hour += 12;
    } else if (period === 'am' && hour === 12) {
      // 12 AM = 0 (منتصف الليل)
      hour = 0;
    } else if (period === 'pm' && hour === 12) {
      // 12 PM = 12 (الظهر)
      hour = 12;
    }
    // AM: 11 AM = 11 (يبقى كما هو)

    return hour * 60 + minutes;
  };

  const startMinutes = timeToMinutes(startHour);
  const endMinutes = timeToMinutes(endHour);
  
  if (startMinutes === -1 || endMinutes === -1) {
    return { 
      isValid: false, 
      message: 'صيغة الوقت غير صحيحة' 
    };
  }
  
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
 * Validate sectionId (optional relation)
 */
const validateSectionId = (sectionId) => {
  if (!sectionId || sectionId.toString().trim() === '') {
    return { isValid: true, value: undefined }; // Optional
  }

  const idStr = sectionId.toString().trim();
  
  if (!/^[a-fA-F0-9]{24}$/.test(idStr)) {
    return { 
      isValid: false, 
      message: 'معرف المقطع غير صحيح' 
    };
  }

  return { isValid: true, value: idStr };
};

/**
 * Validate isRecurring (optional boolean)
 */
const validateIsRecurring = (isRecurring) => {
  if (isRecurring === undefined || isRecurring === null) {
    return { isValid: true, value: undefined }; // Optional - will be set by controller
  }

  if (typeof isRecurring !== 'boolean') {
    return { 
      isValid: false, 
      message: 'isRecurring يجب أن يكون true أو false' 
    };
  }

  return { isValid: true, value: isRecurring };
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
    
    // Validate optional description field
    if (data.description !== undefined) {
      const descriptionValidation = validateDescription(data.description);
      if (!descriptionValidation.isValid) {
        errors.push(descriptionValidation.message);
      } else {
        validatedData.description = descriptionValidation.value;
      }
    }
    
    // Validate optional sessionType field
    if (data.sessionType !== undefined) {
      const sessionTypeValidation = validateSessionType(data.sessionType);
      if (!sessionTypeValidation.isValid) {
        errors.push(sessionTypeValidation.message);
      } else {
        validatedData.sessionType = sessionTypeValidation.value;
      }
    }

    // Validate optional sectionId field
    if (data.sectionId !== undefined) {
      const sectionIdValidation = validateSectionId(data.sectionId);
      if (!sectionIdValidation.isValid) {
        errors.push(sectionIdValidation.message);
      } else {
        validatedData.sectionId = sectionIdValidation.value;
      }
    }
    
    // Validate optional isRecurring field
    if (data.isRecurring !== undefined) {
      const isRecurringValidation = validateIsRecurring(data.isRecurring);
      if (!isRecurringValidation.isValid) {
        errors.push(isRecurringValidation.message);
      } else {
        validatedData.isRecurring = isRecurringValidation.value;
      }
    }
    
    // Validate required teacherId field for creation
    if (!isUpdate || data.teacherId !== undefined) {
      if (!isUpdate && !data.teacherId) {
        errors.push('معرف المعلم مطلوب');
      } else if (data.teacherId) {
        const teacherIdValidation = validateTeacherId(data.teacherId);
        if (!teacherIdValidation.isValid) {
          errors.push(teacherIdValidation.message);
        } else {
          validatedData.teacherId = teacherIdValidation.value;
        }
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
    console.log('ℹ️ ملاحظة: فحص التعارب الزمني يتم في الـ controller');
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
  validateTeacherId,
  validateSessionType,
  validateSectionId,
  validateIsRecurring,
  validateTimeLogic
};
