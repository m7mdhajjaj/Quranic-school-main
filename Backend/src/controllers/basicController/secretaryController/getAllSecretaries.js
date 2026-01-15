/**
 * الحصول على جميع السكرتيرين
 * @access Admin only
 */
const Secretary = require("../../../schema/Secretary");

const getAllSecretaries = async (req, res) => {
  try {
    const secretaries = await Secretary.find()
      .select("-password")
      .sort({ createdAt: -1 })
      .lean();

    // حساب العمر لكل سكرتير بناءً على تاريخ الميلاد
    const currentYear = new Date().getFullYear();
    const secretariesWithAge = secretaries.map((sec) => {
      if (sec.birthDate) {
        const birthYear = new Date(sec.birthDate).getFullYear();
        sec.age = currentYear - birthYear;
      }
      return sec;
    });

    res.status(200).json({
      success: true,
      count: secretariesWithAge.length,
      data: secretariesWithAge,
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
