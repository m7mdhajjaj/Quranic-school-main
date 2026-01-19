// controllers/basicController/teacherAssistantController/utils.controller.js
const TeacherAssistant = require("../../../schema/TeacherAssistant");
const { checkDuplicateFields } = require("../../../Validation/validators/duplicateChecker");

/**
 * حساب العمر من تاريخ الميلاد
 * @param {string|Date} birthDate - تاريخ الميلاد
 * @returns {number|null} العمر أو null
 */
const calculateAge = (birthDate) => {
  if (!birthDate) return null;
  
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};

/**
 * توليد رقم المساعد التالي
 * @returns {Promise<number>} الرقم التالي
 */
const generateAssistantId = async () => {
  const lastAssistant = await TeacherAssistant.findOne()
    .sort({ assistantId: -1 })
    .select('assistantId');
  
  return lastAssistant ? lastAssistant.assistantId + 1 : 601;
};

/**
 * الحصول على الرقم التالي لمساعد المدرس
 * @route GET /api/teacher-assistants/next-id
 * @access Admin only
 */
const getNextAssistantId = async (req, res) => {
  try {
    const nextId = await generateAssistantId();

    res.status(200).json({
      success: true,
      data: { nextId },
    });
  } catch (error) {
    console.error('Error fetching next ID:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب الرقم التالي',
    });
  }
};

/**
 * التحقق من تكرار القيم عبر جميع المستخدمين في النظام
 * @route GET /api/teacher-assistants/check-duplicate
 * @access Admin only
 */
const checkDuplicate = async (req, res) => {
  try {
    const { field, value, excludeId } = req.query;
    
    if (!field || !value) {
      return res.status(400).json({
        success: false,
        message: 'يجب تحديد الحقل والقيمة',
      });
    }

    // بناء كائن البيانات للتحقق
    const dataToCheck = {};
    dataToCheck[field] = value;

    // استخدام duplicateChecker للتحقق عبر جميع المستخدمين
    const duplicateError = await checkDuplicateFields(dataToCheck, excludeId, 'teacherAssistant');

    if (duplicateError) {
      return res.status(200).json({
        success: true,
        data: { 
          isDuplicate: true,
          message: duplicateError.message,
          existingUserType: duplicateError.existingUserType,
          existingUserName: duplicateError.existingUserName,
        },
      });
    }

    res.status(200).json({
      success: true,
      data: { isDuplicate: false },
    });
  } catch (error) {
    console.error('Error checking duplicate:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء التحقق من التكرار',
    });
  }
};

module.exports = {
  calculateAge,
  generateAssistantId,
  getNextAssistantId,
  checkDuplicate,
};
