// ============================================================================
// deleteMark.js - Delete Mark Operations
// ============================================================================

const Mark = require("../../schema/DailyMark/DailyMark");
const { notifyMarkDeleted } = require("../../Notifications/handlers/DailyMarks/dailyMarkNotifications");

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
} = require("./utils/responseHelpers");

/**
 * Delete a mark by ID
 * @route DELETE /api/daily-marks/:id
 */
exports.deleteMark = async (req, res) => {
  try {
    const { id } = req.params;

    console.log("🗑️ Deleting mark:", id);

    // Get the mark before deletion to get student info
    const mark = await Mark.findById(id).populate("sectionId");

    if (!mark) {
      return sendNotFound(res, "العلامة");
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

    sendSuccess(res, { deletedId: id, studentId }, "تم حذف العلامة بنجاح");
  } catch (error) {
    console.error("❌ Error in deleteMark:", error);
    sendError(res, error.message, 500, error);
  }
};


