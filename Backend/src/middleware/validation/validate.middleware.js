/**
 * ============================================================================
 * Validation Middleware - التحقق من صحة البيانات المحسّن
 * ============================================================================
 * 
 * Middleware للتحقق من صحة البيانات باستخدام Zod schemas
 * يوفر:
 * - تحقق من body, query, params
 * - رسائل خطأ مفصلة
 * - تنظيف البيانات تلقائياً
 */

const { ZodError } = require("zod");

/**
 * Creates a validation middleware for a given Zod schema
 * 
 * @param {Object} schema - Zod schema to validate against
 * @param {string} source - Source of data to validate ('body', 'query', 'params')
 * @returns {Function} Express middleware function
 * 
 * @example
 * router.post('/messages', validate(sendMessageSchema), controller.sendMessage);
 * router.get('/messages', validate(getMessagesSchema, 'query'), controller.getMessages);
 */
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    try {
      // Validate the data from the specified source
      const validated = schema.parse(req[source]);
      
      // Replace the original data with validated data
      req[source] = validated;
      
      // Also store in validatedData for convenience
      req.validatedData = { ...req.validatedData, ...validated };
      
      next();
    } catch (error) {
      // Handle Zod validation errors
      if (error instanceof ZodError) {
        const errors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
        }));
        
        console.log('⚠️ Validation Error:', {
          source,
          path: req.path,
          errors
        });

        return res.status(400).json({
          success: false,
          message: 'خطأ في البيانات المدخلة',
          errorCode: 'VALIDATION_ERROR',
          errors
        });
      }
      
      // Handle other errors
      return res.status(400).json({
        success: false,
        message: error.message || 'خطأ في التحقق من البيانات',
        errorCode: 'VALIDATION_ERROR'
      });
    }
  };
};

/**
 * Validates multiple sources at once
 * 
 * @param {Object} schemas - Object with schemas for different sources
 * @returns {Function} Express middleware function
 * 
 * @example
 * router.put('/users/:id', validateMultiple({
 *   params: paramsSchema,
 *   body: updateUserSchema
 * }), controller.updateUser);
 */
const validateMultiple = (schemas) => {
  return (req, res, next) => {
    const allErrors = [];
    
    for (const [source, schema] of Object.entries(schemas)) {
      try {
        const validated = schema.parse(req[source]);
        req[source] = validated;
        req.validatedData = { ...req.validatedData, ...validated };
      } catch (error) {
        if (error instanceof ZodError) {
          allErrors.push(...error.errors.map(err => ({
            source,
            field: err.path.join('.'),
            message: err.message,
            code: err.code,
          })));
        }
      }
    }
    
    if (allErrors.length > 0) {
      console.log('⚠️ Multiple Validation Errors:', {
        path: req.path,
        errors: allErrors
      });
      
      return res.status(400).json({
        success: false,
        message: 'خطأ في البيانات المدخلة',
        errorCode: 'VALIDATION_ERROR',
        errors: allErrors
      });
    }
    
    next();
  };
};

/**
 * Sanitize input - removes dangerous characters
 * 
 * @param {Object} options - Sanitization options
 * @returns {Function} Express middleware function
 */
const sanitizeInput = (options = {}) => {
  const {
    trimStrings = true,
    removeNullBytes = true,
    maxStringLength = 10000,
  } = options;

  const sanitize = (obj) => {
    if (obj === null || obj === undefined) return obj;
    
    if (typeof obj === 'string') {
      let result = obj;
      
      if (trimStrings) result = result.trim();
      if (removeNullBytes) result = result.replace(/\0/g, '');
      if (result.length > maxStringLength) result = result.substring(0, maxStringLength);
      
      return result;
    }
    
    if (Array.isArray(obj)) {
      return obj.map(sanitize);
    }
    
    if (typeof obj === 'object') {
      const sanitized = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = sanitize(value);
      }
      return sanitized;
    }
    
    return obj;
  };

  return (req, res, next) => {
    if (req.body) req.body = sanitize(req.body);
    if (req.query) req.query = sanitize(req.query);
    if (req.params) req.params = sanitize(req.params);
    next();
  };
};

/**
 * Check if required fields are present
 * 
 * @param {string[]} fields - Required field names
 * @param {string} source - Source to check ('body', 'query', 'params')
 * @returns {Function} Express middleware function
 */
const requireFields = (fields, source = 'body') => {
  return (req, res, next) => {
    const missing = fields.filter(field => {
      const value = req[source][field];
      return value === undefined || value === null || value === '';
    });
    
    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        message: `الحقول المطلوبة مفقودة: ${missing.join(', ')}`,
        errorCode: 'MISSING_FIELDS',
        errors: missing.map(field => ({
          field,
          message: 'هذا الحقل مطلوب'
        }))
      });
    }
    
    next();
  };
};

module.exports = {
  validate,
  validateMultiple,
  sanitizeInput,
  requireFields,
};
