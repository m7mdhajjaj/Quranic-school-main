/**
 * Check Duplicate Controller for Profile
 * Handles real-time duplicate checking for profile fields
 */

const { checkDuplicateFields } = require("../../utils/validators/duplicateChecker");

/**
 * @desc    Check if a field value is duplicate (for real-time validation)
 * @route   GET /api/profile/check-duplicate
 * @access  Private
 */
const checkDuplicate = async (req, res) => {
  try {
    const { field, value } = req.query;
    const userId = req.user.id || req.user._id;
    const userRole = req.user.role || "student";

    if (!field || !value) {
      return res.status(400).json({
        success: false,
        message: "يجب تحديد الحقل والقيمة",
      });
    }

    // التحقق من أن الحقل مسموح به
    const allowedFields = ["email", "phoneNumber", "idNumber"];
    if (!allowedFields.includes(field)) {
      return res.status(400).json({
        success: false,
        message: "الحقل غير مسموح به",
      });
    }

    // التحقق من التكرار
    const data = { [field]: value };
    const duplicateError = await checkDuplicateFields(
      data,
      userId,
      userRole
    );

    if (duplicateError) {
      return res.json({
        success: false,
        isDuplicate: true,
        message: duplicateError.message,
        field: duplicateError.field,
        existingUserType: duplicateError.existingUserType,
        existingUserName: duplicateError.existingUserName,
      });
    }

    return res.json({
      success: true,
      isDuplicate: false,
      message: "القيمة متاحة",
    });
  } catch (error) {
    console.error("خطأ في التحقق من التكرار:", error);
    return res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء التحقق من البيانات",
    });
  }
};

module.exports = {
  checkDuplicate,
};


