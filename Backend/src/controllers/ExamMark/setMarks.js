// ============================================================================
// setMarks.js - Add/Update Marks for Multiple Students (Bulk Operation)
// ============================================================================

const ExamMark = require("../../schema/ExamMark");
const { notifyMarksAdded } = require("./examMarkNotifications");
const { updateExamAverage } = require("./examAverage");

/**
 * Add or update marks for many students in one exam
 * @route POST /api/exam-marks/exam/:examId
 * @body { marks: [{ student, mark, detail }] }
 */
exports.setExamMarks = async (req, res) => {
  try {
    const examId = req.params.examId;
    const marks = req.body.marks; // [{ student, mark, detail }]

    if (!Array.isArray(marks)) {
      return res.status(400).json({ error: "marks must be array" });
    }

    // Bulk write operation
    const operations = marks.map((m) => ({
      updateOne: {
        filter: { exam: examId, student: m.student },
        update: { $set: { mark: m.mark, detail: m.detail } },
        upsert: true,
      },
    }));

    await ExamMark.bulkWrite(operations);

    // Update exam average
    await updateExamAverage(examId);

    // Fetch updated marks
    const updated = await ExamMark.find({ exam: examId }).populate("student");

    // 🔔 Send notifications to students
    const io = req.app.get("io");
    await notifyMarksAdded(examId, marks, io);

    // 🔌 Emit Socket.IO event to exams room
    if (io) {
      io.to("exams").emit("examMarkCreated", {
        examId: examId,
        marks: updated,
        timestamp: Date.now(),
      });
      console.log("✅ examMarkCreated event emitted to exams room");
    }

    res.json(updated);
  } catch (err) {
    console.error("Error in setExamMarks:", err);
    res.status(500).json({ error: "Server error" });
  }
};
