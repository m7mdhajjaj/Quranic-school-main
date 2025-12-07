// ============================================================================
// updateMark.js - Update Single Mark
// ============================================================================

const ExamSchedule = require("../../../schema/ExamSchedule");
// const { notifyMarkUpdated } = require("./examMarkNotifications"); // TODO: Create notification handler

/**
 * Update single student mark
 * @route PUT /api/exam-marks/exam/:examId/student/:studentId
 * @body { mark, percentage, detail }
 */
exports.updateStudentMark = async (req, res) => {
  try {
    const { examId, studentId } = req.params;
    const { mark, percentage, detail } = req.body;

    // Find the exam
    const exam = await ExamSchedule.findById(examId);
    if (!exam) {
      return res.status(404).json({ error: "Exam not found" });
    }

    // Find mark index
    const markIndex = exam.marks.findIndex(
      (m) => m.student.toString() === studentId
    );

    if (markIndex >= 0) {
      // Update existing mark
      exam.marks[markIndex].mark = mark;
      exam.marks[markIndex].percentage = percentage;
      exam.marks[markIndex].detail = detail || "";
    } else {
      // Add new mark
      exam.marks.push({
        student: studentId,
        mark: mark,
        percentage: percentage,
        detail: detail || "",
      });
    }

    // Update exam average
    const totalMarks = exam.marks.reduce((sum, m) => sum + m.mark, 0);
    exam.examAverage = exam.marks.length > 0 ? totalMarks / exam.marks.length : 0;

    await exam.save();
    await exam.populate("marks.student");

    const updatedMark = exam.marks.find(
      (m) => m.student._id.toString() === studentId
    );

    // 🔔 Send notification to student
    const io = req.app.get("io");
    // TODO: Implement notification handler
    // await notifyMarkUpdated(updatedMark, io);

    // 🔌 Emit Socket.IO event to exams room
    if (io) {
      io.to("exams").emit("examMarkUpdated", {
        examId: examId,
        studentId: studentId,
        mark: updatedMark,
        timestamp: Date.now(),
      });
      console.log("✅ examMarkUpdated event emitted to exams room");
    }

    res.json(updatedMark);
  } catch (err) {
    console.error("Error in updateStudentMark:", err);
    res.status(500).json({ error: "Server error" });
  }
};
