// Validation/DailyMarksValidation.js

/**
 * Daily Marks validation middleware
 * Validates mark data for daily marks (reviewMark and memorizationMark)
 */

/**
 * Check if a value exists and is not empty
 */
const isRequired = (value) => {
  return value !== undefined && value !== null;
};

/**
 * Validate student ID (MongoDB ObjectId)
 */
const validateStudentId = (studentId) => {
  if (!isRequired(studentId)) {
    return { isValid: false, message: "معرف الطالب مطلوب" };
  }

  const studentIdStr = studentId.toString().trim();

  // If it's an ObjectId string (24 hex characters)
  if (/^[0-9a-fA-F]{24}$/.test(studentIdStr)) {
    return { isValid: true, value: studentIdStr };
  }

  return { isValid: false, message: "معرف الطالب غير صحيح" };
};

/**
 * Validate section ID (MongoDB ObjectId)
 */
const validateSectionId = (sectionId) => {
  if (!isRequired(sectionId)) {
    return { isValid: false, message: "معرف المقطع مطلوب" };
  }

  const sectionIdStr = sectionId.toString().trim();

  // If it's an ObjectId string (24 hex characters)
  if (/^[0-9a-fA-F]{24}$/.test(sectionIdStr)) {
    return { isValid: true, value: sectionIdStr };
  }

  return { isValid: false, message: "معرف المقطع غير صحيح" };
};

/**
 * Validate mark value (0-10)
 * @param {number|string|null} mark - Mark value to validate
 * @param {string} fieldName - Field name for error message
 * @param {number} maxMark - Maximum mark value (default: 10)
 */
const validateMarkValue = (mark, fieldName, maxMark = 10) => {
  // Allow null values
  if (mark === null || mark === undefined) {
    return { isValid: true, value: null };
  }

  const markNum = parseFloat(mark);
  if (isNaN(markNum)) {
    return { isValid: false, message: `${fieldName} يجب أن تكون رقم` };
  }

  if (markNum < 0) {
    return {
      isValid: false,
      message: `${fieldName} لا يمكن أن تكون أقل من صفر`,
    };
  }

  if (markNum > maxMark) {
    return { 
      isValid: false, 
      message: `${fieldName} لا يمكن أن تزيد عن ${maxMark}` 
    };
  }

  return { isValid: true, value: markNum };
};

/**
 * Sanitize mark data
 */
const sanitizeMarkData = (data) => {
  const sanitized = {};

  // Copy allowed fields only
  const allowedFields = [
    "studentId",
    "sectionId",
    "reviewMark",
    "memorizationMark",
  ];

  allowedFields.forEach((field) => {
    if (data[field] !== undefined) {
      sanitized[field] = data[field];
    }
  });

  return sanitized;
};

/**
 * Main validation middleware for daily marks data
 */
const validateDailyMarksData = async (req, res, next) => {
  try {
    console.log("🔍 بدء التحقق من بيانات العلامة اليومية...");
    console.log("📦 البيانات المستلمة:", req.body);

    const rawData = req.body;

    // Sanitize input data
    const data = sanitizeMarkData(rawData);

    const errors = [];
    const validatedData = {};

    // Validate student ID (required)
    const studentValidation = validateStudentId(data.studentId);
    if (!studentValidation.isValid) {
      errors.push(studentValidation.message);
    } else {
      validatedData.studentId = studentValidation.value;
    }

    // Validate section ID (required)
    const sectionValidation = validateSectionId(data.sectionId);
    if (!sectionValidation.isValid) {
      errors.push(sectionValidation.message);
    } else {
      validatedData.sectionId = sectionValidation.value;
    }

    // Validate review mark (optional, 0-10)
    if (data.reviewMark !== undefined) {
      const reviewValidation = validateMarkValue(
        data.reviewMark,
        "علامة المراجعة"
      );
      if (!reviewValidation.isValid) {
        errors.push(reviewValidation.message);
      } else {
        validatedData.reviewMark = reviewValidation.value;
      }
    }

    // Validate memorization mark (optional, 0-10)
    if (data.memorizationMark !== undefined) {
      const memorizationValidation = validateMarkValue(
        data.memorizationMark,
        "علامة الحفظ"
      );
      if (!memorizationValidation.isValid) {
        errors.push(memorizationValidation.message);
      } else {
        validatedData.memorizationMark = memorizationValidation.value;
      }
    }

    // Check for validation errors
    if (errors.length > 0) {
      console.log("❌ أخطاء في التحقق من بيانات العلامة:", errors);
      return res.status(400).json({
        success: false,
        message: "بيانات العلامة غير صحيحة",
        errors: errors,
      });
    }

    // Add validated data to request
    req.validatedData = validatedData;

    console.log("✅ تم التحقق من بيانات العلامة بنجاح");
    console.log("✅ البيانات المتحقق منها:", validatedData);
    next();
  } catch (error) {
    console.error("❌ خطأ في التحقق من بيانات العلامة:", error);
    res.status(500).json({
      success: false,
      message: "خطأ في خادم التحقق من البيانات",
      error: error.message,
    });
  }
};

