// ============================================================================
// addExam.js - Add New Exam
// ============================================================================

const ExamSchedule = require("../../schema/ExamSchedule");
const { isTimeWithinAllowedRange, buildDuplicateQuery } = require("./examHelpers");
const { notifyExamCreated } = require("../../Notifications/handlers/examScheduleNotifications");

/**
 * Add new exam
 * @route POST /api/exams
 */
const addExam = async (req, res) => {
  try {
    // Use validated data from middleware, or fallback to body for backward compatibility
    const examData = req.validatedData || req.body;
    
    // Support both 'name' (old) and 'title' (new) for backward compatibility
    const { title, name, date, time, group, subject, type, duration, totalMarks, passingMarks, description, teacher } = examData;
    const examTitle = title || name;

    // Basic required fields check
    if (!examTitle || !date) {
      return res.status(400).json({ 
        success: false,
        message: "البيانات الأساسية مطلوبة",
        errors: ["عنوان الامتحان والتاريخ مطلوبان"]
      });
    }

    // Time window check (09:00 - 19:00) - only if time is provided
    if (time && !isTimeWithinAllowedRange(time)) {
      return res.status(400).json({ 
        success: false,
        message: "وقت الامتحان غير صحيح",
        errors: ["وقت الامتحان يجب أن يكون بين 09:00 صباحاً و 07:00 مساءً"]
      });
    }

    // Prevent duplicate (same date & same group)
    const dupQuery = buildDuplicateQuery(date, group);
    const exists = await ExamSchedule.findOne(dupQuery);
    if (exists) {
      return res.status(400).json({ 
        success: false,
        message: "امتحان موجود بالفعل",
        errors: [group 
          ? "لا يمكن إضافة امتحان لنفس الحلقة في نفس اليوم" 
          : "لا يمكن إضافة امتحان عام لنفس اليوم"]
      });
    }

    // Create exam with all validated fields
    const exam = new ExamSchedule({ 
      name: examTitle, // Use either title or name
      title: examTitle,
      date, 
      time, 
      group,
      subject,
      type,
      duration,
      totalMarks,
      passingMarks,
      description,
      teacher
    });
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

    // 🔔 Send notification to students (Socket.IO + Firebase + Database)
    await notifyExamCreated(exam, io);

    res.status(201).json({
      success: true,
      message: "تم إضافة الامتحان بنجاح",
      data: exam
    });
  } catch (err) {
    console.error("Error adding exam:", err);
    res.status(400).json({ 
      success: false,
      message: "خطأ في إضافة الامتحان",
      error: err.message 
    });
  }
};

module.exports = addExam;
