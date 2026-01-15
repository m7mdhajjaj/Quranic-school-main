/**
 * تحديث بيانات سكرتير
 * @access Admin, Secretary (self - limited)
 */
const Secretary = require("../../../schema/Secretary");

const updateSecretary = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // حذف الحقول التي لا يجب تحديثها مباشرة
    delete updateData.secretaryId;
    delete updateData.password;

    // إذا كان المستخدم سكرتير، لا يستطيع تغيير الصلاحيات
    if (req.user.role === "secretary") {
      delete updateData.permissions;
    }

    const secretary = await Secretary.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!secretary) {
      return res.status(404).json({
        success: false,
        message: "السكرتير غير موجود",
      });
    }

    res.status(200).json({
      success: true,
      message: "تم تحديث بيانات السكرتير بنجاح",
      data: secretary,
    });
  } catch (error) {
    console.error("Update secretary error:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء تحديث بيانات السكرتير",
    });
  }
};

module.exports = updateSecretary;
