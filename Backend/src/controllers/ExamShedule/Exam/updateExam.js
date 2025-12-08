// ============================================================================
// updateExam.js - Update Existing Exam
// ============================================================================

const ExamSchedule = require("../../../schema/ExamSchedule");
const { isTimeWithinAllowedRange, buildDuplicateQuery, checkTeacherTimeConflict, checkGroupDailyLimit, validateDuration } = require("./examHelpers");
const { notifyExamUpdated } = require("../../../Notifications/handlers/examScheduleNotifications");

/**
 * Update exam
 * @route PUT /api/exams/:examId
 */
const updateExam = async (req, res) => {
  try {
    const examId = req.params.examId;
    
    // Use validated data from middleware
    const examData = req.validatedData || req.body;
    const { title, date, time, group, subject, type, duration, totalMarks, passingMarks, description, isActive, isPublished } = examData;

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

    // Check group daily limit: One exam per group per day - only if date or group changed
    if (date || group !== undefined) {
      const checkDate = date || (await ExamSchedule.findById(examId))?.date;
      const checkGroup = group !== undefined ? group : (await ExamSchedule.findById(examId))?.group;
      
      if (checkGroup) {
        const groupLimit = await checkGroupDailyLimit(checkDate, checkGroup, examId);
        if (groupLimit) {
          return res.status(400).json({
            success: false,
            message: "تجاوز الحد اليومي للحلقة",
            errors: [groupLimit.message]
          });
        }
      }
    }

    // Check for teacher time conflict (only for teachers and if time/date changed)
    if (req.user && req.user.role === 'teacher' && (time || date || duration)) {
      const currentExam = await ExamSchedule.findById(examId);
      const checkDate = date || currentExam?.date;
      const checkTime = time || currentExam?.time;
      const checkDuration = duration || currentExam?.duration || 60;
      
      if (checkTime) {
        const timeConflict = await checkTeacherTimeConflict(
          req.user._id,
          checkDate,
          checkTime,
          checkDuration,
          examId
        );
        
        if (timeConflict) {
          return res.status(400).json({
            success: false,
            message: "تعارض في الوقت",
            errors: [timeConflict.message]
          });
        }
      }
    }

    // Build update object with only provided fields
    const updateData = {};
    if (title) {
      updateData.title = title;
      updateData.name = title; // For backward compatibility
    }
    if (date) updateData.date = date;
    if (time) updateData.time = time;
    if (group !== undefined) updateData.group = group;
    if (subject) updateData.subject = subject;
    if (type) updateData.type = type;
    if (duration) updateData.duration = duration;
    if (totalMarks) updateData.totalMarks = totalMarks;
    if (passingMarks !== undefined) updateData.passingMarks = passingMarks;
    if (description !== undefined) updateData.description = description;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (isPublished !== undefined) updateData.isPublished = isPublished;

    const updated = await ExamSchedule.findByIdAndUpdate(
      examId,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!updated) {
      return res.status(404).json({ 
        success: false,
        message: "الامتحان غير موجود",
        errors: ["لم يتم العثور على الامتحان"]
      });
    }

    // 🔌 Emit Socket event to exams room
    const io = req.app.get("io");
    if (io) {
      io.to("exams").emit("examUpdated", {
        exam: updated,
        timestamp: Date.now(),
      });
      console.log("✅ examUpdated event emitted to exams room");
    }

    // 🔔 Send notification to students (Socket.IO + Firebase + Database)
    await notifyExamUpdated(updated, io);

    res.json({
      success: true,
      message: "تم تحديث الامتحان بنجاح",
      data: updated
    });
  } catch (err) {
    console.error("Error updating exam:", err);
    res.status(400).json({ 
      success: false,
      message: "خطأ في تحديث الامتحان",
      error: err.message 
    });
  }
};

module.exports = updateExam;
