// ============================================================================
// deleteExam.js - Delete Exam and Related Marks
// ============================================================================

const ExamSchedule = require("../../../schema/ExamSchedule");
const ExamMark = require("../../../schema/ExamMark");
const { notifyExamDeleted } = require("../../../Notifications");

/**
 * Delete exam and related marks
 * @route DELETE /api/exams/:examId
 */
const deleteExam = async (req, res) => {
  try {
    const examId = req.params.examId;
    
    const exam = await ExamSchedule.findById(examId);
    
    if (!exam) {
      return res.status(404).json({ error: "Exam not found" });
    }
    
    // Get Socket.IO instance
    const io = req.app.get("io");
    
    // 🔔 Send notification to students before deletion (Socket.IO + Firebase + Database)
    await notifyExamDeleted(exam, io);
    
    // Remove exam
    await ExamSchedule.findByIdAndDelete(examId);
    
    // Remove all marks for this exam
    await ExamMark.deleteMany({ exam: examId });

    // 🔌 Emit Socket event to exams room
    if (io) {
      io.to("exams").emit("examDeleted", {
        examId: examId,
        timestamp: Date.now(),
      });
      console.log("✅ examDeleted event emitted to exams room");
    }

    res.json({ message: "Exam and related marks deleted" });
  } catch (err) {
    console.error("Error deleting exam:", err);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = deleteExam;
