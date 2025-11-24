// ============================================================================
// sectionNotifications.js - Section Notifications System
// ============================================================================

const Notification = require("../../../schema/Notification");
const Student = require("../../../schema/Student");
const { sendPushNotification } = require("../../NotificationService/helpers/pushNotifications");

/**
 * إرسال إشعار عند إضافة مقطع جديد
 * @param {Object} section - المقطع المضاف
 * @param {Object} io - Socket.IO instance
 */
exports.notifySectionAdded = async (section, io) => {
  try {
    console.log("🔔 ========== SECTION NOTIFICATION START (ADD) ==========");
    console.log(`📝 Section: ${section.memorizationSection} / ${section.reviewSection}`);
    console.log(`👥 Group: ${section.group}`);

    // جلب جميع الطلاب في الحلقة
    const students = await Student.find({ group: section.group });
    
    if (!students || students.length === 0) {
      console.log("⚠️ No students found in group:", section.group);
      return;
    }

    console.log(`📤 Sending notifications to ${students.length} students`);

    const sectionDate = new Date(section.date).toLocaleDateString("ar-SA");
    const notifications = [];

    for (const student of students) {
      const notificationData = {
        recipient: student._id,
        recipientModel: "Student",
        type: "assignment",
        title: "📚 مقطع جديد",
        message: `تم إضافة مقطع جديد بتاريخ ${sectionDate}\nالحفظ: ${section.memorizationSection}\nالمراجعة: ${section.reviewSection}`,
        data: {
          sectionId: section._id,
          sectionDate,
          memorizationSection: section.memorizationSection,
          reviewSection: section.reviewSection,
          group: section.group,
          teacher: section.teacher,
        },
        priority: "high",
        isRead: false,
      };

      notifications.push(notificationData);
    }

    // حفظ جميع الإشعارات في قاعدة البيانات أولاً
    let savedNotifications = [];
    if (notifications.length > 0) {
      savedNotifications = await Notification.insertMany(notifications);
      console.log(`✅ Saved ${notifications.length} notifications to database`);
    }

    // إرسال عبر Socket.IO بعد الحفظ (مع _id من قاعدة البيانات)
    if (io && savedNotifications.length > 0) {
      students.forEach((student, index) => {
        const savedNotification = savedNotifications[index].toObject();
        io.to(student._id.toString()).emit("newNotification", {
          _id: savedNotification._id,
          id: savedNotification._id, // للتوافق
          recipient: savedNotification.recipient,
          type: savedNotification.type,
          title: savedNotification.title,
          message: savedNotification.message,
          data: savedNotification.data,
          priority: savedNotification.priority,
          isRead: savedNotification.isRead,
          createdAt: savedNotification.createdAt,
        });
        console.log(`📤 Socket sent to: ${student._id.toString()}`);
      });
    }

    // إرسال عبر Firebase Push Notification
    if (savedNotifications.length > 0) {
      for (let i = 0; i < students.length; i++) {
        try {
          await sendPushNotification(students[i]._id, savedNotifications[i]);
        } catch (pushErr) {
          console.error(`❌ Push error for ${students[i]._id}:`, pushErr.message);
        }
      }
    }

    console.log("🔔 ========== SECTION NOTIFICATION END (SUCCESS) ==========\n");
  } catch (error) {
    console.error("❌ Error in notifySectionAdded:", error);
  }
};

/**
 * إرسال إشعار عند تعديل مقطع
 * @param {Object} section - المقطع المعدل
 * @param {Object} oldSection - المقطع القديم
 * @param {Object} io - Socket.IO instance
 */
