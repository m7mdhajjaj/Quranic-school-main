const ExamMark = require("../schema/ExamMark");
const mongoose = require("mongoose");

// Get all marks for a specific student
exports.getStudentMarks = async (req, res) => {
  try {
    const studentId = req.params.studentId;
    const marks = await ExamMark.find({ student: studentId }).populate("exam");
    res.json(marks);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// Get all marks for a specific exam
exports.getExamMarks = async (req, res) => {
  try {
    const examId = req.params.examId;
    const marks = await ExamMark.find({ exam: examId }).populate("student");
    res.json(marks);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// Add or update marks for many students in one exam
exports.setExamMarks = async (req, res) => {
  try {
    const examId = req.params.examId;
    const marks = req.body.marks; // [{ student, mark, detail }]

    if (!Array.isArray(marks)) {
      return res.status(400).json({ error: "marks must be array" });
    }

    const operations = marks.map((m) => ({
      updateOne: {
        filter: { exam: examId, student: m.student },
        update: { $set: { mark: m.mark, detail: m.detail } },
        upsert: true,
      },
    }));

    await ExamMark.bulkWrite(operations);

    const updated = await ExamMark.find({ exam: examId }).populate("student");
    res.json(updated);
  } catch (err) {
    console.error("Error in setExamMarks:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Update single student mark
exports.updateStudentMark = async (req, res) => {
  try {
    const { examId, studentId } = req.params;
    const { mark, detail } = req.body;

    const updated = await ExamMark.findOneAndUpdate(
      { exam: examId, student: studentId },
      { mark, detail },
      { new: true, upsert: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// Delete student mark
exports.deleteStudentMark = async (req, res) => {
  try {
    const { examId, studentId } = req.params;
    await ExamMark.findOneAndDelete({ exam: examId, student: studentId });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// Get average mark for an exam
exports.getExamAverage = async (req, res) => {
  try {
    const examId = req.params.examId;

    const result = await ExamMark.aggregate([
      { $match: { exam: new mongoose.Types.ObjectId(examId) } },
      {
        $group: {
          _id: "$exam",
          avgMark: { $avg: { $toDouble: "$mark" } },
          count: { $sum: 1 },
        },
      },
    ]);

    if (result.length === 0) {
      return res.json({ average: null, count: 0 });
    }

    res.json({ average: result[0].avgMark, count: result[0].count });
  } catch (err) {
    console.error("Error in getExamAverage:", err);
    res.status(500).json({ error: "Server error" });
  }
};
