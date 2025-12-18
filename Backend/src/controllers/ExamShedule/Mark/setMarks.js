// ============================================================================
// setMarks.js - Add/Update Marks for Multiple Students (Bulk Operation)
// ============================================================================

const ExamSchedule = require("../../../schema/ExamSchedule");
const { updateExamAverage } = require("../Exam/examAverage");

/**
 * Add or update marks for many students in one exam
 * @route POST /api/exam-marks/exam/:examId
 * @body { marks: [{ student, mark, percentage, detail }] }
 */
exports.setExamMarks = async (req, res) => {
  try {
    const examId = req.params.examId;
    const marks = req.body.marks; // [{ student, mark, percentage, detail }]

    if (!Array.isArray(marks)) {
      return res.status(400).json({ error: "marks must be array" });
    }

    // Find the exam
    const exam = await ExamSchedule.findById(examId);
    if (!exam) {
      return res.status(404).json({ error: "Exam not found" });
    }

    // Update marks as subdocuments
    marks.forEach((markData) => {
      const existingMarkIndex = exam.marks.findIndex(
        (m) => m.student.toString() === markData.student.toString()
      );

      const newMark = {
        student: markData.student,
        mark: markData.mark,
        percentage: markData.percentage,
        detail: markData.detail || "",
      };

      if (existingMarkIndex >= 0) {
        // Update existing mark
        exam.marks[existingMarkIndex] = newMark;
      } else {
        // Add new mark
        exam.marks.push(newMark);
      }
    });

    // Update exam average
    const totalMarks = exam.marks.reduce((sum, m) => sum + m.mark, 0);
    exam.examAverage = exam.marks.length > 0 ? totalMarks / exam.marks.length : 0;

    await exam.save();

    // Populate student details
    await exam.populate("marks.student");

    // 🔌 Emit Socket.IO event to exams room
    const io = req.app.get("io");
    if (io) {
      io.to("exams").emit("examMarkCreated", {
        examId: examId,
        marks: exam.marks,
        timestamp: Date.now(),
      });
      console.log("✅ examMarkCreated event emitted to exams room");
    }

    res.json(exam.marks);
  } catch (err) {
    console.error("Error in setExamMarks:", err);
    res.status(500).json({ error: "Server error" });
  }
};
