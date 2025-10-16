// Update exam
exports.updateExam = async (req, res) => {
  try {
    const examId = req.params.examId;
    const { name, date, time, group } = req.body;
    const updated = await Exam.findByIdAndUpdate(
      examId,
      { name, date, time, group },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: "Exam not found" });

    // 🔌 Emit Socket event to exams room
    const io = req.app.get("io");
    if (io) {
      io.to("exams").emit("examUpdated", {
        exam: updated,
        timestamp: Date.now(),
      });
      console.log("✅ examUpdated event emitted to exams room");
    }

    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: "Invalid data" });
  }
};
// Delete exam and related marks
exports.deleteExam = async (req, res) => {
  try {
    const examId = req.params.examId;
    // Remove exam
    await Exam.findByIdAndDelete(examId);
    // Remove all marks for this exam
    const ExamMark = require("../schema/ExamMark");
    await ExamMark.deleteMany({ exam: examId });

    // 🔌 Emit Socket event to exams room
    const io = req.app.get("io");
    if (io) {
      io.to("exams").emit("examDeleted", {
        examId: examId,
        timestamp: Date.now(),
      });
      console.log("✅ examDeleted event emitted to exams room");
    }

    res.json({ message: "Exam and related marks deleted" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};
const Exam = require("../schema/Exam");

// Get all exams
exports.getExams = async (req, res) => {
  try {
    const exams = await Exam.find();
    res.json(exams);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// Add new exam
exports.addExam = async (req, res) => {
  try {
    const { name, date, time, group } = req.body;
    const exam = new Exam({ name, date, time, group });
    await exam.save();

    // 🔌 Emit Socket event to exams room
    const io = req.app.get("io");
    if (io) {
      io.to("exams").emit("examCreated", {
        exam: exam,
        timestamp: Date.now(),
      });
      console.log("✅ examCreated event emitted to exams room");
    }

    res.status(201).json(exam);
  } catch (err) {
    res.status(400).json({ error: "Invalid data" });
  }
};
