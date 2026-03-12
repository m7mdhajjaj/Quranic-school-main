// ============================================================================
// teacher/setMarks.js - Add/Update Marks for Multiple Students (Bulk Operation)
// ============================================================================

const Mark = require("../../../schema/DailyMark/DailyMark");
const Section = require("../../../schema/DailyMark/Section");
const { notifyMarksAdded } = require("../../../Notifications");
const { createLogger } = require("../../../utils/logger");

const logger = createLogger("SetMarks");

// استيراد الدوال المساعدة
const {
  updateMultipleStudentsMonthlyAverage,
  updateMultipleSectionsStatus,
  emitSocketEvent,
  collectMarkIds,
} = require("../utils/markHelpers");

const {
  sendSuccess,
  sendError,
  sendValidationError,
  sendCreated,
} = require("../utils/responseHelpers");

const {
  checkMarkEditWindow,
  validateMarksArray,
} = require("../utils/validationHelpers");

/**
 * Add or update marks for many students in one section
 * @route POST /api/daily-marks/bulk
 * @body { marks: [{ studentId, sectionId, reviewMark, memorizationMark }] }
 */
exports.setMarks = async (req, res) => {
  try {
    const marks = req.body.marks; // [{ studentId, sectionId, reviewMark, memorizationMark }]

    logger.debug("📝 Setting marks for multiple students...");
    logger.debug(`📊 Number of students: ${marks.length}`);

    // Validate marks array using helper
    try {
      validateMarksArray(marks);
    } catch (validationError) {
      return sendValidationError(res, validationError.message);
    }

    // ⏰ التحقق من نافذة التعديل الزمنية لكل الـ sections المتأثرة
    const uniqueSectionIds = [
      ...new Set(marks.map((m) => m.sectionId?.toString()).filter(Boolean)),
    ];
    if (uniqueSectionIds.length > 0) {
      const sections = await Section.find({
        _id: { $in: uniqueSectionIds },
      }).select("date");
      const sectionsMap = new Map(sections.map((s) => [s._id.toString(), s]));

      // التحقق من كل section
      for (const sectionId of uniqueSectionIds) {
        const section = sectionsMap.get(sectionId);
        if (section) {
          const windowCheck = checkMarkEditWindow(section.date, "add");
          if (!windowCheck.isAllowed) {
            return sendValidationError(res, windowCheck.reason);
          }
        }
      }
    }

    // Validate each mark
    const validatedMarks = [];
    for (const mark of marks) {
      if (!mark.studentId || !mark.sectionId) {
        return sendValidationError(
          res,
          "studentId و sectionId مطلوبة لكل علامة",
        );
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

    logger.debug("🔄 Performing bulk write operation...");
    await Mark.bulkWrite(operations);
    logger.debug("✅ Bulk write completed successfully");

    // Collect IDs using helper
    const { studentIds, sectionIds } = collectMarkIds(validatedMarks);

    // Fetch updated marks - FILTER BY BOTH sectionIds AND studentIds
    // This prevents returning marks for all students in the section
    const updatedMarks = await Mark.find({
      sectionId: { $in: Array.from(sectionIds) },
      studentId: { $in: Array.from(studentIds) },
    })
      .populate("studentId", "firstName fatherName lastName group")
      .populate("sectionId");

    // Send response IMMEDIATELY - don't block on background tasks
    const io = req.app.get("io");
    emitSocketEvent(io, "markCreated", {
      marks: updatedMarks,
      count: updatedMarks.length,
    });

    sendCreated(
      res,
      updatedMarks,
      `تم إضافة/تحديث ${updatedMarks.length} علامة بنجاح`,
    );

    // Fire background tasks WITHOUT awaiting (non-blocking)
    Promise.all([
      updateMultipleStudentsMonthlyAverage(Array.from(studentIds)),
      updateMultipleSectionsStatus(Array.from(sectionIds)),
      notifyMarksAdded(updatedMarks, io).catch((e) =>
        logger.error("Notification error:", e),
      ),
    ]).catch((err) => logger.error("Background task error:", err));
  } catch (error) {
    logger.error("❌ Error in setMarks:", error);

    if (error.name === "ValidationError") {
      const validationErrors = Object.keys(error.errors)
        .map((field) => `${field}: ${error.errors[field].message}`)
        .join(", ");
      return sendValidationError(
        res,
        `خطأ في التحقق من البيانات: ${validationErrors}`,
      );
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

    logger.debug("📝 Setting marks for section:", sectionId);
    logger.debug(`📊 Number of students: ${marks.length}`);

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
      res,
    );
  } catch (error) {
    logger.error("Error in setMarksForSection:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
