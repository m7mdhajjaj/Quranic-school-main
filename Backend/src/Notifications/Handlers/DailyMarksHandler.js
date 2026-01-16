const Notification = require("../../schema/Notification");
const Student = require("../../schema/Student");
const Group = require("../../schema/Group");
const mongoose = require("mongoose");
const { sendRealTimeNotification } = require("../Core/SocketSender");
const { sendPushNotification } = require("../Core/PushSender");
const { TIMEZONE } = require('../../config/timezone');

/**
 * Notify all students in a group about a new section
 * @param {Object} section - The created section
 * @param {Object} io - Socket.io instance
 */
exports.notifySectionAdded = async (section, io) => {
  try {
    console.log(`🔔 notifySectionAdded called for group: ${section?.group}`);
    if (!section || !section.group) return;

    let students = [];
    const groupIdentifier = section.group;
    let groupName = section.group;

    // Resolve Group Name if it is an ID
    if (mongoose.Types.ObjectId.isValid(groupIdentifier)) {
        const groupDoc = await Group.findById(groupIdentifier);
        if (groupDoc) {
            groupName = groupDoc.name;
        }
    }

    // 1. Try direct match (Name or ID)
    students = await Student.find({ group: groupIdentifier });

    // 2. If no students found and it looks like an ObjectId, try finding by Name
    if (students.length === 0 && mongoose.Types.ObjectId.isValid(groupIdentifier)) {
      const groupDoc = await Group.findById(groupIdentifier);
      if (groupDoc) {
        console.log(`🔄 Found group name '${groupDoc.name}' for ID ${groupIdentifier}, searching students...`);
        students = await Student.find({ group: groupDoc.name });
        // groupName is already set above
      }
    }

    // 3. If still no students and it looks like a Name, try finding by ID (unlikely but possible if schema changed)
    if (students.length === 0 && !mongoose.Types.ObjectId.isValid(groupIdentifier)) {
       const groupDoc = await Group.findOne({ name: groupIdentifier });
       if (groupDoc) {
          // Maybe some students have the ID stored?
          const studentsById = await Student.find({ group: groupDoc._id.toString() });
          students = [...students, ...studentsById];
          groupName = groupDoc.name;
       }
    }

    console.log(`🔔 Found ${students.length} students in group ${groupIdentifier}`);

    if (!students.length) return;

    const dateStr = new Date(section.date).toLocaleDateString("ar-EG", { timeZone: TIMEZONE });

    const notifications = students.map((student) => ({
      recipient: student._id,
      recipientModel: "Student",
      type: "daily_marks",
      category: "academic",
      title: "مقطع جديد",
      message: `تم إضافة مقطع بتاريخ ${dateStr}`,
      messageSummary: `مقطع - ${dateStr}`,
      data: {
        sectionId: section._id,
        action: "section_added",
        entityType: "section",
        date: section.date,
      },
    }));

    // Process notifications in parallel for better performance
    const notificationPromises = notifications.map(async (noteData) => {
        try {
            const notification = new Notification(noteData);
            await notification.save();

            // Fire and forget mechanism for better performance
            const tasks = [];
            if (io) tasks.push(sendRealTimeNotification(io, notification));
            tasks.push(sendPushNotification(noteData.recipient, notification));
            
            await Promise.allSettled(tasks); // Use allSettled to prevent one failure from stopping others
        } catch (err) {
            console.error(`Failed to send notification to ${noteData.recipient}:`, err);
        }
    });

    await Promise.all(notificationPromises);
    
    console.log(`🔔 Sent section added notifications to ${students.length} students`);
  } catch (error) {
    console.error("❌ Error in notifySectionAdded:", error);
  }
};

/**
 * Notify all students in a group about an updated section
 * @param {Object} section - The updated section
 * @param {Object} oldSection - The old section data
 * @param {Object} io - Socket.io instance
 */