/**
 * Validation middleware for bulk marks
 * POST /api/daily-marks/bulk
 */
const validateBulkMarks = async (req, res, next) => {
  try {
    console.log("🔍 بدء التحقق من بيانات العلامات المتعددة...");
    console.log(`📦 عدد العلامات: ${req.body.marks?.length || 0}`);

    const rawMarks = req.body.marks;

    if (!Array.isArray(rawMarks)) {
      return res.status(400).json({
        success: false,
        message: "marks يجب أن تكون قائمة",
      });
    }

    if (rawMarks.length === 0) {
      return res.status(400).json({
        success: false,
        message: "قائمة العلامات لا يمكن أن تكون فارغة",
      });
    }

    if (rawMarks.length > 1000) {
      return res.status(400).json({
        success: false,
        message: "الحد الأقصى للعلامات المتعددة هو 1000 علامة",
      });
    }

    const validatedMarks = [];
    const errors = [];

    for (let i = 0; i < rawMarks.length; i++) {
      const data = rawMarks[i];
      const markErrors = [];

      // Validate student ID
      const studentValidation = validateStudentId(data.studentId);
      if (!studentValidation.isValid) {
        markErrors.push(`[العلامة ${i + 1}] ${studentValidation.message}`);
      }

      // Validate section ID
      const sectionValidation = validateSectionId(data.sectionId);
      if (!sectionValidation.isValid) {
        markErrors.push(`[العلامة ${i + 1}] ${sectionValidation.message}`);
      }

      // Validate review mark
      if (data.reviewMark !== undefined) {
        const reviewValidation = validateMarkValue(
          data.reviewMark,
          "علامة المراجعة"
        );
        if (!reviewValidation.isValid) {
          markErrors.push(`[العلامة ${i + 1}] ${reviewValidation.message}`);
        }
      }

      // Validate memorization mark
      if (data.memorizationMark !== undefined) {
        const memorizationValidation = validateMarkValue(
          data.memorizationMark,
          "علامة الحفظ"
        );
        if (!memorizationValidation.isValid) {
          markErrors.push(`[العلامة ${i + 1}] ${memorizationValidation.message}`);
        }
      }

      if (markErrors.length > 0) {
        errors.push(...markErrors);
      } else {
        validatedMarks.push({
          studentId: studentValidation.value,
          sectionId: sectionValidation.value,
          reviewMark: data.reviewMark !== undefined ? data.reviewMark : null,
          memorizationMark:
            data.memorizationMark !== undefined ? data.memorizationMark : null,
        });
      }
    }

    if (errors.length > 0) {
      console.log("❌ أخطاء في التحقق من العلامات المتعددة:", errors);
      return res.status(400).json({
        success: false,
        message: `أخطاء في التحقق من البيانات (${errors.length} خطأ)`,
        errors: errors,
      });
    }

    req.validatedData = validatedMarks;
    console.log(`✅ تم التحقق من ${validatedMarks.length} علامة بنجاح`);
    next();
  } catch (error) {
    console.error("❌ خطأ في التحقق من العلامات المتعددة:", error);
    res.status(500).json({
      success: false,
      message: "خطأ في خادم التحقق من البيانات",
      error: error.message,
    });
  }
};

/**
 * Validation middleware for update marks
 * PUT /api/daily-marks/:id or PUT /api/daily-marks/bulk
 */
const validateUpdateMark = async (req, res, next) => {
  try {
    console.log("🔍 بدء التحقق من بيانات التحديث...");

    const data = req.body;
    const errors = [];
    const validatedData = {};

    // Check if at least one mark field is provided
    if (
      data.reviewMark === undefined &&
      data.memorizationMark === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "يجب توفير علامة المراجعة أو علامة الحفظ على الأقل",
      });
    }

    // Validate review mark if provided
    if (data.reviewMark !== undefined) {
      const reviewValidation = validateMarkValue(
        data.reviewMark,
        "علامة المراجعة"
      );
      if (!reviewValidation.isValid) {
        errors.push(reviewValidation.message);
      } else {
        validatedData.reviewMark = reviewValidation.value;
      }
    }

    // Validate memorization mark if provided
    if (data.memorizationMark !== undefined) {
      const memorizationValidation = validateMarkValue(
        data.memorizationMark,
        "علامة الحفظ"
      );
      if (!memorizationValidation.isValid) {
        errors.push(memorizationValidation.message);
      } else {
        validatedData.memorizationMark = memorizationValidation.value;
      }
    }

    if (errors.length > 0) {
      console.log("❌ أخطاء في التحقق من بيانات التحديث:", errors);
      return res.status(400).json({
        success: false,
        message: "بيانات التحديث غير صحيحة",
        errors: errors,
      });
    }

    req.validatedData = validatedData;
    console.log("✅ تم التحقق من بيانات التحديث بنجاح");
    next();
  } catch (error) {
    console.error("❌ خطأ في التحقق من بيانات التحديث:", error);
    res.status(500).json({
      success: false,
      message: "خطأ في خادم التحقق من البيانات",
      error: error.message,
    });
  }
};

