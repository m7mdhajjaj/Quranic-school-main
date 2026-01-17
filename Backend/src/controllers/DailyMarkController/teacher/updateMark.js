// ============================================================================
// teacher/updateMark.js - Update Single Mark
// ============================================================================

const Mark = require("../../../schema/DailyMark/DailyMark");
const Section = require("../../../schema/DailyMark/Section");
const { notifyMarkUpdated } = require("../../../Notifications");
const { createLogger } = require("../../../utils/logger");

const logger = createLogger('UpdateMark');

// استيراد الدوال المساعدة
const {
  updateStudentMonthlyAverage,
  updateSingleSectionStatus,
  updateMultipleSectionsStatus,
  updateMultipleStudentsMonthlyAverage,
  emitSocketEvent,
  validateMarksArray,
  collectMarkIds,
} = require("../utils/markHelpers");

const {
  sendSuccess,
  sendError,
  sendValidationError,
  sendNotFound,
  sendCreated,
} = require("../utils/responseHelpers");

const { validateMarkEditWindow } = require("../utils/validationHelpers");

/**
 * Update or create a mark for a single student
 * @route POST /api/daily-marks
 * @body { studentId, sectionId, reviewMark, memorizationMark }
 */
exports.createOrUpdateMark = async (req, res) => {
  try {
    const markData = req.validatedData || req.body;

    logger.debug("📝 Creating/updating mark with data:", markData);

    const { studentId, sectionId, reviewMark, memorizationMark } = markData;

    if (!studentId || !sectionId) {
      return sendValidationError(res, "studentId و sectionId مطلوبة");
    }

    // ⏰ التحقق من نافذة التعديل الزمنية
    const section = await Section.findById(sectionId).select('date');
    if (!section) {
      return sendNotFound(res, "المقطع");
    }
    
    try {
      validateMarkEditWindow(section.date, 'add');
    } catch (windowError) {
      return sendValidationError(res, windowError.message);
    }

    // Check if mark already exists
    let mark = await Mark.findOne({
      studentId,
      sectionId,
    });

    const isNewMark = !mark;
    const oldTotalMark = mark
      ? (mark.reviewMark || 0) + (mark.memorizationMark || 0)
      : 0;

    if (mark) {
      // Update existing mark
      logger.debug("🔄 Updating existing mark");
      mark.reviewMark = reviewMark || null;
      mark.memorizationMark = memorizationMark || null;
      await mark.save();
    } else {
      // Create new mark
      logger.debug("✨ Creating new mark");
      mark = new Mark({
        studentId,
        sectionId,
        reviewMark: reviewMark || null,
        memorizationMark: memorizationMark || null,
      });
      await mark.save();
    }

    // Populate the references
    mark = await Mark.findById(mark._id)
      .populate("studentId", "firstName fatherName lastName group")
      .populate("sectionId");

    logger.debug("✅ تم حفظ العلامة بنجاح");

    const statusCode = isNewMark ? 201 : 200;
    const message = isNewMark ? "تم إضافة العلامة بنجاح" : "تم تحديث العلامة بنجاح";

    // Perform background tasks (Awaiting them to ensure UI gets fresh data immediately)
    // This fixes the "lagging progress bar" issue
    try {
        await Promise.all([
            updateStudentMonthlyAverage(mark.studentId._id, mark.sectionId),
            mark.sectionId && mark.sectionId._id ? updateSingleSectionStatus(mark.sectionId._id.toString()) : Promise.resolve(),
            notifyMarkUpdated(mark, req.app.get("io"), isNewMark, oldTotalMark, (mark.reviewMark || 0) + (mark.memorizationMark || 0)).catch(e => logger.error('Notification error:', e))
        ]);
        
        const io = req.app.get("io");
        const eventName = isNewMark ? "markCreated" : "markUpdated";
        emitSocketEvent(io, eventName, { mark, isNew: isNewMark });
    } catch (err) {
        logger.error("Background task error:", err);
        // Continue even if background tasks fail, main mark is saved
    }

    if (isNewMark) {
      sendCreated(res, mark, message);
    } else {
      sendSuccess(res, mark, message);
    }
  } catch (error) {
    logger.error("❌ Error in createOrUpdateMark:", error);

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
 * Update a mark by ID
 * @route PUT /api/daily-marks/:id
 * @body { reviewMark, memorizationMark }
 */
exports.updateMarkById = async (req, res) => {
  try {
    const { id } = req.params;
    const { reviewMark, memorizationMark } = req.body;

    logger.debug("📝 Updating mark by ID:", id);

    // Find the mark with section date
    let mark = await Mark.findById(id).populate("sectionId", "date");

    if (!mark) {
      return sendNotFound(res, "العلامة");
    }

    // ⏰ التحقق من نافذة التعديل الزمنية
    if (mark.sectionId && mark.sectionId.date) {
      try {
        validateMarkEditWindow(mark.sectionId.date, 'update');
      } catch (windowError) {
        return sendValidationError(res, windowError.message);
      }
    }

    const oldTotalMark = (mark.reviewMark || 0) + (mark.memorizationMark || 0);

    // Update mark
    if (reviewMark !== undefined) mark.reviewMark = reviewMark || null;
    if (memorizationMark !== undefined)
      mark.memorizationMark = memorizationMark || null;

    await mark.save();
    logger.debug("✅ تم تحديث العلامة بنجاح");

    // Populate the references
    mark = await Mark.findById(mark._id)
      .populate("studentId", "firstName fatherName lastName group")
      .populate("sectionId");

    // Update monthly average & section status
    await updateStudentMonthlyAverage(mark.studentId._id, mark.sectionId);
    if (mark.sectionId && mark.sectionId._id) {
      await updateSingleSectionStatus(mark.sectionId._id.toString());
    }

    // Send notification and Socket event
    const newTotalMark = (mark.reviewMark || 0) + (mark.memorizationMark || 0);
    logger.debug("🔔 إرسال الإشعار...");
    const io = req.app.get("io");
    await notifyMarkUpdated(mark, io, false, oldTotalMark, newTotalMark);
    
    emitSocketEvent(io, "markUpdated", { mark });

    res.json({
      success: true,
      data: mark,
      message: "تم تحديث العلامة بنجاح",
    });
  } catch (error) {
    logger.error("❌ Error in updateMarkById:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Update multiple marks at once
 * @route PUT /api/daily-marks/bulk
 * @body { marks: [{ id, reviewMark, memorizationMark }] }
 */
exports.updateMultipleMarks = async (req, res) => {
  try {
    const { marks } = req.body;

    logger.debug("📝 Updating multiple marks...");
    logger.debug(`📊 Number of marks: ${marks.length}`);

    // Validate using helper
    try {
      validateMarksArray(marks);
    } catch (validationError) {
      return sendValidationError(res, validationError.message);
    }

    const updatedMarks = [];

    // Update marks in bulk
    for (const markData of marks) {
      if (!markData.id) {
        logger.warn("Skipping mark without id");
        continue;
      }

      try {
        const mark = await Mark.findById(markData.id);
        if (!mark) {
          logger.warn(`Mark not found: ${markData.id}`);
          continue;
        }

        if (markData.reviewMark !== undefined)
          mark.reviewMark = markData.reviewMark || null;
        if (markData.memorizationMark !== undefined)
          mark.memorizationMark = markData.memorizationMark || null;

        await mark.save();
        updatedMarks.push(mark);
      } catch (error) {
        logger.warn(`Error updating mark ${markData.id}:`, error);
      }
    }

    logger.debug(`✅ Updated ${updatedMarks.length} marks`);

    // Collect IDs using helper
    const { studentIds, sectionIds } = collectMarkIds(updatedMarks);

    // Batch update: Monthly averages for all affected students
    if (studentIds.size > 0) {
      await updateMultipleStudentsMonthlyAverage(Array.from(studentIds));
    }

    // Batch update: Section marks status
    if (sectionIds.size > 0) {
      await updateMultipleSectionsStatus(Array.from(sectionIds));
    }

    // Emit Socket.IO event using helper
    const io = req.app.get("io");
    emitSocketEvent(io, "marksUpdated", {
      marks: updatedMarks,
      count: updatedMarks.length,
    });

    sendSuccess(res, updatedMarks, `تم تحديث ${updatedMarks.length} علامة بنجاح`);
  } catch (error) {
    logger.error("Error in updateMultipleMarks:", error);
    sendError(res, "حدث خطأ أثناء تحديث العلامات", 500, error);
  }
};