exports.notifySectionUpdated = async (section, oldSection, io) => {
  try {
    if (!section || !section.group) return;

    // ... (rest of logic same as added) -> Optimize below
    let students = [];
    const groupIdentifier = section.group;
    let groupName = section.group;

    // Optimized Group Lookup
    // ... (Keep existing lookup for backward compatibility but maybe optimize later if needed)
    // For now we trust the logic but optimize notification dispatch

    // Resolve Group Name if it is an ID
    if (mongoose.Types.ObjectId.isValid(groupIdentifier)) {
        const groupDoc = await Group.findById(groupIdentifier);
        if (groupDoc) {
            groupName = groupDoc.name;
        }
    }

    // 1. Try direct match (Name or ID)
    students = await Student.find({ group: groupIdentifier });

    // 2. If no students found and it looks like an ObjectId, try finding by Name
    if (students.length === 0 && mongoose.Types.ObjectId.isValid(groupIdentifier)) {
      const groupDoc = await Group.findById(groupIdentifier);
      if (groupDoc) {
        students = await Student.find({ group: groupDoc.name });
      }
    }

    // 3. Last resort
    if (students.length === 0 && !mongoose.Types.ObjectId.isValid(groupIdentifier)) {
       const groupDoc = await Group.findOne({ name: groupIdentifier });
       if (groupDoc) {
          const studentsById = await Student.find({ group: groupDoc._id.toString() });
          students = [...students, ...studentsById];
          groupName = groupDoc.name;
       }
    }

    if (!students.length) return;

    const dateStr = new Date(section.date).toLocaleDateString("ar-EG", { timeZone: TIMEZONE });

    const notifications = students.map((student) => ({
      recipient: student._id,
      recipientModel: "Student",
      type: "daily_marks",
      category: "academic",
      title: "تحديث مقطع",
      message: `تم تحديث مقطع بتاريخ ${dateStr}`,
      messageSummary: `تحديث - ${dateStr}`,
      data: {
        sectionId: section._id,
        action: "section_updated",
        entityType: "section",
      },
    }));

    // Parallel Processing
    const notificationPromises = notifications.map(async (noteData) => {
        try {
            const notification = new Notification(noteData);
            await notification.save();

            const tasks = [];
            if (io) tasks.push(sendRealTimeNotification(io, notification));
            tasks.push(sendPushNotification(noteData.recipient, notification));
            
            await Promise.allSettled(tasks);
        } catch (err) {
             console.error(`Failed to send update notification to ${noteData.recipient}:`, err);
        }
    });

    await Promise.all(notificationPromises);
    
    console.log(`🔔 Sent section updated notifications to ${students.length} students`);
  } catch (error) {
    console.error("❌ Error in notifySectionUpdated:", error);
  }
};

exports.notifySectionDeleted = async (section, io) => {
  try {
    if (!section || !section.group) return;

    let students = [];
    const groupIdentifier = section.group;
    let groupName = section.group;

    // Resolve Group Name if it is an ID
    if (mongoose.Types.ObjectId.isValid(groupIdentifier)) {
        const groupDoc = await Group.findById(groupIdentifier);
        if (groupDoc) {
            groupName = groupDoc.name;
        }
    }

    // 1. Try direct match (Name or ID)
    students = await Student.find({ group: groupIdentifier });

    // 2. If no students found and it looks like an ObjectId, try finding by Name
    if (students.length === 0 && mongoose.Types.ObjectId.isValid(groupIdentifier)) {
      const groupDoc = await Group.findById(groupIdentifier);
      if (groupDoc) {
        students = await Student.find({ group: groupDoc.name });
      }
    }

    // 3. If still no students and it looks like a Name, try finding by ID
    if (students.length === 0 && !mongoose.Types.ObjectId.isValid(groupIdentifier)) {
       const groupDoc = await Group.findOne({ name: groupIdentifier });
       if (groupDoc) {
          const studentsById = await Student.find({ group: groupDoc._id.toString() });
          students = [...students, ...studentsById];
          groupName = groupDoc.name;
       }
    }

    if (!students.length) return;

    const dateStr = new Date(section.date).toLocaleDateString("ar-EG", { timeZone: TIMEZONE });

    const notifications = students.map((student) => ({
      recipient: student._id,
      recipientModel: "Student",
      type: "daily_marks",
      title: "حذف مقطع",
      message: `تم حذف مقطع بتاريخ ${dateStr}`,
      data: {
        sectionId: section._id,
        action: "section_deleted",
      },
    }));

    for (const noteData of notifications) {
      const notification = new Notification(noteData);
      await notification.save();

      if (io) {
        await sendRealTimeNotification(io, notification);
      }

      await sendPushNotification(noteData.recipient, notification);
    }
    
    console.log(`🔔 Sent section deleted notifications to ${students.length} students`);
  } catch (error) {
    console.error("❌ Error in notifySectionDeleted:", error);
  }
};

exports.notifyStudentAboutSection = async (studentId, section, io) => {
  // Implementation if needed
};

/**
 * Notify a student about a new mark
 * @param {Object} mark - The created mark
 * @param {Object} io - Socket.io instance
 */
