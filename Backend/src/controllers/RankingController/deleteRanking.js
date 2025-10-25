// ============================================================================
// Delete Ranking - حذف ترتيب
// ============================================================================

const Ranking = require("../../schema/Ranking");

/**
 * حذف ترتيب لشهر وسنة محددة
 * @route DELETE /api/rankings/:month/:year
 * @access Protected (Admin only)
 */
const deleteRanking = async (req, res) => {
  try {
    const { month, year } = req.params;

    const result = await Ranking.findOneAndDelete({
      month: parseInt(month),
      year: parseInt(year),
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: `لم يتم العثور على تصنيف لشهر ${month}/${year}`,
      });
    }

    res.status(200).json({
      success: true,
      message: `تم حذف التصنيف لشهر ${month}/${year} بنجاح`,
    });
  } catch (error) {
    console.error("Error deleting ranking:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء حذف التصنيف",
      error: error.message,
    });
  }
};

module.exports = deleteRanking;
