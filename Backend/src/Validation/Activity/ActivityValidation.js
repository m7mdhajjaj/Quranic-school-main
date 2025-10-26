// Validation/ActivityValidation.js

/**
 * Activity data validation middleware with comprehensive rules
 * Validates and sanitizes activity data to ensure data integrity
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
 * Validate activity title (Arabic text)
 */
const validateActivityTitle = (title) => {
  if (!isRequired(title)) {
    return { isValid: false, message: "عنوان النشاط مطلوب" };
  }

  const titleStr = title.toString().trim();
  if (titleStr.length < 5) {
    return {
      isValid: false,
      message: "عنوان النشاط يجب أن يكون 5 أحرف على الأقل",
    };
  }

  if (titleStr.length > 200) {
    return {
      isValid: false,
      message: "عنوان النشاط يجب أن يكون 200 حرف أو أقل",
    };
  }

  return { isValid: true, value: titleStr };
};

/**
 * Validate activity description
 */
const validateDescription = (description) => {
  if (!isRequired(description)) {
    return { isValid: false, message: "وصف النشاط مطلوب" };
  }

  const descStr = description.toString().trim();
  if (descStr.length < 10) {
    return {
      isValid: false,
      message: "وصف النشاط يجب أن يكون 10 أحرف على الأقل",
    };
  }

  if (descStr.length > 2000) {
    return {
      isValid: false,
      message: "وصف النشاط يجب أن يكون 2000 حرف أو أقل",
    };
  }

  return { isValid: true, value: descStr };
};

/**
 * Validate activity type/category
 */
const validateActivityType = (type) => {
  if (!isRequired(type)) {
    return { isValid: true, value: "عام" }; // Default type
  }

  const typeStr = type.toString().trim();
  const validTypes = [
    "عام",
    "رياضي",
    "ثقافي",
    "تعليمي",
    "فني",
    "اجتماعي",
    "ديني",
    "مسابقة",
    "رحلة",
    "ورشة عمل",
    "محاضرة",
    "معرض",
  ];

  if (!validTypes.includes(typeStr)) {
    return { isValid: true, value: typeStr }; // Allow custom types
  }

  return { isValid: true, value: typeStr };
};

/**
 * Validate activity date
 */
const validateActivityDate = (date) => {
  if (!isRequired(date)) {
    return { isValid: false, message: "تاريخ النشاط مطلوب" };
  }

  const activityDate = new Date(date);
  if (isNaN(activityDate.getTime())) {
    return { isValid: false, message: "تاريخ النشاط غير صحيح" };
  }

  return { isValid: true, value: activityDate };
};

/**
 * Validate activity time
 */
const validateActivityTime = (time) => {
  if (!time || time.trim() === "") {
    return { isValid: true, value: "09:00" }; // Default time
  }

  const timeStr = time.toString().trim();

  // Validate time format (HH:MM)
  if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(timeStr)) {
    return {
      isValid: false,
      message: "وقت النشاط غير صحيح (يجب أن يكون بصيغة HH:MM)",
    };
  }

  return { isValid: true, value: timeStr };
};

/**
 * Validate duration in minutes
 */
const validateDuration = (duration) => {
  if (!duration) {
    return { isValid: true, value: 120 }; // Default 2 hours
  }

  const durationNum = parseInt(duration);
  if (isNaN(durationNum) || durationNum < 15) {
    return {
      isValid: false,
      message: "مدة النشاط يجب أن تكون 15 دقيقة على الأقل",
    };
  }

  if (durationNum > 720) {
    // 12 hours max
    return { isValid: false, message: "مدة النشاط لا يمكن أن تزيد عن 12 ساعة" };
  }

  return { isValid: true, value: durationNum };
};

/**
 * Validate location
 */
const validateLocation = (location) => {
  if (!isRequired(location)) {
    return { isValid: false, message: "مكان النشاط مطلوب" };
  }

  const locationStr = location.toString().trim();
  if (locationStr.length < 2) {
    return {
      isValid: false,
      message: "مكان النشاط يجب أن يكون حرفين على الأقل",
    };
  }

  if (locationStr.length > 200) {
    return {
      isValid: false,
      message: "مكان النشاط يجب أن يكون 200 حرف أو أقل",
    };
  }

  return { isValid: true, value: locationStr };
};

/**
 * Validate organizer information
 */
