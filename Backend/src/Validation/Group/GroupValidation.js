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
 * يقبل: ObjectId, teacher ID (8 digits), أو اسم المعلم
 * ملاحظة: الـ controller سيقوم بتحويل الاسم إلى ObjectId
 */
const validateTeacher = (teacherId) => {
  if (!teacherId || teacherId.toString().trim() === "") {
    return { isValid: true, value: null }; // Optional field
  }

  const teacherStr = teacherId.toString().trim();

  // If it's an ObjectId string (24 hex characters)
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
  
  // Allow any non-empty string for flexibility (controller will validate existence)
  return { isValid: true, value: teacherStr };
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

  if (capacityNum > 50) {
    return {
      isValid: false,
      message: "سعة المجموعة لا يمكن أن تزيد عن 50 طالب",
    };
  }

  return { isValid: true, value: capacityNum };
};

/**
 * Validate schedule string (matches Schema definition)
 */
const validateSchedule = (schedule) => {
  if (!schedule || schedule.toString().trim() === "") {
    return { isValid: true, value: "" }; // Optional field
  }

  const scheduleStr = schedule.toString().trim();
  
  if (scheduleStr.length > 100) {
    return {
      isValid: false,
      message: "الجدول الزمني يجب ألا يتجاوز 100 حرف",
    };
  }

  // Allow Arabic text, numbers, spaces, colons, and hyphens
  if (!/^[\u0600-\u06FF\s0-9:-]*$/.test(scheduleStr)) {
    return {
      isValid: false,
      message: "صيغة الجدول غير صحيحة",
    };
  }

  return { isValid: true, value: scheduleStr };
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

    // Boolean fields
    if (data.isActive !== undefined) {
      validatedData.isActive = Boolean(data.isActive);
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

/**
 * Validation middleware for renaming a group
 */
const validateRenameGroup = async (req, res, next) => {
  try {
    console.log("🔍 بدء التحقق من بيانات إعادة التسمية...");

    const { oldName, newName } = req.body;
    const errors = [];

    // Validate oldName
    if (!isRequired(oldName)) {
      errors.push("الاسم القديم للمجموعة مطلوب");
    } else {
      const oldNameValidation = validateGroupName(oldName);
      if (!oldNameValidation.isValid) {
        errors.push("الاسم القديم: " + oldNameValidation.message);
      }
    }

    // Validate newName
    if (!isRequired(newName)) {
      errors.push("الاسم الجديد للمجموعة مطلوب");
    } else {
      const newNameValidation = validateGroupName(newName);
      if (!newNameValidation.isValid) {
        errors.push("الاسم الجديد: " + newNameValidation.message);
      }
    }

    // Check if names are different
    if (oldName && newName && oldName.trim() === newName.trim()) {
      errors.push("الاسم الجديد يجب أن يكون مختلفاً عن الاسم القديم");
    }

    // Check for validation errors
    if (errors.length > 0) {
      console.log("❌ أخطاء في التحقق من بيانات إعادة التسمية:", errors);
      return res.status(400).json({
        success: false,
        message: "بيانات إعادة التسمية غير صحيحة",
        errors: errors,
      });
    }

    console.log("✅ تم التحقق من بيانات إعادة التسمية بنجاح");
    next();
  } catch (error) {
    console.error("❌ خطأ في التحقق من بيانات إعادة التسمية:", error);
    res.status(500).json({
      success: false,
      message: "خطأ في خادم التحقق من البيانات",
      error: error.message,
    });
  }
};

/**
 * Validation middleware for getting teacher groups (for attendance)
 */
const validateGetTeacherGroups = async (req, res, next) => {
  try {
    console.log("🔍 بدء التحقق من طلب حلقات المعلم...");

    const { teacherId } = req.params;
    const { filter, includeStudents } = req.query;
    const errors = [];

    // Validate teacherId
    const teacherValidation = validateTeacher(teacherId);
    if (!teacherValidation.isValid) {
      errors.push(teacherValidation.message);
    }

    // Validate filter param
    if (filter) {
      const validFilters = ['all', 'withStudents', 'withoutStudents'];
      if (!validFilters.includes(filter)) {
        errors.push(`قيمة الفلتر غير صالحة. القيم المسموحة: ${validFilters.join(', ')}`);
      }
    }

    // Validate includeStudents param
    if (includeStudents) {
      if (!['true', 'false'].includes(includeStudents)) {
        errors.push("قيمة includeStudents يجب أن تكون 'true' أو 'false'");
      }
    }

    // Check authorization
    if (req.user.role !== 'admin' && req.user._id.toString() !== teacherId) {
      errors.push("غير مصرح لك بالوصول إلى هذه البيانات");
    }

    // Check for validation errors
    if (errors.length > 0) {
      console.log("❌ أخطاء في التحقق من طلب حلقات المعلم:", errors);
      return res.status(errors.includes("غير مصرح لك بالوصول إلى هذه البيانات") ? 403 : 400).json({
        success: false,
        message: "خطأ في البيانات المرسلة",
        errors: errors,
      });
    }

    console.log("✅ تم التحقق من طلب حلقات المعلم بنجاح");
    next();
  } catch (error) {
    console.error("❌ خطأ في التحقق من طلب حلقات المعلم:", error);
    res.status(500).json({
      success: false,
      message: "خطأ في خادم التحقق من البيانات",
      error: error.message,
    });
  }
};

module.exports = {
  validateGroupData,
  validateRenameGroup,
  validateGetTeacherGroups,
  sanitizeGroupData,
  validateGroupName,
  validateDescription,
  validateTeacher,
  validateCapacity,
  validateSchedule,
};