exports.notifyMarkAdded = async (mark, io) => {
  try {
    if (!mark || !mark.studentId) return;

    // Ensure we use the ID string, not the populated object
    const recipientId = mark.studentId._id ? mark.studentId._id.toString() : mark.studentId.toString();

    // Extract section details if available
    let dateStr = "";
    let sectionInfo = "";
    
    if (mark.sectionId && mark.sectionId.date) {
        dateStr = new Date(mark.sectionId.date).toLocaleDateString("ar-EG", { timeZone: TIMEZONE });
        sectionInfo = ` (مقطع: ${mark.sectionId.memorizationSection} / ${mark.sectionId.reviewSection})`;
    }

    const notification = new Notification({
      recipient: recipientId,
      recipientModel: "Student",
      type: "daily_marks", // or 'grade'
      title: "علامة جديدة",
      message: `تم رصد علامة جديدة بتاريخ ${dateStr}: حفظ ${mark.memorizationMark || '-'}، مراجعة ${mark.reviewMark || '-'}${sectionInfo}`,
      data: {
        markId: mark._id,
        sectionId: mark.sectionId._id || mark.sectionId,
        action: "mark_added",
      },
    });

    await notification.save();

    if (io) {
      await sendRealTimeNotification(io, notification);
    }

    await sendPushNotification(recipientId, notification);
    
    console.log(`🔔 Sent mark added notification to student ${recipientId}`);
  } catch (error) {
    console.error("❌ Error in notifyMarkAdded:", error);
  }
};

/**
 * Notify multiple students about new marks (Bulk)
 * @param {Array} marks - Array of created marks
 * @param {Object} io - Socket.io instance
 */
exports.notifyMarksAdded = async (marks, io) => {
  try {
    if (!marks || !marks.length) return;

    console.log(`🔔 Processing bulk mark notifications for ${marks.length} marks`);

    for (const mark of marks) {
      await exports.notifyMarkAdded(mark, io);
    }
  } catch (error) {
    console.error("❌ Error in notifyMarksAdded:", error);
  }
};

/**
 * Notify a student about an updated mark
 * @param {Object} mark - The updated mark
 * @param {Object} io - Socket.io instance
 */
exports.notifyMarkUpdated = async (mark, io) => {
  try {
    if (!mark || !mark.studentId) return;

    // Ensure we use the ID string, not the populated object
    const recipientId = mark.studentId._id ? mark.studentId._id.toString() : mark.studentId.toString();

    // Extract section details if available
    let dateStr = "";
    
    if (mark.sectionId && mark.sectionId.date) {
        dateStr = new Date(mark.sectionId.date).toLocaleDateString("ar-EG", { timeZone: TIMEZONE });
    }

    const notification = new Notification({
      recipient: recipientId,
      recipientModel: "Student",
      type: "daily_marks",
      title: "تحديث علامة",
      message: `تم تعديل علامتك بتاريخ ${dateStr}: حفظ ${mark.memorizationMark || '-'}، مراجعة ${mark.reviewMark || '-'}`,
      data: {
        markId: mark._id,
        sectionId: mark.sectionId._id || mark.sectionId,
        action: "mark_updated",
      },
    });

    await notification.save();

    if (io) {
      await sendRealTimeNotification(io, notification);
    }

    await sendPushNotification(recipientId, notification);
    
    console.log(`🔔 Sent mark updated notification to student ${recipientId}`);
  } catch (error) {
    console.error("❌ Error in notifyMarkUpdated:", error);
  }
};

exports.notifyMarkDeleted = async (mark, io) => {
  try {
    if (!mark || !mark.studentId) return;

    // Ensure we use the ID string, not the populated object
    const recipientId = mark.studentId._id ? mark.studentId._id.toString() : mark.studentId.toString();

    // Extract section details if available
    let dateStr = "";
    let sectionInfo = "";
    
    if (mark.sectionId && mark.sectionId.date) {
        dateStr = new Date(mark.sectionId.date).toLocaleDateString("ar-EG", { timeZone: TIMEZONE });
        sectionInfo = ` (مقطع: ${mark.sectionId.memorizationSection} / ${mark.sectionId.reviewSection})`;
    }

    const notification = new Notification({
      recipient: recipientId,
      recipientModel: "Student",
      type: "daily_marks",
      title: "حذف علامة",
      message: `تم حذف علامتك بتاريخ ${dateStr}${sectionInfo}`,
      data: {
        markId: mark._id,
        sectionId: mark.sectionId._id || mark.sectionId,
        action: "mark_deleted",
      },
    });

    await notification.save();

    if (io) {
      await sendRealTimeNotification(io, notification);
    }

    await sendPushNotification(recipientId, notification);
    
    console.log(`🔔 Sent mark deleted notification to student ${recipientId}`);
  } catch (error) {
    console.error("❌ Error in notifyMarkDeleted:", error);
  }
};

exports.notifyStudentMarks = async (studentId, marks, io) => {
  // Implementation if needed
};
