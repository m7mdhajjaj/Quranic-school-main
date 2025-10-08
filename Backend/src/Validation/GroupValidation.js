// Validation/GroupValidation.js

/**
 * Group data validation middleware with comprehensive rules
 * Validates and sanitizes group data to ensure data integrity
 */

/**
 * Check if a value exists and is not empty
 */
const isRequired = (value) => {
  return (
    value !== undefined && value !== null && value.toString().trim() !== ""
  );
};

/**
 * Validate group name (Arabic text)
 */
const validateGroupName = (name) => {
  if (!isRequired(name)) {
    return { isValid: false, message: "اسم المجموعة مطلوب" };
  }

  const nameStr = name.toString().trim();
  if (nameStr.length < 2) {
    return {
      isValid: false,
      message: "اسم المجموعة يجب أن يكون حرفين على الأقل",
    };
  }

  if (nameStr.length > 100) {
    return {
      isValid: false,
      message: "اسم المجموعة يجب أن يكون 100 حرف أو أقل",
    };
  }

  // Allow Arabic letters, numbers, spaces, and common punctuation
  if (
    !/^[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\s\d\-'\.]+$/.test(
      nameStr
    )
  ) {
    return {
      isValid: false,
      message: "اسم المجموعة يجب أن يحتوي على أحرف عربية وأرقام فقط",
    };
  }

  return { isValid: true, value: nameStr };
};

/**
 * Validate group description
 */
const validateDescription = (description) => {
  if (!description || description.trim() === "") {
    return { isValid: true, value: "" }; // Optional field
  }

  const descStr = description.toString().trim();
  if (descStr.length > 500) {
    return {
      isValid: false,
      message: "وصف المجموعة يجب أن يكون 500 حرف أو أقل",
    };
  }

  return { isValid: true, value: descStr };
};

/**
 * Validate teacher assignment
 */
const validateTeacher = (teacherId) => {
  if (!teacherId || teacherId.toString().trim() === "") {
    return { isValid: true, value: null }; // Optional field
  }

  const teacherStr = teacherId.toString().trim();

  // If it's an ObjectId string
  if (/^[0-9a-fA-F]{24}$/.test(teacherStr)) {
    return { isValid: true, value: teacherStr };
  }

  // If it's a teacher ID (8 digits)
  if (/^\d{8}$/.test(teacherStr)) {
    return { isValid: true, value: teacherStr };
  }
  
  // If it's a teacher name (Arabic text with spaces)
  if (/^[\u0600-\u06FF\s\-'\.]+$/.test(teacherStr) && teacherStr.length >= 2) {
    return { isValid: true, value: teacherStr };
  }
  
  // If we get here, it might still be valid (allow any non-empty string for flexibility)
  return { isValid: true, value: teacherStr };
};

/**
 * Validate group level/grade
 */
const validateLevel = (level) => {
  if (!level || level.toString().trim() === "") {
    return { isValid: true, value: "" }; // Optional field
  }

  const levelStr = level.toString().trim();
  const validLevels = [
    "مبتدئ",
    "متوسط",
    "متقدم",
    "تحفيظ",
    "الصف الأول",
    "الصف الثاني",
    "الصف الثالث",
    "الصف الرابع",
    "الصف الخامس",
    "الصف السادس",
    "الصف السابع",
    "الصف الثامن",
    "الصف التاسع",
    "الصف العاشر",
    "الصف الحادي عشر",
    "الصف الثاني عشر",
  ];

  if (!validLevels.includes(levelStr)) {
    return { isValid: true, value: levelStr }; // Allow custom levels
  }

  return { isValid: true, value: levelStr };
};

/**
 * Validate maximum capacity
 */
const validateCapacity = (capacity) => {
  if (!capacity) {
    return { isValid: true, value: 30 }; // Default capacity
  }

  const capacityNum = parseInt(capacity);
  if (isNaN(capacityNum) || capacityNum < 1) {
    return {
      isValid: false,
      message: "سعة المجموعة يجب أن تكون رقم أكبر من صفر",
    };
  }

  if (capacityNum > 100) {
    return {
      isValid: false,
      message: "سعة المجموعة لا يمكن أن تزيد عن 100 طالب",
    };
  }

  return { isValid: true, value: capacityNum };
};

/**
 * Validate schedule array
 */
const validateSchedule = (schedule) => {
  if (!schedule || !Array.isArray(schedule)) {
    return { isValid: true, value: [] }; // Optional field
  }

  const validDays = [
    "الأحد",
    "الإثنين",
    "الثلاثاء",
    "الأربعاء",
    "الخميس",
    "الجمعة",
    "السبت",
  ];
  const validatedSchedule = [];

  for (const session of schedule) {
    if (!session.day || !session.time) {
      return { isValid: false, message: "كل جلسة يجب أن تحتوي على يوم ووقت" };
    }

    if (!validDays.includes(session.day)) {
      return { isValid: false, message: `يوم غير صحيح: ${session.day}` };
    }

    // Validate time format (HH:MM)
    if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(session.time)) {
      return {
        isValid: false,
        message: `وقت غير صحيح: ${session.time} (يجب أن يكون بصيغة HH:MM)`,
      };
    }

    validatedSchedule.push({
      day: session.day,
      time: session.time,
      duration: session.duration || 60, // Default 60 minutes
    });
  }

  return { isValid: true, value: validatedSchedule };
};

