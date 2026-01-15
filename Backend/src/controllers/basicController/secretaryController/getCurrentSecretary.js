/**
 * الحصول على بيانات السكرتير الحالي
 * @access Secretary only
 */
const Secretary = require("../../../schema/Secretary");

const getCurrentSecretary = async (req, res) => {
  try {
    const secretary = await Secretary.findById(req.user._id).select("-password");

    if (!secretary) {
      return res.status(404).json({
        success: false,
        message: "السكرتير غير موجود",
      });
    }

    res.status(200).json({
      success: true,
      data: secretary,
    });
  } catch (error) {
    console.error("Get current secretary error:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء جلب بيانات السكرتير",
    });
  }
};

module.exports = getCurrentSecretary;
