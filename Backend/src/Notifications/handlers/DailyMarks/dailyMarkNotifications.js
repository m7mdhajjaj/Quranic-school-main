// ============================================================================
// dailyMarkNotifications.js - Daily Mark Notifications System
// ============================================================================

const Notification = require("../../../schema/Notification");

/**
 * Send notification when a single mark is added
 * @param {Object} mark - The mark document with populated references
 * @param {Object} io - Socket.IO instance
 */
exports.notifyMarkAdded = async (mark, io) => {
  try {
    console.log("🔔 ========== MARK NOTIFICATION START (ADD) ==========");

    const student = mark.studentId;
    const section = mark.sectionId;

    if (!student || !section) {
      console.warn("⚠️ Missing student or section data");
      return;
    }

    const totalMark = (mark.reviewMark || 0) + (mark.memorizationMark || 0);
    const studentName = `${student.firstName} ${student.fatherName || ""} ${
      student.lastName || ""
    }`.trim();
    const sectionDate = new Date(section.date).toLocaleDateString("ar-SA");

    const notificationData = {
      recipient: student._id,
      recipientModel: "Student",
      type: "daily_marks",
      title: "📊 علامة جديدة",
      message: `تم إضافة علامتك في ${sectionDate}: ${totalMark} درجة`,
      data: {
        action: "mark_added",
        studentId: student._id,
        studentName,
        sectionId: section._id,
        sectionDate,
        reviewMark: mark.reviewMark || 0,
        memorizationMark: mark.memorizationMark || 0,
        totalMark,
      },
      priority: "high",
      isRead: false,
    };

    // Save notification to database
    await Notification.create(notificationData);

    console.log(`📝 Notification created for student ${studentName}`);
    console.log(
      `📊 Mark: ${totalMark} (Review: ${mark.reviewMark || 0}, Memorization: ${
        mark.memorizationMark || 0
      })`
    );

    // Emit via Socket.IO
    if (io) {
      io.to(`student_${student._id}`).emit("newNotification", notificationData);
      console.log(`✅ Socket notification sent to student ${student._id}`);
    }

    console.log("🔔 ========== MARK NOTIFICATION END (SUCCESS) ==========\n");
  } catch (error) {
    console.error("❌ Error in notifyMarkAdded:", error);
  }
};

/**
 * Send notifications for multiple marks added at once
 * @param {Array} marks - Array of mark objects with populated references
 * @param {Object} io - Socket.IO instance
 */
exports.notifyMarksAdded = async (marks, io) => {
  try {
    console.log("🔔 ========== BULK MARKS NOTIFICATION START ==========");
    console.log(`📝 Adding notifications for ${marks.length} marks`);

    const notifications = [];

    for (const markData of marks) {
      // Find the actual mark document
      const Mark = require("../../../schema/DailyMark");
      const mark = await Mark.findOne({
        studentId: markData.studentId,
        sectionId: markData.sectionId,
      })
        .populate("studentId", "firstName fatherName lastName group")
        .populate("sectionId", "date memorizationSection reviewSection");

      if (!mark || !mark.studentId) {
        console.warn(
          `⚠️ Mark not found or missing student: ${markData.studentId}`
        );
        continue;
      }

      const student = mark.studentId;
      const section = mark.sectionId;
      const totalMark = (mark.reviewMark || 0) + (mark.memorizationMark || 0);
      const studentName = `${student.firstName} ${student.fatherName || ""} ${
        student.lastName || ""
      }`.trim();
      const sectionDate = new Date(section.date).toLocaleDateString("ar-SA");

      const notificationData = {
        recipient: student._id,
        recipientModel: "Student",
        type: "daily_marks",
        title: "📊 علامة جديدة",
        message: `تم إضافة علامتك في ${sectionDate}: ${totalMark} درجة`,
        data: {
          action: "mark_added",
          studentId: student._id,
          studentName,
          sectionId: section._id,
          sectionDate,
          reviewMark: mark.reviewMark || 0,
          memorizationMark: mark.memorizationMark || 0,
          totalMark,
        },
        priority: "high",
        isRead: false,
      };

      notifications.push(notificationData);

      console.log(`✅ Notification prepared for ${studentName}`);

      // Emit via Socket.IO
      if (io) {
        io.to(`student_${student._id}`).emit(
          "newNotification",
          notificationData
        );
      }
    }

    // Save all notifications to database in bulk
    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
      console.log(`📤 Saved ${notifications.length} notifications to database`);
    }

    console.log(
      "🔔 ========== BULK MARKS NOTIFICATION END (SUCCESS) ==========\n"
    );
  } catch (error) {
    console.error("❌ Error in notifyMarksAdded:", error);
  }
};

/**
 * Send notification when a mark is updated
 * @param {Object} mark - The mark document with populated references
 * @param {Object} io - Socket.IO instance
 * @param {Boolean} isNew - Is this a new mark
 * @param {Number} oldTotalMark - Old total mark (for updates)
 * @param {Number} newTotalMark - New total mark
 */
