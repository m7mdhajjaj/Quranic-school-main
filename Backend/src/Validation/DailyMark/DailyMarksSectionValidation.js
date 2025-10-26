// Validation/DailyMarksSectionValidation.js

/**
 * Daily Marks Section validation middleware
 * Validates section data for daily marks (date, reviewSection, memorizationSection)
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
 * Validate date field
 */
const validateDate = (date) => {
  if (!isRequired(date)) {
    return { isValid: false, message: "التاريخ مطلوب" };
  }

  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    return { isValid: false, message: "التاريخ غير صحيح" };
  }

  return { isValid: true, value: dateObj };
};

/**
 * Validate section name (Arabic text)
 */
const validateSectionName = (sectionName, fieldName) => {
  if (!isRequired(sectionName)) {
    return { isValid: false, message: `${fieldName} مطلوب` };
  }

  const sectionStr = sectionName.toString().trim();
  if (sectionStr.length < 2) {
    return {
      isValid: false,
      message: `${fieldName} يجب أن يكون حرفين على الأقل`,
    };
  }

  if (sectionStr.length > 200) {
    return {
      isValid: false,
      message: `${fieldName} يجب أن يكون 200 حرف أو أقل`,
    };
  }

  return { isValid: true, value: sectionStr };
};

/**
 * Validate group name (optional)
 */
const validateGroup = (group) => {
  if (!group || group.trim() === "") {
    return { isValid: true, value: null }; // Optional field
  }

  const groupStr = group.toString().trim();
  if (groupStr.length > 200) {
    return { isValid: false, message: "اسم الحلقة يجب أن يكون 200 حرف أو أقل" };
  }

  return { isValid: true, value: groupStr };
};

/**
 * Validate teacher name (optional)
 */
const validateTeacher = (teacher) => {
  if (!teacher || teacher.trim() === "") {
    return { isValid: true, value: null }; // Optional field
  }

  const teacherStr = teacher.toString().trim();
  if (teacherStr.length > 200) {
    return { isValid: false, message: "اسم المعلم يجب أن يكون 200 حرف أو أقل" };
  }

  return { isValid: true, value: teacherStr };
};

/**
 * Sanitize section data
 */
const sanitizeSectionData = (data) => {
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
 * Main validation middleware for daily marks section data
 */
const validateDailyMarksSectionData = async (req, res, next) => {
  try {
    console.log("🔍 بدء التحقق من بيانات مقطع العلامات اليومية...");
    console.log("📦 البيانات المستلمة:", req.body);

    const isUpdate = req.method === "PUT";
    const rawData = req.body;

    // Sanitize input data
    const data = sanitizeSectionData(rawData);

    const errors = [];
    const validatedData = {};

    // Validate date (required for creation)
    if (!isUpdate || data.date !== undefined) {
      const dateValidation = validateDate(data.date);
      if (!dateValidation.isValid) {
        errors.push(dateValidation.message);
      } else {
        validatedData.date = dateValidation.value;
      }
    }

    // Validate reviewSection (required)
    if (!isUpdate || data.reviewSection !== undefined) {
      const reviewValidation = validateSectionName(
        data.reviewSection,
        "مقطع المراجعة"
      );
      if (!reviewValidation.isValid) {
        errors.push(reviewValidation.message);
      } else {
        validatedData.reviewSection = reviewValidation.value;
      }
    }

    // Validate memorizationSection (required)
    if (!isUpdate || data.memorizationSection !== undefined) {
      const memorizationValidation = validateSectionName(
        data.memorizationSection,
        "مقطع الحفظ"
      );
      if (!memorizationValidation.isValid) {
        errors.push(memorizationValidation.message);
      } else {
        validatedData.memorizationSection = memorizationValidation.value;
      }
    }

    // Validate group (optional)
    if (data.group !== undefined) {
      const groupValidation = validateGroup(data.group);
      if (!groupValidation.isValid) {
        errors.push(groupValidation.message);
      } else {
        validatedData.group = groupValidation.value;
      }
    }

    // Validate teacher (optional)
    if (data.teacher !== undefined) {
      const teacherValidation = validateTeacher(data.teacher);
      if (!teacherValidation.isValid) {
        errors.push(teacherValidation.message);
      } else {
        validatedData.teacher = teacherValidation.value;
      }
    }

    // Check for validation errors
    if (errors.length > 0) {
      console.log("❌ أخطاء في التحقق من بيانات المقطع:", errors);
      return res.status(400).json({
        success: false,
        message: "بيانات المقطع غير صحيحة",
        errors: errors,
      });
    }

    // Add validated data to request
    req.validatedData = validatedData;

    console.log("✅ تم التحقق من بيانات المقطع بنجاح");
    console.log("✅ البيانات المتحقق منها:", validatedData);
    next();
  } catch (error) {
    console.error("❌ خطأ في التحقق من بيانات المقطع:", error);
    res.status(500).json({
      success: false,
      message: "خطأ في خادم التحقق من البيانات",
      error: error.message,
    });
  }
};

module.exports = {
  validateDailyMarksSectionData,
  sanitizeSectionData,
  validateDate,
  validateSectionName,
  validateGroup,
  validateTeacher,
};
