// Validation/NewsValidation.js

/**
 * News data validation middleware with comprehensive rules
 * Validates and sanitizes news data to ensure data integrity
 */

/**
 * Check if a value exists and is not empty
 */
const isRequired = (value) => {
  return value !== undefined && value !== null && value.toString().trim() !== '';
};

/**
 * Validate news title (Arabic text)
 */
const validateNewsTitle = (title) => {
  if (!isRequired(title)) {
    return { isValid: false, message: 'عنوان الخبر مطلوب' };
  }
  
  const titleStr = title.toString().trim();
  if (titleStr.length < 5) {
    return { isValid: false, message: 'عنوان الخبر يجب أن يكون 5 أحرف على الأقل' };
  }
  
  if (titleStr.length > 200) {
    return { isValid: false, message: 'عنوان الخبر يجب أن يكون 200 حرف أو أقل' };
  }
  
  return { isValid: true, value: titleStr };
};

/**
 * Validate news content
 */
const validateContent = (content) => {
  if (!isRequired(content)) {
    return { isValid: false, message: 'محتوى الخبر مطلوب' };
  }
  
  const contentStr = content.toString().trim();
  if (contentStr.length < 10) {
    return { isValid: false, message: 'محتوى الخبر يجب أن يكون 10 أحرف على الأقل' };
  }
  
  if (contentStr.length > 5000) {
    return { isValid: false, message: 'محتوى الخبر يجب أن يكون 5000 حرف أو أقل' };
  }
  
  return { isValid: true, value: contentStr };
};

/**
 * Validate news summary/excerpt
 */
const validateSummary = (summary) => {
  if (!summary || summary.trim() === '') {
    return { isValid: true, value: '' }; // Optional field
  }
  
  const summaryStr = summary.toString().trim();
  if (summaryStr.length > 500) {
    return { isValid: false, message: 'ملخص الخبر يجب أن يكون 500 حرف أو أقل' };
  }
  
  return { isValid: true, value: summaryStr };
};

/**
 * Validate news category
 */
const validateCategory = (category) => {
  if (!category || category.trim() === '') {
    return { isValid: true, value: 'عام' }; // Default category
  }
  
  const categoryStr = category.toString().trim();
  const validCategories = [
    'عام', 'أخبار المدرسة', 'أنشطة', 'امتحانات', 'إعلانات',
    'فعاليات', 'إنجازات', 'تكريم', 'زيارات', 'مسابقات'
  ];
  
  if (!validCategories.includes(categoryStr)) {
    return { isValid: true, value: categoryStr }; // Allow custom categories
  }
  
  return { isValid: true, value: categoryStr };
};

/**
 * Validate priority level
 */
const validatePriority = (priority) => {
  if (!priority) {
    return { isValid: true, value: 'متوسط' }; // Default priority
  }
  
  const validPriorities = ['منخفض', 'متوسط', 'مرتفع', 'عاجل'];
  const priorityStr = priority.toString().trim();
  
  if (!validPriorities.includes(priorityStr)) {
    return { isValid: false, message: 'مستوى الأولوية غير صحيح' };
  }
  
  return { isValid: true, value: priorityStr };
};

/**
 * Validate author information
 */
const validateAuthor = (author) => {
  if (!isRequired(author)) {
    return { isValid: false, message: 'كاتب الخبر مطلوب' };
  }
  
  const authorStr = author.toString().trim();
  
  // If it's an ObjectId string
  if (/^[0-9a-fA-F]{24}$/.test(authorStr)) {
    return { isValid: true, value: authorStr };
  }
  
  // If it's a name
  if (authorStr.length >= 2 && authorStr.length <= 100) {
    return { isValid: true, value: authorStr };
  }
  
  return { isValid: false, message: 'معرف الكاتب غير صحيح' };
};

/**
 * Validate publication date
 */
const validatePublishDate = (publishDate) => {
  if (!publishDate) {
    return { isValid: true, value: new Date() }; // Default to now
  }
  
  const pubDate = new Date(publishDate);
  if (isNaN(pubDate.getTime())) {
    return { isValid: false, message: 'تاريخ النشر غير صحيح' };
  }
  
  // Don't allow dates too far in the future (more than 1 year)
  const oneYearFromNow = new Date();
  oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
  
  if (pubDate > oneYearFromNow) {
    return { isValid: false, message: 'تاريخ النشر لا يمكن أن يكون أكثر من سنة في المستقبل' };
  }
  
  return { isValid: true, value: pubDate };
};

/**
 * Validate tags array
 */
const validateTags = (tags) => {
  if (!tags || !Array.isArray(tags)) {
    return { isValid: true, value: [] }; // Optional field
  }
  
  if (tags.length > 10) {
    return { isValid: false, message: 'لا يمكن أن يكون هناك أكثر من 10 وسوم' };
  }
  
  const validatedTags = [];
  for (const tag of tags) {
    if (typeof tag === 'string' && tag.trim().length > 0) {
      const tagStr = tag.trim();
      if (tagStr.length <= 50) {
        validatedTags.push(tagStr);
      }
    }
  }
  
  return { isValid: true, value: [...new Set(validatedTags)] }; // Remove duplicates
};