exports.notifyMarkUpdated = async (
  mark,
  io,
  isNew = false,
  oldTotalMark = 0,
  newTotalMark = 0
) => {
  try {
    console.log("🔔 ========== MARK NOTIFICATION START (UPDATE) ==========");

    const student = mark.studentId;
    const section = mark.sectionId;

    if (!student || !section) {
      console.warn("⚠️ Missing student or section data");
      return;
    }

    const studentName = `${student.firstName} ${student.fatherName || ""} ${
      student.lastName || ""
    }`.trim();
    const sectionDate = new Date(section.date).toLocaleDateString("ar-SA");

    let title = "📊 علامة جديدة";
    let messagePrefix = "تم إضافة";
    if (!isNew) {
      title = "✏️ تم تحديث علامتك";
      messagePrefix = "تم تحديث";
    }

    const notificationData = {
      recipient: student._id,
      recipientModel: "Student",
      type: "daily_marks",
      title,
      message: `${messagePrefix} علامتك في ${sectionDate}: ${newTotalMark} درجة`,
      data: {
        action: isNew ? "mark_added" : "mark_updated",
        studentId: student._id,
        studentName,
        sectionId: section._id,
        sectionDate,
        reviewMark: mark.reviewMark || 0,
        memorizationMark: mark.memorizationMark || 0,
        totalMark: newTotalMark,
        oldTotalMark: oldTotalMark,
        isUpdate: !isNew,
      },
      priority: "high",
      isRead: false,
    };

    // Save notification to database
    await Notification.create(notificationData);

    console.log(`📝 Notification created for student ${studentName}`);
    console.log(`📊 Old Mark: ${oldTotalMark}, New Mark: ${newTotalMark}`);

    // Emit via Socket.IO
    if (io) {
      io.to(`student_${student._id}`).emit("newNotification", notificationData);
      console.log(`✅ Socket notification sent to student ${student._id}`);
    }

    console.log("🔔 ========== MARK NOTIFICATION END (SUCCESS) ==========\n");
  } catch (error) {
    console.error("❌ Error in notifyMarkUpdated:", error);
  }
};

/**
 * Send notification when a mark is deleted
 * @param {Object} mark - The mark document with populated references
 * @param {Object} io - Socket.IO instance
 */
exports.notifyMarkDeleted = async (mark, io) => {
  try {
    console.log("🔔 ========== MARK NOTIFICATION START (DELETE) ==========");

    const student = mark.studentId;
    const section = mark.sectionId;

    if (!student || !section) {
      console.warn("⚠️ Missing student or section data");
      return;
    }

    const studentName = `${student.firstName} ${student.fatherName || ""} ${
      student.lastName || ""
    }`.trim();
    const sectionDate = new Date(section.date).toLocaleDateString("ar-SA");
    const totalMark = (mark.reviewMark || 0) + (mark.memorizationMark || 0);

    const notificationData = {
      recipient: student._id,
      recipientModel: "Student",
      type: "daily_marks",
      title: "🗑️ تم حذف علامة",
      message: `تم حذف علامتك من ${sectionDate} (كانت: ${totalMark} درجة)`,
      data: {
        action: "mark_deleted",
        studentId: student._id,
        studentName,
        sectionId: section._id,
        sectionDate,
        deletedMark: totalMark,
      },
      priority: "medium",
      isRead: false,
    };

    // Save notification to database
    await Notification.create(notificationData);

    console.log(`📝 Notification created for student ${studentName}`);
    console.log(`🗑️ Deleted Mark: ${totalMark}`);

    // Emit via Socket.IO
    if (io) {
      io.to(`student_${student._id}`).emit("newNotification", notificationData);
      console.log(`✅ Socket notification sent to student ${student._id}`);
    }

    console.log("🔔 ========== MARK NOTIFICATION END (SUCCESS) ==========\n");
  } catch (error) {
    console.error("❌ Error in notifyMarkDeleted:", error);
  }
};

/**
 * Notify a student about their marks for a specific section
 * @param {String} studentId - Student ID
 * @param {String} sectionId - Section ID
 * @param {Object} mark - Mark object
 * @param {Object} io - Socket.IO instance
 */
exports.notifyStudentMarks = async (studentId, sectionId, mark, io) => {
  try {
    const Mark = require("../../../schema/DailyMark");
    const markDoc = await Mark.findOne({
      studentId,
      sectionId,
    })
      .populate("studentId", "firstName fatherName lastName group")
      .populate("sectionId");

    if (!markDoc) {
      console.warn(
        `⚠️ Mark not found for student ${studentId} in section ${sectionId}`
      );
      return;
    }

    await exports.notifyMarkUpdated(markDoc, io, false);
  } catch (error) {
    console.error("❌ Error in notifyStudentMarks:", error);
  }
};
