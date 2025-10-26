// Validation/NotificationValidation.js

/**
 * Notification data validation middleware with comprehensive rules
 * Validates and sanitizes notification data to ensure data integrity and security
 */

/**
 * Check if a value exists and is not empty
 */
const isRequired = (value) => {
  return value !== undefined && value !== null && value.toString().trim() !== '';
};

/**
 * Validate notification title
 */
const validateNotificationTitle = (title) => {
  if (!isRequired(title)) {
    return { isValid: false, message: 'عنوان الإشعار مطلوب' };
  }
  
  const titleStr = title.toString().trim();
  
  if (titleStr.length < 3) {
    return { isValid: false, message: 'عنوان الإشعار يجب أن يكون 3 أحرف على الأقل' };
  }
  
  if (titleStr.length > 100) {
    return { isValid: false, message: 'عنوان الإشعار يجب أن يكون 100 حرف أو أقل' };
  }
  
  // Sanitize title
  const sanitizedTitle = titleStr
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .replace(/vbscript:/gi, ''); // Remove vbscript: protocols
  
  return { isValid: true, value: sanitizedTitle };
};

/**
 * Validate notification message/content
 */
const validateNotificationMessage = (message) => {
  if (!isRequired(message)) {
    return { isValid: false, message: 'محتوى الإشعار مطلوب' };
  }
  
  const messageStr = message.toString().trim();
  
  if (messageStr.length < 5) {
    return { isValid: false, message: 'محتوى الإشعار يجب أن يكون 5 أحرف على الأقل' };
  }
  
  if (messageStr.length > 1000) {
    return { isValid: false, message: 'محتوى الإشعار يجب أن يكون 1000 حرف أو أقل' };
  }
  
  // Sanitize message content
  const sanitizedMessage = messageStr
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .replace(/vbscript:/gi, '') // Remove vbscript: protocols
    .replace(/on\w+\s*=/gi, ''); // Remove event handlers
  
  return { isValid: true, value: sanitizedMessage };
};

/**
 * Validate notification type
 */
const validateNotificationType = (type) => {
  if (!isRequired(type)) {
    return { isValid: false, message: 'نوع الإشعار مطلوب' };
  }
  
  const typeStr = type.toString().trim().toLowerCase();
  const validTypes = [
    'info', 'success', 'warning', 'error', 'announcement',
    'exam', 'assignment', 'attendance', 'grade', 'activity',
    'event', 'reminder', 'system', 'urgent', 'general'
  ];
  
  if (!validTypes.includes(typeStr)) {
    return { isValid: false, message: 'نوع الإشعار غير مدعوم' };
  }
  
  return { isValid: true, value: typeStr };
};

/**
 * Validate notification priority
 */
const validateNotificationPriority = (priority) => {
  if (!priority || priority.toString().trim() === '') {
    return { isValid: true, value: 'medium' }; // Default priority
  }
  
  const priorityStr = priority.toString().trim().toLowerCase();
  const validPriorities = ['low', 'medium', 'high', 'urgent', 'critical'];
  
  if (!validPriorities.includes(priorityStr)) {
    return { isValid: false, message: 'أولوية الإشعار غير صحيحة' };
  }
  
  return { isValid: true, value: priorityStr };
};

/**
 * Validate sender ID
 */
const validateSenderId = (senderId) => {
  if (!senderId || senderId.toString().trim() === '') {
    return { isValid: true, value: null }; // Optional for system notifications
  }
  
  const senderIdStr = senderId.toString().trim();
  
  // If it's an ObjectId string (24 hex characters)
  if (/^[0-9a-fA-F]{24}$/.test(senderIdStr)) {
    return { isValid: true, value: senderIdStr };
  }
  
  // If it's a user ID (8 digits)
  if (/^\d{8}$/.test(senderIdStr)) {
    return { isValid: true, value: senderIdStr };
  }
  
  return { isValid: false, message: 'معرف المرسل غير صحيح' };
};

/**
 * Validate sender type
 */
const validateSenderType = (senderType) => {
  if (!senderType || senderType.toString().trim() === '') {
    return { isValid: true, value: 'system' }; // Default sender type
  }
  
  const typeStr = senderType.toString().trim().toLowerCase();
  const validTypes = ['student', 'teacher', 'admin', 'system'];
  
  if (!validTypes.includes(typeStr)) {
    return { isValid: false, message: 'نوع المرسل غير صحيح' };
  }
  
  return { isValid: true, value: typeStr };
};

