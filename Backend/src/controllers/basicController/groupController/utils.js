// ============================================
// SHARED UTILITIES FOR GROUP OPERATIONS
// ============================================

/**
 * دالة موحدة للاستجابة بالنجاح
 */
const successResponse = (res, data, message = 'تمت العملية بنجاح', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
 * دالة موحدة للاستجابة بالخطأ
 */
const errorResponse = (res, message = 'حدث خطأ', statusCode = 500, error = null) => {
  const response = {
    success: false,
    message,
  };

  if (process.env.NODE_ENV === 'development' && error) {
    response.error = error.message || error;
  }

  return res.status(statusCode).json(response);
};

/**
 * دالة موحدة للاستجابة بـ Not Found
 */
const notFoundResponse = (res, message = 'العنصر غير موجود') => {
  return res.status(404).json({
    success: false,
    message,
  });
};

/**
 * دالة موحدة لإرسال Socket Event
 */
const emitSocketEvent = (eventName, data) => {
  if (global.io) {
    global.io.emit(eventName, data);
    console.log(`📡 Socket event emitted: ${eventName}`);
  }
};

/**
 * دالة موحدة لمعالجة الأخطاء
 */
const handleError = (res, error, operation = 'العملية') => {
  console.error(`❌ خطأ في ${operation}:`, error.message);
  return errorResponse(res, `حدث خطأ أثناء ${operation}`, 500, error);
};

/**
 * دالة للتحقق من وجود document
 */
const checkDocumentExists = async (Model, id, errorMessage = 'العنصر غير موجود') => {
  const doc = await Model.findById(id);
  if (!doc) {
    throw new Error(errorMessage);
  }
  return doc;
};

module.exports = {
  successResponse,
  errorResponse,
  notFoundResponse,
  emitSocketEvent,
  handleError,
  checkDocumentExists,
};
