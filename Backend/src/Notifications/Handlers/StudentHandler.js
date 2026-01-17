const Notification = require("../../schema/Notfcation/Notification");
const Student = require("../../schema/Student");
const Group = require("../../schema/Group");
const { sendRealTimeNotification } = require("../Core/SocketSender");
const { sendPushNotification } = require("../Core/PushSender");

// Helper to find teacher by group name
async function getTeacherIdByGroupName(groupName) {
  if (!groupName || groupName === "غير محدد") return null;
  const group = await Group.findOne({ name: groupName });
  return group ? group.teacher : null;
}

exports.notifyStudentAddedToGroup = async (student, groupName, io, adminName = null) => {
  try {
    console.log(`🔔 notifyStudentAddedToGroup called: ${student.firstName} to ${groupName}`);
    
    // إرسال الإشعار فقط إذا كان من قبل الأدمن أو السكرتير
    if (!adminName) {
      console.log(`⏭️ Skipping teacher notification - not added by admin/secretary`);
      return;
    }
    
    const teacherId = await getTeacherIdByGroupName(groupName);
    
    if (!teacherId) {
      console.warn(`⚠️ Could not find teacher for group: ${groupName}`);
      return;
    }

    const message = `طالب جديد: ${student.firstName} ${student.lastName}`;

    const notificationData = {
      recipient: teacherId,
      recipientModel: "Teacher",
      type: "student_update",
      category: "academic",
      title: "طالب جديد",
      message: message,
      messageSummary: `${student.firstName} ${student.lastName}`,
      data: {
        action: "student_added",
        entityType: "student",
        studentId: student._id,
        studentName: `${student.firstName} ${student.lastName}`,
        groupName: groupName,
        adminName: adminName
      }
    };

    const notification = new Notification(notificationData);
    const savedNotification = await notification.save();

    if (io) {
      await sendRealTimeNotification(io, savedNotification);
      console.log(`📡 Real-time notification sent to teacher ${teacherId}`);
    } else {
      console.warn("⚠️ IO object is missing in notifyStudentAddedToGroup");
    }
    
    await sendPushNotification(teacherId, savedNotification);
    
    console.log(`✅ Notified teacher ${teacherId} about student addition`);
  } catch (error) {
    console.error("❌ Error in notifyStudentAddedToGroup:", error);
  }
};

exports.notifyStudentRemovedFromGroup = async (student, groupName, io, adminName = null) => {
  try {
    console.log(`🔔 notifyStudentRemovedFromGroup called: ${student.firstName} from ${groupName}`);
    const teacherId = await getTeacherIdByGroupName(groupName);
    
    if (!teacherId) {
      console.warn(`⚠️ Could not find teacher for group: ${groupName}`);
      return;
    }

    const message = `تم حذف: ${student.firstName} ${student.lastName}`;

    const notificationData = {
      recipient: teacherId,
      recipientModel: "Teacher",
      type: "student_update",
      category: "academic",
      title: "حذف طالب",
      message: message,
      messageSummary: `${student.firstName} ${student.lastName}`,
      data: {
        action: "student_removed",
        entityType: "student",
        studentId: student._id,
        studentName: `${student.firstName} ${student.lastName}`,
        groupName: groupName,
        adminName: adminName
      }
    };

    const notification = new Notification(notificationData);
    const savedNotification = await notification.save();

    if (io) {
      await sendRealTimeNotification(io, savedNotification);
      console.log(`📡 Real-time notification sent to teacher ${teacherId}`);
    } else {
      console.warn("⚠️ IO object is missing in notifyStudentRemovedFromGroup");
    }

    await sendPushNotification(teacherId, savedNotification);

    console.log(`✅ Notified teacher ${teacherId} about student removal`);
  } catch (error) {
    console.error("❌ Error in notifyStudentRemovedFromGroup:", error);
  }
};

exports.notifyStudentMovedGroup = async (student, oldGroupName, newGroupName, io, adminName = null) => {
  try {
    // Notify Old Teacher
    const oldTeacherId = await getTeacherIdByGroupName(oldGroupName);
    if (oldTeacherId) {
      const message = `نقل: ${student.firstName} ${student.lastName} إلى ${newGroupName}`;

      const notificationData = {
        recipient: oldTeacherId,
        recipientModel: "Teacher",
        type: "student_update",
        category: "academic",
        title: "نقل طالب",
        message: message,
        messageSummary: `${student.firstName} ${student.lastName}`,
        data: {
          action: "student_moved_out",
          studentId: student._id,
          studentName: `${student.firstName} ${student.lastName}`,
          oldGroup: oldGroupName,
          newGroup: newGroupName,
          adminName: adminName
        }
      };
      const notification = new Notification(notificationData);
      const savedNotification = await notification.save();
      if (io) await sendRealTimeNotification(io, savedNotification);
      await sendPushNotification(oldTeacherId, savedNotification);
    }

    // Notify New Teacher
    const newTeacherId = await getTeacherIdByGroupName(newGroupName);
    if (newTeacherId) {
      const message = `طالب جديد: ${student.firstName} ${student.lastName}`;

      const notificationData = {
        recipient: newTeacherId,
        recipientModel: "Teacher",
        type: "student_update",
        category: "academic",
        title: "طالب جديد",
        message: message,
        messageSummary: `${student.firstName} ${student.lastName}`,
        data: {
          action: "student_moved_in",
          entityType: "student",
          studentId: student._id,
          studentName: `${student.firstName} ${student.lastName}`,
          oldGroup: oldGroupName,
          newGroup: newGroupName,
          adminName: adminName
        }
      };
      const notification = new Notification(notificationData);
      const savedNotification = await notification.save();
      if (io) await sendRealTimeNotification(io, savedNotification);
      await sendPushNotification(newTeacherId, savedNotification);
    }
    
    console.log(`🔔 Notified teachers about student move`);
  } catch (error) {
    console.error("❌ Error in notifyStudentMovedGroup:", error);
  }
};
