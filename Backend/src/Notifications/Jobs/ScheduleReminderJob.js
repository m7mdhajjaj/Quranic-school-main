const cron = require("node-cron");
const mongoose = require("mongoose");
const Section = require("../../schema/DailyMark/Section");
const Teacher = require("../../schema/Teacher");
const Notification = require("../../schema/Notfcation/Notification");

/**
 * Schedule Reminder Job
 * Runs every 3 hours to remind teachers to set schedules for their sections.
 */
class ScheduleReminderJob {
  /**
   * @param {NotificationManager} notificationManager
   */
  constructor(notificationManager) {
    this.notificationManager = notificationManager;
  }

  /**
   * Setup the cron job
   */
  setupScheduleReminders() {
    // Run every 3 hours: minute=0, hour=*/3 (0,3,6,9,12,15,18,21)
    cron.schedule("0 */3 * * *", () => {
      console.log("🕒 Running Schedule Reminder Job...");
      this.checkAndNotifyUnscheduledSections();
    });
    
    console.log("✅ Schedule Reminder Job initialized (Every 3 Hours)");
  }

  /**
   * Logic to find unscheduled sections and notify teachers
   */
  async checkAndNotifyUnscheduledSections() {
    try {
      // Logic:
      // 1. Timetable is missing/null
      // 2. Section date is >= Today (Not expired)
      
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Start of today (00:00)

      const unscheduledSections = await Section.find({
        $and: [
          {
            $or: [
              { timetableId: { $exists: false } },
              { timetableId: null }
            ]
          },
          { date: { $gte: today } } 
        ]
      });

      if (unscheduledSections.length === 0) {
        return;
      }

      console.log(`Found ${unscheduledSections.length} unscheduled sections. Sending reminders...`);

      for (const section of unscheduledSections) {
        if (!section.teacher) continue;

        let recipientId = section.teacher;
        const teacherIdentifier = section.teacher.toString().trim();

        // 1. Check if it's a valid ObjectId (Direct Link)
        if (mongoose.Types.ObjectId.isValid(teacherIdentifier)) {
            recipientId = teacherIdentifier;
        } 
        // 2. Check if it's a Numeric ID (TeacherId)
        else if (!isNaN(teacherIdentifier)) {
             const teacherDoc = await Teacher.findOne({ teacherId: parseInt(teacherIdentifier) });
             if (teacherDoc) {
                 recipientId = teacherDoc._id;
                 console.log(`✅ Resolved numeric teacher ID '${teacherIdentifier}' to ObjectID: ${recipientId}`);
             } else {
                 console.warn(`⚠️ Skipped section ${section._id}: Numeric Teacher ID '${teacherIdentifier}' not found.`);
                 continue;
             }
        }
        // 3. Try to resolve by Name (Legacy/Fallback)
        else {
             const nameParts = teacherIdentifier.split(/\s+/);
             let teacherDoc = null;

             if (nameParts.length >= 1) {
                 const firstName = nameParts[0];
                 const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : "";
                 
                 // Try to find teacher with flexible matching
                 const query = {
                    firstName: new RegExp(firstName, 'i')
                 };
                 
                 if (lastName) {
                    query.lastName = new RegExp(lastName, 'i');
                 }

                 teacherDoc = await Teacher.findOne(query);

                 // If not found strictly, try simpler search for single names or broad match
                 if (!teacherDoc && nameParts.length === 1) {
                     teacherDoc = await Teacher.findOne({
                         $or: [
                             { firstName: new RegExp(firstName, 'i') },
                             { lastName: new RegExp(firstName, 'i') } // Search as last name too
                         ]
                     });
                 }
                 
                 if (teacherDoc) {
                     recipientId = teacherDoc._id;
                     console.log(`✅ Resolved teacher name '${teacherIdentifier}' to ID: ${recipientId}`);
                 } else {
                     console.warn(`⚠️ Skipped section ${section._id}: Could not resolve Name '${teacherIdentifier}' to a Teacher ID.`);
                     continue;
                 }
             } else {
                 console.warn(`⚠️ Skipped section ${section._id}: Teacher '${teacherIdentifier}' is not a valid ObjectId/ID and name parsing failed.`);
                 continue;
             }
        }

        // Check if a reminder was already sent explicitly for this section TODAY to avoid spam
        // We define "Today" as since the start of the current day (00:00)
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        const existingNotification = await Notification.findOne({
            recipient: recipientId,
            relatedId: section._id,
            type: "system",
            createdAt: { $gte: startOfToday }
        });

        if (existingNotification) {
            console.log(`ℹ️ Check skipped for section ${section._id}: Reminder already sent today.`);
            continue;
        }

        // Create notification
        try {
          await this.notificationManager.createNotification({
             recipient: recipientId,
             recipientModel: "Teacher",
             title: "تذكير: تحديد موعد للحلقة",
             message: "يرجى تحديد موعد لهذه الحلقة في الجدول.",
             type: "system", 
             link: "/daily-marks",
             relatedId: section._id,
             isRead: false,
             createdAt: new Date()
          });
        } catch (err) {
          console.error(`Failed to send reminder for section ${section._id}:`, err.message);
        }
      }

    } catch (error) {
       console.error("❌ Schedule Reminder Job Error:", error);
    }
  }
}

module.exports = ScheduleReminderJob;
