const Joi = require('joi');

/**
 * 📖 Quran & Tafsir Validation Schemas
 * التحقق من صحة المدخلات للقرآن والتفسير
 */

// ═══════════════════════════════════════
// البحث في القرآن
// ═══════════════════════════════════════

const searchQuranSchema = Joi.object({
  query: Joi.string()
    .min(2)
    .max(200)
    .required()
    .messages({
      'string.empty': 'يرجى إدخال كلمة للبحث',
      'string.min': 'كلمة البحث يجب أن تكون حرفين على الأقل',
      'string.max': 'كلمة البحث طويلة جداً'
    }),
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(10),
  surah: Joi.number()
    .integer()
    .min(1)
    .max(114),
  juz: Joi.number()
    .integer()
    .min(1)
    .max(30)
});

// ═══════════════════════════════════════
// رقم السورة
// ═══════════════════════════════════════

const surahNumberSchema = Joi.object({
  surahNumber: Joi.number()
    .integer()
    .min(1)
    .max(114)
    .required()
    .messages({
      'number.base': 'رقم السورة يجب أن يكون رقماً',
      'number.min': 'رقم السورة يجب أن يكون بين 1 و 114',
      'number.max': 'رقم السورة يجب أن يكون بين 1 و 114'
    })
});

// ═══════════════════════════════════════
// رقم الآية
// ═══════════════════════════════════════

const ayahNumberSchema = Joi.object({
  surahNumber: Joi.number()
    .integer()
    .min(1)
    .max(114)
    .required(),
  ayahNumber: Joi.number()
    .integer()
    .min(1)
    .max(286)
    .required()
    .messages({
      'number.base': 'رقم الآية يجب أن يكون رقماً',
      'number.min': 'رقم الآية يجب أن يكون 1 على الأقل',
      'number.max': 'رقم الآية كبير جداً'
    })
});

// ═══════════════════════════════════════
// البحث في التفسير
// ═══════════════════════════════════════

const searchTafsirSchema = Joi.object({
  query: Joi.string()
    .min(2)
    .max(200)
    .required()
    .messages({
      'string.empty': 'يرجى إدخال كلمة للبحث',
      'string.min': 'كلمة البحث يجب أن تكون حرفين على الأقل'
    }),
  limit: Joi.number()
    .integer()
    .min(1)
    .max(50)
    .default(10),
  surah: Joi.number()
    .integer()
    .min(1)
    .max(114)
});

// ═══════════════════════════════════════
// RAG Context
// ═══════════════════════════════════════

const ragContextSchema = Joi.object({
  query: Joi.string()
    .min(3)
    .max(500)
    .required()
    .messages({
      'string.empty': 'يرجى إدخال استفسار',
      'string.min': 'الاستفسار قصير جداً'
    }),
  maxResults: Joi.number()
    .integer()
    .min(1)
    .max(20)
    .default(5)
});

// ═══════════════════════════════════════
// البحث بالموضوع
// ═══════════════════════════════════════

const topicSearchSchema = Joi.object({
  topic: Joi.string()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.empty': 'يرجى تحديد الموضوع'
    }),
  limit: Joi.number()
    .integer()
    .min(1)
    .max(50)
    .default(10)
});

// ═══════════════════════════════════════
// AI Chat
// ═══════════════════════════════════════

const aiChatSchema = Joi.object({
  message: Joi.string()
    .min(2)
    .max(2000)
    .required()
    .messages({
      'string.empty': 'يرجى إدخال رسالة',
      'string.min': 'الرسالة قصيرة جداً',
      'string.max': 'الرسالة طويلة جداً (الحد الأقصى 2000 حرف)'
    })
});

// ═══════════════════════════════════════
// TTS
// ═══════════════════════════════════════

const ttsSchema = Joi.object({
  text: Joi.string()
    .min(5)
    .max(5000)
    .required()
    .messages({
      'string.empty': 'يرجى إدخال نص للتحويل',
      'string.min': 'النص قصير جداً',
      'string.max': 'النص طويل جداً'
    })
});

// ═══════════════════════════════════════
// Validation Middleware
// ═══════════════════════════════════════

const validate = (schema, property = 'query') => {
  return (req, res, next) => {
    const data = property === 'body' ? req.body : 
                 property === 'params' ? req.params : req.query;
    
    const { error, value } = schema.validate(data, { 
      abortEarly: false,
      stripUnknown: true,
      convert: true // ✅ Enable automatic type conversion (string to number)
    });
    
    if (error) {
      const messages = error.details.map(d => d.message);
      return res.status(400).json({
        success: false,
        message: 'خطأ في البيانات المدخلة',
        errors: messages
      });
    }
    
    // Replace with validated values
    if (property === 'body') req.body = value;
    else if (property === 'params') req.params = value;
    else req.query = value;
    
    next();
  };
};

module.exports = {
  // Schemas
  searchQuranSchema,
  surahNumberSchema,
  ayahNumberSchema,
  searchTafsirSchema,
  ragContextSchema,
  topicSearchSchema,
  aiChatSchema,
  ttsSchema,
  
  // Middleware helpers
  validate,
  
  // Pre-built validators
  validateSearchQuran: validate(searchQuranSchema, 'query'),
  validateSurahNumber: validate(surahNumberSchema, 'params'),
  validateAyahNumber: validate(ayahNumberSchema, 'params'),
  validateSearchTafsir: validate(searchTafsirSchema, 'query'),
  validateRAGContext: validate(ragContextSchema, 'body'),
  validateTopicSearch: validate(topicSearchSchema, 'params'),
  validateAiChat: validate(aiChatSchema, 'body'),
  validateTTS: validate(ttsSchema, 'body')
};
