const Notification = require("../../schema/Notification");
const Student = require("../../schema/Student");
const Teacher = require("../../schema/Teacher");
const Group = require("../../schema/Group");
const { sendRealTimeNotification } = require("../Core/SocketSender");
const { sendPushNotification } = require("../Core/PushSender");

// ----------------------------------------------------------------------------
// Helpers (teacher-name based student targeting; ignores groups completely)
// ----------------------------------------------------------------------------
const normalizeName = (value) => (value || "").toString().trim().replace(/\s+/g, " ");
const escapeRegex = (value) =>
  (value || "").toString().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const uniqueById = (items) => {
  const seen = new Set();
  return items.filter((x) => {
    const key = x?.id?.toString();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

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
    
    // If the author is a Teacher, get ALL of their students:
    // - Primary: via groups owned by that teacher (Group.teacher -> group names -> Student.group)
    // - Fallback: by matching Student.teacher full-name (case/whitespace-insensitive)
    // This ignores "الحلقات" as a restriction; it uses them only as a reliable linkage source.
    if (news.authorModel === 'Teacher') {
       try {
         const teacher = await Teacher.findById(news.author);
         if (teacher) {
             const teacherName = normalizeName(`${teacher.firstName} ${teacher.lastName}`);
             const teacherNameRegex = `^${escapeRegex(teacherName).replace(/\s+/g, "\\s+")}$`;

             // 1) Via groups
             const groups = await Group.find({ teacher: teacher._id }).select("name").lean();
             const groupNames = groups.map((g) => g.name).filter(Boolean);

             const studentsViaGroups = groupNames.length
               ? await Student.find({ group: { $in: groupNames } }).select("_id").lean()
               : [];

             // 2) Fallback via Student.teacher string (helps if group field isn't set)
             const studentsViaTeacherName = await Student.find({
               teacher: { $regex: teacherNameRegex, $options: "i" },
             }).select("_id").lean();

             const merged = uniqueById([
               ...studentsViaGroups.map((s) => ({ id: s._id, model: "Student" })),
               ...studentsViaTeacherName.map((s) => ({ id: s._id, model: "Student" })),
             ]);
             
             recipients = merged;
             console.log(
               `📧 Group news: Sending to ${recipients.length} students of teacher "${teacherName}" (groups: ${groupNames.length})`
             );
         } else {
             console.log(`⚠️ Teacher not found for ID: ${news.author}`);
         }
       } catch (err) {
           console.error("❌ Error resolving teacher for group news:", err);
       }
    } else {
        console.log(`⚠️ Group news posted by non-teacher (authorModel=${news.authorModel}), skipping recipient resolution.`);
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
      category: "general",
      title: "منشور جديد",
      message: trimmedTitle,
      messageSummary: trimmedTitle,
      data: {
        newsId: news._id.toString(),
        newsTitle: trimmedTitle,
        relatedId: news._id,
        relatedModel: 'News',
        action: 'news_created',
        entityType: 'news',
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
      category: "general",
      title: "تحديث منشور",
      message: trimmedTitle,
      messageSummary: trimmedTitle,
      data: {
        newsId: news._id.toString(),
        newsTitle: trimmedTitle,
        relatedId: news._id,
        relatedModel: 'News',
        action: 'news_updated',
        entityType: 'news',
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