/**
 * Validate recipients array
 */
const validateRecipients = (recipients) => {
  if (!recipients) {
    return { isValid: false, message: 'قائمة المستقبلين مطلوبة' };
  }
  
  if (!Array.isArray(recipients)) {
    return { isValid: false, message: 'قائمة المستقبلين يجب أن تكون مصفوفة' };
  }
  
  if (recipients.length === 0) {
    return { isValid: false, message: 'قائمة المستقبلين فارغة' };
  }
  
  if (recipients.length > 1000) {
    return { isValid: false, message: 'عدد كبير من المستقبلين (الحد الأقصى 1000)' };
  }
  
  const validatedRecipients = [];
  const errors = [];
  
  for (let i = 0; i < recipients.length; i++) {
    const recipient = recipients[i];
    
    if (typeof recipient === 'string') {
      // Simple recipient ID
      const recipientIdValidation = validateSenderId(recipient);
      if (!recipientIdValidation.isValid) {
        errors.push(`المستقبل ${i + 1}: ${recipientIdValidation.message}`);
      } else {
        validatedRecipients.push({
          userId: recipientIdValidation.value,
          userType: 'student', // Default type
          isRead: false,
          readAt: null
        });
      }
    } else if (typeof recipient === 'object' && recipient.userId) {
      // Detailed recipient object
      const recipientIdValidation = validateSenderId(recipient.userId);
      if (!recipientIdValidation.isValid) {
        errors.push(`المستقبل ${i + 1}: ${recipientIdValidation.message}`);
        continue;
      }
      
      const userTypeValidation = validateSenderType(recipient.userType || 'student');
      if (!userTypeValidation.isValid) {
        errors.push(`المستقبل ${i + 1}: ${userTypeValidation.message}`);
        continue;
      }
      
      validatedRecipients.push({
        userId: recipientIdValidation.value,
        userType: userTypeValidation.value,
        isRead: Boolean(recipient.isRead),
        readAt: recipient.readAt ? new Date(recipient.readAt) : null
      });
    } else {
      errors.push(`المستقبل ${i + 1}: بيانات المستقبل غير صحيحة`);
    }
  }
  
  if (errors.length > 0) {
    return { isValid: false, message: 'أخطاء في قائمة المستقبلين', errors: errors };
  }
  
  return { isValid: true, value: validatedRecipients };
};

/**
 * Validate scheduled send time
 */
const validateScheduledTime = (scheduledTime) => {
  if (!scheduledTime || scheduledTime.toString().trim() === '') {
    return { isValid: true, value: null }; // Optional field
  }
  
  const scheduledDate = new Date(scheduledTime);
  if (isNaN(scheduledDate.getTime())) {
    return { isValid: false, message: 'وقت الإرسال المجدول غير صحيح' };
  }
  
  // Check if scheduled time is in the future
  const now = new Date();
  if (scheduledDate <= now) {
    return { isValid: false, message: 'وقت الإرسال المجدول يجب أن يكون في المستقبل' };
  }
  
  // Check if scheduled time is not too far in the future (1 year limit)
  const oneYearFromNow = new Date();
  oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
  if (scheduledDate > oneYearFromNow) {
    return { isValid: false, message: 'وقت الإرسال المجدول بعيد جداً (الحد الأقصى سنة واحدة)' };
  }
  
  return { isValid: true, value: scheduledDate };
};

/**
 * Validate expiry time
 */
const validateExpiryTime = (expiryTime) => {
  if (!expiryTime || expiryTime.toString().trim() === '') {
    return { isValid: true, value: null }; // Optional field
  }
  
  const expiryDate = new Date(expiryTime);
  if (isNaN(expiryDate.getTime())) {
    return { isValid: false, message: 'وقت انتهاء الصلاحية غير صحيح' };
  }
  
  // Check if expiry time is in the future
  const now = new Date();
  if (expiryDate <= now) {
    return { isValid: false, message: 'وقت انتهاء الصلاحية يجب أن يكون في المستقبل' };
  }
  
  return { isValid: true, value: expiryDate };
};

