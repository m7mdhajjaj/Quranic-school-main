// ============================================================================
// setMarks.js - Add/Update Marks for Multiple Students (Bulk Operation)
// ============================================================================

const Mark = require("../../schema/DailyMark/DailyMark");
const { notifyMarksAdded } = require("../../Notifications");

// استيراد الدوال المساعدة
const {
  updateMultipleStudentsMonthlyAverage,
  updateMultipleSectionsStatus,
  emitSocketEvent,
  validateMarksArray,
  collectMarkIds,
} = require("./utils/markHelpers");

const {
  sendSuccess,
  sendError,
  sendValidationError,
  sendCreated,
} = require("./utils/responseHelpers");

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

    // Validate marks array using helper
    try {
      validateMarksArray(marks);
    } catch (validationError) {
      return sendValidationError(res, validationError.message);
    }

    // Validate each mark
    const validatedMarks = [];
    for (const mark of marks) {
      if (!mark.studentId || !mark.sectionId) {
        return sendValidationError(res, "studentId و sectionId مطلوبة لكل علامة");
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

    // Collect IDs using helper
    const { studentIds, sectionIds } = collectMarkIds(validatedMarks);
    
    // Fetch updated marks
    const updatedMarks = await Mark.find({
      sectionId: { $in: Array.from(sectionIds) },
    })
      .populate("studentId", "firstName fatherName lastName group")
      .populate("sectionId");

    // Update monthly averages for all affected students
    await updateMultipleStudentsMonthlyAverage(Array.from(studentIds));

    // Update marks status for all affected sections
    await updateMultipleSectionsStatus(Array.from(sectionIds));

    // 🔔 Send notifications to students
    console.log("🔔 إرسال الإشعارات...");
    const io = req.app.get("io");
    // Use updatedMarks because it has populated sectionId and studentId
    await notifyMarksAdded(updatedMarks, io);
    console.log("✅ تم إرسال الإشعارات");

    // 🔌 Emit Socket.IO event
    emitSocketEvent(io, "markCreated", {
      marks: updatedMarks,
      count: updatedMarks.length,
    });

    sendCreated(res, updatedMarks, `تم إضافة/تحديث ${updatedMarks.length} علامة بنجاح`);
  } catch (error) {
    console.error("❌ Error in setMarks:", error);

    if (error.name === "ValidationError") {
      const validationErrors = Object.keys(error.errors)
        .map((field) => `${field}: ${error.errors[field].message}`)
        .join(", ");
      return sendValidationError(res, `خطأ في التحقق من البيانات: ${validationErrors}`);
    }

    sendError(res, error.message, 500, error);
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
