// ============================================================================
// student/markSeen.js - Mark a DailyMark as Seen (Signature)
// ============================================================================

const mongoose = require("mongoose");
const Mark = require("../../../schema/DailyMark/DailyMark");
const { createLogger } = require("../../../utils/logger");
const {
  sendSuccess,
  sendError,
  sendNotFound,
} = require("../utils/responseHelpers");

const logger = createLogger("StudentMarkSeen");

/**
 * Mark a daily mark as seen (signature) by the student account.
 * @route PATCH /api/daily-marks/:id/seen
 */
exports.markSeen = async (req, res) => {
  try {
    if (req.user?.role !== "student") {
      return sendError(res, "هذه العملية متاحة للطالب فقط", 403);
    }

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, "معرف العلامة غير صحيح", 400);
    }

    const mark = await Mark.findById(id);
    if (!mark) {
      return sendNotFound(res, "العلامة");
    }

    if (mark.studentId?.toString() !== req.user._id?.toString()) {
      return sendError(res, "لا تملك صلاحية تعديل هذه العلامة", 403);
    }

    if (mark.seenAt) {
      return sendSuccess(res, mark, "تم تسجيل المشاهدة مسبقاً");
    }

    mark.seenAt = new Date();
    await mark.save();

    logger.debug(`Mark ${id} seen by student ${req.user._id}`);

    const updated = await Mark.findById(id).lean();
    return sendSuccess(res, updated, "تم تسجيل مشاهدة العلامة");
  } catch (error) {
    logger.error("Error marking seen:", error);
    return sendError(res, error.message, 500, error);
  }
};
