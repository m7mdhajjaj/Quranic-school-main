// ============================================================================
// updateMark.js - Update Single Mark
// ============================================================================

const Mark = require("../../schema/DailyMark/DailyMark");
const { notifyMarkUpdated } = require("../../Notifications");

// استيراد الدوال المساعدة
const {
  updateStudentMonthlyAverage,
  updateSingleSectionStatus,
  updateMultipleSectionsStatus,
  updateMultipleStudentsMonthlyAverage,
  emitSocketEvent,
  validateMarksArray,
  collectMarkIds,
} = require("./utils/markHelpers");

const {
  sendSuccess,
  sendError,
  sendValidationError,
  sendNotFound,
  sendCreated,
} = require("./utils/responseHelpers");

/**
 * Update or create a mark for a single student
 * @route POST /api/daily-marks
 * @body { studentId, sectionId, reviewMark, memorizationMark }
 */
exports.createOrUpdateMark = async (req, res) => {
  try {
    const markData = req.validatedData || req.body;

    console.log("📝 Creating/updating mark with data:", markData);

    const { studentId, sectionId, reviewMark, memorizationMark } = markData;

    if (!studentId || !sectionId) {
      return sendValidationError(res, "studentId و sectionId مطلوبة");
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
      console.log("🔄 Updating existing mark");
      mark.reviewMark = reviewMark || null;
      mark.memorizationMark = memorizationMark || null;
      await mark.save();
    } else {
      // Create new mark
      console.log("✨ Creating new mark");
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

    console.log("✅ تم حفظ العلامة بنجاح");

    // Send response immediately
    const statusCode = isNewMark ? 201 : 200;
    const message = isNewMark ? "تم إضافة العلامة بنجاح" : "تم تحديث العلامة بنجاح";
    
    if (isNewMark) {
      sendCreated(res, mark, message);
    } else {
      sendSuccess(res, mark, message);
    }

    // Perform background tasks (Non-blocking)
    // Using immediate execution without awaiting
    Promise.all([
      updateStudentMonthlyAverage(mark.studentId._id, mark.sectionId),
      mark.sectionId && mark.sectionId._id ? updateSingleSectionStatus(mark.sectionId._id.toString()) : Promise.resolve(),
      notifyMarkUpdated(mark, req.app.get("io"), isNewMark, oldTotalMark, (mark.reviewMark || 0) + (mark.memorizationMark || 0)).catch(e => console.error('Notification error:', e))
    ]).then(() => {
        const io = req.app.get("io");
        const eventName = isNewMark ? "markCreated" : "markUpdated";
        emitSocketEvent(io, eventName, { mark, isNew: isNewMark });
    }).catch(err => console.error("Background task error:", err));

    sendSuccess(res, mark, message, statusCode, { isNew: isNewMark });
  } catch (error) {
    console.error("❌ Error in createOrUpdateMark:", error);

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

    console.log("📝 Updating mark by ID:", id);

    // Find the mark
    let mark = await Mark.findById(id);

    if (!mark) {
      return sendNotFound(res, "العلامة");
    }

    const oldTotalMark = (mark.reviewMark || 0) + (mark.memorizationMark || 0);

    // Update mark
    if (reviewMark !== undefined) mark.reviewMark = reviewMark || null;
    if (memorizationMark !== undefined)
      mark.memorizationMark = memorizationMark || null;

    await mark.save();
    console.log("✅ تم تحديث العلامة بنجاح");

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
    console.log("🔔 إرسال الإشعار...");
    const io = req.app.get("io");
    await notifyMarkUpdated(mark, io, false, oldTotalMark, newTotalMark);
    
    emitSocketEvent(io, "markUpdated", { mark });

    res.json({
      success: true,
      data: mark,
      message: "تم تحديث العلامة بنجاح",
    });
  } catch (error) {
    console.error("❌ Error in updateMarkById:", error);
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

    console.log("📝 Updating multiple marks...");
    console.log(`📊 Number of marks: ${marks.length}`);

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
        console.warn("⚠️ Skipping mark without id");
        continue;
      }

      try {
        const mark = await Mark.findById(markData.id);
        if (!mark) {
          console.warn(`⚠️ Mark not found: ${markData.id}`);
          continue;
        }

        if (markData.reviewMark !== undefined)
          mark.reviewMark = markData.reviewMark || null;
        if (markData.memorizationMark !== undefined)
          mark.memorizationMark = markData.memorizationMark || null;

        await mark.save();
        updatedMarks.push(mark);
      } catch (error) {
        console.error(`⚠️ Error updating mark ${markData.id}:`, error);
      }
    }

    console.log(`✅ Updated ${updatedMarks.length} marks`);

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
    console.error("❌ Error in updateMultipleMarks:", error);
    sendError(res, "حدث خطأ أثناء تحديث العلامات", 500, error);
  }
};