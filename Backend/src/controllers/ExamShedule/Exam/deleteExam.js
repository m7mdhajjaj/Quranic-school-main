// ============================================================================
// deleteExam.js - Delete Exam and Related Marks
// ============================================================================

const ExamSchedule = require("../../../schema/ExamShedule/ExamSchedule");
const ExamMark = require("../../../schema/ExamShedule/ExamMark");
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

    // ✅ FIX: التحقق من أن المعلم يحذف فقط امتحانات حلقاته
    if (req.user && req.user.role === 'teacher') {
      const teacherGroups = req.user.groups || [];
      const teacherGroupNames = teacherGroups.map(g => g.name).filter(Boolean);
      
      if (!teacherGroupNames.includes(exam.group)) {
        return res.status(403).json({
          success: false,
          message: "غير مصرح لك بحذف هذا الامتحان",
          error: `لا يمكنك حذف امتحان للحلقة "${exam.group}" لأنها ليست من حلقاتك`
        });
      }
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
