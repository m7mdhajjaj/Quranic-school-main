// Update exam
exports.updateExam = async (req, res) => {
  try {
    const examId = req.params.examId;
    const { name, date, time } = req.body;
    const updated = await Exam.findByIdAndUpdate(
      examId,
      { name, date, time },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: "Exam not found" });
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
    const ExamMark = require("../models/ExamMark");
    await ExamMark.deleteMany({ exam: examId });
    res.json({ message: "Exam and related marks deleted" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};
const Exam = require("../models/Exam");

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
    const { name, date, time } = req.body;
    const exam = new Exam({ name, date, time });
    await exam.save();
    res.status(201).json(exam);
  } catch (err) {
    res.status(400).json({ error: "Invalid data" });
  }
};
