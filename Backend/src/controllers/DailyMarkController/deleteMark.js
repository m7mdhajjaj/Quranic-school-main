// ============================================================================
// deleteMark.js - Delete Mark Operations
// ============================================================================

const Mark = require("../../schema/DailyMark/DailyMark");
const { notifyMarkDeleted } = require("../../Notifications");

// استيراد الدوال المساعدة
const {
  updateStudentMonthlyAverage,
  updateMultipleStudentsMonthlyAverage,
  updateSingleSectionStatus,
  updateMultipleSectionsStatus,
  emitSocketEvent,
} = require("./utils/markHelpers");

const {
  sendSuccess,
  sendError,
  sendNotFound,
  sendValidationError,
} = require("./utils/responseHelpers");

const { validateMarkEditWindow } = require("./utils/validationHelpers");

/**
 * Delete a mark by ID
 * @route DELETE /api/daily-marks/:id
 */
exports.deleteMark = async (req, res) => {
  try {
    const { id } = req.params;

    console.log("🗑️ Deleting mark:", id);

    // Get the mark before deletion to get student info and section date
    const mark = await Mark.findById(id).populate("sectionId", "date");

    if (!mark) {
      return sendNotFound(res, "العلامة");
    }

    // ⏰ التحقق من نافذة التعديل الزمنية
    if (mark.sectionId && mark.sectionId.date) {
      try {
        validateMarkEditWindow(mark.sectionId.date, 'delete');
      } catch (windowError) {
        return sendValidationError(res, windowError.message);
      }
    }

    const studentId = mark.studentId;
    const sectionId = mark.sectionId;

    console.log("📊 Mark details:", {
      studentId,
      reviewMark: mark.reviewMark,
      memorizationMark: mark.memorizationMark,
    });

    // Get student info for notification
    const markWithStudent = await Mark.findById(id)
      .populate("studentId", "firstName fatherName lastName")
      .populate("sectionId");

    // Send notification
    console.log("🔔 Sending deletion notification...");
    const io = req.app.get("io");
    await notifyMarkDeleted(markWithStudent, io);

    // Delete the mark
    await Mark.findByIdAndDelete(id);
    console.log("✅ تم حذف العلامة بنجاح");

    // Send success response immediately to make UI faster
    sendSuccess(res, { deletedId: id, studentId }, "تم حذف العلامة بنجاح");

    // Perform background updates
    try {
      // Update monthly average and section status
      await updateStudentMonthlyAverage(studentId, sectionId);
      
      if (sectionId && sectionId._id) {
        await updateSingleSectionStatus(sectionId._id.toString());
      }

      // Emit Socket.IO event
      emitSocketEvent(io, "markDeleted", {
        markId: id,
        studentId,
      });
    } catch (bgError) {
      console.error("⚠️ Error in background updates after delete:", bgError);
    }
  } catch (error) {
    console.error("❌ Error in deleteMark:", error);
    // Only send error if response hasn't been sent yet
    if (!res.headersSent) {
      sendError(res, error.message, 500, error);
    }
  }
};