/**
 * Validate group type
 */
const validateGroupType = (type) => {
  if (!type || type.toString().trim() === "") {
    return { isValid: true, value: "عادية" }; // Default type
  }

  const validTypes = ["عادية", "تحفيظ", "تلاوة", "تجويد", "مراجعة", "اختبارات"];
  const typeStr = type.toString().trim();

  if (!validTypes.includes(typeStr)) {
    return { isValid: true, value: typeStr }; // Allow custom types
  }

  return { isValid: true, value: typeStr };
};

/**
 * Sanitize group data
 */
const sanitizeGroupData = (data) => {
  const sanitized = {};

  // Remove potential XSS and clean up data
  Object.keys(data).forEach((key) => {
    if (typeof data[key] === "string") {
      sanitized[key] = data[key]
        .trim()
        .replace(/[<>]/g, "") // Remove potential HTML tags
        .replace(/javascript:/gi, ""); // Remove javascript: protocols
    } else {
      sanitized[key] = data[key];
    }
  });

  return sanitized;
};

/**
 * Main validation middleware for group data
 */
const validateGroupData = async (req, res, next) => {
  try {
    console.log("🔍 بدء التحقق من بيانات المجموعة...");

    const isUpdate = req.method === "PUT";
    const rawData = req.body;

    // Sanitize input data
    const data = sanitizeGroupData(rawData);

    const errors = [];
    const validatedData = {};

    // Validate required fields for creation, optional for updates
    if (!isUpdate || data.name !== undefined) {
      const nameValidation = validateGroupName(data.name);
      if (!nameValidation.isValid) {
        errors.push(nameValidation.message);
      } else {
        validatedData.name = nameValidation.value;
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

    if (data.teacher !== undefined) {
      const teacherValidation = validateTeacher(data.teacher);
      if (!teacherValidation.isValid) {
        errors.push(teacherValidation.message);
      } else {
        validatedData.teacher = teacherValidation.value;
      }
    }

    if (data.level !== undefined) {
      const levelValidation = validateLevel(data.level);
      if (!levelValidation.isValid) {
        errors.push(levelValidation.message);
      } else {
        validatedData.level = levelValidation.value;
      }
    }

    if (data.capacity !== undefined) {
      const capacityValidation = validateCapacity(data.capacity);
      if (!capacityValidation.isValid) {
        errors.push(capacityValidation.message);
      } else {
        validatedData.capacity = capacityValidation.value;
      }
    }

    if (data.schedule !== undefined) {
      const scheduleValidation = validateSchedule(data.schedule);
      if (!scheduleValidation.isValid) {
        errors.push(scheduleValidation.message);
      } else {
        validatedData.schedule = scheduleValidation.value;
      }
    }

    if (data.type !== undefined) {
      const typeValidation = validateGroupType(data.type);
      if (!typeValidation.isValid) {
        errors.push(typeValidation.message);
      } else {
        validatedData.type = typeValidation.value;
      }
    }

    // Boolean fields
    if (data.isActive !== undefined) {
      validatedData.isActive = Boolean(data.isActive);
    }

    // Date fields
    if (data.startDate !== undefined && data.startDate) {
      const startDate = new Date(data.startDate);
      if (isNaN(startDate.getTime())) {
        errors.push("تاريخ البداية غير صحيح");
      } else {
        validatedData.startDate = startDate;
      }
    }

    if (data.endDate !== undefined && data.endDate) {
      const endDate = new Date(data.endDate);
      if (isNaN(endDate.getTime())) {
        errors.push("تاريخ النهاية غير صحيح");
      } else {
        validatedData.endDate = endDate;
      }
    }

    // Validate date logic
    if (validatedData.startDate && validatedData.endDate) {
      if (validatedData.startDate >= validatedData.endDate) {
        errors.push("تاريخ البداية يجب أن يكون قبل تاريخ النهاية");
      }
    }

    // Check for validation errors
    if (errors.length > 0) {
      console.log("❌ أخطاء في التحقق من بيانات المجموعة:", errors);
      return res.status(400).json({
        success: false,
        message: "بيانات المجموعة غير صحيحة",
        errors: errors,
      });
    }

    // Add validated data to request
    req.validatedData = validatedData;

    console.log("✅ تم التحقق من بيانات المجموعة بنجاح");
    next();
  } catch (error) {
    console.error("❌ خطأ في التحقق من بيانات المجموعة:", error);
    res.status(500).json({
      success: false,
      message: "خطأ في خادم التحقق من البيانات",
      error: error.message,
    });
  }
};

module.exports = {
  validateGroupData,
  sanitizeGroupData,
  validateGroupName,
  validateDescription,
  validateTeacher,
  validateLevel,
  validateCapacity,
  validateSchedule,
  validateGroupType,
};