/**
 * Validation middleware for bulk update marks
 * PUT /api/daily-marks/bulk
 */
const validateBulkUpdateMarks = async (req, res, next) => {
  try {
    console.log("🔍 بدء التحقق من بيانات التحديث المتعددة...");

    const rawMarks = req.body.marks;

    if (!Array.isArray(rawMarks)) {
      return res.status(400).json({
        success: false,
        message: "marks يجب أن تكون قائمة",
      });
    }

    if (rawMarks.length === 0) {
      return res.status(400).json({
        success: false,
        message: "قائمة العلامات لا يمكن أن تكون فارغة",
      });
    }

    if (rawMarks.length > 1000) {
      return res.status(400).json({
        success: false,
        message: "الحد الأقصى للعلامات المتعددة هو 1000 علامة",
      });
    }

    const validatedMarks = [];
    const errors = [];

    for (let i = 0; i < rawMarks.length; i++) {
      const data = rawMarks[i];
      const markErrors = [];

      // Validate mark ID
      if (!data.id) {
        markErrors.push(`[العلامة ${i + 1}] معرف العلامة مطلوب`);
      }

      // Check if at least one mark field is provided
      if (
        data.reviewMark === undefined &&
        data.memorizationMark === undefined
      ) {
        markErrors.push(
          `[العلامة ${i + 1}] يجب توفير علامة المراجعة أو علامة الحفظ على الأقل`
        );
      }

      // Validate review mark if provided
      if (data.reviewMark !== undefined) {
        const reviewValidation = validateMarkValue(
          data.reviewMark,
          "علامة المراجعة"
        );
        if (!reviewValidation.isValid) {
          markErrors.push(`[العلامة ${i + 1}] ${reviewValidation.message}`);
        }
      }

      // Validate memorization mark if provided
      if (data.memorizationMark !== undefined) {
        const memorizationValidation = validateMarkValue(
          data.memorizationMark,
          "علامة الحفظ"
        );
        if (!memorizationValidation.isValid) {
          markErrors.push(
            `[العلامة ${i + 1}] ${memorizationValidation.message}`
          );
        }
      }

      if (markErrors.length > 0) {
        errors.push(...markErrors);
      } else {
        const validatedMark = { id: data.id };
        if (data.reviewMark !== undefined)
          validatedMark.reviewMark = data.reviewMark;
        if (data.memorizationMark !== undefined)
          validatedMark.memorizationMark = data.memorizationMark;
        validatedMarks.push(validatedMark);
      }
    }

    if (errors.length > 0) {
      console.log("❌ أخطاء في التحقق من العلامات المتعددة:", errors);
      return res.status(400).json({
        success: false,
        message: `أخطاء في التحقق من البيانات (${errors.length} خطأ)`,
        errors: errors,
      });
    }

    req.validatedData = validatedMarks;
    console.log(`✅ تم التحقق من ${validatedMarks.length} علامة بنجاح`);
    next();
  } catch (error) {
    console.error("❌ خطأ في التحقق من العلامات المتعددة:", error);
    res.status(500).json({
      success: false,
      message: "خطأ في خادم التحقق من البيانات",
      error: error.message,
    });
  }
};

/**
 * Validation middleware for delete operations
 * DELETE /api/daily-marks/:id
 */
const validateDeleteMark = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "معرف العلامة مطلوب",
      });
    }

    // Validate it's a valid MongoDB ObjectId
    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      return res.status(400).json({
        success: false,
        message: "معرف العلامة غير صحيح",
      });
    }

    next();
  } catch (error) {
    console.error("❌ خطأ في التحقق من معرف العلامة:", error);
    res.status(500).json({
      success: false,
      message: "خطأ في خادم التحقق من البيانات",
      error: error.message,
    });
  }
};

/**
 * Validation middleware for delete student marks
 * DELETE /api/daily-marks/student/:studentId
 */
const validateDeleteStudentMarks = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const validation = validateStudentId(studentId);

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: validation.message,
      });
    }

    next();
  } catch (error) {
    console.error("❌ خطأ في التحقق من معرف الطالب:", error);
    res.status(500).json({
      success: false,
      message: "خطأ في خادم التحقق من البيانات",
      error: error.message,
    });
  }
};

/**
 * Validation middleware for delete section marks
 * DELETE /api/daily-marks/section/:sectionId
 */
const validateDeleteSectionMarks = async (req, res, next) => {
  try {
    const { sectionId } = req.params;
    const validation = validateSectionId(sectionId);

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: validation.message,
      });
    }

    next();
  } catch (error) {
    console.error("❌ خطأ في التحقق من معرف القسم:", error);
    res.status(500).json({
      success: false,
      message: "خطأ في خادم التحقق من البيانات",
      error: error.message,
    });
  }
};

module.exports = {
  validateDailyMarksData,
  validateBulkMarks,
  validateUpdateMark,
  validateBulkUpdateMarks,
  validateDeleteMark,
  validateDeleteStudentMarks,
  validateDeleteSectionMarks,
  sanitizeMarkData,
  validateStudentId,
  validateSectionId,
  validateMarkValue,
};
