/**
 * الحصول على سكرتير بواسطة ID
 * @access Admin, Secretary (self)
 */
const Secretary = require("../../../schema/Secretary");

const getSecretaryById = async (req, res) => {
  try {
    const secretary = await Secretary.findById(req.params.id).select("-password");

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
    console.error("Get secretary by ID error:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء جلب بيانات السكرتير",
    });
  }
};

module.exports = getSecretaryById;
