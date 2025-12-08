// ============================================================================
// bulkDeleteExams.js - Bulk Delete Multiple Exams
// ============================================================================

const ExamSchedule = require("../../../schema/ExamSchedule");

/**
 * Bulk delete multiple exams
 * @route DELETE /api/exams/bulk
 * @body {string[]} examIds - Array of exam IDs to delete
 */
const bulkDeleteExams = async (req, res) => {
  try {
    const { examIds } = req.body;

    // Validation
    if (!examIds || !Array.isArray(examIds) || examIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'يجب تحديد امتحانات للحذف',
        error: 'examIds must be a non-empty array'
      });
    }

    // Check if too many exams (safety limit)
    if (examIds.length > 100) {
      return res.status(400).json({
        success: false,
        message: 'لا يمكن حذف أكثر من 100 امتحان في المرة الواحدة',
        error: 'Maximum 100 exams can be deleted at once'
      });
    }

    // Validate all IDs are valid MongoDB ObjectIds
    const invalidIds = examIds.filter(id => !id.match(/^[0-9a-fA-F]{24}$/));
    if (invalidIds.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'بعض معرفات الامتحانات غير صحيحة',
        error: 'Invalid exam IDs',
        invalidIds
      });
    }

    // Delete all exams with the given IDs
    const result = await ExamSchedule.deleteMany({
      _id: { $in: examIds }
    });

    console.log(`🗑️ Bulk deleted ${result.deletedCount} exams out of ${examIds.length} requested`);

    // Check if any exams were actually deleted
    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'لم يتم العثور على أي امتحانات للحذف',
        error: 'No exams found with the provided IDs'
      });
    }

    // Success response
    res.json({
      success: true,
      message: `تم حذف ${result.deletedCount} امتحان بنجاح`,
      deletedCount: result.deletedCount,
      requestedCount: examIds.length,
      notFound: examIds.length - result.deletedCount
    });

  } catch (err) {
    console.error("Error in bulk delete exams:", err);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء حذف الامتحانات',
      error: err.message
    });
  }
};

module.exports = bulkDeleteExams;
