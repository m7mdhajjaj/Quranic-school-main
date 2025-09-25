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
const ExamMark = require("../models/ExamMark");
const Student = require("../models/Student");

// Get marks for an exam
exports.getExamMarks = async (req, res) => {
  try {
    const examId = req.params.examId;
    const marks = await ExamMark.find({ exam: examId }).populate("student");
    res.json(marks);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// Add or update marks for students in an exam
exports.setExamMarks = async (req, res) => {
  try {
    const examId = req.params.examId;
    const marks = req.body.marks; // [{ student, mark, detail }]
    let results = [];
    for (const m of marks) {
      let markDoc = await ExamMark.findOne({
        exam: examId,
        student: m.student,
      });
      if (markDoc) {
        markDoc.mark = m.mark;
        markDoc.detail = m.detail;
        await markDoc.save();
      } else {
        markDoc = new ExamMark({
          exam: examId,
          student: m.student,
          mark: m.mark,
          detail: m.detail,
        });
        await markDoc.save();
      }
      results.push(markDoc);
    }
    res.json(results);
  } catch (err) {
    res.status(400).json({ error: "Invalid data" });
  }
};
