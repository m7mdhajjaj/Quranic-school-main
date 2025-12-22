/**
 * ============================================================================
 * Validation Middleware - التحقق من صحة البيانات
 * ============================================================================
 * 
 * Middleware عام للتحقق من صحة البيانات باستخدام Zod schemas
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
      
      next();
    } catch (error) {
      // Handle Zod validation errors
      if (error instanceof ZodError) {
        const errors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));
        
        return res.status(400).json({
          success: false,
          message: 'خطأ في البيانات المدخلة',
          errors
        });
      }
      
      // Handle other errors
      return res.status(400).json({
        success: false,
        message: error.message || 'خطأ في التحقق من البيانات'
      });
    }
  };
};

module.exports = { validate };
