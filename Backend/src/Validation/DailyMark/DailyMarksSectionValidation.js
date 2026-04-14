// Validation/DailyMarksSectionValidation.js

const mongoose = require("mongoose");
const { parseSegment } = require("../../utils/Quran/dailyMarkSegmentParser");
const { createLogger } = require("../../utils/logger");
const logger = createLogger("SectionValidation");

/**
 * ============================================================================
 * Daily Marks Section Validation Middleware (V7)
 * ============================================================================
 *
 * Validates section data for daily marks (date, reviewSection, memorizationSection)
 * Updated to support Structured Quran Segments (Meta)
 *
 * V7 Edition - Validation Rules:
 * ─────────────────────────────────────────────────────────────────────────────
 * ✅ Data format/structure validation only (this file)
 * ✅ Deep sequence validation delegated to SectionSequenceService
 *
 * V7 Rules (enforced in SectionSequenceService):
 * - Current week only (Sat-Fri) - no future/past weeks
 * - Flexible review ranges (1-50 ayahs at once)
 * - Review cannot exceed last memorized ayah
 * - Daily quota: 1 per day per type
 * - Weekly quota: 3 per week per type
 * ─────────────────────────────────────────────────────────────────────────────
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
 * ✅ V7: Basic format validation only
 * Current week restriction enforced in SectionSequenceService.checkCurrentWeekOnly()
 */
const validateDate = (date, isUpdate = false) => {
  if (!isRequired(date)) {
    return { isValid: false, message: "التاريخ مطلوب" };
  }

  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    return { isValid: false, message: "التاريخ غير صحيح" };
  }

  // ✅ V7: Date format validation only
  // Current week restriction happens in Service layer (checkCurrentWeekOnly)

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
 * Process a list of segments (or single legacy string)
 * and return validated Meta array.
 */
const processSegments = (metaInput, legacyString, type = "segment") => {
  const segments = [];
  const errors = [];

  // 1. Prefer Explicit Meta Input (Array)
  if (Array.isArray(metaInput) && metaInput.length > 0) {
    metaInput.forEach((item, index) => {
      const result = parseSegment(item, type);
      if (result.isValid) {
        segments.push(result.data);
      } else {
        errors.push(`خطأ في المقطع ${index + 1}: ${result.error}`);
      }
    });
  }
  // 2. Fallback: Parse Legacy String if Meta is empty
  else if (isRequired(legacyString)) {
    // Try to parse legacy string(s). Support multiple segments separated by common delimiters.
    // Example: "البقرة 1-5 | آل عمران 1-10" or multi-line inputs.
    const raw = legacyString.toString().trim();

    const parts = raw
      .split(/\s*(?:\||\n|،|,)\s*/)
      .map((p) => p.trim())
      .filter(Boolean);

    // If splitting yields nothing, fall back to single parse.
    const effectiveParts = parts.length > 0 ? parts : [raw];

    effectiveParts.forEach((part, index) => {
      const result = parseSegment(part, type);
      if (result.isValid) {
        segments.push(result.data);
      } else {
        // Free-text mode: don't block, but keep errors for debugging
        errors.push(`تعذر تحليل ${type} (${index + 1}): ${result.error}`);
      }
    });
  }

  return { segments, errors };
};

/**
 * Sanitize section data
 */
const sanitizeSectionData = (data) => {
  const sanitized = {};
  const safeData = data && typeof data === "object" ? data : {};

  Object.keys(safeData).forEach((key) => {
    const value = safeData[key];

    if (typeof value === "string") {
      sanitized[key] = value
        .trim()
        .replace(/[<>]/g, "") // Remove potential HTML tags
        .replace(/javascript:/gi, "") // Remove javascript: protocols
        .replace(/on\w+=/gi, ""); // Remove event handlers
      return;
    }

    sanitized[key] = value;
  });

  return sanitized;
};

/**
 * Main validation middleware for daily marks section data
 */
