/**
 * التحقق من تكرار البيانات للسكرتير
 * يستخدم duplicateChecker.js الموجود في Validation
 */

const { checkDuplicateFields } = require("../../Validation/validators/duplicateChecker");

const checkDuplicate = async (req, res) => {
  try {
    const { field, value, excludeId } = req.body;

    if (!field || !value) {
      return res.status(400).json({
        success: false,
        message: "الحقل والقيمة مطلوبان",
      });
    }

    const allowedFields = ['email', 'phoneNumber', 'idNumber'];
    if (!allowedFields.includes(field)) {
      return res.status(400).json({
        success: false,
        message: "الحقل غير صالح",
      });
    }

    const dataToCheck = { [field]: value };
    const duplicateError = await checkDuplicateFields(dataToCheck, excludeId, 'secretary');

    if (duplicateError) {
      return res.status(200).json({
        success: true,
        isDuplicate: true,
        message: duplicateError.message,
        field: duplicateError.field,
        existingUserType: duplicateError.existingUserType,
        existingUserName: duplicateError.existingUserName,
      });
    }

    res.status(200).json({
      success: true,
      isDuplicate: false,
      message: "القيمة متاحة",
    });

  } catch (error) {
    console.error("Check duplicate error:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء التحقق من التكرار",
    });
  }
};

module.exports = checkDuplicate;