exports.notifySectionUpdated = async (section, oldSection, io) => {
  try {
    console.log("🔔 ========== SECTION NOTIFICATION START (UPDATE) ==========");
    console.log(`📝 Section ID: ${section._id}`);
    console.log(`👥 Group: ${section.group}`);
    console.log(`🔌 Socket.IO instance available:`, !!io);

    // جلب جميع الطلاب في الحلقة
    const students = await Student.find({ group: section.group });
    
    if (!students || students.length === 0) {
      console.log("⚠️ No students found in group:", section.group);
      return;
    }

    console.log(`📤 Sending notifications to ${students.length} students`);
    console.log(`📋 Students IDs:`, students.map(s => s._id.toString()).join(', '));

    const sectionDate = new Date(section.date).toLocaleDateString("ar-SA");
    const notifications = [];

    // تحديد التغييرات
    let changes = [];
    if (oldSection.memorizationSection !== section.memorizationSection) {
      changes.push(`الحفظ: ${section.memorizationSection}`);
    }
    if (oldSection.reviewSection !== section.reviewSection) {
      changes.push(`المراجعة: ${section.reviewSection}`);
    }

    const changesText = changes.length > 0 ? `\n${changes.join("\n")}` : "";

    for (const student of students) {
      const notificationData = {
        recipient: student._id,
        recipientModel: "Student",
        type: "assignment",
        title: "✏️ تم تعديل مقطع",
        message: `تم تعديل المقطع بتاريخ ${sectionDate}${changesText}`,
        data: {
          sectionId: section._id,
          sectionDate,
          memorizationSection: section.memorizationSection,
          reviewSection: section.reviewSection,
          group: section.group,
          teacher: section.teacher,
          oldMemorizationSection: oldSection.memorizationSection,
          oldReviewSection: oldSection.reviewSection,
        },
        priority: "medium",
        isRead: false,
      };

      notifications.push(notificationData);
    }

    // حفظ جميع الإشعارات في قاعدة البيانات أولاً
    let savedNotifications = [];
    if (notifications.length > 0) {
      savedNotifications = await Notification.insertMany(notifications);
      console.log(`✅ Saved ${notifications.length} notifications to database`);
    }

    // إرسال عبر Socket.IO بعد الحفظ (مع _id من قاعدة البيانات)
    if (io && savedNotifications.length > 0) {
      console.log(`📡 Starting Socket.IO emission...`);
      students.forEach((student, index) => {
        const savedNotification = savedNotifications[index].toObject();
        const studentRoom = student._id.toString();
        
        const payload = {
          _id: savedNotification._id,
          id: savedNotification._id, // للتوافق
          recipient: savedNotification.recipient,
          type: savedNotification.type,
          title: savedNotification.title,
          message: savedNotification.message,
          data: savedNotification.data,
          priority: savedNotification.priority,
          isRead: savedNotification.isRead,
          createdAt: savedNotification.createdAt,
        };
        
        console.log(`📤 Emitting to room [${studentRoom}]: "${payload.title}"`);
        io.to(studentRoom).emit("newNotification", payload);
      });
      console.log(`✅ Finished Socket.IO emission for ${students.length} students`);
    } else if (!io) {
      console.error(`❌ Socket.IO instance is NULL! Cannot send notifications!`);
    } else if (savedNotifications.length === 0) {
      console.warn(`⚠️ No saved notifications to send via Socket.IO`);
    }

    // إرسال عبر Firebase Push Notification
    if (savedNotifications.length > 0) {
      console.log(`📱 Sending Firebase Push notifications...`);
      for (let i = 0; i < students.length; i++) {
        try {
          await sendPushNotification(students[i]._id, savedNotifications[i]);
        } catch (pushErr) {
          console.error(`❌ Error sending push to student ${students[i]._id}:`, pushErr.message);
        }
      }
      console.log(`✅ Firebase Push notifications sent`);
    }

    console.log("🔔 ========== SECTION NOTIFICATION END (SUCCESS) ==========\n");
  } catch (error) {
    console.error("❌ Error in notifySectionUpdated:", error);
  }
};

/**
 * إرسال إشعار عند حذف مقطع
 * @param {Object} section - المقطع المحذوف
 * @param {Object} io - Socket.IO instance
 */
