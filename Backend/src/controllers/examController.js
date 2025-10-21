// Helpers
const isTimeWithinAllowedRange = (timeStr) => {
  if (!timeStr || typeof timeStr !== 'string') return false;
  const parts = timeStr.split(":");
  if (parts.length < 2) return false;
  const h = Number(parts[0]);
  const m = Number(parts[1]);
  if (Number.isNaN(h) || Number.isNaN(m)) return false;
  const total = h * 60 + m;
  const MIN = 9 * 60; // 09:00
  const MAX = 19 * 60; // 19:00
  return total >= MIN && total <= MAX;
};

const buildDuplicateQuery = (date, group) => {
  if (group) {
    return { date, group };
  }
  return {
    date,
    $or: [
      { group: { $exists: false } },
      { group: null },
      { group: "" },
    ],
  };
};

// Update exam
exports.updateExam = async (req, res) => {
  try {
    const examId = req.params.examId;
    const { name, date, time, group } = req.body;

    // Basic required fields check
    if (!name || !date || !time) {
      return res.status(400).json({ error: "جميع الحقول مطلوبة" });
    }

    // Time window check (09:00 - 19:00)
    if (!isTimeWithinAllowedRange(time)) {
      return res.status(400).json({ error: "وقت الامتحان يجب أن يكون بين 09:00 صباحاً و 07:00 مساءً" });
    }

    // Prevent duplicate (same date & same group)
    const dupQuery = buildDuplicateQuery(date, group);
    const exists = await Exam.findOne({
      ...dupQuery,
      _id: { $ne: examId },
    });
    if (exists) {
      return res.status(400).json({ error: group ? "يوجد بالفعل امتحان لهذه الحلقة في هذا اليوم" : "يوجد بالفعل امتحان عام في هذا اليوم" });
    }

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

    // Basic required fields check
    if (!name || !date || !time) {
      return res.status(400).json({ error: "جميع الحقول مطلوبة" });
    }

    // Time window check (09:00 - 19:00)
    if (!isTimeWithinAllowedRange(time)) {
      return res.status(400).json({ error: "وقت الامتحان يجب أن يكون بين 09:00 صباحاً و 07:00 مساءً" });
    }

    // Prevent duplicate (same date & same group)
    const dupQuery = buildDuplicateQuery(date, group);
    const exists = await Exam.findOne(dupQuery);
    if (exists) {
      return res.status(400).json({ error: group ? "لا يمكن إضافة امتحان لنفس الحلقة في نفس اليوم" : "لا يمكن إضافة امتحان عام لنفس اليوم" });
    }

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
