// ============================================================================
// deleteMark.js - Delete Mark
// ============================================================================

const ExamSchedule = require("../../../schema/ExamSchedule");
// const { notifyMarkDeleted } = require("./examMarkNotifications"); // TODO: Create notification handler

/**
 * Delete student mark
 * @route DELETE /api/exam-marks/exam/:examId/student/:studentId
 */
exports.deleteStudentMark = async (req, res) => {
  try {
    const { examId, studentId } = req.params;

    // Find the exam
    const exam = await ExamSchedule.findById(examId);
    if (!exam) {
      return res.status(404).json({ error: "Exam not found" });
    }

    // 🔔 Send notification before deletion
    const io = req.app.get("io");
    // TODO: Implement notification handler
    // await notifyMarkDeleted(examId, studentId, io);

    // Remove the mark from the marks array
    exam.marks = exam.marks.filter(
      (m) => m.student.toString() !== studentId
    );

    // Update exam average after deletion
    const totalMarks = exam.marks.reduce((sum, m) => sum + m.mark, 0);
    exam.examAverage = exam.marks.length > 0 ? totalMarks / exam.marks.length : 0;

    await exam.save();

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

/**
 * Bulk delete student marks
 * @route DELETE /api/exam-marks/bulk-delete
 * @body { examId, studentIds: [] }
 */
exports.bulkDeleteMarks = async (req, res) => {
  try {
    const { examId, studentIds } = req.body;

    // Validation
    if (!examId || !Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({ 
        error: "examId and studentIds array are required" 
      });
    }

    // Find the exam
    const exam = await ExamSchedule.findById(examId);
    if (!exam) {
      return res.status(404).json({ error: "Exam not found" });
    }

    const io = req.app.get("io");
    
    // Remove marks for all specified students
    const initialCount = exam.marks.length;
    exam.marks = exam.marks.filter(
      (m) => !studentIds.includes(m.student.toString())
    );
    const deletedCount = initialCount - exam.marks.length;

    // Update exam average after bulk deletion
    const totalMarks = exam.marks.reduce((sum, m) => sum + m.mark, 0);
    exam.examAverage = exam.marks.length > 0 ? totalMarks / exam.marks.length : 0;

    await exam.save();

    // 🔌 Emit Socket.IO event to exams room
    if (io) {
      io.to("exams").emit("examMarksBulkDeleted", {
        examId: examId,
        studentIds: studentIds,
        deletedCount: deletedCount,
        timestamp: Date.now(),
      });
      console.log(`✅ examMarksBulkDeleted event emitted (${deletedCount} marks deleted)`);
    }

    res.json({ 
      success: true, 
      deletedCount,
      message: `تم حذف ${deletedCount} علامة بنجاح`
    });
  } catch (err) {
    console.error("Error in bulkDeleteMarks:", err);
    res.status(500).json({ error: "Server error" });
  }
};
