// ============================================================================
// ExamHandler.js - Exam Schedule Notification Handler
// ============================================================================

const Notification = require("../../schema/Notfcation/Notification");
const Student = require("../../schema/Student");
const Group = require("../../schema/Group");
const mongoose = require("mongoose");
const { sendRealTimeNotification } = require("../Core/SocketSender");
const { sendPushNotification } = require("../Core/PushSender");
const { TIMEZONE } = require('../../config/timezone');

/**
 * إرسال إشعار لجميع طلاب الحلقة عند إنشاء امتحان جديد
 * @param {Object} exam - الامتحان الذي تم إنشاؤه
 * @param {Object} io - Socket.io instance
 */
exports.notifyExamCreated = async (exam, io) => {
  try {
    console.log(`🔔 notifyExamCreated called for exam: ${exam?.name} in group: ${exam?.group}`);
    
    if (!exam || !exam.group) {
      console.log("⚠️ No group specified for exam, skipping notification");
      return;
    }

    let students = [];
    const groupIdentifier = exam.group;
    let groupName = exam.group;

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

    console.log(`🔔 Found ${students.length} students in group ${groupIdentifier}`);

    if (!students.length) return;

    // تنسيق التاريخ
    const examDate = new Date(exam.date).toLocaleDateString("ar-EG", { 
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: TIMEZONE 
    });

    const notifications = students.map((student) => ({
      recipient: student._id,
      recipientModel: "Student",
      type: "exam_scheduled",
      category: "academic",
      title: "📝 امتحان جديد",
      message: `تم جدولة امتحان "${exam.name}" يوم ${examDate}`,
      messageSummary: `امتحان - ${exam.name}`,
      data: {
        examId: exam._id,
        examName: exam.name,
        action: "exam_created",
        entityType: "exam",
        date: exam.date,
        totalMarks: exam.totalMarks,
        group: exam.group
      },
    }));

    // Process notifications in parallel
    const notificationPromises = notifications.map(async (noteData) => {
      try {
        const notification = new Notification(noteData);
        await notification.save();

        const tasks = [];
        if (io) tasks.push(sendRealTimeNotification(io, notification));
        tasks.push(sendPushNotification(noteData.recipient, notification));
        
        await Promise.allSettled(tasks);
      } catch (err) {
        console.error(`Failed to send exam notification to ${noteData.recipient}:`, err);
      }
    });

    await Promise.all(notificationPromises);
    
    console.log(`✅ Sent exam created notifications to ${students.length} students`);
  } catch (error) {
    console.error("❌ Error in notifyExamCreated:", error);
  }
};

/**
 * إرسال إشعار للطالب عند إدخال علامته في الامتحان
 * @param {String} studentId - معرف الطالب
 * @param {Object} exam - الامتحان
 * @param {Number} mark - العلامة
 * @param {Object} io - Socket.io instance
 */
exports.notifyExamMarkAdded = async (studentId, exam, mark, io) => {
  try {
    console.log(`🔔 notifyExamMarkAdded called for student: ${studentId}, exam: ${exam?.name}`);
    
    if (!studentId || !exam) return;

    const student = await Student.findById(studentId).select("firstName lastName").lean();
    if (!student) {
      console.log(`⚠️ Student ${studentId} not found`);
      return;
    }

    const totalMarks = exam.totalMarks || 100;
    const percentage = Math.round((mark / totalMarks) * 100);
    const isPassing = mark >= (exam.passingMarks || totalMarks * 0.5);

    const noteData = {
      recipient: studentId,
      recipientModel: "Student",
      type: "mark_added",
      category: "academic",
      title: isPassing ? "📊 تم إدخال علامتك ✓" : "📊 تم إدخال علامتك",
      message: `حصلت على ${mark} من ${totalMarks} (${percentage}%) في امتحان "${exam.name}"`,
      messageSummary: `علامة ${mark}/${totalMarks} - ${exam.name}`,
      data: {
        examId: exam._id,
        examName: exam.name,
        action: "mark_added",
        entityType: "exam_mark",
        mark: mark,
        totalMarks: totalMarks,
        percentage: percentage,
        isPassing: isPassing,
        group: exam.group
      },
    };

    try {
      const notification = new Notification(noteData);
      await notification.save();

      const tasks = [];
      if (io) tasks.push(sendRealTimeNotification(io, notification));
      tasks.push(sendPushNotification(studentId, notification));
      
      await Promise.allSettled(tasks);
      
      console.log(`✅ Mark notification sent to student ${student.firstName}`);
    } catch (err) {
      console.error(`Failed to send mark notification to ${studentId}:`, err);
    }
  } catch (error) {
    console.error("❌ Error in notifyExamMarkAdded:", error);
  }
};

/**
 * إرسال إشعارات لعدة طلاب عند إدخال علاماتهم (bulk)
 * @param {Object} exam - الامتحان
 * @param {Array} marks - مصفوفة العلامات [{studentId, mark}]
 * @param {Object} io - Socket.io instance
 */
