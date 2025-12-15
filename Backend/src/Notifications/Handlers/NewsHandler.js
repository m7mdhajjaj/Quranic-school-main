const Notification = require("../../schema/Notification");
const Student = require("../../schema/Student");
const Teacher = require("../../schema/Teacher");
const Group = require("../../schema/Group");
const { sendRealTimeNotification } = require("../Core/SocketSender");
const { sendPushNotification } = require("../Core/PushSender");

/**
 * Helper to get target recipients based on news visibility
 */
const getTargetRecipients = async (news) => {
  let recipients = [];
  
  if (news.visibility === 'general') {
    // General news: send to ALL students AND teachers
    const students = await Student.find({}).select('_id');
    const teachers = await Teacher.find({}).select('_id');
    
    recipients = [
      ...students.map(s => ({ id: s._id, model: 'Student' })),
      ...teachers.map(t => ({ id: t._id, model: 'Teacher' }))
    ];
    
    console.log(`📧 General news: Sending to ${students.length} students and ${teachers.length} teachers`);
  } else if (news.visibility === 'group') {
    // Group news: send only to teacher's students
    
    // If the author is a Teacher, find their students via Groups
    if (news.authorModel === 'Teacher') {
       // Find groups taught by this teacher
       const groups = await Group.find({ teacher: news.author }).select('name');
       const groupNames = groups.map(g => g.name);
       
       if (groupNames.length > 0) {
         const students = await Student.find({ group: { $in: groupNames } }).select('_id');
         recipients = students.map(s => ({ id: s._id, model: 'Student' }));
         console.log(`📧 Group news: Sending to ${students.length} students in groups: ${groupNames.join(', ')}`);
       } else {
         console.log(`⚠️ Teacher ${news.author} has no groups.`);
       }
    } else {
        console.log("⚠️ Group news posted by non-teacher, skipping automatic recipient resolution.");
    }
  }

  return recipients;
};

exports.notifyNewsCreated = async (news, io) => {
  try {
    console.log(`🔔 notifyNewsCreated called for news: ${news.title}`);
    
    let recipients = await getTargetRecipients(news);
    if (!recipients || recipients.length === 0) return;

    // Filter out the author from receiving the notification
    if (news.author) {
        const authorId = news.author._id ? news.author._id.toString() : news.author.toString();
        recipients = recipients.filter(r => r.id.toString() !== authorId);
    }

    const trimmedTitle = news.title.length > 50 
      ? news.title.substring(0, 50) + '...' 
      : news.title;

    const notifications = recipients.map((recipient) => ({
      recipient: recipient.id,
      recipientModel: recipient.model,
      type: "news",
      title: "📰 تم إضافة منشور جديد",
      message: `تم نشر خبر جديد: ${trimmedTitle}`,
      data: {
        newsId: news._id.toString(),
        newsTitle: trimmedTitle,
        relatedId: news._id,
        relatedModel: 'News',
        action: 'created',
      },
      isRead: false,
    }));

    // Process notifications
    // Using Promise.all for parallel processing
    await Promise.all(notifications.map(async (noteData) => {
      const notification = new Notification(noteData);
      await notification.save();

      // Real-time (Socket.IO)
      if (io) {
        await sendRealTimeNotification(io, notification);
      }

      // Push Notification (FCM)
      await sendPushNotification(noteData.recipient, notification);
    }));
    
    console.log(`🔔 Sent news created notifications to ${recipients.length} users`);
  } catch (error) {
    console.error("❌ Error in notifyNewsCreated:", error);
  }
};

exports.notifyNewsUpdated = async (news, io) => {
  try {
    console.log(`🔔 notifyNewsUpdated called for news: ${news.title}`);
    
    let recipients = await getTargetRecipients(news);
    if (!recipients || recipients.length === 0) return;

    // Filter out the author from receiving the notification
    if (news.author) {
        const authorId = news.author._id ? news.author._id.toString() : news.author.toString();
        recipients = recipients.filter(r => r.id.toString() !== authorId);
    }

    const trimmedTitle = news.title.length > 50 
      ? news.title.substring(0, 50) + '...' 
      : news.title;

    const notifications = recipients.map((recipient) => ({
      recipient: recipient.id,
      recipientModel: recipient.model,
      type: "news",
      title: "✏️ تم تعديل منشور",
      message: `تم تحديث المنشور: ${trimmedTitle}`,
      data: {
        newsId: news._id.toString(),
        newsTitle: trimmedTitle,
        relatedId: news._id,
        relatedModel: 'News',
        action: 'updated',
      },
      isRead: false,
    }));

    // Process notifications
    await Promise.all(notifications.map(async (noteData) => {
      const notification = new Notification(noteData);
      await notification.save();

      // Real-time (Socket.IO)
      if (io) {
        await sendRealTimeNotification(io, notification);
      }

      // Push Notification (FCM)
      await sendPushNotification(noteData.recipient, notification);
    }));
    
    console.log(`🔔 Sent news updated notifications to ${recipients.length} users`);
  } catch (error) {
    console.error("❌ Error in notifyNewsUpdated:", error);
  }
};

exports.notifyNewsDeleted = async (news, io) => {
  // Stub - usually we don't notify about deletion unless necessary
};

exports.notifyNewsPublished = async (news, io) => {
  // Same as created
  await exports.notifyNewsCreated(news, io);
};

exports.notifyNewsArchived = async (news, io) => {
  // Stub
};

exports.notifyBulkNewsCreated = async (newsList, io) => {
  // Stub
};

exports.notifyBulkNewsUpdated = async (newsList, io) => {
  // Stub
};

exports.notifyBulkNewsDeleted = async (ids, io) => {
  // Stub
};

exports.notifyViewsIncremented = async (news, io) => {
  // Stub
};
