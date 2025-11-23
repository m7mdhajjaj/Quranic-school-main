// ============================================================================
// deleteMark.js - Delete Mark Operations
// ============================================================================

const Mark = require("../../schema/DailyMark");
const { notifyMarkDeleted } = require("../../Notifications/handlers/dailyMarkNotifications");
const {
  calculateAndUpdateMonthlyAverage,
} = require("../../services/StudentAverageService");

/**
 * Delete a mark by ID
 * @route DELETE /api/daily-marks/:id
 */
exports.deleteMark = async (req, res) => {
  try {
    const { id } = req.params;

    console.log("🗑️ Deleting mark:", id);

    // Get the mark before deletion to get student info
    const mark = await Mark.findById(id).populate("sectionId");

    if (!mark) {
      return res.status(404).json({
        success: false,
        message: "العلامة غير موجودة",
      });
    }

    const studentId = mark.studentId;
    const sectionId = mark.sectionId;

    console.log("📊 Mark details:", {
      studentId,
      reviewMark: mark.reviewMark,
      memorizationMark: mark.memorizationMark,
    });

    // Get student info for notification
    const markWithStudent = await Mark.findById(id)
      .populate("studentId", "firstName fatherName lastName")
      .populate("sectionId");

    // Send notification
    console.log("🔔 Sending deletion notification...");
    const io = req.app.get("io");
    await notifyMarkDeleted(markWithStudent, io);

    // Delete the mark
    await Mark.findByIdAndDelete(id);
    console.log("✅ Mark deleted successfully");

    // Update monthly average for the student
    if (sectionId && sectionId.date) {
      console.log("🔄 Updating monthly average...");
      const sectionDate = new Date(sectionId.date);
      const month = sectionDate.getMonth() + 1;
      const year = sectionDate.getFullYear();

      try {
        await calculateAndUpdateMonthlyAverage(studentId, month, year);
        console.log("✅ Monthly average updated after deletion");
      } catch (avgError) {
        console.error("⚠️ Error updating monthly average:", avgError);
      }
    }

    // Emit Socket.IO event
    if (io) {
      console.log("📡 Broadcasting markDeleted event...");
      io.emit("markDeleted", {
        markId: id,
        studentId,
        timestamp: Date.now(),
      });
      console.log("✅ Event emitted");
    }

    res.json({
      success: true,
      message: "تم حذف العلامة بنجاح",
      data: {
        deletedId: id,
        studentId,
      },
    });
  } catch (error) {
    console.error("❌ Error in deleteMark:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Delete marks for a specific student
 * @route DELETE /api/daily-marks/student/:studentId
 */
exports.deleteStudentMarks = async (req, res) => {
  try {
    const { studentId } = req.params;

    console.log("🗑️ Deleting all marks for student:", studentId);

    // Get all marks for this student
    const marks = await Mark.find({ studentId });

    if (marks.length === 0) {
      return res.status(404).json({
        success: false,
        message: "لا توجد علامات لهذا الطالب",
      });
    }

    console.log(`📊 Found ${marks.length} marks to delete`);

    // Get unique section IDs for average recalculation
    const sectionIds = new Set();
    marks.forEach((mark) => {
      if (mark.sectionId) sectionIds.add(mark.sectionId);
    });

    // Delete all marks
    await Mark.deleteMany({ studentId });
    console.log(`✅ Deleted ${marks.length} marks`);

    // Update monthly averages
    console.log("🔄 Updating monthly averages...");
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    try {
      await calculateAndUpdateMonthlyAverage(studentId, month, year);
      console.log("✅ Monthly averages updated");
    } catch (avgError) {
      console.error("⚠️ Error updating monthly average:", avgError);
    }

    // Emit Socket.IO event
    const io = req.app.get("io");
    if (io) {
      console.log("📡 Broadcasting bulk deletion event...");
      io.emit("marksDeleted", {
        studentId,
        count: marks.length,
        timestamp: Date.now(),
      });
    }

    res.json({
      success: true,
      message: `تم حذف ${marks.length} علامة بنجاح`,
      data: {
        deletedCount: marks.length,
        studentId,
      },
    });
  } catch (error) {
    console.error("❌ Error in deleteStudentMarks:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Delete marks for a specific section
 * @route DELETE /api/daily-marks/section/:sectionId
 */
exports.deleteSectionMarks = async (req, res) => {
  try {
    const { sectionId } = req.params;

    console.log("🗑️ Deleting all marks for section:", sectionId);

    // Get all marks for this section
    const marks = await Mark.find({ sectionId });

    if (marks.length === 0) {
      return res.status(404).json({
        success: false,
        message: "لا توجد علامات لهذا القسم",
      });
    }

    console.log(`📊 Found ${marks.length} marks to delete`);

    // Get unique student IDs
    const studentIds = [...new Set(marks.map((m) => m.studentId.toString()))];

    // Delete all marks
    await Mark.deleteMany({ sectionId });
    console.log(`✅ Deleted ${marks.length} marks`);

    // Update monthly averages for all affected students
    console.log("🔄 Updating monthly averages for all students...");
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    const updatePromises = studentIds.map(async (studentId) => {
      try {
        await calculateAndUpdateMonthlyAverage(studentId, month, year);
      } catch (error) {
        console.error(`⚠️ Error updating average for student ${studentId}:`, error);
      }
    });

    await Promise.all(updatePromises);
    console.log("✅ Monthly averages updated");

    // Emit Socket.IO event
    const io = req.app.get("io");
    if (io) {
      console.log("📡 Broadcasting section deletion event...");
      io.emit("sectionMarksDeleted", {
        sectionId,
        count: marks.length,
        studentIds,
        timestamp: Date.now(),
      });
    }

    res.json({
      success: true,
      message: `تم حذف ${marks.length} علامة بنجاح`,
      data: {
        deletedCount: marks.length,
        sectionId,
        affectedStudents: studentIds.length,
      },
    });
  } catch (error) {
    console.error("❌ Error in deleteSectionMarks:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Delete marks for a specific student in a specific section
 * @route DELETE /api/daily-marks/student/:studentId/section/:sectionId
 */
exports.deleteStudentSectionMark = async (req, res) => {
  try {
    const { studentId, sectionId } = req.params;

    console.log(
      `🗑️ Deleting mark for student ${studentId} in section ${sectionId}`
    );

    // Find and delete the mark
    const mark = await Mark.findOneAndDelete({ studentId, sectionId });

    if (!mark) {
      return res.status(404).json({
        success: false,
        message: "العلامة غير موجودة",
      });
    }

    console.log("✅ Mark deleted successfully");

    // Update monthly average
    const section = await mark.sectionId;
    if (section && section.date) {
      const sectionDate = new Date(section.date);
      const month = sectionDate.getMonth() + 1;
      const year = sectionDate.getFullYear();

      try {
        await calculateAndUpdateMonthlyAverage(studentId, month, year);
        console.log("✅ Monthly average updated");
      } catch (avgError) {
        console.error("⚠️ Error updating monthly average:", avgError);
      }
    }

    // Emit Socket.IO event
    const io = req.app.get("io");
    if (io) {
      console.log("📡 Broadcasting mark deleted event...");
      io.emit("markDeleted", {
        markId: mark._id,
        studentId,
        sectionId,
        timestamp: Date.now(),
      });
    }

    res.json({
      success: true,
      message: "تم حذف العلامة بنجاح",
      data: {
        deletedId: mark._id,
        studentId,
        sectionId,
      },
    });
  } catch (error) {
    console.error("❌ Error in deleteStudentSectionMark:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
