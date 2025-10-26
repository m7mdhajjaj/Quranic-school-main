// Validation/SectionValidation.js

/**
 * Section data validation middleware with comprehensive rules
 * Validates and sanitizes section/chapter data to ensure data integrity
 */

/**
 * Check if a value exists and is not empty
 */
const isRequired = (value) => {
  return value !== undefined && value !== null && value.toString().trim() !== '';
};

/**
 * Validate section title (Arabic text)
 */
const validateSectionTitle = (title) => {
  if (!isRequired(title)) {
    return { isValid: false, message: 'عنوان القسم مطلوب' };
  }
  
  const titleStr = title.toString().trim();
  if (titleStr.length < 2) {
    return { isValid: false, message: 'عنوان القسم يجب أن يكون حرفين على الأقل' };
  }
  
  if (titleStr.length > 200) {
    return { isValid: false, message: 'عنوان القسم يجب أن يكون 200 حرف أو أقل' };
  }
  
  return { isValid: true, value: titleStr };
};

/**
 * Validate section description
 */
const validateDescription = (description) => {
  if (!description || description.trim() === '') {
    return { isValid: true, value: '' }; // Optional field
  }
  
  const descStr = description.toString().trim();
  if (descStr.length > 1000) {
    return { isValid: false, message: 'وصف القسم يجب أن يكون 1000 حرف أو أقل' };
  }
  
  return { isValid: true, value: descStr };
};

/**
 * Validate section type
 */
const validateSectionType = (type) => {
  if (!isRequired(type)) {
    return { isValid: false, message: 'نوع القسم مطلوب' };
  }
  
  const typeStr = type.toString().trim();
  const validTypes = [
    'سورة', 'جزء', 'حزب', 'ربع', 'صفحة', 'آيات',
    'درس', 'وحدة', 'فصل', 'باب', 'موضوع', 'مقطع'
  ];
  
  if (!validTypes.includes(typeStr)) {
    return { isValid: true, value: typeStr }; // Allow custom types
  }
  
  return { isValid: true, value: typeStr };
};

/**
 * Validate book/source reference
 */
const validateBookReference = (book) => {
  if (!book || book.trim() === '') {
    return { isValid: true, value: 'القرآن الكريم' }; // Default book
  }
  
  const bookStr = book.toString().trim();
  const validBooks = [
    'القرآن الكريم', 'صحيح البخاري', 'صحيح مسلم', 
    'سنن أبي داود', 'سنن الترمذي', 'سنن النسائي', 
    'سنن ابن ماجه', 'موطأ مالك', 'مسند أحمد',
    'رياض الصالحين', 'الأربعون النووية', 'تفسير ابن كثير',
    'تفسير الطبري', 'تفسير القرطبي', 'فقه السنة',
    'زاد المعاد', 'السيرة النبوية', 'الشمائل المحمدية'
  ];
  
  if (!validBooks.includes(bookStr)) {
    return { isValid: true, value: bookStr }; // Allow custom books
  }
  
  return { isValid: true, value: bookStr };
};

/**
 * Validate chapter/surah number
 */
const validateChapterNumber = (chapterNumber) => {
  if (!chapterNumber) {
    return { isValid: true, value: null }; // Optional field
  }
  
  const chapterNum = parseInt(chapterNumber);
  if (isNaN(chapterNum) || chapterNum < 1) {
    return { isValid: false, message: 'رقم الفصل/السورة يجب أن يكون رقم أكبر من صفر' };
  }
  
  if (chapterNum > 114) { // Max Quran chapters
    return { isValid: true, value: chapterNum }; // Allow for non-Quran books
  }
  
  return { isValid: true, value: chapterNum };
};

/**
 * Validate verse range (for Quran sections)
 */