exports.notifyBulkExamMarks = async (exam, marks, io) => {
  try {
    console.log(`🔔 notifyBulkExamMarks called for ${marks?.length} students in exam: ${exam?.name}`);
    
    if (!exam || !marks || !marks.length) return;

    const totalMarks = exam.totalMarks || 100;

    const notificationPromises = marks.map(async ({ studentId, mark }) => {
      try {
        const student = await Student.findById(studentId).select("firstName lastName").lean();
        if (!student) return;

        const percentage = Math.round((mark / totalMarks) * 100);
        const isPassing = mark >= (exam.passingMarks || totalMarks * 0.5);

        const noteData = {
          recipient: studentId,
          recipientModel: "Student",
          type: "mark_added",
          category: "academic",
          title: isPassing ? "📊 تم إدخال علامتك ✓" : "📊 تم إدخال علامتك",
          message: `حصلت على ${mark} من ${totalMarks} (${percentage}%) في امتحان "${exam.name}"`,
          messageSummary: `علامة ${mark}/${totalMarks} - ${exam.name}`,
          data: {
            examId: exam._id,
            examName: exam.name,
            action: "mark_added",
            entityType: "exam_mark",
            mark: mark,
            totalMarks: totalMarks,
            percentage: percentage,
            isPassing: isPassing,
            group: exam.group
          },
        };

        const notification = new Notification(noteData);
        await notification.save();

        const tasks = [];
        if (io) tasks.push(sendRealTimeNotification(io, notification));
        tasks.push(sendPushNotification(studentId, notification));
        
        await Promise.allSettled(tasks);
      } catch (err) {
        console.error(`Failed to send bulk mark notification to ${studentId}:`, err);
      }
    });

    await Promise.all(notificationPromises);
    
    console.log(`✅ Sent bulk mark notifications to ${marks.length} students`);
  } catch (error) {
    console.error("❌ Error in notifyBulkExamMarks:", error);
  }
};

/**
 * إرسال إشعار عند تحديث موعد الامتحان
 */
exports.notifyExamUpdated = async (exam, io) => {
  try {
    console.log(`🔔 notifyExamUpdated called for exam: ${exam?.name}`);
    
    if (!exam || !exam.group) return;

    const students = await Student.find({ group: exam.group });
    if (!students.length) return;

    const examDate = new Date(exam.date).toLocaleDateString("ar-EG", { 
      weekday: "long",
      month: "long",
      day: "numeric",
      timeZone: TIMEZONE 
    });

    const notifications = students.map((student) => ({
      recipient: student._id,
      recipientModel: "Student",
      type: "exam_updated",
      category: "academic",
      title: "📝 تحديث موعد امتحان",
      message: `تم تحديث امتحان "${exam.name}" - الموعد الجديد: ${examDate}`,
      messageSummary: `تحديث - ${exam.name}`,
      data: {
        examId: exam._id,
        examName: exam.name,
        action: "exam_updated",
        entityType: "exam",
        date: exam.date,
        group: exam.group
      },
    }));

    const notificationPromises = notifications.map(async (noteData) => {
      try {
        const notification = new Notification(noteData);
        await notification.save();

        const tasks = [];
        if (io) tasks.push(sendRealTimeNotification(io, notification));
        tasks.push(sendPushNotification(noteData.recipient, notification));
        
        await Promise.allSettled(tasks);
      } catch (err) {
        console.error(`Failed to send exam update notification to ${noteData.recipient}:`, err);
      }
    });

    await Promise.all(notificationPromises);
    
    console.log(`✅ Sent exam updated notifications to ${students.length} students`);
  } catch (error) {
    console.error("❌ Error in notifyExamUpdated:", error);
  }
};

/**
 * إرسال إشعار عند حذف امتحان
 */
exports.notifyExamDeleted = async (exam, io) => {
  try {
    console.log(`🔔 notifyExamDeleted called for exam: ${exam?.name}`);
    
    if (!exam || !exam.group) return;

    const students = await Student.find({ group: exam.group });
    if (!students.length) return;

    const notifications = students.map((student) => ({
      recipient: student._id,
      recipientModel: "Student",
      type: "exam_deleted",
      category: "academic",
      title: "🗑️ إلغاء امتحان",
      message: `تم إلغاء امتحان "${exam.name}"`,
      messageSummary: `إلغاء - ${exam.name}`,
      data: {
        examId: exam._id,
        examName: exam.name,
        action: "exam_deleted",
        entityType: "exam",
        group: exam.group
      },
    }));

    const notificationPromises = notifications.map(async (noteData) => {
      try {
        const notification = new Notification(noteData);
        await notification.save();

        const tasks = [];
        if (io) tasks.push(sendRealTimeNotification(io, notification));
        tasks.push(sendPushNotification(noteData.recipient, notification));
        
        await Promise.allSettled(tasks);
      } catch (err) {
        console.error(`Failed to send exam delete notification to ${noteData.recipient}:`, err);
      }
    });

    await Promise.all(notificationPromises);
    
    console.log(`✅ Sent exam deleted notifications to ${students.length} students`);
  } catch (error) {
    console.error("❌ Error in notifyExamDeleted:", error);
  }
};