exports.notifySectionDeleted = async (section, io) => {
  try {
    console.log("🔔 ========== SECTION NOTIFICATION START (DELETE) ==========");
    console.log(`📝 Section: ${section.memorizationSection} / ${section.reviewSection}`);
    console.log(`👥 Group: ${section.group}`);

    // جلب جميع الطلاب في الحلقة
    const students = await Student.find({ group: section.group });
    
    if (!students || students.length === 0) {
      console.log("⚠️ No students found in group:", section.group);
      return;
    }

    console.log(`📤 Sending notifications to ${students.length} students`);

    const sectionDate = new Date(section.date).toLocaleDateString("ar-SA");
    const notifications = [];

    for (const student of students) {
      const notificationData = {
        recipient: student._id,
        recipientModel: "Student",
        type: "assignment",
        title: "🗑️ تم حذف مقطع",
        message: `تم حذف المقطع بتاريخ ${sectionDate}\nالحفظ: ${section.memorizationSection}\nالمراجعة: ${section.reviewSection}`,
        data: {
          sectionId: section._id,
          sectionDate,
          memorizationSection: section.memorizationSection,
          reviewSection: section.reviewSection,
          group: section.group,
          deletedAt: new Date().toISOString(),
        },
        priority: "medium",
        isRead: false,
      };

      notifications.push(notificationData);
    }

    // حفظ جميع الإشعارات في قاعدة البيانات أولاً
    let savedNotifications = [];
    if (notifications.length > 0) {
      savedNotifications = await Notification.insertMany(notifications);
      console.log(`✅ Saved ${notifications.length} notifications to database`);
    }

    // إرسال عبر Socket.IO بعد الحفظ (مع _id من قاعدة البيانات)
    if (io && savedNotifications.length > 0) {
      students.forEach((student, index) => {
        const savedNotification = savedNotifications[index].toObject();
        io.to(student._id.toString()).emit("newNotification", {
          _id: savedNotification._id,
          id: savedNotification._id, // للتوافق
          recipient: savedNotification.recipient,
          type: savedNotification.type,
          title: savedNotification.title,
          message: savedNotification.message,
          data: savedNotification.data,
          priority: savedNotification.priority,
          isRead: savedNotification.isRead,
          createdAt: savedNotification.createdAt,
        });
        console.log(`📤 Socket sent to: ${student._id.toString()}`);
      });
    }

    // إرسال عبر Firebase Push Notification
    if (savedNotifications.length > 0) {
      for (let i = 0; i < students.length; i++) {
        try {
          await sendPushNotification(students[i]._id, savedNotifications[i]);
        } catch (pushErr) {
          console.error(`❌ Error sending push to student ${students[i]._id}:`, pushErr.message);
        }
      }
    }

    console.log("🔔 ========== SECTION NOTIFICATION END (SUCCESS) ==========\n");
  } catch (error) {
    console.error("❌ Error in notifySectionDeleted:", error);
  }
};

/**
 * إرسال إشعار لطالب محدد عن مقطع
 * @param {String} studentId - معرف الطالب
 * @param {Object} section - المقطع
 * @param {String} type - نوع الإشعار (add, update, delete)
 * @param {Object} io - Socket.IO instance
 */
exports.notifyStudentAboutSection = async (studentId, section, type, io) => {
  try {
    console.log(`🔔 Sending ${type} notification to student ${studentId}`);

    const student = await Student.findById(studentId);
    if (!student) {
      console.log("⚠️ Student not found:", studentId);
      return;
    }

    const sectionDate = new Date(section.date).toLocaleDateString("ar-SA");
    
    let title, message, priority;
    
    switch(type) {
      case 'add':
        title = "📚 مقطع جديد";
        message = `تم إضافة مقطع جديد بتاريخ ${sectionDate}\nالحفظ: ${section.memorizationSection}\nالمراجعة: ${section.reviewSection}`;
        priority = "high";
        break;
      case 'update':
        title = "✏️ تم تعديل مقطع";
        message = `تم تعديل المقطع بتاريخ ${sectionDate}\nالحفظ: ${section.memorizationSection}\nالمراجعة: ${section.reviewSection}`;
        priority = "medium";
        break;
      case 'delete':
        title = "🗑️ تم حذف مقطع";
        message = `تم حذف المقطع بتاريخ ${sectionDate}\nالحفظ: ${section.memorizationSection}\nالمراجعة: ${section.reviewSection}`;
        priority = "medium";
        break;
      default:
        return;
    }

    const notificationData = {
      recipient: student._id,
      recipientModel: "Student",
      type: "assignment",
      title,
      message,
      data: {
        sectionId: section._id,
        sectionDate,
        memorizationSection: section.memorizationSection,
        reviewSection: section.reviewSection,
        group: section.group,
        teacher: section.teacher,
      },
      priority,
      isRead: false,
    };

    // حفظ في قاعدة البيانات أولاً
    const savedNotification = await Notification.create(notificationData);

    // إرسال عبر Socket.IO بعد الحفظ (مع _id من قاعدة البيانات)
    if (io) {
      io.to(student._id.toString()).emit("newNotification", {
        _id: savedNotification._id,
        id: savedNotification._id, // للتوافق
        recipient: savedNotification.recipient,
        type: savedNotification.type,
        title: savedNotification.title,
        message: savedNotification.message,
        data: savedNotification.data,
        priority: savedNotification.priority,
        isRead: savedNotification.isRead,
        createdAt: savedNotification.createdAt,
      });
      console.log(`📤 Socket sent to: ${student._id.toString()}`);
    }

    // إرسال عبر Firebase Push Notification
    try {
      await sendPushNotification(student._id, savedNotification);
    } catch (pushErr) {
      console.error(`❌ Error sending push notification:`, pushErr.message);
    }

    console.log(`✅ Notification sent to student ${student._id}`);
  } catch (error) {
    console.error("❌ Error in notifyStudentAboutSection:", error);
  }
};