/**
 * Validate notification data/payload
 */
const validateNotificationData = (data) => {
  if (!data) {
    return { isValid: true, value: {} }; // Optional field
  }
  
  if (typeof data !== 'object') {
    return { isValid: false, message: 'بيانات الإشعار يجب أن تكون كائن' };
  }
  
  const validatedData = {};
  const errors = [];
  
  // Validate action URL
  if (data.actionUrl !== undefined) {
    const urlStr = data.actionUrl.toString().trim();
    if (urlStr.length > 0) {
      // Basic URL validation
      try {
        new URL(urlStr);
        validatedData.actionUrl = urlStr;
      } catch {
        // If not a full URL, assume it's a relative path
        if (urlStr.startsWith('/') && urlStr.length <= 500) {
          validatedData.actionUrl = urlStr;
        } else {
          errors.push('رابط العمل غير صحيح');
        }
      }
    }
  }
  
  // Validate action text
  if (data.actionText !== undefined) {
    const actionText = data.actionText.toString().trim();
    if (actionText.length > 0 && actionText.length <= 50) {
      validatedData.actionText = actionText;
    } else {
      errors.push('نص العمل يجب أن يكون 50 حرف أو أقل');
    }
  }
  
  // Validate related entity ID
  if (data.relatedEntityId !== undefined) {
    const entityIdValidation = validateSenderId(data.relatedEntityId);
    if (!entityIdValidation.isValid) {
      errors.push('معرف الكيان المرتبط غير صحيح');
    } else {
      validatedData.relatedEntityId = entityIdValidation.value;
    }
  }
  
  // Validate related entity type
  if (data.relatedEntityType !== undefined) {
    const entityType = data.relatedEntityType.toString().trim().toLowerCase();
    const validEntityTypes = ['exam', 'assignment', 'activity', 'news', 'event', 'grade', 'attendance'];
    if (validEntityTypes.includes(entityType)) {
      validatedData.relatedEntityType = entityType;
    } else {
      errors.push('نوع الكيان المرتبط غير صحيح');
    }
  }
  
  if (errors.length > 0) {
    return { isValid: false, message: 'بيانات الإشعار غير صحيحة', errors: errors };
  }
  
  return { isValid: true, value: validatedData };
};

/**
 * Validate notification status
 */
const validateNotificationStatus = (status) => {
  if (!status || status.toString().trim() === '') {
    return { isValid: true, value: 'pending' }; // Default status
  }
  
  const statusStr = status.toString().trim().toLowerCase();
  const validStatuses = ['pending', 'sent', 'delivered', 'failed', 'cancelled', 'expired'];
  
  if (!validStatuses.includes(statusStr)) {
    return { isValid: false, message: 'حالة الإشعار غير صحيحة' };
  }
  
  return { isValid: true, value: statusStr };
};

/**
 * Sanitize notification data
 */
const sanitizeNotificationData = (data) => {
  const sanitized = {};
  
  // Remove potential XSS and clean up data
  Object.keys(data).forEach(key => {
    if (typeof data[key] === 'string') {
      sanitized[key] = data[key].trim()
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
        .replace(/javascript:/gi, '') // Remove javascript: protocols
        .replace(/vbscript:/gi, '') // Remove vbscript: protocols
        .replace(/on\w+\s*=/gi, ''); // Remove event handlers
    } else {
      sanitized[key] = data[key];
    }
  });
  
  return sanitized;
};

/**
 * Main validation middleware for notification data
 */