const validateVerseRange = (startVerse, endVerse) => {
  const errors = [];
  let validatedRange = {};
  
  if (startVerse !== undefined && startVerse !== null) {
    const startNum = parseInt(startVerse);
    if (isNaN(startNum) || startNum < 1) {
      errors.push('رقم الآية الأولى يجب أن يكون رقم أكبر من صفر');
    } else {
      validatedRange.startVerse = startNum;
    }
  }
  
  if (endVerse !== undefined && endVerse !== null) {
    const endNum = parseInt(endVerse);
    if (isNaN(endNum) || endNum < 1) {
      errors.push('رقم الآية الأخيرة يجب أن يكون رقم أكبر من صفر');
    } else {
      validatedRange.endVerse = endNum;
    }
  }
  
  // Validate range logic
  if (validatedRange.startVerse && validatedRange.endVerse) {
    if (validatedRange.startVerse > validatedRange.endVerse) {
      errors.push('رقم الآية الأولى يجب أن يكون أقل من أو يساوي رقم الآية الأخيرة');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors,
    value: validatedRange
  };
};

/**
 * Validate page range
 */
const validatePageRange = (startPage, endPage) => {
  const errors = [];
  let validatedRange = {};
  
  if (startPage !== undefined && startPage !== null) {
    const startNum = parseInt(startPage);
    if (isNaN(startNum) || startNum < 1) {
      errors.push('رقم الصفحة الأولى يجب أن يكون رقم أكبر من صفر');
    } else {
      validatedRange.startPage = startNum;
    }
  }
  
  if (endPage !== undefined && endPage !== null) {
    const endNum = parseInt(endPage);
    if (isNaN(endNum) || endNum < 1) {
      errors.push('رقم الصفحة الأخيرة يجب أن يكون رقم أكبر من صفر');
    } else {
      validatedRange.endPage = endNum;
    }
  }
  
  // Validate range logic
  if (validatedRange.startPage && validatedRange.endPage) {
    if (validatedRange.startPage > validatedRange.endPage) {
      errors.push('رقم الصفحة الأولى يجب أن يكون أقل من أو يساوي رقم الصفحة الأخيرة');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors,
    value: validatedRange
  };
};

/**
 * Validate difficulty level
 */
const validateDifficultyLevel = (level) => {
  if (!level || level.toString().trim() === '') {
    return { isValid: true, value: 'متوسط' }; // Default level
  }
  
  const levelStr = level.toString().trim();
  const validLevels = ['مبتدئ', 'متوسط', 'متقدم', 'خبير'];
  
  if (!validLevels.includes(levelStr)) {
    return { isValid: false, message: 'مستوى الصعوبة غير صحيح' };
  }
  
  return { isValid: true, value: levelStr };
};

/**
 * Validate estimated duration in minutes
 */
const validateEstimatedDuration = (duration) => {
  if (!duration) {
    return { isValid: true, value: 30 }; // Default 30 minutes
  }
  
  const durationNum = parseInt(duration);
  if (isNaN(durationNum) || durationNum < 5) {
    return { isValid: false, message: 'المدة المقدرة يجب أن تكون 5 دقائق على الأقل' };
  }
  
  if (durationNum > 480) { // 8 hours max
    return { isValid: false, message: 'المدة المقدرة لا يمكن أن تزيد عن 8 ساعات' };
  }
  
  return { isValid: true, value: durationNum };
};

/**
 * Validate learning objectives array
 */
const validateObjectives = (objectives) => {
  if (!objectives || !Array.isArray(objectives)) {
    return { isValid: true, value: [] }; // Optional field
  }
  
  if (objectives.length > 10) {
    return { isValid: false, message: 'عدد الأهداف التعليمية كبير جداً (الحد الأقصى 10)' };
  }
  
  const validatedObjectives = [];
  for (const objective of objectives) {
    if (typeof objective === 'string' && objective.trim().length > 0) {
      const objStr = objective.trim();
      if (objStr.length <= 200) {
        validatedObjectives.push(objStr);
      }
    }
  }
  
  return { isValid: true, value: validatedObjectives };
};

/**
 * Validate key concepts/vocabulary array
 */
const validateKeyConcepts = (concepts) => {
  if (!concepts || !Array.isArray(concepts)) {
    return { isValid: true, value: [] }; // Optional field
  }
  
  if (concepts.length > 20) {
    return { isValid: false, message: 'عدد المفاهيم الأساسية كبير جداً (الحد الأقصى 20)' };
  }
  
  const validatedConcepts = [];
  for (const concept of concepts) {
    if (typeof concept === 'string' && concept.trim().length > 0) {
      const conceptStr = concept.trim();
      if (conceptStr.length <= 100) {
        validatedConcepts.push(conceptStr);
      }
    }
  }
  
  return { isValid: true, value: validatedConcepts };
};

/**
 * Validate prerequisites array
 */
const validatePrerequisites = (prerequisites) => {
  if (!prerequisites || !Array.isArray(prerequisites)) {
    return { isValid: true, value: [] }; // Optional field
  }
  
  if (prerequisites.length > 10) {
    return { isValid: false, message: 'عدد المتطلبات السابقة كبير جداً (الحد الأقصى 10)' };
  }
  
  const validatedPrerequisites = [];
  for (const prereq of prerequisites) {
    if (typeof prereq === 'string' && prereq.trim().length > 0) {
      const prereqStr = prereq.trim();
      if (prereqStr.length <= 100) {
        validatedPrerequisites.push(prereqStr);
      }
    }
  }
  
  return { isValid: true, value: validatedPrerequisites };
};

/**
 * Validate notes
 */
const validateNotes = (notes) => {
  if (!notes || notes.trim() === '') {
    return { isValid: true, value: '' }; // Optional field
  }
  
  const notesStr = notes.toString().trim();
  if (notesStr.length > 1000) {
    return { isValid: false, message: 'الملاحظات يجب أن تكون 1000 حرف أو أقل' };
  }
  
  return { isValid: true, value: notesStr };
};

/**
 * Sanitize section data
 */
const sanitizeSectionData = (data) => {
  const sanitized = {};
  
  // Remove potential XSS and clean up data
  Object.keys(data).forEach(key => {
    if (typeof data[key] === 'string') {
      sanitized[key] = data[key].trim()
        .replace(/[<>]/g, '') // Remove potential HTML tags
        .replace(/javascript:/gi, '') // Remove javascript: protocols
        .replace(/on\w+=/gi, ''); // Remove event handlers
    } else {
      sanitized[key] = data[key];
    }
  });
  
  return sanitized;
};

/**
 * Main validation middleware for section data
 */
const validateSectionData = async (req, res, next) => {
  try {
    console.log('🔍 بدء التحقق من بيانات القسم...');
    
    const isUpdate = req.method === 'PUT';
    const rawData = req.body;
    
    // Sanitize input data
    const data = sanitizeSectionData(rawData);
    
    const errors = [];
    const validatedData = {};
    
    // Validate required fields for creation, optional for updates
    if (!isUpdate || data.title !== undefined) {
      const titleValidation = validateSectionTitle(data.title);
      if (!titleValidation.isValid) {
        errors.push(titleValidation.message);
      } else {
        validatedData.title = titleValidation.value;
      }
    }
    
    if (!isUpdate || data.type !== undefined) {
      const typeValidation = validateSectionType(data.type);
      if (!typeValidation.isValid) {
        errors.push(typeValidation.message);
      } else {
        validatedData.type = typeValidation.value;
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
    
    if (data.book !== undefined) {
      const bookValidation = validateBookReference(data.book);
      if (!bookValidation.isValid) {
        errors.push(bookValidation.message);
      } else {
        validatedData.book = bookValidation.value;
      }
    }
    
    if (data.chapterNumber !== undefined) {
      const chapterValidation = validateChapterNumber(data.chapterNumber);
      if (!chapterValidation.isValid) {
        errors.push(chapterValidation.message);
      } else {
        validatedData.chapterNumber = chapterValidation.value;
      }
    }
    
    // Validate verse range
    if (data.startVerse !== undefined || data.endVerse !== undefined) {
      const verseRangeValidation = validateVerseRange(data.startVerse, data.endVerse);
      if (!verseRangeValidation.isValid) {
        errors.push(...verseRangeValidation.errors);
      } else {
        Object.assign(validatedData, verseRangeValidation.value);
      }
    }
    
    // Validate page range
    if (data.startPage !== undefined || data.endPage !== undefined) {
      const pageRangeValidation = validatePageRange(data.startPage, data.endPage);
      if (!pageRangeValidation.isValid) {
        errors.push(...pageRangeValidation.errors);
      } else {
        Object.assign(validatedData, pageRangeValidation.value);
      }
    }
    
    if (data.difficultyLevel !== undefined) {
      const difficultyValidation = validateDifficultyLevel(data.difficultyLevel);
      if (!difficultyValidation.isValid) {
        errors.push(difficultyValidation.message);
      } else {
        validatedData.difficultyLevel = difficultyValidation.value;
      }
    }
    
    if (data.estimatedDuration !== undefined) {
      const durationValidation = validateEstimatedDuration(data.estimatedDuration);
      if (!durationValidation.isValid) {
        errors.push(durationValidation.message);
      } else {
        validatedData.estimatedDuration = durationValidation.value;
      }
    }
    
    if (data.objectives !== undefined) {
      const objectivesValidation = validateObjectives(data.objectives);
      if (!objectivesValidation.isValid) {
        errors.push(objectivesValidation.message);
      } else {
        validatedData.objectives = objectivesValidation.value;
      }
    }
    
    if (data.keyConcepts !== undefined) {
      const conceptsValidation = validateKeyConcepts(data.keyConcepts);
      if (!conceptsValidation.isValid) {
        errors.push(conceptsValidation.message);
      } else {
        validatedData.keyConcepts = conceptsValidation.value;
      }
    }
    
    if (data.prerequisites !== undefined) {
      const prerequisitesValidation = validatePrerequisites(data.prerequisites);
      if (!prerequisitesValidation.isValid) {
        errors.push(prerequisitesValidation.message);
      } else {
        validatedData.prerequisites = prerequisitesValidation.value;
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
    
    // Boolean fields
    if (data.isActive !== undefined) {
      validatedData.isActive = Boolean(data.isActive);
    }
    
    if (data.isRequired !== undefined) {
      validatedData.isRequired = Boolean(data.isRequired);
    }
    
    // Numeric fields
    if (data.order !== undefined) {
      const orderNum = parseInt(data.order);
      if (!isNaN(orderNum) && orderNum >= 0) {
        validatedData.order = orderNum;
      }
    }
    
    // Check for validation errors
    if (errors.length > 0) {
      console.log('❌ أخطاء في التحقق من بيانات القسم:', errors);
      return res.status(400).json({
        success: false,
        message: 'بيانات القسم غير صحيحة',
        errors: errors
      });
    }
    
    // Add validated data to request
    req.validatedData = validatedData;
    
    console.log('✅ تم التحقق من بيانات القسم بنجاح');
    next();
    
  } catch (error) {
    console.error('❌ خطأ في التحقق من بيانات القسم:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في خادم التحقق من البيانات',
      error: error.message
    });
  }
};

module.exports = {
  validateSectionData,
  sanitizeSectionData,
  validateSectionTitle,
  validateDescription,
  validateSectionType,
  validateBookReference,
  validateChapterNumber,
  validateVerseRange,
  validatePageRange,
  validateDifficultyLevel,
  validateEstimatedDuration,
  validateObjectives,
  validateKeyConcepts,
  validatePrerequisites,
  validateNotes
};