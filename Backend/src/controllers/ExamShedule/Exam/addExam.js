// ============================================================================
// addExam.js - Add New Exam
// ============================================================================

const ExamSchedule = require("../../../schema/ExamSchedule");
const { isTimeWithinAllowedRange, buildDuplicateQuery, checkTeacherTimeConflict, checkGroupDailyLimit, validateDuration } = require("./examHelpers");
const { notifyExamCreated } = require("../../../Notifications");

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

    // Time window check (12:00 - 21:00) - only if time is provided
    if (time && !isTimeWithinAllowedRange(time)) {
      return res.status(400).json({ 
        success: false,
        message: "وقت الامتحان غير صحيح",
        errors: ["الوقت المسموح من 12:00 ظهراً إلى 9:00 مساءً فقط"]
      });
    }

    // Duration validation (max 2 hours)
    if (duration) {
      const durationValidation = validateDuration(duration);
      if (!durationValidation.isValid) {
        return res.status(400).json({
          success: false,
          message: "مدة الامتحان غير صحيحة",
          errors: [durationValidation.message]
        });
      }
    }

    // Check group daily limit: One exam per group per day
    if (group) {
      const groupLimit = await checkGroupDailyLimit(date, group);
      if (groupLimit) {
        return res.status(400).json({
          success: false,
          message: "تجاوز الحد اليومي للحلقة",
          errors: [groupLimit.message]
        });
      }
    }

    // Check for teacher time conflict (only for teachers)
    if (req.user && req.user.role === 'teacher' && time) {
      const timeConflict = await checkTeacherTimeConflict(
        req.user._id,
        date,
        time,
        duration || 60
      );
      
      if (timeConflict) {
        return res.status(400).json({
          success: false,
          message: "تعارض في الوقت",
          errors: [timeConflict.message]
        });
      }
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
