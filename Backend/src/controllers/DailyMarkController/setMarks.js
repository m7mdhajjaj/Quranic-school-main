// ============================================================================
// setMarks.js - Add/Update Marks for Multiple Students (Bulk Operation)
// ============================================================================

const Mark = require("../../schema/DailyMark");
const { notifyMarksAdded } = require("./dailyMarkNotifications");
const {
  calculateAndUpdateMonthlyAverage,
} = require("../../services/StudentAverageService");

/**
 * Add or update marks for many students in one section
 * @route POST /api/daily-marks/bulk
 * @body { marks: [{ studentId, sectionId, reviewMark, memorizationMark }] }
 */
exports.setMarks = async (req, res) => {
  try {
    const marks = req.body.marks; // [{ studentId, sectionId, reviewMark, memorizationMark }]

    console.log("📝 Setting marks for multiple students...");
    console.log(`📊 Number of students: ${marks.length}`);

    if (!Array.isArray(marks) || marks.length === 0) {
      return res.status(400).json({
        success: false,
        message: "marks يجب أن تكون قائمة غير فارغة",
      });
    }

    // Validate each mark
    const validatedMarks = [];
    for (const mark of marks) {
      if (!mark.studentId || !mark.sectionId) {
        return res.status(400).json({
          success: false,
          message: "studentId و sectionId مطلوبة لكل علامة",
        });
      }
      validatedMarks.push(mark);
    }

    // Bulk write operation
    const operations = validatedMarks.map((m) => ({
      updateOne: {
        filter: { studentId: m.studentId, sectionId: m.sectionId },
        update: {
          $set: {
            reviewMark: m.reviewMark || null,
            memorizationMark: m.memorizationMark || null,
          },
        },
        upsert: true,
      },
    }));

    console.log("🔄 Performing bulk write operation...");
    await Mark.bulkWrite(operations);
    console.log("✅ Bulk write completed successfully");

    // Fetch updated marks
    const sectionIds = [...new Set(validatedMarks.map((m) => m.sectionId))];
    const updatedMarks = await Mark.find({
      sectionId: { $in: sectionIds },
    })
      .populate("studentId", "firstName fatherName lastName group")
      .populate("sectionId");

    // Update monthly averages for all affected students
    console.log("🔄 Updating monthly averages...");
    const studentIds = [...new Set(validatedMarks.map((m) => m.studentId))];
    const updatePromises = studentIds.map(async (studentId) => {
      try {
        // نحسب متوسط الشهر الحالي
        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();
        await calculateAndUpdateMonthlyAverage(studentId, month, year);
      } catch (error) {
        console.error(`⚠️ Error updating average for student ${studentId}:`, error);
      }
    });
    await Promise.all(updatePromises);
    console.log("✅ Monthly averages updated");

    // 🔔 Send notifications to students
    console.log("🔔 Sending notifications...");
    const io = req.app.get("io");
    await notifyMarksAdded(validatedMarks, io);
    console.log("✅ Notifications sent");

    // 🔌 Emit Socket.IO event
    if (io) {
      console.log("📡 Broadcasting markCreated event...");
      io.emit("markCreated", {
        marks: updatedMarks,
        count: updatedMarks.length,
        timestamp: Date.now(),
      });
      console.log("✅ Event emitted");
    }

    res.status(201).json({
      success: true,
      data: updatedMarks,
      message: `تم إضافة/تحديث ${updatedMarks.length} علامة بنجاح`,
    });
  } catch (error) {
    console.error("❌ Error in setMarks:", error);

    if (error.name === "ValidationError") {
      const validationErrors = Object.keys(error.errors)
        .map((field) => `${field}: ${error.errors[field].message}`)
        .join(", ");

      return res.status(400).json({
        success: false,
        message: `خطأ في التحقق من البيانات: ${validationErrors}`,
      });
    }

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Add or update marks for a specific section
 * @route POST /api/daily-marks/section/:sectionId
 * @body { marks: [{ studentId, reviewMark, memorizationMark }] }
 */
exports.setMarksForSection = async (req, res) => {
  try {
    const { sectionId } = req.params;
    const marks = req.body.marks;

    console.log("📝 Setting marks for section:", sectionId);
    console.log(`📊 Number of students: ${marks.length}`);

    if (!Array.isArray(marks) || marks.length === 0) {
      return res.status(400).json({
        success: false,
        message: "marks يجب أن تكون قائمة غير فارغة",
      });
    }

    // Transform marks to include sectionId
    const transformedMarks = marks.map((m) => ({
      ...m,
      sectionId,
    }));

    // Reuse setMarks logic
    return exports.setMarks(
      {
        body: { marks: transformedMarks },
        app: {
          get: (key) => (key === "io" ? req.app.get("io") : null),
        },
      },
      res
    );
  } catch (error) {
    console.error("❌ Error in setMarksForSection:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
