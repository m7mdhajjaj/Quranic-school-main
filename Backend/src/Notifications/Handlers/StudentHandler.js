const Notification = require("../../schema/Notification");
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
    const teacherId = await getTeacherIdByGroupName(groupName);
    
    if (!teacherId) {
      console.warn(`⚠️ Could not find teacher for group: ${groupName}`);
      return;
    }

    const message = adminName 
      ? `قام ${adminName} بإضافة الطالب ${student.firstName} ${student.lastName} إلى حلقتك (${groupName})`
      : `تم إضافة الطالب ${student.firstName} ${student.lastName} إلى حلقتك (${groupName})`;

    const notificationData = {
      recipient: teacherId,
      recipientModel: "Teacher",
      type: "general",
      title: "إضافة طالب جديد",
      message: message,
      data: {
        action: "student_added",
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

    const message = adminName 
      ? `قام ${adminName} بإزالة الطالب ${student.firstName} ${student.lastName} من حلقتك (${groupName})`
      : `تم حذف الطالب ${student.firstName} ${student.lastName} من حلقتك (${groupName})`;

    const notificationData = {
      recipient: teacherId,
      recipientModel: "Teacher",
      type: "general",
      title: "حذف طالب من الحلقة",
      message: message,
      data: {
        action: "student_removed",
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
      const message = adminName 
        ? `قام ${adminName} بنقل الطالب ${student.firstName} ${student.lastName} من حلقتك (${oldGroupName}) إلى حلقة (${newGroupName})`
        : `تم نقل الطالب ${student.firstName} ${student.lastName} من حلقتك (${oldGroupName}) إلى حلقة (${newGroupName})`;

      const notificationData = {
        recipient: oldTeacherId,
        recipientModel: "Teacher",
        type: "general",
        title: "نقل طالب من الحلقة",
        message: message,
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
      const message = adminName 
        ? `قام ${adminName} بنقل الطالب ${student.firstName} ${student.lastName} إلى حلقتك (${newGroupName}) من حلقة (${oldGroupName})`
        : `تم نقل الطالب ${student.firstName} ${student.lastName} إلى حلقتك (${newGroupName}) قادماً من (${oldGroupName})`;

      const notificationData = {
        recipient: newTeacherId,
        recipientModel: "Teacher",
        type: "general",
        title: "نقل طالب إلى الحلقة",
        message: message,
        data: {
          action: "student_moved_in",
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
