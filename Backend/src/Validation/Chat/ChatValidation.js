// Validation/ChatValidation.js

/**
 * Chat data validation middleware with comprehensive rules
 * Validates and sanitizes chat/messaging data to ensure data integrity and security
 */

/**
 * Check if a value exists and is not empty
 */
const isRequired = (value) => {
  return value !== undefined && value !== null && value.toString().trim() !== '';
};

/**
 * Validate sender ID
 */
const validateSenderId = (senderId) => {
  if (!isRequired(senderId)) {
    return { isValid: false, message: 'معرف المرسل مطلوب' };
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
 * Validate receiver ID
 */
const validateReceiverId = (receiverId) => {
  if (!isRequired(receiverId)) {
    return { isValid: false, message: 'معرف المستقبل مطلوب' };
  }
  
  const receiverIdStr = receiverId.toString().trim();
  
  // If it's an ObjectId string
  if (/^[0-9a-fA-F]{24}$/.test(receiverIdStr)) {
    return { isValid: true, value: receiverIdStr };
  }
  
  // If it's a user ID (8 digits)
  if (/^\d{8}$/.test(receiverIdStr)) {
    return { isValid: true, value: receiverIdStr };
  }
  
  return { isValid: false, message: 'معرف المستقبل غير صحيح' };
};

/**
 * Validate message content
 */
const validateMessageContent = (message, messageType = 'text') => {
  if (!isRequired(message)) {
    return { isValid: false, message: 'محتوى الرسالة مطلوب' };
  }
  
  const messageStr = message.toString().trim();
  
  // Check message length based on type
  let maxLength = 1000; // Default for text messages
  if (messageType === 'file') maxLength = 200; // File names/descriptions
  if (messageType === 'image') maxLength = 500; // Image captions
  if (messageType === 'voice') maxLength = 100; // Voice message descriptions
  
  if (messageStr.length === 0) {
    return { isValid: false, message: 'محتوى الرسالة لا يمكن أن يكون فارغاً' };
  }
  
  if (messageStr.length > maxLength) {
    return { isValid: false, message: `محتوى الرسالة يجب أن يكون ${maxLength} حرف أو أقل` };
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
 * Validate message type
 */
const validateMessageType = (type) => {
  if (!type || type.toString().trim() === '') {
    return { isValid: true, value: 'text' }; // Default type
  }
  
  const typeStr = type.toString().trim().toLowerCase();
  const validTypes = ['text', 'image', 'file', 'voice', 'video', 'location', 'contact'];
  
  if (!validTypes.includes(typeStr)) {
    return { isValid: false, message: 'نوع الرسالة غير مدعوم' };
  }
  
  return { isValid: true, value: typeStr };
};

/**
 * Validate chat room/group ID
 */
const validateChatRoomId = (roomId) => {
  if (!roomId || roomId.toString().trim() === '') {
    return { isValid: true, value: null }; // Optional for direct messages
  }
  
  const roomIdStr = roomId.toString().trim();
  
  // If it's an ObjectId string
  if (/^[0-9a-fA-F]{24}$/.test(roomIdStr)) {
    return { isValid: true, value: roomIdStr };
  }
  
  return { isValid: false, message: 'معرف غرفة المحادثة غير صحيح' };
};

/**
 * Validate message status
 */
const validateMessageStatus = (status) => {
  if (!status || status.toString().trim() === '') {
    return { isValid: true, value: 'sent' }; // Default status
  }
  
  const statusStr = status.toString().trim().toLowerCase();
  const validStatuses = ['sent', 'delivered', 'read', 'failed', 'deleted'];
  
  if (!validStatuses.includes(statusStr)) {
    return { isValid: false, message: 'حالة الرسالة غير صحيحة' };
  }
  
  return { isValid: true, value: statusStr };
};

/**
 * Validate attachment file information
 */
const validateAttachment = (attachment) => {
  if (!attachment) {
    return { isValid: true, value: null }; // Optional field
  }
  
  const errors = [];
  const validatedAttachment = {};
  
  // Validate file name
  if (attachment.fileName) {
    const fileName = attachment.fileName.toString().trim();
    if (fileName.length === 0) {
      errors.push('اسم الملف مطلوب');
    } else if (fileName.length > 255) {
      errors.push('اسم الملف طويل جداً (الحد الأقصى 255 حرف)');
    } else {
      // Check for safe file name
      const safeFileName = fileName.replace(/[^a-zA-Z0-9\u0600-\u06FF._-]/g, '_');
      validatedAttachment.fileName = safeFileName;
    }
  }
  
  // Validate file size
  if (attachment.fileSize) {
    const fileSize = parseInt(attachment.fileSize);
    if (isNaN(fileSize) || fileSize <= 0) {
      errors.push('حجم الملف غير صحيح');
    } else if (fileSize > 50 * 1024 * 1024) { // 50MB limit
      errors.push('حجم الملف كبير جداً (الحد الأقصى 50 ميجابايت)');
    } else {
      validatedAttachment.fileSize = fileSize;
    }
  }
  
  // Validate file type
  if (attachment.fileType) {
    const fileType = attachment.fileType.toString().trim().toLowerCase();
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain', 'audio/mpeg', 'audio/wav', 'video/mp4', 'video/avi'
    ];
    
    if (!allowedTypes.includes(fileType)) {
      errors.push('نوع الملف غير مدعوم');
    } else {
      validatedAttachment.fileType = fileType;
    }
  }
  
  // Validate file URL/path
  if (attachment.fileUrl) {
    const fileUrl = attachment.fileUrl.toString().trim();
    if (fileUrl.length === 0) {
      errors.push('رابط الملف مطلوب');
    } else {
      validatedAttachment.fileUrl = fileUrl;
    }
  }
  
  if (errors.length > 0) {
    return { isValid: false, message: 'معلومات المرفق غير صحيحة', errors: errors };
  }
  
  return { isValid: true, value: validatedAttachment };
};

/**
 * Validate sender type (student, teacher, admin)
 */
const validateSenderType = (senderType) => {
  if (!senderType || senderType.toString().trim() === '') {
    return { isValid: false, message: 'نوع المرسل مطلوب' };
  }
  
  const typeStr = senderType.toString().trim().toLowerCase();
  const validTypes = ['student', 'teacher', 'admin'];
  
  if (!validTypes.includes(typeStr)) {
    return { isValid: false, message: 'نوع المرسل غير صحيح' };
  }
  
  return { isValid: true, value: typeStr };
};

/**
 * Validate receiver type
 */
const validateReceiverType = (receiverType) => {
  if (!receiverType || receiverType.toString().trim() === '') {
    return { isValid: false, message: 'نوع المستقبل مطلوب' };
  }
  
  const typeStr = receiverType.toString().trim().toLowerCase();
  const validTypes = ['student', 'teacher', 'admin', 'group', 'class'];
  
  if (!validTypes.includes(typeStr)) {
    return { isValid: false, message: 'نوع المستقبل غير صحيح' };
  }
  
  return { isValid: true, value: typeStr };
};

/**
 * Validate priority level
 */
const validatePriority = (priority) => {
  if (!priority || priority.toString().trim() === '') {
    return { isValid: true, value: 'medium' }; // Default priority
  }
  
  const priorityStr = priority.toString().trim().toLowerCase();
  const validPriorities = ['low', 'medium', 'high', 'urgent'];
  
  if (!validPriorities.includes(priorityStr)) {
    return { isValid: false, message: 'مستوى الأولوية غير صحيح' };
  }
  
  return { isValid: true, value: priorityStr };
};

/**
 * Validate reply to message ID
 */
const validateReplyToId = (replyToId) => {
  if (!replyToId || replyToId.toString().trim() === '') {
    return { isValid: true, value: null }; // Optional field
  }
  
  const replyToIdStr = replyToId.toString().trim();
  
  // If it's an ObjectId string
  if (/^[0-9a-fA-F]{24}$/.test(replyToIdStr)) {
    return { isValid: true, value: replyToIdStr };
  }
  
  return { isValid: false, message: 'معرف الرسالة المُراد الرد عليها غير صحيح' };
};

/**
 * Validate mentions array
 */
const validateMentions = (mentions) => {
  if (!mentions) {
    return { isValid: true, value: [] }; // Default empty array
  }
  
  if (!Array.isArray(mentions)) {
    return { isValid: false, message: 'الإشارات يجب أن تكون مصفوفة' };
  }
  
  if (mentions.length > 20) {
    return { isValid: false, message: 'عدد كبير من الإشارات (الحد الأقصى 20)' };
  }
  
  const validatedMentions = [];
  const errors = [];
  
  for (let i = 0; i < mentions.length; i++) {
    const mention = mentions[i];
    
    if (!mention || typeof mention !== 'object') {
      errors.push(`الإشارة ${i + 1}: بيانات الإشارة غير صحيحة`);
      continue;
    }
    
    // Validate mentioned user ID
    const userIdValidation = validateSenderId(mention.userId);
    if (!userIdValidation.isValid) {
      errors.push(`الإشارة ${i + 1}: ${userIdValidation.message}`);
      continue;
    }
    
    // Validate mentioned user type
    const userTypeValidation = validateSenderType(mention.userType);
    if (!userTypeValidation.isValid) {
      errors.push(`الإشارة ${i + 1}: ${userTypeValidation.message}`);
      continue;
    }
    
    validatedMentions.push({
      userId: userIdValidation.value,
      userType: userTypeValidation.value,
      userName: mention.userName ? mention.userName.toString().trim() : ''
    });
  }
  
  if (errors.length > 0) {
    return { isValid: false, message: 'أخطاء في الإشارات', errors: errors };
  }
  
  return { isValid: true, value: validatedMentions };
};

/**
 * Sanitize chat data
 */
const sanitizeChatData = (data) => {
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
 * Main validation middleware for chat data
 */
const validateChatData = async (req, res, next) => {
  try {
    console.log('🔍 بدء التحقق من بيانات المحادثة...');
    
    const rawData = req.body;
    
    // Sanitize input data
    const data = sanitizeChatData(rawData);
    
    const errors = [];
    const validatedData = {};
    
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
    
    // Validate receiver ID
    if (data.receiverId !== undefined) {
      const receiverValidation = validateReceiverId(data.receiverId);
      if (!receiverValidation.isValid) {
        errors.push(receiverValidation.message);
      } else {
        validatedData.receiverId = receiverValidation.value;
      }
    }
    
    // Validate receiver type
    if (data.receiverType !== undefined) {
      const receiverTypeValidation = validateReceiverType(data.receiverType);
      if (!receiverTypeValidation.isValid) {
        errors.push(receiverTypeValidation.message);
      } else {
        validatedData.receiverType = receiverTypeValidation.value;
      }
    }
    
    // Validate message type first (needed for content validation)
    if (data.messageType !== undefined) {
      const typeValidation = validateMessageType(data.messageType);
      if (!typeValidation.isValid) {
        errors.push(typeValidation.message);
      } else {
        validatedData.messageType = typeValidation.value;
      }
    }
    
    // Validate message content
    if (data.message !== undefined) {
      const messageValidation = validateMessageContent(data.message, validatedData.messageType);
      if (!messageValidation.isValid) {
        errors.push(messageValidation.message);
      } else {
        validatedData.message = messageValidation.value;
      }
    }
    
    // Validate chat room ID
    if (data.chatRoomId !== undefined) {
      const roomValidation = validateChatRoomId(data.chatRoomId);
      if (!roomValidation.isValid) {
        errors.push(roomValidation.message);
      } else {
        validatedData.chatRoomId = roomValidation.value;
      }
    }
    
    // Validate message status
    if (data.status !== undefined) {
      const statusValidation = validateMessageStatus(data.status);
      if (!statusValidation.isValid) {
        errors.push(statusValidation.message);
      } else {
        validatedData.status = statusValidation.value;
      }
    }
    
    // Validate attachment
    if (data.attachment !== undefined) {
      const attachmentValidation = validateAttachment(data.attachment);
      if (!attachmentValidation.isValid) {
        errors.push(attachmentValidation.message);
        if (attachmentValidation.errors) {
          errors.push(...attachmentValidation.errors);
        }
      } else {
        validatedData.attachment = attachmentValidation.value;
      }
    }
    
    // Validate priority
    if (data.priority !== undefined) {
      const priorityValidation = validatePriority(data.priority);
      if (!priorityValidation.isValid) {
        errors.push(priorityValidation.message);
      } else {
        validatedData.priority = priorityValidation.value;
      }
    }
    
    // Validate reply to ID
    if (data.replyToId !== undefined) {
      const replyValidation = validateReplyToId(data.replyToId);
      if (!replyValidation.isValid) {
        errors.push(replyValidation.message);
      } else {
        validatedData.replyToId = replyValidation.value;
      }
    }
    
    // Validate mentions
    if (data.mentions !== undefined) {
      const mentionsValidation = validateMentions(data.mentions);
      if (!mentionsValidation.isValid) {
        errors.push(mentionsValidation.message);
        if (mentionsValidation.errors) {
          errors.push(...mentionsValidation.errors);
        }
      } else {
        validatedData.mentions = mentionsValidation.value;
      }
    }
    
    // Auto-set timestamp
    validatedData.sentAt = new Date();
    
    // Auto-set default status if not provided
    if (!validatedData.status) {
      validatedData.status = 'sent';
    }
    
    // Check for validation errors
    if (errors.length > 0) {
      console.log('❌ أخطاء في التحقق من بيانات المحادثة:', errors);
      return res.status(400).json({
        success: false,
        message: 'بيانات المحادثة غير صحيحة',
        errors: errors
      });
    }
    
    // Add validated data to request
    req.validatedData = validatedData;
    
    console.log('✅ تم التحقق من بيانات المحادثة بنجاح');
    next();
    
  } catch (error) {
    console.error('❌ خطأ في التحقق من بيانات المحادثة:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في خادم التحقق من البيانات',
      error: error.message
    });
  }
};

module.exports = {
  validateChatData,
  sanitizeChatData,
  validateSenderId,
  validateReceiverId,
  validateMessageContent,
  validateMessageType,
  validateChatRoomId,
  validateMessageStatus,
  validateAttachment,
  validateSenderType,
  validateReceiverType,
  validatePriority,
  validateReplyToId,
  validateMentions
};