const validateNotificationFormData = async (req, res, next) => {
  try {
    console.log('🔍 بدء التحقق من بيانات الإشعار...');
    
    const rawData = req.body;
    
    // Sanitize input data
    const data = sanitizeNotificationData(rawData);
    
    const errors = [];
    const validatedData = {};
    
    // Validate notification title
    if (data.title !== undefined) {
      const titleValidation = validateNotificationTitle(data.title);
      if (!titleValidation.isValid) {
        errors.push(titleValidation.message);
      } else {
        validatedData.title = titleValidation.value;
      }
    }
    
    // Validate notification message
    if (data.message !== undefined) {
      const messageValidation = validateNotificationMessage(data.message);
      if (!messageValidation.isValid) {
        errors.push(messageValidation.message);
      } else {
        validatedData.message = messageValidation.value;
      }
    }
    
    // Validate notification type
    if (data.type !== undefined) {
      const typeValidation = validateNotificationType(data.type);
      if (!typeValidation.isValid) {
        errors.push(typeValidation.message);
      } else {
        validatedData.type = typeValidation.value;
      }
    }
    
    // Validate notification priority
    if (data.priority !== undefined) {
      const priorityValidation = validateNotificationPriority(data.priority);
      if (!priorityValidation.isValid) {
        errors.push(priorityValidation.message);
      } else {
        validatedData.priority = priorityValidation.value;
      }
    }
    
    // Validate sender ID
    if (data.senderId !== undefined) {
      const senderValidation = validateSenderId(data.senderId);
      if (!senderValidation.isValid) {
        errors.push(senderValidation.message);
      } else {
        validatedData.senderId = senderValidation.value;
      }
    }
    
    // Validate sender type
    if (data.senderType !== undefined) {
      const senderTypeValidation = validateSenderType(data.senderType);
      if (!senderTypeValidation.isValid) {
        errors.push(senderTypeValidation.message);
      } else {
        validatedData.senderType = senderTypeValidation.value;
      }
    }
    
    // Validate recipients
    if (data.recipients !== undefined) {
      const recipientsValidation = validateRecipients(data.recipients);
      if (!recipientsValidation.isValid) {
        errors.push(recipientsValidation.message);
        if (recipientsValidation.errors) {
          errors.push(...recipientsValidation.errors);
        }
      } else {
        validatedData.recipients = recipientsValidation.value;
      }
    }
    
    // Validate scheduled time
    if (data.scheduledTime !== undefined) {
      const scheduledValidation = validateScheduledTime(data.scheduledTime);
      if (!scheduledValidation.isValid) {
        errors.push(scheduledValidation.message);
      } else {
        validatedData.scheduledTime = scheduledValidation.value;
      }
    }
    
    // Validate expiry time
    if (data.expiryTime !== undefined) {
      const expiryValidation = validateExpiryTime(data.expiryTime);
      if (!expiryValidation.isValid) {
        errors.push(expiryValidation.message);
      } else {
        validatedData.expiryTime = expiryValidation.value;
      }
    }
    
    // Validate notification data/payload
    if (data.data !== undefined) {
      const dataValidation = validateNotificationData(data.data);
      if (!dataValidation.isValid) {
        errors.push(dataValidation.message);
        if (dataValidation.errors) {
          errors.push(...dataValidation.errors);
        }
      } else {
        validatedData.data = dataValidation.value;
      }
    }
    
    // Validate notification status
    if (data.status !== undefined) {
      const statusValidation = validateNotificationStatus(data.status);
      if (!statusValidation.isValid) {
        errors.push(statusValidation.message);
      } else {
        validatedData.status = statusValidation.value;
      }
    }
    
    // Auto-set timestamps
    validatedData.createdAt = new Date();
    if (!validatedData.status) {
      validatedData.status = 'pending';
    }
    
    // If scheduled time is provided, don't send immediately
    if (validatedData.scheduledTime) {
      validatedData.status = 'scheduled';
    }
    
    // Check for validation errors
    if (errors.length > 0) {
      console.log('❌ أخطاء في التحقق من بيانات الإشعار:', errors);
      return res.status(400).json({
        success: false,
        message: 'بيانات الإشعار غير صحيحة',
        errors: errors
      });
    }
    
    // Add validated data to request
    req.validatedData = validatedData;
    
    console.log('✅ تم التحقق من بيانات الإشعار بنجاح');
    next();
    
  } catch (error) {
    console.error('❌ خطأ في التحقق من بيانات الإشعار:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في خادم التحقق من البيانات',
      error: error.message
    });
  }
};

module.exports = {
  validateNotificationFormData,
  sanitizeNotificationData,
  validateNotificationTitle,
  validateNotificationMessage,
  validateNotificationType,
  validateNotificationPriority,
  validateSenderId,
  validateSenderType,
  validateRecipients,
  validateScheduledTime,
  validateExpiryTime,
  validateNotificationData,
  validateNotificationStatus
};