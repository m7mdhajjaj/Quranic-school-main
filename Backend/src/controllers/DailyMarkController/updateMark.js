// ============================================================================
// updateMark.js - Update Single Mark
// ============================================================================

const Mark = require("../../schema/DailyMark");
const { notifyMarkUpdated } = require("../../Notifications/handlers/DailyMarks/dailyMarkNotifications");
const {
  calculateAndUpdateMonthlyAverage,
} = require("../../services/StudentAverageService");

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
      return res.status(400).json({
        success: false,
        message: "studentId و sectionId مطلوبة",
      });
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

    console.log("✅ Mark saved successfully");

    // Update monthly average
    if (mark.sectionId && mark.sectionId.date) {
      console.log("🔄 Updating monthly average...");
      const sectionDate = new Date(mark.sectionId.date);
      const month = sectionDate.getMonth() + 1;
      const year = sectionDate.getFullYear();

      try {
        await calculateAndUpdateMonthlyAverage(mark.studentId._id, month, year);
        console.log("✅ Monthly average updated");
      } catch (avgError) {
        console.error("⚠️ Error updating monthly average:", avgError);
      }
    }

    // Send notification
    const newTotalMark = (mark.reviewMark || 0) + (mark.memorizationMark || 0);
    console.log("🔔 Sending notification...");
    const io = req.app.get("io");
    await notifyMarkUpdated(mark, io, isNewMark, oldTotalMark, newTotalMark);

    // Emit Socket.IO event
    if (io) {
      console.log("📡 Broadcasting mark event...");
      const eventName = isNewMark ? "markCreated" : "markUpdated";
      io.emit(eventName, {
        mark,
        isNew: isNewMark,
        timestamp: Date.now(),
      });
      console.log(`✅ ${eventName} event emitted`);
    }

    const statusCode = isNewMark ? 201 : 200;
    const message = isNewMark ? "تم إضافة العلامة بنجاح" : "تم تحديث العلامة بنجاح";

    res.status(statusCode).json({
      success: true,
      data: mark,
      message,
      isNew: isNewMark,
    });
  } catch (error) {
    console.error("❌ Error in createOrUpdateMark:", error);

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
      return res.status(404).json({
        success: false,
        message: "العلامة غير موجودة",
      });
    }

    const oldTotalMark = (mark.reviewMark || 0) + (mark.memorizationMark || 0);

    // Update mark
    if (reviewMark !== undefined) mark.reviewMark = reviewMark || null;
    if (memorizationMark !== undefined)
      mark.memorizationMark = memorizationMark || null;

    await mark.save();
    console.log("✅ Mark updated successfully");

    // Populate the references
    mark = await Mark.findById(mark._id)
      .populate("studentId", "firstName fatherName lastName group")
      .populate("sectionId");

    // Update monthly average
    if (mark.sectionId && mark.sectionId.date) {
      const sectionDate = new Date(mark.sectionId.date);
      const month = sectionDate.getMonth() + 1;
      const year = sectionDate.getFullYear();

      try {
        await calculateAndUpdateMonthlyAverage(mark.studentId._id, month, year);
        console.log("✅ Monthly average updated");
      } catch (avgError) {
        console.error("⚠️ Error updating monthly average:", avgError);
      }
    }

    // Send notification
    const newTotalMark = (mark.reviewMark || 0) + (mark.memorizationMark || 0);
    console.log("🔔 Sending notification...");
    const io = req.app.get("io");
    await notifyMarkUpdated(mark, io, false, oldTotalMark, newTotalMark);

    // Emit Socket.IO event
    if (io) {
      console.log("📡 Broadcasting markUpdated event...");
      io.emit("markUpdated", {
        mark,
        timestamp: Date.now(),
      });
    }

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

    if (!Array.isArray(marks) || marks.length === 0) {
      return res.status(400).json({
        success: false,
        message: "marks يجب أن تكون قائمة غير فارغة",
      });
    }

    const updatedMarks = [];

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

    // Emit Socket.IO event
    const io = req.app.get("io");
    if (io) {
      console.log("📡 Broadcasting bulk update event...");
      io.emit("marksUpdated", {
        marks: updatedMarks,
        count: updatedMarks.length,
        timestamp: Date.now(),
      });
    }

    res.json({
      success: true,
      data: updatedMarks,
      message: `تم تحديث ${updatedMarks.length} علامة بنجاح`,
    });
  } catch (error) {
    console.error("❌ Error in updateMultipleMarks:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
