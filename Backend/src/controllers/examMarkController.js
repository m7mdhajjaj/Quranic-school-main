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

    // تحديث متوسط الامتحان
    await updateExamAverage(examId);

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

    // تحديث متوسط الامتحان
    await updateExamAverage(examId);

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

    // تحديث متوسط الامتحان بعد الحذف
    await updateExamAverage(examId);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// Helper function to calculate and update exam average
const updateExamAverage = async (examId) => {
  try {
    const Exam = require("../schema/Exam");

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

    let average = null;
    if (result.length > 0 && result[0].avgMark != null) {
      // تقريب المتوسط إلى رقمين عشريين
      average = Math.round(result[0].avgMark * 100) / 100;
    }

    // تحديث الامتحان بالمتوسط الجديد
    await Exam.findByIdAndUpdate(examId, { examAverage: average });

    return average;
  } catch (err) {
    console.error("Error updating exam average:", err);
    return null;
  }
};

// Get average mark for an exam
exports.getExamAverage = async (req, res) => {
  try {
    const examId = req.params.examId;
    const Exam = require("../schema/Exam");

    // جلب الامتحان من قاعدة البيانات
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ error: "Exam not found" });
    }

    // إذا كان المتوسط محفوظاً، أرجعه
    if (exam.examAverage !== null && exam.examAverage !== undefined) {
      return res.json({ average: exam.examAverage, count: 0 });
    }

    // إذا لم يكن محفوظاً، احسبه وحدّثه
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

    const average = Math.round(result[0].avgMark * 100) / 100;

    // حفظ المتوسط في قاعدة البيانات
    await Exam.findByIdAndUpdate(examId, { examAverage: average });

    res.json({ average: average, count: result[0].count });
  } catch (err) {
    console.error("Error in getExamAverage:", err);
    res.status(500).json({ error: "Server error" });
  }
};
