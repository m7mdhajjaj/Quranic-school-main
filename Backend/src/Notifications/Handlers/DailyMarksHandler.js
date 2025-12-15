const Notification = require("../../schema/Notification");
const Student = require("../../schema/Student");
const Group = require("../../schema/Group");
const mongoose = require("mongoose");
const { sendRealTimeNotification } = require("../Core/SocketSender");
const { sendPushNotification } = require("../Core/PushSender");

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

    // 1. Try direct match (Name or ID)
    students = await Student.find({ group: groupIdentifier });

    // 2. If no students found and it looks like an ObjectId, try finding by Name
    if (students.length === 0 && mongoose.Types.ObjectId.isValid(groupIdentifier)) {
      const groupDoc = await Group.findById(groupIdentifier);
      if (groupDoc) {
        console.log(`🔄 Found group name '${groupDoc.name}' for ID ${groupIdentifier}, searching students...`);
        students = await Student.find({ group: groupDoc.name });
      }
    }

    // 3. If still no students and it looks like a Name, try finding by ID (unlikely but possible if schema changed)
    if (students.length === 0 && !mongoose.Types.ObjectId.isValid(groupIdentifier)) {
       const groupDoc = await Group.findOne({ name: groupIdentifier });
       if (groupDoc) {
          // Maybe some students have the ID stored?
          const studentsById = await Student.find({ group: groupDoc._id.toString() });
          students = [...students, ...studentsById];
       }
    }

    console.log(`🔔 Found ${students.length} students in group ${groupIdentifier}`);

    if (!students.length) return;

    const notifications = students.map((student) => ({
      recipient: student._id,
      recipientModel: "Student",
      type: "daily_marks", // or 'activity'
      title: "مقطع جديد",
      message: `تم إضافة مقطع جديد لحلقة ${section.group}: حفظ ${section.memorizationSection}، مراجعة ${section.reviewSection}`,
      data: {
        sectionId: section._id,
        action: "section_added",
        date: section.date,
      },
    }));

    // Process notifications
    for (const noteData of notifications) {
      const notification = new Notification(noteData);
      await notification.save();

      // Real-time
      if (io) {
        await sendRealTimeNotification(io, notification);
      }

      // Push
      await sendPushNotification(noteData.recipient, notification);
    }
    
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

    let students = [];
    const groupIdentifier = section.group;

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
       }
    }

    if (!students.length) return;

    const notifications = students.map((student) => ({
      recipient: student._id,
      recipientModel: "Student",
      type: "daily_marks",
      title: "تحديث مقطع",
      message: `تم تحديث مقطع بتاريخ ${new Date(section.date).toLocaleDateString("ar-EG")}: حفظ ${section.memorizationSection}، مراجعة ${section.reviewSection}`,
      data: {
        sectionId: section._id,
        action: "section_updated",
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
    
    console.log(`🔔 Sent section updated notifications to ${students.length} students`);
  } catch (error) {
    console.error("❌ Error in notifySectionUpdated:", error);
  }
};

exports.notifySectionDeleted = async (section, io) => {
  // Implementation if needed
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

    const notification = new Notification({
      recipient: recipientId,
      recipientModel: "Student",
      type: "daily_marks", // or 'grade'
      title: "علامة جديدة",
      message: `تم رصد علامة جديدة: حفظ ${mark.memorizationMark || '-'}، مراجعة ${mark.reviewMark || '-'}`,
      data: {
        markId: mark._id,
        sectionId: mark.sectionId,
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

    const notification = new Notification({
      recipient: recipientId,
      recipientModel: "Student",
      type: "daily_marks",
      title: "تحديث علامة",
      message: `تم تعديل علامتك: حفظ ${mark.memorizationMark || '-'}، مراجعة ${mark.reviewMark || '-'}`,
      data: {
        markId: mark._id,
        sectionId: mark.sectionId,
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
  // Implementation if needed
};

exports.notifyStudentMarks = async (studentId, marks, io) => {
  // Implementation if needed
};
