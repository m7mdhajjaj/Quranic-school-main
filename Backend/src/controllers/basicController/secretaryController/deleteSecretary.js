/**
 * حذف سكرتير
 * @access Admin only
 */
const Secretary = require("../../../schema/Secretary");
const Counter = require("../../../schema/Counter");

const deleteSecretary = async (req, res) => {
  try {
    const { id } = req.params;

    const secretary = await Secretary.findById(id);

    if (!secretary) {
      return res.status(404).json({
        success: false,
        message: "السكرتير غير موجود",
      });
    }

    // إعادة الـ ID للـ recycled IDs
    await Counter.recycleId("secretary", secretary.secretaryId);

    await Secretary.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "تم حذف السكرتير بنجاح",
    });
  } catch (error) {
    console.error("Delete secretary error:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء حذف السكرتير",
    });
  }
};

module.exports = deleteSecretary;
