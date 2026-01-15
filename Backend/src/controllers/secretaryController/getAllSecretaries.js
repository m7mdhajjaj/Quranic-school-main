/**
 * الحصول على جميع السكرتيرين
 * @access Admin only
 */
const Secretary = require("../../schema/Secretary");

const getAllSecretaries = async (req, res) => {
  try {
    const secretaries = await Secretary.find()
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: secretaries.length,
      data: secretaries,
    });
  } catch (error) {
    console.error("Get all secretaries error:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء جلب بيانات السكرتيرين",
    });
  }
};

module.exports = getAllSecretaries;
