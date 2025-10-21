// ============================================================================
// deleteMark.js - Delete Student Mark
// ============================================================================

const ExamMark = require("../../schema/ExamMark");
const { notifyMarkDeleted } = require("./examMarkNotifications");
const { updateExamAverage } = require("./examAverage");

/**
 * Delete student mark
 * @route DELETE /api/exam-marks/exam/:examId/student/:studentId
 */
exports.deleteStudentMark = async (req, res) => {
  try {
    const { examId, studentId } = req.params;

    // 🔔 Send notification before deletion
    const io = req.app.get("io");
    await notifyMarkDeleted(examId, studentId, io);

    // Delete mark from database
    await ExamMark.findOneAndDelete({ exam: examId, student: studentId });

    // Update exam average after deletion
    await updateExamAverage(examId);

    // 🔌 Emit Socket.IO event to exams room
    if (io) {
      io.to("exams").emit("examMarkDeleted", {
        examId: examId,
        studentId: studentId,
        timestamp: Date.now(),
      });
      console.log("✅ examMarkDeleted event emitted to exams room");
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Error in deleteStudentMark:", err);
    res.status(500).json({ error: "Server error" });
  }
};
