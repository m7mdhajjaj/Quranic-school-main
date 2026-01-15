/**
 * تحديث صلاحيات السكرتير
 * @access Admin only
 */
const Secretary = require("../../schema/Secretary");

const updateSecretaryPermissions = async (req, res) => {
  try {
    const { id } = req.params;
    const { permissions } = req.body;

    const secretary = await Secretary.findByIdAndUpdate(
      id,
      { permissions },
      { new: true, runValidators: true }
    ).select("-password");

    if (!secretary) {
      return res.status(404).json({
        success: false,
        message: "السكرتير غير موجود",
      });
    }

    res.status(200).json({
      success: true,
      message: "تم تحديث صلاحيات السكرتير بنجاح",
      data: secretary,
    });
  } catch (error) {
    console.error("Update secretary permissions error:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء تحديث صلاحيات السكرتير",
    });
  }
};

module.exports = updateSecretaryPermissions;
