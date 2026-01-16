/**
 * تحديث صلاحيات السكرتير
 * @access Admin only
 */
const Secretary = require("../../../schema/Secretary");

const updateSecretaryPermissions = async (req, res) => {
  try {
    const { id } = req.params;
    const { permissions } = req.body;

    console.log('🔐 تحديث صلاحيات السكرتير:', id);
    console.log('📥 الصلاحيات المستلمة:', JSON.stringify(permissions, null, 2));

    // تأكد من أن الصلاحيات موجودة
    if (!permissions || typeof permissions !== 'object') {
      return res.status(400).json({
        success: false,
        message: "الصلاحيات مطلوبة",
      });
    }

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

    console.log('✅ تم تحديث الصلاحيات:', JSON.stringify(secretary.permissions, null, 2));

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
