// ============================================================================
// updateMark.js - Update Single Student Mark
// ============================================================================

const ExamMark = require("../../schema/ExamMark");
const { notifyMarkUpdated } = require("./examMarkNotifications");
const { updateExamAverage } = require("./examAverage");

/**
 * Update single student mark
 * @route PUT /api/exam-marks/exam/:examId/student/:studentId
 * @body { mark, detail }
 */
exports.updateStudentMark = async (req, res) => {
  try {
    const { examId, studentId } = req.params;
    const { mark, detail } = req.body;

    // Update or create mark
    const updated = await ExamMark.findOneAndUpdate(
      { exam: examId, student: studentId },
      { mark, detail },
      { new: true, upsert: true }
    )
      .populate("student")
      .populate("exam");

    // Update exam average
    await updateExamAverage(examId);

    // 🔔 Send notification to student
    const io = req.app.get("io");
    await notifyMarkUpdated(updated, io);

    // 🔌 Emit Socket.IO event to exams room
    if (io) {
      io.to("exams").emit("examMarkUpdated", {
        examId: examId,
        studentId: studentId,
        mark: updated,
        timestamp: Date.now(),
      });
      console.log("✅ examMarkUpdated event emitted to exams room");
    }

    res.json(updated);
  } catch (err) {
    console.error("Error in updateStudentMark:", err);
    res.status(500).json({ error: "Server error" });
  }
};
