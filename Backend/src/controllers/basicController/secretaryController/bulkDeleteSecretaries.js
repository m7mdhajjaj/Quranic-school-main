/**
 * حذف مجموعة من السكرتيرين دفعة واحدة
 * @access Admin only
 */
const Secretary = require("../../../schema/Secretary");

const bulkDeleteSecretaries = async (req, res) => {
  try {
    const { ids } = req.body;

    // التحقق من وجود قائمة IDs
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "يرجى تحديد السكرتيرين المراد حذفهم",
      });
    }

    // التحقق من عدم تجاوز الحد الأقصى
    if (ids.length > 50) {
      return res.status(400).json({
        success: false,
        message: "لا يمكن حذف أكثر من 50 سكرتير دفعة واحدة",
      });
    }

    // التحقق من صحة IDs
    const validIds = ids.filter((id) => {
      return id && typeof id === "string" && id.match(/^[0-9a-fA-F]{24}$/);
    });

    if (validIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "لم يتم العثور على معرفات صالحة",
      });
    }

    // البحث عن السكرتيرين الموجودين
    const existingSecretaries = await Secretary.find({
      _id: { $in: validIds },
    }).select("_id firstName lastName");

    if (existingSecretaries.length === 0) {
      return res.status(404).json({
        success: false,
        message: "لم يتم العثور على أي سكرتير من القائمة المحددة",
      });
    }

    // حذف السكرتيرين
    const deleteResult = await Secretary.deleteMany({
      _id: { $in: existingSecretaries.map((s) => s._id) },
    });

    console.log(
      `✅ تم حذف ${deleteResult.deletedCount} سكرتير بنجاح بواسطة ${req.user?.firstName || "Admin"}`
    );

    res.status(200).json({
      success: true,
      message: `تم حذف ${deleteResult.deletedCount} سكرتير بنجاح`,
      deletedCount: deleteResult.deletedCount,
      deletedIds: existingSecretaries.map((s) => s._id),
    });
  } catch (error) {
    console.error("Bulk delete secretaries error:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء حذف السكرتيرين",
    });
  }
};

module.exports = bulkDeleteSecretaries;
