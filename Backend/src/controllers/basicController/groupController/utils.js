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

/**
 * حساب العمر من تاريخ الميلاد
 * دالة مشتركة بين Student, Teacher, Admin Controllers
 */
const calculateAge = (birthDate) => {
  if (!birthDate) return 0;

  const today = new Date();
  const birthDateObj = new Date(birthDate);

  if (isNaN(birthDateObj.getTime())) return 0;

  let age = today.getFullYear() - birthDateObj.getFullYear();
  const monthDiff = today.getMonth() - birthDateObj.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDateObj.getDate())
  ) {
    age--;
  }

  return age;
};

/**
 * Pipeline مشترك لحساب عدد الطلاب
 * @param {Object} matchStage - مرحلة الفلترة الأولية (مثل تحديد الحلقات)
 */
const getStudentCountPipeline = (matchStage = {}) => {
  return [
    { $match: matchStage },
    // Removed Warning lookup logic - suspended students have group=null so they are excluded naturally
    {
      $group: {
        _id: '$group',
        count: { $sum: 1 },
      },
    }
  ];
};

module.exports = {
  successResponse,
  errorResponse,
  notFoundResponse,
  emitSocketEvent,
  handleError,
  checkDocumentExists,
  calculateAge,
  getStudentCountPipeline,
};