const validateOrganizer = (organizer) => {
  if (!isRequired(organizer)) {
    return { isValid: false, message: "منظم النشاط مطلوب" };
  }

  const organizerStr = organizer.toString().trim();

  // If it's an ObjectId string
  if (/^[0-9a-fA-F]{24}$/.test(organizerStr)) {
    return { isValid: true, value: organizerStr };
  }

  // If it's a teacher ID (8 digits)
  if (/^\d{8}$/.test(organizerStr)) {
    return { isValid: true, value: organizerStr };
  }

  // If it's a name
  if (organizerStr.length >= 2 && organizerStr.length <= 100) {
    return { isValid: true, value: organizerStr };
  }

  return { isValid: false, message: "معرف منظم النشاط غير صحيح" };
};

/**
 * Validate target groups array
 */
const validateTargetGroups = (targetGroups) => {
  if (!targetGroups || !Array.isArray(targetGroups)) {
    return { isValid: true, value: [] }; // Optional field
  }

  if (targetGroups.length > 20) {
    return { isValid: false, message: "لا يمكن استهداف أكثر من 20 مجموعة" };
  }

  const validatedGroups = [];
  for (const group of targetGroups) {
    if (typeof group === "string" && group.trim().length > 0) {
      validatedGroups.push(group.trim());
    }
  }

  return { isValid: true, value: [...new Set(validatedGroups)] }; // Remove duplicates
};

/**
 * Validate maximum participants
 */
const validateMaxParticipants = (maxParticipants) => {
  if (!maxParticipants) {
    return { isValid: true, value: null }; // No limit
  }

  const maxNum = parseInt(maxParticipants);
  if (isNaN(maxNum) || maxNum < 1) {
    return {
      isValid: false,
      message: "العدد الأقصى للمشاركين يجب أن يكون رقم أكبر من صفر",
    };
  }

  if (maxNum > 1000) {
    return {
      isValid: false,
      message: "العدد الأقصى للمشاركين لا يمكن أن يزيد عن 1000",
    };
  }

  return { isValid: true, value: maxNum };
};

/**
 * Validate requirements array
 */
const validateRequirements = (requirements) => {
  if (!requirements || !Array.isArray(requirements)) {
    return { isValid: true, value: [] }; // Optional field
  }

  const validatedRequirements = [];
  for (const req of requirements) {
    if (typeof req === "string" && req.trim().length > 0) {
      const reqStr = req.trim();
      if (reqStr.length <= 200) {
        validatedRequirements.push(reqStr);
      }
    }
  }

  return { isValid: true, value: validatedRequirements };
};

/**
 * Validate image file information
 */
const validateImageFile = (file) => {
  if (!file) {
    return { isValid: true, value: null }; // Optional field
  }

  // Check file type
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.mimetype)) {
    return {
      isValid: false,
      message: "نوع الصورة غير مدعوم (يُسمح بـ JPEG, PNG, WebP فقط)",
    };
  }

  // Check file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return {
      isValid: false,
      message: "حجم الصورة كبير جداً (الحد الأقصى 5 ميجابايت)",
    };
  }

  return { isValid: true, value: file };
};

/**
 * Sanitize activity data
 */
const sanitizeActivityData = (data) => {
  const sanitized = {};

  // Remove potential XSS and clean up data
  Object.keys(data).forEach((key) => {
    if (typeof data[key] === "string") {
      sanitized[key] = data[key]
        .trim()
        .replace(/[<>]/g, "") // Remove potential HTML tags
        .replace(/javascript:/gi, "") // Remove javascript: protocols
        .replace(/on\w+=/gi, ""); // Remove event handlers
    } else {
      sanitized[key] = data[key];
    }
  });

  return sanitized;
};

/**
 * Main validation middleware for activity data
 */