/**
 * Validate image file information
 */
const validateImageFile = (file) => {
  if (!file) {
    return { isValid: true, value: null }; // Optional field
  }
  
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.mimetype)) {
    return { isValid: false, message: 'نوع الصورة غير مدعوم (يُسمح بـ JPEG, PNG, WebP فقط)' };
  }
  
  // Check file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return { isValid: false, message: 'حجم الصورة كبير جداً (الحد الأقصى 5 ميجابايت)' };
  }
  
  return { isValid: true, value: file };
};

/**
 * Sanitize news data
 */
const sanitizeNewsData = (data) => {
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
 * Main validation middleware for news data
 */
const validateNewsData = async (req, res, next) => {
  try {
    console.log('🔍 بدء التحقق من بيانات الخبر...');
    
    const isUpdate = req.method === 'PUT';
    const rawData = req.body;
    
    // Sanitize input data
    const data = sanitizeNewsData(rawData);
    
    const errors = [];
    const validatedData = {};
    
    // Validate required fields for creation, optional for updates
    if (!isUpdate || data.title !== undefined) {
      const titleValidation = validateNewsTitle(data.title);
      if (!titleValidation.isValid) {
        errors.push(titleValidation.message);
      } else {
        validatedData.title = titleValidation.value;
      }
    }
    
    if (!isUpdate || data.content !== undefined) {
      const contentValidation = validateContent(data.content);
      if (!contentValidation.isValid) {
        errors.push(contentValidation.message);
      } else {
        validatedData.content = contentValidation.value;
      }
    }
    
    if (!isUpdate || data.author !== undefined) {
      const authorValidation = validateAuthor(data.author);
      if (!authorValidation.isValid) {
        errors.push(authorValidation.message);
      } else {
        validatedData.author = authorValidation.value;
      }
    }
    
    // Validate optional fields
    if (data.summary !== undefined) {
      const summaryValidation = validateSummary(data.summary);
      if (!summaryValidation.isValid) {
        errors.push(summaryValidation.message);
      } else {
        validatedData.summary = summaryValidation.value;
      }
    }
    
    if (data.category !== undefined) {
      const categoryValidation = validateCategory(data.category);
      if (!categoryValidation.isValid) {
        errors.push(categoryValidation.message);
      } else {
        validatedData.category = categoryValidation.value;
      }
    }
    
    if (data.priority !== undefined) {
      const priorityValidation = validatePriority(data.priority);
      if (!priorityValidation.isValid) {
        errors.push(priorityValidation.message);
      } else {
        validatedData.priority = priorityValidation.value;
      }
    }
    
    if (data.publishDate !== undefined) {
      const publishDateValidation = validatePublishDate(data.publishDate);
      if (!publishDateValidation.isValid) {
        errors.push(publishDateValidation.message);
      } else {
        validatedData.publishDate = publishDateValidation.value;
      }
    }
    
    if (data.tags !== undefined) {
      const tagsValidation = validateTags(data.tags);
      if (!tagsValidation.isValid) {
        errors.push(tagsValidation.message);
      } else {
        validatedData.tags = tagsValidation.value;
      }
    }
    
    // Validate uploaded image file if present
    if (req.file) {
      const imageValidation = validateImageFile(req.file);
      if (!imageValidation.isValid) {
        errors.push(imageValidation.message);
      }
    }
    
    // Boolean fields
    if (data.isPublished !== undefined) {
      validatedData.isPublished = Boolean(data.isPublished);
    }
    
    if (data.isFeatured !== undefined) {
      validatedData.isFeatured = Boolean(data.isFeatured);
    }
    
    if (data.allowComments !== undefined) {
      validatedData.allowComments = Boolean(data.allowComments);
    }
    
    // Check for validation errors
    if (errors.length > 0) {
      console.log('❌ أخطاء في التحقق من بيانات الخبر:', errors);
      return res.status(400).json({
        success: false,
        message: 'بيانات الخبر غير صحيحة',
        errors: errors
      });
    }
    
    // Add validated data to request
    req.validatedData = validatedData;
    
    console.log('✅ تم التحقق من بيانات الخبر بنجاح');
    next();
    
  } catch (error) {
    console.error('❌ خطأ في التحقق من بيانات الخبر:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في خادم التحقق من البيانات',
      error: error.message
    });
  }
};

module.exports = {
  validateNewsData,
  sanitizeNewsData,
  validateNewsTitle,
  validateContent,
  validateSummary,
  validateCategory,
  validatePriority,
  validateAuthor,
  validatePublishDate,
  validateTags,
  validateImageFile
};