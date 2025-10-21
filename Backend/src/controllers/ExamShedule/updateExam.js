// ============================================================================
// updateExam.js - Update Existing Exam
// ============================================================================

const Exam = require("../../schema/Exam");
const { isTimeWithinAllowedRange, buildDuplicateQuery } = require("./examHelpers");
const { notifyExamUpdated } = require("./examNotifications");

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

    // Time window check (09:00 - 19:00) - only if time is provided
    if (time && !isTimeWithinAllowedRange(time)) {
      return res.status(400).json({ 
        success: false,
        message: "وقت الامتحان غير صحيح",
        errors: ["وقت الامتحان يجب أن يكون بين 09:00 صباحاً و 07:00 مساءً"]
      });
    }

    // Prevent duplicate (same date & same group) - only if date or group changed
    if (date || group !== undefined) {
      const checkDate = date || (await Exam.findById(examId))?.date;
      const checkGroup = group !== undefined ? group : (await Exam.findById(examId))?.group;
      
      const dupQuery = buildDuplicateQuery(checkDate, checkGroup);
      const exists = await Exam.findOne({
        ...dupQuery,
        _id: { $ne: examId },
      });
      if (exists) {
        return res.status(400).json({ 
          success: false,
          message: "امتحان موجود بالفعل",
          errors: [checkGroup 
            ? "يوجد بالفعل امتحان لهذه الحلقة في هذا اليوم" 
            : "يوجد بالفعل امتحان عام في هذا اليوم"]
        });
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

    const updated = await Exam.findByIdAndUpdate(
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