const validateActivityData = async (req, res, next) => {
  try {
    console.log("🔍 بدء التحقق من بيانات النشاط...");

    const isUpdate = req.method === "PUT";
    const rawData = req.body;

    // Sanitize input data
    const data = sanitizeActivityData(rawData);

    const errors = [];
    const validatedData = {};

    // Validate required fields for creation, optional for updates
    if (!isUpdate || data.title !== undefined) {
      const titleValidation = validateActivityTitle(data.title);
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

    if (!isUpdate || data.date !== undefined) {
      const dateValidation = validateActivityDate(data.date);
      if (!dateValidation.isValid) {
        errors.push(dateValidation.message);
      } else {
        // Keep date as string since the schema expects a string
        validatedData.date = data.date;
      }
    }

    // Location is optional
    if (data.location !== undefined) {
      const locationValidation = validateLocation(data.location);
      if (!locationValidation.isValid) {
        errors.push(locationValidation.message);
      } else {
        validatedData.location = locationValidation.value;
      }
    }

    // Organizer is optional
    if (data.organizer !== undefined) {
      const organizerValidation = validateOrganizer(data.organizer);
      if (!organizerValidation.isValid) {
        errors.push(organizerValidation.message);
      } else {
        validatedData.organizer = organizerValidation.value;
      }
    }

    // Validate optional fields
    if (data.type !== undefined) {
      const typeValidation = validateActivityType(data.type);
      if (!typeValidation.isValid) {
        errors.push(typeValidation.message);
      } else {
        validatedData.type = typeValidation.value;
      }
    }

    // Validate category (same as type)
    if (data.category !== undefined) {
      validatedData.category = data.category.toString().trim();
    }

    // Validate imageUrl
    if (data.imageUrl !== undefined) {
      validatedData.imageUrl = data.imageUrl.toString().trim();
    }

    if (data.time !== undefined) {
      const timeValidation = validateActivityTime(data.time);
      if (!timeValidation.isValid) {
        errors.push(timeValidation.message);
      } else {
        validatedData.time = timeValidation.value;
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

    if (data.targetGroups !== undefined) {
      const targetGroupsValidation = validateTargetGroups(data.targetGroups);
      if (!targetGroupsValidation.isValid) {
        errors.push(targetGroupsValidation.message);
      } else {
        validatedData.targetGroups = targetGroupsValidation.value;
      }
    }

    if (data.maxParticipants !== undefined) {
      const maxParticipantsValidation = validateMaxParticipants(
        data.maxParticipants
      );
      if (!maxParticipantsValidation.isValid) {
        errors.push(maxParticipantsValidation.message);
      } else {
        validatedData.maxParticipants = maxParticipantsValidation.value;
      }
    }

    if (data.requirements !== undefined) {
      const requirementsValidation = validateRequirements(data.requirements);
      if (!requirementsValidation.isValid) {
        errors.push(requirementsValidation.message);
      } else {
        validatedData.requirements = requirementsValidation.value;
      }
    }

    // Validate uploaded image file if present (for old multer-based uploads)
    // Now we use Cloudinary URLs, so this is optional
    if (req.file) {
      const imageValidation = validateImageFile(req.file);
      if (!imageValidation.isValid) {
        errors.push(imageValidation.message);
      }
    }

    // Boolean fields
    if (data.isActive !== undefined) {
      validatedData.isActive = Boolean(data.isActive);
    }

    if (data.requiresRegistration !== undefined) {
      validatedData.requiresRegistration = Boolean(data.requiresRegistration);
    }

    if (data.isFeatured !== undefined) {
      validatedData.isFeatured = Boolean(data.isFeatured);
    }

    // Date fields
    if (data.registrationDeadline !== undefined && data.registrationDeadline) {
      const regDeadline = new Date(data.registrationDeadline);
      if (isNaN(regDeadline.getTime())) {
        errors.push("تاريخ انتهاء التسجيل غير صحيح");
      } else {
        validatedData.registrationDeadline = regDeadline;
      }
    }

    // Validate date logic
    if (validatedData.date && validatedData.registrationDeadline) {
      if (validatedData.registrationDeadline >= validatedData.date) {
        errors.push("تاريخ انتهاء التسجيل يجب أن يكون قبل تاريخ النشاط");
      }
    }

    // Check for validation errors
    if (errors.length > 0) {
      console.log("❌ أخطاء في التحقق من بيانات النشاط:", errors);
      return res.status(400).json({
        success: false,
        message: "بيانات النشاط غير صحيحة",
        errors: errors,
      });
    }

    // Add validated data to request
    req.validatedData = validatedData;

    console.log("✅ تم التحقق من بيانات النشاط بنجاح");
    next();
  } catch (error) {
    console.error("❌ خطأ في التحقق من بيانات النشاط:", error);
    res.status(500).json({
      success: false,
      message: "خطأ في خادم التحقق من البيانات",
      error: error.message,
    });
  }
};

module.exports = {
  validateActivityData,
  sanitizeActivityData,
  validateActivityTitle,
  validateDescription,
  validateActivityType,
  validateActivityDate,
  validateActivityTime,
  validateDuration,
  validateLocation,
  validateOrganizer,
  validateTargetGroups,
  validateMaxParticipants,
  validateRequirements,
  validateImageFile,
};
