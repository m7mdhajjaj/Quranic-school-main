// Validation/DailyMarksSectionValidation.js

const { parseSegment } = require("../../utils/Quran/SegmentParser");

/**
 * Daily Marks Section validation middleware
 * Validates section data for daily marks (date, reviewSection, memorizationSection)
 * Updated to support Structured Quran Segments (Meta)
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
 * Ensures the date is not in the past (must be today or future) - only for new sections
 */
const validateDate = (date, isUpdate = false) => {
  if (!isRequired(date)) {
    return { isValid: false, message: "التاريخ مطلوب" };
  }

  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    return { isValid: false, message: "التاريخ غير صحيح" };
  }

  // Only check for past dates when creating new sections (not when updating)
  if (!isUpdate) {
    // Get today's date at midnight (00:00:00) for comparison
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Set the input date to midnight for fair comparison
    const inputDate = new Date(dateObj);
    inputDate.setHours(0, 0, 0, 0);
    
    // Check if the date is in the past
    if (inputDate < today) {
      return { 
        isValid: false, 
        message: "لا يمكن إضافة مقطع بتاريخ سابق. يجب أن يكون التاريخ من اليوم أو في المستقبل" 
      };
    }
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
     // Optional: Try to parse legacy string? 
     // For now, we mainly rely on explicit data, but we can try parsing.
     // If legacy string is simple "Al-Baqara 1-5", we parse it.
     const result = parseSegment(legacyString, type);
     if (result.isValid) {
       segments.push(result.data);
     }
     // If processing legacy string fails (e.g. "Review Part 1"), we verify it's valid text later 
     // but don't force it into the Meta array to avoid bad data.
  }

  return { segments, errors };
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
      const dateValidation = validateDate(data.date, isUpdate);
      if (!dateValidation.isValid) {
        errors.push(dateValidation.message);
      } else {
        validatedData.date = dateValidation.value;
      }
    }

    // --- Validate Legacy Fields + Structured Meta ---
    
    // 1. Memorization
    const hasMemorizationString = isRequired(data.memorizationSection);
    const memorizationMetaProcess = processSegments(data.memorizationMeta, data.memorizationSection, "memorization");
    
    if (memorizationMetaProcess.errors.length > 0) {
      errors.push(...memorizationMetaProcess.errors);
    }
    validatedData.memorizationMeta = memorizationMetaProcess.segments;

    if (hasMemorizationString) {
      const memVal = validateSectionName(data.memorizationSection, "مقطع الحفظ");
      if (!memVal.isValid) errors.push(memVal.message);
      else validatedData.memorizationSection = memVal.value;
    } else {
      // Auto-fill legacy string from Meta if string is missing?
      if (validatedData.memorizationMeta.length > 0) {
        // Generate a string like "Surah 1-5, Surah2 10-20"
        validatedData.memorizationSection = validatedData.memorizationMeta
          .map(s => `${s.surahNameCanonical} ${s.ayahStart}-${s.ayahEnd}`)
          .join("، ");
      } else {
        validatedData.memorizationSection = "";
      }
    }

    // 2. Review
    const hasReviewString = isRequired(data.reviewSection);
    const reviewMetaProcess = processSegments(data.reviewMeta, data.reviewSection, "review");

    if (reviewMetaProcess.errors.length > 0) {
      errors.push(...reviewMetaProcess.errors);
    }
    validatedData.reviewMeta = reviewMetaProcess.segments;

    if (hasReviewString) {
      const revVal = validateSectionName(data.reviewSection, "مقطع المراجعة");
      if (!revVal.isValid) errors.push(revVal.message);
      else validatedData.reviewSection = revVal.value;
    } else {
       // Auto-fill legacy string if missing
       if (validatedData.reviewMeta.length > 0) {
         validatedData.reviewSection = validatedData.reviewMeta
           .map(s => `${s.surahNameCanonical} ${s.ayahStart}-${s.ayahEnd}`)
           .join("، ");
       } else {
         validatedData.reviewSection = "";
       }
    }

    // Ensure at least one section exists
    const hasMem = (validatedData.memorizationSection || validatedData.memorizationMeta.length > 0);
    const hasRev = (validatedData.reviewSection || validatedData.reviewMeta.length > 0);

    if (!isUpdate && !hasMem && !hasRev) {
      errors.push("يجب إدخال مقطع الحفظ أو مقطع المراجعة على الأقل");
    }

    // --- Consistency Validation ---
    // Rule 1: Review blocked if Memorization starts at 1
    // Rule 2: Review End < Memorization Start (Strict Overlap)
    
    if (validatedData.memorizationMeta.length > 0 && validatedData.reviewMeta.length > 0) {
       validatedData.reviewMeta.forEach(rev => {
          const matchingMems = validatedData.memorizationMeta.filter(m => m.surahNumber === rev.surahNumber);
          matchingMems.forEach(mem => {
             // Rule 1
             if (mem.ayahStart === 1) {
                errors.push(`لا يمكن المراجعة في سورة ${rev.surahNameCanonical || ''} لأن الحفظ يبدأ من الآية 1`);
             }
             // Rule 2
             if (rev.ayahEnd >= mem.ayahStart) {
                errors.push(`المراجعة في سورة ${rev.surahNameCanonical || ''} تتداخل مع الحفظ. يجب أن تنتهي قبل الآية ${mem.ayahStart}`);
             }
          });
       });
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

    // Validate Status & Schedule info (for updates or full creates)
    if (data.timetableId) validatedData.timetableId = data.timetableId;
    if (data.scheduleStatus) validatedData.scheduleStatus = data.scheduleStatus;
    if (data.hasSchedule !== undefined) validatedData.hasSchedule = data.hasSchedule;

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
    // Only log length of meta to avoid noise
    console.log("✅ البيانات المتحقق منها (Meta info):", {
       memMetaCount: validatedData.memorizationMeta.length,
       revMetaCount: validatedData.reviewMeta.length
    });
    
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