const validateDailyMarksSectionData = async (req, res, next) => {
  try {
    const isUpdate = req.method === "PUT";
    const rawData = req.body;

    // Sanitize input data
    const data = sanitizeSectionData(rawData);

    const errors = [];
    const validatedData = {};

    // Validate date (required for creation)
    if (!isUpdate || data.date !== undefined) {
      const dateValidation = validateDate(data.date, isUpdate);
      if (!dateValidation.isValid) {
        errors.push(dateValidation.message);
      } else {
        validatedData.date = dateValidation.value;
      }
    }

    // --- Validate Legacy Fields + Structured Meta (Lenient) ---

    // 1. Memorization - Try to parse meta, but don't block on errors
    const hasMemorizationString = isRequired(data.memorizationSection);
    const memorizationMetaProcess = processSegments(
      data.memorizationMeta,
      data.memorizationSection,
      "memorization",
    );

    // Don't push meta parsing errors - accept free text
    validatedData.memorizationMeta = memorizationMetaProcess.segments;

    if (hasMemorizationString) {
      validatedData.memorizationSection = data.memorizationSection
        .toString()
        .trim()
        .slice(0, 200);
    } else {
      // Auto-fill legacy string from Meta if string is missing
      if (validatedData.memorizationMeta.length > 0) {
        validatedData.memorizationSection = validatedData.memorizationMeta
          .map((s) => `${s.surahNameCanonical} ${s.ayahStart}-${s.ayahEnd}`)
          .join("، ");
      } else {
        validatedData.memorizationSection = "";
      }
    }

    // 2. Review - Try to parse meta, but don't block on errors
    const hasReviewString = isRequired(data.reviewSection);
    const reviewMetaProcess = processSegments(
      data.reviewMeta,
      data.reviewSection,
      "review",
    );

    // Don't push review parsing errors - accept free text
    validatedData.reviewMeta = reviewMetaProcess.segments;

    if (hasReviewString) {
      validatedData.reviewSection = data.reviewSection
        .toString()
        .trim()
        .slice(0, 200);
    } else {
      // Auto-fill legacy string if missing
      if (validatedData.reviewMeta.length > 0) {
        validatedData.reviewSection = validatedData.reviewMeta
          .map((s) => `${s.surahNameCanonical} ${s.ayahStart}-${s.ayahEnd}`)
          .join("، ");
      } else {
        validatedData.reviewSection = "";
      }
    }

    // At least one section should exist (non-blocking for updates)
    const hasMem =
      validatedData.memorizationSection ||
      validatedData.memorizationMeta.length > 0;
    const hasRev =
      validatedData.reviewSection || validatedData.reviewMeta.length > 0;

    if (!isUpdate && !hasMem && !hasRev) {
      errors.push("يجب إدخال مقطع الحفظ أو مقطع المراجعة على الأقل");
    }

    // ✅ V7: Consistency validation moved to Service layer
    // Basic validation only - deep sequence checks happen in SectionSequenceService
    // V7 Rules enforced in SectionSequenceService:
    //   - Current week only (checkCurrentWeekOnly)
    //   - Flexible review ranges (1-50 ayahs at once)
    //   - Review cannot exceed last memorized ayah
    // This keeps validation simple and focused on data format/structure

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

    // Validate Status & Schedule info (for updates or full creates)
    if (data.timetableId) validatedData.timetableId = data.timetableId;
    if (data.scheduleStatus) validatedData.scheduleStatus = data.scheduleStatus;
    if (data.hasSchedule !== undefined)
      validatedData.hasSchedule = data.hasSchedule;

    // Check for validation errors
    if (errors.length > 0) {
      logger.debug("أخطاء في التحقق من بيانات المقطع:", errors);
      return res.status(400).json({
        success: false,
        message: "بيانات المقطع غير صحيحة",
        errors: errors,
      });
    }

    // Add validated data to request
    req.validatedData = validatedData;

    next();
  } catch (error) {
    logger.error("خطأ في التحقق من بيانات المقطع:", error);
    res.status(500).json({
      success: false,
      message: "خطأ في خادم التحقق من البيانات",
      error: error.message,
    });
  }
};

/**
 * Validate Section ID (for params)
 */
const validateSectionId = (req, res, next) => {
  const { id } = req.params;

  if (!isRequired(id)) {
    return res.status(400).json({
      success: false,
      message: "معرّف المقطع مطلوب",
    });
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "معرّف المقطع غير صالح",
    });
  }

  next();
};

/**
 * Validate Active Surah Request Data
 * For reset-active-surah and complete-surah endpoints
 */
const validateActiveSurahData = (req, res, next) => {
  try {
    const { groupId, type } = req.body;
    const errors = [];

    if (!isRequired(groupId)) {
      errors.push("معرّف الحلقة (groupId) مطلوب");
    } else if (!mongoose.Types.ObjectId.isValid(groupId)) {
      errors.push("معرّف الحلقة غير صالح");
    }

    if (!isRequired(type)) {
      errors.push("نوع السورة (type) مطلوب");
    } else if (!["memorization", "review"].includes(type)) {
      errors.push("نوع السورة يجب أن يكون 'memorization' أو 'review'");
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "بيانات غير صحيحة",
        errors: errors,
      });
    }

    next();
  } catch (error) {
    console.error("❌ Validating Active Surah Data Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server Validation Error" });
  }
};

/**
 * Validate Group ID (for params)
 */
const validateGroupIdParam = (req, res, next) => {
  const { groupId } = req.params;

  if (!isRequired(groupId)) {
    return res.status(400).json({
      success: false,
      message: "معرّف الحلقة مطلوب",
    });
  }

  // Allow both ObjectId and group name
  // The controller will handle the lookup

  next();
};

module.exports = {
  validateDailyMarksSectionData,
  validateSectionId,
  validateActiveSurahData,
  validateGroupIdParam,
  sanitizeSectionData,
  validateDate,
  validateSectionName,
  validateGroup,
  validateTeacher,
};
